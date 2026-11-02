import type { App, Command } from 'obsidian';
import { act } from 'react';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import ShardPlugin from '@/main';
import type { SettingsTab } from '@/ui/settings/settings-tab';
import { Platform } from './support/obsidian';

describe('Shard plugin lifecycle', () => {
	it('registers the existing open-bar command without a default hotkey', async () => {
		const { commands } = await GivenPlugin();

		expect(commands).toHaveLength(1);
		expect(commands[0]).toMatchObject({ id: 'open-bar', name: 'Open bar' });
		expect(commands[0]?.hotkeys).toBeUndefined();
	});

	it.each([false, true])('opens notes without close buttons on mobile=%s', async (mobile) => {
		const { plugin, commands } = await GivenPlugin(mobile);
		WhenOpening(commands);
		expect(plugin.app).toBeDefined();
		expect(document.querySelector('input[aria-label="Search notes and commands"]')).not.toBeNull();
		expect(document.querySelector('.modal-close-button')).toBeNull();
		expect(document.querySelector('.shard-close')).toBeNull();
	});

	it('opens notes through the configured Obsidian adapters', async () => {
		const { commands, openLink } = await GivenPlugin();

		WhenOpening(commands);
		const result = document.querySelector<HTMLElement>('[role="option"]');
		expect(result?.textContent).toContain('Ada Lovelace');
		act(() => result?.click());

		expect(openLink).toHaveBeenCalledWith('People/Ada Lovelace.md', '', false);
		expect(document.querySelector('.shard-overlay, .shard-native-container')).toBeNull();
	});

	it('registers a settings tab that saves changes', async () => {
		const { tabs, saved } = await GivenPlugin();
		const [tab] = tabs;
		tab?.getSettingDefinitions();

		await tab?.setControlValue('recentNotes', 5);

		expect(saved).toEqual([{ searchHeadings: true, commandsOnOpen: true, recentNotes: 5 }]);
	});

	it('loads saved settings', async () => {
		const { tabs } = await GivenPlugin(false, { commandsOnOpen: false });
		const [tab] = tabs;
		tab?.getSettingDefinitions();

		expect(tab?.getControlValue('commandsOnOpen')).toBe(false);
	});

	it('replaces an open palette and removes it when the plugin unloads', async () => {
		const { plugin, commands } = await GivenPlugin();
		WhenOpening(commands);
		const previous = document.querySelector('.shard-overlay, .shard-native-container');

		WhenOpening(commands);

		expect(previous?.isConnected).toBe(false);
		expect(document.querySelectorAll('.shard-overlay, .shard-native-container')).toHaveLength(1);
		act(() => plugin.unload());
		expect(document.querySelector('.shard-overlay, .shard-native-container')).toBeNull();
	});
});

async function GivenPlugin(mobile = false, data: unknown = null) {
	Platform.isMobile = mobile;
	const openLink = vi.fn();
	const app = {
		vault: {
			getMarkdownFiles: () => [
				{ path: 'People/Ada Lovelace.md', basename: 'Ada Lovelace', parent: { isRoot: () => false, path: 'People' } },
			],
		},
		metadataCache: { getFileCache: () => null },
		workspace: { getLastOpenFiles: () => ['People/Ada Lovelace.md'], openLinkText: openLink, activeEditor: null },
	} as unknown as App;
	const plugin = new ShardPlugin(app, {
		id: 'shard',
		name: 'Shard',
		version: '0.1.0',
		minAppVersion: '1.13.0',
		author: 'mathcrln',
		description: 'An action-focused bar.',
	});
	const commands: Command[] = [];
	vi.spyOn(plugin, 'addCommand').mockImplementation((command) => {
		commands.push(command);
		return command;
	});
	const tabs: SettingsTab[] = [];
	const saved: unknown[] = [];
	vi.spyOn(plugin, 'addSettingTab').mockImplementation((tab) => void tabs.push(tab as SettingsTab));
	vi.spyOn(plugin, 'loadData').mockResolvedValue(data);
	vi.spyOn(plugin, 'saveData').mockImplementation((value) => Promise.resolve(void saved.push(value)));
	onTestFinished(() => act(() => plugin.unload()));
	plugin.load();
	await act(() => new Promise((resolve) => setTimeout(resolve)));

	return { plugin, commands, openLink, tabs, saved };
}

function WhenOpening(commands: Command[]): void {
	act(() => {
		commands[0]?.callback?.();
	});
}
