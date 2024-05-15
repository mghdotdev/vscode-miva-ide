import { platform } from 'os';
import { Diagnostic, DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { asyncSpawn, safeMatch } from '../../util/functions';

export class MivaScriptCompilerDiagnosticProvider {
	constructor () {}

	private async runCommand (filePath: string): Promise<string> {
		switch (platform()) {
			case 'win32': {
				const {stderr} = await asyncSpawn(
					'cmd.exe',
					[
						'mvc',
						'-W all',
						'-o NUL',
						filePath
					],
					{
						shell: true
					}
				);

				return stderr;
			}
			default: {
				const {stderr} = await asyncSpawn(
					'mvc',
					[
						'-W all',
						'-o /dev/null',
						filePath
					],
					{
						shell: true
					}
				);

				return stderr;
			}
		}
	}

	private parseCommandOutput (output: string): Diagnostic[] {
		const diagnostics = [];

		const rawErrorLines = output
			.trim()
			.split('\n');

		for (let rawErrorLine of rawErrorLines) {
			const [, lineNumber] = safeMatch(rawErrorLine, /[^\:]+:([0-9]+)/i);
			const [, errorMessage] = safeMatch(rawErrorLine, /(?<=[a-z]+_[0-9]+:\s)(.*)$/i);
			const [, errorCode] = safeMatch(rawErrorLine, /\b([a-z]+_[0-9]+):/i);

			if (lineNumber != null && errorMessage != null) {
				const parsedLineNumber = Math.max(0, parseInt(lineNumber, 10) - 1);

				diagnostics.push({
					code: errorCode,
					message: errorMessage,
					range: Range.create(
						Position.create(parsedLineNumber, 0),
						Position.create(parsedLineNumber, 9999)
					),
					source: 'Miva Script Compiler',
					severity: DiagnosticSeverity.Error
				});
			}
		}

		return diagnostics;
	}

	async provideDiagnostics (document: TextDocument): Promise<Diagnostic[]> {
		// Strip file protocol
		const filePath = document.uri.replace('file://', '');

		// Get command output
		const output = await this.runCommand(filePath);

		return this.parseCommandOutput(output);
	}
}
