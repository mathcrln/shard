import { PluginSettingTab } from 'obsidian';
import type { Plugin, SettingDefinitionGroup, SettingDefinitionItem } from 'obsidian';
import { MAX_RECENT_NOTES, Settings } from '@/models/plugin-settings';
import type { ShardSettings } from '@/models/plugin-settings';
import { Bindings } from '@/ui/settings/shared/bindings';
import { Form } from '@/ui/settings/shared/form';

export interface SettingsTabOptions {
	settings: Settings;
	save: () => Promise<void>;
}

export class SettingsTab extends PluginSettingTab {
	private readonly bindings = new Bindings();

	constructor(
		plugin: Plugin,
		private readonly options: SettingsTabOptions
	) {
		super(plugin.app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		this.bindings.clear();

		const form = new Form<ShardSettings>({
			bindings: this.bindings,
			read: () => this.options.settings.toJSON(),
			write: async (changes) => {
				this.options.settings.update(changes);
				await this.options.save();
			},
		});

		return [this.opening(form), this.search(form)];
	}

	getControlValue(key: string): unknown {
		return this.bindings.read(key);
	}

	setControlValue(key: string, value: unknown): Promise<void> {
		return this.bindings.write(key, value);
	}

	private opening(form: Form<ShardSettings>): SettingDefinitionGroup {
		return {
			type: 'group',
			heading: 'When the bar opens',
			items: [
				{
					name: 'Show commands',
					desc: 'List a few commands above your recent notes before you type.',
					control: form.toggle('commandsOnOpen'),
				},
				{
					name: 'Recent notes',
					desc: `How many recent notes to list before you type, from 1 to ${MAX_RECENT_NOTES}.`,
					control: form.number('recentNotes', (value) => Settings.isRecentNotes(value), {
						min: 1,
						max: MAX_RECENT_NOTES,
						step: 1,
						validate: (value) =>
							Settings.isRecentNotes(value) ? undefined : `Enter a whole number from 1 to ${MAX_RECENT_NOTES}.`,
					}),
				},
			],
		};
	}

	private search(form: Form<ShardSettings>): SettingDefinitionGroup {
		return {
			type: 'group',
			heading: 'Search',
			items: [
				{
					name: 'Search headings',
					desc: 'Include headings inside notes in the results.',
					control: form.toggle('searchHeadings'),
				},
			],
		};
	}
}
