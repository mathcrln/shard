import { Keymap, Menu, Platform, SuggestModal } from 'obsidian';
import type { App } from 'obsidian';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { Search } from '@/queries/search';
import type { SearchMode } from '@/search/mode';
import { searchModeFor } from '@/search/mode';
import type { Action } from '@/search/action';
import { shortcuts } from '@/search/action';
import type { Result } from '@/search/result';
import { NativeResult } from '@/ui/bar/native-result';
import { keysOf, labelOf } from '@/ui/bar/shortcut';
import type { CreateModelNote } from '@/models/note-creation';
import { ModelCreation } from '@/ui/bar/model-creation';
import { ShardException } from '@/exceptions/shard-exception';

export class NativeBarModal extends SuggestModal<Result> {
	private readonly roots = new Set<Root>();
	private readonly groupStarts = new Set<Result>();
	private menu: Menu | undefined;
	private selectingActions = false;
	private readonly baseMode: SearchMode;
	private readonly creation: ModelCreation;
	private readonly creationError: HTMLElement;
	private lastQuery = '';

	constructor(
		app: App,
		private readonly search: Pick<Search, 'find'>,
		options: { query?: string; unifiedSearch?: boolean } = {},
		createNote: CreateModelNote = () => Promise.reject(new Error('Note creation is unavailable.'))
	) {
		super(app);
		this.creation = new ModelCreation({
			create: createNote,
			query: () => this.inputEl.value,
			compose: (query) => {
				this.menu?.hide();
				this.inputEl.value = query;
				this.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
				this.inputEl.focus();
				this.inputEl.setSelectionRange(query.length, query.length);
			},
			changed: () => this.renderStatus(),
			completed: () => this.close(),
		});
		this.creationError = this.modalEl.createEl('p', { cls: 'shard-palette-error', attr: { role: 'alert' } });
		this.creationError.hidden = true;
		this.baseMode = options.unifiedSearch ? 'unified' : 'files';
		this.inputEl.value = options.query ?? '';
		this.containerEl.addClass('shard-native-container');
		this.modalEl.addClass('shard-native');
		this.setPlaceholder('Search notes or commands…');
		this.setInstructions([]);
		this.limit = 100;
		this.emptyStateText = 'No results';
		this.inputEl.setAttribute('aria-label', 'Search notes and commands');
		this.inputEl.autocapitalize = 'off';
		this.inputEl.spellcheck = false;
		this.removeCloseButtons();
		this.scope.register(['Mod'], 'k', (event) => {
			if (this.creation.busy) return false;
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
				if (this.creation.busy) return false;
				this.selectActiveSuggestion(event);
				return false;
			});
		}
		this.scope.register([], 'Escape', () => {
			this.close();
			return false;
		});
	}

	onOpen(): void {
		void super.onOpen();
		this.removeCloseButtons();
		this.updatePrompt(this.inputEl.value);
		this.inputEl.setSelectionRange(this.inputEl.value.length, this.inputEl.value.length);
	}

	onClose(): void {
		this.creation.reset();
		this.menu?.hide();
		this.menu = undefined;
		this.clearResults();
		super.onClose();
	}

	getSuggestions(query: string): Result[] {
		if (query !== this.lastQuery) this.creation.clearError();
		this.lastQuery = query;
		this.renderStatus();
		this.updatePrompt(query);
		this.clearResults();
		this.groupStarts.clear();
		try {
			const results = this.search.find(query, { mode: this.baseMode, creator: this.creation });
			const mixed = searchModeFor(query, this.baseMode) === 'unified' && query.trim().length > 0;
			if (!mixed && new Set(results.map((result) => result.group)).size > 1) {
				let previous: string | undefined;
				for (const result of results) {
					if (result.group !== previous) this.groupStarts.add(result);
					previous = result.group;
				}
			}
			return results;
		} catch (error) {
			ShardException.render(error);
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
		if (this.creation.busy || ('isComposing' in event && event.isComposing)) return;
		if (this.selectingActions) {
			this.showActions(result);
			return;
		}
		if (result.actions[0]?.keepOpen) {
			this.onChooseSuggestion(result, event);
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
					if (!action.keepOpen) this.close();
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
		if (this.creation.busy) return;
		try {
			action?.run();
		} catch (error) {
			ShardException.render(error);
		}
	}

	private clearResults(): void {
		for (const root of this.roots) root.unmount();
		this.roots.clear();
	}

	private renderStatus(): void {
		this.inputEl.readOnly = this.creation.busy;
		this.inputEl.setAttribute('aria-busy', String(this.creation.busy));
		this.creationError.setText(this.creation.error ?? '');
		this.creationError.hidden = !this.creation.error;
	}

	private removeCloseButtons(): void {
		this.containerEl.querySelectorAll('.modal-close-button').forEach((button) => button.remove());
	}

	private updatePrompt(query: string): void {
		const mode = searchModeFor(query, this.baseMode);
		const label = mode === 'commands' ? 'commands' : mode === 'files' ? 'files' : 'files or commands';
		this.inputEl.setAttribute('aria-label', `Search ${label}`);
		this.setPlaceholder(`Search ${label}…`);
	}
}
