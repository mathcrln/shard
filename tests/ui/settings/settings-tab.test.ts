import type { Plugin, SettingDefinitionItem } from 'obsidian';
import { expect, it, vi } from 'vitest';
import { Settings } from '@/models/plugin-settings';
import { SettingsTab } from '@/ui/settings/settings-tab';

it('groups the opening and search settings', () => {
	const { tab } = GivenSettingsTab();

	expect(tab.getSettingDefinitions().map(headingOf)).toEqual(['When the bar opens', 'Search']);
});

it('reads controls from the settings', () => {
	const { tab } = GivenSettingsTab({ recentNotes: 4 });

	expect(tab.getControlValue('commandsOnOpen')).toBe(true);
	expect(tab.getControlValue('searchHeadings')).toBe(true);
	expect(tab.getControlValue('recentNotes')).toBe(4);
});

it('saves a changed control', async () => {
	const { tab, settings, save } = GivenSettingsTab();

	await tab.setControlValue('searchHeadings', false);

	expect(settings.searchHeadings).toBe(false);
	expect(save).toHaveBeenCalledOnce();
});

it.each([
	['recentNotes', 0],
	['recentNotes', 51],
	['recentNotes', 2.5],
	['searchHeadings', 'no'],
])('does not save invalid %s value %j', async (key, value) => {
	const { tab, settings, save } = GivenSettingsTab();
	const before = settings.toJSON();

	await tab.setControlValue(key, value);

	expect(settings.toJSON()).toEqual(before);
	expect(save).not.toHaveBeenCalled();
});

function GivenSettingsTab(data: object = {}) {
	const settings = Settings.from(data);
	const save = vi.fn(() => Promise.resolve());
	const tab = new SettingsTab({ app: {} } as Plugin, { settings, save });
	tab.getSettingDefinitions();

	return { tab, settings, save };
}

function headingOf(item: SettingDefinitionItem): string | undefined {
	return 'heading' in item ? item.heading : undefined;
}
