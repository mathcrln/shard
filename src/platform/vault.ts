import type { Note } from '@/search/note';

export interface Vault {
	notes(): readonly Note[];
}
