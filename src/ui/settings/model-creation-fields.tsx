import { useRef, useState } from 'react';
import { Notice } from 'obsidian';
import type { CreationDefaults } from '@/models/note-creation';
import type { NoteModel } from '@/models/note-model';
import { useFilters } from '@/ui/settings/filters/filter-context';
import { SuggestedInput } from '@/ui/settings/filters/suggested-input';
import { Queue } from '@/utils/queue';

type Props = {
	model: NoteModel;
	onChange: (defaults: CreationDefaults) => Promise<void>;
};

export function ModelCreationFields({ model, onChange }: Props) {
	const { catalog } = useFilters();
	const defaults = model.creation ?? { folder: '', template: '' };
	const latest = useRef(defaults);
	const [saves] = useState(() => new Queue());
	latest.current = defaults;

	const save = (field: keyof CreationDefaults, raw: string): void => {
		const value = raw.trim();
		if (value === latest.current[field]) return;
		const next = { ...latest.current, [field]: value };
		latest.current = next;
		void saves
			.add(() => onChange(next))
			.catch((error: unknown) => {
				new Notice(error instanceof Error ? error.message : 'Could not save model creation settings.');
			});
	};

	return (
		<>
			<div className='shard-model-field'>
				<span>Folder</span>
				<SuggestedInput
					className='shard-box shard-field-input'
					label='Creation folder'
					icon='folder'
					value={defaults.folder}
					placeholder='Obsidian default'
					choices={(query) => catalog.folders(query)}
					onCommit={(value) => save('folder', value)}
				/>
			</div>
			<div className='shard-model-field'>
				<span>Template</span>
				<SuggestedInput
					className='shard-box shard-field-input'
					label='Creation template'
					icon='file-text'
					value={defaults.template}
					placeholder='None'
					choices={(query) => catalog.templates(query)}
					onCommit={(value) => save('template', value)}
				/>
			</div>
		</>
	);
}
