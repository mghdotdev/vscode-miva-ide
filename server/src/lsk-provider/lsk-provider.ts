import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { SymbolInformationWithDocumentation, Workspace } from '../util/interfaces';
import { FileSystemDetector } from './file-system-detector';

const SHARED_FILE_SYSTEM_DETECTOR_SETTINGS: any = {
	fileNames: [
		'mmlsk-download.mv',
		'mmlsk-json.mv',
		'mmlsk-merchant.mv',
		'mmlsk-uri.mv'
	],
	fileNamesMethod: 'every'
};

async function walk (dir, fileExtension) {
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

export class LskProvider {
	symbols: SymbolInformationWithDocumentation[];
	private workspace: Workspace;

	private async determineLskPath (): Promise<string> {
		// Check workspace folders
		for (let workspaceFolder of this.workspace.folders) {
			const workspaceFolderUri = URI.parse(workspaceFolder.uri);
			const workspaceDetector = new FileSystemDetector({
				rootPath: workspaceFolderUri.fsPath,
				...SHARED_FILE_SYSTEM_DETECTOR_SETTINGS
			});

			if (await workspaceDetector.detect()) {
				return workspaceFolderUri.fsPath;
			}
		}

		// Check provied setting
		const settingDetector = new FileSystemDetector({
			rootPath: this.workspace.settings.LSK.path,
			...SHARED_FILE_SYSTEM_DETECTOR_SETTINGS
		});

		if (await settingDetector.detect()) {
			return this.workspace.settings.LSK.path;
		}
	}

	private async createTextDocumentFromPath (path: string): Promise<TextDocument> {
		const fileContents = await readFile(path, {
			encoding: 'utf-8'
		});

		return TextDocument.create(path, 'mv', 1, fileContents);
	}

	async provideSymbols (iterator: ( document: TextDocument ) => SymbolInformationWithDocumentation[]): Promise<SymbolInformationWithDocumentation[]> {
		const lskPath = await this.determineLskPath();
		if (!lskPath) {
			return [];
		}

		const filePaths = await walk(lskPath, '.mv');
		const symbols = await Promise.all(filePaths?.flatMap(async (filePath) => {
			const document = await this.createTextDocumentFromPath(filePath);
			return iterator(document);
		}));

		return symbols.flat();
	}

	setWorkspace (workspace: Workspace): void {
		this.workspace = workspace;
	}
}
