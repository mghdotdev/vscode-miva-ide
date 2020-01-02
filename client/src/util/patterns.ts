export default {	
	MVT: {

		ENTITY_LOCAL: /^&mvt[a-z]?:(?!global:)(.+?);$/i,
		ENTITY_GLOBAL: /^&mvt[a-z]?:global:(.+?);$/i,

		VARIABLE_LOCAL: /^l\.settings\:(.+?)$/i,
		VARIABLE_GLOBAL: /^g\.(.+?)/i

	},
	MV: {

		LEFT_BRACKET_DOT: /(?<=\[)\s*\]\.[^\[]*?$/

	},
	SHARED: {
		
		LEFT_FILE_ATTR: /(?<=file\s*=\s*\"(\s*\{)?)[^<]*?$/i,
		RIGHT_FILE_ATTR: /^[^>]*?file\s*=\s*"(\s*\{)?/i,

	}
};