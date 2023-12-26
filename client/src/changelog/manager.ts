import * as semver from 'semver';
import { ExtensionContext, TextDocumentContentProvider, Uri, workspace } from 'vscode';
import { getFileContentsFromUri } from '../util/functions';
import { registerShowChangelogCommand, showChangelogCommand } from './command';

export async function showChangelog (context: ExtensionContext): Promise<boolean> {
	const provider = new (class implements TextDocumentContentProvider {
		async provideTextDocumentContent(uri: Uri): Promise<string> {
			// Get CHANGELOG.md file from root of the extension and load the changelog header template. Replace the h1 hash with the header html.
			if (uri.path === 'Miva IDE Updates') {
				const changelogHeader = await getFileContentsFromUri(Uri.joinPath(context.extensionUri, 'templates', 'changelog-header.html'))
					.catch(err => console.error(err)) || '';
				const changeLogFileUri = Uri.joinPath(context.extensionUri, 'CHANGELOG.md');
				const changelogFileContents = await getFileContentsFromUri(changeLogFileUri)
					.catch(err => console.error(err)) || '';

				return changelogFileContents && changelogFileContents?.length > 0
					? changelogFileContents.replace('# Change Log', changelogHeader)
					: undefined;
			}

			return '';
		}
	})();

	context.subscriptions.push(workspace.registerTextDocumentContentProvider('mivaIde', provider))
	context.subscriptions.push(registerShowChangelogCommand());

	// Exit the function if the show changelog setting is falsey
	const settingValue = workspace.getConfiguration('').get('showChangelogOnUpdate');
	if (!settingValue) {
		return false;
	}

	// Compare the latest package.json version with the global state stored last version

	const latestVersion = <string> context.extension.packageJSON.version;
	const storedLatestVersion = <string> context.globalState.get('latestVersion');

	if (latestVersion !== storedLatestVersion) {
		// Only show the changelog if the difference is major or minor updates
		const versionDiff = semver.diff(latestVersion, storedLatestVersion);

		if (versionDiff === 'major' || versionDiff === 'minor') {
			showChangelogCommand();
		}

		// Set the latest version recorded in the global state
		context.globalState.update('latestVersion', latestVersion);
	}

	return true;
}
