import { CompletionItemKind } from 'vscode-languageserver';
import { BaseGlobalVariableData, GlobalVariableData } from '../util/interfaces';

const baseGlobalVariableData: BaseGlobalVariableData = {
	kind: CompletionItemKind.Variable
};

const globalVariableData: Record<string, GlobalVariableData> = {
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
		documentation: ``
	},
	mvcall_error: {
		...baseGlobalVariableData,
		label: 'MvCALL_Error',
		detail: 'MvCALL Error Message',
		documentation: ``
	},
	session_type: {
		...baseGlobalVariableData,
		label: 'session_type',
		detail: 'Session Type',
		documentation: ``
	},
	session_id: {
		...baseGlobalVariableData,
		label: 'session_id',
		detail: 'Session ID',
		documentation: ``
	},
	module_root_versionless: {
		...baseGlobalVariableData,
		label: 'Module_Root_Versionless',
		detail: '',
		documentation: ``
	},
	module_root: {
		...baseGlobalVariableData,
		label: 'Module_Root',
		detail: '',
		documentation: ``
	},
	customer_session_verified: {
		...baseGlobalVariableData,
		label: 'Customer_Session_Verified',
		detail: '',
		documentation: ``
	}
};

export default globalVariableData;
