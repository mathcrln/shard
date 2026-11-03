import { describe, expect, it } from 'vitest';
import { Path } from '@/utils/path';

describe('Path', () => {
	describe('isSafe', () => {
		it.each(['a.png', 'Attachments/2026/a b.png', 'notes/.hidden/a.png', '50%.png'])('accepts %j', (path) => {
			expect(Path.isSafe(path)).toBe(true);
		});

		it.each(['', '/a.png', 'a/', 'a//b', './a', 'a/../b', '..', 'a\\b', 'a:b', 'a?b', 'a*b', 'a|b', 'a"b', 'a<b', 'a\nb'])(
			'rejects %j',
			(path) => {
				expect(Path.isSafe(path)).toBe(false);
			}
		);
	});

	describe('isWithin', () => {
		it('accepts the folder itself and paths below it', () => {
			expect(Path.isWithin('.obsidian', '.obsidian')).toBe(true);
			expect(Path.isWithin('.obsidian/plugins', '.obsidian')).toBe(true);
		});

		it('rejects siblings that share a prefix', () => {
			expect(Path.isWithin('.obsidian-backup/a', '.obsidian')).toBe(false);
		});
	});

	describe('ancestors', () => {
		it('lists every parent folder from the top', () => {
			expect(Path.ancestors('a/b/c.png')).toEqual(['a', 'a/b']);
		});

		it('lists nothing for a top-level file', () => {
			expect(Path.ancestors('c.png')).toEqual([]);
		});
	});

	describe('relative', () => {
		it.each([
			['notes/a.md', 'Attachments/b.png', '../Attachments/b.png'],
			['notes/a.md', 'notes/img/b.png', 'img/b.png'],
			['a.md', 'Attachments/b.png', 'Attachments/b.png'],
			['notes/deep/a.md', 'notes/b.png', '../b.png'],
		])('links from %j to %j as %j', (from, to, expected) => {
			expect(Path.relative(from, to)).toBe(expected);
		});
	});
});
