import {
	WorkspaceFolder,
	TextDocument,
	Diagnostic,
	Position,
	CompletionList,
	DocumentLink,
	Definition,
	SymbolInformation
} from 'vscode-languageserver';

export interface Settings {
	MVT?: any;
	MV?: any;
}

export interface Workspace {
	readonly settings: Settings;
	readonly folders: WorkspaceFolder[];
}

export interface Languages {
	mv: LanguageFeatures,
	mvt: LanguageFeatures
}

export interface LanguageFeatures {

	doValidation?: ( document: TextDocument,
		settings?: Settings ) => Diagnostic[];
		
	doCompletion?: ( document: TextDocument, position: Position, settings?: Settings ) => CompletionList;

	findDocumentSymbols?: ( document: TextDocument ) => SymbolInformation[];

	findDefinition?: ( document: TextDocument, position: Position ) => Definition | null;

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