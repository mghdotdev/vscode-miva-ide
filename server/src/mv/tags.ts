import { CompletionItemKind } from 'vscode-languageserver';
import {
	BaseTagAttributeData,
	BaseTagAttributeValueData,
	BaseTagData,
	TagAttributeData,
	TagData,
	TagSnippet
} from '../util/interfaces';

// Base object references

const baseTag: BaseTagData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.TypeParameter,
	commitCharacters: [
		'/'
	]
};

const baseAttribute: BaseTagAttributeData = {
	required: true,
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Enum,
	commitCharacters: [
		'=',
		'"'
	],
	valueType: 'expression'
};

const baseAttributeValue: BaseTagAttributeValueData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Enum,
	commitCharacters: [
		"'"
	]
};

const baseAttributeFlag: BaseTagAttributeValueData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Keyword,
	commitCharacters: [
		"'"
	]
};

// Shared attribute references

const standardoutputlevel: TagAttributeData = {
	...baseAttribute,
	documentation: 'Optional keywords: html, text, compresswhitespace. Specifies what displays in browser. If empty, output is suppressed unless explicitly output using the `<MvEVAL>` tag. By default HTML and text are output to the browser.',
	insertText: 'STANDARDOUTPUTLEVEL = "$0"',
	label: 'STANDARDOUTPUTLEVEL',
	required: false,
	valueType: 'string',
	values: {
		html: {
			...baseAttributeFlag,
			documentation: 'HTML is output to the browser. Default.',
			insertText: 'html',
			label: 'html'
		},
		text: {
			...baseAttributeFlag,
			documentation: 'Text (non html) is output to the browser. Default.',
			insertText: 'text',
			label: 'text'
		},
		compresswhitespace: {
			...baseAttributeFlag,
			documentation: 'Will cause Miva Script to eliminate extra whitespace in the output of Miva Script code. Whitespace is leading and trailing spaces, tabs, and new lines.',
			insertText: 'compresswhitespace',
			label: 'compresswhitespace'
		}
	}
}

// Full tag data structure

const snippets: Record<string, TagSnippet> = {};

export const tags: Record<string, TagData> = {
	miva: {
		...baseTag,
		documentation: [
			'Enables you to configure the level of output, error reporting, and error handling.',
			'',
			'Your script can contain multiple MIVA tags as needed, to turn features on and off. Each `<MIVA>` tag can specify one or more attributes. The `STANDARDOUTPUTLEVEL` and `ERROROUTPUTLEVEL` attributes can also be specified in user-defined functions i.e. `<MvFUNCTION>` giving you local control, or embedded within a function, allowing you for example, to enable and disable output to the browser for sections of script. When subsequent `<MIVA>` tags are encountered, and an attribute is omitted, the current setting for that attribute are assumed.'
		].join('\n'),
		insertText: '<MIVA STANDARDOUTPUTLEVEL = "$1">$0',
		label: 'MIVA',
		reference: 'https://www.mivascript.com/item/mivascript-tags/MIVA.html',
		selfClosing: true,
		void: true,
		attributes: {
			standardoutputlevel,
			erroroutputlevel: {
				...baseAttribute,
				documentation: `Optional keywords: runtime,  expression (depreciated), syntax (depreciated).  If empty, error output is suppressed. If omitted, defaults to runtime.`,
				insertText: 'ERROROUTPUTLEVEL = "$0"',
				label: 'ERROROUTPUTLEVEL',
				required: false,
				valueType: 'string',
				values: {
					runtime: {
						...baseAttributeValue,
						documentation: 'Specifies runtime errors display in the browser. Runtime errors occur when the script is executing. For example, using `<MvIMPORT>` on a file that does not exist.',
						insertText: 'runtime',
						label: 'runtime'
					}
				}
			}
		}
	},
	mvfunction: {
		...baseTag,
		documentation: [].join('\n'),
		insertText: [
			'<MvFUNCTION NAME = "$1" PARAMETERS = "$2">',
			'\t',
			'</MvFUNCTION>$0'
		].join('\n'),
		label: 'MvFUNCTION',
		reference: 'https://www.mivascript.com/item/mivascript-tags/MvFUNCTION.html',
		selfClosing: false,
		void: false,
		attributes: {
			name: {
				...baseAttribute,
				documentation: 'Literal function name, defines the name that will be used to call the function.',
				insertText: 'NAME = "$0"',
				label: 'NAME',
				required: true,
				valueType: 'string'
			},
			parameters: {
				...baseAttribute,
				documentation: 'Optional comma separated list of variable names, assigned without any variable prefix; (parameter variables are always local) and the optionally the keyword var  (variable by reference)',
				insertText: 'PARAMETERS = "$0"',
				label: 'PARAMETERS',
				required: false,
				valueType: 'string'
			},
			standardoutputlevel
		}
	}
};

export default {
	...snippets,
	...tags
};
