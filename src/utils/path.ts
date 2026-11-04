const FORBIDDEN = /[\\/<>:"|?*\p{Cc}]/u;
const WINDOWS_DEVICE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/iu;

export const Path = {
	normalize(path: string): string {
		return path
			.split(/[\\/]/u)
			.map((segment) => segment.trim())
			.filter(Boolean)
			.join('/');
	},

	isPortable(path: string): boolean {
		return path.split('/').every(isPortableName);
	},

	join(...segments: string[]): string {
		return segments.filter(Boolean).join('/');
	},

	isWithin(path: string, folder: string): boolean {
		return path === folder || path.startsWith(`${folder}/`);
	},

	ancestors(path: string): string[] {
		const segments = path.split('/').slice(0, -1);

		return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
	},
};

function isPortableName(name: string): boolean {
	return name !== '' && !FORBIDDEN.test(name) && !/[. ]$/u.test(name) && !WINDOWS_DEVICE.test(name);
}
