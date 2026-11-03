import { getLinkpath, moment, TFolder, type App, type TFile } from 'obsidian';
import type { NoteCreation } from '@/models/note-creation';
import { Path } from '@/utils/path';
import { Str } from '@/utils/str';

const INVALID_FILENAME_CHARACTERS = /[<>:"/\\|?*\p{Cc}]/u;
const WINDOWS_DEVICE_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/iu;

export class ObsidianNoteCreation {
	constructor(private readonly app: App) {}

	async create(input: NoteCreation): Promise<TFile> {
		const title = validateTitle(Str.filename(input.title));
		const requestedFolder = input.folder.trim();
		const folder = validateFolder(
			requestedFolder
				? requestedFolder
				: this.app.fileManager.getNewFileParent(this.app.workspace.getActiveFile()?.path ?? '', `${title}.md`).path
		);
		const template = await this.readTemplate(input.template);
		const body = renderTemplate(template, title);
		const path = folder ? `${folder}/${title}.md` : `${title}.md`;
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (existing) throw new Error(`A file or folder already exists at "${path}". Choose another title.`);

		if (folder) await this.ensureFolders(folder);

		try {
			return await this.app.vault.create(path, body);
		} catch (error) {
			if (this.app.vault.getAbstractFileByPath(path)) {
				throw new Error(`A note already exists at "${path}". Choose another title.`);
			}
			throw error;
		}
	}

	private async readTemplate(pathInput: string): Promise<string> {
		const reference = pathInput.trim();
		if (!reference) return '';
		const wikilink = /^!?\[\[([\s\S]+)\]\]$/u.exec(reference);
		const linktext = wikilink ? ((wikilink[1] ?? '').split('|')[0]?.trim() ?? '') : reference;
		const path = getLinkpath(linktext).trim();
		if (!path) throw new Error(`Template "${reference}" does not identify a note.`);
		validateVaultPath(path, 'Template path');

		const file =
			this.app.vault.getFileByPath(path) ??
			(!/\.md$/iu.test(path) ? this.app.vault.getFileByPath(`${path}.md`) : null) ??
			this.app.metadataCache.getFirstLinkpathDest(path, '');
		if (!file || file.extension.toLowerCase() !== 'md') {
			throw new Error(`Template "${reference}" could not be found as a Markdown note.`);
		}

		return this.app.vault.read(file);
	}

	private async ensureFolders(path: string): Promise<void> {
		for (const current of [...Path.ancestors(path), path]) {
			const existing = this.app.vault.getAbstractFileByPath(current);
			if (existing instanceof TFolder) continue;
			if (existing) throw new Error(`Cannot create notes in "${path}": "${current}" is a file.`);

			try {
				await this.app.vault.createFolder(current);
			} catch (error) {
				const raced = this.app.vault.getAbstractFileByPath(current);
				if (raced instanceof TFolder) continue;
				if (raced) throw new Error(`Cannot create notes in "${path}": "${current}" is a file.`);
				throw error;
			}
		}
	}
}

function validateTitle(input: string): string {
	const trimmed = input.trim();
	const title = trimmed.replace(/\.md$/iu, '');
	if (!title || title === '.' || title === '..' || /\.md$/iu.test(title) || title.endsWith('.')) {
		throw new Error('Enter a valid note title with a single optional .md extension.');
	}
	if (INVALID_FILENAME_CHARACTERS.test(title) || /[. ]$/u.test(title) || WINDOWS_DEVICE_NAME.test(title)) {
		throw new Error('The note title contains characters that are not portable in a filename.');
	}
	return title;
}

function validateFolder(input: string): string {
	const folder = input.trim();
	if (!folder || folder === '/') return '';
	if (folder.startsWith('/') || folder.includes('\\')) {
		throw new Error('Choose a vault-relative folder path, or / for the vault root.');
	}
	const normalized = folder.replace(/\/+$/u, '');
	validateVaultPath(normalized, 'Folder path');
	const segments = normalized.split('/');
	if (
		segments.some(
			(segment) =>
				segment === '.' ||
				segment === '..' ||
				!segment ||
				INVALID_FILENAME_CHARACTERS.test(segment) ||
				/[. ]$/u.test(segment)
		)
	) {
		throw new Error('The folder path contains an invalid or unsafe path segment.');
	}
	return segments.join('/');
}

function validateVaultPath(path: string, label: string): void {
	if (!Path.isSafe(path)) {
		throw new Error(`${label} must be a vault-relative path without . or .. segments.`);
	}
}

function renderTemplate(source: string, title: string): string {
	if (/<%[\s\S]*?(?:%>|$)/u.test(source)) {
		throw new Error(
			'This template uses Templater expressions, which Shard does not execute. Choose a plain Markdown template.'
		);
	}

	const placeholders = [...source.matchAll(/\{\{([\s\S]*?)\}\}/gu)];
	for (const match of placeholders) {
		const expression = (match[1] ?? '').trim();
		if (!/^(?:title|date(?::.+)?|time(?::.+)?)$/u.test(expression)) {
			throw new Error(
				`Unsupported template placeholder "{{${expression}}}". Use {{title}}, {{date}}, {{date:FORMAT}}, {{time}}, or {{time:FORMAT}}.`
			);
		}
	}
	const withoutPlaceholders = source.replace(/\{\{[\s\S]*?\}\}/gu, '');
	if (withoutPlaceholders.includes('{{') || withoutPlaceholders.includes('}}')) {
		throw new Error('The template contains an incomplete {{…}} placeholder.');
	}

	const now = moment.unix(Date.now() / 1000);
	return source.replace(/\{\{([\s\S]*?)\}\}/gu, (_placeholder, raw: string) => {
		const expression = raw.trim();
		if (expression === 'title') return title;
		const [kind, ...formatParts] = expression.split(':');
		const format = formatParts.join(':').trim() || (kind === 'date' ? 'YYYY-MM-DD' : 'HH:mm');
		return now.format(format);
	});
}
