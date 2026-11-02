import type { Result } from '@/search/result';

export type RankedResult = { score: number; result: Result };

export function compareRankedResults(left: RankedResult, right: RankedResult): number {
	return (
		right.score - left.score ||
		left.result.title.localeCompare(right.result.title) ||
		left.result.group.localeCompare(right.result.group) ||
		left.result.description.localeCompare(right.result.description)
	);
}
