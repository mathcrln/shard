import type { SettingDefinitionGroup } from 'obsidian';
import { MAX_RECENT_NOTES, Settings } from '@/models/plugin-settings';

export function searchPreferences(): SettingDefinitionGroup {
	return {
		type: 'group',
		heading: 'Search preferences',
		items: [
			{ name: 'Unified search', control: { type: 'toggle', key: 'unifiedSearch' } },
			{ name: 'Search headings', control: { type: 'toggle', key: 'searchHeadings' } },
			{ name: 'Show commands when the bar opens', control: { type: 'toggle', key: 'commandsOnOpen' } },
			{
				name: 'Recent notes',
				control: {
					type: 'number',
					key: 'recentNotes',
					min: 1,
					max: MAX_RECENT_NOTES,
					step: 1,
					validate: (value) =>
						Settings.isRecentNotes(value) ? undefined : `Enter a whole number from 1 to ${MAX_RECENT_NOTES}.`,
				},
			},
		],
	};
}
