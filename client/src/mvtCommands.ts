import patterns from './util/patterns';
import { TextEditor, TextEditorEdit, Range, commands, env, window } from 'vscode';

const boundryAmount = 200;

const chooseFileNameCommand = commands.registerCommand( 'mivaIde.MVT.chooseFileName', async ( payload ) => {

	let fileName;
	if ( payload.fileNames.length < 2 ) {
		fileName = payload.fileNames[0];
	}
	else {

		fileName = await window.showQuickPick( payload.fileNames, { placeHolder: 'Select the file path for the selected function.' } );

	}

	commands.executeCommand( 'mivaIde.MVT.insertFileName', fileName );

});

const insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.MVT.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, fileName ) => {

	const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
	const leftOffset = cursorPositionOffset - boundryAmount;
	const leftRange = new Range(
		textEditor.document.positionAt( leftOffset ),
		textEditor.selection.active
	);
	const left = textEditor.document.getText( leftRange ) || '';
	const leftMatch = patterns.MVTDO_LEFT_FILE_ATTR.exec( left );

	function insertEdit( matchLength, fileName ) {

		edit.insert(
			textEditor.document.positionAt( cursorPositionOffset - matchLength ),
			fileName
		);

	}

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
		const rightMatch = patterns.MVTDO_RIGHT_FILE_ATTR.exec( right );

		if ( rightMatch ) {

			insertEdit( rightMatch[0].length, fileName );

		}

	}

});

/* function convertEntityToVariable( entity: string ) {

	const globalMatch = patterns.ENTITY_GLOBAL.exec( entity );
	const localMatch = patterns.ENTITY_LOCAL.exec( entity );

	if ( globalMatch ) {

		return `g.${ globalMatch[1] }`;

	}
	else if ( localMatch ) {

		return `l.settings:${ localMatch[1] }`;

	}

	return false;

}

function convertVariableToEntity( variable: string ) {

	const globalMatch = patterns.VARIABLE_GLOBAL.exec( variable );
	const localMatch = patterns.VARIABLE_LOCAL.exec( variable );

	if ( globalMatch ) {

		return `&mvt${ defaultEncoding }:global:${ globalMatch[1] };`;

	}
	else if ( localMatch ) {

		return `&mvt${ defaultEncoding }:${ localMatch[1] };`;

	}

	return false;

} */

function convertAndReplace( text: string ) {

	

}

const convertAndCopyCommand = commands.registerTextEditorCommand( 'mivaIde.mvt.convertAndCopy', ( textEditor: TextEditor, edit: TextEditorEdit, payload ) => {

	let clipboardContents = [];

	textEditor.selections.forEach(( selection ) => {

		let text = textEditor.document.getText( new Range( selection.start, selection.end ) );

		clipboardContents.push( convertAndReplace( text ) );

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