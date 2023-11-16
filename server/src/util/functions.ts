import {
	readFileSync
} from 'fs';
import _cloneDeep from 'lodash.clonedeep';
import {
	CancellationToken,
	CompletionItem,
	CompletionItemKind,
	CompletionList,
	ErrorCodes,
	InsertTextFormat,
	MarkupContent,
	MarkupKind,
	ResponseError
} from 'vscode-languageserver/node';
import { ItemData, ItemParamData, TagAttributeData, TagAttributeValueData, TagData } from './interfaces';

export function formatError( message: string,
	err: any ): string {

	if ( err instanceof Error ) {

		let error = <Error>err;
		return `${ message }: ${ error.message }\n${ error.stack }`;

	}
	else if ( typeof err === 'string' ) {

		return `${ message }: ${ err }`;

	}
	else if ( err ) {

		return `${ message }: ${ err.toString() }`;

	}

	return message;

}

export function pushAll<T>( to: T[], from: T[] ) {
	if ( from ) {
		for ( const e of from ) {
			to.push( e );
		}
	}
}

export function readJSONFile( location: string ) {
	try {
		return JSON.parse( readFileSync( location ).toString() );
	}
	catch( e ) {
		console.log( `Problems reading ${ location }: ${ e }` );
		return {};
	}
}

export function tokenize( text: string, matches: RegExpExecArray ): string {
	let result = text;
	for ( let i = 0; i < matches.length; i++ ) {
		result = result.replace( new RegExp( `\\$${ i }`, 'g' ), matches[ i ] );
	}
	return result;
}

export function runSafeAsync<T>( func: () => Thenable<T>, errorVal: T, errorMessage: string, token: CancellationToken ): Thenable<T | ResponseError<any>> {
	return new Promise<T | ResponseError<any>>((resolve) => {
		setImmediate(() => {
			if ( token.isCancellationRequested ) {
				resolve( cancelValue() );
			}
			return func().then(result => {
				if ( token.isCancellationRequested ) {
					resolve( cancelValue() );
					return;
				} else {
					resolve( result );
				}
			}, e => {
				console.error( formatError( errorMessage, e ) );
				resolve( errorVal );
			});
		});
	});
}

export function runSafe<T, E>( func: () => T, errorVal: T, errorMessage: string, token: CancellationToken ): Thenable<T | ResponseError<E>> {
	return new Promise<T | ResponseError<E>>(( resolve ) => {
		setImmediate(() => {
			if ( token.isCancellationRequested ) {
				resolve( cancelValue() );
			}
			else {
				try {
					let result = func();
					if ( token.isCancellationRequested ) {
						resolve( cancelValue() );
						return;
					} else {
						resolve( result );
					}

				} catch ( e ) {
					console.error(formatError( errorMessage, e) );
					resolve( errorVal );
				}
			}
		});
	});
}

function cancelValue<E>() {
	return new ResponseError<E>( ErrorCodes.PendingResponseRejected, 'Request cancelled' );
}

function wrapSpaces (str: string, wrap: boolean): string {
	return wrap
		? ` ${str} `
		: str;
}

function formatDoValueCompletion( fn: any, file: any ): CompletionItem {

	const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

		return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index == (arr.length - 1) ) ? ' ' : '' }`;

	}, '');

	return {
		label: fn.name,
		insertText: `${ fn.name }(${ parameters })`,
		insertTextFormat: InsertTextFormat.Snippet,
		kind: CompletionItemKind.Function,
		detail: file.distroPath,
		documentation: `\n\`\`\`mv\n{ [ ${file.distroPath} ].${ fn.name }(${wrapSpaces( fn.parameters.join(', '), fn.parameters.length > 0 )}) }\n\`\`\`\n---\n${fn.description ? `${fn.description}\n---\n` : ''}${fn.parameters?.map(param => `@param \`${param}\``)?.join('\n\n')}@returns \`${fn.returnValue}\``,
		command: {
			title: `Inject "${ file.distroPath }" into file attribute and inject "${ fn.returnValue }" into name attribute.`,
			command: 'mivaIde.chooseFileName',
			arguments: [
				{
					fileNames: [ file.distroPath ],
					returnValue: fn.returnValue
				}
			]
		}
	};

}

export function getDoValueCompletions( merchantFunctionFiles: any[] ): CompletionList {

	let doValueCompletions: Map<string, CompletionItem> = new Map();

	merchantFunctionFiles.forEach((file: any) =>{
		file.functions.forEach((fn: any) => {

			let key = `${ fn.name }@${ fn.parameters.join( '|' ) }`;
			let completion = doValueCompletions.get( key );

			if ( completion ) {

				// append to the fileNames argument
				completion.command.arguments[0].fileNames.push( file.distroPath );

			}
			else {

				// create the record if it doesn't exist
				doValueCompletions.set( key, formatDoValueCompletion( fn, file ) );

			}

		});
	});

	return CompletionList.create( Array.from( doValueCompletions.values() ) );

}

export function getHoverMapFromCompletionFile ( completions: any[] ): Map<string, MarkupContent> {
	return completions.reduce((map: Map<string, MarkupContent>, completionItem: CompletionItem) => {
		return map.set(
			completionItem.detail
				? `${completionItem.detail}@${completionItem.label}`
				: completionItem.label,
			completionItem.documentation as MarkupContent
		);
	}, new Map());
}

export function parseCompletion( input: any ) {
	const completion = _cloneDeep(input);

	if (completion.kind && !Number.isInteger(completion.kind)) {
		completion.kind = CompletionItemKind[ completion.kind ];
	}

	if (completion.documentation) {
		completion.documentation = <MarkupContent>{
			kind: MarkupKind.Markdown,
			value: completion.documentation
		};
	}

	if (completion.insertTextFormat) {
		completion.insertTextFormat = InsertTextFormat[ completion.insertTextFormat ];
	}

	return completion;

}

export function unique( value, index, self ) {
	return self.indexOf( value ) === index;
};

function formatTagEngine (engine) {
	return engine
		? `_Requires Engine: ${engine}_`
		: '';
}

function formatTagVersion (version) {
	return version
		? `_Requires Miva: ${version}_`
		: '';
}

function formatTagTitle (title: string, tagName?: string, value?: string) {
	return tagName
		? `#### ${tagName}[${title}${value ? `="${value}"` : ''}]`
		: `#### ${title}`;
}

function formatItemTitle (type, title: string, itemName?: string) {
	switch (type) {
		case 'function':
			return itemName
				? `#### ${itemName}.${title}()`
				: `#### ${title}`;
		case 'link':
			return itemName
				? `#### ${itemName} → ${title}`
				: `#### ${title}`;
		default:
			return `#### ${title}`
	}
}

function formatTagReference (reference) {
	return `[Documentation Reference](${reference})`
}

function formatTagAttributeRequired (required: boolean, requiredMessage?: string) {
	return required
		? `_Required_`
		: `_Optional${requiredMessage ? `: ${requiredMessage}` : ''}_`;
}

export function formatTagDocumentation (tagData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatTagTitle(tagData.label)}

${formatTagEngine(tagData.engine)}

${formatTagVersion(tagData.version)}

${tagData.documentation}

${formatTagReference(tagData.reference)}`
	};
}

export function formatTagAttributeDocumentation (tagData: TagData, attributeData: TagAttributeData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatTagTitle(attributeData.label, tagData.label)}

${formatTagEngine(attributeData.engine || tagData.engine)}

${formatTagVersion(attributeData.version || tagData.version)}

${formatTagAttributeRequired(attributeData.required, attributeData.requiredMessage)}

${attributeData.documentation}

${formatTagReference(attributeData.reference || tagData.reference)}`
	};
}

export function formatTagAttributeValueDocumentation (tagData: TagData, attributeData: TagAttributeData, attributeValueData: TagAttributeValueData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatTagTitle(attributeData.label, tagData.label, attributeValueData.label)}

${formatTagEngine(attributeValueData.engine || attributeData.engine || tagData.engine)}

${formatTagVersion(attributeValueData.version || attributeData.version || tagData.version)}

${attributeValueData.documentation}

${formatTagReference(attributeValueData.reference || attributeData.reference || tagData.reference)}`
	};
}

export function formatItemParamDocumentation (foundItem: ItemData, foundParam: ItemParamData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatItemTitle(foundParam.paramType, foundParam.label, foundItem.label)}

${formatTagEngine(foundParam.engine || foundItem.engine)}

${formatTagVersion(foundParam.version || foundItem.version)}

${foundParam.documentation}

${formatTagReference(foundParam.reference || foundItem.reference)}`
	};
}

export function parseCompletionFile ( completions: any[] ) {
	return completions.map(completion => {

		return parseCompletion( completion );

	});
}

export function getWordAtOffset ( text: string, offset: number ): string | null {

	const wordPattern = /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g;
	let match;
	let count = 0;

	while ( match = wordPattern.exec( text ) || count > 1000 ) {

		count++;

		let wordOffset = match.index + match[0].length;

		if ( offset >= match.index && offset <= wordOffset ) {

			return match[0];

		}

	}

	return null;

}

export function getVariableAtOffset ( text: string, offset: number ): string | null {

	const wordPattern = /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\{\}\\\|\;\'\"\,\<\>\/\s]+)/g;
	let match;
	let count = 0;

	while ( match = wordPattern.exec( text ) || count > 1000 ) {

		count++;

		let wordOffset = match.index + match[0].length;

		if ( offset >= match.index && offset <= wordOffset ) {

			// Get string match from cursor position rounded to the closest ':' character
			const text: string = match[0].replace(/\[[0-9]+\]/g, '');
			const cursorPos = offset - match.index;
			const end = text.indexOf(':', cursorPos);
			const variable = text.slice(0, end > -1 ? end : text.length);

			return variable;
		}

	}

	return null;

}

export function getEntityAtOffset ( text: string, offset: number ): string | null {

	const wordPattern = /(-?\d*\.\d\w*)|(?<=mvt[a-z]?:)([^\`\~\!\@\$\^\&\*\(\)\=\+\{\}\\\|\;\'\"\,\<\>\/\s]+)/g;
	let match;
	let count = 0;

	while ( match = wordPattern.exec( text ) || count > 1000 ) {

		count++;

		let wordOffset = match.index + match[0].length;

		if ( offset >= match.index && offset <= wordOffset ) {

			// Get string match from cursor position rounded to the closest ':' character
			const text: string = match[0].replace(/\[[0-9]+\]/g, '');;
			const cursorPos = offset - match.index;
			const end = text.indexOf(':', cursorPos);
			const entity = text.slice(0, end > -1 ? end : text.length);

			return entity.startsWith('global:')
				? `g.${entity.replace('global:', '')}`
				: `l.settings:${entity}`;

		}

	}

	return null;

}

export function parseLinkTemplate (template: string, data: Record<string, string>): string {
	let output = template;

	for (let [key, value] of Object.entries(data)) {
		const regex = new RegExp(`{{${key}}}`, 'g');
		output = output.replace(regex, value);
	}

	return output;
}

export function safeMatch (str: string, pattern: RegExp): RegExpMatchArray | [] {
	return str?.match(pattern) || [];
}

export function getVariableParts (variable: string): string[] {
	return variable?.split(':') || [];
}

export function getVariableDepth (variableParts: string[]): number {
	return Math.max(0, variableParts.length - 1);
}