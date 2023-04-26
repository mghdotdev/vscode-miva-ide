import {
	TagAttributeData,
	TagData,
	BaseTagData,
	BaseTagAttributeData,
	BaseTagAttributeValueData
} from '../util/interfaces';

// Base object references

const baseTag: BaseTagData = {
	insertTextFormat: 'Snippet',
	kind: 'TypeParameter',
	commitCharacters: [
		'>',
		'/'
	]
};

const baseAttribute: BaseTagAttributeData = {
	required: true,
	insertTextFormat: 'Snippet',
	kind: 'Enum',
	commitCharacters: [
		'=',
		'"'
	],
	valueType: 'expression'
};

const baseAttributeValue: BaseTagAttributeValueData = {
	insertTextFormat: 'Snippet',
	kind: 'Enum',
	commitCharacters: [
		"'"
	]
};

// Specific attribute references

const expr: TagAttributeData = {
	...baseAttribute,
	documentation: ``,
	insertText: 'expr="${0}"',
	label: 'expr'
};

// Full tag data structure

const tagData: Record<string, TagData> = {
	assign: {
		...baseTag,
		documentation: `Executes the expression contained within value and saves that value to the variable defined in the name attribute.`,
		insertText: "<mvt:assign name=\"${1:l.variable}\" value=\"${2:l.value}\" />",
		label: 'mvt:assign',
		reference: 'https://docs.miva.com/template-language/mvtassign',
		engine: '>=5.18',
		attributes: {
			name: {
				...baseAttribute,
				documentation: `This can be a local or global variable as defined by l. or g.

examples: l.myvariable or g.myglobalvariable.

If no prefix (l. or g.) is given it defaults to be a global variable.`,
				insertText: 'name="${0}"',
				label: 'name',
				valueType: 'variable'
			},
			value: {
				...baseAttribute,
				documentation: `The value can either be an expression a string, a number or a combination of all three.`,
				insertText: 'value="${0}"',
				label: 'value',
			}
		}
	},
	call: {
		...baseTag,
		documentation: `Executes an HTTP call on the server. This function returns the response a single object at a time in a system variable called s.callvalue. A common practice is to eval this variable within the loop which will display the entire result.

[See this page](http://www.mivascript.com/item/MvCALL.html) for descriptions of all available system variables.

All parameters accept variables (g.url) or strings which must be wrapped in single quotes.

- Use \`s.callvalue\` to access the response. To read the full body, concatenate \`s.callvalue\` into a variable assigned outside of the tag.
- Use \`<mvt:callstop />\` to exit the response early.
- Use \`<mvt:callcontinue />\` to continue reading the response.`,
		insertText: "<mvt:call action=\"$1\" method=\"${2|'GET','POST','HEAD','XML','RAW','OPTIONS','PUT','DELETE','TRACE','CONNECT'|}\">\n\t${3:<mvt:eval expr=\"s.callvalue\" />}\n</mvt:call>\n${4:<!-- @@ &mvt:global:MvCALL_Error; -->}",
		label: 'mvt:call',
		reference: 'https://docs.miva.com/template-language/mvtcall',
		engine: '>=5.22',
		attributes: {
			action: {
				...baseAttribute,
				documentation: `Specifies the fully qualified URL to be contacted, starting with http.`,
				insertText: 'action="${0}"',
				label: 'action'
			},
			method: {
				...baseAttribute,
				documentation: `GET | POST | HEAD | XML | RAW | OPTIONS | PUT | DELETE | TRACE | CONNECT. In most cases use GET for simple page retrieval and use POST when when transmitting field data. If not specified and METHOD is XML, POST will have content type "text/xml." If not specified and METHOD is RAW, will have content type "text/plain".`,
				insertText: 'method="${0}"',
				label: 'method',
				valueType: 'string',
				values: {
					CONNECT: {
						...baseAttributeValue,
						documentation: `The CONNECT method establishes a tunnel to the server identified by the target resource.`,
						insertText: "'CONNECT'",
						label: "'CONNECT'"
					},
					DELETE: {
						...baseAttributeValue,
						documentation: `The DELETE method deletes the specified resource.`,
						insertText: "'DELETE'",
						label: "'DELETE'"
					},
					GET: {
						...baseAttributeValue,
						documentation: `The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.`,
						insertText: "'GET'",
						label: "'GET'"
					},
					HEAD: {
						...baseAttributeValue,
						documentation: `The HEAD method asks for a response identical to a GET request, but without the response body.`,
						insertText: "'HEAD'",
						label: "'HEAD'"
					},
					POST: {
						...baseAttributeValue,
						documentation: `The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.`,
						insertText: "'POST'",
						label: "'POST'"
					},
					RAW: {
						...baseAttributeValue,
						documentation: `Functionally the same as a POST, however it sets the Content-Type header to be \`text/plain\`.`,
						insertText: "'RAW'",
						label: "'RAW'"
					},
					OPTIONS: {
						...baseAttributeValue,
						documentation: `The OPTIONS method describes the communication options for the target resource.`,
						insertText: "'OPTIONS'",
						label: "'OPTIONS'"
					},
					PUT: {
						...baseAttributeValue,
						documentation: `The PUT method replaces all current representations of the target resource with the request payload.`,
						insertText: "'PUT'",
						label: "'PUT'"
					},
					TRACE: {
						...baseAttributeValue,
						documentation: `The TRACE method performs a message loop-back test along the path to the target resource.`,
						insertText: "'TRACE'",
						label: "'TRACE'"
					},
					XML: {
						...baseAttributeValue,
						documentation: `Functionally the same as a POST, however it sets the Content-Type header to be \`text/xml\`.`,
						insertText: "'XML'",
						label: "'XML'"
					}
				}
			},
			'content-type': {
				...baseAttribute,
				required: false,
				requiredMessage: "Available when the `method` attribute is `'XML'` or `'RAW'`.",
				documentation: `The values of the variables listed in the FIELDS attribute will then be passed in the header.`,
				insertText: 'content-type="${0}"',
				label: 'content-type'
			},
			fields: {
				...baseAttribute,
				required: false,
				requiredMessage: "Available when the `method` attribute is `'POST'`.",
				documentation: `Comma delimited list of variables value pairs sent to the URL when POST is used as the method.`,
				insertText: 'fields="${0}"',
				label: 'fields'
			},
			files: {
				...baseAttribute,
				required: false,
				documentation: `Contains variables whose values are filenames that will be uploaded to the URL specified in \`action\`.`,
				insertText: 'files="${0}"',
				label: 'files'
			},
			certfile: {
				...baseAttribute,
				required: false,
				documentation: `Resolves to a location in the data directory containing a certificate or set of certificates.`,
				insertText: 'certfile="${0}"',
				label: 'certfile'
			},
			certtype: {
				...baseAttribute,
				required: false,
				documentation: `Must be either 'PEM' or 'ASN1'.`,
				insertText: 'certtype="${0}"',
				label: 'certtype',
				valueType: 'string',
				values: {
					PEM: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "'PEM'",
						label: "'PEM'"
					},
					ANS1: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "'ANS1'",
						label: "'ANS1'"
					}
				}
			},
			certpass: {
				...baseAttribute,
				required: false,
				documentation: `Allows PEM-format certificates and/or private keys to be stored encrypted on disk. If specified, the value of \`certpass\` is used to decrypt the certificate and/or private key in the file specified by \`certfile\`.`,
				insertText: 'certpass="${0}"',
				label: 'certpass'
			},
			timeout: {
				...baseAttribute,
				required: false,
				documentation: `This value is used if it is smaller than the configured \`MvCONFIG_CALL_TIMEOUT\` value.`,
				insertText: 'timeout="${0}"',
				label: 'timeout'
			},
			headers: {
				...baseAttribute,
				required: false,
				documentation: `The value in this attribute will be placed after the Empresa-generated HTTP headers, but before the CRLF separating the HTTP headers and the body of the HTTP request.`,
				insertText: 'headers="${0}"',
				label: 'headers'
			},
			'pin-algorithm': {
				...baseAttribute,
				required: false,
				documentation: `__[Requires 5.33 engine or above]__

Is either an empty string (which disables pinning), or an OpenSSL digest algorithm identifier, such as "sha1", "md5" or "sha256".`,
				insertText: 'pin-algorithm="${0}"',
				label: 'pin-algorithm',
				valueType: 'string',
				values: {
					sha1: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "'sha1'",
						label: "'sha1'"
					},
					md5: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "'md5'",
						label: "'md5'"
					},
					sha256: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "'sha256'",
						label: "'sha256'"
					}
				}
			},
			'pin-digest': {
				...baseAttribute,
				required: false,
				documentation: `__[Requires 5.33 engine or above]__

Pin diesest is the binary "fingerprint" of the X509 certificate (as generated by X509_digest)

The ... loop terminates when the entire document has been received, or when an (optional) is encountered. If is encountered, processing start back at the top continuing with the next item.`,
				insertText: 'pin-digest="${0}"',
				label: 'pin-digest'
			}
		}
	},
	if: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:if expr=\"${1}\">\n\t${2}\n<mvt:else>\n\t${0}\n</mvt:if>",
		label: 'mvt:if',
		reference: 'https://docs.miva.com/template-language/mvtif',
		engine: '>=5.18',
		attributes: {
			expr
		}
	},
	elseif: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:if expr=\"${1}\">\n\t${2}\n<mvt:elseif expr=\"${3}\">\n\t${0}\n</mvt:if>",
		label: 'mvt:elseif',
		reference: 'https://docs.miva.com/template-language/mvtif',
		engine: '>=5.18',
		attributes: {
			expr
		}
	}
};

export default tagData;
