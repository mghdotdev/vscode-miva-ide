export default {	
	LEFT_IN_VALUE_ATTR: /value\s*?=\s*?"\s*?(.){1}$/i,
	LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,

	RIGHT_IN_ATTR: /^\s*?"/,
	RIGHT_IN_TAG: /^[^<]*?(?=>)/,

	LEFT_AFTER_AMP: /&$/
};