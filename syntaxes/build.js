const yaml = require( 'js-yaml' );
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const { argv } = require( 'process' );
const chalk = require( 'chalk' );

function buildFile( file ) {

	console.log( chalk.green( `Builder: Converting yaml file to json ${ chalk.underline( file ) }` ) );

	try {

		const pathInfo = path.parse( file );
		const obj = yaml.safeLoad( fs.readFileSync( file, 'utf8' ) );

		if ( obj ) {

			fs.writeFileSync( `${ pathInfo.dir + path.sep + pathInfo.name }.json`, JSON.stringify( obj, null, 2 ), 'utf8' );

		}

	}
	catch( e ) {

		console.error( chalk.red( `Builder: Unable to convert ${ file } due to:\n${ e }` ) );

	}

}

const inputFile = argv[ 2 ];

if ( inputFile ) {

	fs.stat( inputFile, ( err, stats ) => {

		if ( stats.isFile() ) {

			buildFile( inputFile );

		}
		else {

			console.error( chalk.red( `Builder: Passed input ${ chalk.underline( inputFile ) } is not a valid file path.` ) );

		}

	});

}
else {

	glob( './**/*.yaml', function( err, files ) {

		if ( err ) {
			throw new Error( err );
			return;
		}
		
		files.forEach( buildFile );
	
	});

}

module.exports = {
	buildFile
};