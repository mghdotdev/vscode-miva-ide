import { existsSync, readFileSync } from 'fs';
import { glob } from 'glob';
import _get from 'lodash.get';
import * as path from 'path';
import {
	getCSSLanguageService
} from 'vscode-css-languageservice/lib/esm/cssLanguageService';
import {
	TokenType,
	getLanguageService
} from 'vscode-html-languageservice/lib/esm/htmlLanguageService';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import {
	ClientCapabilities,
	CodeAction,
	CodeActionKind,
	CompletionList,
	Definition,
	Diagnostic,
	DiagnosticSeverity,
	Hover,
	Location,
	MarkupContent,
	Position,
	Range,
	SymbolKind,
	TextEdit
} from 'vscode-languageserver/node';
import mvOperatorData from './mv/operators';
import systemVariableData from './mv/system-variables';
import { mvSnippetData, mvTagData } from './mv/tags';
import mvtEntityData from './mvt/entities';
import mvtItemData from './mvt/items';
import { generateMvtTags, mvtSnippetData } from './mvt/tags';
import {
	filterTagData,
	formatGenericDocumentation,
	formatItemParamDocumentation,
	formatTagAttributeDocumentation,
	formatTagAttributeValueDocumentation,
	formatTagDocumentation,
	getDoValueCompletions,
	getEntityAtOffset,
	getHoverMapFromCompletionFile,
	getNodeAtOffset,
	getVariableAtOffset,
	getWordAtOffset,
	isTagSelfClosing,
	parseCompletion,
	parseCompletionFile,
	readJSONFile,
	safeMatch,
	tokenize,
	unique
} from './util/functions';
import {
	LanguageFeatures,
	MvLanguageModel,
	MvtLanguageModel,
	Settings,
	SymbolInformationWithDocumentation,
	TagData,
	TagSnippet,
	ValidationData,
	ValidationDataType,
	ValidationRule,
	Workspace
} from './util/interfaces';
import { getLanguageModelCache } from './util/language-model-cache';
import patterns from './util/patterns';

// Define HTML Language Service helper
const htmlLanguageService = getLanguageService();

// Constants
const BOUNDARY_AMOUNT = 200;
const MAX_LINE_LENGTH = 9999;

// Completion data
const merchantFunctionFiles = readJSONFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) );
const doValueCompletions: CompletionList = getDoValueCompletions( merchantFunctionFiles );
const doValueHoverMap: Map<string, MarkupContent> = getHoverMapFromCompletionFile( doValueCompletions.items );
const builtinFunctionData = readJSONFile( path.resolve( __dirname, '..', 'data', 'functions-builtin.json' ) );
const builtinFunctionCompletions: CompletionList = CompletionList.create( parseCompletionFile( builtinFunctionData ) );
const builtinFunctionHoverMap: Map<string, MarkupContent> = getHoverMapFromCompletionFile( builtinFunctionData );
const systemVariableCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( systemVariableData ) ) );
const operatorCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( mvOperatorData ) ) );

// Document cache for Miva Script (this is globally defined since we use .mv documents in MVT for LSK lookups)
const mvDocuments = getLanguageModelCache<MvLanguageModel>( 500, 60, (document: TextDocument) => {
	const symbols = _mvFindDocumentSymbols(document);

	return {
		symbols,
		document
	};
});

// Symbol (variable, LSK function) containers
let workspaceSymbols: any[] = [];
let lskSymbols: any[] = [];

// Helper function for "variable" completion target list
const getVariableCompletions = (left: string, mivaDocument: TextDocument): CompletionList | null => {
	// system variables
	if ( patterns.SHARED.LEFT_VARIABLE_S.test( left ) ) {
		return systemVariableCompletions;
	}

	// get full text
	const mivaDocumentText = mivaDocument.getText();

	// global variables
	if ( patterns.SHARED.LEFT_VARIABLE_G.test( left ) ) {

		const variableMatches = left.match(patterns.SHARED.LEFT_VARIABLE_G) || [];
		const _foundVariable = variableMatches[0] || '';
		const foundVariable = _foundVariable.slice(0, _foundVariable.lastIndexOf(':') + 1);
		const foundVariableRegex = new RegExp(`^${foundVariable.replace(/(?<=\[)[0-9]+(?=\])/g, '[0-9]+')}`);

		const foundVariables = [].concat(
			mivaDocumentText.match( patterns.SHARED.VARIABLES_G ) || [],
			mivaDocumentText.match( patterns.MVT.ENTITIES_G ) || []
		)
			?.filter( unique )
			?.filter(_variable => foundVariableRegex.test(_variable))
			?.map(_variable => _variable.replace(foundVariableRegex, ''));

		return CompletionList.create(
			foundVariables.map((variable) => {
				return parseCompletion({
					"label": variable,
					"kind": "Variable",
					"detail": variable,
					"documentation": "",
					"commitCharacters": []
				});
			})
		);

	}

	// local variables
	if ( patterns.SHARED.LEFT_VARIABLE_L.test( left ) ) {

		const variableMatches = left.match(patterns.SHARED.LEFT_VARIABLE_L) || [];
		const _foundVariable = variableMatches[0] || '';
		const foundVariable = _foundVariable.slice(0, _foundVariable.lastIndexOf(':') + 1);
		const foundVariableRegex = new RegExp(`^${foundVariable.replace(/(?<=\[)[0-9]+(?=\])/g, '[0-9]+')}`);

		const foundVariables = [].concat(
			mivaDocumentText.match( patterns.SHARED.VARIABLES_L ) || [],
			foundVariable.startsWith('settings')
				? (mivaDocumentText.match( patterns.SHARED.VARIABLES_LSETTINGS ) || []).map(_variable => 'settings:' + _variable)
				: []
		)
			?.filter( unique )
			?.filter(_variable => foundVariableRegex.test(_variable))
			?.map(_variable => _variable.replace(foundVariableRegex, ''));

		return CompletionList.create(
			foundVariables.map((variable) => {
				return parseCompletion({
					"label": variable,
					"kind": "Variable",
					"detail": variable,
					"documentation": "",
					"commitCharacters": []
				});
			})
		);

	}

	return null;
};

export function baseMVTFeatures(workspace: Workspace, clientCapabilities: ClientCapabilities): LanguageFeatures {

	const findDocumentSymbols = ( document: TextDocument ) => {
		const symbols: SymbolInformationWithDocumentation[] = [];

		const scanner = htmlLanguageService.createScanner( document.getText(), 0 );
		let token = scanner.scan();
		let lastTagName: string | undefined = undefined;
		let lastAttributeName: string | undefined = undefined;

		while ( token !== TokenType.EOS ) {

			switch ( token ) {

				case TokenType.StartTag:
					lastTagName = scanner.getTokenText().toLowerCase();
					break;

				case TokenType.AttributeName:
					lastAttributeName = scanner.getTokenText().toLowerCase();
					break;

				case TokenType.AttributeValue:
					if ( ( lastTagName === 'mvt:assign' || lastTagName === 'mvt:capture' || lastTagName === 'mvt:do' || lastTagName === 'mvt:foreach' ) && ( lastAttributeName === 'name' || lastAttributeName === 'variable' || lastAttributeName === 'iterator' ) ) {

						// Get name
						let name = scanner.getTokenText().replace( /"/g, '' );

						// Only push if name is truthy
						if (name) {

							// Add l.settings to iterator value
							if (lastAttributeName === 'iterator') {
								name = `l.settings:${name}`;
							}

							const selfClosing = isTagSelfClosing(lastTagName);

							const range = Range.create(
								document.positionAt( scanner.getTokenOffset() + 1 ),
								document.positionAt( scanner.getTokenOffset() + scanner.getTokenLength() - 1 )
							);

							// Create references to variable symbols
							symbols.push(
								{
									documentation: {
										kind: 'markdown',
										value: [
											'',
											`Defined on Ln ${range.start.line + 1}, Col ${range.start.character + 1}`,
											'',
											'```mvt',
											selfClosing
												? `<${lastTagName} ${lastAttributeName}="${name}" />`
												: `<${lastTagName} ${lastAttributeName}="${name}">\n\t...\n</${lastTagName}>`,
											'```',
											''
										].join('\n')
									},
									kind: SymbolKind.Variable,
									name,
									location: Location.create(
										document.uri,
										range
									)
								}
							);
						}

					}
					break;

			}

			token = scanner.scan();

		}

		return symbols;
	};

	const buildTagCompletionData = (settings: Settings) => {
		if (!settingsChanged) {
			return;
		}

		mvtTagData = generateMvtTags(settings);
		mvtTagAndSnippetData = {
			...mvtSnippetData,
			...mvtTagData
		};

		mvtTagCompletions = CompletionList.create( parseCompletionFile( Object.values( mvtTagAndSnippetData ) ) );

		settingsChanged = false;
	};

	const mvtDocuments = getLanguageModelCache<MvtLanguageModel>( 10, 60, (document: TextDocument) => {
		const symbols = findDocumentSymbols( document );

		return {
			symbols,
			document
		};
	});
	const validationTests: ValidationRule[] = readJSONFile( path.resolve( __dirname, '..', 'data', 'mvt', 'validation.json' ) );

	// Variable to determine if settings have changed
	let settingsChanged = true;

	// MVT-specific completion data
	let mvtTagData: Record<string, TagData>;
	let mvtTagAndSnippetData: Record<string, TagData | TagSnippet>;
	let mvtTagCompletions: CompletionList;
	const entityCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( mvtEntityData ) ) );

	// Get lsk symbols
	_createLskSymbols(workspace.settings);

	return {

		onConfigurationChange () {
			settingsChanged = true;
		},

		doValidation( document: TextDocument, settings: Settings ) {

			const {document: mvtDocument} = mvtDocuments.get( document );

			// get full text of the document
			const text = mvtDocument.getText();

			// build diagnostics array
			return validationTests.reduce(( diagnostics: Diagnostic[], validation: ValidationRule ): any => {

				// validate configured setting to check - exit if not valid
				if ( validation.checkSetting != null && !_get( settings, validation.checkSetting ) ) {
					return diagnostics;
				}

				// create the pattern to match
				const pattern = new RegExp( validation.match, 'igm' );
				let match: RegExpExecArray;
				let count = 0;
				while ( (match = pattern.exec( text )) && count < 1000 ) {
					count++;
					diagnostics.push(
						{
							range: Range.create( mvtDocument.positionAt( match.index ), mvtDocument.positionAt( match.index + match[ validation.matchIndex ].length ) ),
							message: `[${ validation.problem.type.toLowerCase() }] - ${ tokenize( validation.problem.message, match ) }`,
							severity: DiagnosticSeverity[ validation.problem.type ],
							source: 'Miva IDE',
							data: validation.data,
							code: validation.code,
						}
					);
				}

				return diagnostics;

			}, []);

		},

		doCodeAction( document, codeActionRange, context ) {

			const actions: CodeAction[] = [];

			const {document: mvtDocument} = mvtDocuments.get( document );

			// Loop through diagnostics and do something
			for (let diagnostic of context?.diagnostics) {
				const diagnosticData: ValidationData = diagnostic.data;

				// If data exists then handle it
				if (diagnosticData) {

					// Get text from diagnostic range
					const range = diagnostic.range;
					const text = mvtDocument.getText(range);

					// Handle replacements
					if (diagnosticData.type === ValidationDataType.REPLACEMENT) {
						for (let replacement of diagnosticData?.replacements) {

							// Push action for each replacement
							actions.push({
								title: replacement.message,
								diagnostics: [diagnostic],
								isPreferred: replacement.isPreferred || false,
								edit: {
									changes: {
										[document.uri]: [
											{
												newText: replacement.text.replace( '$0', text ),
												range: range
											}
										]
									}
								},
								kind: CodeActionKind.QuickFix
							});
						}
					}
				}
			}

			return actions;
		},

		doCompletion( document: TextDocument, position: Position, settings: Settings ): CompletionList {

			buildTagCompletionData( settings );

			const {document: mvtDocument} = mvtDocuments.get( document );

			// determine left side text range
			const cursorPositionOffset = mvtDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - BOUNDARY_AMOUNT;
			const leftRange = Range.create(
				mvtDocument.positionAt( leftOffset ),
				position
			);
			const left = mvtDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + BOUNDARY_AMOUNT;
			const rightRange = Range.create(
				position,
				mvtDocument.positionAt( rightOffset )
			);
			const right = mvtDocument.getText( rightRange ) || '';

			// mvt:do tag value attribute completions
			if (
				patterns.MVT.LEFT_IN_MVTDO_TAG.test( left ) &&
				patterns.SHARED.RIGHT_IN_TAG.test( right ) &&
				patterns.SHARED.LEFT_IN_VALUE_ATTR.test( left )
			) {
				return doValueCompletions;
			}

			// document-specific entity completions
			if (
				patterns.MVT.LEFT_AFTER_AMP.test( left )
			) {
				return entityCompletions;
			}

			// After an entity (&mv**)
			if ( patterns.MVT.LEFT_AFTER_ENTITY_COLON.test( left ) ) {

				// get full text
				const mvtDocumentText = mvtDocument.getText();

				const variableMatches = left.match(patterns.MVT.LEFT_AFTER_ENTITY_COLON) || [];
				const _foundVariable = variableMatches[0] || '';
				const foundVariable = _foundVariable.slice(0, _foundVariable.lastIndexOf(':') + 1);
				const foundVariableRegex = new RegExp(`^${foundVariable.replace(/(?<=\[)[0-9]+(?=\])/g, '[0-9]+')}`);

				const foundVariables = [].concat(
					mvtDocumentText.match( patterns.SHARED.VARIABLES_LSETTINGS ) || [],
					mvtDocumentText.match( patterns.SHARED.VARIABLES_G )?.map(_variable => 'global:' + _variable) || [],
					mvtDocumentText.match( patterns.MVT.ENTITIES ) || [],
				)
					?.filter( unique )
					?.filter(_variable => foundVariableRegex.test(_variable))
					?.map(_variable => _variable.replace(foundVariableRegex, ''));

				return CompletionList.create(
					foundVariables.map((variable) => {
						return parseCompletion({
							"label": variable,
							"kind": "Variable",
							"detail": variable,
							"documentation": "",
							"commitCharacters": [],
							"insertText": `${ variable };`
						});
					})
				);

			}

			// tag-specific
			if ( patterns.MVT.LEFT_IN_MVT_TAG.test( left ) ) {

				// Determine which tag we are in
				const [, tagName] = safeMatch(left, patterns.MVT.LEFT_TAG_NAME);
				const tagNameLower = tagName?.toLowerCase();

				// Attempt to get tag from name
				const foundTag = mvtTagData[tagNameLower];
				if (foundTag) {
					const foundTagAttributes = foundTag.attributes;
					if (foundTagAttributes) {

						// Tag attribute value completions
						if (patterns.SHARED.LEFT_IN_ATTR.test( left )) {
							const [, attributeName] = safeMatch(left, patterns.SHARED.LEFT_ATTR_NAME);
							const attributeNameLower = attributeName?.toLowerCase();

							const foundAttribute = foundTag.attributes[attributeNameLower];
							if (foundAttribute) {
								switch (foundAttribute.valueType) {
									case 'variable':
										return getVariableCompletions(left, mvtDocument);
									default:
									case 'expression': {
										const variableCompletions = getVariableCompletions(left, mvtDocument);
										if (variableCompletions) {
											return variableCompletions;
										}

										return CompletionList.create([
											...operatorCompletions.items,
											...builtinFunctionCompletions.items
										]);
									}
									case 'function': {
										if (tagNameLower === 'item') {
											// Get item name
											const [,, itemName] = left.match(patterns.MVT.LEFT_ITEM_NAME) || right.match(patterns.MVT.RIGHT_ITEM_NAME) || [];
											const foundItem = mvtItemData[itemName];

											// Create completion list from params object
											if (foundItem && foundItem.params) {
												if (patterns.SHARED.LEFT_IN_FUNCTION.test( left )) {
													const variableCompletions = getVariableCompletions(left, mvtDocument);
													if (variableCompletions) {
														return variableCompletions;
													}
												}

												return CompletionList.create( parseCompletionFile( Object.values( foundItem.params ) ) );
											}
										}

										return null;
									}
									case 'string':
										return CompletionList.create( parseCompletionFile( Object.values( foundAttribute.values || {} ) ) );
								}
							}
						}

						// Tag attribute completions
						return CompletionList.create( parseCompletionFile( Object.values( foundTagAttributes ) ) );
					}
				}

				return null;
			}

			/**
			 * Used to determine if the tag starts with either <mvt: mvt: or < and removes that portion with an additionalTextEdit after completion
			 */
			const determineAdditionalTextEdits = (): TextEdit[] => {
				const foundMatch = [
					'<mvt:',
					'mvt:',
					'<'
				].find(match => left.endsWith(match));

				return foundMatch
					? [
						TextEdit.del(Range.create(
							mvtDocument.positionAt( cursorPositionOffset - foundMatch.length ),
							position
						))
					]
					: [];
			};

			// Define additional text edits and add them to the completions items via a map
			const additionalTextEdits = determineAdditionalTextEdits();

			return CompletionList.create([
				...additionalTextEdits.length > 0
					? mvtTagCompletions.items.map(mvtTagCompletion => {
						return {
							...mvtTagCompletion,
							additionalTextEdits
						};
					})
					: mvtTagCompletions.items,
				{
					label: '@@@LANGUAGESESRVICE@@@' // To be replaced by that language's native service result
				}
			]);
		},

		findDefinition( document: TextDocument, position: Position, settings: Settings ) {

			const {document: mvtDocument, symbols: documentSymbols} = mvtDocuments.get( document );

			const line = mvtDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character )?.toLowerCase();
			const variable = getVariableAtOffset( line, position.character )?.toLowerCase();
			const entity = getEntityAtOffset( line, position.character )?.toLowerCase();

			if (lskSymbols.length === 0) {
				_createLskSymbols(settings);
			}

			return [
				...workspaceSymbols,
				...lskSymbols,
				...documentSymbols
			]
				?.filter(( symbol ) => {
					const nameLower: string = symbol.name.toLowerCase();
					return nameLower === entity || nameLower === variable || nameLower === word;
				})
				?.map( symbol => symbol.location );
		},

		onHover ( document: TextDocument, position: Position, settings: Settings ) {

			buildTagCompletionData( settings );

			if (lskSymbols.length === 0) {
				_createLskSymbols(workspace.settings);
			}

			const {document: mvtDocument, symbols: documentSymbols} = mvtDocuments.get( document );

			// Get word
			const line = mvtDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character );

			// Exit if word is null
			if (!word) {
				return null;
			}

			// Get lowercase version of word
			const wordLower = word.toLowerCase();

			// determine left side text range
			const cursorPositionOffset = mvtDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - BOUNDARY_AMOUNT;
			const leftRange = Range.create(
				mvtDocument.positionAt( leftOffset ),
				position
			);
			const left = mvtDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + BOUNDARY_AMOUNT;
			const rightRange = Range.create(
				position,
				mvtDocument.positionAt( rightOffset )
			);
			const right = mvtDocument.getText( rightRange ) || '';

			// Check for various hover scenarios

			// System variable hover
			if (patterns.SHARED.LEFT_VARIABLE_S.test(left)) {
				const foundSystemVariable = systemVariableData[wordLower];
				if (foundSystemVariable) {
					return {
						contents: foundSystemVariable.documentation
					};
				}
			}

			// Tag name hover
			if (patterns.MVT.LEFT_IN_MVT_TAG.test(left)) {
				// Determine which tag we are in
				const [, tagName] = safeMatch(left, patterns.MVT.LEFT_TAG_NAME);
				const tagNameLower = tagName?.toLowerCase();

				// Attempt to get tag from name
				const foundTagRegex = mvtTagData[tagNameLower];

				// Do stuff with found tag (via regex)
				if (foundTagRegex) {

					// Item functions
					if (tagNameLower === 'item') {
						// Get item name
						const [,, itemName] = left.match(patterns.MVT.LEFT_ITEM_NAME) || right.match(patterns.MVT.RIGHT_ITEM_NAME) || [];
						const foundItem = mvtItemData[itemName];

						// Get matching param
						if (foundItem) {
							const foundParam = foundItem?.params[wordLower];
							if (foundParam) {
								return {
									contents: formatItemParamDocumentation(foundItem, foundParam)
								};
							}
						}
					}

					// Do functions
					if (tagNameLower === 'do') {
						// Get item name
						const [,, doFile] = left.match(patterns.SHARED.LEFT_DO_FILE) || right.match(patterns.SHARED.RIGHT_DO_FILE) || [];
						const key = `${doFile}@${word}`;

						const foundDoHover = doValueHoverMap.get(key);
						if (foundDoHover) {
							return {
								contents: foundDoHover
							};
						}
					}

					// Function Hover
					if (patterns.SHARED.RIGHT_IS_OPEN_PAREN.test(right)) {

						// Builtin function lookup
						const foundBuiltinHover = builtinFunctionHoverMap.get(wordLower);
						if (foundBuiltinHover) {
							return {
								contents: foundBuiltinHover
							};
						}
					}

					// Find attribute data on found tag name
					const foundAttributes = foundTagRegex.attributes;
					if (foundAttributes) {
						// Find attribute data with word
						const foundAttribute = foundAttributes[wordLower];

						// Return hover for attribute if found
						if (foundAttribute) {
							return {
								contents: formatTagAttributeDocumentation(foundTagRegex, foundAttribute)
							};
						}

						// Return hover for attribute value if found
						if (patterns.SHARED.LEFT_IN_ATTR.test(left)) {
							// Find attribute data with word
							const [, attributeName] = safeMatch(left, patterns.SHARED.LEFT_ATTR_NAME);
							const foundAttribute = foundAttributes[attributeName];
							const foundAttributeValue = foundAttribute?.values?.[wordLower];

							if (foundAttributeValue && foundAttributeValue.documentation) {
								return {
									contents: formatTagAttributeValueDocumentation(foundTagRegex, foundAttribute, foundAttributeValue)
								};
							}

							// Operator lookup
							const foundOperator = mvOperatorData[wordLower];
							if (foundOperator) {
								return {
									contents: formatGenericDocumentation(foundOperator)
								};
							}
						}
					}
				}

				// Do stuff with found tag (via word)
				const foundTag = mvtTagData[wordLower];
				if (foundTag) {
					return {
						contents: formatTagDocumentation(foundTag)
					};
				}
			}

			// Entity Encoding hover
			if (patterns.MVT.LEFT_AFTER_AMP_HOVER.test(left)) {
				const foundEntity = mvtEntityData[wordLower];
				if (foundEntity) {
					return {
						contents: formatGenericDocumentation(foundEntity)
					};
				}
			}

			// Variable / Entity Symbol Hover Documentation
			const symbols = [].concat( lskSymbols, documentSymbols );
			const variable = getVariableAtOffset( line, position.character )?.toLowerCase();
			const entity = getEntityAtOffset( line, position.character )?.toLowerCase();
			let symbolDocumentation = '';

			for (let symbol of symbols) {
				const nameLower = symbol.name.toLowerCase();
				const trimmedValue = symbol?.documentation?.value?.trim();

				// Show variable hover docs
				if (trimmedValue?.length > 0 && symbol.kind === SymbolKind.Variable && (nameLower === entity || nameLower === variable || nameLower === word)) {
					symbolDocumentation += symbol.documentation.value + '\n---\n';
				}
			}

			if (symbolDocumentation.length > 0) {
				return {
					contents: {
						kind: 'markdown',
						value: symbolDocumentation
					}
				};
			}

			return {
				contents: '@@@LANGUAGESESRVICE@@@'
			};

		},

		findDocumentSymbols ( document: TextDocument ) {
			const {symbols} = mvtDocuments.get( document );

			return symbols;
		}

	};

}

export function getMVTFeatures(mvtFeatures: LanguageFeatures): LanguageFeatures {
	return {
		...mvtFeatures,
		doCompletion(document: TextDocument, position: Position, settings: Settings): CompletionList {
			const completionList = mvtFeatures.doCompletion(document, position, settings);

			return CompletionList.create(completionList.items.flatMap(completionItem => {
				if (completionItem.label === '@@@LANGUAGESESRVICE@@@') {
					return htmlLanguageService.doComplete(document, position, htmlLanguageService.parseHTMLDocument(document))?.items || [];
				}

				return completionItem;
			}))
		},
		onHover(document: TextDocument, position: Position) {
			const hover = mvtFeatures.onHover(document, position);

			if (hover?.contents === '@@@LANGUAGESESRVICE@@@') {
				return htmlLanguageService.doHover(document, position, htmlLanguageService.parseHTMLDocument(document));
			}

			return hover;
		}
	}
};

export function getMVTCSSFeatures(mvtFeatures: LanguageFeatures): LanguageFeatures {
	const cssLanguageService = getCSSLanguageService();

	return {
		...mvtFeatures,
		doCompletion(document: TextDocument, position: Position, settings: Settings): CompletionList {
			const completionList = mvtFeatures.doCompletion(document, position, settings);

			return CompletionList.create(completionList.items.flatMap(completionItem => {
				if (completionItem.label === '@@@LANGUAGESESRVICE@@@') {
					return cssLanguageService.doComplete(document, position, cssLanguageService.parseStylesheet(document))?.items || [];
				}

				return completionItem;
			}));
		},
		onHover(document: TextDocument, position: Position) {
			const hover = mvtFeatures.onHover(document, position);

			if (hover?.contents === '@@@LANGUAGESESRVICE@@@') {
				return cssLanguageService.doHover(document, position, cssLanguageService.parseStylesheet(document));
			}

			return hover;
		}
	}
}

// ======================================================================================================================== //

function _getMvDocumentSymbolsByUri (uri) {
	const pattern = `${ uri.replace( 'file://', '' ) }${ path.sep }**${ path.sep }*.mv`;
	const files = glob.sync(pattern);

	return files.reduce((output, file) => {

		let fileContents = readFileSync( file ).toString();
		const {symbols} = mvDocuments.get( TextDocument.create( file, 'mv', 1, fileContents ) );

		return output.concat( symbols );

	}, []);
}

function _mvFindDocumentSymbols( document: TextDocument ): SymbolInformationWithDocumentation[] {

	const symbols: SymbolInformationWithDocumentation[] = [];

	const scanner = htmlLanguageService.createScanner( document.getText(), 0 );
	let token = scanner.scan();
	let lastTagName: string | undefined = undefined;
	let originalLastTagName: string | undefined = undefined;
	let lastAttributeName: string | undefined = undefined;
	let originalLastAttributeName: string | undefined = undefined;

	while ( token !== TokenType.EOS ) {

		switch ( token ) {

			case TokenType.StartTag:
				originalLastTagName = scanner.getTokenText();
				lastTagName = originalLastTagName.toLowerCase();
				break;

			case TokenType.AttributeName:
				originalLastAttributeName = scanner.getTokenText();
				lastAttributeName = originalLastAttributeName.toLowerCase();
				break;

			case TokenType.AttributeValue:

				const name = scanner.getTokenText().replace( /"/g, '' );

				if (name) {
					const pathInfo = path.parse(document.uri);

					const range = Range.create(
						document.positionAt( scanner.getTokenOffset() + 1 ),
						document.positionAt( scanner.getTokenOffset() + scanner.getTokenLength() - 1 )
					);

					if ( (lastTagName === 'mvassign' || lastTagName === 'mvassignarray') && lastAttributeName === 'name' ) {

						symbols.push({
							documentation: {
								kind: 'markdown',
								value: [
									'',
									`Defined in [${pathInfo.base}](${document.uri}#L${range.start.line + 1},${range.start.character + 1}) on Ln ${range.start.line + 1}, Col ${range.start.character + 1}`,
									'',
									'```mv',
									lastTagName === 'mvassign'
										? `<${originalLastTagName} ${originalLastAttributeName} = "${name}" />`
										: `<${originalLastTagName} ${originalLastAttributeName} = "${name}">\n\t...\n</${originalLastTagName}>`,
									'```',
									''
								].join('\n')
							},
							kind: SymbolKind.Variable,
							name,
							location: Location.create(
								document.uri,
								range
							)
						});

					}
					else if ( lastTagName === 'mvfunction' && lastAttributeName === 'name' ) {

						symbols.push({
							documentation: {
								kind: 'markdown',
								value: ''
							},
							kind: SymbolKind.Function,
							name,
							location: Location.create(
								document.uri,
								range
							)
						});

					}
				}

				break;

		}

		token = scanner.scan();

	}

	return symbols;

}

function _createLskSymbols (settings) {
	const lskPath = _get(settings, 'LSK.path');
	if (lskPath) {
		const resolvedLskPath = path.resolve(lskPath).replace(new RegExp(`${path.sep}$`), '');
		if (existsSync(lskPath)) {
			lskSymbols = _getMvDocumentSymbolsByUri(resolvedLskPath);
		}
	}
}

export function getMVFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	_createLskSymbols(workspace.settings);

	workspace.folders.forEach(( folder ) => {
		workspaceSymbols = workspaceSymbols.concat( _getMvDocumentSymbolsByUri(folder.uri) );
	});

	// MV-specific completion data
	const mvTagCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( { ...mvSnippetData, ...filterTagData(mvTagData, ([, tagData]) => !tagData.parent) } ) ) );

	return {

		doCompletion( document: TextDocument, position: Position ): CompletionList {

			const {document: mvDocument} = mvDocuments.get( document );

			// determine left side text range
			const cursorPositionOffset = mvDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - BOUNDARY_AMOUNT;
			const leftRange = Range.create(
				mvDocument.positionAt( leftOffset ),
				position
			);
			const left = mvDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + BOUNDARY_AMOUNT;
			const rightRange = Range.create(
				position,
				mvDocument.positionAt( rightOffset )
			);
			const right = mvDocument.getText( rightRange ) || '';

			// MvDO tag value attribute completions
			if (
				patterns.MV.LEFT_IN_MVDO_TAG.test( left ) &&
				patterns.SHARED.RIGHT_IN_TAG.test( right ) &&
				patterns.SHARED.LEFT_IN_VALUE_ATTR.test( left )
			) {
				return doValueCompletions;
			}

			// If in an expression `{ ... }`
			if (
				patterns.MV.LEFT_IN_EXPRESSION.test(left) &&
				patterns.MV.RIGHT_IN_EXPRESSION.test(right)
			) {

				// If after `[].` notation
				if (patterns.MV.LEFT_AFTER_BRACKET_DOT.test( left )) {
					return doValueCompletions;
				}

				const variableCompletions = getVariableCompletions(left, mvDocument);
				if (variableCompletions) {
					return variableCompletions;
				}

				return CompletionList.create([
					...operatorCompletions.items,
					...builtinFunctionCompletions.items
				]);

			}

			// tag-specific
			if ( patterns.MV.LEFT_IN_MV_TAG.test( left ) ) {

				// Determine which tag we are in
				let tagName = void 0;
				const [, mvTagName, mivaTagName] = safeMatch(left, patterns.MV.LEFT_TAG_NAME);
				tagName = mvTagName || mivaTagName;
				const tagNameLower = tagName?.toLowerCase();

				const foundTag = mvTagData[tagNameLower];
				if (foundTag) {
					const foundTagAttributes = foundTag.attributes;
					if (foundTagAttributes) {

						// Tag attribute value completions
						if (patterns.SHARED.LEFT_IN_ATTR.test(left)) {
							const [, attributeName] = safeMatch(left, patterns.SHARED.LEFT_ATTR_NAME);
							const attributeNameLower = attributeName?.toLowerCase();

							const foundAttribute = foundTag.attributes[attributeNameLower];
							if (foundAttribute) {
								switch (foundAttribute.valueType) {
									default:
									case 'literal':
									case 'expression': {
										if (patterns.MV.LEFT_IN_EXPRESSION.test(left)) {
											const variableCompletions = getVariableCompletions(left, mvDocument);
											if (variableCompletions) {
												return variableCompletions;
											}

											return builtinFunctionCompletions;
										}

										return getVariableCompletions(left, mvDocument);
									}
									case 'string':
										return CompletionList.create( parseCompletionFile( Object.values( foundAttribute.values || {} ) ) );
								}
							}
						}

						// Tag attribute completions
						return CompletionList.create( parseCompletionFile( Object.values( foundTagAttributes ) ) );
					}
				}

				return null;
			}

			// Determine if child tags exist and only complete those if inside a parent tag
			const parsedDocument = htmlLanguageService.parseHTMLDocument(document);
			const currentNode = getNodeAtOffset(cursorPositionOffset, parsedDocument);
			const currentTagLower = currentNode?.tag?.toLowerCase();

			if (currentTagLower) {
				const foundTag = mvTagData[currentTagLower];

				if (foundTag?.children?.length > 0) {
					return CompletionList.create(
						parseCompletionFile( Object.values( foundTag?.children?.map(childTagNameLower => mvTagData[childTagNameLower]) ) )
					);
				}
			}

			/**
			 * Used to determine if the tag starts with either <mvt: mvt: or < and removes that portion with an additionalTextEdit after completion
			 */
			const determineAdditionalTextEdits = (): TextEdit[] => {
				const foundMatch = [
					'<'
				].find(match => left.endsWith(match));

				return foundMatch
					? [
						TextEdit.del(Range.create(
							mvDocument.positionAt( cursorPositionOffset - foundMatch.length ),
							position
						))
					]
					: [];
			};

			// Define additional text edits and add them to the completions items via a map
			const additionalTextEdits = determineAdditionalTextEdits();

			return CompletionList.create([
				...additionalTextEdits.length > 0
					? mvTagCompletions.items.map(mvtTagCompletion => {
						return {
							...mvtTagCompletion,
							additionalTextEdits
						};
					})
					: mvTagCompletions.items,
				...htmlLanguageService.doComplete(document, position, parsedDocument)?.items || []
			]);
		},

		findDocumentSymbols( document: TextDocument ): SymbolInformationWithDocumentation[] {
			const {symbols} = mvDocuments.get( document )

			return symbols;

		},

		findDefinition( document: TextDocument, position: Position, settings: Settings ): Definition | null {

			const {document: mvDocument, symbols: documentSymbols} = mvDocuments.get( document );

			// Get word
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character )?.toLowerCase();
			const variable = getVariableAtOffset( line, position.character )?.toLowerCase();

			if (lskSymbols.length === 0) {
				_createLskSymbols(settings);
			}

			return [
				...workspaceSymbols,
				...lskSymbols,
				...documentSymbols
			]
				?.filter(( symbol ) => {
					const nameLower: string = symbol.name.toLowerCase();
					return nameLower === variable || nameLower === word;
				})
				?.map( symbol => symbol.location );

		},

		onHover (document: TextDocument, position: Position ): Hover | null {

			const {document: mvDocument, symbols: documentSymbols} = mvDocuments.get( document );

			// Get word
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character );

			// Exit if word is null
			if (!word) {
				return null;
			}

			// Get lowercase version of word
			const wordLower = word.toLowerCase();

			// determine left side text range
			const cursorPositionOffset = mvDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - BOUNDARY_AMOUNT;
			const leftRange = Range.create(
				mvDocument.positionAt( leftOffset ),
				position
			);
			const left = mvDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + BOUNDARY_AMOUNT;
			const rightRange = Range.create(
				position,
				mvDocument.positionAt( rightOffset )
			);
			const right = mvDocument.getText( rightRange ) || '';

			// Check for various hover scenarios

			// If in an expression `{ ... }`
			if (
				patterns.MV.LEFT_IN_EXPRESSION.test(left) &&
				patterns.MV.RIGHT_IN_EXPRESSION.test(right)
			) {

				// If after `[].` notation
				if (patterns.MV.LEFT_AFTER_BRACKET_DOT.test( left )) {
					const [, doFile] = safeMatch(left, patterns.MV.LEFT_DO_FILE_BRACKET_DOT);
					const key = `${doFile?.trim()}@${word}`;

					const foundDoHover = doValueHoverMap.get(key);
					if (foundDoHover) {
						return {
							contents: foundDoHover
						};
					}
				}

				// Function Hover
				if (patterns.SHARED.RIGHT_IS_OPEN_PAREN.test(right)) {

					// Builtin function lookup
					const foundBuiltinHover = builtinFunctionHoverMap.get(wordLower);
					if (foundBuiltinHover) {
						return {
							contents: foundBuiltinHover
						};
					}
				}

				// System variable hover
				if (patterns.SHARED.LEFT_VARIABLE_S.test(left)) {
					const foundSystemVariable = systemVariableData[wordLower];
					if (foundSystemVariable) {
						return {
							contents: foundSystemVariable.documentation
						};
					}
				}

				// Operator lookup
				const foundOperator = mvOperatorData[wordLower];
				if (foundOperator) {
					return {
						contents: formatGenericDocumentation(foundOperator)
					};
				}
			}

			// Tag name hover
			if (patterns.MV.LEFT_IN_MV_TAG.test( left )) {
				// Determine which tag we are in
				const [, tagName] = safeMatch(left, patterns.MV.LEFT_TAG_NAME);
				const tagNameLower = tagName?.toLowerCase();

				// Attempt to get tag from name
				const foundTagRegex = mvTagData[tagNameLower];

				// Do stuff with found tag (via regex)
				if (foundTagRegex) {

					// Do functions
					if (tagNameLower === 'mvdo') {
						// Get item name
						const [,, doFile] = left.match(patterns.SHARED.LEFT_DO_FILE) || right.match(patterns.SHARED.RIGHT_DO_FILE) || [];
						const doFileNoExpression = doFile
							.replace(/[\{\}]/g, '')
							.trim();

						const key = `${doFileNoExpression}@${word}`;

						const foundDoHover = doValueHoverMap.get(key);
						if (foundDoHover) {
							return {
								contents: foundDoHover
							};
						}
					}

					// Find attribute data on found tag name
					const foundAttributes = foundTagRegex.attributes;
					if (foundAttributes) {
						// Find attribute data with word
						const foundAttribute = foundAttributes[wordLower];

						// Return hover for attribute if found
						if (foundAttribute) {
							return {
								contents: formatTagAttributeDocumentation(foundTagRegex, foundAttribute)
							};
						}

						// Return hover for attribute value if found
						if (patterns.SHARED.LEFT_IN_ATTR.test(left)) {
							// Find attribute data with word
							const [, attributeName] = safeMatch(left, patterns.SHARED.LEFT_ATTR_NAME);
							const foundAttribute = foundAttributes[attributeName];
							const foundAttributeValue = foundAttribute?.values?.[wordLower];

							if (foundAttributeValue && foundAttributeValue.documentation) {
								return {
									contents: formatTagAttributeValueDocumentation(foundTagRegex, foundAttribute, foundAttributeValue)
								};
							}
						}
					}
				}
			}

			// Do stuff with found tag (via word)
			const foundTag = mvTagData[wordLower];
			if (foundTag) {
				return {
					contents: formatTagDocumentation(foundTag)
				};
			}

			// Variable / Symbol Hover Documentation
			const symbols = [].concat( lskSymbols, documentSymbols );
			const variable = getVariableAtOffset( line, position.character )?.toLowerCase();
			let symbolDocumentation = '';

			for (let symbol of symbols) {
				const nameLower = symbol.name.toLowerCase();
				const trimmedValue = symbol?.documentation?.value?.trim();

				// Show variable hover docs
				if (trimmedValue?.length > 0 && symbol.kind === SymbolKind.Variable && (nameLower === variable || nameLower === word)) {
					symbolDocumentation += trimmedValue + '\n---\n';
				}
			}

			if (symbolDocumentation.length > 0) {
				return {
					contents: {
						kind: 'markdown',
						value: symbolDocumentation
					}
				};
			}

			return htmlLanguageService.doHover(document, position, htmlLanguageService.parseHTMLDocument(document));

		}

	};

}