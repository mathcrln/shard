import { Component, Platform } from 'obsidian';
import type { Modal, Plugin } from 'obsidian';
import type { Search } from '@/queries/search';
import { BarModal } from '@/ui/bar/bar-modal';
import { NativeBarModal } from '@/ui/bar/native-bar-modal';
import { BarState } from '@/ui/bar/bar-state';

export class Commands extends Component {
	private modal: Modal | undefined;

	constructor(
		private readonly plugin: Plugin,
		private readonly search: Pick<Search, 'find'>
	) {
		super();
	}

	onload(): void {
		this.register(() => {
			this.modal?.close();
			this.modal = undefined;
		});

		this.plugin.addCommand({
			id: 'open-bar',
			name: 'Open bar',
			callback: () => {
				this.modal?.close();
				this.modal = Platform.isMobile
					? new NativeBarModal(this.plugin.app, this.search)
					: new BarModal(this.plugin.app, new BarState(this.search));
				this.modal.open();
			},
		});
	}
}
