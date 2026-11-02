import { expect, it } from 'vitest';
import { segmentsOf } from '@/text/segments';

it('returns the whole text as one unmatched segment when nothing matched', () => {
	expect(segmentsOf('Ada Lovelace', [])).toEqual([{ text: 'Ada Lovelace', matched: false }]);
});

it('splits the text around matched ranges', () => {
	expect(segmentsOf('Ada Lovelace', [{ start: 4, end: 8 }])).toEqual([
		{ text: 'Ada ', matched: false },
		{ text: 'Love', matched: true },
		{ text: 'lace', matched: false },
	]);
});

it('starts with a matched segment when the match is at the start', () => {
	expect(segmentsOf('Ada', [{ start: 0, end: 2 }])).toEqual([
		{ text: 'Ad', matched: true },
		{ text: 'a', matched: false },
	]);
});

it('ends with a matched segment when the match is at the end', () => {
	expect(segmentsOf('Ada', [{ start: 1, end: 3 }])).toEqual([
		{ text: 'A', matched: false },
		{ text: 'da', matched: true },
	]);
});

it('returns nothing for empty text', () => {
	expect(segmentsOf('', [])).toEqual([]);
});
