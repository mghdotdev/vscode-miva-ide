# Miva IDE (VSCode) Roadmap

Our VSCode extension is a vital tool for working with all things Miva.

## Existing Features

- Syntax highlighting for Mivascript and MVT languages.
- Syntax highlighting for MVT embedded in CSS and MVT embedded in JavaScript (MVTCSS, MVTJS)
- Autocompletion for Mivascript and MVT tags.
- Autocompletion for `<mvt:do>`/`<MvDO>` functions with automatic file path injection.
- Goto defintion/peek support for `<mvt:do>`/`<MvDO>` functions (requires copy of LSK on your computer).
- Autocompletion for system variables, global variables and local variables with automatic parsing of open files.
- Custom tag folding.
- Snippets for common MVT features including custom fields, readytheme and more.
- Function that converts entities => variables and variables => entities.
- Function that calculates the current `l.posX` variable at your current cursor position.
- Provides warning and error messages and hints users about Miva best practices:
	- Warns user about XSS vulnerabilities by outputting (via entity or `mvt:eval`) unencoded global variables within their files.
	- Warns users about using `toolkit` module functions.
	- Warns users about using `toolbelt` module functions.
	- Throws error about assigning `g.null` to a new value.

## Future Versions

### v1.0.0

- Improved tag completion

### v1.X.X

- Add additional `<mvt:do>`/`<MvDO>` function completions as future LSK versions are released.
- Add additional built-in function completions & documentation as future Miva Empressa engines are released.

### v2.0.0

- Full `mmt` support via VSCode's Source Control API. This will allow users interact with `mmt` via the VSCode user interface. Features include:
	- Automatic file diffing.
	- Create / delete and push branches.
	- Commit file changes and write notes.
	- Status bar widget that informs the user what remote, branch and changeset they are currently working with.
- Split Mivascript / MVT language service into separate packages. This will make it easier to maintain the intricacies of each language. Also, it aligns the Embedded Language extension guide: https://code.visualstudio.com/api/language-extensions/embedded-languages
- A Mivascript/MVT parser class written in Node that will be used to add missing language server features including:
	- Rename symbol: Allows users to highlight a variable and rename all references within the file.
	- Code Actions: Allows users to automatically fix common issues in the current file.
	- Document Links: Provide links to templates from the `<mvt:item>` tag / readtheme functions.
	- See all features here: https://code.visualstudio.com/api/language-extensions/programmatic-language-features