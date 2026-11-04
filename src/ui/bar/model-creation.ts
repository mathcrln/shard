import type { CreateModelNote, ModelCreator } from '@/models/note-creation';
import type { NoteModel } from '@/models/note-model';
import { parseModelIntent } from '@/models/model-intent';
import { ShardException } from '@/exceptions/shard-exception';

type Options = {
	create: CreateModelNote;
	query: () => string;
	compose: (query: string) => void;
	changed: () => void;
	completed: () => void;
};

export class ModelCreation implements ModelCreator {
	busy = false;
	error: string | null = null;
	private generation = 0;

	constructor(private readonly options: Options) {}

	create(model: NoteModel, title: string): void {
		if (this.busy) return;
		if (!title.trim()) {
			const query = this.options.query();
			const intent = parseModelIntent(query, [model]);
			const prefix = intent ? query.trimEnd() : (model.keywords[0] ?? model.name);
			this.options.compose(intent?.action === 'create' ? `${prefix} ` : `${prefix} create `);
			return;
		}
		void this.submit(model, title.trim());
	}

	clearError(): void {
		this.error = null;
	}

	reset(): void {
		this.generation++;
		this.busy = false;
		this.clearError();
	}

	private async submit(model: NoteModel, title: string): Promise<void> {
		const generation = this.generation;
		this.busy = true;
		this.clearError();
		this.options.changed();
		try {
			await this.options.create(model, title);
			if (generation === this.generation) this.options.completed();
		} catch (error) {
			if (generation === this.generation) {
				this.error = ShardException.from(error).message;
			}
		} finally {
			if (generation === this.generation) {
				this.busy = false;
				this.options.changed();
			}
		}
	}
}
