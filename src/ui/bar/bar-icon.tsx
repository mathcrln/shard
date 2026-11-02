export type IconName = 'search' | 'heading' | 'open' | 'tab' | 'split' | 'link' | 'command' | 'close' | 'more' | 'back';

type Props = { name: IconName };

export function BarIcon({ name }: Props) {
	return (
		<svg
			className='svg-icon shard-icon'
			width='18'
			height='18'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.6'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			{name === 'search' && (
				<>
					<circle cx='10.8' cy='10.8' r='6.8' />
					<path d='m16 16 4.5 4.5' />
				</>
			)}
			{name === 'heading' && <path d='M5 9h14M4 15h14M11 4 7 20M17 4l-4 16' />}
			{name === 'more' && (
				<>
					<circle cx='5' cy='12' r='1' />
					<circle cx='12' cy='12' r='1' />
					<circle cx='19' cy='12' r='1' />
				</>
			)}
			{name === 'back' && <path d='m14 6-6 6 6 6' />}
			{name === 'close' && <path d='m6 6 12 12M6 18 18 6' />}
			{name === 'command' && <path d='M9 9V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V9' />}
			{name === 'open' && <path d='M7 17 17 7M7 7h10v10' />}
			{name === 'tab' && (
				<>
					<rect x='3' y='4' width='18' height='16' rx='3' />
					<path d='M3 9h18M12 12v5M9.5 14.5h5' />
				</>
			)}
			{name === 'split' && (
				<>
					<rect x='3' y='4' width='18' height='16' rx='3' />
					<path d='M12 4v16' />
				</>
			)}
			{name === 'link' && (
				<path
					d='m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0'
					transform='translate(1 1)'
				/>
			)}
		</svg>
	);
}
