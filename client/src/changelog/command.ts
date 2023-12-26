import { Uri, commands, workspace } from 'vscode';
import { Disposable } from 'vscode-languageclient';

export async function showChangelogCommand (): Promise<unknown> {
	const virtualChangelogDocument = await workspace.openTextDocument(Uri.parse('mivaIde:Miva IDE Updates'));

	if (virtualChangelogDocument && virtualChangelogDocument.version) {
		return commands.executeCommand('markdown.showPreview', virtualChangelogDocument.uri);
	}

	return false;
}

export function registerShowChangelogCommand (): Disposable {
	return commands.registerCommand('mivaIde.showChangelog', showChangelogCommand);
}