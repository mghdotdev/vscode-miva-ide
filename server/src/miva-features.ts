import { existsSync, readFileSync } from 'fs';
import { glob } from 'glob';
import _get from 'lodash.get';
import * as path from 'path';
import {
	TokenType,
	getLanguageService,
	newHTMLDataProvider
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
	SymbolInformation,
	SymbolKind
} from 'vscode-languageserver/node';
import systemVariableData from './mv/system-variables';
import mvtEntityData from './mvt/entities';
import mvtItemData from './mvt/items';
import mvtTagData from './mvt/tags';
import {
	formatItemParamDocumentation,
	formatTagAttributeDocumentation,
	formatTagAttributeValueDocumentation,
	formatTagDocumentation,
	getDoValueCompletions,
	getEntityAtOffset,
	getHoverMapFromCompletionFile,
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
	MvtLanguageModel,
	Settings,
	SymbolInformationWithDocumentation,
	ValidationData,
	ValidationDataType,
	ValidationRule,
	Workspace
} from './util/interfaces';
import { getLanguageModelCache } from './util/language-model-cache';
import patterns from './util/patterns';

// Define HTML Language Service helper
const htmlLanguageService = getLanguageService({
	customDataProviders: [
		newHTMLDataProvider('mvt', {
				version: 1,
				tags: [
					{
						attributes: [],
						void: true,
						name: 'mvt:else',
					},
					{
						attributes: [
							{
								name: 'expr'
							}
						],
						void: true,
						name: 'mvt:elseif',
					}
				]
			}
		)
	]
});

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

// Document cache for Miva Script (this is globally defined since we use .mv documents in MVT for LSK lookups)
const mvDocuments = getLanguageModelCache<TextDocument>( 500, 60, document => document );

// Symbol (variable, LSK function) containers
let workspaceSymbols: any[] = [];
let lskSymbols: any[] = [];

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

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

	const mvtDocuments = getLanguageModelCache<MvtLanguageModel>( 10, 60, (document: TextDocument) => {
		const symbols = findDocumentSymbols( document );

		return {
			symbols,
			document
		};
	});
	const validationTests: ValidationRule[] = readJSONFile( path.resolve( __dirname, '..', 'data', 'mvt', 'validation.json' ) );

	// MVT-specific completion data
	const mvtTagCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( mvtTagData ) ) );
	const entityCompletions: CompletionList = CompletionList.create( parseCompletionFile( Object.values( mvtEntityData ) ) );

	// Helper function for "variable" completion target list
	const getVariableCompletions = (left: string, mvtDocument: TextDocument): CompletionList | null => {
		// system variables
		if ( patterns.SHARED.LEFT_VARIABLE_S.test( left ) ) {
			return systemVariableCompletions;
		}

		// get full text
		const mvtDocumentText = mvtDocument.getText();

		// global variables
		if ( patterns.SHARED.LEFT_VARIABLE_G.test( left ) ) {

			const variableMatches = left.match(patterns.SHARED.LEFT_VARIABLE_G) || [];
			const _foundVariable = variableMatches[0] || '';
			const foundVariable = _foundVariable.slice(0, _foundVariable.lastIndexOf(':') + 1);
			const foundVariableRegex = new RegExp(`^${foundVariable.replace(/(?<=\[)[0-9]+(?=\])/g, '[0-9]+')}`);

			const foundVariables = [].concat(
				mvtDocumentText.match( patterns.SHARED.VARIABLES_G ) || [],
				mvtDocumentText.match( patterns.MVT.ENTITIES_G ) || []
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
				mvtDocumentText.match( patterns.SHARED.VARIABLES_L ) || [],
				foundVariable.startsWith('settings')
					? (mvtDocumentText.match( patterns.SHARED.VARIABLES_LSETTINGS ) || []).map(_variable => 'settings:' + _variable)
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

	return {

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

		doCompletion( document: TextDocument, position: Position ): CompletionList {

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

				// Attempt to get tag from name
				const foundTag = mvtTagData[tagName];
				if (foundTag) {
					const foundTagAttributes = foundTag.attributes;
					if (foundTagAttributes) {

						// Tag attribute value completions
						if (patterns.MVT.LEFT_IN_ATTR.test( left )) {
							const [, attributeName] = safeMatch(left, patterns.MVT.LEFT_ATTR_NAME);

							const foundAttribute = foundTag.attributes[attributeName];
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

										return builtinFunctionCompletions;
									}
									case 'function': {
										if (tagName === 'item') {
											// Get item name
											const [,, itemName] = left.match(patterns.MVT.LEFT_ITEM_NAME) || right.match(patterns.MVT.RIGHT_ITEM_NAME) || [];
											const foundItem = mvtItemData[itemName];

											// Create completion list from params object
											if (foundItem && foundItem.params) {
												return CompletionList.create( parseCompletionFile( Object.values( foundItem.params ) ) );
											}
										}

										return null;
									}
									case 'string':
										return CompletionList.create( parseCompletionFile( Object.values( foundAttribute.values ) ) );
								}
							}
						}

						// Tag attribute completions
						return CompletionList.create( parseCompletionFile( Object.values( foundTagAttributes ) ) );
					}
				}

				return null;

				/*

				return builtinFunctionCompletions; */

			}

			return CompletionList.create([
				...mvtTagCompletions.items,
				...htmlLanguageService.doComplete(document, position, htmlLanguageService.parseHTMLDocument(document))?.items || []
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

		onHover ( document: TextDocument, position: Position ) {

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

				// Attempt to get tag from name
				const foundTagRegex = mvtTagData[tagName];

				// Do stuff with found tag (via regex)
				if (foundTagRegex) {

					// Item functions
					if (tagName === 'item') {
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
					if (tagName === 'do') {
						// Get item name
						const [,, doFile] = left.match(patterns.MVT.LEFT_DO_FILE) || right.match(patterns.MVT.RIGHT_DO_FILE) || [];
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
						if (patterns.MVT.LEFT_IN_ATTR.test(left)) {
							// Find attribute data with word
							const [, attributeName] = safeMatch(left, patterns.MVT.LEFT_ATTR_NAME);
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
						contents: foundEntity.documentation
					};
				}
			}

			// Variable / Entity Symbol Hover Documentation
			const variable = getVariableAtOffset( line, position.character )?.toLowerCase();
			const entity = getEntityAtOffset( line, position.character )?.toLowerCase();
			let symbolDocumentation = '';

			for (let symbol of documentSymbols) {
				const nameLower = symbol.name.toLowerCase();

				// Show variable hover docs
				if (symbol.kind === SymbolKind.Variable && nameLower === entity || nameLower === variable || nameLower === word) {
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

			return htmlLanguageService.doHover(document, position, htmlLanguageService.parseHTMLDocument(document));

		},

		onDocumentLinks ( document: TextDocument ) {
			return [];
		},

		findDocumentSymbols ( document: TextDocument ) {
			const {symbols} = mvtDocuments.get( document );

			return symbols;
		}

	};

}

// ======================================================================================================================== //

function _getMvDocumentSymbolsByUri (uri) {
	const pattern = `${ uri.replace( 'file://', '' ) }${ path.sep }**${ path.sep }*.mv`;
	const files = glob.sync(pattern);

	return files.reduce((output, file) => {

		let fileContents = readFileSync( file ).toString();
		let document = mvDocuments.get( TextDocument.create( file, 'mv', 1, fileContents ) );

		return output.concat( _mvFindDocumentSymbols( document ) );

	}, []);
}

function _mvFindDocumentSymbols( document: TextDocument ): SymbolInformation[] {

	const symbols: SymbolInformation[] = [];

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
				if ( (lastTagName === 'mvassign' || lastTagName === 'mvassignarray') && lastAttributeName === 'name' ) {

					symbols.push({
						kind: SymbolKind.Variable,
						name: scanner.getTokenText().replace( /"/g, '' ),
						location: Location.create(
							document.uri,
							Range.create(
								document.positionAt( scanner.getTokenOffset() + 1 ),
								document.positionAt( scanner.getTokenOffset() + scanner.getTokenLength() - 1 )
							)
						)
					});

				}
				else if ( lastTagName === 'mvfunction' && lastAttributeName === 'name' ) {

					symbols.push({
						kind: SymbolKind.Function,
						name: scanner.getTokenText().replace( /"/g, '' ),
						location: Location.create(
							document.uri,
							Range.create(
								document.positionAt( scanner.getTokenOffset() + 1 ),
								document.positionAt( scanner.getTokenOffset() + scanner.getTokenLength() - 1 )
							)
						)
					});

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
			lskSymbols = lskSymbols.concat( _getMvDocumentSymbolsByUri(resolvedLskPath) );
		}
	}
}

export function getMVFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	_createLskSymbols(workspace.settings);

	workspace.folders.forEach(( folder ) => {
		workspaceSymbols = workspaceSymbols.concat( _getMvDocumentSymbolsByUri(folder.uri) );
	});

	return {

		doCompletion( document: TextDocument, position: Position ): CompletionList {

			const mvDocument = mvDocuments.get( document );

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
				if (
					patterns.MV.LEFT_AFTER_BRACKET_DOT.test( left )
				) {
					return doValueCompletions;
				}

				return builtinFunctionCompletions;

			}

			return null;

		},

		findDocumentSymbols( document: TextDocument ): SymbolInformation[] {

			return _mvFindDocumentSymbols( mvDocuments.get( document ) );

		},

		findDefinition( document: TextDocument, position: Position, settings: Settings ): Definition | null {

			const mvDocument = mvDocuments.get( document );

			// Get word
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character );

			if (lskSymbols.length === 0) {
				_createLskSymbols(settings);
			}

			const symbols = [
				...workspaceSymbols,
				...lskSymbols
			].filter(( symbol ) => {
				return ( symbol.name === word );
			});

			if ( symbols ) {

				return symbols.map( symbol => symbol.location );

			}

			return null;

		},

		onHover (document: TextDocument, position: Position ): Hover | null {

			const mvDocument = mvDocuments.get( document );

			// Get word
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, MAX_LINE_LENGTH ) );
			const word = getWordAtOffset( line, position.character );

			// Exit if word is null
			if (!word) {
				return null;
			}

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

			// Function Hover
			if (patterns.SHARED.RIGHT_IS_OPEN_PAREN.test(right)) {
				// Builtin function lookup
				const foundHoverSymbol = builtinFunctionHoverMap.get(word);
				if (foundHoverSymbol) {
					return {
						contents: foundHoverSymbol
					};
				}
			}

			return null;

		}

	};

}