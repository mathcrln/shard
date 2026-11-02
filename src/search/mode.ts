export type SearchMode = 'files' | 'commands' | 'unified';

export function searchModeFor(query: string, mode: SearchMode): SearchMode {
	return query.trimStart().startsWith('>') ? 'commands' : mode;
}
