import {
	ExtensionContext,
	StatusBarAlignment,
	StatusBarItem,
	window
} from 'vscode';
import {
	LanguageClient,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { getClientOptions, sharedActivate } from './main-shared';

// Define language client to be used during activate and deactivate callbacks
let client: LanguageClient;

// Define status mmt bar item
let mmtRemoteStatusBar: StatusBarItem;
let mmtBranchKeyStatusBar: StatusBarItem;

export function activate( context: ExtensionContext ) {
	// Path to server module
	const serverModule = context.asAbsolutePath( 'server/out/main.js' );

	// The debug options for the server
	const debugOptions = { execArgv: [ '--nolazy', '--inspect=6045' ] };

	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	const clientOptions = getClientOptions();

	// Create the language client and start the client.
	client = new LanguageClient( 'miva', 'Miva IDE Language Server', serverOptions, clientOptions );
	client.registerProposedFeatures();

	const mmtListener = client.onNotification('mmt/updateStatusBar', config => {
		if (config) {
			if (!mmtRemoteStatusBar) {
				mmtRemoteStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 51);
				context.subscriptions.push( mmtRemoteStatusBar );
			}

			if (!mmtBranchKeyStatusBar) {
				mmtBranchKeyStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 50);
				context.subscriptions.push( mmtBranchKeyStatusBar );
			}

			mmtRemoteStatusBar.text = `MMT - $(repo) Remote: ${config.remote_key}`;
			mmtRemoteStatusBar.tooltip = `MMT Information\n\nRemote: ${config.remote_key}\nBranch: ${config.branch_name}\nBranch Key: ${config.branch_key}`;
			mmtRemoteStatusBar.show();

			mmtBranchKeyStatusBar.text = `MMT - $(source-control) BranchKey: ${config.branch_key}`;
			mmtBranchKeyStatusBar.tooltip = 'Click to copy branch key.';
			mmtBranchKeyStatusBar.show();
		}
	});

	context.subscriptions.push( mmtListener );

	client.start();

	// Push client to subscriptions
	context.subscriptions.push( client );

	sharedActivate(context);
}

export function deactivate(): Thenable<void> | undefined {
	client?.stop();

	return;
}