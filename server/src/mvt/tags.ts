import { CompletionItemKind } from 'vscode-languageserver';
import {
	BaseTagAttributeData,
	BaseTagAttributeValueData,
	BaseTagData,
	TagAttributeData,
	TagData
} from '../util/interfaces';
import itemsData from './items';

// Base object references

const baseTag: BaseTagData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.TypeParameter,
	commitCharacters: [
		'/'
	]
};

const baseAttribute: BaseTagAttributeData = {
	required: true,
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Enum,
	commitCharacters: [
		'=',
		'"'
	],
	valueType: 'expression'
};

const baseAttributeValue: BaseTagAttributeValueData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Enum,
	commitCharacters: [
		"'"
	]
};

// Specific attribute references

const expr: TagAttributeData = {
	...baseAttribute,
	documentation: `This can either be an expression a string, a number, or a combination of all three.`,
	insertText: 'expr="${0}"',
	label: 'expr'
};

const name: TagAttributeData = {
	...baseAttribute,
	documentation: `This can be a local or global variable as defined by l. or g.

examples: l.myvariable or g.myglobalvariable.

If no prefix (l. or g.) is given it defaults to be a global variable.`,
	insertText: 'name="${0}"',
	label: 'name',
	valueType: 'variable'
};

// Specific tag references

const tagItem = {
	...baseTag,
	documentation: ``,
	insertText: "<mvt:item name=\"${1}\" ${2:param=\"${3}\"} />",
	label: 'mvt:item',
	attributes: {
		name: {
			...baseAttribute,
			documentation: ``,
			insertText: 'name="${0}"',
			label: 'name',
			valueType: 'string',
			values: {
				...itemsData
			}
		},
		param: {
			...baseAttribute,
			required: false,
			documentation: ``,
			insertText: 'param="${0}"',
			label: 'param',
			valueType: 'function'
		}
	}
}

// Full tag data structure

const tagData: Record<string, TagData> = {
	debug: {
		...baseTag,
		documentation: '',
		kind: CompletionItemKind.Function,
		insertText: "<mvt:assign name=\"l.settings:_mvps_debug\" value=\"glosub( miva_array_serialize( ${1:variable} ), ',', asciichar( 10 ) )\" />\r\n${2|<!--,<pre>|}\r\n@@debug $1\r\n&mvt:_mvps_debug;\r\n${3|-->,</pre>|}",
		label: 'mvt-debug'
	},
	debug_json: {
		...baseTag,
		documentation: '',
		kind: CompletionItemKind.Function,
		insertText: "<mvt:assign name=\"l.settings:_mvps_debug\" value=\"miva_json_encode( ${1:variable}, 'pretty' )\" />\r\n${2|<!--,<pre>|}\r\n@@debug $1\r\n&mvt:_mvps_debug;\r\n${3|-->,</pre>|}",
		label: 'mvt-debug-json'
	},
	testuser: {
		...baseTag,
		documentation: '',
		kind: CompletionItemKind.Function,
		insertText: "<mvt:comment> Start Testing Conditional </mvt:comment>\n<mvt:if expr=\"g.customer:login EQ '${1:test}'\">\n\n\n\n\n${2}\n\n\n\n\n${3:<mvt:else>}\n${0}\n</mvt:if>\n<mvt:comment> / end Testing Conditional </mvt:comment>",
		label: 'mvt-testuser'
	},
	testvar: {
		...baseTag,
		documentation: '',
		kind: CompletionItemKind.Function,
		insertText: "<mvt:comment> Start Testing Conditional </mvt:comment>\n<mvt:if expr=\"${1:g.test EQ 1}\">\n\n\n\n\n${2}\n\n\n\n\n${3:<mvt:else>}\n${0}\n</mvt:if>\n<mvt:comment> / end Testing Conditional </mvt:comment>",
		label: 'mvt-testvar'
	},
	assign: {
		...baseTag,
		documentation: `Executes the expression contained within value and saves that value to the variable defined in the name attribute.`,
		insertText: "<mvt:assign name=\"${1:l.variable}\" value=\"${2:l.value}\" />",
		label: 'mvt:assign',
		reference: 'https://docs.miva.com/template-language/mvtassign',
		engine: '>=5.18',
		attributes: {
			name,
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
		documentation: `Executes an HTTP call on the server. This function returns the response a single object at a time in a system variable called \`s.callvalue\`. A common practice is to eval this variable within the loop which will display the entire result.

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
	callcontinue: {
		...baseTag,
		documentation: `Only used within a \`<mvt:call>\` tag. Terminates execution of any statements after and continues to the next iteration instead.`,
		insertText: "<mvt:callcontinue />",
		label: 'mvt:callcontinue',
		reference: 'https://docs.miva.com/template-language/mvtcall',
		engine: '>=5.22'
	},
	callstop: {
		...baseTag,
		documentation: `Only used within a \`<mvt:call>\` tag. Terminates the current \`<mvt:call>\` loop.`,
		insertText: "<mvt:callstop />",
		label: 'mvt:callstop',
		reference: 'https://docs.miva.com/template-language/mvtcall',
		engine: '>=5.22'
	},
	capture: {
		...baseTag,
		documentation: `This tag takes the evaluated contents between the mvt:capture tags and saves it to a variable`,
		insertText: "<mvt:capture variable=\"${1}\">\n\t${0}\n</mvt:capture>",
		label: 'mvt:capture',
		reference: 'https://docs.miva.com/template-language/mvtcapture',
		engine: '>=5.33',
		attributes: {
			variable: {
				...baseAttribute,
				documentation: `The variable that stores the capture result.`,
				insertText: 'variable="${0}"',
				label: 'variable',
				valueType: 'variable'
			}
		}
	},
	comment: {
		...baseTag,
		documentation: `Content within this tag will be ignored.`,
		insertText: "<mvt:comment>\n|\n|\t${1}\n|\n</mvt:comment>",
		label: 'mvt:comment'
	},
	do: {
		...baseTag,
		documentation: `Provides access to call native Miva Script functions in compiled .mvc files. This allows access to all built in Miva functions that makeup the core software.`,
		insertText: "<mvt:do file=\"$3\" name=\"$2\" value=\"$1\" />",
		label: 'mvt:do',
		reference: 'https://docs.miva.com/template-language/mvtdo',
		engine: '>=5.22',
		attributes: {
			name: {
				...name,
				documentation: `This is a variable (l. or g. ) where any return value from the function called will be saved.`
			},
			value: {
				...baseAttribute,
				documentation: `This is the specific function to be executed along with any parameters it accepts.`,
				insertText: 'value="${0}"',
				label: 'value',
				valueType: 'function'
			},
			file: {
				...baseAttribute,
				documentation: `This is the path to the compiled Miva Script file (.mvc) relative to the mm5 directory. It can be a string (wrapped in single quotes) or more commonly a global variable to one of Miva's built on libraries. See below for available libraries:

__Miva Library Variables__

These global variables reference a specific module file. The Limited Source Kit should be used as a reference to see which functions are in which module.

| Variable | Path |
| --- | --- |
| g.Module_Library_Billing_DB | /mm5/5.00/lib/mbs.mvc |
| g.Module_Library_Utilities | /mm5/5.00/lib/util.mvc |
| g.Module_Library_Crypto | /mm5/5.00/lib/crypto.mvc |
| g.Module_Library_DB | /mm5/5.00/lib/db.mvc |
| g.Module_Library_DBAPI | /mm5/5.00/lib/dbapi.mvc |
| g.Module_Library_Native_DBAPI | /mm5/5.00/lib/dbapi_mysql.mvc |
				`,
				insertText: 'file="${0}"',
				label: 'file',
				valueType: 'variable'
			}
		}
	},
	else: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:else>",
		label: 'mvt:else',
		reference: 'https://docs.miva.com/template-language/if-else'
	},
	elseif: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:elseif expr=\"${0}\">",
		label: 'mvt:elseif',
		reference: 'https://docs.miva.com/template-language/if-else',
		attributes: {
			expr
		}
	},
	eval: {
		...baseTag,
		documentation: `Executes the expression contained within expr attribute and outputs the expression's value directly to the page. It operates just like \`mvt:assign\` except that instead of saving the value/expression to a variable, it will output it directly to the page.`,
		insertText: "<mvt:eval expr=\"${1:l.value}\" />",
		label: 'mvt:eval',
		reference: 'https://docs.miva.com/template-language/mvteval',
		engine: '>=5.18',
		attributes: {
			expr
		}
	},
	exit: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:exit />",
		label: 'mvt:exit'
	},
	foreach: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:foreach iterator=\"${1}\" array=\"${2}\">\n\t${0}\n</mvt:foreach>",
		label: 'mvt:foreach',
		reference: 'https://docs.miva.com/template-language/foreach',
		attributes: {
			iterator: {
				...baseAttribute,
				documentation: ``,
				insertText: 'iterator="${0}"',
				label: 'iterator',
				valueType: 'variable'
			},
			array: {
				...baseAttribute,
				documentation: ``,
				insertText: 'array="${0}"',
				label: 'array',
				valueType: 'variable'
			}
		}
	},
	foreachcontinue: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:foreachcontinue />",
		label: 'mvt:foreachcontinue',
		reference: 'https://docs.miva.com/template-language/foreach'
	},
	foreachstop: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:foreachstop />",
		label: 'mvt:foreachstop',
		reference: 'https://docs.miva.com/template-language/foreach'
	},
	if: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:if expr=\"${1}\">\n\t${2}\n${3:<mvt:else>}\n\t${0}\n</mvt:if>",
		label: 'mvt:if',
		reference: 'https://docs.miva.com/template-language/if-statement',
		attributes: {
			expr
		}
	},
	item: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:item name=\"${1}\" ${2:param=\"${3}\"} />",
		label: 'mvt:item',
		attributes: {
			name: {
				...baseAttribute,
				documentation: ``,
				insertText: 'name="${0}"',
				label: 'name',
				valueType: 'string',
				values: {
					...itemsData
				}
			},
			param: {
				...baseAttribute,
				required: false,
				documentation: ``,
				insertText: 'param="${0}"',
				label: 'param',
				valueType: 'function'
			}
		}
	},
	...Object
			.entries(itemsData)
			.reduce((oi, [itemName, itemData]) => {
				return {
					...oi,
					[`item-${itemName}`]: {
						...tagItem,
						insertText: `<mvt:item name="${itemData.insertText || itemData.label}" param="\${1}" />`,
						label: `mvt:item:${itemName}`,
						kind: itemData.kind
					},
					...Object
						.entries(itemData?.params)
						?.reduce((op, [paramName, paramData]) => {
							return {
								...op,
								[`item-${itemName}-${paramName}`]: {
									...tagItem,
									insertText: `<mvt:item name="${itemData.insertText || itemData.label}" param="${paramData.insertText || paramData.label}" />`,
									label: `mvt:item:${itemName}:${paramData.label || paramName}`,
									kind: paramData.kind
								},
							}
						}, {}) || {}
				}
			}, {}),
	miva: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:miva output=\"${1|on,off|}\" compresswhitespace=\"${2|on,off|}\" />",
		label: 'mvt:miva',
		reference: 'http://www.mivascript.com/item/mivascript-tags/MIVA.html',
		attributes: {
			output: {
				...baseAttribute,
				required: false,
				documentation: ``,
				insertText: 'output="${0}"',
				label: 'output',
				valueType: 'string',
				values: {
					on: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "on",
						label: "on"
					},
					off: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "off",
						label: "off"
					}
				}
			},
			compresswhitespace: {
				...baseAttribute,
				required: false,
				documentation: ``,
				insertText: 'compresswhitespace="${0}"',
				label: 'compresswhitespace',
				valueType: 'string',
				values: {
					on: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "on",
						label: "on"
					},
					off: {
						...baseAttributeValue,
						documentation: ``,
						insertText: "off",
						label: "off"
					}
				}
			}
		}
	},
	while: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:while expr=\"${1}\">\n\t${0}\n</mvt:while>",
		label: 'mvt:while',
		reference: 'https://docs.miva.com/template-language/while',
		attributes: {
			expr
		}
	},
	whilecontinue: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:whilecontinue />",
		label: 'mvt:whilecontinue',
		reference: 'https://docs.miva.com/template-language/while'
	},
	whilestop: {
		...baseTag,
		documentation: ``,
		insertText: "<mvt:whilestop />",
		label: 'mvt:whilestop',
		reference: 'https://docs.miva.com/template-language/while'
	}
};

export default tagData;
