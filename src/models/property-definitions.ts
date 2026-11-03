import { Num } from '@/utils/num';
import { Str } from '@/utils/str';

export interface PropertyDefinition {
	key: string;
	description: string;
	relation?: string;
	keyword?: string;
}

export type PropertyChanges = Partial<Pick<PropertyDefinition, 'description' | 'relation' | 'keyword'>>;

export interface ObservedProperty {
	key: string;
	type: string;
}

export class PropertyDefinitions {
	private constructor(
		private readonly items: PropertyDefinition[],
		private readonly save: () => Promise<void>
	) {}

	static from(raw: unknown, save: () => Promise<void>): PropertyDefinitions {
		const items: PropertyDefinition[] = [];
		for (const entry of Array.isArray(raw) ? raw : []) {
			if (typeof entry !== 'object' || entry === null) continue;
			const { key, description, relation, keyword } = entry as Partial<Record<keyof PropertyDefinition, unknown>>;
			if (typeof key !== 'string' || !key.trim() || items.some((item) => Str.same(item.key, key))) continue;
			items.push({
				key: key.trim(),
				description: typeof description === 'string' ? description : '',
				...(typeof relation === 'string' && relation ? { relation } : {}),
				...(typeof keyword === 'string' && keyword.trim() ? { keyword: keyword.trim() } : {}),
			});
		}
		return new PropertyDefinitions(items, save);
	}

	get all(): readonly PropertyDefinition[] {
		return this.items;
	}

	get(key: string): PropertyDefinition | undefined {
		return this.items.find((item) => Str.same(item.key, key));
	}

	async sync(observed: readonly ObservedProperty[]): Promise<boolean> {
		const added = observed
			.filter((property) => !this.get(property.key))
			.map((property) => property.key)
			.sort((left, right) => left.localeCompare(right));
		for (const key of added) this.items.push({ key, description: '' });
		if (added.length > 0) await this.save();
		return added.length > 0;
	}

	async update(key: string, changes: PropertyChanges): Promise<void> {
		const item = this.require(key);
		if (changes.description !== undefined) item.description = changes.description;
		if ('relation' in changes) this.setOptional(item, 'relation', changes.relation);
		if ('keyword' in changes) {
			const keyword = changes.keyword?.trim();
			const clash = keyword
				? this.items.find((other) => other !== item && other.keyword !== undefined && Str.same(other.keyword, keyword))
				: undefined;
			if (clash) throw new Error(`"${keyword}" is already the keyword of ${clash.key}.`);
			this.setOptional(item, 'keyword', keyword);
		}
		await this.save();
	}

	async move(key: string, toIndex: number): Promise<void> {
		const from = this.indexOf(key);
		if (from < 0) return;
		const target = Num.clamp(toIndex, 0, this.items.length - 1);
		if (target === from) return;
		const [item] = this.items.splice(from, 1);
		if (item) this.items.splice(target, 0, item);
		await this.save();
	}

	async remove(key: string): Promise<void> {
		const index = this.indexOf(key);
		if (index < 0) return;
		this.items.splice(index, 1);
		await this.save();
	}

	toJSON(): PropertyDefinition[] {
		return this.items.map((item) => ({ ...item }));
	}

	private indexOf(key: string): number {
		return this.items.findIndex((item) => Str.same(item.key, key));
	}

	private require(key: string): PropertyDefinition {
		const item = this.get(key);
		if (!item) throw new Error(`The property "${key}" is no longer in the index.`);
		return item;
	}

	private setOptional(item: PropertyDefinition, field: 'relation' | 'keyword', value: string | undefined): void {
		if (value) item[field] = value;
		else delete item[field];
	}
}
