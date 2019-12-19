import patterns from '../../util/patterns';
import merchantFunctionFiles from './functions-merchant.json';
import * as vscode from 'vscode';

let valueCompletions = [];

function formatValueCompletion( fn: any, file: any ):vscode.CompletionItem {

	const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

		return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index == (arr.length - 1) ) ? ' ' : '' }`;

	}, '');
	
	return {
		label: fn.name,
		insertText: new vscode.SnippetString( `${ fn.name }(${ parameters })` ),
		kind: vscode.CompletionItemKind.Function,
		detail: file.distro_path
	};

}

// parse data
merchantFunctionFiles.forEach(file => {

	file.functions.forEach(fn => {

		valueCompletions.push( formatValueCompletion( fn, file ) );

	});

});

let valueCompletionProvider = vscode.languages.registerCompletionItemProvider(
	'mvt',
	{
		provideCompletionItems( document: vscode.TextDocument, position: vscode.Position ) {

			return valueCompletions.map(valueCompletion => {

				valueCompletion.command = {
					command: 'mivaIde.mvt.insertFileName',
					arguments: [
						{
							fileName: valueCompletion.detail,
							position,
							document
						}
					]
				};
				
				return valueCompletion;

			});

		}
	}
);

let insertFileNameCommand = vscode.commands.registerCommand( 'mivaIde.mvt.insertFileName', args => {

	console.log( args );

});

export {
	insertFileNameCommand,
	valueCompletionProvider
};