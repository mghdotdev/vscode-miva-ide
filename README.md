# Miva IDE README

A comprehensive syntax, autocompletion, and snippet package for Miva Script & MVT. This package will assist developers working within the Miva environment. Either module development with Miva Script, or site development with MVT.

## Features

- Syntax highlighting for Miva Script and MVT languages.
- Syntax highlighting for MVT embedded in CSS and MVT embedded in JavaScript (MVTCSS, MVTJS)
- Autocompletion for Miva Script and MVT tags.
- Autocompletion for `<mvt:do>`/`<MvDO>` functions with automatic file path injection.
- Goto defintion/peek support for `<mvt:do>`/`<MvDO>` functions (requires copy of LSK on your computer).
- Autocompletion for system variables, global variables and local variables with automatic parsing of open files.
- Documentation is displayed inline when hovering over variables, functions and tags.
- Custom tag folding.
- Snippets for common MVT features including custom fields, readytheme and more.
- Function that converts entities => variables and variables => entities.
- Function that calculates the current `l.posX` variable at your current cursor position.
- Provides warning and error messages and hints users about Miva best practices:
	- Warns user about XSS vulnerabilities by outputting (via entity or `mvt:eval`) unencoded global variables within their files.
	- Warns users about using `toolkit` module functions.
	- Warns users about using `toolbelt` module functions.
	- Throws error about assigning `g.null` to a new value.

## Requirements

### Goto Definition Support for Miva Merchant Functions

Enable support for goto function definition by following the steps below. This will allow you to jump to wherever the hovered `mvt:do`, `<MvDO>` or `[].*` funcion is defined within Miva Merchant's Limited Source Kit.

* Download the latest [LSK version](https://apps.miva.com/miva-merchant-limited-source-kit.html) and save it to your computer.
* Configure the setting `LSK.path` to point to the downloaded folder.

## Extension Settings

Miva IDE contributes the following settings:

* `LSK.path` &mdash; Path to your LSK folder. Used for Goto Definition support.
* `mivaIde.MVT.defaultEncodingForVariableConversions` &mdash; The encoding type that will be used when converting a variable to an entity.
* `mivaIde.MVT.lint.showWarningOnToolkitUsage` &mdash; Show a warning when the 'toolkit' item is referenced within the template.
* `mivaIde.MVT.lint.showWarningOnToolbeltUsage` &mdash; Show a warning when the 'toolbelt' item is referenced within the template.
* `mivaIde.MVT.lint.showWarningForUnencodedVariables` &mdash; Show a warning when unencoded entities and 'evals' are referenced within the file.

## Known Issues

None.

## Release Notes

See [CHANGELOG](https://github.com/mghweb/vscode-miva-ide/blob/master/CHANGELOG.md).