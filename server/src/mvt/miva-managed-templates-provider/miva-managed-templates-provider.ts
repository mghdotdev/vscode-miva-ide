import { dirname, relative, resolve, sep } from 'path';
import { DocumentLink, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI, Utils } from 'vscode-uri';
import { uriToFsPath } from '../../util/functions';
import { fileIsInFolder, walk } from '../../util/functions-node';
import { MivaTemplateLanguageParsedFragment, MivaTemplateLanguageParsedItem, Workspace } from '../../util/interfaces';

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

	getPath (documentPath: string): string {
		for (let mmtPath of this.mmtPaths) {
			if (fileIsInFolder(documentPath, mmtPath)) {
				return mmtPath;
			}
		}
	}

	private getTargetFromRelativePath (relativePath: string, mmtPath: string): string {
		return URI.parse(resolve(mmtPath, relativePath)).toString();
	}

	private getMmtPathParts (documentPath: string, mmtPath: string): string[] {
		const relativePath = relative(mmtPath, documentPath);

		return relativePath?.split(new RegExp(sep, 'g'));
	}

	async provideLinks (parsedItems: MivaTemplateLanguageParsedItem[], parsedFragments: MivaTemplateLanguageParsedFragment[], document: TextDocument): Promise<DocumentLink[]> {
		const documentPath = uriToFsPath(document.uri);
		const mmtPath = this.getPath(documentPath);
		if (!mmtPath) {
			return [];
		}

		const fileName = Utils.basename(URI.parse(document.uri))?.replace('.mvt', '');
		const foundDashIndex = fileName.indexOf('-');
		const fileNameFirstPart = fileName.slice(0, foundDashIndex === -1 ? undefined : foundDashIndex);
		const fileNameRoot = fileNameFirstPart === fileName
			? fileName
			: fileNameFirstPart;

		const [firstFolder] = this.getMmtPathParts(documentPath, mmtPath) ?? [];

		const links: DocumentLink[] = [];

		for (let parsedItem of parsedItems) {
			const nameLower = parsedItem.name?.toLowerCase();
			const paramNameLower = parsedItem?.param?.toLowerCase();

			switch (nameLower) {
				case 'templatefeed': {
					if (parsedItem.range) {
						const fileNameLower = fileName?.toLowerCase();
						const relativePaths = [
							{
								tooltip: 'Follow link to iterator template',
								path: `./templates/TEMPLATEFEED_iterator-${fileNameLower}-templatefeed.mvt`
							},
							{
								tooltip: 'Follow link to footer template',
								path: `./templates/TEMPLATEFEED_footer-${fileNameLower}-templatefeed.mvt`
							},
							{
								tooltip: 'Follow link to settings template',
								path: `./templates/TEMPLATEFEED_settings-${fileNameLower}-templatefeed.mvt`
							}
						];

						for (let relativePath of relativePaths) {
							const target = this.getTargetFromRelativePath(relativePath.path, mmtPath);

							links.push({
								tooltip: relativePath.tooltip,
								range: parsedItem.range,
								target
							});
						}
					}

					break;
				}
				case 'product_display_imagemachine': {
					const param = paramNameLower?.replace('_deferred', '');

					if (param === 'head') {
						const relativePath = `./templates/${fileNameRoot}-${nameLower}-${param}.mvt`;
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
					switch (paramNameLower) {
						case 'global_header':
						case 'global_footer': {
							const relativePath = `./templates/cssui-${paramNameLower.replace(/_/g, '-')}.mvt`;
							const target = this.getTargetFromRelativePath(relativePath, mmtPath);

							links.push({
								range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
								target
							});
						}
						default:
							break;
					}

					break;
				}
				// <mvt:item name="head" param="head_tag" />
				case 'head': {
					if (paramNameLower === 'head_tag') {
						const relativePath = `./templates/cssui-global-head.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
							target
						});
					}
					// <mvt:item name="head" param="css:mmx-text" />
					else {
						const firstColonIndex = paramNameLower.indexOf(':');
						if (firstColonIndex !== -1) {
							const resourceType = paramNameLower.slice(0, firstColonIndex);
							const resourceName = paramNameLower.slice(firstColonIndex + 1);

							const relativePath = `./${resourceType}/${resourceName}.json`;
							const target = this.getTargetFromRelativePath(relativePath, mmtPath);

							links.push({
								range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
								target
							});
						}
					}

					break;
				}
				// <mvt:item name="html_profile" />
				case 'html_profile': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${nameLower.replace(/_/g, '-')}.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'buttons': {
					const relativePath = `./properties/cssui_button/${paramNameLower}.mvt`;
					const target = this.getTargetFromRelativePath(relativePath, mmtPath);

					links.push({
						range: Range.create(document.positionAt(parsedItem.expression.start), document.positionAt(parsedItem.expression.end)),
						target
					});

					break;
				}
				case 'breadcrumbs': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-${nameLower}.mvt`;
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
							case 'load_banner':
							case 'banner':
							case 'load_image':
							case 'image': {
								const firstParameterString = fn?.parameters?.[0]?.strings?.[0];

								if (firstParameterString) {
									const relativePath = `./properties/readytheme_${fnTextLower?.replace('load_', '')}/${firstParameterString?.text}.json`;
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
				case 'facets': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-prodlist-facets.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'navbar': {
					if (parsedItem.range) {
						const relativePath = `./templates/cssui-navbar.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				case 'category_tree': {
					if (parsedItem.range) {
						const relativePath = `./templates/cattree.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
				default: {
					if (!paramNameLower && firstFolder === 'templates' && fileNameFirstPart !== 'cssui') {
						const relativePath = `./templates/${fileNameRoot}-${nameLower}.mvt`;
						const target = this.getTargetFromRelativePath(relativePath, mmtPath);

						links.push({
							range: parsedItem.range,
							target
						});
					}

					break;
				}
		}
		}

		for (let parsedFragment of parsedFragments) {
			const codeLower = parsedFragment.code.toLowerCase();

			const relativePath = `./templates/${codeLower}.mvt`;
			const target = this.getTargetFromRelativePath(relativePath, mmtPath);

			links.push({
				range: parsedFragment.range,
				target
			});
		}

		return links;
	}
}
