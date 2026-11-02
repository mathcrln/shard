import { Plugin } from 'obsidian';
import { Commands } from '@/commands/commands';
import { Shard } from '@/shard';
import { SettingsTab } from '@/ui/settings/settings-tab';

export default class ShardPlugin extends Plugin {
	async onload(): Promise<void> {
		const shard = await Shard.boot(this);

		this.addSettingTab(new SettingsTab(this, { settings: shard.settings, save: () => shard.saveSettings() }));
		this.addChild(new Commands(this, shard.search));
	}
}
