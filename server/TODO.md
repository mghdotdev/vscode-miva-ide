see https://github.com/microsoft/vscode-html-languageservice/blob/main/src/htmlLanguageService.ts

[ ] Split mvps-* "tags" into separate snippets file
[ ] Pull snippet data from external: extension? data file? user setting? setting to disable MVPS snippets by default?

[ ] Rewrite "getLanguageFeatures" pattern to be class-based system. Have option to pass alternative language server as fallback (html, js, css)
[ ] Create parser MVTDocument, MVDocument class to handle shared functionality (getLeft, getRight, getHover, getTags stuff like that) model after html language server parser
	- use language cache to store parsing in memory
[ ] standardize tag data format by removing duplicate content (markdown format, snippet format stuff like that)
[ ] create class for transforming all tag data to related completion/hover/link formatting