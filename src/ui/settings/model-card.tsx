import { useEffect, useRef, useState } from 'react';
import { setIcon } from 'obsidian';
import type { ModelChanges, ModelRule, NoteModel, RuleType } from '@/models/note-model';
import type { NoteModels } from '@/models/note-models';
import type { Note } from '@/search/note';
import { ModelConditions } from '@/ui/settings/model-conditions';
import { ModelPreview } from '@/ui/settings/model-preview';
import { useFilters } from '@/ui/settings/filters/filter-context';
import { SuggestedInput } from '@/ui/settings/filters/suggested-input';
import { ModelCreationFields } from '@/ui/settings/model-creation-fields';
import { ShardException } from '@/exceptions/shard-exception';

type Props = {
	model: NoteModel;
	models: NoteModels;
	isOpen: boolean;
	isDraft?: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate?: (name: string) => Promise<void>;
	onDraftNameChange?: (name: string) => void;
	onCancelDraft?: () => void;
	onUpdate?: (id: string, changes: ModelChanges) => Promise<void>;
	onRemove?: (id: string) => Promise<void>;
	onAddRule?: (modelId: string, type: RuleType) => Promise<void>;
	onUpdateRule?: (modelId: string, ruleId: string, rule: ModelRule) => Promise<void>;
	onRemoveRule?: (modelId: string, ruleId: string) => Promise<void>;
	findNotes: (model: NoteModel) => Note[];
	openNote: (note: Note) => void;
	revision: number;
};

export function ModelCard(props: Props) {
	const { model, models, isOpen, isDraft = false } = props;
	const nameInput = useRef<HTMLInputElement>(null);
	const keywordInput = useRef<HTMLInputElement>(null);
	const createPending = useRef(false);
	const removePending = useRef(false);
	const keywordPending = useRef(false);
	const currentKeyword = useRef('');
	const [name, setName] = useState(model.name);
	const [nameTouched, setNameTouched] = useState(false);
	const [keyword, setKeyword] = useState('');
	const [keywordTouched, setKeywordTouched] = useState(false);
	const [keywordSaving, setKeywordSaving] = useState(false);
	const [removing, setRemoving] = useState(false);
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		if (nameInput.current?.ownerDocument.activeElement !== nameInput.current) setName(model.name);
	}, [model.id, model.name]);
	useEffect(() => {
		if (isDraft && isOpen) nameInput.current?.focus();
	}, [isDraft, isOpen, model.id]);

	const nameProblem = nameTouched ? models.nameProblem(name, isDraft ? undefined : model.id) : undefined;
	const savedKeywords = models.get(model.id)?.keywords ?? model.keywords;
	const keywordProblem =
		keywordTouched && keyword.trim() ? models.keywordsProblem([...savedKeywords, keyword.trim()], model.id) : undefined;

	const commitName = async (): Promise<void> => {
		if (isDraft && createPending.current) return;
		setNameTouched(true);
		if (!name.trim() || models.nameProblem(name, isDraft ? undefined : model.id)) return;
		if (isDraft) {
			setCreating(true);
			createPending.current = true;
			try {
				await props.onCreate?.(name.trim());
			} catch (error) {
				ShardException.render(error);
			} finally {
				createPending.current = false;
				setCreating(false);
			}
			return;
		}
		if (name.trim() === model.name) return;
		try {
			await props.onUpdate?.(model.id, { name: name.trim() });
		} catch (error) {
			ShardException.render(error);
		}
	};

	const commitKeyword = async (): Promise<void> => {
		if (keywordPending.current) return;
		setKeywordTouched(true);
		const value = currentKeyword.current.trim();
		if (!value) return;
		const latestModel = models.get(model.id);
		const keywords = [...(latestModel?.keywords ?? model.keywords), value];
		const problem = models.keywordsProblem(keywords, model.id);
		if (problem) return;
		keywordPending.current = true;
		setKeywordSaving(true);
		try {
			await props.onUpdate?.(model.id, { keywords });
			const saved = models.get(model.id)?.keywords ?? keywords;
			if (currentKeyword.current.trim() === value && saved.includes(value)) {
				currentKeyword.current = '';
				setKeyword('');
				setKeywordTouched(false);
			}
		} catch (error) {
			ShardException.render(error);
		} finally {
			keywordPending.current = false;
			setKeywordSaving(false);
			const latest = currentKeyword.current.trim();
			if (latest && latest !== value && keywordInput.current?.ownerDocument.activeElement !== keywordInput.current) {
				void commitKeyword();
			}
		}
	};

	const removeKeyword = async (removed: string): Promise<void> => {
		if (keywordPending.current) return;
		keywordPending.current = true;
		setKeywordSaving(true);
		try {
			const latestKeywords = models.get(model.id)?.keywords ?? model.keywords;
			if (latestKeywords.includes(removed)) {
				await props.onUpdate?.(model.id, { keywords: latestKeywords.filter((value) => value !== removed) });
			}
		} catch (error) {
			ShardException.render(error);
		} finally {
			keywordPending.current = false;
			setKeywordSaving(false);
			const latest = currentKeyword.current.trim();
			if (latest && keywordInput.current?.ownerDocument.activeElement !== keywordInput.current) void commitKeyword();
		}
	};

	const removeModel = async (): Promise<void> => {
		if (isDraft) {
			if (createPending.current) return;
			props.onCancelDraft?.();
			return;
		}
		if (removePending.current) return;
		removePending.current = true;
		setRemoving(true);
		try {
			await props.onRemove?.(model.id);
		} catch (error) {
			ShardException.render(error);
		} finally {
			removePending.current = false;
			setRemoving(false);
		}
	};

	return (
		<details
			className='shard-model-card'
			open={isOpen}
			onToggle={(event) => {
				const open = event.currentTarget.open;
				if (open !== isOpen) props.onOpenChange(open);
			}}
		>
			<summary className='shard-model-summary'>
				<ModelIcon name={model.icon} />
				<span className='shard-model-heading'>
					<span className='shard-model-card-title'>{model.name || 'New model'}</span>
					<span className='shard-model-summary-detail'>
						{[membershipSummary(model), ...model.keywords].filter(Boolean).join(' · ') || 'No conditions yet'}
					</span>
				</span>
				<span className='shard-model-chevron' aria-hidden='true' />
			</summary>
			<div className='shard-model-editor'>
				<label className='shard-model-field'>
					<span>Name</span>
					<input
						ref={nameInput}
						className='shard-box shard-model-name'
						value={name}
						placeholder='Model name'
						aria-invalid={Boolean(nameProblem)}
						aria-describedby={nameProblem ? `${model.id}-name-error` : undefined}
						onChange={(event) => {
							const value = event.currentTarget.value;
							setName(value);
							if (isDraft) props.onDraftNameChange?.(value);
						}}
						onBlur={(event) => {
							if (isDraft && isDiscardDraftTarget(event.relatedTarget)) return;
							void commitName();
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								event.currentTarget.blur();
							}
						}}
					/>
					{nameProblem && (
						<span id={`${model.id}-name-error`} className='shard-model-error' role='alert'>
							{nameProblem}
						</span>
					)}
				</label>
				{isDraft ? (
					<div className='shard-model-draft-actions'>
						<button
							type='button'
							className='shard-model-remove shard-model-discard-draft'
							disabled={creating}
							onClick={() => void removeModel()}
						>
							Discard draft
						</button>
					</div>
				) : (
					<>
						<div className='shard-model-field'>
							<span>Keywords</span>
							<div>
								<div className='shard-box shard-model-keywords'>
									{model.keywords.map((value) => (
										<span className='shard-model-keyword' key={value}>
											<span>{value}</span>
											<button
												type='button'
												disabled={keywordSaving}
												aria-label={`Remove keyword ${value}`}
												onClick={() => void removeKeyword(value)}
											>
												×
											</button>
										</span>
									))}
									<input
										ref={keywordInput}
										value={keyword}
										aria-label='Add a keyword'
										placeholder='Add…'
										aria-invalid={Boolean(keywordProblem)}
										onChange={(event) => {
											currentKeyword.current = event.currentTarget.value;
											setKeyword(event.currentTarget.value);
										}}
										onBlur={() => {
											if (keyword.trim()) void commitKeyword();
										}}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ',') {
												event.preventDefault();
												void commitKeyword();
											}
										}}
									/>
								</div>
								{keywordProblem && (
									<p className='shard-model-error' role='alert'>
										{keywordProblem}
									</p>
								)}
							</div>
						</div>
						<ModelIconField
							value={model.icon ?? ''}
							onChange={async (icon) => {
								await props.onUpdate?.(model.id, { icon });
							}}
						/>
						<h3 className='shard-model-section-title'>Find notes</h3>
						{isOpen && (
							<ModelConditions
								model={model}
								onUpdate={(rule) => props.onUpdateRule?.(model.id, rule.id, rule)}
								onAdd={(type) => props.onAddRule?.(model.id, type)}
								onRemove={(ruleId) => props.onRemoveRule?.(model.id, ruleId)}
								onMatchChange={(match) => props.onUpdate?.(model.id, { match })}
							/>
						)}
						{isOpen && (
							<ModelPreview
								model={model}
								findNotes={props.findNotes}
								openNote={props.openNote}
								revision={props.revision}
							/>
						)}
						<h3 className='shard-model-section-title'>Create notes</h3>
						<ModelCreationFields
							model={model}
							onChange={async (creation) => {
								await props.onUpdate?.(model.id, { creation });
							}}
						/>
						<div className='shard-model-card-actions'>
							<button
								type='button'
								className='shard-model-remove'
								disabled={removing}
								onClick={() => void removeModel()}
							>
								Remove model
							</button>
						</div>
					</>
				)}
			</div>
		</details>
	);
}

function isDiscardDraftTarget(target: EventTarget | null): boolean {
	if (!target || typeof target !== 'object' || !('closest' in target)) return false;
	const closest = (target as { closest?: (selector: string) => Element | null }).closest;
	return typeof closest === 'function' && closest.call(target, '.shard-model-discard-draft') !== null;
}

function membershipSummary(model: NoteModel): string {
	const rule = model.rules[0];
	if (!rule) return '';
	let summary =
		rule.type === 'property'
			? rule.operator === 'exists'
				? `Property ${rule.property || '…'} exists`
				: `Property ${rule.property || '…'} ${rule.operator} ${rule.value || '…'}`
			: `${rule.type === 'folder' ? 'Folder' : rule.type === 'tag' ? 'Tag' : 'Links to'} ${rule.value || '…'}`;
	if (rule.exclude) summary = `Not: ${summary}`;
	if (model.rules.length > 1) summary += ` · +${model.rules.length - 1}`;
	return summary;
}

function ModelIcon({ name }: { name?: string }) {
	const el = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		if (!el.current) return;
		el.current.replaceChildren();
		setIcon(el.current, name || 'box');
	}, [name]);
	return <span ref={el} className='shard-model-icon' aria-hidden='true' />;
}

function ModelIconField({ value, onChange }: { value: string; onChange: (icon: string) => Promise<void> }) {
	const { catalog } = useFilters();
	return (
		<div className='shard-model-field'>
			<span>Icon</span>
			<SuggestedInput
				className='shard-box shard-field-input'
				label='Model icon'
				icon={value || 'box'}
				value={value}
				placeholder='Choose an icon'
				choices={(query) => catalog.icons(query)}
				onCommit={(next) => {
					void onChange(next.trim()).catch(ShardException.render);
				}}
			/>
		</div>
	);
}
