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

const baseTemplateItem: BaseItemData = {
	...baseItem,
	link: './templates/{{fileName}}-{{label}}.mvt'
}

const baseItemParamFunction: BaseItemParamData = {
	insertTextFormat: 'Snippet',
	kind: 'Function',
	commitCharacters: [
		'('
	],
	paramType: 'function'
};

const itemsData: Record<string, ItemData> = {
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
				reference: 'https://docs.miva.com/template-language/custom-basket-fields'
			},
			read_page_id: {
				...baseItemParamFunction,
				documentation: `Load a Page custom field by its \`id\`.`,
				insertText: "Read_Page_ID( ${1:g.Page_ID}, '${2:_CODE_}', ${4:l.settings:${3:page}:customfield_values:customfields:$2} )",
				label: 'Read_Page_ID',
				version: '>=10.05.00',
				reference: 'https://docs.miva.com/miva10/reference-guide/custom-page-fields#template-functions'
			}
		}
	},
	product_display: {
		...baseTemplateItem,
		documentation: '',
		insertText: 'product_display',
		label: 'product_display'
	}
};

export default itemsData;
