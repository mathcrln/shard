import type { BarState } from '@/ui/bar/bar-state';
import { BarIcon } from '@/ui/bar/bar-icon';
import { segmentsOf } from '@/text/segments';

type Props = {
	bar: BarState;
	id: string;
	onChange: () => void;
	onRun: () => void;
};

export function ResultList({ bar, id, onChange, onRun }: Props) {
	if (bar.results.length === 0) {
		return (
			<div className='shard-empty' role='status'>
				<span className='shard-empty-icon'>
					<BarIcon name='search' />
				</span>
				<strong>{bar.query.trim() ? 'No results found' : 'Find your next thought'}</strong>
				<p>{bar.query.trim() ? 'Try another name or command.' : 'Search for a note or command.'}</p>
			</div>
		);
	}

	let position = 0;
	return bar.groups.map((section) => (
		<div className='shard-group' role='group' aria-label={section.group} key={section.group}>
			<div className='shard-group-heading' aria-hidden='true'>
				{section.group} <span>{section.results.length}</span>
			</div>
			{section.results.map((result) => {
				const index = position++;
				const selected = index === bar.position;
				return (
					<div
						className='shard-row'
						id={`${id}-${index}`}
						key={`${id}-${index}`}
						role='option'
						aria-selected={selected}
						onPointerMove={(event) => {
							if (bar.actionsOpen || selected || event.pointerType === 'touch') return;
							bar.highlight(index);
							onChange();
						}}
						onClick={() => {
							bar.closeActions();
							bar.highlight(index);
							onRun();
						}}
					>
						<span className='shard-tile' aria-hidden='true'>
							{result.group === 'Commands' ? (
								<BarIcon name='command' />
							) : result.group === 'Headings' ? (
								<BarIcon name='heading' />
							) : (
								monogram(result.title)
							)}
						</span>
						<span className='shard-row-content'>
							<span className='shard-row-title'>
								{segmentsOf(result.title, result.ranges).map((segment, key) =>
									segment.matched ? (
										<mark key={key}>{segment.text}</mark>
									) : (
										<span key={key}>{segment.text}</span>
									)
								)}
							</span>
							{result.description && <span className='shard-row-description'>{result.description}</span>}
						</span>
						<button
							className='shard-row-actions'
							aria-label={`Actions for ${result.title}`}
							tabIndex={-1}
							onPointerDown={(event) => event.preventDefault()}
							onClick={(event) => {
								event.stopPropagation();
								bar.highlight(index);
								bar.openActions();
								onChange();
							}}
						>
							<BarIcon name='more' />
						</button>
					</div>
				);
			})}
		</div>
	));
}

function monogram(title: string): string {
	return title
		.trim()
		.split(/[\s\-—–/._]+/u)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => [...word][0])
		.join('')
		.toUpperCase();
}
