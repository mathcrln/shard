export const shortcuts = ['Mod+Enter', 'Mod+Alt+Enter'] as const;

export type Shortcut = (typeof shortcuts)[number];

export type Action = { name: string; shortcut?: Shortcut; keepOpen?: boolean; run(): void };
