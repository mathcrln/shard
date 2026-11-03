import type { App } from 'obsidian';
import type { ObservedProperty } from '@/models/property-definitions';

type TypeManager = {
	getAllProperties?: () => Record<string, { name?: string; type?: string } | undefined>;
};

/** Reads the properties Obsidian knows about: registered types first, then frontmatter keys in use. */
export class ObsidianProperties {
	constructor(private readonly app: App) {}

	observed(): ObservedProperty[] {
		const found = new Map<string, ObservedProperty>();
		const manager = (this.app as unknown as { metadataTypeManager?: TypeManager }).metadataTypeManager;
		for (const [id, info] of Object.entries(manager?.getAllProperties?.() ?? {})) {
			const key = (info?.name ?? id).trim();
			if (key) found.set(key.toLowerCase(), { key, type: info?.type ?? 'text' });
		}
		for (const file of this.app.vault.getMarkdownFiles()) {
			for (const key of Object.keys(this.app.metadataCache.getFileCache(file)?.frontmatter ?? {})) {
				if (key !== 'position' && !found.has(key.toLowerCase())) found.set(key.toLowerCase(), { key, type: 'text' });
			}
		}
		return [...found.values()];
	}
}
