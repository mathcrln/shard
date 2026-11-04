import { describe, expect, it } from 'vitest';
import { Wikilink } from '@/utils/wikilink';

describe('Wikilink', () => {
	describe('linktext', () => {
		it.each([
			['[[Books/Dune]]', 'Books/Dune'],
			['[[Books/Dune#Plot|Dune]]', 'Books/Dune#Plot'],
			['![[Cover.png]]', 'Cover.png'],
			['  [[ Dune ]]  ', 'Dune'],
			['Books/Dune', 'Books/Dune'],
			['', ''],
		])('reads %j as %j', (value, expected) => {
			expect(Wikilink.linktext(value)).toBe(expected);
		});
	});

	describe('path', () => {
		it.each([
			['[[Books/Dune#Plot|Dune]]', 'Books/Dune'],
			['[[Dune#^block]]', 'Dune'],
			['Books/Dune', 'Books/Dune'],
			['[[#Plot]]', ''],
		])('reads the path of %j as %j', (value, expected) => {
			expect(Wikilink.path(value)).toBe(expected);
		});
	});

	describe('contains', () => {
		it.each(['[[Dune]]', 'See [[Dune|the book]] first'])('finds a link in %j', (value) => {
			expect(Wikilink.contains(value)).toBe(true);
		});

		it.each(['Dune', '[[]]', '[Dune]'])('finds no link in %j', (value) => {
			expect(Wikilink.contains(value)).toBe(false);
		});
	});
});
