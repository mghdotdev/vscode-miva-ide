import { CompletionItemKind } from 'vscode-languageserver';
import { BaseGlobalVariableData, GlobalVariableData } from '../util/interfaces';

const baseGlobalVariableData: BaseGlobalVariableData = {
	kind: CompletionItemKind.Variable
};

const globalVariableData: Record<string, GlobalVariableData> = {
	action: {
		...baseGlobalVariableData,
		label: 'Action',
		detail: 'Action',
		documentation: ``
	},
	order_id: {
		...baseGlobalVariableData,
		label: 'Order_ID',
		detail: 'Order ID',
		documentation: ``
	},
	store_code: {
		...baseGlobalVariableData,
		label: 'Store_Code',
		detail: 'Store Code',
		documentation: ``
	},
	product_code: {
		...baseGlobalVariableData,
		label: 'Product_Code',
		detail: 'Product Code',
		documentation: ``
	},
	category_code: {
		...baseGlobalVariableData,
		label: 'Category_Code',
		detail: 'Category Code',
		documentation: ``
	},
	page_code: {
		...baseGlobalVariableData,
		label: 'Page_Code',
		detail: 'Page Code',
		documentation: ``
	},
	error_code: {
		...baseGlobalVariableData,
		label: 'Error_Code',
		detail: 'Error Code',
		documentation: ``
	},
	error_message: {
		...baseGlobalVariableData,
		label: 'Error_Message',
		detail: 'Error Message',
		documentation: ``
	},
	mvdo_error: {
		...baseGlobalVariableData,
		label: 'MvDO_Error',
		detail: 'MvDO Error Message',
		documentation: `Error message from the last ran \`<mvt:do>\` tag.`
	},
	mvcall_error: {
		...baseGlobalVariableData,
		label: 'MvCALL_Error',
		detail: 'MvCALL Error Message',
		documentation: `Error message from the last ran \`<mvt:call>\` tag.`
	},
	screen: {
		...baseGlobalVariableData,
		label: 'Screen',
		detail: 'Screen',
		documentation: ``
	},
	session_type: {
		...baseGlobalVariableData,
		label: 'Session_Type',
		detail: 'Session Type',
		documentation: ``
	},
	session_id: {
		...baseGlobalVariableData,
		label: 'Session_ID',
		detail: 'Session ID',
		documentation: ``
	},
	merchant_local_timezone: {
		...baseGlobalVariableData,
		label: 'Merchant_Local_Timezone',
		detail: 'Merchant Local Timezone',
		documentation: `Timezone of the server.`
	},
	module_root_versionless: {
		...baseGlobalVariableData,
		label: 'Module_Root_Versionless',
		detail: 'Module Root Versionless',
		documentation: `Example: \`/mm5/\``
	},
	module_root: {
		...baseGlobalVariableData,
		label: 'Module_Root',
		detail: 'Module Root',
		documentation: `Example: \`/mm5/5.00/\``
	},
	customer_session_id: {
		...baseGlobalVariableData,
		label: 'Customer_Session_ID',
		detail: 'Customer Session ID',
		documentation: ``
	},
	customer_session_verified: {
		...baseGlobalVariableData,
		label: 'Customer_Session_Verified',
		detail: 'Customer Session Verified',
		documentation: ``
	}
};

export default globalVariableData;
