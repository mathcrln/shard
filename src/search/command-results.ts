import type { Commands } from '@/platform/commands';
import { compareRankedResults, type RankedResult } from '@/search/ranked-result';
import type { Result } from '@/search/result';
import { Matcher } from '@/text/matcher';

export function commandResults(commands: Commands, query: string, limit: number): Result[] {
	return rankedCommandResults(commands, query, limit).map(({ result }) => result);
}

export function rankedCommandResults(commands: Commands, query: string, limit: number): RankedResult[] {
	const matcher = Matcher.of(query);
	return commands
		.list()
		.flatMap((command) => {
			const match = matcher.match(command.name);
			if (!match) return [];
			const result: Result = {
				group: 'Commands',
				title: command.name,
				description: '',
				ranges: match.ranges,
				actions: [{ name: 'Run command', run: () => command.run() }],
			};
			return [
				{
					score: match.score,
					result,
				},
			];
		})
		.sort(compareRankedResults)
		.slice(0, limit);
}
