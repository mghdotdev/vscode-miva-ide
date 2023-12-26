
import { Uri, commands, workspace } from 'vscode';

export function pushAll<T>( to: T[], from: T[] ) {
	if ( from ) {
		for ( const e of from ) {
			to.push( e );
		}
	}
}

export function setWhenContext (extensionName: string, name: string, value: any): void {
	commands.executeCommand('setContext', `${extensionName}.${name}`, value);
}

export function syncSettingToWhenContext (section: string, settingName: string, extensionName: string): void {
	const settingValue = workspace.getConfiguration(section).get(settingName);

	setWhenContext(extensionName, settingName, settingValue);
}

export async function getFileContentsFromUri (uri: Uri): Promise<string> {
	const fileContents = await workspace.fs.readFile(uri);

	return fileContents.toString();
}