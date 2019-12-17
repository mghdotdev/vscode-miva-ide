import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import {
	CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	TextEdit,
	Position,
	Range
} from 'vscode-languageserver';

const readFile = promisify( fs.readFile );
let buffer: Promise<Buffer>;

export interface MerchantFunctions {

	/**
	 * Used to store the raw data from the functions-merchant.json file
	 */
	data: object[],

	fileData: object[],

	/**
	 * Data to be parsed after the 
	 */
	valueData: object[],

	fileCompletions: Map<string, CompletionItem>,

	valueCompletions: Map<string, CompletionItem>,

	init: Function,

	parseData: Function,

	formatFileCompletion: Function,

	formatValueCompletion: Function,

	generateFnId: Function,

	getCompletions: Function

};

const mf: MerchantFunctions = {

	data: [],
	fileData: [],
	valueData: [],
	fileCompletions: new Map(),
	valueCompletions: new Map(),

	init():void {

		readFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) )
		.then(( buffer ) => {

			this.data = JSON.parse( buffer.toString() );

			this.parseData();

		});

	},

	parseData(): void {

		this.data.forEach(( file: any ) => {

			if ( !this.fileCompletions.has( file.distro_path ) ) {

				this.fileCompletions.set( file.distro_path, this.formatFileCompletion( file ) );

			}

			file.functions.forEach(( fn: any ) => {

				let foundFunction = this.valueCompletions.get( this.generateFnId( fn.name, fn.parameters ) );

				if ( !foundFunction ) {

					this.valueCompletions.set( this.generateFnId( fn.name, fn.parameters ), this.formatValueCompletion( fn, file ) );
				
				}
				else {

					foundFunction.data.files.push( file.distro_path );

				}

			});

		});

	},

	generateFnId( name: string, params: [] ) {

		return `${ name }|${ params.join( ',' ) }`;

	},

	formatFileCompletion( file: any ):CompletionItem {
		
		return {
			label: file.distro_path,
			kind: CompletionItemKind.File,
			insertTextFormat: InsertTextFormat.PlainText,
			data: {
				type: 'file',
				textEdit: file.distro_path
			}
		};

	},

	formatValueCompletion( fn: any, file: any ):CompletionItem {

		const parameters = fn.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

			return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index < arr.length ) ? '' : ' ' }`;

		}, '');
		
		return {
			label: fn.name,
			kind: CompletionItemKind.Function,
			// textEdit: TextEdit.insert( Position.create(  ), ),
			insertTextFormat: InsertTextFormat.Snippet,
			data: {
				type: 'function',
				textEdit: `${ fn.name }(${ parameters })`,
				files: [ file.distro_path ]
			}
		};

	},

	getCompletions( type: string, cursorPosition: Position, filePosition?: Position ): CompletionItem[] {

		let collection = ( type == 'file' ) ? this.fileCompletions : this.valueCompletions;

		return Array.from( collection.values() ).map(( value ) => {
			return {
				...value,
				textEdit: TextEdit.replace(
					Range.create(
						Position.create( cursorPosition.line, ( cursorPosition.character - 1 ) ),
						cursorPosition
					),
					value.data.textEdit
				),
				...( filePosition ) ?
						{
							additionalTextEdits: [
								TextEdit.insert(
									filePosition,
									value.data.files[ 0 ]
								)
							]
						}
						:
						{}
				
			};
		});

	}

};

export default mf;





/* 


const readFile = promisify( fs.readFile );
let merchantFunctions: any[];
let merchantFunctionCompletions: CompletionItem[];

readFile( path.resolve( __dirname, '..', 'data', 'functions-merchant.json' ) )
.then(( buffer ) => {

	merchantFunctions = JSON.parse( buffer.toString() );

	merchantFunctionCompletions = merchantFunctions.reduce(( completions: CompletionItem[], file ):CompletionItem[] => {

		let functions = file?.functions.map(( fn: any ):CompletionItem => {

			const parameters = fn?.parameters.reduce(( all: string, param: any, index: number, arr: any[] )=> {

				return `${ all }${ ( index == 0 ) ? ' ' : ', ' }\$\{${ index + 1 }:${ param }\}${ ( index < arr.length ) ? '' : ' ' }`;

			}, '');

			return {
				label: fn?.name,
				kind: CompletionItemKind.Function,
				insertText: `${ fn?.name }(${ parameters })`,
				insertTextFormat: InsertTextFormat.Snippet
			};

		});

		return completions.concat( functions );

	}, []);

});



*/