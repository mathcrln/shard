import type { Action } from '@/search/action';
import type { Range } from '@/text/range';

export type Group = 'Recent' | 'Notes' | 'Headings' | 'Commands' | 'Models';

export type Result = {
	group: Group;
	title: string;
	description: string;
	ranges: readonly Range[];
	actions: readonly Action[];
};
