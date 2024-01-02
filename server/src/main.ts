import { Connection, ProposedFeatures, createConnection } from 'vscode-languageserver/node';
import { LskProvider } from './lsk-provider/lsk-provider';
import { activate } from './main-shared';
import { formatError } from './util/functions';

// Create a connection for the server

const connection: Connection = createConnection(ProposedFeatures.all);

process.on('unhandledRejection', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});
process.on('uncaughtException', ( e: any ) => {
	console.error( formatError( `Unhandled exception`, e ) );
});

activate(connection, new LskProvider());
