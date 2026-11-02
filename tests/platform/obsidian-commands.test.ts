import type { Command } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import { ObsidianCommands } from '@/platform/obsidian-commands';

vi.mock('obsidian', () => ({ Platform: { isMobile: false } }));

describe('ObsidianCommands', () => {
	it('lists runnable commands without executing them or including Shard itself', () => {
		const callback = vi.fn();
		const check = vi.fn(() => true);
		const { commands } = GivenCommands([
			{ id: 'app:new', name: 'New note', callback },
			{ id: 'plugin:available', name: 'Available', checkCallback: check },
			{ id: 'plugin:hidden', name: 'Hidden', checkCallback: () => false },
			{ id: 'plugin:editor', name: 'Editor only', editorCallback: vi.fn() },
			{ id: 'shard:open-bar', name: 'Shard: Open bar', callback },
			{ id: 'app:mobile', name: 'Mobile only', mobileOnly: true, callback },
		]);

		expect(commands.list().map((command) => command.id)).toEqual(['app:new', 'plugin:available']);
		expect(callback).not.toHaveBeenCalled();
		expect(check).toHaveBeenCalledWith(true);
	});

	it('ignores a broken availability check without losing other commands', () => {
		const { commands } = GivenCommands([
			{
				id: 'broken',
				name: 'Broken',
				checkCallback: () => {
					throw new Error('Broken plugin');
				},
			},
			{ id: 'working', name: 'Working', callback: vi.fn() },
		]);

		expect(commands.list().map((command) => command.id)).toEqual(['working']);
	});

	it('executes by stable command id', () => {
		const { commands, execute } = GivenCommands([{ id: 'app:new', name: 'New note', callback: vi.fn() }]);

		commands.list()[0]?.run();

		expect(execute).toHaveBeenCalledWith('app:new');
	});

	it('reports a command that became unavailable before execution', () => {
		const { commands, execute } = GivenCommands([{ id: 'app:new', name: 'New note', callback: vi.fn() }]);
		const command = commands.list()[0];
		execute.mockReturnValue(false);

		expect(() => command?.run()).toThrow('This command is no longer available.');
	});

	it('allows default note results when the internal command registry is unavailable', () => {
		const commands = new ObsidianCommands({ workspace: { activeEditor: null } });

		expect(commands.list()).toEqual([]);
	});
});

function GivenCommands(all: Command[]) {
	const execute = vi.fn(() => true);
	const commands = new ObsidianCommands({
		workspace: { activeEditor: null },
		commands: { listCommands: () => all, executeCommandById: execute },
	});
	return { commands, execute };
}
