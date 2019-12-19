import patterns from '../../util/patterns';
import merchantFunctionFiles from './functions-merchant.json';
import {
	CompletionItem,
	SnippetString,
	CompletionItemKind,
	languages,
	TextDocument,
	Position,
	commands,
	TextEditor,
	TextEditorEdit,
	Range
} from 'vscode';

const valueCompletions = [];
const boundryAmount = 500;

function formatValueCompletion( fn: any, file: any ):CompletionItem {

	const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

		return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index == (arr.length - 1) ) ? ' ' : '' }`;

	}, '');
	
	return {
		label: fn.name,
		insertText: new SnippetString( `${ fn.name }(${ parameters })` ),
		kind: CompletionItemKind.Function,
		detail: file.distro_path,
		command: {
			title: `Inject "${ file.distro_path }" into file attribute.`, 
			command: 'mivaIde.mvt.insertFileName',
			arguments: [
				{
					fileName: file.distro_path
				}
			]
		}
	};

}

// parse data
merchantFunctionFiles.forEach(file => {

	file.functions.forEach(fn => {

		valueCompletions.push( formatValueCompletion( fn, file ) );

	});

});

let valueCompletionProvider = languages.registerCompletionItemProvider(
	'mvt',
	{
		provideCompletionItems( document: TextDocument, position: Position ) {

			// determine left side text range
			const cursorPositionOffset = document.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = new Range(
				document.positionAt( leftOffset ),
				position
			);
			const left = document.getText( leftRange ) || '';
			
			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = new Range(
				position,
				document.positionAt( rightOffset )
			);
			const right = document.getText( rightRange ) || '';
			
			// prevent showing completions if not in a mvt:do tag value attribute
			if (
				!patterns.LEFT_IN_MVTDO_TAG.test( left ) ||
				!patterns.RIGHT_IN_TAG.test( right ) ||
				!patterns.LEFT_IN_VALUE_ATTR.test( left )
			) {
				return [];
			}
			
			// return completions if pass all tests
			return valueCompletions;

		}
	}
);

let insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.mvt.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, payload ) => {

	const cursorPositionOffset = textEditor.document.offsetAt( textEditor.selection.active );
	const leftOffset = cursorPositionOffset - boundryAmount;
	const leftRange = new Range(
		textEditor.document.positionAt( leftOffset ),
		textEditor.selection.active
	);
	const left = textEditor.document.getText( leftRange ) || '';
	const leftMatch = patterns.MVTDO_LEFT_FILE_ATTR.exec( left );

	if ( leftMatch ) {
		
		edit.insert(
			textEditor.document.positionAt( cursorPositionOffset - leftMatch[0].length ),
			payload.fileName
		);

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

			edit.insert(
				textEditor.document.positionAt( cursorPositionOffset + rightMatch[0].length ),
				payload.fileName
			);

		}

	}

});

export {
	insertFileNameCommand,
	valueCompletionProvider
};