import { platform } from 'os';
import { dirname } from 'path';
import { Diagnostic, DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { folderContainsFile, safeMatch, uriToFsPath } from '../../util/functions';
import { asyncSpawn } from '../../util/functions-node';
import { Settings } from '../../util/interfaces';

export class MivaScriptCompilerProvider {
	constructor () {}

	private async runCommand (filePath: string): Promise<string> {
		const cwd = dirname(filePath);

		switch (platform()) {
			case 'win32': {
				const {stderr} = await asyncSpawn(
					'mvc',
					[
						'-W all',
						'-o NUL',
						filePath
					],
					{
						shell: true,
						cwd
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
						shell: true,
						cwd
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

	async provideDiagnostics (document: TextDocument, settings: Settings): Promise<Diagnostic[]> {
		if (!document.uri.startsWith('file://')) {
			return [];
		}

		// Strip file protocol
		const filePath = uriToFsPath(document.uri);

		// Determine if file is in the lsk folder
		const isInLSKFolder = folderContainsFile(settings?.LSK?.path, filePath);

		// Exit if compiler is not enabled or file is in LSK and LSK is disabled
		if (!settings?.mivaScript?.mivaScriptCompiler?.enable || (settings?.mivaScript?.mivaScriptCompiler?.disableLSK && isInLSKFolder)) {
			return [];
		}

		// Get command output
		const output = await this.runCommand(filePath);

		// Parse output into diagnostics
		const diagnostics = this.parseCommandOutput(output);

		// If no diagnostics are found alert with output instead
		if (!diagnostics || diagnostics.length === 0) {
			console.error(output);
		}

		return diagnostics;
	}
}
