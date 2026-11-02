import type { Command, Commands } from '@/platform/commands';

export class FakeCommands implements Commands {
	readonly executed: string[] = [];

	constructor(readonly all: { id: string; name: string }[] = []) {}

	list(): Command[] {
		return this.all.map((command) => ({ ...command, run: () => this.executed.push(command.id) }));
	}
}
