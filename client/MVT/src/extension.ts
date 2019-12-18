
import * as vscode from 'vscode';

export function activate( context: vscode.ExtensionContext ) {

	let doValueCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'mvt',
		{
			provideCompletionItems( document: vscode.TextDocument, position: vscode.Position ) {

				return [
					new vscode.CompletionItem( 'test', vscode.CompletionItemKind.Method )
				];

			}
		}
	);

	context.subscriptions.push(
		doValueCompletionProvider
	);

}

export function deactivate(): Thenable<void> | undefined {

	return;

}
