import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser';
import { activate } from './main-shared';

// Create a connection for the server

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

activate(connection);