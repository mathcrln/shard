export type Range = { start: number; end: number };

export function mergeRanges(ranges: readonly Range[]): Range[] {
	const merged: Range[] = [];

	for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
		const last = merged[merged.length - 1];

		if (last && range.start <= last.end) {
			last.end = Math.max(last.end, range.end);
		} else {
			merged.push({ ...range });
		}
	}

	return merged;
}
