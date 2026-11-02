import { Keymap, Menu, Notice, Platform, SuggestModal } from 'obsidian';
import type { App } from 'obsidian';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { Search } from '@/queries/search';
import type { Action } from '@/search/action';
import { shortcuts } from '@/search/action';
import type { Result } from '@/search/result';
import { NativeResult } from '@/ui/bar/native-result';
import { keysOf, labelOf } from '@/ui/bar/shortcut';

export class NativeBarModal extends SuggestModal<Result> {
	private readonly roots = new Set<Root>();
	private readonly groupStarts = new Set<Result>();
	private menu: Menu | undefined;
	private selectingActions = false;

	constructor(
		app: App,
		private readonly search: Pick<Search, 'find'>
	) {
		super(app);
		this.containerEl.addClass('shard-native-container');
		this.modalEl.addClass('shard-native');
		this.setPlaceholder('Search notes or commands…');
		this.setInstructions([]);
		this.limit = 100;
		this.emptyStateText = 'No results found. Try another name or command.';
		this.inputEl.setAttribute('aria-label', 'Search notes and commands');
		this.inputEl.autocapitalize = 'off';
		this.inputEl.spellcheck = false;
		this.removeCloseButtons();
		this.scope.register(['Mod'], 'k', (event) => {
			this.selectingActions = true;
			try {
				this.selectActiveSuggestion(event);
			} finally {
				this.selectingActions = false;
			}
			return false;
		});
		for (const shortcut of shortcuts) {
			const { modifiers, key } = keysOf(shortcut);
			this.scope.register(modifiers, key, (event) => {
				this.selectActiveSuggestion(event);
				return false;
			});
		}
	}

	onOpen(): void {
		void super.onOpen();
		this.removeCloseButtons();
	}

	onClose(): void {
		this.menu?.hide();
		this.menu = undefined;
		this.clearResults();
		super.onClose();
	}

	getSuggestions(query: string): Result[] {
		this.clearResults();
		this.groupStarts.clear();
		try {
			const results = this.search.find(query);
			if (new Set(results.map((result) => result.group)).size > 1) {
				let previous: string | undefined;
				for (const result of results) {
					if (result.group !== previous) this.groupStarts.add(result);
					previous = result.group;
				}
			}
			return results;
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not search.');
			return [];
		}
	}

	renderSuggestion(result: Result, element: HTMLElement): void {
		if (this.groupStarts.has(result)) element.dataset['shardGroup'] = result.group;
		else delete element.dataset['shardGroup'];
		const root = createRoot(element);
		this.roots.add(root);
		root.render(createElement(NativeResult, { result, onActions: (event) => this.showActions(result, event) }));
	}

	selectSuggestion(result: Result, event: MouseEvent | KeyboardEvent): void {
		if (this.selectingActions) {
			this.showActions(result);
			return;
		}
		super.selectSuggestion(result, event);
	}

	onChooseSuggestion(result: Result, event: MouseEvent | KeyboardEvent): void {
		const shortcut = Keymap.isModifier(event, 'Mod') ? (event.altKey ? 'Mod+Alt+Enter' : 'Mod+Enter') : undefined;
		this.run(shortcut ? result.actions.find((action) => action.shortcut === shortcut) : result.actions[0]);
	}

	private showActions(result: Result, event?: MouseEvent): void {
		this.menu?.hide();
		const menu = new Menu().setNoIcon();
		for (const action of result.actions) {
			const shortcut = action.shortcut ? ` ${labelOf(action.shortcut, { mac: Platform.isMacOS })}` : '';
			menu.addItem((item) =>
				item.setTitle(action.name + shortcut).onClick(() => {
					this.close();
					this.run(action);
				})
			);
		}
		this.menu = menu;
		menu.onHide(() => {
			if (this.menu === menu) this.menu = undefined;
		});
		if (event) {
			menu.showAtMouseEvent(event);
		} else {
			const bounds = this.inputEl.getBoundingClientRect();
			menu.showAtPosition({ x: bounds.left, y: bounds.top }, this.inputEl.ownerDocument);
		}
	}

	private run(action: Action | undefined): void {
		try {
			action?.run();
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not run this action.');
		}
	}

	private clearResults(): void {
		for (const root of this.roots) root.unmount();
		this.roots.clear();
	}

	private removeCloseButtons(): void {
		this.containerEl.querySelectorAll('.modal-close-button').forEach((button) => button.remove());
	}
}
