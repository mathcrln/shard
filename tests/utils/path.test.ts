import { describe, expect, it } from 'vitest';
import { Path } from '@/utils/path';

describe('Path', () => {
	describe('normalize', () => {
		it.each([
			['Books', 'Books'],
			['/Books//2024/', 'Books/2024'],
			['Books\\2024', 'Books/2024'],
			['  Books / 2024  ', 'Books/2024'],
			['/', ''],
			['', ''],
		])('normalizes %j to %j', (path, expected) => {
			expect(Path.normalize(path)).toBe(expected);
		});
	});

	describe('isPortable', () => {
		it.each(['Ada Lovelace', 'Books/2024', 'Notes/.hidden', '50% done', 'Élève'])('accepts %j', (path) => {
			expect(Path.isPortable(path)).toBe(true);
		});

		it.each([
			'',
			'.',
			'..',
			'Books/../Secrets',
			'Books//2024',
			'Ends with dot.',
			'Ends with space ',
			'CON',
			'Books/lpt1.txt',
			'a:b',
			'a?b',
			'a*b',
			'a|b',
			'a"b',
			'a<b',
			'a\\b',
			'a\nb',
		])('rejects %j', (path) => {
			expect(Path.isPortable(path)).toBe(false);
		});
	});

	describe('join', () => {
		it('joins segments with slashes', () => {
			expect(Path.join('Books', '2024', 'Dune.md')).toBe('Books/2024/Dune.md');
		});

		it('skips empty segments, such as the vault root', () => {
			expect(Path.join('', 'Dune.md')).toBe('Dune.md');
		});
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
});
