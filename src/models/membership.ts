import type { ModelRule, NoteModel } from '@/models/note-model';
import type { Note } from '@/search/note';
import { Path } from '@/utils/path';
import { Str } from '@/utils/str';

export class Membership {
	static matches(model: NoteModel, note: Note): boolean {
		if (!Array.isArray(model.rules) || model.rules.length === 0) return false;
		if (model.match !== 'all' && model.match !== 'any') return false;

		const predicates = model.rules.map((rule) => {
			if (!isValidRule(rule)) return null;
			const matched = matchesRule(rule, note);
			return rule.exclude ? !matched : matched;
		});

		if (predicates.some((predicate) => predicate === null)) return false;
		return model.match === 'all'
			? predicates.every((predicate) => predicate === true)
			: predicates.some((predicate) => predicate === true);
	}
}

function isValidRule(rule: ModelRule): boolean {
	if (
		!rule ||
		typeof rule !== 'object' ||
		typeof rule.id !== 'string' ||
		rule.id.trim() === '' ||
		typeof rule.exclude !== 'boolean'
	) {
		return false;
	}

	if (rule.type === 'folder' || rule.type === 'tag') {
		return (
			typeof rule.value === 'string' &&
			(rule.type === 'tag' ? normalizeTag(rule.value) !== '' : normalizePath(rule.value) !== '') &&
			typeof rule.recursive === 'boolean'
		);
	}

	if (rule.type === 'property') {
		return (
			typeof rule.property === 'string' &&
			rule.property.trim() !== '' &&
			typeof rule.value === 'string' &&
			(rule.operator === 'exists' || rule.operator === 'equals' || rule.operator === 'contains') &&
			(rule.operator === 'exists' || rule.value.trim() !== '')
		);
	}

	if (rule.type === 'link') return typeof rule.value === 'string' && normalizeLinkTarget(rule.value) !== '';

	return false;
}

function matchesRule(rule: ModelRule, note: Note): boolean {
	switch (rule.type) {
		case 'folder':
			return matchesFolder(rule.value, note.folder, rule.recursive);
		case 'tag':
			return (note.tags ?? []).some((tag) => matchesTag(rule.value, tag, rule.recursive));
		case 'property':
			return matchesProperty(rule, note.properties ?? {});
		case 'link':
			return matchesLink(rule.value, note.links ?? []);
	}
}

function matchesFolder(ruleValue: string, noteFolder: string, recursive: boolean): boolean {
	const rulePath = normalizePath(ruleValue);
	if (!rulePath) return false;
	const folder = normalizePath(noteFolder);
	if (rulePath === '/') return recursive || folder === '' || folder === '/';
	const wanted = Str.fold(rulePath);
	const actual = Str.fold(folder);
	return recursive ? Path.isWithin(actual, wanted) : actual === wanted;
}

function matchesTag(ruleValue: string, noteTag: string, recursive: boolean): boolean {
	const wanted = Str.fold(normalizeTag(ruleValue));
	const actual = Str.fold(normalizeTag(noteTag));
	if (!wanted || !actual) return false;
	return recursive ? Path.isWithin(actual, wanted) : actual === wanted;
}

function matchesProperty(rule: Extract<ModelRule, { type: 'property' }>, properties: Readonly<Record<string, unknown>>): boolean {
	const property = propertyOf(properties, rule.property.trim());
	if (!property.found) return false;
	if (rule.operator === 'exists') return true;

	const actual = property.value;
	const expected = rule.value;
	if (rule.operator === 'equals') {
		return (Array.isArray(actual) ? actual : [actual]).some((value) => equalScalar(value, expected));
	}

	if (typeof actual === 'string') return Str.fold(normalizeLink(actual)).includes(Str.fold(normalizeLink(expected)));
	if (Array.isArray(actual)) return actual.some((value) => equalScalar(value, expected));
	return false;
}

function equalScalar(value: unknown, expected: string): boolean {
	const scalar = scalarText(value);
	return scalar !== null && Str.fold(scalar) === Str.fold(normalizeLink(expected));
}

function propertyOf(properties: Readonly<Record<string, unknown>>, name: string): { found: boolean; value?: unknown } {
	if (Object.hasOwn(properties, name)) return { found: true, value: properties[name] };
	const key = Object.keys(properties).find((candidate) => Str.same(candidate, name));
	return key === undefined ? { found: false } : { found: true, value: properties[key] };
}

function scalarText(value: unknown): string | null {
	if (typeof value === 'string') return normalizeLink(value);
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	return null;
}

function normalizeLink(value: string): string {
	const trimmed = value.trim();
	const wikiLink = trimmed.match(/^!?\[\[([\s\S]*?)\]\]$/u);
	if (!wikiLink) return trimmed;
	return (wikiLink[1] ?? '').split('|', 1)[0]?.trim() ?? '';
}

function matchesLink(value: string, links: readonly string[]): boolean {
	const wanted = normalizeLinkTarget(value);
	if (!wanted) return false;
	return links.some((link) => normalizeLinkTarget(link) === wanted);
}

function normalizeLinkTarget(value: string): string {
	const target = normalizeLink(value).split('#', 1)[0]?.trim().replace(/\\/gu, '/') ?? '';
	return Str.fold(target.replace(/\.md$/iu, ''));
}

function normalizeTag(value: string): string {
	return value.trim().replace(/^#+/u, '').replace(/\/+$/u, '');
}

function normalizePath(value: string): string {
	const trimmed = value.trim().replace(/\\/gu, '/');
	if (trimmed === '/') return '/';
	const normalized = trimmed.replace(/^\/+|\/+$/gu, '');
	return normalized ? `/${normalized}` : '';
}
