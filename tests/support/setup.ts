import { afterEach, vi } from 'vitest';
import { notices, Platform } from './obsidian';

if (typeof window !== 'undefined') {
	Object.assign(globalThis, { activeDocument: document, activeWindow: window, IS_REACT_ACT_ENVIRONMENT: true });
	Object.assign(Element.prototype, {
		addClass(this: Element, ...names: string[]): void {
			this.classList.add(...names);
		},
		detach(this: Element): void {
			this.remove();
		},
		createEl(
			this: Element,
			tag: string,
			{ cls, text, attr = {} }: { cls?: string; text?: string; attr?: Record<string, string> } = {}
		): HTMLElement {
			const element = this.appendChild(document.createElement(tag));
			if (cls) element.className = cls;
			if (text !== undefined) element.textContent = text;
			for (const [name, value] of Object.entries(attr)) element.setAttribute(name, value);
			return element;
		},
		setText(this: Element, text: string): void {
			this.textContent = text;
		},
	});
}

afterEach(() => {
	notices.splice(0);
	Platform.isMacOS = false;
	Platform.isMobile = false;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	if (typeof document !== 'undefined') document.body.replaceChildren();
});
