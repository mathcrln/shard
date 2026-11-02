import { parseFrontMatterAliases, type App } from 'obsidian';
import type { Note } from '@/search/note';
import type { Vault } from '@/platform/vault';

export class ObsidianVault implements Vault {
	constructor(private readonly app: App) {}

	notes(): Note[] {
		return this.app.vault.getMarkdownFiles().map((file) => {
			const cache = this.app.metadataCache.getFileCache(file);

			return {
				path: file.path,
				name: file.basename,
				folder: file.parent?.isRoot() ? '' : (file.parent?.path ?? ''),
				aliases: parseFrontMatterAliases(cache?.frontmatter ?? null) ?? [],
				headings: cache?.headings?.map((heading) => heading.heading) ?? [],
			};
		});
	}
}
