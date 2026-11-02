import { Settings } from '@/models/plugin-settings';
import type { ShardSettings } from '@/models/plugin-settings';
import type { Note } from '@/search/note';
import { Search } from '@/queries/search';
import { FakeRecents } from './fake-recents';
import { FakeVault } from './fake-vault';
import { FakeWorkspace } from './fake-workspace';
import { FakeCommands } from './fake-commands';

export function GivenNote(
	name: string,
	{ folder = '', aliases = [], headings = [] }: { folder?: string; aliases?: string[]; headings?: string[] } = {}
): Note {
	const path = folder ? `${folder}/${name}.md` : `${name}.md`;
	return { path, name, folder, aliases, headings };
}

export function GivenSearch({
	notes = [],
	recents = [],
	commands = [],
	settings = {},
}: {
	notes?: Note[];
	recents?: string[];
	commands?: { id: string; name: string }[];
	settings?: Partial<ShardSettings>;
} = {}) {
	const workspace = new FakeWorkspace();
	const commandList = new FakeCommands(commands);
	const search = new Search({
		vault: new FakeVault(notes),
		recents: new FakeRecents(recents),
		workspace,
		commands: commandList,
		settings: Settings.from(settings),
	});
	return { search, workspace, commands: commandList };
}
