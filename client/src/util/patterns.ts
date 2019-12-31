export default {	
	MVT: {
		MVTDO_LEFT_FILE_ATTR: /(?<=file\s*=\s*\")[^<]*?$/i,
		MVTDO_RIGHT_FILE_ATTR: /^[^>]*?file\s*=\s*"/i,
		ENTITY_LOCAL: /^&mvt[a-z]?:(?!global:)(.+?);$/i,
		ENTITY_GLOBAL: /^&mvt[a-z]?:global:(.+?);$/i,
		VARIABLE_LOCAL: /^l\.settings\:(.+?)$/i,
		VARIABLE_GLOBAL: /^g\.(.+?)/i
	}
};