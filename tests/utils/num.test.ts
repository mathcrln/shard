import { describe, expect, it } from 'vitest';
import { Num } from '@/utils/num';

describe('Num', () => {
	describe('clamp', () => {
		it.each([
			[-1, 0],
			[0, 0],
			[2, 2],
			[3, 3],
			[4, 3],
		])('clamps %i into 0 to 3 as %i', (value, expected) => {
			expect(Num.clamp(value, 0, 3)).toBe(expected);
		});

		it('keeps the minimum when the range is empty', () => {
			expect(Num.clamp(1, 0, -1)).toBe(0);
		});
	});

	describe('between', () => {
		it.each([1, 5, 10])('includes %i in 1 to 10', (value) => {
			expect(Num.between(value, 1, 10)).toBe(true);
		});

		it.each([0, 11, Number.NaN])('excludes %d from 1 to 10', (value) => {
			expect(Num.between(value, 1, 10)).toBe(false);
		});
	});
});
