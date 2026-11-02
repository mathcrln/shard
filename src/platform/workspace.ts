export type Target = { path: string; heading?: string };

export type Where = 'current' | 'tab' | 'side';

export interface Workspace {
	open(target: Target, where: Where): void;
	copyLink(target: Target): void;
}
