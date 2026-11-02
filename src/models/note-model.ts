import type { CreationDefaults } from '@/models/note-creation';

export type RuleType = 'folder' | 'tag' | 'property' | 'link';
export type PropertyOperator = 'exists' | 'equals' | 'contains';

type RuleBase = { id: string; exclude: boolean };

export type ModelRule = RuleBase &
	(
		| { type: 'folder'; value: string; recursive: boolean }
		| { type: 'tag'; value: string; recursive: boolean }
		| { type: 'property'; property: string; operator: PropertyOperator; value: string }
		| { type: 'link'; value: string }
	);

export interface NoteModel {
	id: string;
	name: string;
	keywords: string[];
	icon?: string;
	match: 'all' | 'any';
	creation?: CreationDefaults;
	rules: ModelRule[];
}

export type ModelChanges = Partial<Pick<NoteModel, 'name' | 'keywords' | 'match' | 'creation' | 'icon'>>;
