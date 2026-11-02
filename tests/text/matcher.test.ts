import { describe, expect, it } from 'vitest';
import { Matcher } from '@/text/matcher';

describe('Matcher.match', () => {
	it('matches regardless of case', () => {
		expect(Matcher.of('ADA').match('ada lovelace')).not.toBeNull();
	});

	it('matches regardless of diacritics, in both directions', () => {
		expect(Matcher.of('eleve').match('Élève')).not.toBeNull();
		expect(Matcher.of('élève').match('Eleve')).not.toBeNull();
	});

	it('matches words in any order', () => {
		expect(Matcher.of('lovelace ada').match('Ada Lovelace')).not.toBeNull();
	});

	it('rejects text missing one of the words', () => {
		expect(Matcher.of('ada turing').match('Ada Lovelace')).toBeNull();
	});

	it('matches letters that are apart, in order', () => {
		expect(Matcher.of('alv').match('Ada Lovelace')).not.toBeNull();
		expect(Matcher.of('cav').match('Ada Lovelace')).toBeNull();
	});

	it('matches everything, with nothing highlighted, when the query is empty', () => {
		expect(Matcher.of('  ').match('Ada Lovelace')).toEqual({ score: 0, ranges: [] });
	});

	it('is empty only when the query has no words', () => {
		expect(Matcher.of(' ').isEmpty).toBe(true);
		expect(Matcher.of('a').isEmpty).toBe(false);
	});

	describe('ranges', () => {
		it('highlights the matched text', () => {
			expect(Matcher.of('love').match('Ada Lovelace')?.ranges).toEqual([{ start: 4, end: 8 }]);
		});

		it('highlights each matched letter when the letters are apart', () => {
			expect(Matcher.of('alv').match('Ada Lovelace')?.ranges).toEqual([
				{ start: 0, end: 1 },
				{ start: 4, end: 5 },
				{ start: 6, end: 7 },
			]);
		});

		it('highlights an accented word in full', () => {
			expect(Matcher.of('eleve').match('Élève')?.ranges).toEqual([{ start: 0, end: 5 }]);
		});

		it('highlights the letter an expansion came from', () => {
			expect(Matcher.of('sse').match('Straße')?.ranges).toEqual([{ start: 4, end: 6 }]);
		});

		it('joins the highlights of words that touch', () => {
			expect(Matcher.of('ad da').match('Ada')?.ranges).toEqual([{ start: 0, end: 3 }]);
		});
	});

	describe('score', () => {
		it('ranks a match at the start above a match at a word start', () => {
			expect(scoreOf('ada', 'Ada Lovelace')).toBeGreaterThan(scoreOf('ada', 'Lady Ada'));
		});

		it('ranks a match at a word start above a match inside a word', () => {
			expect(scoreOf('ada', 'Lady Ada')).toBeGreaterThan(scoreOf('ada', 'Canada'));
		});

		it('ranks a match inside a word above letters that are apart', () => {
			expect(scoreOf('ada', 'Canada')).toBeGreaterThan(scoreOf('ada', 'A day at the dam'));
		});

		it('ranks a shorter text above a longer one for the same match', () => {
			expect(scoreOf('ada', 'Ada')).toBeGreaterThan(scoreOf('ada', 'Ada Lovelace'));
		});

		it('ranks tighter letters above looser ones', () => {
			expect(scoreOf('alv', 'Alva')).toBeGreaterThan(scoreOf('alv', 'A long vowel'));
		});
	});
});

function scoreOf(query: string, text: string): number {
	return Matcher.of(query).match(text)?.score ?? Number.NEGATIVE_INFINITY;
}
