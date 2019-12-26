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
	Diagnostic
} from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { formatError, pushAll } from './util/functions';
import { Settings, Workspace, LanguageFeatures } from './util/interfaces';
import { getMVTFeatures } from './mvtFeatures';

// ================================================================================================================================ //

function getDocumentSettings( textDocument: TextDocument ): Thenable<Settings> {

	let promise = documentSettings[ textDocument.uri ];

	if ( !promise ) {

		const scopeUri = textDocument.uri;
		const configRequestParam: ConfigurationParams = { items: [ { scopeUri, section: 'mvt' }, { scopeUri, section: 'css' }, { scopeUri, section: 'html' }, { scopeUri, section: 'javascript' } ] };

		promise = connection.sendRequest( ConfigurationRequest.type, configRequestParam ).then( s => ( { mvt: s[0], css: s[1], html: s[2], javascript: s[3] } ) );

		documentSettings[textDocument.uri] = promise;

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
		const version = textDocument.version;
		const diagnostics: Diagnostic[] = [];
		if ( textDocument.languageId === 'mvt' ) {

			const settings = await getDocumentSettings( textDocument );
		
			if ( languageFeatures.doValidation ) {

				languageFeatures.doValidation( textDocument, settings );

			}

		}
	}
	catch( e ) {
		console.error( formatError( `Error while validating ${ textDocument.uri }`, e ) );
	}
	/* try {
		const version = textDocument.version;
		const diagnostics: Diagnostic[] = [];
		if ( textDocument.languageId === 'mvt' ) {
			const modes = languageModes.getAllModesInDocument(textDocument);
			const settings = await getDocumentSettings(textDocument, () => modes.some(m => !!m.doValidation));
			const latestTextDocument = documents.get(textDocument.uri);
			if (latestTextDocument && latestTextDocument.version === version) { // check no new version has come in after in after the async op
				modes.forEach(mode => {
					if (mode.doValidation && isValidationEnabled(mode.getId(), settings)) {
						pushAll(diagnostics, mode.doValidation(latestTextDocument, settings));
					}
				});
				connection.sendDiagnostics({ uri: latestTextDocument.uri, diagnostics });
			}
		}
	} catch (e) {
		console.error( formatError( `Error while validating ${ textDocument.uri }`, e ) );
	} */
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
const documents = new TextDocuments();

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen( connection );

// define workspace
let workspaceFolders: WorkspaceFolder[] = [];

let clientSnippetSupport = false;
let workspaceFoldersSupport = false;

// define settings
let globalSettings: Settings = {};
let documentSettings: { [key: string]: Thenable<Settings> } = {};


// remove document settings on close
documents.onDidClose(e => {
	delete documentSettings[ e.document.uri ];
});

const pendingValidationRequests: { [ uri: string ]: NodeJS.Timer } = {};
const validationDelayMs = 500;

let languageFeatures: LanguageFeatures;

console.log( 'connection', connection );

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

	console.log( 'wtf' );

	languageFeatures = getMVTFeatures( workspace, params.capabilities );

	function getClientCapability<T>( name: string, def: T ) {
		const keys = name.split( '.' );
		let c: any = params.capabilities;
		for ( let i = 0; c && i < keys.length; i++ ) {
			if ( !c.hasOwnProperty( keys[ i ])  ) {
				return def;
			}
			c = c[ keys[ i ] ];
		}
		return c;
	}

	clientSnippetSupport = getClientCapability( 'textDocument.completion.completionItem.snippetSupport', false );
	workspaceFoldersSupport = getClientCapability( 'workspace.workspaceFolders', false );

	const capabilities: ServerCapabilities = {
		textDocumentSync: TextDocumentSyncKind.Incremental,
		completionProvider: clientSnippetSupport ? { resolveProvider: true, triggerCharacters: [ '.', ':', '<', '"', '=', '/' ] } : undefined,
	};

	return { capabilities };

});

connection.onInitialized(() => {

	if (workspaceFoldersSupport) {

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

// Listen on the connection
connection.listen();