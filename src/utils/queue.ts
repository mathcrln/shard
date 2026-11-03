export class Queue {
	private tail: Promise<unknown> = Promise.resolve();

	add<T>(task: () => T | Promise<T>): Promise<T> {
		const result = this.tail.catch(() => undefined).then(task);
		this.tail = result;

		return result;
	}
}
