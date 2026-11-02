import { Modal, Notice, Platform, type App } from 'obsidian';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BarView } from '@/ui/bar/bar-view';
import type { BarState } from '@/ui/bar/bar-state';
import { keysOf } from '@/ui/bar/shortcut';
import { shortcuts, type Shortcut } from '@/search/action';

export class BarModal extends Modal {
	private root: Root | null = null;

	constructor(
		app: App,
		private readonly bar: BarState
	) {
		super(app);
		this.titleEl.detach();
		this.containerEl.addClass('shard-overlay');
		this.modalEl.addClass('shard-bar');
		this.modalEl.setAttribute('aria-label', 'Shard');
		this.contentEl.addClass('shard-content');
		this.bindKeys();
	}

	onOpen(): void {
		this.containerEl.querySelectorAll('.modal-close-button').forEach((button) => button.remove());
		this.root = createRoot(this.contentEl);
		this.render();
	}

	onClose(): void {
		this.root?.unmount();
		this.root = null;
	}

	private render(): void {
		this.root?.render(
			createElement(BarView, {
				bar: this.bar,
				mac: Platform.isMacOS,
				onChange: () => this.render(),
				onRun: () => this.run(),
			})
		);
	}

	private bindKeys(): void {
		this.scope.register([], 'ArrowDown', () => this.move(() => this.bar.next()));
		this.scope.register([], 'ArrowUp', () => this.move(() => this.bar.previous()));
		this.scope.register(['Mod'], 'k', () => this.move(() => this.bar.toggleActions()));
		this.scope.register([], 'Enter', (event) => (event.isComposing ? undefined : this.run()));
		this.scope.register([], 'Escape', () => (this.bar.actionsOpen ? this.move(() => this.bar.closeActions()) : this.close()));

		for (const shortcut of shortcuts) {
			const { modifiers, key } = keysOf(shortcut);
			this.scope.register(modifiers, key, () => this.run(shortcut));
		}
	}

	private move(change: () => void): false {
		change();
		this.render();

		return false;
	}

	private run(shortcut?: Shortcut): false {
		try {
			if (shortcut) this.bar.runShortcut(shortcut, () => this.close());
			else this.bar.run(() => this.close());
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not run this action.');
		}

		return false;
	}
}
