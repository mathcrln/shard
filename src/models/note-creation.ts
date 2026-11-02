import type { NoteModel } from '@/models/note-model';

export type CreationDefaults = { folder: string; template: string };
export type NoteCreation = CreationDefaults & { title: string };
export type CreateModelNote = (model: NoteModel, title: string) => Promise<void>;

export interface ModelCreator {
	create(model: NoteModel, title: string): void;
}
