export interface PropertyDefinition {
	key: string;
	description: string;
	/** Id of the model whose notes this property links to. */
	relation?: string;
	/** Word that fills this property in a creation command, such as `by`. */
	keyword?: string;
}

export type PropertyChanges = Partial<Pick<PropertyDefinition, 'description' | 'relation' | 'keyword'>>;

export interface ObservedProperty {
	key: string;
	type: string;
}

/**
 * Shard's own index of vault properties. List position is the order notes are written in.
 * Properties Obsidian no longer reports stay in the index until removed by the user.
 */
export class PropertyDefinitions {
	private constructor(
		private readonly items: PropertyDefinition[],
		private readonly save: () => Promise<void>
	) {}

	static from(raw: unknown, save: () => Promise<void>): PropertyDefinitions {
		const items: PropertyDefinition[] = [];
		const seen = new Set<string>();
		for (const entry of Array.isArray(raw) ? raw : []) {
			if (typeof entry !== 'object' || entry === null) continue;
			const record = entry as Record<string, unknown>;
			const key = typeof record['key'] === 'string' ? record['key'].trim() : '';
			if (!key || seen.has(key.toLowerCase())) continue;
			seen.add(key.toLowerCase());
			items.push({
				key,
				description: typeof record['description'] === 'string' ? record['description'] : '',
				...(typeof record['relation'] === 'string' && record['relation'] ? { relation: record['relation'] } : {}),
				...(typeof record['keyword'] === 'string' && record['keyword'].trim()
					? { keyword: record['keyword'].trim() }
					: {}),
			});
		}
		return new PropertyDefinitions(items, save);
	}

	get all(): readonly PropertyDefinition[] {
		return this.items;
	}

	get(key: string): PropertyDefinition | undefined {
		return this.items.find((item) => item.key.toLowerCase() === key.toLowerCase());
	}

	/** Adds properties Obsidian reports that Shard does not know yet. Returns whether anything changed. */
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
				? this.items.find((other) => other !== item && other.keyword?.toLowerCase() === keyword.toLowerCase())
				: undefined;
			if (clash) throw new Error(`"${keyword}" is already the keyword of ${clash.key}.`);
			this.setOptional(item, 'keyword', keyword);
		}
		await this.save();
	}

	async move(key: string, toIndex: number): Promise<void> {
		const from = this.items.findIndex((item) => item.key.toLowerCase() === key.toLowerCase());
		if (from < 0) return;
		const target = Math.max(0, Math.min(this.items.length - 1, toIndex));
		if (target === from) return;
		const [item] = this.items.splice(from, 1);
		if (item) this.items.splice(target, 0, item);
		await this.save();
	}

	async remove(key: string): Promise<void> {
		const index = this.items.findIndex((item) => item.key.toLowerCase() === key.toLowerCase());
		if (index < 0) return;
		this.items.splice(index, 1);
		await this.save();
	}

	toJSON(): PropertyDefinition[] {
		return this.items.map((item) => ({ ...item }));
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
