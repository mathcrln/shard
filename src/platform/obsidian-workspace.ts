import type { App, PaneType } from 'obsidian';
import type { Target, Where, Workspace } from '@/platform/workspace';

const PANES: Record<Where, PaneType | false> = { current: false, tab: 'tab', side: 'split' };

export class ObsidianWorkspace implements Workspace {
	constructor(private readonly app: App) {}

	open(target: Target, where: Where): void {
		void this.app.workspace.openLinkText(linkTextOf(target), '', PANES[where]);
	}

	copyLink(target: Target): void {
		const file = this.app.vault.getFileByPath(target.path);
		if (!file) return;

		const sourcePath = this.app.workspace.getActiveFile()?.path ?? '';
		const subpath = target.heading ? `#${target.heading}` : undefined;

		void navigator.clipboard.writeText(this.app.fileManager.generateMarkdownLink(file, sourcePath, subpath));
	}
}

function linkTextOf(target: Target): string {
	return target.heading ? `${target.path}#${target.heading}` : target.path;
}
