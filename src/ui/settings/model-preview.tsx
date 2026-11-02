import { useEffect, useRef, useState } from 'react';
import type { NoteModel } from '@/models/note-model';
import type { Note } from '@/search/note';

const PREVIEW_LIMIT = 50;

type Props = {
	model: NoteModel;
	findNotes: (model: NoteModel) => Note[];
	openNote: (note: Note) => void;
	revision: number;
};

export function ModelPreview({ model, findNotes, openNote, revision }: Props) {
	const membershipSignature = JSON.stringify([model.id, model.match, model.rules]);
	const ready = model.rules.length > 0 && model.rules.every(isCompleteRule);
	const findNotesRef = useRef(findNotes);
	const modelRef = useRef(model);
	const [preview, setPreview] = useState<{ signature: string; notes: Note[]; error?: string } | null>(null);

	useEffect(() => {
		findNotesRef.current = findNotes;
	}, [findNotes]);
	useEffect(() => {
		modelRef.current = model;
	}, [model]);

	useEffect(() => {
		if (!ready) {
			setPreview({ signature: membershipSignature, notes: [] });
			return;
		}

		const timeout = window.setTimeout(() => {
			try {
				setPreview({ signature: membershipSignature, notes: findNotesRef.current(modelRef.current) });
			} catch (error) {
				setPreview({
					signature: membershipSignature,
					notes: [],
					error: error instanceof Error ? error.message : 'Could not load matching notes.',
				});
			}
		}, 100);

		return () => window.clearTimeout(timeout);
	}, [membershipSignature, ready, revision]);

	const current = preview?.signature === membershipSignature ? preview : null;
	const notes = current?.notes ?? [];
	const visible = notes.slice(0, PREVIEW_LIMIT);
	const emptyMessage = !ready
		? 'Add a condition to preview matching notes'
		: current?.error
			? `Could not load matching notes: ${current.error}`
			: current
				? 'No matching notes'
				: 'Loading…';

	return (
		<section className='shard-model-preview' aria-label='Matching notes'>
			<div className='shard-model-preview-heading'>
				<span>Matching notes</span>
				<span className='shard-model-preview-count'>
					{notes.length > PREVIEW_LIMIT ? `${PREVIEW_LIMIT} of ${notes.length}` : notes.length}
				</span>
			</div>
			{notes.length === 0 ? (
				<p className='shard-model-preview-empty' aria-live='polite'>
					{emptyMessage}
				</p>
			) : (
				<div className='shard-model-preview-results' aria-live='polite'>
					{visible.map((note) => (
						<button className='shard-model-preview-note' type='button' key={note.path} onClick={() => openNote(note)}>
							<span className='shard-model-preview-name'>{note.name}</span>
							{note.folder && <span className='shard-model-preview-folder'>{note.folder}</span>}
						</button>
					))}
				</div>
			)}
		</section>
	);
}

function isCompleteRule(rule: NoteModel['rules'][number]): boolean {
	if (rule.type === 'folder') return rule.value.trim() !== '';
	if (rule.type === 'tag') return rule.value.trim().replace(/^#+/u, '').replace(/\/+$/u, '') !== '';
	if (rule.type === 'link') return rule.value.trim() !== '';
	return rule.property.trim() !== '' && (rule.operator === 'exists' || rule.value.trim() !== '');
}
