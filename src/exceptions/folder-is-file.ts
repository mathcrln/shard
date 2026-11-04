import { ShardException } from '@/exceptions/shard-exception';

export class FolderIsFile extends ShardException {
	constructor(
		readonly folder: string,
		readonly file: string
	) {
		super(`Cannot create notes in "${folder}": "${file}" is a file.`);
	}
}
