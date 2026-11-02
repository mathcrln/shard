import type { NoteModel } from '@/models/note-model';
import type { NoteModels } from '@/models/note-models';
import { Membership } from '@/models/membership';
import type { Vault } from '@/platform/vault';
import type { Note } from '@/search/note';
import { Matcher } from '@/text/matcher';

export class ModelNotes {
	constructor(
		private readonly vault: Vault,
		private readonly models: Pick<NoteModels, 'get' | 'issues'>
	) {}

	find(model: NoteModel, query = ''): Note[] {
		const current = this.models.get(model.id);
		if (!current || this.models.issues(model.id).length) return [];
		const matcher = Matcher.of(query);
		const candidates = this.vault.notes().flatMap((note) => {
			if (!Membership.matches(current, note)) return [];

			let score: number | undefined;
			for (const text of [note.name, ...note.aliases]) {
				const match = matcher.match(text);
				if (match && (score === undefined || match.score > score)) score = match.score;
			}

			return score === undefined ? [] : [{ note, score }];
		});

		return candidates
			.sort((a, b) => b.score - a.score || a.note.name.localeCompare(b.note.name) || a.note.path.localeCompare(b.note.path))
			.map(({ note }) => note);
	}
}
