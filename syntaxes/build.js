// npx js-yaml syntaxes/mvt.tmLanguage.yaml > syntaxes/mvt.tmLanguage.json && npx js-yaml syntaxes/mvt.injection.tmLanguage.yaml > syntaxes/mvt.injection.tmLanguage.json
const yaml = require( 'js-yaml' );
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );


glob( './**/*.yaml', function( err, files ) {

	if ( err ) {
		throw new Error( err );
		return;
	}
	
	files.map(function( file ) {

		const pathInfo = path.parse( file );
		const obj = yaml.safeLoad( fs.readFileSync( file, 'utf8' ) );

		if ( obj ) {

			fs.writeFileSync( `${ pathInfo.dir + path.sep + pathInfo.name }.json`, JSON.stringify( obj, null, 2 ), 'utf8' );

		}

	});

});