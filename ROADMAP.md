# Miva IDE (VSCode) Roadmap

Our VSCode extension is a vital tool for web development on the Miva platform. It provides the following benefits:

1. Improved code quality. Developers benefit from built-in best practices provided automatically to them via diagnostic tools, snippets and syntax highlighting. This increases confidence in our code since the extension will catch common errors before we even upload the changes to Miva. Also, it encourages developers to adhere to our code standards.
2. Increased productivity. Developers can organize their code easily using the VSCode "Explorer" view. Our extension enhances this feature by allowing Go-To Definition support as well as Go-To Symbols (variables, functions, etc...).
3. Increased efficiency. By providing keyboard shortcuts, code auto-completion and useful templates developers can focus directly on coding the customer's unique business rules and focus less on syntax or having to read external documentation.

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

### v0.X.0 (2-5 hrs per version upgrade)

This is the existing development flow. When new LSK or Empressa versions are released I simply update the code completion data to include the new functions.

- Add additional `<mvt:do>`/`<MvDO>` function completions as future LSK versions are released.
- Add additional built-in function completions & documentation as future Miva Empressa engines are released.


### v1.0.0 (75-100 hrs)

This version will focus on adding missing Language Extension features and enhancing existing ones. Even after version 1.0 I will still bring over new updates to LSK and Empressa via the same method as before.

- Upgraded internal tooling dependencies (vscode CLI, typescript, etc...). This improves overall extension health by keeping it's tooling on the latest versions.
- Improved tag completion, enhanced documentation and context. Enhance where the tag completions display and when. Right now you can complete mvt tags WITHIN other mvt tags. This enhancement would prevent the ability to complete where you're not supposed to. Add symbol hover documentation directly from [docs.miva.com](https://docs.miva.com).
- Improved function completion (builtin), documentation and context. Improve the completion provider for builtin functions to only complete in the correct MVT tag expressions. Also, provide hover documentation.
- Improved `<mvt:item>` completion, documentation. Allow for `name` and `param` matching completion pairs similar to the existing `<mvt:do>` functionality.
- Add Code Action language feature to fix existing diagnostic call outs. For example, a developer attemtpts to output a global variable as an entity. Right now, I am able to provide a warning/error for that issue. With this new feature addition you will be able to fix the issue automatically by selecting a fix from a dropdown list.
- Display common problems/code errors (like toolkit's tksl) to catch errors and enforce code quality.

### v1.X.X (TBD)

Continue to update completion data when new LSK or Empressa versions are released. Also, fix any bugs or issues as they arise.

### v2.0.0 (TBD)

This is a semi-rewrite of the extension. It will use a newly created Language Service package to handle most of the file parsing. The parsed file generated from the package will improve overall performance, allow me to add missing Language Extension features and provide an easier to maintain extension for future changes. Also, I will focus on adding a `mmt` integration directly into the extension.

- Full `mmt` support via VSCode's Source Control API. This will allow users interact with `mmt` via the VSCode user interface. Features include:
	- Automatic file diffing.
	- Create / delete and push branches.
	- Commit file changes and write notes.
	- Status bar widget that informs the user what remote, branch and changeset they are currently working with.
- Split Mivascript / MVT language service into separate packages. This will make it easier to maintain the intricacies of each language. Also, it aligns the Embedded Language extension guide: https://code.visualstudio.com/api/language-extensions/embedded-languages
- A Mivascript/MVT parser class written in Node that will be used to improve existing parsing performance add missing language server features including:
	- Rename symbol: Allows users to highlight a variable and rename all references within the file.
	- Code Actions: Allows users to automatically fix common issues in the current file.
	- Document Links: Provide links to templates from the `<mvt:item>` tag / readtheme functions.
	- Document Formatting: Automatically format the code to follow our coding standards (spacing, indentation, etc...).
	- Linting: Show basic syntax errors and pre-compilation errors before having to test your code on the server.
	- See all features here: https://code.visualstudio.com/api/language-extensions/programmatic-language-features