# Shard

An action-focused bar for Obsidian. Find a note, run a command, or create a note from a model, all from one input.

## Features

- Search that ignores diacritics: `eleve` finds `élève`.
- Notes, aliases, headings, and tags in one list.
- Actions on every result.

## Install

Shard is not released yet. Run `pnpm build`, then copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/shard/`. Enable it in **Settings → Community plugins**.

## Use

Bind a hotkey to **Shard: Open bar** in **Settings → Hotkeys**.

Select a result's actions button or use **Ctrl+K** (**⌘K** on macOS) for the highlighted result's actions.

## Development

Use Node.js 22.12 or later and the pnpm version declared in `package.json`.

```sh
pnpm install
pnpm dev
```

See [Contributing](CONTRIBUTING.md) and [Architecture](docs/architecture.md).

## Appearance

On mobile, Shard uses Obsidian's native suggestion modal and input. Obsidian
handles its sheet layout, keyboard positioning, selection, fonts, and theme.
Result actions use Obsidian's menu. There is no additional close button.

Desktop keeps Shard's React palette and actions panel, using Obsidian's theme
variables. Escape and the modal backdrop dismiss the palette on both platforms.

Both presentations use the same search engine and result actions. Mobile UI
constraints do not limit future desktop scopes, forms, or richer actions.
