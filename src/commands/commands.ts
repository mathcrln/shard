import { Component, Platform } from 'obsidian';
import type { Modal, Plugin } from 'obsidian';
import type { Search } from '@/queries/search';
import type { Settings } from '@/models/plugin-settings';
import type { CreateModelNote } from '@/models/note-creation';
import { BarModal } from '@/ui/bar/bar-modal';
import { NativeBarModal } from '@/ui/bar/native-bar-modal';
import { BarState } from '@/ui/bar/bar-state';

export class Commands extends Component {
	private modal: Modal | undefined;

	constructor(
		private readonly plugin: Plugin,
		private readonly search: Pick<Search, 'find'>,
		private readonly settings: Pick<Settings, 'unifiedSearch'> = { unifiedSearch: false },
		private readonly createNote?: CreateModelNote
	) {
		super();
	}

	onload(): void {
		this.register(() => {
			this.modal?.close();
			this.modal = undefined;
		});

		const entries = [
			{ id: 'open-bar', name: 'Open bar', query: '' },
			{ id: 'open-files', name: 'Open files', query: '' },
			{ id: 'open-commands', name: 'Open commands', query: '>' },
		] as const;

		for (const entry of entries) {
			this.plugin.addCommand({
				id: entry.id,
				name: entry.name,
				callback: () => this.open(entry.query),
			});
		}
	}

	private open(query: string): void {
		const options = { query, unifiedSearch: this.settings.unifiedSearch };
		this.modal?.close();
		this.modal = Platform.isMobile
			? new NativeBarModal(this.plugin.app, this.search, options, this.createNote)
			: new BarModal(this.plugin.app, new BarState(this.search, options), this.createNote);
		this.modal.open();
	}
}
