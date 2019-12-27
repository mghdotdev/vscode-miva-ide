import { WorkspaceFolder, TextDocument, Diagnostic } from 'vscode-languageserver';

export interface Settings {
	MVT?: any;
}

export interface Workspace {
	readonly settings: Settings;
	readonly folders: WorkspaceFolder[];
}

export interface LanguageFeatures {

	doValidation?: ( document: TextDocument, settings?: Settings ) => Diagnostic[];

}