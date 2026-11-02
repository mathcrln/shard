import type { App } from 'obsidian';
import type { Recents } from '@/platform/recents';

export class ObsidianRecents implements Recents {
	constructor(private readonly app: App) {}

	paths(): string[] {
		return this.app.workspace.getLastOpenFiles();
	}
}
