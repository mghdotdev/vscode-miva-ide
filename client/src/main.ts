import * as path from 'path';
import {
	ExtensionContext,
	IndentAction,
	languages,
	workspace
} from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { showChangelog } from './changelog/manager';
import mivaCommands from './miva-commands';
import { MVT_EMPTY_ELEMENTS, MV_EMPTY_ELEMENTS } from './util/empty-tag-shared';
import { pushAll, readJSONFile, syncSettingToWhenContext } from './util/functions';

// Define language client to be used during activate and deactivate callbacks
let client: LanguageClient;

export function activate( context: ExtensionContext ) {
	// Path to server module
	const serverMain = readJSONFile( context.asAbsolutePath( './server/package.json' ) ).main;
	const serverModule = context.asAbsolutePath( path.join( 'server', serverMain ) );

	// The debug options for the server
	const debugOptions = { execArgv: [ '--nolazy', '--inspect=6045' ] };

	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};

	// Options to control the language client
	const documentSelector = [
		{ scheme: 'file', language: 'mvt' },
		{ scheme: 'untitled', language: 'mvt' },
		{ scheme: 'file', language: 'mvtcss' },
		{ scheme: 'untitled', language: 'mvtcss' },
		{ scheme: 'file', language: 'mvtjs' },
		{ scheme: 'untitled', language: 'mvtjs' },
		{ scheme: 'file', language: 'mv' },
		{ scheme: 'untitled', language: 'mv' }
	];
	const embeddedLanguages = { html: true };
	const clientOptions: LanguageClientOptions = {
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

	// Push client to subscriptions
	context.subscriptions.push( client );

	// Set advanced language configurations

	languages.setLanguageConfiguration('mvt', {
		indentationRules: {
			increaseIndentPattern: new RegExp( `<(?!\\?|(?:area|base|br|col|frame|hr|html|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MVT_EMPTY_ELEMENTS.join( '|' ) })\\b|[^>]*\\/>)([-_\\.A-Za-z0-9:]+)(?=\\s|>)\\b[^>]*>(?!.*<\\/\\1>)|<!--(?!.*-->)|\\{[^}\"']*$`, 'i'),
			decreaseIndentPattern: new RegExp(`^\\s*(<\\/(?!html)[-_\\.A-Za-z0-9:]+\\b[^>]*>|-->|\\})|^\\s*<mvt:else(if)?(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)`, 'i')
		},
		wordPattern: new RegExp("(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\@\\$\\^\\&\\*\\(\\)\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\s]+)", 'g'),
		onEnterRules: [
			{
				/**
				 * eg
				 * <mvt:comment>[CURSOR]<
				 */
				beforeText: /^\s*<mvt:comment>/i,
				afterText: /^<\/mvt:comment>/i,
				action: {
					indentAction: IndentAction.IndentOutdent,
					appendText: '|\t'
				}
			},
			{
				/**
				 * eg
				 * |[CURSOR]
				 */
				beforeText: /^\s*\|[^<]*/i,
				action: {
					indentAction: IndentAction.None,
					appendText: '|\t'
				}
			},
			{
				beforeText: new RegExp(`<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MVT_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w\-.\\d]*)(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)[^<]*$`, 'i'),
				afterText: new RegExp(`^<\\/([_:\\w][_:\\w\-.\\d]*)\\s*>`, 'i'),
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MVT_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w\-.\\d]*)(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		],
	});

	languages.setLanguageConfiguration('mv', {
		indentationRules: {
			increaseIndentPattern: new RegExp( `<(?!\\?|(?:area|base|br|col|frame|hr|html|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MV_EMPTY_ELEMENTS.join( '|' ) })\\b|[^>]*\\/>)([-_\\.A-Za-z0-9:]+)(?=\\s|>)\\b[^>]*>(?!.*<\\/\\1>)|<!--(?!.*-->)|\\{[^}\"']*$`),
			decreaseIndentPattern: new RegExp(`^\\s*(<\\/(?!html)[-_\\.A-Za-z0-9:]+\\b[^>]*>|-->|\\})|^\\s*<MvELSE(IF)?(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)`, 'i')
		},
		wordPattern: new RegExp("(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\@\\$\\^\\&\\*\\(\\)\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\s]+)", 'g'),
		onEnterRules: [
			{
				/**
				 * eg
				 * <MvCOMMENT>[CURSOR]<
				 */
				beforeText: /^\s*<MvCOMMENT>/i,
				afterText: /^<\/MvCOMMENT>/i,
				action: {

					indentAction: IndentAction.IndentOutdent,
					appendText: '|\t'
				}
			},
			{
				/**
				 * eg
				 * [CURSOR]
				 */
				beforeText: /^\s*\|[^<]*/i,
				action: {
					indentAction: IndentAction.None,
					appendText: '|\t',
				}
			},
			{
				beforeText: new RegExp(`<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MV_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w\-.\\d]*)(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)[^<]*$`, 'i'),
				afterText: new RegExp(`^<\\/([_:\\w][_:\\w\-.\\d]*)\\s*>`, 'i'),
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|${ MV_EMPTY_ELEMENTS.join( '|' ) }))([_:\\w][_:\\w\-.\\d]*)(?:(?:[^'\"/>]|\"[^\"]*\"|'[^']*')*?(?!\\/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		],
	});

	// Create when context and sync from setting
	syncSettingToWhenContext('', 'enableTriggerSuggestAfterPaste', 'mivaIde');

	// Listen for configuration changes and do something
	const didChangeConfigurationDisposable = workspace.onDidChangeConfiguration(() => {
		syncSettingToWhenContext('', 'enableTriggerSuggestAfterPaste', 'mivaIde');
	});
	context.subscriptions.push( didChangeConfigurationDisposable );

	// push all commands to context
	pushAll( context.subscriptions, mivaCommands );

	// Run function to show the changelog to the user
	showChangelog(context);
}

export function deactivate(): Thenable<void> | undefined {
	client?.stop();

	return;
}