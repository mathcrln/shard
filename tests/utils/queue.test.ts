import { describe, expect, it } from 'vitest';
import { Queue } from '@/utils/queue';

describe('Queue', () => {
	it('runs tasks one after another in the order they were added', async () => {
		const queue = new Queue();
		const events: string[] = [];

		const first = queue.add(async () => {
			events.push('first started');
			await Promise.resolve();
			events.push('first finished');
		});
		const second = queue.add(() => {
			events.push('second started');
		});
		await Promise.all([first, second]);

		expect(events).toEqual(['first started', 'first finished', 'second started']);
	});

	it('resolves with the task result', async () => {
		const queue = new Queue();

		await expect(queue.add(() => 'saved')).resolves.toBe('saved');
	});

	it('rejects with the failure of its own task', async () => {
		const queue = new Queue();

		await expect(queue.add(() => Promise.reject(new Error('Disk full.')))).rejects.toThrow('Disk full.');
	});

	it('keeps running tasks after an earlier task fails', async () => {
		const queue = new Queue();
		void queue.add(() => Promise.reject(new Error('Disk full.'))).catch(() => undefined);

		await expect(queue.add(() => 'saved')).resolves.toBe('saved');
	});
});
