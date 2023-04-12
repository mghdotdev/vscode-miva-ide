import patterns from './util/patterns';
import { TextEditor, TextEditorEdit, Range, commands, env, window, workspace, Uri, languages, Position, CharacterPair } from 'vscode';

const boundryAmount = 200;

const chooseFileNameCommand = commands.registerCommand( 'mivaIde.chooseFileName', async ( payload ) => {

	let fileName;
	if ( payload.fileNames.length < 2 ) {
		fileName = payload.fileNames[0];
	}
	else {

		fileName = await window.showQuickPick( payload.fileNames, { placeHolder: 'Select the file path for the selected function.' } );

	}

	commands.executeCommand( 'mivaIde.insertFileName', fileName );

});

const insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, fileName ) => {

	const languageId = textEditor.document.languageId;
	const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
	const leftOffset = cursorPositionOffset - boundryAmount;
	const leftRange = new Range(
		textEditor.document.positionAt( leftOffset ),
		textEditor.selection.active
	);
	const left = textEditor.document.getText( leftRange ) || '';
	let leftMatch;

	// check for bracket-dot syntax first - then tags
	if ( languageId === 'mv' ) {

		leftMatch = patterns.MV.LEFT_BRACKET_DOT.exec( left );

		if ( leftMatch ) {

			insertEdit( leftMatch[0].length, ` ${ fileName } ` );

		}

	}

	leftMatch = patterns.SHARED.LEFT_FILE_ATTR.exec( left );

	// define helper method for inserting file name
	function insertEdit( matchLength: number, fileName: string ) {

		edit.insert(
			textEditor.document.positionAt( cursorPositionOffset - matchLength ),
			fileName
		);

	}

	// check & execute the insertion
	if ( leftMatch ) {

		insertEdit( leftMatch[0].length, fileName );

	}
	else {

		const rightOffset = cursorPositionOffset + boundryAmount;
		const rightRange = new Range(
			textEditor.selection.active,
			textEditor.document.positionAt( rightOffset )
		);
		const right = textEditor.document.getText( rightRange ) || '';
		const rightMatch = patterns.SHARED.RIGHT_FILE_ATTR.exec( right );

		if ( rightMatch ) {

			insertEdit( rightMatch[0].length, fileName );

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
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvt-css' && textEditor.document.languageId !== 'mvt-js' ) {
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
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvt-css' && textEditor.document.languageId !== 'mvt-js' ) {
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
	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvt-css' && textEditor.document.languageId !== 'mvt-js' ) {
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

	if ( languageId === 'mvt' || languageId === 'mvt-css' || languageId === 'mvt-js' || languageId === 'mv' ) {

		const blockComment: CharacterPair = languageId === 'mvt-css' || languageId === 'mvt-js'
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

	if ( textEditor.document.languageId !== 'mvt' && textEditor.document.languageId !== 'mvt-css' && textEditor.document.languageId !== 'mvt-js' ) {
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