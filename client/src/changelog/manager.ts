import { CancellationToken, ExtensionContext, ProviderResult, TextDocumentContentProvider, Uri, workspace } from 'vscode';
import { registerShowChangelogCommand, showChangelogCommand } from './command';
import { getFileContentsFromUri, getLatestVersion } from './parser';

export async function showChangelog (context: ExtensionContext): Promise<boolean> {
	const settingValue = workspace.getConfiguration('').get('showChangelogOnUpdate');
	if (!settingValue) {
		return false;
	}

	const changeLogFileUri = Uri.joinPath(context.extensionUri, 'CHANGELOG.md');
	const changelogFileContents = await getFileContentsFromUri(changeLogFileUri);

	const latestVersion = await getLatestVersion(changeLogFileUri, changelogFileContents);
	const storedLatestVersion = context.globalState.get('latestVersion');

	const changelogHeader = await getFileContentsFromUri(Uri.joinPath(context.extensionUri, 'templates', 'changelog-header.html'));

	const provider = new (class implements TextDocumentContentProvider {
		provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
			return uri.path === 'Miva IDE Updates'
				? changelogFileContents.replace('# Change Log', changelogHeader)
				: '';
		}
	})();

	context.subscriptions.push(workspace.registerTextDocumentContentProvider('mivaIde', provider))
	context.subscriptions.push(registerShowChangelogCommand());

	if (latestVersion !== storedLatestVersion) {
		showChangelogCommand();

		context.globalState.update('latestVersion', latestVersion);
	}

	return true;
}
