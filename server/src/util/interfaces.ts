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
	reference?: string,
	engine?: string
}

export interface BaseTagAttributeData {
	required: boolean,
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[],
	valueType: 'variable' | 'expression' | 'string' | 'function'
}

export interface TagAttributeData extends BaseTagAttributeData {
	requiredMessage?: string,
	documentation: string,
	insertText: string,
	label: string,
	values?: Record<string, TagAttributeValueData | ItemData>
	reference?: string,
	engine?: string
}

export interface BaseTagData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface TagData extends BaseTagData {
	documentation: string,
	insertText: string,
	label: string,
	reference?: string,
	engine?: string,
	attributes?: Record<string, TagAttributeData>
}

export interface BaseItemParamData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface ItemParamData extends BaseItemParamData {
	documentation: string,
	insertText: string,
	label: string,
	reference?: string,
	engine?: string,
	version?: string
}

export interface BaseItemData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface ItemData extends BaseItemData {
	documentation: string;
	insertText: string,
	label: string,
	reference?: string,
	engine?: string,
	version?: string,
	params?: Record<string, ItemParamData>
}