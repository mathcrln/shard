export type Command = { id: string; name: string; run(): void };

export interface Commands {
	list(): readonly Command[];
}
