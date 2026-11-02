interface Binding {
	read: () => unknown;
	write: (value: unknown) => Promise<void>;
}

export class Bindings {
	private readonly entries = new Map<string, Binding>();

	register(key: string, binding: Binding): void {
		this.entries.set(key, binding);
	}

	read(key: string): unknown {
		return this.entries.get(key)?.read();
	}

	async write(key: string, value: unknown): Promise<void> {
		await this.entries.get(key)?.write(value);
	}

	clear(): void {
		this.entries.clear();
	}
}
