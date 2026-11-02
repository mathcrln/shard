import type { Target, Where, Workspace } from '@/platform/workspace';

export class FakeWorkspace implements Workspace {
	readonly opened: { target: Target; where: Where }[] = [];
	readonly copied: Target[] = [];

	open(target: Target, where: Where): void {
		this.opened.push({ target, where });
	}

	copyLink(target: Target): void {
		this.copied.push(target);
	}
}
