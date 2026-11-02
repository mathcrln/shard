export interface Note {
	path: string;
	name: string;
	folder: string;
	aliases: readonly string[];
	headings: readonly string[];
	tags?: readonly string[];
	properties?: Readonly<Record<string, unknown>>;
	links?: readonly string[];
}
