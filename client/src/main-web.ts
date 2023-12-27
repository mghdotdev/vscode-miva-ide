import { ExtensionContext } from 'vscode';
import { sharedActivate } from './main-shared';

// Define language client to be used during activate and deactivate callbacks
// let client: LanguageClient;

export function activate (context: ExtensionContext) {
	// Path to server module
	// const serverMain = Uri.joinPath(context.extensionUri, 'server/out-web/main.js');

	// Create server worker
	// const worker = new Worker(serverMain.toString(true));

	// const clientOptions = getClientOptions();

	// Create the language client and start the client.
	// client = new LanguageClient('miva', 'Miva IDE', clientOptions, worker);
	// client.registerProposedFeatures();
	// client.start();

	// context.subscriptions.push( client );

	sharedActivate(context);
}

export function deactivate(): Thenable<void> | undefined {
	// client?.stop();

	return;
}