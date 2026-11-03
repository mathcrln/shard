const FORBIDDEN = /[\\<>:"|?*]/;

export const Path = {
	isSafe(path: string): boolean {
		return (
			path !== '' &&
			!FORBIDDEN.test(path) &&
			[...path].every((character) => character.charCodeAt(0) >= 32) &&
			path.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..')
		);
	},

	isWithin(path: string, folder: string): boolean {
		return path === folder || path.startsWith(`${folder}/`);
	},

	ancestors(path: string): string[] {
		const segments = path.split('/').slice(0, -1);

		return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
	},

	relative(from: string, to: string): string {
		const base = from.split('/').slice(0, -1);
		const target = to.split('/');

		while (base.length > 0 && base[0] === target[0]) {
			base.shift();
			target.shift();
		}

		return [...base.map(() => '..'), ...target].join('/');
	},
};
