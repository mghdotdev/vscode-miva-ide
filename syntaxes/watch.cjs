/* eslint-disable no-unreachable */
/* eslint-disable no-invalid-this */
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
const {buildFile} = require('./build.cjs');

const globPattern = './**/*.yaml';

console.log(chalk.blue(`Watching files: ${ globPattern }`));

function onWatch (eventType, filename) {

	console.log(chalk.green(`Watcher: Triggered for file: ${ chalk.underline(filename) }`));

	buildFile(String(this));

}

glob(globPattern, function (err, files) {

	if (err) {
		throw new Error(err);
		return;
	}

	files.forEach(function (file) {

		fs.watch(file, {persistent: true}, onWatch.bind(file));

	});

});
