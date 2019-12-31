import {
	WorkspaceFolder,
	TextDocument,
	Diagnostic,
	Position,
	CompletionList,
	DocumentLink
} from 'vscode-languageserver';

export interface Settings {
	MVT?: any;
	MV?: any;
}

export interface Workspace {
	readonly settings: Settings;
	readonly folders: WorkspaceFolder[];
}

export interface LanguageFeatures {

	doValidation?: ( document: TextDocument,
		settings?: Settings ) => Diagnostic[];
		
	doCompletion?: ( document: TextDocument, position: Position, settings?: Settings ) => CompletionList;

	findDocumentLinks?: ( document: TextDocument ) => DocumentLink[];

}

export interface ValidationProblem {
	type: string,
	message: string
}

export interface ValidationRule {
	match: string,
	matchIndex: number,
	checkSetting?: string,
	problem: ValidationProblem
}