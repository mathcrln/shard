import { getAllTags, getIconIds, TFile, type App } from 'obsidian';
import type { FilterCatalog, FilterChoice } from '@/ui/settings/filters/filter-choice';
import { Matcher } from '@/text/matcher';
import { Folded } from '@/text/fold';

type PropertyEntry = { value: unknown; kind: NonNullable<FilterChoice['kind']> };
type NoteEntry = { file: TFile; properties: Record<string, unknown>; tags: string[] };
type PropertyValueSet = { values: PropertyEntry[]; seen: Set<string> };
type Snapshot = {
	properties: FilterChoice[];
	folders: FilterChoice[];
	tags: FilterChoice[];
	noteFiles: TFile[];
	notes?: FilterChoice[];
	propertyValues: Map<string, PropertyValueSet>;
};

const CHOICE_LIMIT = 50;

export class ObsidianFilterCatalog implements FilterCatalog {
	private cached: Snapshot | undefined;
	private iconChoices: FilterChoice[] | undefined;

	constructor(private readonly app: App) {}

	targets(query: string): readonly FilterChoice[] {
		const snapshot = this.snapshot();
		const fileTarget: FilterChoice = { value: 'file', label: 'file', icon: 'file-text', kind: 'file' };
		const choices = [
			fileTarget,
			...snapshot.properties.map((property) => ({ ...property, value: `note:${property.value}` })),
		];
		const matching = filterChoices(choices, query);
		if (matching.some((choice) => choice.value === 'file')) return matching;
		return Matcher.of(query).match(fileTarget.label) ? [fileTarget, ...matching.slice(0, CHOICE_LIMIT - 1)] : matching;
	}

	properties(query: string): readonly FilterChoice[] {
		return filterChoices(this.snapshot().properties, query);
	}

	folders(query: string): readonly FilterChoice[] {
		return filterChoices(this.snapshot().folders, query);
	}

	icons(query: string): readonly FilterChoice[] {
		this.iconChoices ??= getIconIds()
			.filter((id) => id.startsWith('lucide-'))
			.map((id) => id.slice('lucide-'.length))
			.map((name) => ({ value: name, label: name, icon: name }));
		return filterChoices(this.iconChoices, query);
	}

	templates(query: string): readonly FilterChoice[] {
		const folder = this.templateFolder();
		const files = this.snapshot().noteFiles;
		const inFolder = folder ? files.filter((file) => file.path.startsWith(`${folder}/`)) : [];
		const choices = (inFolder.length > 0 ? inFolder : files).map((file) => ({
			value: file.path,
			label: file.path,
			icon: 'file-text',
			kind: 'file' as const,
		}));
		return filterChoices(choices, query);
	}

	tags(query: string): readonly FilterChoice[] {
		return filterChoices(this.snapshot().tags, query);
	}

	notes(query: string): readonly FilterChoice[] {
		const snapshot = this.snapshot();
		snapshot.notes ??= snapshot.noteFiles.map((file) => ({
			value: `[[${this.app.metadataCache.fileToLinktext(file, '', true)}]]`,
			label: file.basename,
			icon: 'file-text',
			detail: file.parent?.isRoot() ? '' : (file.parent?.path ?? ''),
			kind: 'file' as const,
		}));
		return filterChoices(snapshot.notes, query, queryForLinks(query));
	}

	values(property: string, query: string): readonly FilterChoice[] {
		const snapshot = this.snapshot();
		const values = propertyValues(snapshot, property);
		const choices = values.map((entry) => choiceForValue(String(entry.value), entry.kind));
		const hasLinks = values.some((entry) => containsWikiLink(entry.value));
		const startsWithLink = /^\s*\[\[/u.test(query);
		if (hasLinks || startsWithLink) choices.push(...this.notes(queryForLinks(query)));

		return filterChoices(uniqueChoices(choices), query, queryForLinks(query));
	}

	private templateFolder(): string {
		const internal = (this.app as unknown as { internalPlugins?: { getPluginById?: (id: string) => unknown } })
			.internalPlugins;
		const plugin = internal?.getPluginById?.('templates') as { instance?: { options?: { folder?: string } } } | undefined;
		return (plugin?.instance?.options?.folder ?? '').replace(/^\/+|\/+$/gu, '');
	}

	invalidate(): void {
		this.cached = undefined;
	}

	private snapshot(): Snapshot {
		if (this.cached) return this.cached;

		const noteEntries: NoteEntry[] = this.app.vault.getMarkdownFiles().map((file) => {
			const cache = this.app.metadataCache.getFileCache(file);
			return { file, properties: cache?.frontmatter ?? {}, tags: cache ? (getAllTags(cache) ?? []) : [] };
		});
		const propertyKinds = new Map<string, NonNullable<FilterChoice['kind']>>();
		const propertyValues = new Map<string, PropertyValueSet>();
		const tags = new Map<string, FilterChoice>();

		for (const entry of noteEntries) {
			for (const [property, raw] of Object.entries(entry.properties)) {
				const samples = flatten(raw);
				const kind = inferKind(raw);
				if (!propertyKinds.has(property)) propertyKinds.set(property, kind);
				const values = propertyValues.get(property) ?? { values: [], seen: new Set<string>() };
				for (const value of samples) {
					const key = `${typeof value}:${String(value)}`;
					if (values.seen.has(key)) continue;
					values.seen.add(key);
					values.values.push({ value, kind });
				}
				propertyValues.set(property, values);
			}
			for (const tag of entry.tags) {
				const key = folded(tag);
				if (!tags.has(key)) tags.set(key, { value: tag, label: tag, icon: 'hash', kind: 'text' });
			}
		}

		const properties = [...propertyKinds].map(([property, kind]) => ({
			value: property,
			label: property,
			icon: iconForKind(kind),
			kind,
		}));
		const folders = this.app.vault.getAllFolders(true).map((folder) => ({
			value: folder.path || '/',
			label: folder.path || '/',
			icon: 'folder',
			kind: 'text' as const,
		}));
		this.cached = {
			properties,
			folders,
			tags: [...tags.values()],
			noteFiles: noteEntries.map(({ file }) => file),
			propertyValues,
		};
		return this.cached;
	}
}

function filterChoices(choices: readonly FilterChoice[], query: string, alternateQuery = query): FilterChoice[] {
	const matcher = Matcher.of(alternateQuery);
	const alternate = Matcher.of(query);
	const matching = choices.flatMap((choice) => {
		const match =
			matcher.match(choice.label) ??
			matcher.match(choice.value) ??
			alternate.match(choice.label) ??
			alternate.match(choice.value);
		return match ? [{ choice, score: match.score }] : [];
	});
	return matching
		.sort((left, right) => right.score - left.score || left.choice.label.localeCompare(right.choice.label))
		.slice(0, CHOICE_LIMIT)
		.map(({ choice }) => choice);
}

function propertyValues(snapshot: Snapshot, property: string): PropertyEntry[] {
	const exact = snapshot.propertyValues.get(property);
	if (exact) return exact.values;
	const key = [...snapshot.propertyValues.keys()].find((candidate) => folded(candidate) === folded(property));
	return key ? (snapshot.propertyValues.get(key)?.values ?? []) : [];
}

function flatten(value: unknown): unknown[] {
	if (Array.isArray(value)) return value.flatMap(flatten);
	return value === null || value === undefined || typeof value === 'object' ? [] : [value];
}

function choiceForValue(value: string, kind: NonNullable<FilterChoice['kind']>): FilterChoice {
	return { value, label: value, icon: iconForKind(kind), kind };
}

function uniqueChoices(choices: readonly FilterChoice[]): FilterChoice[] {
	const seen = new Set<string>();
	return choices.filter((choice) => {
		if (seen.has(choice.value)) return false;
		seen.add(choice.value);
		return true;
	});
}

function containsWikiLink(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(containsWikiLink);
	return typeof value === 'string' && /!?\[\[[^\]]+\]\]/u.test(value);
}

function queryForLinks(query: string): string {
	const trimmed = query.trimStart();
	return /^\[\[/u.test(trimmed)
		? (trimmed
				.replace(/^\[\[/u, '')
				.replace(/\]\].*$/u, '')
				.split('|', 1)[0] ?? '')
		: query;
}

function inferKind(value: unknown): NonNullable<FilterChoice['kind']> {
	if (Array.isArray(value)) return 'list';
	if (typeof value === 'boolean') return 'checkbox';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'string' && /^\d{4}-\d{2}(?:-\d{2})?(?:[T\s].*)?$/u.test(value)) return 'date';
	return 'text';
}

function iconForKind(kind: NonNullable<FilterChoice['kind']>): string {
	switch (kind) {
		case 'file':
			return 'file-text';
		case 'number':
			return 'hash';
		case 'checkbox':
			return 'check-square';
		case 'list':
			return 'list';
		case 'date':
			return 'calendar';
		case 'text':
			return 'text';
	}
}

function folded(value: string): string {
	return Folded.of(value).text;
}
