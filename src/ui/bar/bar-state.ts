import type { Search } from '@/queries/search';
import type { Action, Shortcut } from '@/search/action';
import type { Group, Result } from '@/search/result';

export type Section = { group: Group; results: Result[] };

export class BarState {
	query = '';
	results: readonly Result[] = [];

	private index = 0;
	private actionIndex: number | null = null;

	constructor(private readonly search: Pick<Search, 'find'>) {
		this.type('');
	}

	get position(): number {
		return this.index;
	}

	get highlighted(): Result | undefined {
		return this.results[this.index];
	}

	get groups(): Section[] {
		const sections: Section[] = [];

		for (const result of this.results) {
			const last = sections[sections.length - 1];

			if (last?.group === result.group) {
				last.results.push(result);
			} else {
				sections.push({ group: result.group, results: [result] });
			}
		}

		return sections;
	}

	get actionsOpen(): boolean {
		return this.actionIndex !== null;
	}

	get actions(): readonly Action[] {
		return this.actionsOpen ? (this.highlighted?.actions ?? []) : [];
	}

	get actionPosition(): number {
		return this.actionIndex ?? -1;
	}

	get highlightedAction(): Action | undefined {
		return this.actionIndex === null ? undefined : this.actions[this.actionIndex];
	}

	type(query: string): void {
		this.query = query;
		this.results = this.search.find(query);
		this.index = 0;
		this.closeActions();
	}

	next(): void {
		if (this.actionIndex !== null) {
			this.actionIndex = Math.min(this.actions.length - 1, this.actionIndex + 1);
		} else {
			this.index = Math.min(this.results.length - 1, this.index + 1);
		}
	}

	previous(): void {
		if (this.actionIndex !== null) {
			this.actionIndex = Math.max(0, this.actionIndex - 1);
		} else {
			this.index = Math.max(0, this.index - 1);
		}
	}

	highlight(position: number): void {
		if (position >= 0 && position < this.results.length) this.index = position;
	}

	highlightAction(position: number): void {
		if (this.actionsOpen && position >= 0 && position < this.actions.length) this.actionIndex = position;
	}

	openActions(): void {
		if (this.highlighted) this.actionIndex = 0;
	}

	closeActions(): void {
		this.actionIndex = null;
	}

	toggleActions(): void {
		if (this.actionsOpen) {
			this.closeActions();
		} else {
			this.openActions();
		}
	}

	run(beforeRun?: () => void): boolean {
		return this.runAction(this.actionsOpen ? this.highlightedAction : this.highlighted?.actions[0], beforeRun);
	}

	runShortcut(shortcut: Shortcut, beforeRun?: () => void): boolean {
		return this.runAction(
			this.highlighted?.actions.find((action) => action.shortcut === shortcut),
			beforeRun
		);
	}

	private runAction(action: Action | undefined, beforeRun?: () => void): boolean {
		if (!action) return false;

		this.closeActions();
		beforeRun?.();
		action.run();

		return true;
	}
}
