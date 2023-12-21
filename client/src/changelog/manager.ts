import * as semver from 'semver';
import { ExtensionContext, TextDocumentContentProvider, Uri, workspace } from 'vscode';
import { getFileContentsFromUri } from '../util/functions';
import { registerShowChangelogCommand, showChangelogCommand } from './command';

export async function showChangelog (context: ExtensionContext): Promise<boolean> {
	const provider = new (class implements TextDocumentContentProvider {
		async provideTextDocumentContent(uri: Uri): Promise<string> {
			if (uri.path === 'Miva IDE Updates') {
				const changelogHeader = await getFileContentsFromUri(Uri.joinPath(context.extensionUri, 'templates', 'changelog-header.html'));
				const changeLogFileUri = Uri.joinPath(context.extensionUri, 'CHANGELOG.md');
				const changelogFileContents = await getFileContentsFromUri(changeLogFileUri);
				return changelogFileContents.replace('# Change Log', changelogHeader);
			}

			return '';
		}
	})();

	context.subscriptions.push(workspace.registerTextDocumentContentProvider('mivaIde', provider))
	context.subscriptions.push(registerShowChangelogCommand());

	const settingValue = workspace.getConfiguration('').get('showChangelogOnUpdate');
	if (!settingValue) {
		return false;
	}

	const latestVersion = <string> context.extension.packageJSON.version;
	const storedLatestVersion = <string> context.globalState.get('latestVersion');

	if (latestVersion !== storedLatestVersion) {
		const versionDiff = semver.diff(latestVersion, storedLatestVersion);

		if (versionDiff === 'major' || versionDiff === 'minor') {
			showChangelogCommand();

			context.globalState.update('latestVersion', latestVersion);
		}
	}

	return true;
}
