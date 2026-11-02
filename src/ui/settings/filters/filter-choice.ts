export type FilterChoice = {
	value: string;
	label: string;
	icon?: string;
	detail?: string;
	kind?: 'file' | 'text' | 'number' | 'checkbox' | 'list' | 'date';
};

export interface FilterCatalog {
	targets(query: string): readonly FilterChoice[];
	properties(query: string): readonly FilterChoice[];
	folders(query: string): readonly FilterChoice[];
	icons(query: string): readonly FilterChoice[];
	templates(query: string): readonly FilterChoice[];
	tags(query: string): readonly FilterChoice[];
	notes(query: string): readonly FilterChoice[];
	values(property: string, query: string): readonly FilterChoice[];
	invalidate(): void;
}
