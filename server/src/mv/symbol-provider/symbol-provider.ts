import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FileSystemDetector } from '../../util/file-system-detector';
import { uriToFsPath } from '../../util/functions';
import { walk } from '../../util/functions-node';
import { SymbolInformationWithDocumentation, Workspace } from '../../util/interfaces';

interface Folder {
	filePaths: string[];
	lsk: boolean;
};

export class WorkspaceSymbolProvider {
	private workspace: Workspace;
	private detectedLskPath: string;
	private lskDetector = new FileSystemDetector({
		rootPath: '',
		fileNames: [
			'mmlsk-download.mv',
			'mmlsk-json.mv',
			'mmlsk-merchant.mv',
			'mmlsk-uri.mv'
		],
		fileNamesMethod: 'every'
	})

	private async createTextDocumentFromPath (path: string): Promise<TextDocument> {
		const fileContents = await readFile(path, {
			encoding: 'utf-8'
		});

		return TextDocument.create(path, 'mv', 1, fileContents);
	}

	private async gatherMivaScriptFoldersFromWorkspace (): Promise<Folder[]> {
		return Promise.all(this.workspace.folders.map(async (workspaceFolder) => {
			const workspaceFolderPath = uriToFsPath(workspaceFolder.uri);

			// Check if path exists
			if (!existsSync(workspaceFolderPath)) {
				return {
					filePaths: [],
					lsk: false
				};
			}

			// Set new root path and attempt to detect
			this.lskDetector.setRootPath(workspaceFolderPath);

			// Attempt to detect the lsk path; exit this folder if lsk was already detected
			const lskDetected = await this.lskDetector.detect();
			if (!this.detectedLskPath && lskDetected) {
				this.detectedLskPath = workspaceFolderPath;
			}
			if (lskDetected && workspaceFolderPath !== this.detectedLskPath) {
				return {
					filePaths: [],
					lsk: lskDetected
				};
			}

			return {
				filePaths: (await walk(workspaceFolderPath, '.mv')),
				lsk: lskDetected
			};
		}));
	}

	async provideSymbols (iterator: ( document: TextDocument, lsk: boolean ) => SymbolInformationWithDocumentation[]): Promise<SymbolInformationWithDocumentation[]> {
		let symbols = [];
		const folders = await this.gatherMivaScriptFoldersFromWorkspace();

		for (let {filePaths, lsk} of folders) {
			symbols = symbols.concat((await filePaths)?.map(async (filePath) => {
				const document = await this.createTextDocumentFromPath(filePath);

				return iterator(document, lsk);
			})) ?? [];
		}

		return symbols;
	}

	setWorkspace (workspace: Workspace): void {
		this.workspace = workspace;
	}
}
