import { ShardException } from '@/exceptions/shard-exception';

export class InvalidFolder extends ShardException {
	constructor(readonly folder: string) {
		super(`"${folder.trim()}" cannot be used as a folder.`);
	}
}
