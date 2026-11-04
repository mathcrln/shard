import { UnsupportedTemplate } from '@/exceptions/unsupported-template';

const PLACEHOLDER = /\{\{([\s\S]*?)\}\}/gu;
const SUPPORTED = /^(?:title|(?:date|time)(?::.+)?)$/u;

export type TemplateValues = { title: string; formatDate: (pattern: string) => string };

export class NoteTemplate {
	private constructor(private readonly source: string) {}

	static of(source: string): NoteTemplate {
		if (source.includes('<%')) throw UnsupportedTemplate.templater();

		for (const [, expression = ''] of source.matchAll(PLACEHOLDER)) {
			if (!SUPPORTED.test(expression.trim())) throw UnsupportedTemplate.placeholder(expression.trim());
		}

		if (/\{\{|\}\}/u.test(source.replace(PLACEHOLDER, ''))) throw UnsupportedTemplate.incomplete();

		return new NoteTemplate(source);
	}

	render({ title, formatDate }: TemplateValues): string {
		return this.source.replace(PLACEHOLDER, (_placeholder, expression: string) => {
			const [kind, ...format] = expression.trim().split(':');
			if (kind === 'title') return title;

			return formatDate(format.join(':').trim() || (kind === 'date' ? 'YYYY-MM-DD' : 'HH:mm'));
		});
	}
}
