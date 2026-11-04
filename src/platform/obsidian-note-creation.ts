import { moment, TFolder, type App, type TAbstractFile, type TFile } from 'obsidian';
import { NoteTemplate } from '@/creation/note-template';
import { FolderIsFile } from '@/exceptions/folder-is-file';
import { InvalidFolder } from '@/exceptions/invalid-folder';
import { InvalidNoteTitle } from '@/exceptions/invalid-note-title';
import { NoteAlreadyExists } from '@/exceptions/note-already-exists';
import { TemplateNotFound } from '@/exceptions/template-not-found';
import type { NoteCreation } from '@/models/note-creation';
import { Path } from '@/utils/path';
import { Str } from '@/utils/str';
import { Wikilink } from '@/utils/wikilink';

export class ObsidianNoteCreation {
	constructor(private readonly app: App) {}

	async create(input: NoteCreation): Promise<TFile> {
		const title = Str.filename(input.title);
		if (!Path.isPortable(title)) throw new InvalidNoteTitle(input.title);

		const folder = input.folder.trim() ? Path.normalize(input.folder) : this.defaultFolder(title);
		if (folder && !Path.isPortable(folder)) throw new InvalidFolder(input.folder);

		const template = NoteTemplate.of(await this.readTemplate(input.template));
		const body = template.render({ title, formatDate: (pattern) => moment.unix(Date.now() / 1000).format(pattern) });
		const path = Path.join(folder, `${title}.md`);
		if (this.app.vault.getAbstractFileByPath(path)) throw new NoteAlreadyExists(path);

		await this.ensureFolder(folder);

		try {
			return await this.app.vault.create(path, body);
		} catch (error) {
			if (this.app.vault.getAbstractFileByPath(path)) throw new NoteAlreadyExists(path);
			throw error;
		}
	}

	private defaultFolder(title: string): string {
		const activePath = this.app.workspace.getActiveFile()?.path ?? '';

		return Path.normalize(this.app.fileManager.getNewFileParent(activePath, `${title}.md`).path);
	}

	private async readTemplate(reference: string): Promise<string> {
		if (!reference.trim()) return '';

		const file = this.templateFile(reference);
		if (!file) throw new TemplateNotFound(reference);

		return this.app.vault.read(file);
	}

	private templateFile(reference: string): TFile | null {
		const path = Wikilink.path(reference);
		const file =
			this.app.vault.getFileByPath(path) ??
			this.app.vault.getFileByPath(`${path}.md`) ??
			this.app.metadataCache.getFirstLinkpathDest(path, '');

		return file?.extension.toLowerCase() === 'md' ? file : null;
	}

	private async ensureFolder(folder: string): Promise<void> {
		if (!folder) return;

		for (const path of [...Path.ancestors(folder), folder]) {
			const existing = this.app.vault.getAbstractFileByPath(path) ?? (await this.createFolder(path));
			if (!(existing instanceof TFolder)) throw new FolderIsFile(folder, path);
		}
	}

	private async createFolder(path: string): Promise<TAbstractFile> {
		try {
			return await this.app.vault.createFolder(path);
		} catch (error) {
			const raced = this.app.vault.getAbstractFileByPath(path);
			if (raced) return raced;
			throw error;
		}
	}
}
