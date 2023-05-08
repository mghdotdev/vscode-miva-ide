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
	],
	paramType: 'function'
};

const itemsData: Record<string, ItemData> = {
	customfields: {
		...baseItem,
		documentation: `Custom Fields is a module that comes installed by default in the core software. In PR8U9, the custom fields module received a huge overhaul which now included many new features, and a new layout.

One of the key new features was allowing store morph code to call functions directly inside the module through the use of \`<mvt:item />\` tags. The two main components are reading a custom field and writing to a custom field.`,
		reference: 'https://docs.miva.com/template-language/custom-field-reference-documentation',
		version: '>=9.00.00',
		label: 'customfields',
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
	readytheme: {
		...baseItem,
		documentation: `ReadyThemes is functionality built into the core of Miva Merchant Version 9. It allows you build themes or integrate with an existing CSSUI store to better manage your Miva Merchant store from the admin. This includes updating your logo, managing social media links, managing promotional images, content, product lists, and navigation.

There are 6 different tabs available within ReadyThemes which provide different functionality. Below are code samples and an item reference guide to help you build a new theme or customize an existing Miva Merchant store.`,
		reference: 'https://docs.miva.com/template-language/readythemes-documentation',
		version: '>=9.00.00',
		label: 'readytheme',
		params: {
			contentsection: {
				...baseItemParamFunction,
				documentation: `Content Sections are a place to manage your sites content pages. Content such about us, policy pages, or other content needs.`,
				insertText: "contentsection( ${1:code} )",
				label: 'contentsection'
			},
			load_contentsection: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a content section. This function does not render the template.`,
				insertText: "Load_ContentSection( ${1:code}, ${2:output var} )",
				label: 'Load_ContentSection'
			}
		}
	}
};

export default itemsData;
