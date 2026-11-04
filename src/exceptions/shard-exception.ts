import { Notice } from 'obsidian';

export class ShardException extends Error {
	static from(this: void, error: unknown): ShardException {
		if (error instanceof ShardException) return error;

		return new ShardException(error instanceof Error ? error.message : 'Something went wrong.');
	}

	static render(this: void, error: unknown): void {
		ShardException.from(error).render();
	}

	render(): void {
		new Notice(this.message);
	}
}
