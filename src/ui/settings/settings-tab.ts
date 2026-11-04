import { Component, PluginSettingTab } from 'obsidian';
import type { Plugin, SettingDefinitionItem } from 'obsidian';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { NoteModel } from '@/models/note-model';
import type { NoteModels } from '@/models/note-models';
import { Settings } from '@/models/plugin-settings';
import type { ShardSettings } from '@/models/plugin-settings';
import type { Note } from '@/search/note';
import { ModelSettings } from '@/ui/settings/model-settings';
import { PropertySettings } from '@/ui/settings/property-settings';
import type { ObservedProperty, PropertyDefinitions } from '@/models/property-definitions';
import { searchPreferences } from '@/ui/settings/search-preferences';
import { FilterContext } from '@/ui/settings/filters/filter-context';
import { ObsidianFilterCatalog } from '@/platform/obsidian-filter-catalog';
import { ShardException } from '@/exceptions/shard-exception';

export interface SettingsTabOptions {
	settings: Settings;
	save: () => Promise<void>;
	models?: NoteModels;
	findNotes?: (model: NoteModel) => Note[];
	properties?: PropertyDefinitions;
	observedProperties?: () => ObservedProperty[];
}

export class SettingsTab extends PluginSettingTab {
	private readonly cleanups = new Set<() => void>();

	constructor(
		plugin: Plugin,
		private readonly options: SettingsTabOptions
	) {
		super(plugin.app, plugin);
		plugin.register(() => {
			for (const cleanup of this.cleanups) cleanup();
		});
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const items: SettingDefinitionItem[] = [];
		const { models, findNotes } = this.options;
		if (models && findNotes) {
			const item: SettingDefinitionItem = {
				name: 'Models',
				aliases: ['Keywords', 'Folders', 'Tags', 'Properties', ...models.all.map((model) => model.name)],
				render: (setting) => {
					const catalog = new ObsidianFilterCatalog(this.app);
					const context = { app: this.app, catalog };
					return this.mount(
						setting.settingEl,
						(revision) =>
							createElement(
								FilterContext.Provider,
								{ value: context },
								createElement(ModelSettings, {
									models,
									findNotes,
									openNote: (note) => this.openNote(note),
									revision,
								})
							),
						() => catalog.invalidate()
					);
				},
			};
			items.push({ type: 'group', heading: 'Models', items: [item] });
		}
		const { properties, observedProperties } = this.options;
		if (models && properties && observedProperties) {
			items.push({
				type: 'group',
				heading: 'Properties',
				items: [
					{
						name: 'Properties',
						aliases: ['Description', 'Order', 'Keyword', ...properties.all.map((property) => property.key)],
						render: (setting) =>
							this.mount(setting.settingEl, (revision) =>
								createElement(PropertySettings, {
									definitions: properties,
									models,
									observed: observedProperties,
									revision,
								})
							),
					},
				],
			});
		}
		items.push(searchPreferences());
		return items;
	}

	getControlValue(key: string): unknown {
		const values = this.options.settings.toJSON();
		return Object.hasOwn(values, key) ? values[key as keyof ShardSettings] : undefined;
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === 'recentNotes' && Settings.isRecentNotes(value)) {
			this.options.settings.update({ recentNotes: value });
		} else if (
			(key === 'commandsOnOpen' || key === 'searchHeadings' || key === 'unifiedSearch') &&
			typeof value === 'boolean'
		) {
			this.options.settings.update({ [key]: value });
		} else {
			return;
		}
		try {
			await this.options.save();
		} catch (error) {
			ShardException.render(error);
		}
	}

	private mount(element: HTMLElement, view: (revision: number) => ReactNode, notesChanged?: () => void): () => void {
		element.empty();
		element.addClass('shard-settings-row');
		const root = createRoot(element);
		const lifecycle = new Component();
		let revision = 0;
		const render = (): void => root.render(view(revision++));
		lifecycle.load();
		if (notesChanged) {
			const refresh = (): void => {
				notesChanged();
				render();
			};
			lifecycle.registerEvent(this.app.metadataCache.on('changed', refresh));
			lifecycle.registerEvent(this.app.metadataCache.on('resolved', refresh));
			lifecycle.registerEvent(this.app.vault.on('create', refresh));
			lifecycle.registerEvent(this.app.vault.on('delete', refresh));
			lifecycle.registerEvent(this.app.vault.on('rename', refresh));
		}
		render();
		const cleanup = (): void => {
			if (!this.cleanups.delete(cleanup)) return;
			lifecycle.unload();
			root.unmount();
		};
		this.cleanups.add(cleanup);
		return cleanup;
	}

	private openNote(note: Note): void {
		void this.app.workspace.openLinkText(note.path, '', false).catch(ShardException.render);
	}
}
