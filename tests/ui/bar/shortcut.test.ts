import { describe, expect, it } from 'vitest';
import { keysOf, labelOf } from '@/ui/bar/shortcut';

describe('keysOf', () => {
	it('splits modifiers from the key', () => {
		expect(keysOf('Mod+Alt+Enter')).toEqual({ modifiers: ['Mod', 'Alt'], key: 'Enter' });
	});

	it('returns no modifiers for a bare key', () => {
		expect(keysOf('Enter')).toEqual({ modifiers: [], key: 'Enter' });
	});
});

describe('labelOf', () => {
	it('uses symbols on macOS', () => {
		expect(labelOf('Mod+Alt+Enter', { mac: true })).toBe('⌘⌥↵');
	});

	it('uses words elsewhere', () => {
		expect(labelOf('Mod+Alt+Enter', { mac: false })).toBe('Ctrl+Alt+↵');
	});

	it('shows letters in upper case', () => {
		expect(labelOf('Mod+k', { mac: true })).toBe('⌘K');
	});
});
