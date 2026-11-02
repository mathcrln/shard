import { Platform, type App, type Command } from 'obsidian';
import type { Commands } from '@/platform/commands';

type Registry = {
	listCommands(): Command[];
	executeCommandById(id: string): boolean;
};

type Host = { workspace: Pick<App['workspace'], 'activeEditor'>; commands?: Registry };

const PALETTE_COMMANDS = new Set(['shard:open-bar', 'shard:open-files', 'shard:open-commands']);

export class ObsidianCommands implements Commands {
	constructor(private readonly app: Host) {}

	list() {
		return (this.registry?.listCommands() ?? [])
			.filter((command) => !PALETTE_COMMANDS.has(command.id) && this.available(command))
			.map((command) => ({ id: command.id, name: command.name, run: () => this.run(command.id) }));
	}

	private get registry(): Registry | undefined {
		return this.app.commands;
	}

	private available(command: Command): boolean {
		try {
			if (command.mobileOnly && !Platform.isMobile) return false;
			const context = this.app.workspace.activeEditor;
			if (command.editorCheckCallback) {
				return !!context?.editor && !!command.editorCheckCallback(true, context.editor, context);
			}
			if (command.editorCallback) return !!context?.editor;
			if (command.checkCallback) return !!command.checkCallback(true);
			return typeof command.callback === 'function';
		} catch {
			return false;
		}
	}

	private run(id: string): void {
		const registry = this.registry;
		if (!registry || registry.executeCommandById(id) === false) throw new Error('This command is no longer available.');
	}
}
