import {
	WorkspaceFolder,
	Diagnostic,
	Position,
	CompletionList,
	Definition,
	SymbolInformation,
	Hover,
	DocumentLink,
	CodeAction,
	CodeActionContext
} from 'vscode-languageserver/node';
import {
	TextDocument,
	Range
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

	onHover?: ( document: TextDocument, position: Position ) => Hover | null

	doCodeAction?: ( document: TextDocument, range: Range, context: CodeActionContext ) => CodeAction[]

	onDocumentLinks?: ( document: TextDocument ) => DocumentLink[]

}

export interface ValidationProblem {
	type: string,
	message: string
}

export namespace ValidationCode {
	export const NO_TOOLKIT = 'NO_TOOLKIT';
	export const NO_TOOLBELT = 'NO_TOOLBELT';
	export const FOREACH_LSETTINGS = 'FOREACH_LSETTINGS';
	export const FOREACH_GLOBAL = 'FOREACH_GLOBAL';
	export const GLOBAL_NULL_ASSIGNMENT = 'GLOBAL_NULL_ASSIGNMENT';
	export const GLOBAL_ENCODING_ENTITY = 'GLOBAL_ENCODING_ENTITY';
	export const GLOBAL_ENCODING_EVAL = 'GLOBAL_ENCODING_EVAL';
};
export type ValidationCode = 'NO_TOOLKIT' | 'NO_TOOLBELT' | 'FOREACH_LSETTINGS' | 'FOREACH_GLOBAL' | 'GLOBAL_NULL_ASSIGNMENT' | 'GLOBAL_ENCODING_ENTITY' | 'GLOBAL_ENCODING_EVAL';

export interface ValidationDataReplacement {
	text: string,
	message: string,
	isPreferred?: boolean
}

export namespace ValidationDataType {
	export const REPLACEMENT = 'REPLACEMENT';
};
export type ValidationDataType = 'REPLACEMENT';

export interface ValidationData {
	type: ValidationDataType,
	replacements?: ValidationDataReplacement[]
}

export interface ValidationRule {
	match: string,
	matchIndex: number,
	checkSetting?: string,
	problem: ValidationProblem,
	code: ValidationCode,
	data?: ValidationData
}

export interface BaseTagAttributeValueData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface TagAttributeValueData extends BaseTagAttributeValueData {
	documentation: string,
	insertText?: string,
	label: string
	reference?: string,
	engine?: string,
	version?: string
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
	insertText?: string,
	label: string,
	values?: Record<string, TagAttributeValueData | ItemData>
	reference?: string,
	engine?: string,
	version?: string
}

export interface BaseTagData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[]
}

export interface TagData extends BaseTagData {
	documentation: string,
	insertText?: string,
	label: string,
	reference?: string,
	engine?: string,
	version?: string,
	attributes?: Record<string, TagAttributeData>
}

export interface BaseItemParamData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[],
	paramType: 'function' | 'link' | 'variable'
}

export interface ItemParamData extends BaseItemParamData {
	documentation: string,
	insertText?: string,
	label: string,
	reference?: string,
	engine?: string,
	version?: string
}

export interface BaseItemData {
	insertTextFormat: string,
	kind: string,
	commitCharacters: string[],
	link?: string
}

export interface ItemData extends BaseItemData {
	documentation: string;
	insertText?: string,
	label: string,
	reference?: string,
	engine?: string,
	version?: string,
	params?: Record<string, ItemParamData>
}