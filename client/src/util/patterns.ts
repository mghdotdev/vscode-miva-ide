export default {
	MVT: {
		ENTITY_LOCAL: /^&mvt[a-z]?:(?!global:)(.+?);$/i,
		ENTITY_GLOBAL: /^&mvt[a-z]?:global:(.+?);$/i,

		VARIABLE_LOCAL: /^l\.settings\:(.+?)$/i,
		VARIABLE_GLOBAL: /^g\.(.+?)$/i,

		FOREACH_TAG_OPEN: /<mvt:foreach\b/gi,
		FOREACH_TAG_CLOSE: /<\/mvt:foreach/gi,

		LEFT_FILE_ATTR: /(?<=file\s*=\s*\"\s*)[^<]*?$/i,
		RIGHT_FILE_ATTR: /^[^>]*?file\s*=\s*"\s*/i,

		LEFT_NAME_ATTR: /(?<=name\s*=\s*\"\s*)[^<]*?$/i,
		RIGHT_NAME_ATTR: /^[^>]*?name\s*=\s*"\s*/i,

		ATTR_END: /^[^"]+/
	},
	MV: {
		LEFT_BRACKET_DOT: /(?<=\[)[^\]><]*\]\.[^\[><]*?$/,
		BRACKET_DOT_END: /^[^\]]+/,

		LEFT_FILE_ATTR: /(?<=file\s*=\s*\"(\s*\{\s))[^<]*?$/i,
		RIGHT_FILE_ATTR: /^[^>]*?file\s*=\s*"(\s*\{\s)/i,
		FILE_ATTR_END: /^[^"\}\s]+/,

		LEFT_NAME_ATTR: /(?<=name\s*=\s*\"\s*)[^<]*?$/i,
		RIGHT_NAME_ATTR: /^[^>]*?name\s*=\s*"\s*/i,
		NAME_ATTR_END: /^[^"]+/
	}
};