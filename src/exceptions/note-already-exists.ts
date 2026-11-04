import { ShardException } from '@/exceptions/shard-exception';

export class NoteAlreadyExists extends ShardException {
	constructor(readonly path: string) {
		super(`A note already exists at "${path}". Choose another title.`);
	}
}
