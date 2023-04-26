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
		documentation: `Executes an HTTP call on the server. This function returns the response a single object at a time in a system variable called s.callvalue. A common practice is to eval this variable within the loop which will display the entire result.

[See this page](http://www.mivascript.com/item/MvCALL.html) for descriptions of all available system variables.

All parameters accept variables (g.url) or strings which must be wrapped in single quotes.

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
					CONNECT: {
						documentation: `The CONNECT method establishes a tunnel to the server identified by the target resource.`,
						insertText: "'CONNECT'",
						insertTextFormat: 'Snippet',
						label: "'CONNECT'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					DELETE: {
						documentation: `The DELETE method deletes the specified resource.`,
						insertText: "'DELETE'",
						insertTextFormat: 'Snippet',
						label: "'DELETE'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					GET: {
						documentation: `The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.`,
						insertText: "'GET'",
						insertTextFormat: 'Snippet',
						label: "'GET'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					HEAD: {
						documentation: `The HEAD method asks for a response identical to a GET request, but without the response body.`,
						insertText: "'HEAD'",
						insertTextFormat: 'Snippet',
						label: "'HEAD'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					POST: {
						documentation: `The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.`,
						insertText: "'POST'",
						insertTextFormat: 'Snippet',
						label: "'POST'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					RAW: {
						documentation: `Functionally the same as a POST, however it sets the Content-Type header to be \`text/plain\`.`,
						insertText: "'RAW'",
						insertTextFormat: 'Snippet',
						label: "'RAW'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					OPTIONS: {
						documentation: `The OPTIONS method describes the communication options for the target resource.`,
						insertText: "'OPTIONS'",
						insertTextFormat: 'Snippet',
						label: "'OPTIONS'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					PUT: {
						documentation: `The PUT method replaces all current representations of the target resource with the request payload.`,
						insertText: "'PUT'",
						insertTextFormat: 'Snippet',
						label: "'PUT'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					TRACE: {
						documentation: `The TRACE method performs a message loop-back test along the path to the target resource.`,
						insertText: "'TRACE'",
						insertTextFormat: 'Snippet',
						label: "'TRACE'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					XML: {
						documentation: `Functionally the same as a POST, however it sets the Content-Type header to be \`text/xml\`.`,
						insertText: "'XML'",
						insertTextFormat: 'Snippet',
						label: "'XML'",
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
				documentation: `Contains variables whose values are filenames that will be uploaded to the URL specified in \`action\`.`,
				insertText: 'files="${0}"',
				insertTextFormat: 'Snippet',
				label: 'files',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			certfile: {
				required: false,
				documentation: `Resolves to a location in the data directory containing a certificate or set of certificates.`,
				insertText: 'certfile="${0}"',
				insertTextFormat: 'Snippet',
				label: 'certfile',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			certtype: {
				required: false,
				documentation: `Must be either 'PEM' or 'ASN1'.`,
				insertText: 'certtype="${0}"',
				insertTextFormat: 'Snippet',
				label: 'certtype',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'string',
				values: {
					PEM: {
						documentation: ``,
						insertText: "'PEM'",
						insertTextFormat: 'Snippet',
						label: "'PEM'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					ANS1: {
						documentation: ``,
						insertText: "'ANS1'",
						insertTextFormat: 'Snippet',
						label: "'ANS1'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					}
				}
			},
			certpass: {
				required: false,
				documentation: `Allows PEM-format certificates and/or private keys to be stored encrypted on disk. If specified, the value of \`certpass\` is used to decrypt the certificate and/or private key in the file specified by \`certfile\`.`,
				insertText: 'certpass="${0}"',
				insertTextFormat: 'Snippet',
				label: 'certpass',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			timeout: {
				required: false,
				documentation: `This value is used if it is smaller than the configured \`MvCONFIG_CALL_TIMEOUT\` value.`,
				insertText: 'timeout="${0}"',
				insertTextFormat: 'Snippet',
				label: 'timeout',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			headers: {
				required: false,
				documentation: `The value in this attribute will be placed after the Empresa-generated HTTP headers, but before the CRLF separating the HTTP headers and the body of the HTTP request.`,
				insertText: 'headers="${0}"',
				insertTextFormat: 'Snippet',
				label: 'headers',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'expression'
			},
			'pin-algorithm': {
				required: false,
				documentation: `__[Requires 5.33 engine or above]__

Is either an empty string (which disables pinning), or an OpenSSL digest algorithm identifier, such as "sha1", "md5" or "sha256".`,
				insertText: 'pin-algorithm="${0}"',
				insertTextFormat: 'Snippet',
				label: 'pin-algorithm',
				kind: 'Enum',
				commitCharacters: [
					'=',
					'"'
				],
				valueType: 'string',
				values: {
					sha1: {
						documentation: ``,
						insertText: "'sha1'",
						insertTextFormat: 'Snippet',
						label: "'sha1'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					md5: {
						documentation: ``,
						insertText: "'md5'",
						insertTextFormat: 'Snippet',
						label: "'md5'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					},
					sha256: {
						documentation: ``,
						insertText: "'sha256'",
						insertTextFormat: 'Snippet',
						label: "'sha256'",
						kind: 'Enum',
						commitCharacters: [
							"'"
						]
					}
				}
			},
			'pin-digest': {
				required: false,
				documentation: `__[Requires 5.33 engine or above]__

Pin diesest is the binary "fingerprint" of the X509 certificate (as generated by X509_digest)

The ... loop terminates when the entire document has been received, or when an (optional) is encountered. If is encountered, processing start back at the top continuing with the next item.`,
				insertText: 'pin-digest="${0}"',
				insertTextFormat: 'Snippet',
				label: 'pin-digest',
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
