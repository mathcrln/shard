import { describe, expect, it } from 'vitest';
import { Folded } from '@/text/fold';

describe('Folded.of', () => {
	it('lowercases text', () => {
		expect(Folded.of('Ada LOVELACE').text).toBe('ada lovelace');
	});

	it('removes diacritics', () => {
		expect(Folded.of('Éléphant à côté').text).toBe('elephant a cote');
	});

	it('expands letters that have no decomposition', () => {
		expect(Folded.of('Straße').text).toBe('strasse');
		expect(Folded.of('Æon').text).toBe('aeon');
		expect(Folded.of('Łódź').text).toBe('lodz');
	});

	it('removes combining marks from decomposed text', () => {
		expect(Folded.of('élève').text).toBe('eleve');
	});

	it('keeps punctuation and digits', () => {
		expect(Folded.of('2026-01_a.b').text).toBe('2026-01_a.b');
	});
});

describe('Folded.original', () => {
	it('returns the same range for plain text', () => {
		expect(Folded.of('Ada Lovelace').original({ start: 4, end: 8 })).toEqual({ start: 4, end: 8 });
	});

	it('returns the same range when each letter keeps its length', () => {
		expect(Folded.of('Élève').original({ start: 1, end: 3 })).toEqual({ start: 1, end: 3 });
	});

	it('covers the whole letter when it expands', () => {
		expect(Folded.of('Straße').original({ start: 4, end: 5 })).toEqual({ start: 4, end: 5 });
		expect(Folded.of('Straße').original({ start: 3, end: 7 })).toEqual({ start: 3, end: 6 });
	});

	it('includes the combining mark of a decomposed letter', () => {
		expect(Folded.of('él').original({ start: 0, end: 1 })).toEqual({ start: 0, end: 2 });
		expect(Folded.of('él').original({ start: 1, end: 2 })).toEqual({ start: 2, end: 3 });
	});
});
