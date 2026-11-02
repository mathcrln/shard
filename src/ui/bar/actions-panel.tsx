import { useEffect, useRef } from 'react';
import type { BarState } from '@/ui/bar/bar-state';
import { BarIcon, type IconName } from '@/ui/bar/bar-icon';
import { labelOf } from '@/ui/bar/shortcut';

type Props = {
	bar: BarState;
	id: string;
	mac: boolean;
	onChange: () => void;
	onRun: () => void;
};

const icons: readonly IconName[] = ['open', 'tab', 'split', 'link'];

export function ActionsPanel({ bar, id, mac, onChange, onRun }: Props) {
	const panel = useRef<HTMLDivElement>(null);
	useEffect(() => {
		panel.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
	}, [bar.actionPosition]);

	return (
		<div ref={panel} className='shard-actions' id={id} role='listbox' aria-label='Actions'>
			<div className='shard-actions-header'>
				<button
					className='shard-actions-back'
					aria-label='Back to results'
					onPointerDown={(event) => event.preventDefault()}
					onClick={() => {
						bar.closeActions();
						onChange();
					}}
				>
					<BarIcon name='back' />
				</button>
				<div className='shard-actions-heading'>{bar.highlighted?.title}</div>
			</div>
			{bar.actions.map((action, position) => (
				<div
					className='shard-action'
					key={action.name}
					id={`${id}-${position}`}
					role='option'
					aria-selected={position === bar.actionPosition}
					onPointerMove={(event) => {
						if (position === bar.actionPosition || event.pointerType === 'touch') return;
						bar.highlightAction(position);
						onChange();
					}}
					onClick={() => {
						bar.highlightAction(position);
						onRun();
					}}
				>
					<span className='shard-action-icon'>
						<BarIcon name={bar.highlighted?.group === 'Commands' ? 'command' : (icons[position] ?? 'open')} />
					</span>
					<span className='shard-action-name'>{action.name}</span>
					{(action.shortcut || position === 0) && <kbd>{labelOf(action.shortcut ?? 'Enter', { mac })}</kbd>}
				</div>
			))}
		</div>
	);
}
