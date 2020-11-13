export default {
	MVT: {
		LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,
		LEFT_AFTER_AMP: /&$/,
		LEFT_IN_MVT_TAG: /(?=<mvt:[a-z]+)[^>]*?$/i
	},
	MV: {
		LEFT_IN_MVDO_TAG: /(?=<MvDO)[^>]*?$/i,
		LEFT_AFTER_BRACKET_DOT: /\[\s*\]\.$/i
	},
	SHARED: {
		LEFT_IN_VALUE_ATTR: /value\s*=\s*"\s*(\{)?(.){1}$/i,
		RIGHT_IN_TAG: /^[^<]*?(?=>)/,
		RIGHT_IN_ATTR: /^\s*?(\})?"/,
		LEFT_VARIABLE_S: /s(ystem)?\.(([A-Za-z0-9_]+)([a-zA-Z0-9:_\.]*))?$/,
		LEFT_VARIABLE_G: /g(lobal)?\.(([A-Za-z0-9_]+)([a-zA-Z0-9:_\.]*))?$/,
		LEFT_VARIABLE_L: /l(ocal)?\.(([A-Za-z0-9_]+)([a-zA-Z0-9:_\.]*))?$/,
		VARIABLE_G: /g(lobal)?\.([A-Za-z0-9_]+)([a-zA-Z0-9:_\.]*)/g,
		VARIABLE_L: /l(ocal)?\.([A-Za-z0-9_]+)([a-zA-Z0-9:_\.]*)/g
	}
};