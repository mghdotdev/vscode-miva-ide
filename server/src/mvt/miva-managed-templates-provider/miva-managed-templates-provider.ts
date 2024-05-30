import { dirname, resolve } from 'path';
import { DocumentLink, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI, Utils } from 'vscode-uri';
import { uriToFsPath } from '../../util/functions';
import { fileIsInFolder, walk } from '../../util/functions-node';
import { MivaTemplateLanguageParsedItem, Workspace } from '../../util/interfaces';

export class MivaMangedTemplatesProvider {
	private mmtPaths: Set<string> = new Set();

	/**
	 * Attempt to find the "base path" that contains the mmt folder within the workspace
	 */
	async setPaths (workspace: Workspace) {
		this.mmtPaths = new Set();

		for (let workspaceFolder of workspace?.folders) {
			const workspaceFolderPath = uriToFsPath(workspaceFolder.uri);
			const foundPaths = (await walk(workspaceFolderPath, '.mmt/config.json')) ?? [];

			for (let foundPath of foundPaths) {
				this.mmtPaths.add(resolve(dirname(foundPath), '..'))
			}
		}
	}

	getPath (documentUri: string): string {
		const documentPath = uriToFsPath(documentUri);

		for (let mmtPath of this.mmtPaths) {
			if (fileIsInFolder(documentPath, mmtPath)) {
				return mmtPath;
			}
		}
	}

	async provideLinks (parsedItems: MivaTemplateLanguageParsedItem[], document: TextDocument, workspace: Workspace): Promise<DocumentLink[]> {
		const mmtPath = this.getPath(document.uri);
		if (!mmtPath) {
			return [];
		}

		const fileName = Utils.basename(URI.parse(document.uri))?.replace('.mvt', '');

		const links: DocumentLink[] = [];

		for (let parsedItem of parsedItems) {
			switch (parsedItem.name) {
				case 'html_profile': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${parsedItem.name.replace(/_/g, '-')}.mvt`;
						const target = URI.parse(resolve(mmtPath, relativePath)).toString();

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'buttons': {
					const relativePath = `./properties/cssui_button/${parsedItem.param}.mvt`;
					const target = URI.parse(resolve(mmtPath, relativePath)).toString();

					links.push({
						range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
						target
					});

					break;
				}
				case 'breadcrumbs': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${parsedItem.name}.mvt`;
						const target = URI.parse(resolve(mmtPath, relativePath)).toString();

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'readytheme': {
					for (let fn of parsedItem?.expression?.functions) {
						const fnTextLower = fn.text?.toLowerCase();

						switch (fnTextLower) {
							case 'load_navigationset':
							case 'navigationset':
							case 'load_contentsection':
							case 'contentsection': {
								const firstParameterString = fn?.parameters?.[0]?.strings?.[0];

								if (firstParameterString) {
									const relativePath = `./properties/readytheme_${fnTextLower?.replace('load_', '')}/${firstParameterString?.text}.mvt`;
									const target = URI.parse(resolve(mmtPath, relativePath)).toString();

									links.push({
										range: Range.create(document.positionAt(firstParameterString.start), document.positionAt(firstParameterString.end)),
										target
									});
								}

								break;
							}
							default:
								break;
						}
					}

					break;
				}
				default:
					break;
			}
		}

		return links;
	}
}
