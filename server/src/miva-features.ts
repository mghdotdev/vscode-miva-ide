import {
	Workspace,
	Settings,
	LanguageFeatures,
	ValidationRule
} from './util/interfaces';
import {
	Diagnostic,
	Range,
	DiagnosticSeverity,
	Position,
	CompletionList,
	CompletionItem,
	Definition,
	SymbolInformation,
	SymbolKind,
	Location,
	ClientCapabilities,
	Hover,
	MarkupContent
} from 'vscode-languageserver/node';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import {
	readJSONFile,
	tokenize,
	getDoValueCompletions,
	getBuiltinFunctionCompletions,
	getBuiltinFunctionHoverSymbols,
	parseCompletionFile,
	parseCompletion,
	getWordAtOffset,
	unique
} from './util/functions';
import patterns from './util/patterns';
import * as path from 'path';
import _get from 'lodash.get';
import {
	getLanguageService,
	TokenType
} from 'vscode-html-languageservice';
import { getLanguageModelCache } from './util/language-model-cache';
import {glob} from 'glob';
import { readFileSync, existsSync } from 'fs';

const htmlLanguageService = getLanguageService();

const boundryAmount = 200;
const maxLineLength = 9999;
const merchantFunctionFiles = readJSONFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) );
const doValueCompletions: CompletionList = getDoValueCompletions( merchantFunctionFiles );
const builtinFunctionsData = readJSONFile( path.resolve( __dirname, '..', 'data', 'builtin-functions.json' ) );
const builtinFunctionCompletions: CompletionList = getBuiltinFunctionCompletions( builtinFunctionsData );
const builtinFunctionHoverSymbols: Map<string, MarkupContent> = getBuiltinFunctionHoverSymbols( builtinFunctionsData );
const mvDocuments = getLanguageModelCache<TextDocument>( 500, 60, document => document );
let workspaceSymbols: any[] = [];
let lskSymbols: any[] = [];

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	const mvtDocuments = getLanguageModelCache<TextDocument>( 10, 60, document => document );
	const validationTests: ValidationRule[] = readJSONFile( path.resolve( __dirname, '..', 'data', 'mvt', 'validation.json' ) );
	const entityCompletions: CompletionItem[] = parseCompletionFile( readJSONFile( path.resolve( __dirname, '..', 'data', 'mvt', 'entity-completions.json' ) ) );
	const variableSCompletions: CompletionItem[] = parseCompletionFile( readJSONFile( path.resolve( __dirname, '..', 'data', 'mvt', 'variable-s-completions.json' ) ) );

	return {

		doValidation( document: TextDocument, settings: Settings ): Diagnostic[] {

			const mvtDocument = mvtDocuments.get( document );

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
							source: 'Miva IDE'
						}
					);
				}

				return diagnostics;

			}, []);;

		},

		doCompletion( document: TextDocument, position: Position ): CompletionList {

			const mvtDocument = mvtDocuments.get( document );

			// determine left side text range
			const cursorPositionOffset = mvtDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				mvtDocument.positionAt( leftOffset ),
				position
			);
			const left = mvtDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
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

			// document-specific
			if (
				patterns.MVT.LEFT_AFTER_AMP.test( left )
			) {
				return CompletionList.create( entityCompletions );
			}

			if ( patterns.MVT.LEFT_AFTER_ENTITY_COLON.test( left ) ) {

				// get full text
				const mvtDocumentText = mvtDocument.getText();

				const foundVariables = [].concat( mvtDocumentText.match( patterns.SHARED.VARIABLES_LSETTINGS ) || [], mvtDocumentText.match( patterns.MVT.ENTITIES_LSETTINGS ) || [] );

					return CompletionList.create(
						foundVariables.filter( unique ).map((variable) => {
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

				// system variables
				if ( patterns.SHARED.LEFT_VARIABLE_S.test( left ) ) {
					return CompletionList.create( variableSCompletions );
				}

				// get full text
				const mvtDocumentText = mvtDocument.getText();

				// global variables
				if ( patterns.SHARED.LEFT_VARIABLE_G.test( left ) ) {

					const foundVariables = [].concat( mvtDocumentText.match( patterns.SHARED.VARIABLES_G ) || [], mvtDocumentText.match( patterns.MVT.ENTITIES_G ) || [] );

					return CompletionList.create(
						foundVariables.filter( unique ).map((variable) => {
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

				// l.settings variables
				if ( patterns.SHARED.LEFT_VARIABLE_LSETTINGS.test( left ) ) {

					const foundVariables = [].concat( mvtDocumentText.match( patterns.SHARED.VARIABLES_LSETTINGS ) || [], mvtDocumentText.match( patterns.MVT.ENTITIES_LSETTINGS ) || [] );

					return CompletionList.create(
						foundVariables.filter( unique ).map((variable) => {
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

					const foundVariables = mvtDocumentText.match( patterns.SHARED.VARIABLES_L ) || [];

					return CompletionList.create(
						foundVariables.filter( unique ).map((variable) => {
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

				return builtinFunctionCompletions;

			}

			return undefined;

		},

		findDefinition( document: TextDocument, position: Position, settings: Settings ): Definition | null {

			const mvtDocument = mvtDocuments.get( document );

			const line = mvtDocument.getText( Range.create( position.line, 0, position.line, maxLineLength ) );
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

			const mvtDocument = mvtDocuments.get( document );

			// Get word
			const line = mvtDocument.getText( Range.create( position.line, 0, position.line, maxLineLength ) );
			const word = getWordAtOffset( line, position.character );

			// Exit if word is null
			if (!word) {
				return null;
			}

			// determine left side text range
			const cursorPositionOffset = mvtDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				mvtDocument.positionAt( leftOffset ),
				position
			);
			const left = mvtDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = Range.create(
				position,
				mvtDocument.positionAt( rightOffset )
			);
			const right = mvtDocument.getText( rightRange ) || '';

			// Check for various hover scenarios

			// Function Hover
			if (patterns.SHARED.RIGHT_IS_OPEN_PAREN.test(right)) {
				// Builtin function lookup
				const foundHoverSymbol = builtinFunctionHoverSymbols.get(word);
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

	const results: SymbolInformation[] = [];

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

					results.push({
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

					results.push({
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

	return results;

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
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				mvDocument.positionAt( leftOffset ),
				position
			);
			const left = mvDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
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

			if (
				patterns.MV.LEFT_AFTER_BRACKET_DOT.test( left )
			) {
				return doValueCompletions;
			}

			return builtinFunctionCompletions;

		},

		findDocumentSymbols( document: TextDocument ): SymbolInformation[] {

			return _mvFindDocumentSymbols( mvDocuments.get( document ) );

		},

		findDefinition( document: TextDocument, position: Position, settings: Settings ): Definition | null {

			const mvDocument = mvDocuments.get( document );

			// Get word
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, maxLineLength ) );
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
			const line = mvDocument.getText( Range.create( position.line, 0, position.line, maxLineLength ) );
			const word = getWordAtOffset( line, position.character );

			// Exit if word is null
			if (!word) {
				return null;
			}

			// determine left side text range
			const cursorPositionOffset = mvDocument.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				mvDocument.positionAt( leftOffset ),
				position
			);
			const left = mvDocument.getText( leftRange ) || '';

			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = Range.create(
				position,
				mvDocument.positionAt( rightOffset )
			);
			const right = mvDocument.getText( rightRange ) || '';

			// Check for various hover scenarios

			// Function Hover
			if (patterns.SHARED.RIGHT_IS_OPEN_PAREN.test(right)) {
				// Builtin function lookup
				const foundHoverSymbol = builtinFunctionHoverSymbols.get(word);
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