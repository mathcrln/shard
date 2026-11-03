import { describe, expect, it } from 'vitest';
import { GivenNote, GivenSearch } from '../support/given';

describe('Search.find', () => {
	describe('with an empty query', () => {
		it('lists recent notes, most recent first', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Ada'), GivenNote('Turing'), GivenNote('Hopper')],
				recents: ['Hopper.md', 'Ada.md'],
			});

			const results = search.find('');

			expect(results.map((result) => result.title)).toEqual(['Hopper', 'Ada']);
			expect(results.every((result) => result.group === 'Recent')).toBe(true);
		});

		it('skips recent notes that no longer exist', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Ada')], recents: ['Gone.md', 'Ada.md'] });

			expect(search.find('').map((result) => result.title)).toEqual(['Ada']);
		});

		it('lists at most ten recent notes', () => {
			const notes = Array.from({ length: 12 }, (_, index) => GivenNote(`Note ${index}`));
			const { search } = GivenSearch({ notes, recents: notes.map((note) => note.path) });

			expect(search.find('')).toHaveLength(10);
		});

		it('falls back to notes by name when nothing was opened', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Turing'), GivenNote('Ada')] });

			expect(search.find('').map((result) => [result.group, result.title])).toEqual([
				['Notes', 'Ada'],
				['Notes', 'Turing'],
			]);
		});

		it('lists only recent notes on opening outside unified search', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Ada')],
				recents: ['Ada.md'],
				commands: [{ id: 'app:new', name: 'Create new note' }],
			});

			expect(search.find('').map((result) => [result.group, result.title])).toEqual([['Recent', 'Ada']]);
		});

		it('shows recent notes on opening unified search, followed by commands', () => {
			const { search, commands } = GivenSearch({
				notes: [GivenNote('Ada')],
				recents: ['Ada.md'],
				commands: [{ id: 'app:new', name: 'Create new note' }],
			});

			const results = search.find('', { mode: 'unified' });

			expect(results.map((result) => [result.group, result.title])).toEqual([
				['Recent', 'Ada'],
				['Commands', 'Create new note'],
			]);
			results[1]?.actions[0]?.run();
			expect(commands.executed).toEqual(['app:new']);
		});

		it('lists recent notes without commands when commands on open are turned off', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Ada')],
				recents: ['Ada.md'],
				commands: [{ id: 'app:new', name: 'Create new note' }],
				settings: { commandsOnOpen: false },
			});

			expect(search.find('', { mode: 'unified' }).map((result) => result.group)).toEqual(['Recent']);
		});

		it('lists as many recent notes as the settings allow', () => {
			const notes = Array.from({ length: 12 }, (_, index) => GivenNote(`Note ${index}`));
			const { search } = GivenSearch({ notes, recents: notes.map((note) => note.path), settings: { recentNotes: 3 } });

			expect(search.find('')).toHaveLength(3);
		});

		it('limits the opening command list of unified search to six', () => {
			const { search } = GivenSearch({
				commands: Array.from({ length: 12 }, (_, index) => ({ id: `command:${index}`, name: `Command ${index}` })),
			});

			expect(search.find('', { mode: 'unified' })).toHaveLength(6);
		});
	});

	describe('commands', () => {
		it('finds commands alongside notes and headings in unified search, ignoring diacritics', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Élève', { headings: ['Élève notes'] })],
				commands: [{ id: 'example:eleve', name: 'Élève command' }],
			});

			expect(
				search
					.find('eleve', { mode: 'unified' })
					.map((result) => result.group)
					.sort()
			).toEqual(['Commands', 'Headings', 'Notes']);
		});

		it('leaves commands out of file search', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Élève', { headings: ['Élève notes'] })],
				commands: [{ id: 'example:eleve', name: 'Élève command' }],
			});

			expect(search.find('eleve').map((result) => result.group)).toEqual(['Notes', 'Headings']);
		});

		it('shows only commands with the command prefix', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Daily')],
				commands: [{ id: 'daily:open', name: 'Daily notes: Open today' }],
			});

			expect(search.find('> daily').map((result) => result.title)).toEqual(['Daily notes: Open today']);
			expect(search.find('>')).toHaveLength(1);
		});

		it('refreshes the command list after commands are added or removed', () => {
			const { search, commands } = GivenSearch();
			expect(search.find('>')).toEqual([]);

			commands.all.push({ id: 'new:command', name: 'New command' });
			expect(search.find('>')[0]?.title).toBe('New command');

			commands.all.splice(0);
			expect(search.find('>')).toEqual([]);
		});
	});

	describe('notes', () => {
		it('finds a note by name, ignoring diacritics', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Élève'), GivenNote('Ada')] });

			const [result, ...others] = search.find('eleve');

			expect(result).toMatchObject({ group: 'Notes', title: 'Élève', ranges: [{ start: 0, end: 5 }] });
			expect(others).toEqual([]);
		});

		it('describes a note by its folder', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Ada', { folder: 'People' })] });

			expect(search.find('ada')[0]?.description).toBe('People');
		});

		it('finds a note by alias, showing the alias with the note it points to', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Élève', { aliases: ['Student'] })] });

			expect(search.find('stud')[0]).toMatchObject({
				group: 'Notes',
				title: 'Student',
				description: 'Élève',
				ranges: [{ start: 0, end: 4 }],
			});
		});

		it('prefers the name over an alias that matches as well', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Ada', { aliases: ['Ada L.'] })] });

			expect(search.find('ada')).toHaveLength(1);
			expect(search.find('ada')[0]?.title).toBe('Ada');
		});

		it('ranks better matches first', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Canada'), GivenNote('Ada Lovelace'), GivenNote('Lady Ada')] });

			expect(search.find('ada').map((result) => result.title)).toEqual(['Ada Lovelace', 'Lady Ada', 'Canada']);
		});

		it('ranks a recent note above an equal match', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Project A'), GivenNote('Project B')],
				recents: ['Project B.md'],
			});

			expect(search.find('project').map((result) => result.title)).toEqual(['Project B', 'Project A']);
		});

		it('does not let recency beat a clearly better match', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Ada'), GivenNote('A day at the dam')],
				recents: ['A day at the dam.md'],
			});

			expect(search.find('ada')[0]?.title).toBe('Ada');
		});

		it('returns at most thirty notes', () => {
			const notes = Array.from({ length: 40 }, (_, index) => GivenNote(`Note ${index}`));
			const { search } = GivenSearch({ notes });

			expect(search.find('note')).toHaveLength(30);
		});

		it('returns nothing when nothing matches', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Ada')] });

			expect(search.find('zzz')).toEqual([]);
		});
	});

	describe('headings', () => {
		it('finds a heading, showing the note it is in', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Meeting', { headings: ['Agenda', 'Decisions'] })] });

			expect(search.find('agenda')).toMatchObject([
				{ group: 'Headings', title: 'Agenda', description: 'Meeting', ranges: [{ start: 0, end: 6 }] },
			]);
		});

		it('lists notes before headings', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Meeting', { headings: ['Agenda'] }), GivenNote('Agenda 2026')],
			});

			expect(search.find('agenda').map((result) => result.group)).toEqual(['Notes', 'Headings']);
		});

		it('does not search headings when heading search is turned off', () => {
			const { search } = GivenSearch({
				notes: [GivenNote('Meeting', { headings: ['Agenda'] })],
				settings: { searchHeadings: false },
			});

			expect(search.find('agenda')).toEqual([]);
		});

		it('does not search headings for a single letter', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Meeting', { headings: ['Agenda'] })] });

			expect(search.find('a')).toEqual([]);
		});

		it('returns at most ten headings', () => {
			const headings = Array.from({ length: 15 }, (_, index) => `Section ${index}`);
			const { search } = GivenSearch({ notes: [GivenNote('Long', { headings })] });

			expect(search.find('section')).toHaveLength(10);
		});
	});

	describe('actions', () => {
		it('offers to open, open in a new tab, open to the side, and copy the link', () => {
			const { search } = GivenSearch({ notes: [GivenNote('Ada')] });

			const actions = search.find('ada')[0]?.actions ?? [];

			expect(actions.map((action) => action.name)).toEqual(['Open', 'Open in new tab', 'Open to the side', 'Copy link']);
			expect(actions.map((action) => action.shortcut)).toEqual([undefined, 'Mod+Enter', 'Mod+Alt+Enter', undefined]);
		});

		it('opens a note in the current pane, a new tab, or the side', () => {
			const { search, workspace } = GivenSearch({ notes: [GivenNote('Ada', { folder: 'People' })] });
			const [open, tab, side] = search.find('ada')[0]?.actions ?? [];

			open?.run();
			tab?.run();
			side?.run();

			const target = { path: 'People/Ada.md' };
			expect(workspace.opened).toEqual([
				{ target, where: 'current' },
				{ target, where: 'tab' },
				{ target, where: 'side' },
			]);
		});

		it('copies the link of a note', () => {
			const { search, workspace } = GivenSearch({ notes: [GivenNote('Ada')] });

			search.find('ada')[0]?.actions[3]?.run();

			expect(workspace.copied).toEqual([{ path: 'Ada.md' }]);
		});

		it('opens a heading at the heading', () => {
			const { search, workspace } = GivenSearch({ notes: [GivenNote('Meeting', { headings: ['Agenda'] })] });

			search.find('agenda')[0]?.actions[0]?.run();

			expect(workspace.opened).toEqual([{ target: { path: 'Meeting.md', heading: 'Agenda' }, where: 'current' }]);
		});

		it('offers the same actions for recent notes', () => {
			const { search, workspace } = GivenSearch({ notes: [GivenNote('Ada')], recents: ['Ada.md'] });

			search.find('')[0]?.actions[0]?.run();

			expect(workspace.opened).toEqual([{ target: { path: 'Ada.md' }, where: 'current' }]);
		});
	});
});
