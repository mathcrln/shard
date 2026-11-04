import { describe, expect, it } from 'vitest';
import { NoteTemplate } from '@/creation/note-template';
import { UnsupportedTemplate } from '@/exceptions/unsupported-template';

describe('NoteTemplate', () => {
	it('renders the title', () => {
		expect(WhenRendering('# {{title}}\n{{ title }}', { title: 'Dune' })).toBe('# Dune\nDune');
	});

	it('renders dates and times with their default formats', () => {
		expect(WhenRendering('{{date}} {{time}}')).toBe('[YYYY-MM-DD] [HH:mm]');
	});

	it('renders dates and times with a custom format, including colons', () => {
		expect(WhenRendering('{{date:dddd}} {{time:HH:mm:ss}}')).toBe('[dddd] [HH:mm:ss]');
	});

	it('leaves text without placeholders unchanged', () => {
		expect(WhenRendering('Plain body')).toBe('Plain body');
	});

	it.each(['<% tp.file.title %>', '{{author}}', '{{title:upper}}', '{{title', 'title}}'])(
		'rejects the unsupported template %j',
		(source) => {
			expect(() => NoteTemplate.of(source)).toThrow(UnsupportedTemplate);
		}
	);
});

function WhenRendering(source: string, { title = 'Dune' }: { title?: string } = {}): string {
	return NoteTemplate.of(source).render({ title, formatDate: (pattern) => `[${pattern}]` });
}
