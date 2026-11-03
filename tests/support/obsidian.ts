import type { Command } from 'obsidian';

export const Platform = { isMacOS: false, isMobile: false };

export class Component {
	private loaded = false;
	private readonly children: Component[] = [];
	private readonly cleanups: Array<() => void> = [];

	load(): void {
		if (this.loaded) return;
		this.loaded = true;
		this.onload();
		for (const child of this.children) child.load();
	}

	unload(): void {
		if (!this.loaded) return;
		this.loaded = false;
		for (const child of this.children.splice(0)) child.unload();
		this.onunload();
		for (const cleanup of this.cleanups.splice(0)) cleanup();
	}

	onload(): void {}
	onunload(): void {}

	addChild<T extends Component>(child: T): T {
		this.children.push(child);
		if (this.loaded) child.load();
		return child;
	}

	register(cleanup: () => void): void {
		this.cleanups.push(cleanup);
	}
}

export class Plugin extends Component {
	constructor(
		readonly app: unknown,
		_manifest: unknown
	) {
		super();
	}

	addCommand(command: Command): Command {
		return command;
	}

	addSettingTab(_tab: PluginSettingTab): void {}

	loadData(): Promise<unknown> {
		return Promise.resolve(null);
	}

	saveData(_data: unknown): Promise<void> {
		return Promise.resolve();
	}
}

export class PluginSettingTab {
	readonly containerEl = document.createElement('div');

	constructor(
		readonly app: unknown,
		readonly plugin: unknown
	) {}

	update(): void {}
	refreshDomState(): void {}
}

export class Scope {
	register(_modifiers: string[] | null, _key: string, _callback: (event: KeyboardEvent) => unknown): void {}
}

export class Modal {
	readonly containerEl = document.createElement('div');
	readonly modalEl = this.containerEl.appendChild(document.createElement('div'));
	readonly titleEl = this.modalEl.appendChild(document.createElement('div'));
	readonly contentEl = this.modalEl.appendChild(document.createElement('div'));
	readonly scope = new Scope();

	constructor(readonly app: unknown) {
		this.containerEl.classList.add('modal-container');
		this.modalEl.classList.add('modal');
		this.contentEl.classList.add('modal-content');
		const close = this.containerEl.appendChild(document.createElement('button'));
		close.classList.add('modal-close-button');
		close.textContent = 'Close';
	}

	open(): void {
		document.body.appendChild(this.containerEl);
		this.onOpen();
	}

	close(): void {
		this.onClose();
		this.containerEl.remove();
	}

	onOpen(): void {}
	onClose(): void {}
}

export const notices: string[] = [];

export class Notice {
	constructor(message: string) {
		notices.push(message);
	}
}

export function parseFrontMatterAliases(frontmatter: Record<string, unknown> | null): string[] | null {
	const aliases = frontmatter?.['aliases'];
	if (typeof aliases === 'string') return [aliases];
	return Array.isArray(aliases) ? aliases.filter((alias): alias is string => typeof alias === 'string') : null;
}

export abstract class SuggestModal<T> extends Modal {
	limit = 100;
	emptyStateText = '';
	readonly inputEl = document.createElement('input');
	readonly resultContainerEl = document.createElement('div');
	private items: T[] = [];

	constructor(app: unknown) {
		super(app);
		this.modalEl.classList.add('prompt');
		const inputContainer = document.createElement('div');
		inputContainer.classList.add('prompt-input-container');
		this.inputEl.classList.add('prompt-input');
		this.resultContainerEl.classList.add('prompt-results');
		inputContainer.append(this.inputEl);
		this.modalEl.replaceChildren(inputContainer, this.resultContainerEl);
		this.inputEl.addEventListener('input', () => this.update());
		this.resultContainerEl.addEventListener('click', (event) => {
			const element = (event.target as Element).closest<HTMLElement>('[data-suggestion]');
			const item = element ? this.items[Number(element.dataset['suggestion'])] : undefined;
			if (item !== undefined) this.selectSuggestion(item, event);
		});
	}

	setPlaceholder(value: string): void {
		this.inputEl.placeholder = value;
	}
	setInstructions(_instructions: unknown[]): void {}

	onOpen(): void {
		this.inputEl.value = '';
		this.update();
		this.inputEl.focus();
	}

	selectSuggestion(item: T, event: MouseEvent | KeyboardEvent): void {
		this.close();
		this.onChooseSuggestion(item, event);
	}

	selectActiveSuggestion(event: MouseEvent | KeyboardEvent): void {
		const item = this.items[0];
		if (item !== undefined) this.selectSuggestion(item, event);
	}

	abstract getSuggestions(query: string): T[];
	abstract renderSuggestion(item: T, element: HTMLElement): void;
	abstract onChooseSuggestion(item: T, event: MouseEvent | KeyboardEvent): void;

	private update(): void {
		this.items = this.getSuggestions(this.inputEl.value).slice(0, this.limit);
		this.resultContainerEl.replaceChildren();
		this.items.forEach((item, index) => {
			const element = this.resultContainerEl.appendChild(document.createElement('div'));
			element.classList.add('suggestion-item');
			element.dataset['suggestion'] = String(index);
			element.setAttribute('role', 'option');
			element.setAttribute('aria-selected', String(index === 0));
			if (index === 0) element.classList.add('is-selected');
			this.renderSuggestion(item, element);
		});
		if (this.items.length === 0) this.resultContainerEl.textContent = this.emptyStateText;
	}
}

export abstract class AbstractInputSuggest<T> {
	limit = 100;

	constructor(
		readonly app: unknown,
		readonly inputEl: HTMLInputElement
	) {}

	setValue(value: string): void {
		this.inputEl.value = value;
	}
	close(): void {}

	protected abstract getSuggestions(query: string): T[] | Promise<T[]>;
	abstract renderSuggestion(value: T, element: HTMLElement): void;
	abstract selectSuggestion(value: T, event: MouseEvent | KeyboardEvent): void;
}

export class Keymap {
	static isModifier(event: MouseEvent | KeyboardEvent, modifier: string): boolean {
		return modifier === 'Mod' && (Platform.isMacOS ? event.metaKey : event.ctrlKey);
	}
}

export function setIcon(element: HTMLElement, name: string): void {
	element.dataset['icon'] = name;
	element.textContent = '…';
}

class MenuItem {
	readonly element = document.createElement('button');
	setTitle(title: string): this {
		this.element.textContent = title;
		return this;
	}
	onClick(callback: (event: MouseEvent) => void): this {
		this.element.addEventListener('click', callback);
		return this;
	}
}

export class Menu extends Component {
	private readonly element = document.createElement('div');
	private onHidden: (() => void) | undefined;

	setNoIcon(): this {
		return this;
	}
	addItem(callback: (item: MenuItem) => void): this {
		const item = new MenuItem();
		item.element.setAttribute('role', 'menuitem');
		callback(item);
		this.element.append(item.element);
		return this;
	}
	showAtMouseEvent(_event: MouseEvent): this {
		return this.showAtPosition({ x: 0, y: 0 });
	}
	showAtPosition(_position: { x: number; y: number }, owner = document): this {
		owner.body.append(this.element);
		return this;
	}
	onHide(callback: () => void): void {
		this.onHidden = callback;
	}
	hide(): this {
		this.element.remove();
		this.onHidden?.();
		return this;
	}
}
