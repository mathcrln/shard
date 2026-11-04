import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Menu, setIcon } from 'obsidian';
import type { NoteModels } from '@/models/note-models';
import type { ObservedProperty, PropertyChanges, PropertyDefinition, PropertyDefinitions } from '@/models/property-definitions';
import { Str } from '@/utils/str';
import { ShardException } from '@/exceptions/shard-exception';

type Props = {
	definitions: PropertyDefinitions;
	models: NoteModels;
	observed: () => ObservedProperty[];
	revision: number;
};

export function PropertySettings({ definitions, models, observed, revision }: Props) {
	const [sectionOpen, setSectionOpen] = useState(false);
	const [openKey, setOpenKey] = useState<string | null>(null);
	const [filter, setFilter] = useState('');
	const [dragKey, setDragKey] = useState<string | null>(null);
	const [overKey, setOverKey] = useState<string | null>(null);
	const [, setVersion] = useState(0);
	const refresh = () => setVersion((version) => version + 1);

	const current = observed();
	const types = new Map(current.map((property) => [property.key.toLowerCase(), property.type]));

	useEffect(() => {
		void definitions.sync(current).then((changed) => changed && refresh());
	}, [revision]);

	const run = async (action: () => Promise<void>): Promise<void> => {
		try {
			await action();
		} catch (error) {
			ShardException.render(error);
		}
		refresh();
	};

	const query = filter.trim().toLowerCase();
	const items = definitions.all.filter(
		(item) => !query || item.key.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
	);
	const canDrag = !query;

	const linked = definitions.all.filter((item) => item.relation).length;

	return (
		<section className='shard-model-settings shard-property-settings'>
			<button
				type='button'
				className='shard-model-summary shard-property-toggle'
				aria-expanded={sectionOpen}
				onClick={() => setSectionOpen((open) => !open)}
			>
				<span className='shard-model-heading'>
					<span className='shard-model-card-title'>Manage properties</span>
					<span className='shard-model-summary-detail'>
						{Str.quantity(definitions.all.length, 'property', { plural: 'properties' })} · {linked} linked to a model
					</span>
				</span>
				<span className='shard-model-chevron' aria-hidden='true' />
			</button>
			{sectionOpen && (
				<>
					<div className='shard-property-search'>
						<input
							className='shard-box'
							type='text'
							aria-label='Search properties'
							placeholder='Search properties'
							value={filter}
							onChange={(event) => setFilter(event.currentTarget.value)}
						/>
					</div>
					{items.length === 0 ? (
						<p className='shard-model-empty'>
							{query ? 'No matching properties.' : 'No properties found in this vault yet.'}
						</p>
					) : (
						<div className='shard-model-list shard-property-list'>
							{items.map((item) => (
								<PropertyRow
									key={item.key}
									item={item}
									type={types.get(item.key.toLowerCase())}
									models={models}
									isOpen={openKey === item.key}
									canDrag={canDrag}
									isOver={overKey === item.key && dragKey !== item.key}
									onToggle={() => setOpenKey((open) => (open === item.key ? null : item.key))}
									onDragStart={() => setDragKey(item.key)}
									onDragOver={() => setOverKey(item.key)}
									onDragEnd={() => {
										setDragKey(null);
										setOverKey(null);
									}}
									onDrop={() => {
										const to = definitions.all.findIndex((entry) => entry.key === item.key);
										const from = dragKey;
										setDragKey(null);
										setOverKey(null);
										if (from) void run(() => definitions.move(from, to));
									}}
									onChange={(changes) => run(() => definitions.update(item.key, changes))}
									onMove={(offset) => {
										const index = definitions.all.findIndex((entry) => entry.key === item.key);
										void run(() => definitions.move(item.key, index + offset));
									}}
									onRemove={() => void run(() => definitions.remove(item.key))}
								/>
							))}
						</div>
					)}
				</>
			)}
		</section>
	);
}

type RowProps = {
	item: PropertyDefinition;
	type: string | undefined;
	models: NoteModels;
	isOpen: boolean;
	canDrag: boolean;
	isOver: boolean;
	onToggle: () => void;
	onDragStart: () => void;
	onDragOver: () => void;
	onDragEnd: () => void;
	onDrop: () => void;
	onChange: (changes: PropertyChanges) => Promise<void>;
	onMove: (offset: number) => void;
	onRemove: () => void;
};

function PropertyRow(props: RowProps) {
	const { item, type, models, isOpen } = props;
	const [description, setDescription] = useState(item.description);
	const [keyword, setKeyword] = useState(item.keyword ?? '');
	useEffect(() => setDescription(item.description), [item.description]);
	useEffect(() => setKeyword(item.keyword ?? ''), [item.keyword]);

	const relation = item.relation ? models.get(item.relation) : undefined;
	const detail = [
		type,
		relation ? `links to ${relation.name}` : undefined,
		item.keyword ? `keyword ${item.keyword}` : undefined,
	]
		.filter(Boolean)
		.join(' · ');

	const chooseRelation = (event: MouseEvent<HTMLButtonElement>): void => {
		const menu = new Menu();
		menu.addItem((entry) =>
			entry
				.setTitle('None')
				.setChecked(!relation)
				.onClick(() => void props.onChange({ relation: undefined }))
		);
		for (const model of models.all) {
			menu.addItem((entry) =>
				entry
					.setTitle(model.name)
					.setChecked(model.id === item.relation)
					.onClick(() => void props.onChange({ relation: model.id }))
			);
		}
		const bounds = event.currentTarget.getBoundingClientRect();
		menu.showAtPosition({ x: bounds.left, y: bounds.bottom }, event.currentTarget.ownerDocument);
	};

	const row = useRef<HTMLDivElement>(null);
	const arm = (armed: boolean): void => {
		if (row.current) row.current.draggable = armed;
	};

	return (
		<div
			ref={row}
			className={['shard-model-card', 'shard-property-row', props.isOver ? 'is-drop-target' : ''].filter(Boolean).join(' ')}
			onDragStart={props.onDragStart}
			onDragEnd={() => {
				arm(false);
				props.onDragEnd();
			}}
			onDragOver={(event) => {
				event.preventDefault();
				props.onDragOver();
			}}
			onDrop={(event) => {
				event.preventDefault();
				props.onDrop();
			}}
		>
			<div className='shard-property-line'>
				{props.canDrag ? (
					<span className='shard-property-grip' onPointerDown={() => arm(true)} onPointerUp={() => arm(false)}>
						<Icon name='grip-vertical' />
					</span>
				) : (
					<span className='shard-property-grip' />
				)}
				<span className='shard-property-key' title={detail}>
					{item.key}
				</span>
				<span className='shard-property-type'>{type ?? 'Not in vault'}</span>
				<input
					className='shard-property-description'
					type='text'
					aria-label={`Description of ${item.key}`}
					value={description}
					placeholder='Add a description'
					onChange={(event) => setDescription(event.currentTarget.value)}
					onBlur={() => description !== item.description && void props.onChange({ description })}
					onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
				/>
				<button
					type='button'
					className='shard-property-more'
					aria-label={`More options for ${item.key}`}
					aria-expanded={isOpen}
					onClick={props.onToggle}
				>
					<span className='shard-model-chevron' aria-hidden='true' />
				</button>
			</div>
			{isOpen && (
				<div className='shard-model-editor'>
					<div className='shard-model-field'>
						<span>Links to</span>
						<button type='button' className='shard-box shard-model-select' onClick={chooseRelation}>
							{relation?.name ?? 'None'}
						</button>
					</div>
					<label className='shard-model-field'>
						<span>Create keyword</span>
						<input
							className='shard-box'
							type='text'
							value={keyword}
							placeholder='For example, by'
							onChange={(event) => setKeyword(event.currentTarget.value)}
							onBlur={() => keyword.trim() !== (item.keyword ?? '') && void props.onChange({ keyword })}
						/>
					</label>
					<div className='shard-model-card-actions shard-property-actions'>
						<button type='button' className='shard-model-remove-quiet' onClick={() => props.onMove(-1)}>
							Move up
						</button>
						<button type='button' className='shard-model-remove-quiet' onClick={() => props.onMove(1)}>
							Move down
						</button>
						{type === undefined && (
							<button type='button' className='shard-model-remove' onClick={props.onRemove}>
								Remove
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function Icon({ name, className }: { name: string; className?: string }) {
	const el = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		if (el.current) setIcon(el.current, name);
	}, [name]);
	return <span ref={el} className={className} aria-hidden='true' />;
}
