import type { Settings } from '@/models/plugin-settings';
import type { Commands } from '@/platform/commands';
import type { Note } from '@/search/note';
import type { Recents } from '@/platform/recents';
import type { Vault } from '@/platform/vault';
import type { Workspace } from '@/platform/workspace';
import { commandResults } from '@/search/command-results';
import { openActions } from '@/search/open-actions';
import type { Result } from '@/search/result';
import { Matcher } from '@/text/matcher';

const NOTE_LIMIT = 30;
const HEADING_LIMIT = 10;
const MINIMUM_HEADING_QUERY = 2;
const RECENCY_BOOST = 20;

export type SearchSettings = Pick<Settings, 'searchHeadings' | 'commandsOnOpen' | 'recentNotes'>;

export type SearchOptions = {
	vault: Vault;
	recents: Recents;
	workspace: Workspace;
	commands: Commands;
	settings: SearchSettings;
};

type Candidate = { score: number; result: Result };

export class Search {
	constructor(private readonly ports: SearchOptions) {}

	find(query: string): Result[] {
		if (query.trimStart().startsWith('>')) return commandResults(this.ports.commands, query.trimStart().slice(1), 30);

		const matcher = Matcher.of(query);

		if (matcher.isEmpty) {
			const recent = this.recent();
			const commands = this.settings.commandsOnOpen ? commandResults(this.ports.commands, '', 6) : [];
			return [...commands, ...(recent.length ? recent : this.defaults())];
		}

		const headings =
			this.settings.searchHeadings && query.trim().length >= MINIMUM_HEADING_QUERY ? this.headings(matcher) : [];

		return [...commandResults(this.ports.commands, query, 30), ...this.notes(matcher), ...headings];
	}

	private get settings(): SearchSettings {
		return this.ports.settings;
	}

	private defaults(): Result[] {
		return [...this.ports.vault.notes()]
			.sort((a, b) => a.name.localeCompare(b.name))
			.slice(0, this.settings.recentNotes)
			.map((note) => ({
				group: 'Notes',
				title: note.name,
				description: note.folder,
				ranges: [],
				actions: openActions(this.ports.workspace, { path: note.path }),
			}));
	}

	private recent(): Result[] {
		const notes = new Map(this.ports.vault.notes().map((note) => [note.path, note]));

		return this.ports.recents
			.paths()
			.flatMap((path) => notes.get(path) ?? [])
			.slice(0, this.settings.recentNotes)
			.map((note) => ({
				group: 'Recent',
				title: note.name,
				description: note.folder,
				ranges: [],
				actions: openActions(this.ports.workspace, { path: note.path }),
			}));
	}

	private notes(matcher: Matcher): Result[] {
		const boosts = this.recencyBoosts();

		const candidates = this.ports.vault.notes().flatMap((note) => {
			const candidate = this.noteCandidate(matcher, note);
			if (!candidate) return [];

			return [{ ...candidate, score: candidate.score + (boosts.get(note.path) ?? 0) }];
		});

		return best(candidates, NOTE_LIMIT);
	}

	private noteCandidate(matcher: Matcher, note: Note): Candidate | null {
		const target = { path: note.path };
		const actions = openActions(this.ports.workspace, target);
		const candidates: Candidate[] = [];

		const byName = matcher.match(note.name);
		if (byName) {
			candidates.push({
				score: byName.score,
				result: { group: 'Notes', title: note.name, description: note.folder, ranges: byName.ranges, actions },
			});
		}

		for (const alias of note.aliases) {
			const byAlias = matcher.match(alias);
			if (!byAlias) continue;

			candidates.push({
				score: byAlias.score,
				result: { group: 'Notes', title: alias, description: note.name, ranges: byAlias.ranges, actions },
			});
		}

		return candidates.reduce<Candidate | null>((top, next) => (top && top.score >= next.score ? top : next), null);
	}

	private headings(matcher: Matcher): Result[] {
		const candidates = this.ports.vault.notes().flatMap((note) =>
			note.headings.flatMap((heading) => {
				const match = matcher.match(heading);
				if (!match) return [];

				const actions = openActions(this.ports.workspace, { path: note.path, heading });
				const result: Result = {
					group: 'Headings',
					title: heading,
					description: note.name,
					ranges: match.ranges,
					actions,
				};

				return [{ score: match.score, result }];
			})
		);

		return best(candidates, HEADING_LIMIT);
	}

	private recencyBoosts(): Map<string, number> {
		return new Map(this.ports.recents.paths().map((path, rank) => [path, Math.max(0, RECENCY_BOOST - rank)]));
	}
}

function best(candidates: readonly Candidate[], limit: number): Result[] {
	return [...candidates]
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((candidate) => candidate.result);
}
