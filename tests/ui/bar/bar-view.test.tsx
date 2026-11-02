import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { BarView } from '@/ui/bar/bar-view';
import { BarState } from '@/ui/bar/bar-state';
import { GivenNote, GivenSearch } from '../../support/given';

const roots: Root[] = [];

afterEach(() => {
	act(() => roots.splice(0).forEach((root) => root.unmount()));
	document.body.replaceChildren();
});

describe('BarView', () => {
	it('shows a runnable command immediately on opening', () => {
		const { container, commands, workspace } = GivenView({ commands: [{ id: 'app:new', name: 'Create new note' }] });

		expect(container.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Create new note');
		const run = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Run command'));
		expect(run).toBeDefined();
		act(() => run?.click());

		expect(commands.executed).toEqual(['app:new']);
		expect(workspace.opened).toEqual([]);
	});

	it('focuses a labelled search input and exposes the selected recent note', () => {
		const { container, input } = GivenView();

		expect(document.activeElement).toBe(input);
		expect(input.getAttribute('aria-label')).toBe('Search notes and commands');
		expect(container.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Ada Lovelace');
		expect(document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.textContent).toContain('Ada Lovelace');
		expect(container.textContent).not.toContain('to navigate');
	});

	it('searches while typing and announces an empty result', () => {
		const { container, input } = GivenView();

		WhenTyping(input, 'no such note');

		expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
		expect(container.querySelector('[role="status"]')?.textContent).toContain('No results found');
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
	});

	it('opens a result with the pointer', () => {
		const { container, workspace } = GivenView();

		act(() => container.querySelector<HTMLElement>('[role="option"]')?.click());

		expect(workspace.opened).toEqual([{ target: { path: 'People/Ada Lovelace.md' }, where: 'current' }]);
	});

	it('opens a result’s secondary actions without opening the note', () => {
		const { container, input, workspace } = GivenView();

		act(() => container.querySelector<HTMLButtonElement>('[aria-label="Actions for Alan Turing"]')?.click());
		expect(workspace.opened).toEqual([]);

		expect(container.querySelector('[aria-label="Recent"]')?.textContent).toContain('Ada Lovelace');
		const actions = container.querySelector('[role="listbox"][aria-label="Actions"]');
		expect(actions).not.toBeNull();
		expect(actions?.id).toBe(input.getAttribute('aria-controls'));
		const side = [...(actions?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find((row) =>
			row.textContent?.includes('Open to the side')
		);
		act(() => side?.click());

		expect(workspace.opened).toEqual([{ target: { path: 'Alan Turing.md' }, where: 'side' }]);
	});

	it('updates the accessible selection when the modal moves with the keyboard', () => {
		const { container, bar, render, input } = GivenView();

		act(() => {
			bar.next();
			render();
		});

		expect(container.querySelector('[aria-selected="true"]')?.textContent).toContain('Alan Turing');
		expect(document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.textContent).toContain('Alan Turing');
	});
});

function GivenView(options: Parameters<typeof GivenSearch>[0] = {}) {
	const { search, workspace, commands } = GivenSearch({
		notes: [GivenNote('Ada Lovelace', { folder: 'People' }), GivenNote('Alan Turing')],
		recents: ['People/Ada Lovelace.md', 'Alan Turing.md'],
		...options,
	});
	const bar = new BarState(search);
	const container = document.createElement('div');
	document.body.append(container);
	const root = createRoot(container);
	roots.push(root);
	const render = () => root.render(<BarView bar={bar} mac={false} onChange={render} onRun={() => bar.run()} />);
	act(render);
	const input = container.querySelector('input');
	if (!input) throw new Error('Search input missing');
	return { container, input, bar, render, workspace, commands };
}

function WhenTyping(input: HTMLInputElement, value: string) {
	act(() => {
		const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
		setter?.call(input, value);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	});
}
