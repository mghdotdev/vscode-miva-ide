export default {
	assign: {
		documentation: `Executes the expression contained within value and saves that value to the variable defined in the name attribute.`,
		insertText: "<mvt:assign name=\"${1:l.variable}\" value=\"${2:l.value}\" />",
		insertTextFormat: "Snippet",
		label: "mvt:assign",
		kind: "TypeParameter",
		commitCharacters: [
			">",
			"/"
		],
		reference: 'https://docs.miva.com/template-language/mvtassign',
		engine: '>=5.18',
		attributes: {
			name: {
				documentation: `This can be a local or global variable as defined by l. or g.

examples: l.myvariable or g.myglobalvariable.

If no prefix (l. or g.) is given it defaults to be a global variable.`,
				insertText: 'name="${0}"',
				insertTextFormat: 'Snippet',
				label: 'name',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'variable'
			},
			value: {
				documentation: `The value can either be an expression a string, a number or a combination of all three.`,
				insertText: 'value="${0}"',
				insertTextFormat: 'Snippet',
				label: 'value',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			}
		}
	}
};
