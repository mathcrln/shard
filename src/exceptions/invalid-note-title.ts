import { ShardException } from '@/exceptions/shard-exception';

export class InvalidNoteTitle extends ShardException {
	constructor(readonly title: string) {
		super(title.trim() ? `"${title.trim()}" cannot be used as a note title.` : 'Enter a note title.');
	}
}
