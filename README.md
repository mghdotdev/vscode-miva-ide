# Miva IDE README

A comprehensive syntax, autocompletion, and snippet package for Miva Script & MVT. This package will assist developers working within the Miva environment. Either module development with Miva Script, or site development with MVT.

## Features

* Syntax highlighting for Miva Script and MVT languages.
* Autocomplete and language intelligence for Miva Script and MVT languages.
* Goto Definition support for variables and functions.
* Code actions and problem matcher for MVT.
* Snippets for Miva Script and MVT.
* Supports Emmet expressions for non Miva tags.
* Includes inline documentation and support for the latest Miva Merchant and Empressa Builtin functions.

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