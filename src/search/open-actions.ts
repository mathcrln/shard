import type { Target, Workspace } from '@/platform/workspace';
import type { Action } from '@/search/action';

export function openActions(workspace: Workspace, target: Target): Action[] {
	return [
		{ name: 'Open', run: () => workspace.open(target, 'current') },
		{ name: 'Open in new tab', shortcut: 'Mod+Enter', run: () => workspace.open(target, 'tab') },
		{ name: 'Open to the side', shortcut: 'Mod+Alt+Enter', run: () => workspace.open(target, 'side') },
		{ name: 'Copy link', run: () => workspace.copyLink(target) },
	];
}
