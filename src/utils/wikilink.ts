const WIKILINK = /^!?\[\[([\s\S]*?)\]\]$/u;

export const Wikilink = {
	linktext(value: string): string {
		const text = value.trim();
		const inner = WIKILINK.exec(text)?.[1];

		return inner === undefined ? text : (inner.split('|', 1)[0] ?? '').trim();
	},

	path(value: string): string {
		return (Wikilink.linktext(value).split('#', 1)[0] ?? '').trim();
	},

	contains(value: string): boolean {
		return /\[\[[^\]]+\]\]/u.test(value);
	},
};
