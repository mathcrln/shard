import { useEffect, useRef, useState } from 'react';
import { setIcon } from 'obsidian';
import type { ModelChanges, NoteModel, RuleType } from '@/models/note-model';
import type { NoteModels } from '@/models/note-models';
import type { Note } from '@/search/note';
import { ModelCard } from '@/ui/settings/model-card';

type Props = {
	models: NoteModels;
	findNotes: (model: NoteModel) => Note[];
	openNote: (note: Note) => void;
	revision: number;
};

type Draft = { model: NoteModel; localKey: string };

export function ModelSettings({ models, findNotes, openNote, revision }: Props) {
	const [openId, setOpenId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [promoted, setPromoted] = useState<{ id: string; localKey: string } | null>(null);
	const draftCreation = useRef(false);
	const [, setVersion] = useState(0);
	const refresh = () => setVersion((version) => version + 1);

	const startDraft = () => {
		if (draft) {
			setOpenId(draft.model.id);
			return;
		}
		const id = `draft-${crypto.randomUUID()}`;
		const model: NoteModel = { id, name: '', keywords: [], match: 'all', rules: [] };
		setDraft({ model, localKey: id });
		setPromoted(null);
		setOpenId(id);
	};

	const createModel = async (name: string): Promise<void> => {
		if (!draft || draftCreation.current) return;
		draftCreation.current = true;
		try {
			const created = await models.add({ name });
			setPromoted({ id: created.id, localKey: draft.localKey });
			setDraft(null);
			setOpenId(created.id);
			refresh();
		} finally {
			draftCreation.current = false;
		}
	};

	const updateModel = async (id: string, changes: ModelChanges): Promise<void> => {
		await models.update(id, changes);
		refresh();
	};

	const updateRule = async (modelId: string, ruleId: string, rule: NoteModel['rules'][number]): Promise<void> => {
		await models.updateRule(modelId, { ...rule, id: ruleId });
		refresh();
	};

	const addRule = async (modelId: string, type: RuleType): Promise<void> => {
		await models.addRule(modelId, type);
		refresh();
	};

	const removeRule = async (modelId: string, ruleId: string): Promise<void> => {
		await models.removeRule(modelId, ruleId);
		refresh();
	};

	const removeModel = async (id: string): Promise<void> => {
		await models.remove(id);
		setOpenId(null);
		refresh();
	};
	const savedModels = models.all;
	const cards = savedModels.map((model) => (
		<ModelCard
			key={promoted?.id === model.id ? promoted.localKey : model.id}
			model={model}
			models={models}
			isOpen={openId === model.id}
			onOpenChange={(open) => setOpenId((current) => (open ? model.id : current === model.id ? null : current))}
			onCreate={createModel}
			onUpdate={updateModel}
			onRemove={removeModel}
			onAddRule={addRule}
			onUpdateRule={updateRule}
			onRemoveRule={removeRule}
			findNotes={findNotes}
			openNote={openNote}
			revision={revision}
		/>
	));
	if (draft) {
		cards.push(
			<ModelCard
				key={draft.localKey}
				model={draft.model}
				models={models}
				isOpen={openId === draft.model.id}
				isDraft
				onDraftNameChange={(name) =>
					setDraft((current) => (current ? { ...current, model: { ...current.model, name } } : current))
				}
				onOpenChange={(open) =>
					setOpenId((current) => (open ? draft.model.id : current === draft.model.id ? null : current))
				}
				onCreate={createModel}
				onCancelDraft={() => {
					setDraft(null);
					setOpenId(null);
				}}
				findNotes={findNotes}
				openNote={openNote}
				revision={revision}
			/>
		);
	}

	return (
		<section className='shard-model-settings'>
			{models.loadProblems.length > 0 && (
				<details className='shard-model-load-problems'>
					<summary>Some model settings need attention</summary>
					<ul>
						{models.loadProblems.map((problem, index) => (
							<li key={`${index}-${problem}`}>{problem}</li>
						))}
					</ul>
				</details>
			)}
			{cards.length > 0 ? (
				<div className='shard-model-list'>{cards}</div>
			) : (
				<p className='shard-model-empty'>
					No models yet. Add one to search and create a kind of note, like Games or Books.
				</p>
			)}
			<button type='button' className='shard-model-add' onClick={startDraft}>
				<AddIcon />
				<span>Add model</span>
			</button>
		</section>
	);
}

function AddIcon() {
	const el = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		if (el.current) setIcon(el.current, 'plus');
	}, []);
	return <span ref={el} aria-hidden='true' />;
}
