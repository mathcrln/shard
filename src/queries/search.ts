import type { Settings } from '@/models/plugin-settings';
import type { ModelCreator } from '@/models/note-creation';
import type { NoteModel } from '@/models/note-model';
import { parseModelIntent } from '@/models/model-intent';
import type { NoteModels } from '@/models/note-models';
import type { Commands } from '@/platform/commands';
import type { Note } from '@/search/note';
import type { Recents } from '@/platform/recents';
import type { Vault } from '@/platform/vault';
import type { Workspace } from '@/platform/workspace';
import type { ModelNotes } from '@/queries/model-notes';
import { commandResults, rankedCommandResults } from '@/search/command-results';
import { searchModeFor } from '@/search/mode';
import type { SearchMode } from '@/search/mode';
import { openActions } from '@/search/open-actions';
import { compareRankedResults, type RankedResult } from '@/search/ranked-result';
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
	models?: Pick<NoteModels, 'all'>;
	modelNotes?: Pick<ModelNotes, 'find'>;
};

export type SearchModeOptions = { mode?: SearchMode; creator?: ModelCreator };

export class Search {
	constructor(private readonly ports: SearchOptions) {}

	find(query: string, options: SearchModeOptions = {}): Result[] {
		const mode = searchModeFor(query, options.mode ?? 'files');
		const commandQuery = query.trimStart().startsWith('>') ? query.trimStart().slice(1) : query;

		if (mode === 'commands') return commandResults(this.ports.commands, commandQuery, 30);
		const modelResults = this.modelIntentResults(query, options.creator);
		if (modelResults) return modelResults;

		const matcher = Matcher.of(query);

		if (matcher.isEmpty) {
			const recent = this.recent();
			const commands = mode === 'unified' && this.settings.commandsOnOpen ? commandResults(this.ports.commands, '', 6) : [];
			return [...(recent.length ? recent : this.defaults()), ...commands];
		}

		if (mode === 'unified') {
			const commands = rankedCommandResults(this.ports.commands, query, 30);
			const notes = best(this.noteCandidates(matcher), NOTE_LIMIT);
			const headings =
				this.settings.searchHeadings && query.trim().length >= MINIMUM_HEADING_QUERY
					? best(this.headingCandidates(matcher), HEADING_LIMIT)
					: [];
			return this.rank([...commands, ...notes, ...headings]);
		}

		const headings =
			this.settings.searchHeadings && query.trim().length >= MINIMUM_HEADING_QUERY ? this.headings(matcher) : [];
		return [...this.notes(matcher), ...headings];
	}

	private get settings(): SearchSettings {
		return this.ports.settings;
	}

	private modelIntentResults(query: string, creator?: ModelCreator): Result[] | null {
		if (!this.ports.models || !this.ports.modelNotes) return null;
		const intent = parseModelIntent(query, this.ports.models.all);
		if (!intent) return null;

		if (intent.action === 'create') {
			return creator ? [this.createModelResult(intent.model, intent.value, creator)] : [];
		}

		const matcher = Matcher.of(intent.value);
		const notes = this.ports.modelNotes.find(intent.model, intent.value).slice(0, NOTE_LIMIT);
		const noteResults: Result[] = notes.map((note) => {
			const matchingText = [note.name, ...note.aliases]
				.map((text) => ({ text, match: matcher.match(text) }))
				.filter((candidate) => candidate.match)
				.sort((left, right) => (right.match?.score ?? 0) - (left.match?.score ?? 0))[0];
			const match = matchingText?.match;
			const title = matchingText?.text ?? note.name;
			return {
				group: 'Notes',
				title,
				description: title === note.name ? note.folder : note.name,
				ranges: match?.ranges ?? [],
				actions: openActions(this.ports.workspace, { path: note.path }),
			} satisfies Result;
		});

		if (intent.action === 'list' && creator) {
			noteResults.unshift(this.createModelResult(intent.model, '', creator));
		}
		return noteResults;
	}

	private createModelResult(model: NoteModel, title: string, creator: ModelCreator): Result {
		return {
			group: 'Models',
			title: `Create ${model.name}`,
			description: title,
			ranges: [],
			actions: [{ name: 'Create', keepOpen: true, run: () => creator.create(model, title) }],
		};
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
		return best(this.noteCandidates(matcher), NOTE_LIMIT).map(({ result }) => result);
	}

	private noteCandidates(matcher: Matcher): RankedResult[] {
		const boosts = this.recencyBoosts();
		return this.ports.vault.notes().flatMap((note) => {
			const candidate = this.noteCandidate(matcher, note);
			if (!candidate) return [];
			return [{ ...candidate, score: candidate.score + (boosts.get(note.path) ?? 0) }];
		});
	}

	private noteCandidate(matcher: Matcher, note: Note): RankedResult | null {
		const target = { path: note.path };
		const actions = openActions(this.ports.workspace, target);
		const candidates: RankedResult[] = [];

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

		return candidates.reduce<RankedResult | null>((top, next) => (top && top.score >= next.score ? top : next), null);
	}

	private headings(matcher: Matcher): Result[] {
		return this.headingCandidates(matcher).map(({ result }) => result);
	}

	private headingCandidates(matcher: Matcher): RankedResult[] {
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

	private rank(candidates: readonly RankedResult[]): Result[] {
		return [...candidates]
			.sort(compareRankedResults)
			.slice(0, RESULT_LIMIT)
			.map(({ result }) => result);
	}

	private recencyBoosts(): Map<string, number> {
		return new Map(this.ports.recents.paths().map((path, rank) => [path, Math.max(0, RECENCY_BOOST - rank)]));
	}
}

const RESULT_LIMIT = 70;

function best(candidates: readonly RankedResult[], limit: number): RankedResult[] {
	return [...candidates].sort(compareRankedResults).slice(0, limit);
}
