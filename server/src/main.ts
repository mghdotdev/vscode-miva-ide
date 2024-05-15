import { Connection, ProposedFeatures, createConnection } from 'vscode-languageserver/node';
import { activate } from './main-shared';
import { MivaScriptCompilerDiagnosticProvider } from './mv/miva-script-compiler-provider/miva-script-compiler-provider';
import { WorkspaceSymbolProvider } from './mv/symbol-provider/symbol-provider';
import { formatError } from './util/functions';

// Create a connection for the server

const connection: Connection = createConnection(ProposedFeatures.all);

process.on('unhandledRejection', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});
process.on('uncaughtException', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});

activate(connection, new WorkspaceSymbolProvider(), new MivaScriptCompilerDiagnosticProvider());
