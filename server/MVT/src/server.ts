import patterns from './patterns';
import MerchantFunctions from './MerchantFunctions';
import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	TextDocumentPositionParams,
	Position,
	Range
} from 'vscode-languageserver';


MerchantFunctions.init();

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection( ProposedFeatures.all );

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize(( params: InitializeParams ) => {

	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we will fall back using global settings
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	
});

connection.onInitialized(() => {

	if ( hasConfigurationCapability ) {
		// Register for all configuration changes.
		connection.client.register( DidChangeConfigurationNotification.type, undefined );
	}
	if ( hasWorkspaceFolderCapability ) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log( 'Workspace folder change event received.' );
		});
	}
	
});

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: Object = {};
let globalSettings: Object = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<Object>> = new Map();

connection.onDidChangeConfiguration(change => {

	if ( hasConfigurationCapability ) {
		// Reset all cached document settings
		documentSettings.clear();
	}
	else {
		globalSettings = <Object>(
			( change.settings.MVT || defaultSettings )
		);
	}

	// Revalidate all open text documents
	documents.all().forEach( checkForDeprecatedModules );

});

function getDocumentSettings(resource: string): Thenable<Object> {
	if ( !hasConfigurationCapability ) {
		return Promise.resolve( globalSettings );
	}
	let result = documentSettings.get( resource );
	if ( !result ) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'MVT'
		});
		documentSettings.set( resource, result );
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	
	documentSettings.delete( e.document.uri );

});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {

	checkForDeprecatedModules( change.document );

});

async function checkForDeprecatedModules( textDocument: TextDocument ): Promise<void> {

	// In this simple example we get the settings for every validate run.
	let settings = await getDocumentSettings( textDocument.uri );
	let moduleNames: String[] = [];

	if ( (<any>settings).showWarningOnToolkitUsage ) {
		moduleNames.push( 'toolkit' );
	}
	if ( (<any>settings).showWarningOnToolbeltUsage ) {
		moduleNames.push( 'toolbelt' );
	}
	
	// The validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let pattern = new RegExp( `${ moduleNames.join( '|' ) }`, 'g' );
	let m: RegExpExecArray | null;

	let problems = 0;
	let diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < 1000) {

		problems++;

		let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `Consider replacing "${ m[0] }" functionality with native Miva functionality.`,
			source: 'Miva IDE'
		};

		diagnostics.push(diagnostic);

	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

}

/* connection.onDidChangeWatchedFiles(_change => {

	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');

}); */

// This handler provides the initial list of the completion items.
connection.onCompletion(
	( textDocumentPosition: TextDocumentPositionParams ): CompletionItem[] => {

		let completions: CompletionItem[] = [];

		// START ==== MV DO STUFF

		const completionDocument: TextDocument = <TextDocument>documents.get( textDocumentPosition.textDocument.uri );

		const cursorPosition = Position.create( textDocumentPosition.position.line, textDocumentPosition.position.character );
		const cursorPositionOffset: number = <number>completionDocument.offsetAt( cursorPosition );

		const left = completionDocument.getText(
			Range.create(
				completionDocument.positionAt( cursorPositionOffset - 500 ),
				cursorPosition
			)
		);

		const right = completionDocument.getText(
			Range.create(
				cursorPosition,
				completionDocument.positionAt( cursorPositionOffset + 500 )
			)
		);

		/* console.log( 'left', left );
		console.log( '================================================================================================' );
		console.log( 'right', right ); */

		if ( patterns.LEFT_IN_MVTDO_TAG.test( left ) && patterns.RIGHT_IN_TAG.test( right ) ) {
			
			if ( patterns.LEFT_IN_VALUE_ATTR.test( left ) && patterns.RIGHT_IN_ATTR.test( right ) ) {
				
				completions = completions.concat( MerchantFunctions.getCompletions( 'value', cursorPosition ) );

			}
			else if ( patterns.LEFT_IN_FILE_ATTR.test( left ) && patterns.RIGHT_IN_ATTR.test( right ) ) {

				completions = completions.concat( MerchantFunctions.getCompletions( 'file', cursorPosition ) );

			}

		}

		// END ==== MV DO STUFF

		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return completions;

	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {

		return item;

	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen( connection );

// Listen on the connection
connection.listen();