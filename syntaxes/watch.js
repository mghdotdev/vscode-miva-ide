const yaml = require( 'js-yaml' );
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const { exec } = require( 'child_process' );
const chalk = require( 'chalk' );

const globPattern = './**/*.yaml';

console.log( chalk.blue( `Watching files: ${ globPattern }` ) );

function onWatch( eventType, filename ) {

	console.log( chalk.green( `Watcher: Triggered for file: ${ chalk.underline( filename ) }` ) );

	exec( `npm run build-syntax ${ path.resolve( __dirname, filename ) }`, ( err, stdout, stderr ) => {

		if ( err ) {
			console.error( err );
		}

		console.log( stdout );

	});

}

glob( globPattern, function( err, files ) {

	if ( err ) {
		throw new Error( err );
		return;
	}
	
	files.forEach(function( file ) {

		fs.watch( file, { persistent: true }, onWatch );

	});

});