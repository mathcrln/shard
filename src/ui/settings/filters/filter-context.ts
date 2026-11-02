import { createContext, useContext } from 'react';
import type { App } from 'obsidian';
import type { FilterCatalog } from '@/ui/settings/filters/filter-choice';

export type FilterContextValue = { app: App; catalog: FilterCatalog };

export const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilters(): FilterContextValue {
	const context = useContext(FilterContext);
	if (!context) throw new Error('Filter controls must be used inside FilterContext.Provider.');
	return context;
}
