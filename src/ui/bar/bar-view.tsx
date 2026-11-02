import { useEffect, useId, useRef } from 'react';
import type { BarState } from '@/ui/bar/bar-state';
import { ActionsPanel } from '@/ui/bar/actions-panel';
import { BarIcon } from '@/ui/bar/bar-icon';
import { ResultList } from '@/ui/bar/result-list';
import { labelOf } from '@/ui/bar/shortcut';

type Props = {
	bar: BarState;
	mac: boolean;
	onChange: () => void;
	onRun: () => void;
};

export function BarView({ bar, mac, onChange, onRun }: Props) {
	const input = useRef<HTMLInputElement>(null);
	const results = useRef<HTMLDivElement>(null);
	const id = useId();
	const listId = `${id}-results`;
	const actionsId = `${id}-actions`;
	const selectedId = bar.actionsOpen
		? `${actionsId}-${bar.actionPosition}`
		: bar.highlighted
			? `${listId}-${bar.position}`
			: undefined;

	useEffect(() => input.current?.focus({ preventScroll: true }), []);
	useEffect(() => {
		results.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
	}, [bar.position, bar.query]);

	const change = (update: () => void) => {
		update();
		onChange();
	};

	return (
		<>
			<header className='shard-header'>
				<BarIcon name='search' />
				<input
					ref={input}
					className='shard-input'
					type='text'
					role='combobox'
					aria-label='Search notes and commands'
					aria-autocomplete='list'
					aria-expanded={true}
					aria-controls={bar.actionsOpen ? actionsId : listId}
					aria-activedescendant={selectedId}
					placeholder='Search notes or run a command…'
					spellCheck={false}
					autoComplete='off'
					autoCapitalize='off'
					autoCorrect='off'
					enterKeyHint='go'
					value={bar.query}
					onChange={(event) => change(() => bar.type(event.target.value))}
				/>
			</header>
			<div className={`shard-body${bar.actionsOpen ? ' has-actions' : ''}`}>
				<div ref={results} className='shard-results' id={listId} role='listbox' aria-label='Results'>
					<ResultList bar={bar} id={listId} onChange={onChange} onRun={onRun} />
				</div>
				{bar.actionsOpen && <ActionsPanel bar={bar} id={actionsId} mac={mac} onChange={onChange} onRun={onRun} />}
			</div>
			<footer className='shard-footer'>
				<span className='shard-brand'>Shard</span>
				{bar.highlighted && (
					<div className='shard-footer-actions'>
						<button className='shard-footer-button shard-primary-action' onClick={onRun}>
							{bar.actionsOpen ? 'Run action' : bar.highlighted.group === 'Commands' ? 'Run command' : 'Open'}{' '}
							<kbd>↵</kbd>
						</button>
						<span className='shard-divider' aria-hidden='true' />
						<button
							className='shard-footer-button'
							aria-label='Actions'
							onPointerDown={(event) => event.preventDefault()}
							aria-expanded={bar.actionsOpen}
							aria-controls={bar.actionsOpen ? actionsId : undefined}
							onClick={() => change(() => bar.toggleActions())}
						>
							Actions <kbd>{labelOf('Mod+K', { mac })}</kbd>
						</button>
					</div>
				)}
			</footer>
		</>
	);
}
