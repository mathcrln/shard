import { setIcon } from 'obsidian';
import type { Result } from '@/search/result';
import { segmentsOf } from '@/text/segments';

type Props = { result: Result; onActions: (event: MouseEvent) => void };

export function NativeResult({ result, onActions }: Props) {
	return (
		<>
			<div className='suggestion-content'>
				<div className='suggestion-title'>
					{segmentsOf(result.title, result.ranges).map((segment, index) => (
						<span key={index} className={segment.matched ? 'suggestion-highlight' : undefined}>
							{segment.text}
						</span>
					))}
				</div>
				{result.description && <div className='suggestion-note'>{result.description}</div>}
			</div>
			<button
				ref={(button) => {
					if (button) setIcon(button, 'ellipsis');
				}}
				className='clickable-icon shard-native-actions'
				aria-label={`Actions for ${result.title}`}
				tabIndex={-1}
				onPointerDown={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
				onMouseDown={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
				onClick={(event) => {
					event.stopPropagation();
					onActions(event.nativeEvent);
				}}
			/>
		</>
	);
}
