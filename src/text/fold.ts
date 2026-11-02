import type { Range } from '@/text/range';

const EXPANSIONS: Record<string, string> = {
	ß: 'ss',
	æ: 'ae',
	œ: 'oe',
	ø: 'o',
	ł: 'l',
	đ: 'd',
	ð: 'd',
	þ: 'th',
	ı: 'i',
};

const ASCII = /^\p{ASCII}*$/u;
const MARKS = /\p{M}/gu;

export class Folded {
	private constructor(
		readonly text: string,
		private readonly starts: readonly number[] | null,
		private readonly ends: readonly number[] | null
	) {}

	static of(source: string): Folded {
		if (ASCII.test(source)) return new Folded(source.toLowerCase(), null, null);

		const starts: number[] = [];
		const ends: number[] = [];
		let text = '';
		let offset = 0;

		for (const character of source) {
			const end = offset + character.length;
			const folded = foldCharacter(character);

			if (folded === '' && ends.length > 0) {
				ends[ends.length - 1] = end;
			}

			for (let position = 0; position < folded.length; position++) {
				starts.push(offset);
				ends.push(end);
			}

			text += folded;
			offset = end;
		}

		return new Folded(text, starts, ends);
	}

	original(range: Range): Range {
		if (!this.starts || !this.ends) return range;

		return {
			start: this.starts[range.start] ?? range.start,
			end: this.ends[range.end - 1] ?? range.end,
		};
	}
}

function foldCharacter(character: string): string {
	const lower = character.toLowerCase();

	return EXPANSIONS[lower] ?? lower.normalize('NFD').replace(MARKS, '');
}
