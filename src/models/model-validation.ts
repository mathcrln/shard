import type { ModelRule, NoteModel, PropertyOperator, RuleType } from '@/models/note-model';
import type { CreationDefaults } from '@/models/note-creation';
import { Folded } from '@/text/fold';

const RESERVED_PREFIXES = ['>', '#', '@', '['];
const PROPERTY_OPERATORS: readonly PropertyOperator[] = ['exists', 'equals', 'contains'];

export function nameProblem(value: string, models: readonly NoteModel[], exceptId?: string): string | undefined {
	const name = value.trim();
	if (!name) return 'Enter a model name.';
	const key = normalizeLabel(name);
	const own = models.find((model) => model.id === exceptId);
	if (own?.keywords.some((keyword) => normalizeLabel(keyword.trim()) === key)) {
		return 'A model name cannot repeat one of its keywords.';
	}
	if (
		models.some((model) => model.id !== exceptId && modelLabels(model).some((label) => normalizeLabel(label.trim()) === key))
	) {
		return 'This name is already used by another model or keyword.';
	}
	return undefined;
}

export function keywordsProblem(values: readonly string[], models: readonly NoteModel[], exceptId?: string): string | undefined {
	const own = models.find((model) => model.id === exceptId);
	const ownName = own ? normalizeLabel(own.name.trim()) : undefined;
	const local = new Set<string>();

	for (const value of values) {
		const keyword = value.trim();
		if (!keyword) return 'Remove blank keywords or enter a keyword.';
		if (RESERVED_PREFIXES.some((prefix) => keyword.startsWith(prefix))) {
			return 'Keywords cannot begin with a reserved scope prefix.';
		}

		const folded = normalizeLabel(keyword);
		if (local.has(folded)) return 'A keyword cannot be repeated within a model.';
		local.add(folded);

		if (ownName === folded) return 'A keyword cannot repeat its model name.';
		if (
			models.some(
				(model) => model.id !== exceptId && modelLabels(model).some((label) => normalizeLabel(label.trim()) === folded)
			)
		) {
			return 'This keyword is already used by another model or name.';
		}
	}
	return undefined;
}

export function isRuleType(value: unknown): value is RuleType {
	return value === 'folder' || value === 'tag' || value === 'property' || value === 'link';
}

export function isModelRule(value: unknown): value is ModelRule {
	if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim() || typeof value.exclude !== 'boolean') return false;
	if (value.type === 'folder' || value.type === 'tag') {
		return typeof value.value === 'string' && typeof value.recursive === 'boolean';
	}
	if (value.type === 'link') return typeof value.value === 'string';
	return (
		value.type === 'property' &&
		typeof value.property === 'string' &&
		PROPERTY_OPERATORS.includes(value.operator as PropertyOperator) &&
		typeof value.value === 'string'
	);
}

export function modelProblem(value: unknown): string | undefined {
	if (!isRecord(value)) return 'The stored entry is not an object.';
	if (typeof value.id !== 'string' || !value.id.trim()) return 'The model is missing a valid ID.';
	if (typeof value.name !== 'string' || !value.name.trim()) return 'The model is missing a valid name.';
	if (!Array.isArray(value.keywords) || !value.keywords.every((keyword) => typeof keyword === 'string')) {
		return 'The model keywords must be a list of text.';
	}
	if (value.match !== 'all' && value.match !== 'any') return 'The model must use all or any rule matching.';
	if (!Array.isArray(value.rules)) return 'The model rules must be a list.';
	return undefined;
}

export function isCreationDefaults(value: unknown): value is CreationDefaults {
	return isRecord(value) && typeof value.folder === 'string' && typeof value.template === 'string';
}

export function normalizeLabel(value: string): string {
	return Folded.of(value.trim().replace(/\s+/gu, ' ')).text;
}

export function cloneModel(model: NoteModel): NoteModel {
	return {
		...model,
		keywords: [...model.keywords],
		...(model.icon ? { icon: model.icon } : {}),
		...(model.creation ? { creation: { ...model.creation } } : {}),
		rules: model.rules.map((rule) => ({ ...rule })),
	};
}

function modelLabels(model: NoteModel): string[] {
	return [model.name, ...model.keywords];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
