import type { NoteModel } from '@/models/note-model';
import { Folded } from '@/text/fold';

export type ModelIntent =
	| { model: NoteModel; action: 'list'; value: '' }
	| { model: NoteModel; action: 'search'; value: string }
	| { model: NoteModel; action: 'create'; value: string };

type Selector = { model: NoteModel; foldedWords: string[]; length: number };
type WordRange = { value: string; end: number };

export function parseModelIntent(query: string, models: readonly NoteModel[]): ModelIntent | null {
	const selectors = models.flatMap((model) => [model.name, ...model.keywords].flatMap((value) => selectorsFor(model, value)));
	selectors.sort((left, right) => right.length - left.length || left.model.name.localeCompare(right.model.name));

	const scoped = matchSelector(query, selectors);
	if (scoped) {
		if (!scoped.remainder) return { model: scoped.model, action: 'list', value: '' };

		const first = queryWords(scoped.remainder)[0];
		if (first && CREATE_VERBS.has(Folded.of(first.value).text)) {
			return { model: scoped.model, action: 'create', value: scoped.remainder.slice(first.end).trim() };
		}
		return { model: scoped.model, action: 'search', value: scoped.remainder };
	}

	const verb = queryWords(query)[0];
	if (!verb || !CREATE_VERBS.has(Folded.of(verb.value).text)) return null;
	const afterVerb = matchSelector(query.slice(verb.end).trimStart(), selectors);
	return afterVerb ? { model: afterVerb.model, action: 'create', value: afterVerb.remainder.trim() } : null;
}

function matchSelector(query: string, selectors: readonly Selector[]): { model: NoteModel; remainder: string } | null {
	const words = queryWords(query);
	for (const candidate of selectors) {
		if (!startsWithSelector(words, candidate.foldedWords)) continue;
		const lastWord = words[candidate.foldedWords.length - 1];
		if (!lastWord) continue;
		return { model: candidate.model, remainder: query.slice(lastWord.end).trimStart() };
	}
	return null;
}

const CREATE_VERBS = new Set(['create', 'add', 'new']);

function selectorsFor(model: NoteModel, value: string): Selector[] {
	const folded = Folded.of(value.trim()).text.trim().replace(/\s+/gu, ' ');
	const words = folded.split(' ').filter(Boolean);
	const last = words[words.length - 1];
	if (!last) return [];
	const variants = new Set([last, plural(last), singular(last)]);
	return [...variants].map((variant) => {
		const foldedWords = [...words.slice(0, -1), variant];
		return { model, foldedWords, length: foldedWords.join(' ').length };
	});
}

function plural(word: string): string {
	if (/[^aeiou]y$/u.test(word)) return `${word.slice(0, -1)}ies`;
	if (/(s|x|z|ch|sh)$/u.test(word)) return `${word}es`;
	return `${word}s`;
}

function singular(word: string): string {
	if (word.length > 3 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
	if (word.length > 3 && /(s|x|z|ch|sh)es$/u.test(word)) return word.slice(0, -2);
	if (word.length > 2 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
	return word;
}

function queryWords(query: string): WordRange[] {
	return Array.from(query.matchAll(/\S+/gu), (match) => ({
		value: match[0],
		end: match.index + match[0].length,
	}));
}

function startsWithSelector(words: readonly WordRange[], selectorWords: readonly string[]): boolean {
	if (!selectorWords.length || words.length < selectorWords.length) return false;
	return selectorWords.every((word, index) => Folded.of(words[index]?.value ?? '').text === word);
}
