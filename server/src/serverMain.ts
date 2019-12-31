import {
	createConnection,
	IConnection,
	TextDocuments,
	TextDocument,
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
	CompletionItem,
	CancellationToken
} from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { formatError, pushAll, runSafeAsync } from './util/functions';
import { Settings, Workspace, LanguageFeatures } from './util/interfaces';
import { getMVTFeatures, getMVFeatures } from './mivaFeatures';
import _has from 'lodash.has';

// ================================================================================================================================ //

function getDocumentSettings( textDocument: TextDocument ): Thenable<Settings> {

	let promise = documentSettings[ textDocument.uri ];

	if ( !promise ) {

		const scopeUri = textDocument.uri;
		const configRequestParam: ConfigurationParams = { items: [ { scopeUri, section: 'MVT' }, { scopeUri, section: 'MV' } ] };

		promise = connection.sendRequest( ConfigurationRequest.type, configRequestParam ).then( s => ( { MVT: s[0], MV: s[1] } ) );

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

		if ( textDocument.languageId === 'mvt' ) {

			if ( mvtLanguageFeatures.doValidation ) {

				pushAll( diagnostics, mvtLanguageFeatures.doValidation( textDocument, settings ) );

			}

			connection.sendDiagnostics( { uri: latestTextDocument.uri, diagnostics } );

		}

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
const documents: TextDocuments = new TextDocuments();

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

let mvtLanguageFeatures: LanguageFeatures;
let mvLanguageFeatures: LanguageFeatures;

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(( params: InitializeParams ): InitializeResult => {

	const initializationOptions = params.initializationOptions;

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

	mvtLanguageFeatures = getMVTFeatures( workspace, params.capabilities );
	mvLanguageFeatures = getMVFeatures( workspace, params.capabilities );

	function getClientCapability<T>( name: string, def: T ) {
		return _has( params.capabilities, name ) || def;
	}

	clientSnippetSupport = getClientCapability( 'textDocument.completion.completionItem.snippetSupport', false );
	workspaceFoldersSupport = getClientCapability( 'workspace.workspaceFolders', false );
	configurationSupport = getClientCapability( 'workspace.configuration', false );

	const capabilities: ServerCapabilities = {
		textDocumentSync: TextDocumentSyncKind.Full,
		completionProvider: clientSnippetSupport ? { resolveProvider: true, triggerCharacters: [ '.', ':', '<', '"', '=', '/', '&' ] } : undefined
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

		if ( document.languageId == 'mvt' ) {

			if ( mvtLanguageFeatures && mvtLanguageFeatures.doCompletion ) {

				return mvtLanguageFeatures.doCompletion( document, textDocumentPosition.position, settings );
	
			}

		}
		else if ( document.languageId == 'mv' ) {

			if ( mvLanguageFeatures && mvLanguageFeatures.doCompletion ) {

				return mvLanguageFeatures.doCompletion( document, textDocumentPosition.position, settings );

			}

		}

	}, null, `Error while computing completions for ${ textDocumentPosition.textDocument.uri }`, token );
});
connection.onCompletionResolve(( item: CompletionItem, token: CancellationToken ) => {
	return undefined;
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