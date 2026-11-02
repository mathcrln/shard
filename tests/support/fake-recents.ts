import type { Recents } from '@/platform/recents';

export class FakeRecents implements Recents {
	constructor(private readonly all: readonly string[] = []) {}

	paths(): readonly string[] {
		return this.all;
	}
}
