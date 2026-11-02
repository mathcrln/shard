import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Menu, Notice } from 'obsidian';
import type { ModelRule, NoteModel, PropertyOperator, RuleType } from '@/models/note-model';
import type { FilterChoice } from '@/ui/settings/filters/filter-choice';
import { useFilters } from '@/ui/settings/filters/filter-context';
import { SuggestedInput } from '@/ui/settings/filters/suggested-input';

type Props = {
	model: NoteModel;
	onUpdate: (rule: ModelRule) => Promise<void> | undefined;
	onAdd: (type: RuleType) => Promise<void> | undefined;
	onRemove: (ruleId: string) => Promise<void> | undefined;
	onMatchChange: (match: NoteModel['match']) => Promise<void> | undefined;
};

export function ModelConditions({ model, onUpdate, onAdd, onRemove, onMatchChange }: Props) {
	const [adding, setAdding] = useState(false);
	const addingRef = useRef(false);
	const changeMatch = async (match: NoteModel['match']): Promise<void> => {
		try {
			await onMatchChange(match);
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not update condition matching.');
		}
	};
	const addCondition = async (): Promise<void> => {
		if (addingRef.current) return;
		addingRef.current = true;
		setAdding(true);
		try {
			await onAdd('link');
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not add this condition.');
		} finally {
			addingRef.current = false;
			setAdding(false);
		}
	};

	return (
		<section className='shard-model-conditions' aria-label='Model note conditions'>
			<div className='shard-model-field'>
				<span>Include notes when</span>
				<MenuDropdown
					className='shard-box shard-model-select'
					label={model.match === 'all' ? 'All the following are true' : 'Any of the following are true'}
					items={[
						{
							label: 'All the following are true',
							checked: model.match === 'all',
							run: () => void changeMatch('all'),
						},
						{
							label: 'Any of the following are true',
							checked: model.match === 'any',
							run: () => void changeMatch('any'),
						},
					]}
				/>
			</div>
			<div className='shard-model-rule-list'>
				{model.rules.map((rule) => (
					<ConditionRow key={rule.id} rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
				))}
			</div>
			<button type='button' className='shard-model-condition-add' disabled={adding} onClick={() => void addCondition()}>
				{adding ? 'Adding…' : '+ Add filter'}
			</button>
		</section>
	);
}

type RowProps = {
	rule: ModelRule;
	onUpdate: Props['onUpdate'];
	onRemove: Props['onRemove'];
};

function ConditionRow({ rule, onUpdate, onRemove }: RowProps) {
	const { catalog } = useFilters();
	const latest = useRef(rule);
	const queue = useRef(Promise.resolve());
	const pending = useRef(0);
	const removingRef = useRef(false);
	const [busy, setBusy] = useState(false);
	const [removing, setRemoving] = useState(false);
	const optionsMenuRef = useRef<Menu | null>(null);

	useEffect(() => {
		if (pending.current === 0) latest.current = rule;
	}, [rule]);
	useEffect(
		() => () => {
			optionsMenuRef.current?.hide();
		},
		[]
	);

	const save = (next: ModelRule): void => {
		latest.current = next;
		pending.current += 1;
		setBusy(true);
		queue.current = queue.current
			.catch(() => undefined)
			.then(() => onUpdate(next))
			.catch((error: unknown) => {
				new Notice(error instanceof Error ? error.message : 'Could not save this filter.');
			})
			.finally(() => {
				pending.current -= 1;
				setBusy(pending.current > 0);
				if (pending.current === 0) latest.current = next;
			});
	};
	const patch = (change: Partial<ModelRule>): void => {
		save({ ...latest.current, ...change } as ModelRule);
	};

	const changeType = (type: RuleType): void => {
		const current = latest.current;
		const next: ModelRule =
			type === 'property'
				? { id: current.id, type, exclude: current.exclude, property: '', operator: 'contains', value: '' }
				: type === 'link'
					? { id: current.id, type, exclude: current.exclude, value: '' }
					: { id: current.id, type, exclude: current.exclude, value: '', recursive: true };
		save(next);
	};

	const chooseTarget = (value: string, choice?: FilterChoice): void => {
		if (value === 'file' || choice?.value === 'file') {
			const current = latest.current;
			if (current.type === 'property' && current.operator !== 'exists') {
				if (!current.property.trim()) changeType('link');
				else patch({ operator: 'exists' });
			}
			return;
		}
		const property = choice?.value.startsWith('note:') ? choice.value.slice('note:'.length) : value;
		const current = latest.current;
		if (current.type === 'property' && current.operator !== 'exists') {
			patch({ property });
		} else {
			save({ id: current.id, type: 'property', property, operator: 'contains', value: '', exclude: current.exclude });
		}
	};

	const operatorLabel = (): string => {
		const current = latest.current;
		if (current.type === 'link') return current.exclude ? 'does not link to' : 'links to';
		if (current.type === 'folder') return current.exclude ? 'not in folder' : 'in folder';
		if (current.type === 'tag') return current.exclude ? 'does not have tag' : 'has tag';
		if (current.operator === 'exists') return current.exclude ? 'does not have property' : 'has property';
		if (current.operator === 'equals') return current.exclude ? 'is not' : 'is';
		return current.exclude ? 'does not contain' : 'contains';
	};

	const operatorItems = (): MenuEntry[] => {
		const current = latest.current;
		const is = (type: RuleType, exclude: boolean, operator?: PropertyOperator): boolean =>
			current.type === type &&
			current.exclude === exclude &&
			(current.type !== 'property' || current.operator === operator);
		const select = (type: RuleType, exclude: boolean, operator?: PropertyOperator): void => {
			if (type === 'property') {
				const property = current.type === 'property' ? current.property : '';
				const value = current.type === 'property' ? current.value : '';
				save({ id: current.id, type, property, value, operator: operator ?? 'contains', exclude });
			} else if (type === 'link') {
				save({ id: current.id, type, value: current.type === 'link' ? current.value : '', exclude });
			} else {
				save({
					id: current.id,
					type,
					value: current.type === type ? current.value : '',
					recursive: current.type === type ? current.recursive : true,
					exclude,
				});
			}
		};
		if (current.type === 'property' && current.operator !== 'exists') {
			return [
				{
					label: 'contains',
					checked: is('property', false, 'contains'),
					run: () => select('property', false, 'contains'),
				},
				{
					label: 'does not contain',
					checked: is('property', true, 'contains'),
					run: () => select('property', true, 'contains'),
				},
				{ label: 'is', checked: is('property', false, 'equals'), run: () => select('property', false, 'equals') },
				{ label: 'is not', checked: is('property', true, 'equals'), run: () => select('property', true, 'equals') },
				{
					label: 'has property',
					checked: is('property', false, 'exists'),
					run: () => select('property', false, 'exists'),
				},
				{
					label: 'does not have property',
					checked: is('property', true, 'exists'),
					run: () => select('property', true, 'exists'),
				},
			];
		}
		return [
			{ label: 'links to', checked: is('link', false), run: () => select('link', false) },
			{ label: 'does not link to', checked: is('link', true), run: () => select('link', true) },
			{ label: 'in folder', checked: is('folder', false), run: () => select('folder', false) },
			{ label: 'not in folder', checked: is('folder', true), run: () => select('folder', true) },
			{ label: 'has tag', checked: is('tag', false), run: () => select('tag', false) },
			{ label: 'does not have tag', checked: is('tag', true), run: () => select('tag', true) },
			{ label: 'has property', checked: is('property', false, 'exists'), run: () => select('property', false, 'exists') },
			{
				label: 'does not have property',
				checked: is('property', true, 'exists'),
				run: () => select('property', true, 'exists'),
			},
		];
	};

	const remove = async (): Promise<void> => {
		if (removingRef.current || pending.current > 0) return;
		removingRef.current = true;
		setRemoving(true);
		try {
			await onRemove(rule.id);
		} catch (error) {
			new Notice(error instanceof Error ? error.message : 'Could not remove this filter.');
		} finally {
			removingRef.current = false;
			setRemoving(false);
		}
	};

	const target = targetValue(latest.current);
	const value = valueFor(latest.current);
	const fileTarget = latest.current.type !== 'property' || latest.current.operator === 'exists';
	const valueKey =
		latest.current.type === 'property'
			? latest.current.operator === 'exists'
				? `property-exists:${latest.current.property}`
				: `property-value:${latest.current.property}`
			: `${latest.current.type}-value`;
	const targetChoices = (query: string): readonly FilterChoice[] => catalog.targets(query);
	const openRecursion = (target: HTMLElement): void => {
		const current = latest.current;
		if (current.type !== 'folder' && current.type !== 'tag') return;
		optionsMenuRef.current?.hide();
		const label = current.type === 'folder' ? 'Include subfolders' : 'Include subtags';
		const menu = new Menu();
		optionsMenuRef.current = menu;
		menu.addItem((item) =>
			item
				.setTitle(label)
				.setChecked(current.recursive)
				.onClick(() => patch({ recursive: !current.recursive }))
		);
		const bounds = target.getBoundingClientRect();
		menu.showAtPosition({ x: bounds.left, y: bounds.bottom }, target.ownerDocument);
	};
	const valueChoices = (query: string): readonly FilterChoice[] => {
		const current = latest.current;
		if (current.type === 'link') return catalog.notes(query);
		if (current.type === 'folder') return catalog.folders(query);
		if (current.type === 'tag') return catalog.tags(query);
		if (current.operator === 'exists') return catalog.properties(query);
		return catalog.values(current.property, query);
	};

	return (
		<div className='shard-model-rule-row'>
			<div className='shard-model-rule-control'>
				<SuggestedInput
					label='Filter target'
					value={target}
					icon={fileTarget ? 'file' : 'list'}
					className={`shard-filter-target ${fileTarget ? 'shard-filter-target-file' : 'shard-filter-target-property'}`}
					placeholder='file or property'
					choices={targetChoices}
					onCommit={chooseTarget}
				/>
				<MenuDropdown label={operatorLabel()} items={operatorItems()} />
				<SuggestedInput
					key={valueKey}
					label='Filter value'
					className='shard-filter-value'
					value={value}
					placeholder={
						latest.current.type === 'folder'
							? 'Folder'
							: latest.current.type === 'tag'
								? 'Tag'
								: latest.current.type === 'property' && latest.current.operator === 'exists'
									? 'Property'
									: 'Value'
					}
					choices={valueChoices}
					disabled={
						latest.current.type === 'property' && latest.current.operator !== 'exists' && !latest.current.property
					}
					onCommit={(next) => setValue(latest.current, next, patch)}
				/>
				{(latest.current.type === 'folder' || latest.current.type === 'tag') && (
					<button
						type='button'
						className='shard-model-rule-options'
						aria-label={
							latest.current.recursive ? 'Options: recursive matching on' : 'Options: recursive matching off'
						}
						onClick={(event) => openRecursion(event.currentTarget)}
					>
						⋯
					</button>
				)}
			</div>
			<button
				type='button'
				className='shard-model-rule-remove'
				aria-label='Remove filter'
				disabled={removing || busy}
				onClick={() => void remove()}
			>
				×
			</button>
		</div>
	);
}

type MenuEntry = { label: string; checked: boolean; run: () => void };

function MenuDropdown({ label, items, className }: { label: string; items: MenuEntry[]; className?: string }) {
	const menuRef = useRef<Menu | null>(null);
	useEffect(
		() => () => {
			menuRef.current?.hide();
		},
		[]
	);
	const show = (event: MouseEvent<HTMLButtonElement>): void => {
		menuRef.current?.hide();
		const menu = new Menu();
		menuRef.current = menu;
		for (const item of items) {
			menu.addItem((entry) => entry.setTitle(item.label).setChecked(item.checked).onClick(item.run));
		}
		const bounds = event.currentTarget.getBoundingClientRect();
		menu.showAtPosition({ x: bounds.left, y: bounds.bottom }, event.currentTarget.ownerDocument);
	};
	return (
		<button type='button' className={className ?? 'shard-model-filter-menu'} aria-label={label} onClick={show}>
			{label}
		</button>
	);
}

function targetValue(rule: ModelRule): string {
	if (rule.type === 'property') return rule.operator === 'exists' ? 'file' : rule.property;
	return 'file';
}

function valueFor(rule: ModelRule): string {
	if (rule.type === 'property' && rule.operator === 'exists') return rule.property;
	return rule.value;
}

function setValue(rule: ModelRule, value: string, patch: (change: Partial<ModelRule>) => void): void {
	if (rule.type === 'property' && rule.operator === 'exists') patch({ property: value });
	else patch({ value });
}
