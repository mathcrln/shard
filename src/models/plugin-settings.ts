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
		const record = isRecord(data) ? data : {};

		return new Settings({
			searchHeadings: boolean(record['searchHeadings'], DEFAULTS.searchHeadings),
			commandsOnOpen: boolean(record['commandsOnOpen'], DEFAULTS.commandsOnOpen),
			unifiedSearch: boolean(record['unifiedSearch'], DEFAULTS.unifiedSearch),
			recentNotes: Settings.isRecentNotes(record['recentNotes']) ? record['recentNotes'] : DEFAULTS.recentNotes,
		});
	}

	static isRecentNotes(value: unknown): value is number {
		return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= MAX_RECENT_NOTES;
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

function boolean(value: unknown, fallback: boolean): boolean {
	return typeof value === 'boolean' ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
