import type { Search } from '@/queries/search';
import type { ModelCreator } from '@/models/note-creation';
import type { Action, Shortcut } from '@/search/action';
import type { Group, Result } from '@/search/result';
import { searchModeFor, type SearchMode } from '@/search/mode';
import { Num } from '@/utils/num';

export type Section = { group: Group; results: Result[] };

export class BarState {
	query = '';
	focusRevision = 0;
	results: readonly Result[] = [];
	private readonly baseMode: SearchMode;

	private index = 0;
	private actionIndex: number | null = null;
	private creator: ModelCreator | undefined;

	constructor(
		private readonly search: Pick<Search, 'find'>,
		options: { query?: string; unifiedSearch?: boolean } = {}
	) {
		this.baseMode = options.unifiedSearch ? 'unified' : 'files';
		this.type(options.query ?? '');
	}

	get mode(): SearchMode {
		return searchModeFor(this.query, this.baseMode);
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
		this.results = this.search.find(query, { mode: this.baseMode, creator: this.creator });
		this.index = 0;
		this.closeActions();
	}

	useCreator(creator: ModelCreator): void {
		this.creator = creator;
		this.type(this.query);
	}

	compose(query: string): void {
		this.type(query);
		this.focusRevision++;
	}

	next(): void {
		if (this.actionIndex !== null) {
			this.actionIndex = Num.clamp(this.actionIndex + 1, 0, this.actions.length - 1);
		} else {
			this.index = Num.clamp(this.index + 1, 0, this.results.length - 1);
		}
	}

	previous(): void {
		if (this.actionIndex !== null) {
			this.actionIndex = Num.clamp(this.actionIndex - 1, 0, this.actions.length - 1);
		} else {
			this.index = Num.clamp(this.index - 1, 0, this.results.length - 1);
		}
	}

	highlight(position: number): void {
		if (Num.between(position, 0, this.results.length - 1)) this.index = position;
	}

	highlightAction(position: number): void {
		if (this.actionsOpen && Num.between(position, 0, this.actions.length - 1)) this.actionIndex = position;
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
		if (!action.keepOpen) beforeRun?.();
		action.run();

		return true;
	}
}
