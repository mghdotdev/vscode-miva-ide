import {
	WorkspaceFolder,
	Diagnostic,
	Position,
	CompletionList,
	Definition,
	SymbolInformation,
	Hover
} from 'vscode-languageserver/node';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';

export interface Settings {
	LSK?: any,
	MVT?: any,
	MV?: any
}

export interface Workspace {
	readonly settings: Settings;
	readonly folders: WorkspaceFolder[];
}

export interface Languages {
	mv: LanguageFeatures,
	mvt: LanguageFeatures,
	mvtcss: LanguageFeatures,
	mvtjs: LanguageFeatures
}

export interface LanguageFeatures {

	doValidation?: ( document: TextDocument,
		settings?: Settings ) => Diagnostic[];

	doCompletion?: ( document: TextDocument, position: Position, settings?: Settings ) => CompletionList;

	findDocumentSymbols?: ( document: TextDocument ) => SymbolInformation[];

	findDefinition?: ( document: TextDocument, position: Position, settings: Settings ) => Definition | null;

	onHover?: ( Document: TextDocument, position: Position ) => Hover | null

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

export interface BaseTagAttributeValueData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface TagAttributeValueData extends BaseTagAttributeValueData {
	documentation: string,
	insertText: string,
	label: string
}

export interface BaseTagAttributeData {
	required: boolean,
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[],
	valueType: 'variable' | 'expression' | 'string' | 'function',
}

export interface TagAttributeData extends BaseTagAttributeData {
	requiredMessage?: string,
	documentation: string,
	insertText: string,
	label: string,
	values?: Record<string, TagAttributeValueData>
}

export interface BaseTagData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[],
}

export interface TagData extends BaseTagData {
	documentation: string,
	insertText: string,
	label: string,
	reference: string,
	engine: string,
	attributes?: Record<string, TagAttributeData>
}