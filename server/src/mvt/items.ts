import { CompletionItemKind } from 'vscode-languageserver';
import {
	BaseItemData,
	BaseItemParamData,
	ItemData
} from '../util/interfaces';

const baseItem: BaseItemData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Interface,
	commitCharacters: []
};

const baseItemParamLink: BaseItemParamData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Reference,
	commitCharacters: [],
	paramType: 'link'
};

const baseItemParamFunction: BaseItemParamData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Function,
	commitCharacters: [],
	paramType: 'function'
};

const itemsData: Record<string, ItemData> = {
	customfields: {
		...baseItem,
		documentation: `Custom Fields is a module that comes installed by default in the core software. In PR8U9, the custom fields module received a huge overhaul which now included many new features, and a new layout.

One of the key new features was allowing store morph code to call functions directly inside the module through the use of \`<mvt:item />\` tags. The two main components are reading a custom field and writing to a custom field.`,
		reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/',
		version: '>=9.00.00',
		label: 'customfields',
		params: {
			debug: {
				...baseItemParamFunction,
				documentation: `Outputs any errors that may have occurred, such as a non-existent product code.`,
				insertText: "Debug()",
				label: 'Debug',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/debugging/'
			},
			read_category_code: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Category_Code( ${1:g.Category_Code}, '${2:code}', ${4:l.settings:${3:category}:customfield_values:customfields:$2} )",
				label: 'Read_Category_Code',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_category_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Category_ID( ${1:g.Category_ID}, '${2:code}', ${4:l.settings:${3:category}:customfield_values:customfields:$2} )",
				label: 'Read_Category_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_category_code: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Category_Code( ${1:g.Category_Code}, '${2:code}', ${3:value} )",
				label: 'Write_Category_Code',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_category_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Category_ID( ${1:g.Category_ID}, '${2:code}', ${3:value} )",
				label: 'Write_Category_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_product_code: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Product_Code( ${1:g.Product_Code}, '${2:code}', ${4:l.settings:${3:product}:customfield_values:customfields:$2} )",
				label: 'Read_Product_Code',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_product_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Product_ID( ${1:g.Product_ID}, '${2:code}', ${4:l.settings:${3:product}:customfield_values:customfields:$2} )",
				label: 'Read_Product_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_product_code: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Product_Code( ${1:g.Product_Code}, '${2:code}', ${3:value} )",
				label: 'Write_Product_Code',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_product_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Product_ID( ${1:g.Product_ID}, '${2:code}', ${3:value} )",
				label: 'Write_Product_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_basket: {
				...baseItemParamFunction,
				documentation: `Reads a basket custom field by code to a specific variable.`,
				insertText: "Read_Basket( '${1:code}', ${2:g.Basket:customfields:$1} )",
				label: 'Read_Basket',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/basket-custom-fields/'
			},
			write_basket: {
				...baseItemParamFunction,
				documentation: `Writes a custom field to the sNN_BasketInfo table.`,
				insertText: "Write_Basket( '${1:code}', ${2:value} )",
				label: 'Write_Basket',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/basket-custom-fields/'
			},
			read_customer_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Customer_ID( ${1:g.customer:id}, '${2:code}', ${3:l.settings:customer:customfield_values:customfields:$2} )",
				label: 'Read_Customer_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_customer_login: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Customer_Login( ${1:g.customer:login}, '${2:code}', ${3:l.settings:customer:customfield_values:customfields:$2} )",
				label: 'Read_Customer_Login',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_customer_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Customer_ID( ${1:g.customer:id}, '${2:code}', ${3:value} )",
				label: 'Write_Customer_ID',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_customer_login: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Customer_Login( ${1:g.customer:login}, '${2:code}', ${3:value} )",
				label: 'Write_Customer_Login',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_order: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Read_Order( ${1:g.Order_ID}, '${2:code}', ${3:l.settings:order:customfield_values:customfields:$2} )",
				label: 'Read_Order',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_order: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Order( ${1:g.Order_ID}, '${2:code}', ${value} )",
				label: 'Write_Order',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_page_id: {
				...baseItemParamFunction,
				documentation: `Load a Page custom field by its \`id\`.`,
				insertText: "Read_Page_ID( ${1:g.Page_ID}, '${2:code}', ${4:l.settings:${3:page}:customfield_values:customfields:$2} )",
				label: 'Read_Page_ID',
				version: '>=10.05.00',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			read_page_code: {
				...baseItemParamFunction,
				documentation: `Load a Page custom field by its \`code\`.`,
				insertText: "Read_Page_Code( ${1:g.Page_Code}, '${2:code}', ${4:l.settings:${3:page}:customfield_values:customfields:$2} )",
				label: 'Read_Page_Code',
				version: '>=10.05.00',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_page_id: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Page_ID( ${1:g.Page_ID}, '${2:code}', ${3:value} )",
				label: 'Write_Page_ID',
				version: '>=10.05.00',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			},
			write_page_code: {
				...baseItemParamFunction,
				documentation: ``,
				insertText: "Write_Page_Code( ${1:g.Page_Code}, '${2:code}', ${3:value} )",
				label: 'Write_Page_Code',
				version: '>=10.05.00',
				reference: 'https://docs.miva.com/developer/developer-training/working-with-custom-fields/functions/'
			}
		}
	},
	readytheme: {
		...baseItem,
		documentation: `ReadyThemes is functionality built into the core of Miva Merchant Version 9. It allows you build themes or integrate with an existing CSSUI store to better manage your Miva Merchant store from the admin. This includes updating your logo, managing social media links, managing promotional images, content, product lists, and navigation.

There are 6 different tabs available within ReadyThemes which provide different functionality. Below are code samples and an item reference guide to help you build a new theme or customize an existing Miva Merchant store.`,
		reference: 'https://docs.miva.com/developer/developer-training/working-with-theme-components/',
		version: '>=9.00.00',
		label: 'readytheme',
		params: {
			// Function params
			contentsection: {
				...baseItemParamFunction,
				documentation: `Content Sections are a place to manage your sites content pages. Content such about us, policy pages, or other content needs.

Each Content Section will be contained with a div tag with a class of "readytheme-contentsection" and and id of the code given to the content section unless the "Wrap Div" setting is false.`,
				insertText: "contentsection( ${1:code} )",
				label: 'contentsection'
			},
			load_contentsection: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a content section. This function does not render the template.

Note: if output is omitted or left blank the data is automatically loaded into \`l.settings:readytheme:loaded\``,
				version: '>=9.00.01',
				insertText: "Load_ContentSection( ${1:code}, ${2:output var} )",
				label: 'Load_ContentSection'
			},
			banner: {
				...baseItemParamFunction,
				documentation: `Text banners allow you to create text based banners which can be used for promotional messaging, or site notifications.

Each Text Banner will be contained with a div tag with a class of "readytheme-banner" and and id of the code given to the banner.`,
				insertText: "banner( ${1:code} )",
				label: 'banner'
			},
			load_banner: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a banner. This function does not render the template.

Note: if output is omitted or left blank the data is automatically loaded into \`l.settings:readytheme:loaded\``,
				version: '>=9.00.01',
				insertText: "Load_Banner( ${1:code}, ${2:output var} )",
				label: 'Load_Banner'
			},
			image: {
				...baseItemParamFunction,
				documentation: `ReadyThemes has the ability to manage all your sites promotional images. They can be placed anywhere on the website. Miva will automatically resize them to any specifications you need. Common use cases are: homepage sliders, homepage banners, global promotional images, Category/Product Specific promotional images.

Search Friendly Links will automatically be used in URLs if configured in Miva Merchant Domain Settings.`,
				insertText: "image( ${1:code} )",
				label: 'image'
			},
			load_image: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a image. This function does not render the template.

Note: if output is omitted or left blank the data is automatically loaded into \`l.settings:readytheme:loaded\``,
				version: '>=9.00.01',
				insertText: "Load_Image( ${1:code}, ${2:output var} )",
				label: 'Load_Image'
			},
			productlisting: {
				...baseItemParamFunction,
				documentation: `Product Listings allow you to add featured products to any page of your Miva Store. Typically this will be used on the storefront. There are two options for which products get pulled in. It will use All Products, or products from a specific category. This will allow the store owner to create a new category to assign products to, or pull products from an existing category. Management of which products display and their order is all controlled at the category level.

Multiple product listing items can appear on the same page. The products listing item will inherit all the items for the page it is used on. So if you need to used toolkit or another items code within the product listing template, as long as toolkit is assigned to the page template it is used on it will work.

The product listing item have a complete page template which can be customized to support any layout needed. Because the ReadyTheme feature used the product listing component, things like additional images, sorting, number of products to display are all built in.

The layout of any product listing can be controlled though the Advanced Mode setting.`,
				insertText: "productlisting( ${1:code} )",
				label: 'productlisting'
			},
			load_productlisting: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a product listing. This function does not render the template.

Note: if output is omitted or left blank the data is automatically loaded into \`l.settings:readytheme:loaded\``,
				version: '>=9.00.01',
				insertText: "Load_ProductListing( ${1:code}, ${2:output var} )",
				label: 'Load_ProductListing'
			},
			navigationset: {
				...baseItemParamFunction,
				documentation: `Navigation Sets allow you to create custom navigation structures to control different parts of your Miva Merchant store. Currently Miva has a built in category tree, and a navigation bar. With Navigation Sets, you can define your own navigational structures to be used anywhere.

Each Navigation Set has its own Template to control the layout. By default it will output a nested ul/li structure to allow for easy styling. Included in ready themes is a built in stylesheet with 4 layouts. Each layout provides different styles for the type of navigation menu you would like to use. The stylesheet automatically gets added to the store under CSS list when readythemes is activated.

Urls for the links are automatically generated. In the event you need more control over the link there are item available to build your own custom link.`,
				insertText: "navigationset( ${1:code} )",
				label: 'navigationset'
			},
			load_navigationset: {
				...baseItemParamFunction,
				documentation: `Load the variable data for a navigation set. This function does not render the template.

Note: if output is omitted or left blank the data is automatically loaded into \`l.settings:readytheme:loaded\``,
				version: '>=9.00.01',
				insertText: "Load_Navigationset( ${1:code}, ${2:output var} )",
				label: 'Load_Navigationset'
			},
			// Non-function params
			thirdpartysharing: {
				...baseItemParamLink,
				documentation: `Output the ReadyTheme > Social Icons > 3rd Party Social Sharing Code template.`,
				label: 'thirdpartysharing'
			},
			trustsymbol: {
				...baseItemParamLink,
				documentation: `Output the ReadyTheme > Trust Symbol template.`,
				label: 'trustsymbol'
			}
		}
	}
};

export default itemsData;
