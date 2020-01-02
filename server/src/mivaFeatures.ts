import {
	Workspace,
	Settings,
	LanguageFeatures,
	ValidationRule
} from './util/interfaces';
import {
	ClientCapabilities,
	TextDocument,
	Diagnostic,
	Range,
	DiagnosticSeverity,
	Position,
	CompletionList,
	CompletionItem,
	Definition,
	SymbolInformation,
	SymbolKind,
	Location
} from 'vscode-languageserver';
import { 
	readJSONFile,
	tokenize,
	getDoValueCompletions,
	parseCompletionFile
} from './util/functions';
import patterns from './util/patterns';
import * as path from 'path';
import _get from 'lodash.get';
import {
	getLanguageService,
	TokenType
} from 'vscode-html-languageservice';

const htmlLanguageService = getLanguageService();

const boundryAmount = 200;
const merchantFunctionFiles = readJSONFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) );
const doValueCompletions: CompletionList = getDoValueCompletions( merchantFunctionFiles );

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	const validationTests: ValidationRule[] = readJSONFile( path.resolve( __dirname, '..', 'data', 'MVT', 'validation.json' ) );
	const entityCompletions: CompletionItem[] = parseCompletionFile( readJSONFile( path.resolve( __dirname, '..', 'data', 'MVT', 'entity-completions.json' ) ) );

	return {

		doValidation( document: TextDocument, settings: Settings ): Diagnostic[] {

			// get full text of the document
			const text = document.getText();

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
							range: Range.create( document.positionAt( match.index ), document.positionAt( match.index + match[ validation.matchIndex ].length ) ),
							message: `[${ validation.problem.type.toLowerCase() }] - ${ tokenize( validation.problem.message, match ) }`,
							severity: DiagnosticSeverity[ validation.problem.type ],
							source: 'Miva IDE'
						}
					);
				}

				return diagnostics;

			}, []);;

		},

		doCompletion( document: TextDocument, position: Position, settings: Settings ): CompletionList {

			// determine left side text range
			const cursorPositionOffset = document.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				document.positionAt( leftOffset ),
				position
			);
			const left = document.getText( leftRange ) || '';
			
			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = Range.create(
				position,
				document.positionAt( rightOffset )
			);
			const right = document.getText( rightRange ) || '';
			
			// mvt:do tag value attribute completions
			if (
				patterns.MVT.LEFT_IN_MVTDO_TAG.test( left ) &&
				patterns.SHARED.RIGHT_IN_TAG.test( right ) &&
				patterns.SHARED.LEFT_IN_VALUE_ATTR.test( left )
			) {
				return doValueCompletions;
			}

			// entity completions
			if (
				patterns.MVT.LEFT_AFTER_AMP
			) {
				return CompletionList.create( entityCompletions );
			}

			return undefined;

		}

	};

}

export function getMVFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	return {

		doCompletion( document: TextDocument, position: Position, settings: Settings ): CompletionList {

			// determine left side text range
			const cursorPositionOffset = document.offsetAt( position );
			const leftOffset = cursorPositionOffset - boundryAmount;
			const leftRange = Range.create(
				document.positionAt( leftOffset ),
				position
			);
			const left = document.getText( leftRange ) || '';
			
			// determine right side text range
			const rightOffset = cursorPositionOffset + boundryAmount;
			const rightRange = Range.create(
				position,
				document.positionAt( rightOffset )
			);
			const right = document.getText( rightRange ) || '';
			
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

			return undefined;

		},

		findDocumentSymbols( document: TextDocument ): SymbolInformation[] {

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
						/* else if ( (lastTagName === 'mvquery' || lastTagName === 'mvopenview') && lastAttributeName === 'name' ) {

							results.push({
								kind: SymbolKind.Namespace,
								name: scanner.getTokenText().replace( /"/g, '' ),
								location: Location.create(
									document.uri,
									Range.create(
										document.positionAt( scanner.getTokenOffset() + 1 ),
										document.positionAt( scanner.getTokenOffset() + scanner.getTokenLength() - 1 )
									)
								)
							});

						} */
						break;

				}

				token = scanner.scan();

			}			

			return results;

		},

		findDefinition( document: TextDocument, position: Position ): Definition | null {

			const htmlDocument = htmlLanguageService.parseHTMLDocument( document );

			const node = htmlDocument.findNodeAt( document.offsetAt( position ) );

			console.log( 'node', node );

			return null;
		}

	};

}