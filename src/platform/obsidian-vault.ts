import { getAllTags, parseFrontMatterAliases, type App } from 'obsidian';
import type { Note } from '@/search/note';
import type { Vault } from '@/platform/vault';

export class ObsidianVault implements Vault {
	constructor(private readonly app: App) {}

	notes(): Note[] {
		const vault = this.app.vault;
		const files = vault.getMarkdownFiles();
		const metadata = this.app.metadataCache;

		return files.map((file) => {
			const cache = metadata.getFileCache(file);
			let cachedLinks: readonly string[] | undefined;

			return {
				path: file.path,
				name: file.basename,
				folder: file.parent?.isRoot() ? '' : (file.parent?.path ?? ''),
				aliases: parseFrontMatterAliases(cache?.frontmatter ?? null) ?? [],
				headings: cache?.headings?.map((heading) => heading.heading) ?? [],
				tags: cache ? (getAllTags(cache) ?? []) : [],
				properties: cache?.frontmatter ?? {},
				get links() {
					cachedLinks ??= collectLinks(vault, metadata, file.path);
					return cachedLinks;
				},
			};
		});
	}
}

function collectLinks(vault: App['vault'], metadata: App['metadataCache'], sourcePath: string): readonly string[] {
	const links = new Set<string>();
	for (const [path, count] of Object.entries(metadata.resolvedLinks[sourcePath] ?? {})) {
		if (count <= 0) continue;
		links.add(path);
		const target = vault.getFileByPath(path);
		if (target) links.add(metadata.fileToLinktext(target, '', true));
	}
	for (const [target, count] of Object.entries(metadata.unresolvedLinks[sourcePath] ?? {})) {
		if (count > 0) links.add(target);
	}
	return [...links];
}
