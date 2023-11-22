export default {
	MVT: {
		LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,
		LEFT_AFTER_AMP: /&$/,
		LEFT_AFTER_AMP_HOVER: /&[a-z]+$/,
		LEFT_AFTER_ENTITY_COLON: /(?<=&mvt[a-z]?:)([a-z_][a-z0-9_:\[\]]*)?$/i,
		LEFT_AFTER_TAG_COLON: /(?<!&)mvt:$/i,
		LEFT_IN_MVT_TAG: /(?=<mvt:[a-z]+)[^>]*?$/i,
		LEFT_IN_MVT_TAG_NAME: /(?<=<mvt:)[a-z]*?$/i,
		LEFT_TAG_NAME: /(?<=<mvt:)([a-z]+)[^<]*?$/i,
		LEFT_IN_ATTR: /[a-z-]\s*=\s*"\s*([^"]*?)$/i,
		LEFT_ATTR_NAME: /([a-z-]+)\s*=\s*"\s*[^"]*?$/i,
		LEFT_ITEM_NAME: /(name\s*=\s*")([a-z]+)"[^<]+$/i,
		RIGHT_ITEM_NAME: /^[^>]+?(name\s*=\s*")([a-z]+)"/i,
		LEFT_DO_FILE: /(file\s*=\s*")([^"]+)"[^<]+$/i,
		RIGHT_DO_FILE: /^[^>]+?(file\s*=\s*")([^"]+)"/i,
		ENTITIES: /(?<=&mvt[a-z]?:)([a-z_][a-z0-9_:\[\]]*?)(?=;)/ig,
		ENTITIES_G: /(?<=&mvt[a-z]?:global:)([a-z_][a-z0-9_:\[\]]*?)(?=;)/ig,
		ENTITIES_LSETTINGS: /(?<=&mvt[a-z]?:)(?!global)([a-z_][a-z0-9_:\[\]]*?)(?=;)/ig,
	},
	MV: {
		LEFT_IN_MVDO_TAG: /(?=<MvDO)[^>]*?$/i,
		LEFT_AFTER_BRACKET_DOT: /\[[^\]]*\]\.$/i,
		LEFT_IN_EXPRESSION: /\{[^{}]*?$/i,
		RIGHT_IN_EXPRESSION: /^[^{}]*?\}/i
	},
	SHARED: {
		LEFT_IN_VALUE_ATTR: /value\s*=\s*"\s*(\{)?(.){1}$/i,
		RIGHT_IN_TAG: /^[^<]*?(?=>)/,
		RIGHT_IN_ATTR: /^\s*?(\})?"/,
		RIGHT_IS_OPEN_PAREN: /^[a-z0-9_]*?\s*?(?=\()/i,
		LEFT_VARIABLE_S: /(?<=s(ystem)?\.)(([a-z0-9_]+)([a-z0-9_:\[\]]*))?$/i,
		LEFT_VARIABLE_G: /(?<=g(lobal)?\.)(([a-z0-9_]+)([a-z0-9_:\[\]]*))?$/i,
		LEFT_VARIABLE_L: /(?<=l(ocal)?\.)(([a-z0-9_]+)([a-z0-9_:\[\]]*))?$/i,
		VARIABLES_G: /(?<=g(lobal)?\.)([a-z0-9_]+)([a-z0-9_:\[\]]*)/ig,
		VARIABLES_L: /(?<=l(ocal)?\.)([a-z0-9_]+)([a-z0-9_:\[\]]*)/ig,
		VARIABLES_LSETTINGS: /(?<=l(ocal)?\.settings:)([a-z0-9_]+)([a-z0-9_:\[\]]*)/ig,
	}
};