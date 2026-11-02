export interface Note {
	path: string;
	name: string;
	folder: string;
	aliases: readonly string[];
	headings: readonly string[];
}
