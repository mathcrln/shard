import { describe, expect, it } from 'vitest';
import { BarState } from '@/ui/bar/bar-state';
import { GivenNote, GivenSearch } from '../../support/given';

describe('BarState', () => {
	describe('opening', () => {
		it('shows recent notes with the first one highlighted', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada'), GivenNote('Turing')], recents: ['Turing.md', 'Ada.md'] });

			expect(bar.query).toBe('');
			expect(bar.highlighted?.title).toBe('Turing');
			expect(bar.actionsOpen).toBe(false);
		});
	});

	describe('type', () => {
		it('searches for the query', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada'), GivenNote('Turing')] });

			bar.type('tur');

			expect(bar.query).toBe('tur');
			expect(bar.results.map((result) => result.title)).toEqual(['Turing']);
		});

		it('highlights the first result again', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2')] });
			bar.type('ada');
			bar.next();

			bar.type('ada ');

			expect(bar.position).toBe(0);
		});

		it('closes the actions', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();

			bar.type('ad');

			expect(bar.actionsOpen).toBe(false);
		});

		it('highlights nothing when nothing matches', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });

			bar.type('zzz');

			expect(bar.highlighted).toBeUndefined();
		});
	});

	describe('groups', () => {
		it('puts consecutive results of one kind together', () => {
			const { bar } = GivenBar({
				notes: [GivenNote('Meeting', { headings: ['Agenda'] }), GivenNote('Agenda 2026'), GivenNote('Agenda old')],
			});

			bar.type('agenda');

			expect(bar.groups.map((section) => [section.group, section.results.length])).toEqual([
				['Notes', 2],
				['Headings', 1],
			]);
		});
	});

	describe('next and previous', () => {
		it('moves the highlight through the results', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2'), GivenNote('Ada 3')] });
			bar.type('ada');

			bar.next();
			bar.next();
			bar.previous();

			expect(bar.position).toBe(1);
		});

		it('stops at both ends', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2')] });
			bar.type('ada');

			bar.previous();
			expect(bar.position).toBe(0);

			bar.next();
			bar.next();
			expect(bar.position).toBe(1);
		});

		it('moves through the actions while they are open', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2')] });
			bar.type('ada');
			bar.openActions();

			bar.next();

			expect(bar.position).toBe(0);
			expect(bar.actionPosition).toBe(1);
			expect(bar.highlightedAction?.name).toBe('Open in new tab');
		});

		it('stops at both ends of the actions', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();

			bar.previous();
			expect(bar.actionPosition).toBe(0);

			for (let step = 0; step < 10; step++) bar.next();
			expect(bar.highlightedAction?.name).toBe('Copy link');
		});
	});

	describe('highlight', () => {
		it('highlights the result at the position', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2'), GivenNote('Ada 3')] });
			bar.type('ada');

			bar.highlight(2);

			expect(bar.highlighted?.title).toBe('Ada 3');
		});

		it('ignores a position outside the results', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');

			bar.highlight(5);

			expect(bar.position).toBe(0);
		});
	});

	describe('highlightAction', () => {
		it('highlights the action at the position', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();

			bar.highlightAction(3);

			expect(bar.highlightedAction?.name).toBe('Copy link');
		});

		it('ignores a position outside the actions', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();

			bar.highlightAction(9);

			expect(bar.actionPosition).toBe(0);
		});

		it('does nothing while the actions are closed', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');

			bar.highlightAction(1);

			expect(bar.actionsOpen).toBe(false);
		});
	});

	describe('run', () => {
		it('closes the palette before executing a command', () => {
			const { search, commands } = GivenSearch({ commands: [{ id: 'app:new', name: 'Create new note' }] });
			const bar = new BarState(search);
			let executedBeforeClose: string[] = ['not closed'];

			bar.run(() => {
				executedBeforeClose = [...commands.executed];
			});

			expect(executedBeforeClose).toEqual([]);
			expect(commands.executed).toEqual(['app:new']);
		});

		it('runs the main action of the highlighted result', () => {
			const { bar, workspace } = GivenBar({ notes: [GivenNote('Ada 1'), GivenNote('Ada 2')] });
			bar.type('ada');
			bar.next();

			expect(bar.run()).toBe(true);

			expect(workspace.opened).toEqual([{ target: { path: 'Ada 2.md' }, where: 'current' }]);
		});

		it('runs nothing when there is no result', () => {
			const { bar, workspace } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('zzz');

			expect(bar.run()).toBe(false);

			expect(workspace.opened).toEqual([]);
		});

		it('runs the highlighted action while the actions are open', () => {
			const { bar, workspace } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();
			bar.next();
			bar.next();

			bar.run();

			expect(workspace.opened).toEqual([{ target: { path: 'Ada.md' }, where: 'side' }]);
		});
	});

	describe('runShortcut', () => {
		it('runs the action bound to the shortcut', () => {
			const { bar, workspace } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');

			expect(bar.runShortcut('Mod+Enter')).toBe(true);

			expect(workspace.opened).toEqual([{ target: { path: 'Ada.md' }, where: 'tab' }]);
		});

		it('runs nothing when there is no result', () => {
			const { bar, workspace } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('zzz');

			expect(bar.runShortcut('Mod+Enter')).toBe(false);

			expect(workspace.opened).toEqual([]);
		});
	});

	describe('openActions', () => {
		it('shows the actions of the highlighted result', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');

			bar.openActions();

			expect(bar.actionsOpen).toBe(true);
			expect(bar.actions.map((action) => action.name)).toEqual([
				'Open',
				'Open in new tab',
				'Open to the side',
				'Copy link',
			]);
			expect(bar.actionPosition).toBe(0);
		});

		it('does nothing when there is no result', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('zzz');

			bar.openActions();

			expect(bar.actionsOpen).toBe(false);
		});
	});

	describe('closeActions', () => {
		it('goes back to the results', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');
			bar.openActions();

			bar.closeActions();

			expect(bar.actionsOpen).toBe(false);
			expect(bar.actions).toEqual([]);
		});
	});

	describe('toggleActions', () => {
		it('opens the actions, then closes them', () => {
			const { bar } = GivenBar({ notes: [GivenNote('Ada')] });
			bar.type('ada');

			bar.toggleActions();
			expect(bar.actionsOpen).toBe(true);

			bar.toggleActions();
			expect(bar.actionsOpen).toBe(false);
		});
	});
});

function GivenBar(options: Parameters<typeof GivenSearch>[0] = {}) {
	const { search, workspace } = GivenSearch(options);
	return { bar: new BarState(search), workspace };
}
