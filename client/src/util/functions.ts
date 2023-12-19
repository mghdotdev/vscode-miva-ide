import { readFileSync } from 'fs';
import { commands, workspace } from 'vscode';

export function readJSONFile( location: string ) {
	try {
		return JSON.parse( readFileSync( location ).toString() );
	}
	catch( e ) {
		console.log( `Problems reading ${ location }: ${ e }` );
		return {};
	}
}

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