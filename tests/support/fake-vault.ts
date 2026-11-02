import type { Note } from '@/search/note';
import type { Vault } from '@/platform/vault';

export class FakeVault implements Vault {
	constructor(private readonly all: readonly Note[] = []) {}

	notes(): readonly Note[] {
		return this.all;
	}
}
