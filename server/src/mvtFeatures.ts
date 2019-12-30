import { Workspace, Settings, LanguageFeatures } from './util/interfaces';
import { ClientCapabilities, TextDocument, Diagnostic, Range, DiagnosticSeverity, Position, CompletionList } from 'vscode-languageserver';
import { readJSONFile, tokenize, getValueCompletions } from './util/functions';
import patterns from './util/patterns';
import * as path from 'path';
import _get from 'lodash.get';

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	const boundryAmount = 200;
	const validationTests = readJSONFile( path.resolve( __dirname, '..', 'data', 'validation.json' ) );
	const merchantFunctionFiles = readJSONFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) );
	const doValueCompletions: CompletionList = getValueCompletions( merchantFunctionFiles );

	return {

		doValidation( document: TextDocument, settings: Settings ): Diagnostic[] {

			// get full text of the document
			const text = document.getText();

			// build diagnostics array
			return validationTests.reduce(( diagnostics, validation ): Diagnostic => {

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

			}, []);

		},

		doCompletion( document: TextDocument, position: Position, settings: Settings ): CompletionList {

			let completions = CompletionList.create();

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
			
			// prevent showing completions if not in a mvt:do tag value attribute
			if (
				!patterns.LEFT_IN_MVTDO_TAG.test( left ) ||
				!patterns.RIGHT_IN_TAG.test( right ) ||
				!patterns.LEFT_IN_VALUE_ATTR.test( left )
			) {
				return completions;
			}

			return doValueCompletions;

		}

	};
}