import { Workspace, Settings, LanguageFeatures } from './util/interfaces';
import { ClientCapabilities, TextDocument, Diagnostic, Range, DiagnosticSeverity } from 'vscode-languageserver';
import { readJSONFile, tokenize } from './util/functions';
import * as path from 'path';
import _get from 'lodash.get';

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	const validationTests = readJSONFile( path.resolve( __dirname, 'data', 'validation.json' ) );

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

		}

	};
}