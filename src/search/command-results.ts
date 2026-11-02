import type { Commands } from '@/platform/commands';
import type { Result } from '@/search/result';
import { Matcher } from '@/text/matcher';

export function commandResults(commands: Commands, query: string, limit: number): Result[] {
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
			return [{ score: match.score, result }];
		})
		.sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
		.slice(0, limit)
		.map(({ result }) => result);
}
