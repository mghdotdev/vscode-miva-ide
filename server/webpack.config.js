// @ts-check

'use strict';

const withDefaults = require( '../shared.webpack.config' );
const path = require( 'path' );

module.exports = withDefaults({
	context: path.join( __dirname ),
	entry: {
		serverMain: './src/serverMain.ts',
	},
	output: {
		filename: '[name].js',
		path: path.join( __dirname, 'out' )
	}
});