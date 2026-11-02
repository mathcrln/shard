import type { Range } from '@/text/range';

export type Segment = { text: string; matched: boolean };

export function segmentsOf(text: string, ranges: readonly Range[]): Segment[] {
	const segments: Segment[] = [];
	let cursor = 0;

	for (const range of ranges) {
		if (range.start > cursor) segments.push({ text: text.slice(cursor, range.start), matched: false });
		segments.push({ text: text.slice(range.start, range.end), matched: true });
		cursor = range.end;
	}

	if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false });

	return segments;
}
