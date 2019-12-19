export default {
	/* LEFT_IN_VALUE_ATTR: /value\s*?=\s*?"\s*?(.){1}$/i,
	LEFT_IN_FILE_ATTR: /file\s*?=\s*?"\s*?(.){1}$/i,
	LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,

	MVTDO_TAG_FILE_QUOTES: /((?=<mvt:do)[^>]*?file\s*=\s*)("[^>]*?")/i,
	MVTDO_TAG_VALUE_QUOTES: /((?=<mvt:do)[^>]*?value\s*=\s*)("[^>]*?")/i,

	MVTDO_TEXT_BEFORE_FILE_ATTR: /(?=<mvt:do)([^>]*?file\s*=\s*"[^">]*?)([^>]*?)$/i,

	LEFT_FIND_MVTDO_TAG: /(<mvt:do[^>]*?)$/i,
	RIGHT_FIND_TAG_ENDING: /^[^<]*?>/i,
	
	RIGHT_IN_ATTR: /^\s*?"/,
	RIGHT_IN_TAG: /^[^<]*?(?=>)/ */

	MVTDO_LEFT_FILE_ATTR: /(?<=file\s*=\s*\")[^<]*?$/i,
	MVTDO_RIGHT_FILE_ATTR: /^[^>]*?file\s*=\s*"/i
};