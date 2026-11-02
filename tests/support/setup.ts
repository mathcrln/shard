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
