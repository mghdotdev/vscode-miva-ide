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

let valueCompletions = [];

function formatValueCompletion( fn: any, file: any ):CompletionItem {

	const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

		return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index == (arr.length - 1) ) ? ' ' : '' }`;

	}, '');
	
	return {
		label: fn.name,
		insertText: new SnippetString( `${ fn.name }(${ parameters })` ),
		kind: CompletionItemKind.Function,
		detail: file.distro_path
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

			return valueCompletions.map(valueCompletion => {

				valueCompletion.command = {
					command: 'mivaIde.mvt.insertFileName',
					arguments: [
						{
							fileName: valueCompletion.detail
						}
					]
				};
				
				return valueCompletion;

			});

		}
	}
);

let insertFileNameCommand = commands.registerTextEditorCommand( 'mivaIde.mvt.insertFileName', ( textEditor: TextEditor, edit: TextEditorEdit, payload ) => {

	const left = textEditor.document.getText(
		new Range(
			textEditor.selection.active,
			new Position( textEditor.selection.active.line, 0 )
		)
	) || '';

	const match = patterns.MVTDO_TEXT_BEFORE_FILE_ATTR.exec( left ) || [];

	if ( match ) {

		let test = edit.insert(
			textEditor.selection.active.translate( 0, -match[2].length ),
			payload.fileName
		);

	}

});

export {
	insertFileNameCommand,
	valueCompletionProvider
};