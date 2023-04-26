import {
	ItemData,
	BaseItemData,
	BaseItemParamData
} from '../util/interfaces';

const baseItem: BaseItemData = {
	insertTextFormat: 'Snippet',
	kind: 'Interface',
	commitCharacters: []
};

const baseItemParamFunction: BaseItemParamData = {
	insertTextFormat: 'Snippet',
	kind: 'Function',
	commitCharacters: [
		'('
	]
};

const itemData: Record<string, ItemData> = {
	customfields: {
		...baseItem,
		documentation: `Custom Fields is a module that comes installed by default in the core software. In PR8U9, the custom fields module received a huge overhaul which now included many new features, and a new layout.

One of the key new features was allowing store morph code to call functions directly inside the module through the use of \`<mvt:item />\` tags. The two main components are reading a custom field and writing to a custom field.`,
		insertText: "customfields",
		label: 'customfields',
		reference: 'https://docs.miva.com/template-language/custom-field-reference-documentation',
		version: '>=9.00.00',
		params: {
			debug: {
				...baseItemParamFunction,
				documentation: `Outputs any errors that may have occurred, such as a non-existent product code.`,
				insertText: "Debug()",
				label: 'Debug',
				reference: 'https://docs.miva.com/template-language-custom-field-debugging'
			},
			write_basket: {
				...baseItemParamFunction,
				documentation: `Writes a custom field to the sNN_BasketInfo table.`,
				insertText: "Write_Basket( '${1:_CODE_}', ${2:_VALUE_} )",
				label: 'Write_Basket',
				reference: 'https://docs.miva.com/template-language-custom-field-debugging'
			}
		}
	}
};

export default itemData;
