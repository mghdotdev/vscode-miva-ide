import patterns from './util/patterns';
import { TextEditor, TextEditorEdit, Range, commands, env, window, workspace, Uri } from 'vscode';

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

	// const languageId = textEditor.document.languageId;
	const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
	const leftOffset = cursorPositionOffset - boundryAmount;
	const leftRange = new Range(
		textEditor.document.positionAt( leftOffset ),
		textEditor.selection.active
	);
	const left = textEditor.document.getText( leftRange ) || '';
	const leftMatch = patterns.SHARED.LEFT_FILE_ATTR.exec( left );
	
	// define helper method for inserting file name
	function insertEdit( matchLength, fileName ) {

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

	return false;

}

const convertAndCopyCommand = commands.registerTextEditorCommand( 'mivaIde.mvt.convertAndCopy', ( textEditor: TextEditor, edit: TextEditorEdit, payload ) => {

	// exit if not MVT
	if ( textEditor.document.languageId !== 'mvt' ) {
		return;
	}

	let clipboardContents = [];

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

export default [
	chooseFileNameCommand,
	insertFileNameCommand,
	convertAndCopyCommand
];