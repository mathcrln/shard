/** Turns typed text into a portable note filename: `Hello: World` becomes `Hello - World`. */
export function sanitizeTitle(input: string): string {
	return input
		.replace(/\.md$/iu, '')
		.replace(/\s*[:/\\|]\s*/gu, ' - ')
		.replace(/[<>"?*#^[\]\p{Cc}]/gu, '')
		.replace(/\s+/gu, ' ')
		.trim()
		.replace(/^[\s-]+|[\s.-]+$/gu, '');
}
