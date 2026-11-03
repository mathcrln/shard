import type { ModelChanges, ModelRule, NoteModel, RuleType } from '@/models/note-model';
import {
	cloneModel,
	isCreationDefaults,
	isModelRule,
	isRecord,
	isRuleType,
	keywordsProblem as checkKeywords,
	modelProblem,
	nameProblem as checkName,
	normalizeLabel,
} from '@/models/model-validation';
import { Str } from '@/utils/str';

type StoredModel = {
	raw: Record<string, unknown>;
	model: NoteModel;
	invalidRules: unknown[];
	schemaProblems: string[];
	creationProblem?: string;
	clearCreation?: boolean;
};

type StoredRecord = StoredModel | { raw: unknown; problem: string };

export class NoteModels {
	private constructor(
		private readonly records: StoredRecord[],
		private readonly save: () => Promise<void>
	) {}

	static from(raw: unknown, save: () => Promise<void>): NoteModels {
		if (!Array.isArray(raw)) {
			return new NoteModels(
				raw === undefined ? [] : [{ raw: structuredClone(raw), problem: 'The saved model collection is not a list.' }],
				save
			);
		}

		const migrated = raw.map(migrateRecord);
		const idCounts = new Map<string, number>();
		for (const item of migrated) {
			if (item.problem || !item.value) continue;
			const id = item.value.id as string;
			idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
		}

		const records = migrated.map((item, index): StoredRecord => {
			if (item.problem || !item.value) {
				return {
					raw: structuredClone(raw[index]),
					problem: describeProblem(raw[index], item.problem ?? 'The model could not be read.', index),
				};
			}

			const source = item.value;
			const id = source.id as string;
			if ((idCounts.get(id) ?? 0) > 1) {
				return {
					raw: structuredClone(raw[index]),
					problem: `Model "${recordName(source)}" uses duplicate ID "${id}" and is unavailable until the stored IDs are unique.`,
				};
			}

			const rawRules = source.rules as unknown[];
			const invalidRules = rawRules.filter((rule) => !isModelRule(rule)).map((value) => structuredClone(value));
			const validRules = rawRules.filter(isModelRule).map((rule) => ({ ...rule }));
			const schemaProblems: string[] = [];
			const hasCreation = Object.hasOwn(source, 'creation');
			const creationProblem =
				hasCreation && !isCreationDefaults(source.creation)
					? 'Creation defaults have invalid stored data; update or clear them.'
					: undefined;
			if (invalidRules.length) schemaProblems.push(`${invalidRules.length} membership rule(s) have invalid stored data.`);
			if (new Set(validRules.map((rule) => rule.id)).size !== validRules.length) {
				schemaProblems.push('Membership rule IDs must be unique.');
			}

			const model: NoteModel = {
				id,
				name: source.name as string,
				keywords: [...(source.keywords as string[])],
				match: source.match as NoteModel['match'],
				...(typeof source.icon === 'string' && source.icon ? { icon: source.icon } : {}),
				...(isCreationDefaults(source.creation)
					? { creation: { folder: source.creation.folder, template: source.creation.template } }
					: {}),
				rules: validRules,
			};

			return {
				raw: structuredClone(raw[index] as Record<string, unknown>),
				model,
				invalidRules,
				schemaProblems,
				creationProblem,
			};
		});

		return new NoteModels(records, save);
	}

	get all(): readonly NoteModel[] {
		return this.validRecords().map(({ model }) => cloneModel(model));
	}

	get loadProblems(): readonly string[] {
		return this.records.flatMap((record) => {
			if ('problem' in record) return [record.problem];
			return [...record.schemaProblems, ...(record.creationProblem ? [record.creationProblem] : [])].map(
				(problem) => `Model "${record.model.name}": ${problem}`
			);
		});
	}

	get(id: string): NoteModel | undefined {
		const model = this.validRecords().find((record) => record.model.id === id)?.model;
		return model ? cloneModel(model) : undefined;
	}

	issues(id: string): string[] {
		const stored = this.validRecords().find((record) => record.model.id === id);
		if (!stored) return ['This model could not be loaded.'];

		const { model } = stored;
		const issues = [checkName(model.name, this.all, model.id), this.keywordsProblem(model.keywords, model.id)].filter(
			(issue): issue is string => !!issue
		);

		if (!model.rules.length) issues.push('Add at least one membership rule.');
		if (stored.invalidRules.length) issues.push('Fix or remove membership rules with invalid stored data.');
		if (stored.schemaProblems.some((problem) => problem.includes('IDs must be unique'))) {
			issues.push('Membership rule IDs must be unique.');
		}

		for (const rule of model.rules) {
			if (rule.type === 'folder' && !rule.value.trim()) issues.push('A folder rule needs a folder path.');
			if (rule.type === 'tag' && !rule.value.trim().replace(/^#+/u, '').replace(/\/+$/u, '')) {
				issues.push('A tag rule needs a tag name.');
			}
			if (rule.type === 'link' && !hasLinkTarget(rule.value)) issues.push('A link rule needs a note link.');
			if (rule.type === 'property' && !rule.property.trim()) issues.push('A property rule needs a property name.');
			if (rule.type === 'property' && rule.operator !== 'exists' && !rule.value.trim()) {
				issues.push('A property value rule needs a value.');
			}
		}

		return [...new Set(issues)];
	}

	toJSON(): unknown[] {
		return this.records.map((record) => {
			if ('problem' in record) return structuredClone(record.raw);
			const raw = structuredClone(record.raw);
			delete raw.keyword;
			delete raw.aliases;
			const serialized: Record<string, unknown> = {
				...raw,
				...record.model,
				keywords: [...record.model.keywords],
				rules: [
					...record.model.rules.map((rule) => ({ ...rule })),
					...record.invalidRules.map((value) => structuredClone(value)),
				],
			};
			if (!record.model.icon) delete serialized.icon;
			if (record.model.creation) {
				const rawCreation = isRecord(raw.creation) ? structuredClone(raw.creation) : {};
				serialized.creation = { ...rawCreation, ...record.model.creation };
			} else if (record.creationProblem && !record.clearCreation) {
				serialized.creation = structuredClone(raw.creation);
			} else {
				delete serialized.creation;
			}
			return serialized;
		});
	}

	nameProblem(value: string, exceptId?: string): string | undefined {
		return checkName(value, this.all, exceptId);
	}

	keywordsProblem(values: string[], exceptId?: string): string | undefined {
		return checkKeywords(values, this.all, exceptId);
	}

	async add(input: { name: string; keywords?: string[] }): Promise<NoteModel> {
		const name = input.name.trim();
		const keywords = (input.keywords ?? []).map((keyword) => keyword.trim());
		this.assertIdentity(name, keywords);

		const id = crypto.randomUUID();
		if (this.records.some((record) => !('problem' in record) && record.model.id === id)) {
			throw new Error('Could not create a unique model ID.');
		}
		const model: NoteModel = { id, name, keywords, match: 'all', rules: [] };
		this.records.push({ raw: {}, model, invalidRules: [], schemaProblems: [] });
		await this.save();
		return cloneModel(model);
	}

	async update(id: string, changes: ModelChanges): Promise<void> {
		const stored = this.requireModel(id);
		const name = changes.name === undefined ? stored.model.name : changes.name.trim();
		const keywords =
			changes.keywords === undefined ? [...stored.model.keywords] : changes.keywords.map((word) => word.trim());
		if (changes.name !== undefined || changes.keywords !== undefined) this.assertIdentity(name, keywords, id);
		if (changes.match !== undefined && changes.match !== 'all' && changes.match !== 'any') {
			throw new Error('Rule matching must be set to all or any.');
		}
		const creationChanged = Object.hasOwn(changes, 'creation');
		if (creationChanged && changes.creation !== undefined && !isCreationDefaults(changes.creation)) {
			throw new Error('Creation defaults must include a folder and template path.');
		}

		stored.model = { ...stored.model, ...changes, name, keywords };
		if (!stored.model.icon?.trim()) delete stored.model.icon;
		if (creationChanged) {
			if (changes.creation) stored.model.creation = { ...changes.creation };
			else delete stored.model.creation;
			stored.creationProblem = undefined;
			stored.clearCreation = changes.creation === undefined;
		}
		await this.save();
	}

	async remove(id: string): Promise<void> {
		const index = this.records.findIndex((record) => !('problem' in record) && record.model.id === id);
		if (index < 0) throw new Error('This model is no longer available.');
		this.records.splice(index, 1);
		await this.save();
	}

	async addRule(modelId: string, type: RuleType = 'folder'): Promise<ModelRule> {
		const stored = this.requireModel(modelId);
		if (!isRuleType(type)) throw new Error('Choose a supported membership rule.');
		const rule = this.emptyRule(type);
		if (stored.model.rules.some((existing) => existing.id === rule.id)) throw new Error('Could not create a unique rule ID.');
		stored.model.rules.push(rule);
		await this.save();
		return { ...rule };
	}

	async updateRule(modelId: string, rule: ModelRule): Promise<void> {
		const stored = this.requireModel(modelId);
		if (!isModelRule(rule)) throw new Error('Membership rule has an invalid shape.');
		const index = stored.model.rules.findIndex((existing) => existing.id === rule.id);
		if (index < 0) throw new Error('This membership rule is no longer available.');
		stored.model.rules[index] = { ...rule };
		await this.save();
	}

	async removeRule(modelId: string, ruleId: string): Promise<void> {
		const stored = this.requireModel(modelId);
		const index = stored.model.rules.findIndex((rule) => rule.id === ruleId);
		if (index < 0) throw new Error('This membership rule is no longer available.');
		stored.model.rules.splice(index, 1);
		await this.save();
	}

	private validRecords(): StoredModel[] {
		return this.records.filter((record): record is StoredModel => !('problem' in record));
	}

	private requireModel(id: string): StoredModel {
		const model = this.validRecords().find((record) => record.model.id === id);
		if (!model) throw new Error('This model is no longer available.');
		return model;
	}

	private assertIdentity(name: string, keywords: string[], exceptId?: string): void {
		const others = this.all.filter((model) => model.id !== exceptId);
		const nameIssue = checkName(name, others);
		if (nameIssue) throw new Error(nameIssue);
		const keywordsIssue = checkKeywords(keywords, others);
		if (keywordsIssue) throw new Error(keywordsIssue);
		if (keywords.some((word) => Str.same(word, name))) {
			throw new Error('A keyword cannot repeat its model name.');
		}
	}

	private emptyRule(type: RuleType): ModelRule {
		const id = crypto.randomUUID();
		if (type === 'property') return { id, type, exclude: false, property: '', operator: 'contains', value: '' };
		if (type === 'link') return { id, type, exclude: false, value: '' };
		return { id, type, exclude: false, value: '', recursive: true };
	}
}

function migrateRecord(value: unknown): { value?: Record<string, unknown>; problem?: string } {
	if (!isRecord(value)) return { problem: 'The stored entry is not an object.' };
	const hasLegacyKeyword = Object.hasOwn(value, 'keyword');
	const hasLegacyAliases = Object.hasOwn(value, 'aliases');
	if (hasLegacyKeyword && typeof value.keyword !== 'string') return { problem: 'The legacy keyword is not text.' };
	if (hasLegacyAliases && (!Array.isArray(value.aliases) || !value.aliases.every((alias) => typeof alias === 'string'))) {
		return { problem: 'The legacy aliases are not a list of text.' };
	}
	if (
		Object.hasOwn(value, 'keywords') &&
		(!Array.isArray(value.keywords) || !value.keywords.every((word) => typeof word === 'string'))
	) {
		return { problem: 'The keywords are not a list of text.' };
	}

	let keywords = Array.isArray(value.keywords) ? [...(value.keywords as string[])] : [];
	if (typeof value.keyword === 'string' && value.keyword.trim()) keywords.push(value.keyword);
	if (Array.isArray(value.aliases)) keywords.push(...(value.aliases as string[]));
	if (hasLegacyKeyword || hasLegacyAliases) {
		const name = typeof value.name === 'string' ? normalizeLabel(value.name) : '';
		const seen = new Set<string>();
		keywords = keywords.flatMap((keyword) => {
			const trimmed = keyword.trim();
			const folded = normalizeLabel(trimmed);
			if (!trimmed || !folded || folded === name || seen.has(folded)) return [];
			seen.add(folded);
			return [trimmed];
		});
	}
	const migrated = { ...value, keywords };
	const problem = modelProblem(migrated);
	return problem ? { problem } : { value: migrated };
}

function describeProblem(value: unknown, problem: string, index: number): string {
	const name = isRecord(value) && typeof value.name === 'string' ? value.name.trim() : '';
	return name ? `Model "${name}": ${problem}` : `Stored model entry ${index + 1}: ${problem}`;
}

function recordName(value: Record<string, unknown>): string {
	return typeof value.name === 'string' && value.name.trim() ? value.name.trim() : 'Unnamed';
}

function hasLinkTarget(value: string): boolean {
	const trimmed = value.trim();
	const wikiLink = trimmed.match(/^!?\[\[([\s\S]*?)\]\]$/u);
	const target = (wikiLink?.[1] ?? trimmed).split('|', 1)[0]?.split('#', 1)[0]?.trim();
	return !!target;
}
