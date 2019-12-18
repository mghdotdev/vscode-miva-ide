import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import {
	CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	TextEdit,
	Position,
	Range,
	Command,
	TextDocument
} from 'vscode-languageserver';
import patterns from './patterns';

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
				snippet: file.distro_path
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
			insertTextFormat: InsertTextFormat.Snippet,
			data: {
				name: fn.name,
				type: 'function',
				snippet: `${ fn.name }(${ parameters })`,
				files: [ file.distro_path ]
			}
		};

	},

	getCompletions( type: string, cursorPosition: Position, fileAttributePosition?: any ): CompletionItem[] {

		let collection = ( type == 'file' ) ? this.fileCompletions : this.valueCompletions;

		return Array.from( collection.values() ).map(( value ) => {

			return {
				...value,
				...( type == 'file' ) ?
					{
						insertText: value.data.snippet
					}
					:
					{
						/* sortText: value.data.name,
						textEdit: TextEdit.replace(
							Range.create(
								Position.create( cursorPosition.line, cursorPosition.character + value.data.files[0].length - 1 ),
								Position.create( cursorPosition.line, cursorPosition.character + value.data.files[0].length )
							),
							`${ value.data.snippet }" />`
						),
						additionalTextEdits: [
							TextEdit.insert(
								fileAttributePosition,
								value.data.files[0]
							)
						] */
					}
			};
		});

	}

};

export default mf;