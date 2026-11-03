import { describe, expect, it } from 'vitest';
import { Settings } from '@/models/plugin-settings';

describe('loading', () => {
	it.each([null, undefined, 'junk', 42, [], {}])('starts from the defaults with %j', (data) => {
		expect(Settings.from(data).toJSON()).toEqual({
			searchHeadings: true,
			commandsOnOpen: true,
			unifiedSearch: false,
			recentNotes: 10,
		});
	});

	it('keeps stored values', () => {
		const settings = Settings.from({ searchHeadings: false, commandsOnOpen: false, unifiedSearch: true, recentNotes: 25 });

		expect(settings.toJSON()).toEqual({
			searchHeadings: false,
			commandsOnOpen: false,
			unifiedSearch: true,
			recentNotes: 25,
		});
	});

	it.each([0, 51, 2.5, '10', Infinity])('replaces an invalid recent note count %j with the default', (recentNotes) => {
		expect(Settings.from({ recentNotes }).recentNotes).toBe(10);
	});

	it('replaces values of the wrong type with the defaults', () => {
		expect(Settings.from({ searchHeadings: 'no', commandsOnOpen: 0, unifiedSearch: 'yes' }).toJSON()).toMatchObject({
			searchHeadings: true,
			commandsOnOpen: true,
			unifiedSearch: false,
		});
	});
});

describe('updating', () => {
	it('applies valid changes and keeps the rest', () => {
		const settings = Settings.defaults();

		settings.update({ searchHeadings: false });

		expect(settings.toJSON()).toEqual({
			searchHeadings: false,
			commandsOnOpen: true,
			unifiedSearch: false,
			recentNotes: 10,
		});
	});

	it('does not store an invalid recent note count', () => {
		const settings = Settings.from({ recentNotes: 20 });

		settings.update({ recentNotes: 0 });

		expect(settings.recentNotes).toBe(10);
	});
});
