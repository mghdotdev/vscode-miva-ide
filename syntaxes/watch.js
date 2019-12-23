const yaml = require( 'js-yaml' );
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const chalk = require( 'chalk' );
const { buildFile } = require( './build');

const globPattern = './**/*.yaml';

console.log( chalk.blue( `Watching files: ${ globPattern }` ) );

function onWatch( eventType, filename ) {

	console.log( chalk.green( `Watcher: Triggered for file: ${ chalk.underline( filename ) }` ) );

	buildFile( String( this ) );

}

glob( globPattern, function( err, files ) {

	if ( err ) {
		throw new Error( err );
		return;
	}
	
	files.forEach(function( file ) {

		fs.watch( file, { persistent: true }, onWatch.bind( file ) );

	});

});