import { CharacterPair, Position, Range, TextEditor, TextEditorEdit, Uri, commands, env, languages, window, workspace } from 'vscode';
import patterns from './util/patterns';

const boundryAmount = 200;

const chooseFileNameCommand = commands.registerCommand( 'mivaIde.chooseFileName', async ( payload ) => {

	const returnValue = payload.returnValue;
	const fileNames = payload.fileNames?.filter((value, index, self) => self.indexOf( value ) === index);

	let fileName;
	if ( fileNames.length < 2 ) {
		fileName = fileNames[0];
	}
	else {

		fileName = await window.showQuickPick( fileNames, { placeHolder: 'Select the file path for the selected function.' } );

	}

	commands.executeCommand( 'mivaIde.insertFileName', fileName, returnValue );

});

const insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, fileName: string, returnValue: string ) => {

	const languageId = textEditor.document.languageId;
	const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
	const leftOffset = cursorPositionOffset - boundryAmount;
	const leftRange = new Range(
		textEditor.document.positionAt( leftOffset ),
		textEditor.selection.active
	);
	const left = textEditor.document.getText( leftRange ) || '';

	/**
	 * Helper method for inserting file name
	 */
	function replaceEdit(start: number, end: number, editText: string) {
		const startPosition = textEditor.document.positionAt( cursorPositionOffset - start );
		const endPosition = textEditor.document.positionAt( cursorPositionOffset - start + end );

		edit.replace(
			new Range(startPosition, endPosition),
			editText
		)
	}

	// []. matching (left only) to inject fileName variable
	// check for bracket-dot syntax first - then tags
	if ( languageId === 'mv' ) {
		const startMatch = patterns.MV.LEFT_BRACKET_DOT.exec( left );

		if ( startMatch ) {
			const endMatch = patterns.MV.BRACKET_DOT_END.exec( left.slice( startMatch.index ) );

			replaceEdit( startMatch[0].length, endMatch?.[0]?.length || 0, ` ${ fileName } `, );

			return;
		}
	}

	// file="" Matching (left and right) to inject fileName variable

	const leftFileAttributeStartMatch = languageId === 'mv'
		? patterns.MV.LEFT_FILE_ATTR.exec( left )
		: patterns.MVT.LEFT_FILE_ATTR.exec( left );

	// check & execute the insertion
	if ( leftFileAttributeStartMatch ) {
		const endMatch = languageId === 'mv'
			? patterns.MV.FILE_ATTR_END.exec( left.slice( leftFileAttributeStartMatch.index ) )
			: patterns.MVT.ATTR_END.exec( left.slice( leftFileAttributeStartMatch.index ) );

		replaceEdit( leftFileAttributeStartMatch[0].length, endMatch?.[0]?.length || 0, fileName );
	}
	else {
		const rightOffset = cursorPositionOffset + boundryAmount;
		const rightRange = new Range(
			textEditor.selection.active,
			textEditor.document.positionAt( rightOffset )
		);
		const right = textEditor.document.getText( rightRange ) || '';

		const rightFileAttributeStartMatch = languageId === 'mv'
			? patterns.MV.RIGHT_FILE_ATTR.exec( right )
			: patterns.MVT.RIGHT_FILE_ATTR.exec( right );

		const endMatch = languageId === 'mv'
			? patterns.MV.FILE_ATTR_END.exec( right.slice( rightFileAttributeStartMatch.index ) )
			: patterns.MVT.ATTR_END.exec( right.slice( rightFileAttributeStartMatch.index ) );

		if ( rightFileAttributeStartMatch ) {
			replaceEdit( rightFileAttributeStartMatch[0].length, endMatch?.[0]?.length || 0, fileName );
		}
	}

	// name="" Matching (left and right) to inject returnValue variable

	const leftNameAttributeStartMatch = languageId === 'mv'
		? patterns.MV.LEFT_NAME_ATTR.exec( left )
		: patterns.MVT.LEFT_NAME_ATTR.exec( left );

	// check & execute the insertion
	if ( leftNameAttributeStartMatch ) {
		const endMatch = languageId === 'mv'
			? patterns.MV.NAME_ATTR_END.exec( left.slice( leftNameAttributeStartMatch.index ) )
			: patterns.MVT.ATTR_END.exec( left.slice( leftNameAttributeStartMatch.index ) );

		replaceEdit( leftNameAttributeStartMatch[0].length, endMatch?.[0]?.length || 0, returnValue );
	}
	else {
		const rightOffset = cursorPositionOffset + boundryAmount;
		const rightRange = new Range(
			textEditor.selection.active,
			textEditor.document.positionAt( rightOffset )
		);
		const right = textEditor.document.getText( rightRange ) || '';

		const rightNameAttributeMatch = languageId === 'mv'
			? patterns.MV.RIGHT_NAME_ATTR.exec( right )
			: patterns.MVT.RIGHT_NAME_ATTR.exec( right );

		const endMatch = languageId === 'mv'
			? patterns.MV.NAME_ATTR_END.exec( left.slice( leftNameAttributeStartMatch.index ) )
			: patterns.MVT.ATTR_END.exec( left.slice( leftNameAttributeStartMatch.index ) );

		if ( rightNameAttributeMatch ) {
			replaceEdit( rightNameAttributeMatch[0].length, endMatch?.[0]?.length || 0, returnValue );
		}
	}
});

function convertEntityToVariable( entity: string ) {

	const globalMatch = patterns.MVT.ENTITY_GLOBAL.exec( entity );
	const localMatch = patterns.MVT.ENTITY_LOCAL.exec( entity );

	if ( globalMatch ) {

		return `g.${ globalMatch[1] }`;

	}
	else if ( localMatch ) {

		return `l.settings:${ localMatch[1] }`;

	}

	window.showWarningMessage( 'Unable to convert entity to variable. No entity detected.' );

	return false;

}

function convertVariableToEntity( variable: string, uri?: Uri ) {

	const settings = workspace.getConfiguration( 'MVT', uri );

	const globalMatch = patterns.MVT.VARIABLE_GLOBAL.exec( variable );
	const localMatch = patterns.MVT.VARIABLE_LOCAL.exec( variable );

	if ( globalMatch ) {

		return `&mvt${ settings.defaultEncodingForVariableConversions }:global:${ globalMatch[1] };`;

	}
	else if ( localMatch ) {

		return `&mvt${ settings.defaultEncodingForVariableConversions }:${ localMatch[1] };`;

	}

	window.showWarningMessage( 'Unable to convert variable to entity. No variable detected.' );

	return false;

}

const convertAndCopyCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.convertAndCopy', ( textEditor: TextEditor ) => {

	// exit if not MVT
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvtcss' && textEditor.document.languageId !== 'mvtjs' ) {
		return;
	}

	let clipboardContents: string[] = [];

	textEditor.selections.forEach(( selection ) => {

		let text = textEditor.document.getText( new Range( selection.start, selection.end ) );

		let conversion = convertEntityToVariable( text ) || convertVariableToEntity( text, textEditor.document.uri );

		if ( conversion ) {

			clipboardContents.push( conversion );

		}

	});

	if ( clipboardContents.length > 0 ) {

		env.clipboard.writeText( clipboardContents.join( '\n' ) );

	}

});

const convertToEntityCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.convertToEntity', ( textEditor: TextEditor, edit: TextEditorEdit ) => {

	// exit if not MVT
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvtcss' && textEditor.document.languageId !== 'mvtjs' ) {
		return;
	}

	textEditor.selections.forEach(( selection ) => {

		let range = new Range( selection.start, selection.end );
		let text = textEditor.document.getText( range );

		let conversion = convertVariableToEntity( text, textEditor.document.uri );

		if ( conversion ) {

			edit.replace( range, conversion );

		}

	});

});

const convertToVariableCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.convertToVariable', ( textEditor: TextEditor, edit: TextEditorEdit ) => {

	// exit if not MVT
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvtcss' && textEditor.document.languageId !== 'mvtjs' ) {
		return;
	}

	textEditor.selections.forEach(( selection ) => {

		let range = new Range( selection.start, selection.end );
		let text = textEditor.document.getText( range );

		let conversion = convertEntityToVariable( text );

		if ( conversion ) {

			edit.replace( range, conversion );

		}

	});

});

const insertHtmlComment = commands.registerTextEditorCommand( 'mivaIde.toggleHtmlComment', ( textEditor: TextEditor ) => {

	const languageId = textEditor.document.languageId;

	if ( languageId === 'mvt' || languageId === 'mvtcss' || languageId === 'mvtjs' || languageId === 'mv' ) {

		const blockComment: CharacterPair = languageId === 'mvtcss' || languageId === 'mvtjs'
			?  [ '/*', '*/' ]
			:  [ '<!--', '-->' ];

		languages.setLanguageConfiguration( languageId, { comments: { blockComment: blockComment } } );

		commands.executeCommand( 'editor.action.blockComment' ).then(() => {

			languages.setLanguageConfiguration( languageId, { comments: { blockComment: ( languageId == 'mv' ) ? [ '<MvCOMMENT>', '</MvCOMMENT>' ] : [ '<mvt:comment>', '</mvt:comment>' ] } } );

		});

	}
	else {

		commands.executeCommand( 'editor.action.blockComment' );

	}

});

const calculatePosNumberCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.calculatePosNumber', ( textEditor: TextEditor, edit: TextEditorEdit ) => {

	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvtcss' && textEditor.document.languageId !== 'mvtjs' ) {
		return;
	}

	const left = textEditor.document.getText( new Range( new Position( 0, 0 ), textEditor.selection.active ) );

	const openMatches = left.match( patterns.MVT.FOREACH_TAG_OPEN );
	const closeMatches = left.match( patterns.MVT.FOREACH_TAG_CLOSE );

	if ( openMatches ) {

		let n = Math.max( openMatches.length - (( closeMatches ) ? closeMatches.length : 0), 0 );

		if ( n > 0 ) {

			edit.replace( new Range( textEditor.selection.start, textEditor.selection.end ), `l.pos${ n }` );

		}

	}

});

export default [
	chooseFileNameCommand,
	insertFileNameCommand,
	convertAndCopyCommand,
	convertToEntityCommand,
	convertToVariableCommand,
	insertHtmlComment,
	calculatePosNumberCommand
];