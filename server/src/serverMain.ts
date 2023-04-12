import {
	createConnection,
	IConnection,
	TextDocuments,
	ConfigurationParams,
	ConfigurationRequest,
	InitializeParams,
	InitializeResult,
	WorkspaceFolder,
	ServerCapabilities,
	TextDocumentSyncKind,
	DidChangeWorkspaceFoldersNotification,
	Diagnostic,
	DidChangeConfigurationNotification,
	SymbolInformation
} from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { formatError, pushAll, runSafeAsync, runSafe } from './util/functions';
import { Settings, Workspace, Languages } from './util/interfaces';
import { getMVTFeatures, getMVFeatures } from './mivaFeatures';
import _has from 'lodash.has';
import { TextDocument } from 'vscode-languageserver-textdocument';

// ================================================================================================================================ //

function getDocumentSettings( textDocument: TextDocument ): Thenable<Settings> {

	let promise = documentSettings[ textDocument.uri ];

	if ( !promise ) {

		const scopeUri = textDocument.uri;
		const configRequestParam: ConfigurationParams = { items: [ { scopeUri, section: 'LSK' }, { scopeUri, section: 'MVT' }, { scopeUri, section: 'MV' } ] };

		promise = connection.sendRequest( ConfigurationRequest.type, configRequestParam ).then( s => ( { LSK: s[0], MVT: s[1], MV: s[2] } ) );

		documentSettings[ textDocument.uri ] = promise;

	}

	return promise;

}

function cleanPendingValidation( textDocument: TextDocument ): void {
	const request = pendingValidationRequests[ textDocument.uri ];
	if ( request ) {
		clearTimeout( request );
		delete pendingValidationRequests[ textDocument.uri ];
	}
}

function triggerValidation( textDocument: TextDocument ): void {
	cleanPendingValidation( textDocument );
	pendingValidationRequests[ textDocument.uri ] = setTimeout(() => {
		delete pendingValidationRequests[ textDocument.uri ];
		validateTextDocument( textDocument );
	}, validationDelayMs);
}

async function validateTextDocument( textDocument: TextDocument ) {
	try {

		// const version = textDocument.version;
		const diagnostics: Diagnostic[] = [];
		const settings = await getDocumentSettings( textDocument );
		const latestTextDocument = documents.get( textDocument.uri );
		const features = languages[ textDocument.languageId ];

		if ( features && features.doValidation ) {

			pushAll( diagnostics, features.doValidation( textDocument, settings ) );

		}

		connection.sendDiagnostics( { uri: latestTextDocument.uri, diagnostics } );

	}
	catch( e ) {
		console.error( formatError( `Error while validating ${ textDocument.uri }`, e ) );
	}
}

// ================================================================================================================================ //

// Create a connection for the server
const connection: IConnection = createConnection();

process.on('unhandledRejection', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});
process.on('uncaughtException', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});

// Create a text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments( TextDocument );

// define workspace
let workspaceFolders: WorkspaceFolder[] = [];

let clientSnippetSupport = false;
let workspaceFoldersSupport = false;
let configurationSupport = false;

// define settings
let globalSettings: Settings = {};
let documentSettings: { [ key: string ]: Thenable<Settings> } = {};

const pendingValidationRequests: { [ uri: string ]: NodeJS.Timer } = {};
const validationDelayMs = 500;

let languages: Languages = {
	mvt: null,
	'mvt-css': null,
	'mvt-js': null,
	mv: null
};

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(( params: InitializeParams ): InitializeResult => {

	workspaceFolders = (<any>params).workspaceFolders;
	if ( !Array.isArray( workspaceFolders ) ) {
		workspaceFolders = [];
		if ( params.rootPath ) {
			workspaceFolders.push( { name: '', uri: URI.file( params.rootPath ).toString() } );
		}
	}

	const workspace: Workspace = {
		get settings() { return globalSettings },
		get folders() { return workspaceFolders }
	};

	languages.mvt = getMVTFeatures( workspace, params.capabilities );
	languages['mvt-css'] = getMVTFeatures( workspace, params.capabilities );
	languages['mvt-js'] = getMVTFeatures( workspace, params.capabilities );
	languages.mv = getMVFeatures( workspace, params.capabilities );

	function getClientCapability<T>( name: string, def: T ) {
		return _has( params.capabilities, name ) || def;
	}

	clientSnippetSupport = getClientCapability( 'textDocument.completion.completionItem.snippetSupport', false );
	workspaceFoldersSupport = getClientCapability( 'workspace.workspaceFolders', false );
	configurationSupport = getClientCapability( 'workspace.configuration', false );

	const capabilities: ServerCapabilities = {
		textDocumentSync: TextDocumentSyncKind.Full,
		completionProvider: clientSnippetSupport ? { resolveProvider: false, triggerCharacters: [ '.', ':', '<', '"', '=', '/', '&' ] } : undefined,
		definitionProvider: true,
		documentSymbolProvider: true,
		workspaceSymbolProvider: true
	};

	return { capabilities };

});

connection.onInitialized(() => {

	if ( configurationSupport ) {

		connection.client.register( DidChangeConfigurationNotification.type, undefined );

	}

	if ( workspaceFoldersSupport ) {

		connection.client.register( DidChangeWorkspaceFoldersNotification.type );

		connection.onNotification(
			DidChangeWorkspaceFoldersNotification.type,
			e => {

				const toAdd = e.event.added;
				const toRemove = e.event.removed;
				const updatedFolders = [];

				if ( workspaceFolders ) {
					for ( const folder of workspaceFolders ) {
						if ( !toRemove.some( r => r.uri === folder.uri ) && !toAdd.some( r => r.uri === folder.uri ) ) {
							updatedFolders.push( folder );
						}
					}
				}

				workspaceFolders = updatedFolders.concat( toAdd );
				documents.all().forEach( triggerValidation );

			}
		);

	}

});

// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(change  => {

	globalSettings = change.settings;

	documentSettings = {}; // reset all document settings

	documents.all().forEach( triggerValidation );

});

// Handle completion events
connection.onCompletion(async ( textDocumentPosition, token ) => {
	return runSafeAsync(async () => {

		const document = documents.get( textDocumentPosition.textDocument.uri );

		if ( !document ) {
			return null;
		}

		const settings = await getDocumentSettings( document );
		const features = languages[ document.languageId ];

		if ( features && features.doCompletion ) {

			return features.doCompletion( document, textDocumentPosition.position, settings );

		}

	}, null, `Error while computing completions for ${ textDocumentPosition.textDocument.uri }`, token );
});
/* connection.onCompletionResolve(( item: CompletionItem, token: CancellationToken ) => {
	return undefined;
}); */

connection.onDocumentSymbol(( documentSymbolParms, token ) => {
	return runSafe(() => {

		const document = documents.get( documentSymbolParms.textDocument.uri );
		const symbols: SymbolInformation[] = [];

		if ( document ) {

			const features = languages[ document.languageId ];

			if ( features && features.findDocumentSymbols ) {

				pushAll( symbols, features.findDocumentSymbols( document ) );

			}
		}

		return symbols;

	}, [], `Error while computing document symbols for ${ documentSymbolParms.textDocument.uri }`, token );
});

connection.onWorkspaceSymbol(( workspaceSymbolParams, token ) => {
	return runSafe(() => {

		return [];

	}, [], `Error while computing definitions for`, token );
});

connection.onDefinition(( definitionParams, token ) => {
	return runSafeAsync(async () => {

		const document = documents.get( definitionParams.textDocument.uri );

		if ( document ) {

			const settings = await getDocumentSettings( document );
			const features = languages[ document.languageId ];

			if ( features && features.findDefinition ) {

				return features.findDefinition( document, definitionParams.position, settings );

			}

		}

		return [];

	}, null, `Error while computing definitions for ${ definitionParams.textDocument.uri }`, token );
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {

	triggerValidation( change.document );

});

// a document has closed: clear all diagnostics
documents.onDidClose(event => {

	cleanPendingValidation( event.document );

	connection.sendDiagnostics( { uri: event.document.uri, diagnostics: [] } );

});

// remove document settings on close
documents.onDidClose(e => {
	delete documentSettings[ e.document.uri ];
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen( connection );

// Listen on the connection
connection.listen();