import { ShardException } from '@/exceptions/shard-exception';

export class UnsupportedTemplate extends ShardException {
	static templater(): UnsupportedTemplate {
		return new UnsupportedTemplate(
			'This template uses Templater expressions, which Shard does not run. Choose a plain Markdown template.'
		);
	}

	static placeholder(expression: string): UnsupportedTemplate {
		return new UnsupportedTemplate(
			`Unsupported template placeholder "{{${expression}}}". Use {{title}}, {{date}}, {{date:FORMAT}}, {{time}}, or {{time:FORMAT}}.`
		);
	}

	static incomplete(): UnsupportedTemplate {
		return new UnsupportedTemplate('The template contains an incomplete {{…}} placeholder.');
	}
}
