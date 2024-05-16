import { existsSync, lstatSync } from 'fs';
import { readdir } from 'fs/promises';
import { parse } from 'path';

export interface FileSystemDetectorConfig {
	/**
	 * Root path to detect in
	 */
	rootPath: string;

	/**
	 * Tests the supplied path against the provided "rootPath" to determine validity
	 */
	testPath?: string;

	/**
	 * An array of file names to test against. Use "fileNamesMethod" to determine if every or some file names need to match.
	 */
	fileNames?: string[];

	/**
	 * Defaults to 'some'
	 */
	fileNamesMethod?: 'some' | 'every';

	/**
	 * An array of folder names to test against. Use "folderNamesMethod" to determine if every or some file names need to match.
	 */
	folderNames?: string[];

	/**
	 * Defaults to 'some'
	 */
	folderNamesMethod?: 'some' | 'every';
}

export class FileSystemDetector {
	constructor (private config: FileSystemDetectorConfig) {}

	private ensurePathIsDirectory (path: string = this.config.rootPath): boolean {
		if (!existsSync(path)) {
			return false;
		}

		return lstatSync(path).isDirectory();
	}

	private getPathName (path: string) {
		return parse(path).base;
	}

	private gatherFilePaths (): Promise<string[]> {
		if (!this.ensurePathIsDirectory()) {
			return Promise.resolve([]);
		}

		return readdir(this.config.rootPath);
	}

	private async gatherFileNames (): Promise<string[]> {
		const filePaths = await this.gatherFilePaths();

		return filePaths
			.map(filePath => this.getPathName(filePath));
	}

	private async gatherFolderNames (): Promise<string[]> {
		const filePaths = await this.gatherFilePaths();

		return filePaths
			.filter(filePath => this.ensurePathIsDirectory(filePath))
			.map(folderPath => this.getPathName(folderPath));
	}

	setRootPath (rootPath: string): void {
		this.config.rootPath = rootPath;
	}

	async detect (): Promise<boolean> {
		if (!this.config.rootPath) {
			return false;
		}

		if (this.config.testPath && this.config.rootPath === this.config.testPath) {
			return true;
		}

		if (this.config.fileNames && this.config.fileNames.length > 0) {
			const fileNames = await this.gatherFileNames();

			return this.config.fileNamesMethod === 'every'
				? this.config.fileNames.every(fileName => fileNames.includes(fileName))
				: this.config.fileNames.some(fileName => fileNames.includes(fileName))
		}

		if (this.config.folderNames && this.config.folderNames.length > 0) {
			const folderNames = await this.gatherFolderNames();
			return this.config.folderNamesMethod === 'every'
				? this.config.folderNames.every(folderName => folderNames.includes(folderName))
				: this.config.folderNames.some(folderName => folderNames.includes(folderName))
		}

		return false;
	}
}
