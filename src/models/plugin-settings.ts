import { Num } from '@/utils/num';

export interface ShardSettings {
	searchHeadings: boolean;
	commandsOnOpen: boolean;
	unifiedSearch: boolean;
	recentNotes: number;
}

export const MAX_RECENT_NOTES = 50;

const DEFAULTS: ShardSettings = {
	searchHeadings: true,
	commandsOnOpen: true,
	unifiedSearch: false,
	recentNotes: 10,
};

export class Settings {
	private constructor(private readonly values: ShardSettings) {}

	static defaults(): Settings {
		return new Settings({ ...DEFAULTS });
	}

	static from(data: unknown): Settings {
		const stored: Partial<Record<keyof ShardSettings, unknown>> = typeof data === 'object' && data !== null ? data : {};
		const { searchHeadings, commandsOnOpen, unifiedSearch, recentNotes } = stored;

		return new Settings({
			searchHeadings: typeof searchHeadings === 'boolean' ? searchHeadings : DEFAULTS.searchHeadings,
			commandsOnOpen: typeof commandsOnOpen === 'boolean' ? commandsOnOpen : DEFAULTS.commandsOnOpen,
			unifiedSearch: typeof unifiedSearch === 'boolean' ? unifiedSearch : DEFAULTS.unifiedSearch,
			recentNotes: Settings.isRecentNotes(recentNotes) ? recentNotes : DEFAULTS.recentNotes,
		});
	}

	static isRecentNotes(value: unknown): value is number {
		return typeof value === 'number' && Number.isSafeInteger(value) && Num.between(value, 1, MAX_RECENT_NOTES);
	}

	get searchHeadings(): boolean {
		return this.values.searchHeadings;
	}

	get commandsOnOpen(): boolean {
		return this.values.commandsOnOpen;
	}

	get unifiedSearch(): boolean {
		return this.values.unifiedSearch;
	}

	get recentNotes(): number {
		return this.values.recentNotes;
	}

	update(changes: Partial<ShardSettings>): void {
		Object.assign(this.values, Settings.from({ ...this.values, ...changes }).values);
	}

	toJSON(): ShardSettings {
		return { ...this.values };
	}
}
