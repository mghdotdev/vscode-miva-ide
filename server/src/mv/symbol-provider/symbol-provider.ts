import { existsSync } from 'fs';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { uriToFsPath } from '../../util/functions';
import { SymbolInformationWithDocumentation, Workspace } from '../../util/interfaces';
import { FileSystemDetector } from './file-system-detector';

// @ts-ignore
async function walk (dir: string, fileExtension: string): string[] {
	let files = await readdir(dir);

	// @ts-ignore
	files = await Promise.all(files.map(async file => {
		const filePath = join(dir, file);
		const stats = await stat(filePath);

		if (stats.isDirectory()) {
			return walk(filePath, fileExtension);
		}
		else if (stats.isFile() && file.endsWith(fileExtension)) {
			return filePath;
		}
	}));

	// Filter out undefined entries before concatenating
	return files
		.filter(Boolean)
		.reduce((all, folderContents) => all.concat(folderContents), [])
}

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

	private async gatherMivaScriptFilePathsFromWorkspace (): Promise<string[]> {
		const files = await Promise.all(this.workspace.folders.map(async (workspaceFolder) => {
			const workspaceFolderPath = uriToFsPath(workspaceFolder.uri);

			// Check if path exists
			if (!existsSync(workspaceFolderPath)) {
				return [];
			}

			// Set new root path and attempt to detect
			this.lskDetector.setRootPath(workspaceFolderPath);

			// Attempt to detect the lsk path; exit this folder if lsk was already detected
			const lskDetected = await this.lskDetector.detect();
			if (!this.detectedLskPath && lskDetected) {
				this.detectedLskPath = workspaceFolderPath;
			}
			if (lskDetected && workspaceFolderPath !== this.detectedLskPath) {
				return [];
			}

			return walk(workspaceFolderPath, '.mv');
		}));

		return files.flat();
	}

	async provideSymbols (iterator: ( document: TextDocument ) => SymbolInformationWithDocumentation[]): Promise<SymbolInformationWithDocumentation[]> {
		const filePaths = await this.gatherMivaScriptFilePathsFromWorkspace();
		const symbols = await Promise.all(filePaths.map(async (filePath) => {
			const document = await this.createTextDocumentFromPath(filePath);

			return iterator(document);
		}));

		return symbols.flat();
	}

	setWorkspace (workspace: Workspace): void {
		this.workspace = workspace;
	}
}
