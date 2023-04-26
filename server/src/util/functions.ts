import {
	readFileSync
} from 'fs';
import {
	ResponseError,
	CancellationToken,
	ErrorCodes,
	CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	CompletionList,
	MarkupContent,
	MarkupKind
} from 'vscode-languageserver/node';
import _cloneDeep from 'lodash.clonedeep';

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
		command: {
			title: `Inject "${ file.distroPath }" into file attribute.`,
			command: 'mivaIde.chooseFileName',
			arguments: [
				{
					fileNames: [ file.distroPath ]
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
			completionItem.label,
			completionItem.documentation as MarkupContent
		);
	}, new Map());
}

export function parseCompletion( input: any ) {
	const completion = _cloneDeep(input);

	if (completion.kind) {
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
	return `_Requires Engine: ${engine}_`;
}

function formatTagTitle (title: string, tagName?: string) {
	return tagName
		? `#### ${tagName}[${title}]`
		: `#### ${title}`;
}

function formatTagReference (reference) {
	return `[Documentation Reference](${reference})`
}

function formatTagAttributeRequired (required: boolean, requiredMessage?: string) {
	return required
		? `_Required_`
		: `_Optional: ${requiredMessage}_`;
}

export function formatTagDocumentation (tagData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatTagTitle(tagData.label)}

${formatTagEngine(tagData.engine)}

${tagData.documentation}

${formatTagReference(tagData.reference)}`
	};
}

export function formatTagAttributeDocumentation (tagData, attributeData): MarkupContent {
	return {
		kind: MarkupKind.Markdown,
		value: `${formatTagTitle(attributeData.label, tagData.label)}

${formatTagAttributeRequired(attributeData.required, attributeData.requiredMessage)}

${attributeData.documentation}

${formatTagReference(tagData.reference)}`
	};
}

export function parseCompletionFile( completions ) {
	return completions.map(completion => {

		return parseCompletion( completion );

	});
}

export function getWordAtOffset( text: string, offset: number ): string | null {

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