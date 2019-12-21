
import * as vscode from 'vscode';
import * as TagDo from './features/autocompletion/TagDo';

export function activate( context: vscode.ExtensionContext ) {

	context.subscriptions.push(
		TagDo.valueCompletionProvider,
		TagDo.insertFileNameCommand
	);

}

export function deactivate(): Thenable<void> | undefined {

	return;

}
