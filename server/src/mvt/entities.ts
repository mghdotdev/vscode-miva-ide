import { CompletionItemKind } from 'vscode-languageserver';
import {
	BaseEntityData,
	EntityData
} from '../util/interfaces';

const baseEntityData: BaseEntityData = {
	commitCharacters: [':'],
	kind: CompletionItemKind.Keyword
};

const entityData: Record<string, EntityData> = {
	'mvt': {
		...baseEntityData,
		label: 'mvt',
		detail: 'No Encoding',
		documentation: 'Outputs the variable directly with no encoding.\n### NOTE: Variables without encoding can potentially be exploited by XSS.'
	},
	'mvte': {
		...baseEntityData,
		label: 'mvte',
		detail: 'Entity Encoding',
		preselect: true,
		documentation: 'Applies the `encodeentities` function before outputting, converting to a HTML-encoded format.\n\n __Example:__ `&` => `&amp;`'
	},
	'mvta': {
		...baseEntityData,
		label: 'mvta',
		detail: 'Attribute Encoding',
		documentation: 'Applies the `encodeattributes` function before outputting, converting to a URI-encoded format. \n\n __Example:__ `+` => `%2B`'
	},
	'mvtj': {
		...baseEntityData,
		label: 'mvtj',
		detail: 'JavaScript Encoding',
		documentation: 'Applies the `encodejavascriptstring` function before outputting, converting to a JavaScript-endcoded format.\n\n __Example:__ `{` => `\\u007B`'
	},
	'mvts': {
		...baseEntityData,
		label: 'mvts',
		detail: 'Slugify Encoding',
		documentation: 'Applies the `slugify` function before outputting.\n\n __Example:__ `hello world` => `hello-world`'
	}
};

export default entityData