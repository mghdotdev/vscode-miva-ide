import * as path from 'path';
import {
	ExtensionContext,
	IndentAction,
	languages
} from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import mivaCommands from './miva-commands';
import { MVT_EMPTY_ELEMENTS, MV_EMPTY_ELEMENTS, MV_NON_CLOSING_TAGS } from './util/empty-tag-shared';
import { pushAll, readJSONFile } from './util/functions';

let client: LanguageClient;

export function activate( context: ExtensionContext ) {

	// path to server module
	let serverMain = readJSONFile( context.asAbsolutePath( './server/package.json' ) ).main;
	let serverModule = context.asAbsolutePath( path.join( 'server', serverMain ) );

	// The debug options for the server
	let debugOptions = { execArgv: [ '--nolazy', '--inspect=6045' ] };

	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	// Options to control the language client
	let documentSelector = [
		{ scheme: 'file', language: 'mvt' },
		{ scheme: 'untitled', language: 'mvt' },
		{ scheme: 'file', language: 'mvtcss' },
		{ scheme: 'untitled', language: 'mvtcss' },
		{ scheme: 'file', language: 'mvtjs' },
		{ scheme: 'untitled', language: 'mvtjs' },
		{ scheme: 'file', language: 'mv' },
		{ scheme: 'untitled', language: 'mv' }
	];
	let embeddedLanguages = { html: true };
	let clientOptions: LanguageClientOptions = {
		documentSelector,
		synchronize: {
			configurationSection: [ 'html', 'MVT', 'MV', 'LSK' ]
		},
		initializationOptions: {
			embeddedLanguages
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient( 'miva', 'Miva IDE Language Server', serverOptions, clientOptions );
	client.registerProposedFeatures();
	client.start();

	// push client to context
	context.subscriptions.push( client );

	// set advanced language configurations
	languages.setLanguageConfiguration('mvt', {
		indentationRules: {
			increaseIndentPattern: new RegExp( `<(?!\\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\\b|[^>]*/>)([-_\\.A-Za-z0-9]+)(?=\\s|>)\\b[^>]*>(?!.*</\\1>)|<!--(?!.*-->)|\\{[^}"']*$ `),
			decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(`<(?!(?:${ MVT_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:${ MVT_EMPTY_ELEMENTS.join( '|' ) }))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		],
	});
	languages.setLanguageConfiguration('mv', {
		indentationRules: {
			increaseIndentPattern: new RegExp( `<(?!\\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param|${ MV_NON_CLOSING_TAGS.join( '|' ) })\\b|[^>]*/>)([-_\\.A-Za-z0-9]+)(?=\\s|>)\\b[^>]*>(?!.*</\\1>)|<!--(?!.*-->)|\\{[^}"']*$` ),
			decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(`<(?!(?:${ MV_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:${ MV_EMPTY_ELEMENTS.join( '|' ) }))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		],
	});

	// push all commands to context
	pushAll( context.subscriptions, mivaCommands );

}

export function deactivate(): Thenable<void> | undefined {
	client?.stop();
	return;

}