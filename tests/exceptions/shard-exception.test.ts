import { describe, expect, it } from 'vitest';
import { NoteAlreadyExists } from '@/exceptions/note-already-exists';
import { ShardException } from '@/exceptions/shard-exception';
import { notices } from '../support/obsidian';

describe('ShardException', () => {
	it('renders its own message as a notice', () => {
		new NoteAlreadyExists('Books/Dune.md').render();

		expect(notices).toEqual(['A note already exists at "Books/Dune.md". Choose another title.']);
	});

	describe('from', () => {
		it('keeps a Shard exception as it is', () => {
			const exception = new NoteAlreadyExists('Dune.md');

			expect(ShardException.from(exception)).toBe(exception);
		});

		it("keeps another error's message", () => {
			expect(ShardException.from(new Error('Disk full')).message).toBe('Disk full');
		});

		it('falls back to a generic message when the thrown value is not an error', () => {
			expect(ShardException.from('nope').message).toBe('Something went wrong.');
		});
	});

	it('renders whatever a promise rejects with', async () => {
		await Promise.reject(new NoteAlreadyExists('Dune.md')).catch(ShardException.render);
		await Promise.reject(new Error('Disk full')).catch(ShardException.render);
		await Promise.reject(undefined).catch(ShardException.render);

		expect(notices).toEqual([
			'A note already exists at "Dune.md". Choose another title.',
			'Disk full',
			'Something went wrong.',
		]);
	});
});
