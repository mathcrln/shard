import type { Modifier } from 'obsidian';

const MAC_SYMBOLS: Record<string, string> = { Mod: '⌘', Alt: '⌥', Shift: '⇧', Ctrl: '⌃', Enter: '↵' };
const OTHER_WORDS: Record<string, string> = { Mod: 'Ctrl', Enter: '↵' };

export function keysOf(shortcut: string): { modifiers: Modifier[]; key: string } {
	const parts = shortcut.split('+');
	const key = parts.pop() ?? '';

	return { modifiers: parts as Modifier[], key };
}

export function labelOf(shortcut: string, { mac }: { mac: boolean }): string {
	const symbols = mac ? MAC_SYMBOLS : OTHER_WORDS;
	const labels = shortcut.split('+').map((part) => symbols[part] ?? (part.length === 1 ? part.toUpperCase() : part));

	return labels.join(mac ? '' : '+');
}
