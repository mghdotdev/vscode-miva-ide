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

	private getTargetFromRelativePath (relativePath: string, mmtPath: string): string {
		return URI.parse(resolve(mmtPath, relativePath)).toString();
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
				case 'product_display_imagemachine': {
					const param = parsedItem.param?.replace('_deferred', '');

					if (param === 'head') {
						const relativePath = `./templates/${fileName}-${parsedItem.name}-${param}.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
							target
						});
					}
					break;
				}
				// <mvt:item name="hdft" param="global_header" /> | <mvt:item name="hdft" param="global_footer" />
				case 'hdft': {
					const relativePath = `./templates/cssui-${parsedItem.param.replace(/_/g, '-')}.mvt`;
					const target = this.getTargetFromRelativePath(relativePath, mmtPath);

					links.push({
						range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
						target
					});

					break;
				}
				// <mvt:item name="head" param="head_tag" />
				case 'head': {
					if (parsedItem.param === 'head_tag') {
						const relativePath = `./templates/cssui-global-head.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
							target
						});
					}

					break;
				}
				// <mvt:item name="html_profile" />
				case 'html_profile': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${parsedItem.name.replace(/_/g, '-')}.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'buttons': {
					const relativePath = `./properties/cssui_button/${parsedItem.param}.mvt`;
					const target = this.getTargetFromRelativePath(relativePath, mmtPath);

					links.push({
						range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
						target
					});

					break;
				}
				case 'breadcrumbs': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${parsedItem.name}.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

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
									const target = this.getTargetFromRelativePath(relativePath, mmtPath);

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
