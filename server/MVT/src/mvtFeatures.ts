import { Workspace, Settings, LanguageFeatures } from './util/interfaces';
import { ClientCapabilities, TextDocument, Diagnostic, Range, DiagnosticSeverity, MarkupContent, MarkupKind } from 'vscode-languageserver';
import { readJSONFile } from './util/functions';
import * as path from 'path';

export function getMVTFeatures( workspace: Workspace, clientCapabilities: ClientCapabilities ): LanguageFeatures {

	const validationTests = readJSONFile( path.resolve( __dirname, '..', 'data', 'validation.json' ) );

	return {

		doValidation( document: TextDocument, settings: Settings ): Diagnostic[] {

			const text = document.getText();

			console.log( 'validationTests', validationTests );

			return validationTests.map(( validation ): Diagnostic => {
				const pattern = new RegExp( validation.match, 'ig' );
				const match: RegExpExecArray = pattern.exec( text );
				if ( match ) {
					let message: MarkupContent = {
						kind: MarkupKind.Markdown,
						value: validation.problem.message
					};
					return {
						range: Range.create( document.positionAt( match.index ), document.positionAt( match.index + match[ validation.matchIndex ].length ) ),
						message: message.toString(),
						severity: DiagnosticSeverity[ validation.problem.type ],
						source: 'Miva IDE'
					}
				}
			});

		}

	};
}