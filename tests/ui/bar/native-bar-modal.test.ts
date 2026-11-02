import type { App } from 'obsidian';
import { SuggestModal } from 'obsidian';
import { act } from 'react';
import { describe, expect, it, onTestFinished } from 'vitest';
import { NativeBarModal } from '@/ui/bar/native-bar-modal';
import { GivenNote, GivenSearch } from '../../support/given';

describe('NativeBarModal', () => {
	it('uses the native input to search without a close button', () => {
		const { modal } = GivenModal();

		expect(modal).toBeInstanceOf(SuggestModal);
		expect(modal.inputEl).toBe(document.activeElement);
		expect(modal.containerEl.querySelector('.modal-close-button')).toBeNull();
		act(() => {
			modal.inputEl.value = 'turing';
			modal.inputEl.dispatchEvent(new Event('input'));
		});

		expect(modal.resultContainerEl.textContent).toContain('Alan Turing');
		expect(modal.resultContainerEl.textContent).not.toContain('Ada Lovelace');
	});

	it('opens native result actions without choosing the note first', () => {
		const { modal, workspace } = GivenModal();
		const button = modal.resultContainerEl.querySelector<HTMLButtonElement>('[aria-label="Actions for Alan Turing"]');

		act(() => button?.click());

		expect(workspace.opened).toEqual([]);
		const action = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((item) =>
			item.textContent?.startsWith('Open to the side')
		);
		expect(action).toBeDefined();
		act(() => action?.click());
		expect(workspace.opened).toEqual([{ target: { path: 'Alan Turing.md' }, where: 'side' }]);
		expect(modal.containerEl.isConnected).toBe(false);
	});

	it('keeps the modifier action when the native chooser selects a result', () => {
		const { modal, search, workspace } = GivenModal();
		const result = search.find('ada')[0];
		if (!result) throw new Error('Missing result');

		act(() => modal.selectSuggestion(result, new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, altKey: true })));

		expect(workspace.opened).toEqual([{ target: { path: 'Ada Lovelace.md' }, where: 'side' }]);
		expect(modal.containerEl.isConnected).toBe(false);
	});
});

function GivenModal() {
	const { search, workspace } = GivenSearch({ notes: [GivenNote('Ada Lovelace'), GivenNote('Alan Turing')] });
	const modal = new NativeBarModal({} as App, search);
	onTestFinished(() => act(() => modal.close()));
	act(() => modal.open());
	return { modal, search, workspace };
}
