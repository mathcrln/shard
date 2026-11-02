import { Notice, type Plugin } from 'obsidian';
import type { CreateModelNote } from '@/models/note-creation';
import { Settings } from '@/models/plugin-settings';
import { NoteModels } from '@/models/note-models';
import { ObsidianCommands } from '@/platform/obsidian-commands';
import { ObsidianRecents } from '@/platform/obsidian-recents';
import { ObsidianVault } from '@/platform/obsidian-vault';
import { ObsidianWorkspace } from '@/platform/obsidian-workspace';
import { ObsidianNoteCreation } from '@/platform/obsidian-note-creation';
import { Search } from '@/queries/search';
import { ModelNotes } from '@/queries/model-notes';

export class Shard {
	private constructor(
		readonly settings: Settings,
		readonly search: Search,
		readonly models: NoteModels,
		readonly modelNotes: ModelNotes,
		readonly createNote: CreateModelNote,
		private readonly persist: () => Promise<void>
	) {}

	static async boot(plugin: Plugin): Promise<Shard> {
		const { app } = plugin;
		const data: unknown = await plugin.loadData();
		const stored = typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
		const settings = Settings.from(data);
		let pending = Promise.resolve();
		const persist = (): Promise<void> => {
			const snapshot = { ...stored, ...settings.toJSON(), models: models.toJSON() };
			pending = pending.catch(() => undefined).then(() => plugin.saveData(snapshot));
			return pending;
		};
		const storedModels = 'models' in stored ? stored.models : undefined;
		const models = NoteModels.from(storedModels, persist);
		const vault = new ObsidianVault(app);
		const modelNotes = new ModelNotes(vault, models);
		const creation = new ObsidianNoteCreation(app);
		const createNote: CreateModelNote = async (model, title) => {
			const current = models.get(model.id);
			if (!current) throw new Error('This model is no longer available.');
			const file = await creation.create({
				title,
				folder: current.creation?.folder ?? '',
				template: current.creation?.template ?? '',
			});
			try {
				await app.workspace.getLeaf(false).openFile(file);
			} catch {
				new Notice(`Created ${file.basename}, but could not open it.`);
			}
		};

		return new Shard(
			settings,
			new Search({
				vault,
				recents: new ObsidianRecents(app),
				workspace: new ObsidianWorkspace(app),
				commands: new ObsidianCommands(app),
				settings,
				models,
				modelNotes,
			}),
			models,
			modelNotes,
			createNote,
			persist
		);
	}

	saveSettings(): Promise<void> {
		return this.persist();
	}
}
