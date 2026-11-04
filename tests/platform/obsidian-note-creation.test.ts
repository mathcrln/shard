import { TFile, TFolder, type App, type TAbstractFile } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { FolderIsFile } from '@/exceptions/folder-is-file';
import { InvalidFolder } from '@/exceptions/invalid-folder';
import { InvalidNoteTitle } from '@/exceptions/invalid-note-title';
import { NoteAlreadyExists } from '@/exceptions/note-already-exists';
import { TemplateNotFound } from '@/exceptions/template-not-found';
import { UnsupportedTemplate } from '@/exceptions/unsupported-template';
import { ObsidianNoteCreation } from '@/platform/obsidian-note-creation';

describe('ObsidianNoteCreation', () => {
	describe('placing the note', () => {
		it('creates the note in the requested folder under a portable title', async () => {
			const vault = GivenVault({ folders: ['Books'] });

			const file = await WhenCreating(vault, { title: 'Dune: Messiah', folder: 'Books' });

			expect(file.path).toBe('Books/Dune - Messiah.md');
			expect(vault.contents.get('Books/Dune - Messiah.md')).toBe('');
		});

		it('drops a typed .md extension from the title', async () => {
			const vault = GivenVault();

			const file = await WhenCreating(vault, { title: 'Dune.md' });

			expect(file.path).toBe('Dune.md');
		});

		it('creates missing folders from a loosely typed folder path', async () => {
			const vault = GivenVault();

			await WhenCreating(vault, { title: 'Dune', folder: '/Books\\2024/' });

			expect(vault.folders()).toEqual(['Books', 'Books/2024']);
			expect(vault.contents.has('Books/2024/Dune.md')).toBe(true);
		});

		it('creates the note at the vault root for /', async () => {
			const vault = GivenVault({ defaultFolder: 'Inbox' });

			const file = await WhenCreating(vault, { title: 'Dune', folder: '/' });

			expect(file.path).toBe('Dune.md');
		});

		it("uses Obsidian's new-note folder when the model sets none", async () => {
			const vault = GivenVault({ folders: ['Inbox'], defaultFolder: 'Inbox' });

			const file = await WhenCreating(vault, { title: 'Dune' });

			expect(file.path).toBe('Inbox/Dune.md');
		});
	});

	describe('refusing to create', () => {
		it.each(['', '???', 'CON'])('rejects the title %j', async (title) => {
			const vault = GivenVault();

			await expect(WhenCreating(vault, { title })).rejects.toBeInstanceOf(InvalidNoteTitle);
			expect(vault.contents.size).toBe(0);
		});

		it.each(['Books/../Secrets', 'Books/a:b'])('rejects the folder %j', async (folder) => {
			const vault = GivenVault();

			await expect(WhenCreating(vault, { title: 'Dune', folder })).rejects.toBeInstanceOf(InvalidFolder);
			expect(vault.folders()).toEqual([]);
		});

		it('never overwrites an existing note', async () => {
			const vault = GivenVault({ files: { 'Books/Dune.md': 'original' } });

			await expect(WhenCreating(vault, { title: 'Dune', folder: 'Books' })).rejects.toBeInstanceOf(NoteAlreadyExists);
			expect(vault.contents.get('Books/Dune.md')).toBe('original');
		});

		it('refuses a folder path that runs through a file', async () => {
			const vault = GivenVault({ files: { Books: '' } });

			await expect(WhenCreating(vault, { title: 'Dune', folder: 'Books/2024' })).rejects.toBeInstanceOf(FolderIsFile);
			expect(vault.contents.has('Books/2024/Dune.md')).toBe(false);
		});
	});

	describe('templates', () => {
		it('renders the title into the template body', async () => {
			const vault = GivenVault({ files: { 'Templates/Book.md': '# {{title}}' } });

			await WhenCreating(vault, { title: 'Dune', template: '[[Templates/Book]]' });

			expect(vault.contents.get('Dune.md')).toBe('# Dune');
		});

		it('finds a template by its link name', async () => {
			const vault = GivenVault({ files: { 'Templates/Book.md': 'by {{ title }}' } });

			await WhenCreating(vault, { title: 'Dune', template: 'Book' });

			expect(vault.contents.get('Dune.md')).toBe('by Dune');
		});

		it('reports a missing template without creating the note', async () => {
			const vault = GivenVault();

			await expect(WhenCreating(vault, { title: 'Dune', template: '[[Missing]]' })).rejects.toBeInstanceOf(
				TemplateNotFound
			);
			expect(vault.contents.size).toBe(0);
		});

		it('does not read a template outside the vault', async () => {
			const vault = GivenVault({ files: { 'Templates/Book.md': '# {{title}}' } });

			await expect(WhenCreating(vault, { title: 'Dune', template: '[[../Templates/Book]]' })).rejects.toBeInstanceOf(
				TemplateNotFound
			);
		});

		it.each(['<% tp.file.title %>', '{{author}}', '{{title'])('rejects the unsupported template %j', async (template) => {
			const vault = GivenVault({ files: { 'Templates/Book.md': template } });

			await expect(WhenCreating(vault, { title: 'Dune', template: 'Templates/Book' })).rejects.toBeInstanceOf(
				UnsupportedTemplate
			);
			expect(vault.contents.has('Dune.md')).toBe(false);
		});
	});
});

function GivenVault({
	files = {},
	folders = [],
	defaultFolder = '',
}: { files?: Record<string, string>; folders?: string[]; defaultFolder?: string } = {}) {
	const entries = new Map<string, TAbstractFile>();
	const contents = new Map<string, string>();
	const addFolder = (path: string): TFolder => {
		const folder = Object.assign(new TFolder(), { path, name: path.split('/').pop() ?? path });
		entries.set(path, folder);
		return folder;
	};
	const addFile = (path: string, body: string): TFile => {
		const name = path.split('/').pop() ?? path;
		const dot = name.lastIndexOf('.');
		const file = Object.assign(new TFile(), {
			path,
			name,
			basename: dot > 0 ? name.slice(0, dot) : name,
			extension: dot > 0 ? name.slice(dot + 1) : '',
		});
		entries.set(path, file);
		contents.set(path, body);
		return file;
	};
	for (const path of folders) addFolder(path);
	for (const [path, body] of Object.entries(files)) addFile(path, body);

	const app = {
		vault: {
			getAbstractFileByPath: (path: string) => entries.get(path) ?? null,
			getFileByPath: (path: string) => {
				const entry = entries.get(path);
				return entry instanceof TFile ? entry : null;
			},
			read: (file: TFile) => Promise.resolve(contents.get(file.path) ?? ''),
			create: (path: string, body: string) => Promise.resolve(addFile(path, body)),
			createFolder: (path: string) => Promise.resolve(addFolder(path)),
		},
		fileManager: { getNewFileParent: () => ({ path: defaultFolder || '/' }) },
		workspace: { getActiveFile: () => null },
		metadataCache: {
			getFirstLinkpathDest: (link: string) =>
				[...entries.values()].find((entry) => entry instanceof TFile && entry.basename === link) ?? null,
		},
	} as unknown as App;

	return {
		app,
		contents,
		folders: () => [...entries.values()].filter((entry) => entry instanceof TFolder).map((entry) => entry.path),
	};
}

function WhenCreating(
	vault: ReturnType<typeof GivenVault>,
	{ title, folder = '', template = '' }: { title: string; folder?: string; template?: string }
): Promise<TFile> {
	return new ObsidianNoteCreation(vault.app).create({ title, folder, template });
}
