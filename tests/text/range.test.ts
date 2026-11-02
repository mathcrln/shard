import { describe, expect, it } from 'vitest';
import { mergeRanges } from '@/text/range';

describe('mergeRanges', () => {
	it('keeps separate ranges apart', () => {
		expect(
			mergeRanges([
				{ start: 0, end: 2 },
				{ start: 4, end: 6 },
			])
		).toEqual([
			{ start: 0, end: 2 },
			{ start: 4, end: 6 },
		]);
	});

	it('joins ranges that touch', () => {
		expect(
			mergeRanges([
				{ start: 0, end: 2 },
				{ start: 2, end: 4 },
			])
		).toEqual([{ start: 0, end: 4 }]);
	});

	it('joins ranges that overlap', () => {
		expect(
			mergeRanges([
				{ start: 0, end: 3 },
				{ start: 1, end: 5 },
			])
		).toEqual([{ start: 0, end: 5 }]);
	});

	it('sorts ranges given out of order', () => {
		expect(
			mergeRanges([
				{ start: 4, end: 6 },
				{ start: 0, end: 1 },
			])
		).toEqual([
			{ start: 0, end: 1 },
			{ start: 4, end: 6 },
		]);
	});

	it('returns nothing for no ranges', () => {
		expect(mergeRanges([])).toEqual([]);
	});
});
