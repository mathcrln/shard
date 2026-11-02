import type { Plugin } from 'obsidian';
import { Settings } from '@/models/plugin-settings';
import { ObsidianCommands } from '@/platform/obsidian-commands';
import { ObsidianRecents } from '@/platform/obsidian-recents';
import { ObsidianVault } from '@/platform/obsidian-vault';
import { ObsidianWorkspace } from '@/platform/obsidian-workspace';
import { Search } from '@/queries/search';

export class Shard {
	private constructor(
		readonly settings: Settings,
		readonly search: Search,
		private readonly plugin: Plugin
	) {}

	static async boot(plugin: Plugin): Promise<Shard> {
		const { app } = plugin;
		const settings = Settings.from(await plugin.loadData());

		return new Shard(
			settings,
			new Search({
				vault: new ObsidianVault(app),
				recents: new ObsidianRecents(app),
				workspace: new ObsidianWorkspace(app),
				commands: new ObsidianCommands(app),
				settings,
			}),
			plugin
		);
	}

	saveSettings(): Promise<void> {
		return this.plugin.saveData(this.settings.toJSON());
	}
}
