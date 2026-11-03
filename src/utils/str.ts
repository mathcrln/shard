import { Folded } from '@/text/fold';

export interface SlugOptions {
	lowercase?: boolean;
}

export interface PluralOptions {
	locale?: string;
	plural?: string;
}

export const Str = {
	slug(value: string, { lowercase = true }: SlugOptions = {}): string {
		const slug = value.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

		return lowercase ? slug.toLowerCase() : slug;
	},

	escapeRegExp(value: string): string {
		return value.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
	},

	words(value: string): string[] {
		return value.split(/\s+/).filter(Boolean);
	},

	compare(this: void, a: string, b: string): number {
		return a < b ? -1 : a > b ? 1 : 0;
	},

	plural(noun: string, count: number, { locale = 'en', plural = noun + 's' }: PluralOptions = {}): string {
		return new Intl.PluralRules(locale).select(count) === 'one' ? noun : plural;
	},

	quantity(count: number, noun: string, options: PluralOptions = {}): string {
		return count + ' ' + Str.plural(noun, count, options);
	},

	fold(value: string): string {
		return Folded.of(value).text;
	},

	squish(value: string): string {
		return value.trim().replace(/\s+/gu, ' ');
	},

	same(a: string, b: string): boolean {
		return Str.fold(Str.squish(a)) === Str.fold(Str.squish(b));
	},

	filename(value: string): string {
		const name = value
			.replace(/\.md$/iu, '')
			.replace(/\s*[:/\\|]\s*/gu, ' - ')
			.replace(/[<>"?*#^[\]\p{Cc}]/gu, '');

		return Str.squish(name).replace(/^[\s-]+|[\s.-]+$/gu, '');
	},
};
