import { Folded } from '@/text/fold';
import { mergeRanges, type Range } from '@/text/range';

export type Match = { score: number; ranges: Range[] };

type Found = { score: number; ranges: Range[] };

export class Matcher {
	private constructor(private readonly words: readonly string[]) {}

	static of(query: string): Matcher {
		return new Matcher(Folded.of(query).text.split(/\s+/).filter(Boolean));
	}

	get isEmpty(): boolean {
		return this.words.length === 0;
	}

	match(text: string): Match | null {
		if (this.isEmpty) return { score: 0, ranges: [] };

		const folded = Folded.of(text);
		const founds: Found[] = [];

		for (const word of this.words) {
			const found = find(word, folded.text);
			if (!found) return null;
			founds.push(found);
		}

		return {
			score: founds.reduce((total, found) => total + found.score, 0) / founds.length,
			ranges: mergeRanges(founds.flatMap((found) => found.ranges.map((range) => folded.original(range)))),
		};
	}
}

function find(word: string, text: string): Found | null {
	return findExact(word, text) ?? findScattered(word, text);
}

function findExact(word: string, text: string): Found | null {
	let best: Found | null = null;

	for (let at = text.indexOf(word); at !== -1; at = text.indexOf(word, at + 1)) {
		const score = positionScore(text, at) + (20 * word.length) / text.length;

		if (!best || score > best.score) {
			best = { score, ranges: [{ start: at, end: at + word.length }] };
		}
	}

	return best;
}

function findScattered(word: string, text: string): Found | null {
	const ranges: Range[] = [];
	let from = 0;

	for (const letter of word) {
		const at = text.indexOf(letter, from);
		if (at === -1) return null;
		ranges.push({ start: at, end: at + letter.length });
		from = at + letter.length;
	}

	const first = ranges[0];
	const last = ranges[ranges.length - 1];
	if (!first || !last) return null;

	return { score: (20 * word.length) / (last.end - first.start), ranges };
}

function positionScore(text: string, at: number): number {
	if (at === 0) return 100;

	return /[^\p{L}\p{N}]/u.test(text.charAt(at - 1)) ? 80 : 60;
}
