import * as semver from 'semver';
import { Uri, workspace } from 'vscode';

export async function getFileContentsFromUri (uri: Uri): Promise<string> {
	const fileContents = await workspace.fs.readFile(uri);

	return fileContents.toString();
}

export async function getVersions (uri: Uri, contents?: string): Promise<string[]> {
	const fileContents = contents
		? contents
		: await getFileContentsFromUri(uri);
	const matches = fileContents.matchAll(new RegExp(`^##\\s*v((0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?)`, 'gm')) || [];

	return Array.from(matches)?.map(match => match[1]);
}

export async function getLatestVersion (uri: Uri, contents?: string): Promise<string> {
	const versions = await getVersions(uri, contents);
	const sortedVersions = semver.sort(versions);

	return sortedVersions.pop();
}