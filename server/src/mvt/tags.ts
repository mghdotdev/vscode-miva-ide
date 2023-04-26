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
				required: true,
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
				required: true,
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
	},
	call: {
		documentation: `Executes an HTTP call on the server. The response is read into the \`s.callvalue\` system variable. The response is chunked and template code inside the tag is iterated until the entire body is read. All parameters accept variables (g.url) or strings which must be wrapped in single quotes.

- Use \`s.callvalue\` to access the response. To read the full body, concatenate \`s.callvalue\` into a variable assigned outside of the tag.
- Use \`<mvt:callstop />\` to exit the response early.
- Use \`<mvt:callcontinue />\` to continue reading the response.`,
		insertText: "<mvt:call action=\"$1\" method=\"${2|'GET','POST','HEAD','XML','RAW','OPTIONS','PUT','DELETE','TRACE','CONNECT'|}\">\n\t${3:<mvt:eval expr=\"s.callvalue\" />}\n</mvt:call>\n${4:<!-- @@ &mvt:global:MvCALL_Error; -->}",
		insertTextFormat: "Snippet",
		label: "mvt:call",
		kind: "TypeParameter",
		commitCharacters: [
			">",
			"/"
		],
		reference: 'https://docs.miva.com/template-language/mvtcall',
		engine: '>=5.22',
		attributes: {
			action: {
				required: true,
				documentation: `Specifies the fully qualified URL to be contacted, starting with http.`,
				insertText: 'action="${0}"',
				insertTextFormat: 'Snippet',
				label: 'action',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			method: {
				required: true,
				documentation: `GET | POST | HEAD | XML | RAW | OPTIONS | PUT | DELETE | TRACE | CONNECT. In most cases use GET for simple page retrieval and use POST when when transmitting field data. If not specified and METHOD is XML, POST will have content type "text/xml." If not specified and METHOD is RAW, will have content type "text/plain".`,
				insertText: 'value="${0}"',
				insertTextFormat: 'Snippet',
				label: 'value',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'string',
				values: {
					GET: {
						documentation: ``,
						insertText: "'GET'",
						insertTextFormat: 'Snippet',
						label: "'GET'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					POST: {
						documentation: ``,
						insertText: "'POST'",
						insertTextFormat: 'Snippet',
						label: "'POST'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					HEAD: {
						documentation: ``,
						insertText: "'HEAD'",
						insertTextFormat: 'Snippet',
						label: "'HEAD'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					RAW: {
						documentation: ``,
						insertText: "'RAW'",
						insertTextFormat: 'Snippet',
						label: "'RAW'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					XML: {
						documentation: ``,
						insertText: "'XML'",
						insertTextFormat: 'Snippet',
						label: "'XML'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					OPTIONS: {
						documentation: ``,
						insertText: "'OPTIONS'",
						insertTextFormat: 'Snippet',
						label: "'OPTIONS'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					PUT: {
						documentation: ``,
						insertText: "'PUT'",
						insertTextFormat: 'Snippet',
						label: "'PUT'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					DELETE: {
						documentation: ``,
						insertText: "'DELETE'",
						insertTextFormat: 'Snippet',
						label: "'DELETE'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					TRACE: {
						documentation: ``,
						insertText: "'TRACE'",
						insertTextFormat: 'Snippet',
						label: "'TRACE'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					CONNECT: {
						documentation: ``,
						insertText: "'CONNECT'",
						insertTextFormat: 'Snippet',
						label: "'CONNECT'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					}
				}
			},
			'content-type': {
				required: false,
				requiredMessage: "Available when the `method` attribute is `'XML'` or `'RAW'`.",
				documentation: `The values of the variables listed in the FIELDS attribute will then be passed in the header.`,
				insertText: 'content-type="${0}"',
				insertTextFormat: 'Snippet',
				label: 'content-type',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			fields: {
				required: false,
				requiredMessage: "Available when the `method` attribute is `'POST'`.",
				documentation: `Comma delimited list of variables value pairs sent to the URL when POST is used as the method.`,
				insertText: 'fields="${0}"',
				insertTextFormat: 'Snippet',
				label: 'fields',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			files: {
				required: false,
				documentation: `Contains variables whose values are filenames that will be uploaded to the URL specified in ACTION.`,
				insertText: 'files="${0}"',
				insertTextFormat: 'Snippet',
				label: 'files',
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
