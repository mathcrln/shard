import { ShardException } from '@/exceptions/shard-exception';

export class TemplateNotFound extends ShardException {
	constructor(readonly reference: string) {
		super(`Template "${reference.trim()}" could not be found as a Markdown note.`);
	}
}
