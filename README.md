# Shard

An action-focused bar for Obsidian, built around user-defined note models.

## Features

- Search that ignores diacritics: `eleve` finds `élève`.
- Find notes by filename, alias, or heading.
- Search commands with `>`, or include them in normal searches through unified search.
- Actions on every result.
- Define models inline in settings and preview their matching notes.
- Search a model's notes and create notes from its template inside the palette.

## Install

Shard is not released yet. Run `pnpm build`, then copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/shard/`. Enable it in **Settings → Community plugins**.

## Use

Bind a hotkey to **Shard: Open bar** in **Settings → Hotkeys**.

Use **Shard: Open files** for normal search and **Shard: Open commands** to open with `>` already entered. Assign your preferred shortcuts, such as **⌘O** and **⌘P**, through Obsidian's hotkey settings. Shard assigns no shortcuts by default.

Normal input searches files. A leading `>` searches commands only; removing it returns to normal search.

Enable **Settings → Shard → Search preferences → Unified search** to include commands in normal searches. This setting is off by default. **Show commands when the bar opens** controls the initial command suggestions when unified search is enabled; `>` always lists commands.

Unified searches mix files, headings, and commands in one relevance-ranked list. Exact matches take priority; recently opened notes receive a smaller ranking boost.

Select a result's actions button or use **Ctrl+K** (**⌘K** on macOS) for the highlighted result's actions.

## Models

Open **Settings → Shard** and select **Add model**. Enter a name, then add conditions directly inside its accordion. Valid edits save automatically; no separate editor or save dialog is needed.

The model's name is its search term. Optional **Keywords** provide extra terms, such as `games` and `videogames` for a model named Game. Add a keyword with Enter or a comma.

Filters use compact target/operator/value rows, with native suggestions for properties, values, folders, tags, and notes. File filters support **links to**, **in folder**, **has tag**, and **has property**, including their negative forms. Property filters support **contains** and **is**. Choose **All the following are true** or **Any of the following are true** to combine filters. Folder and tag options control whether to include subfolders or subtags.

For a Game model, select **Add filter**, choose the `in` property, **contains**, and `[[Games]]`. Property names and existing values come from Obsidian's cached note metadata. This matches notes whose `in` list contains that link, regardless of their folder.

Matching notes appear in a scrollable list directly below completed conditions. The list refreshes as saved conditions or cached note metadata change. Select a note to open it.

Model definitions are saved with Shard's vault-local plugin settings. Cross-device synchronization follows your plugin-settings sync configuration. Renaming or deleting a model definition does not modify its notes.

Under **Creation**, optionally set a **Folder** override (`/` for the vault root) and a Markdown **Template** by note name, vault path, or `[[wikilink]]`. The `.md` extension is optional. An empty folder follows Obsidian's default new-note location, including its current-folder option. The creation folder is independent of membership conditions.

For a model with the keyword `games`:

| Input                            | Behavior                                                                  |
| -------------------------------- | ------------------------------------------------------------------------- |
| `games`                          | Lists matching notes and offers **Create Game**.                          |
| `games horizon`                  | Searches only matching game notes.                                        |
| `games create`                   | Keep typing the title in the palette input.                               |
| `games create Horizon Zero Dawn` | Enter creates the note immediately using the model's folder and template. |

Selecting **Create Game** completes `games create ` in the existing input. There is no title form or confirmation screen. Enter submits a supplied title; typing or dismissing the palette creates no note. A successful creation opens the new note; an existing filename is never overwritten.

Templates preserve their Markdown and frontmatter, including empty properties. Supported placeholders are `{{title}}`, `{{date}}`, `{{date:YYYY-MM-DD}}`, `{{time}}`, and `{{time:HH:mm}}`. Templater expressions and arbitrary attribute placeholders are not supported. Attribute forms, filename patterns, and command-line overrides remain planned.

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
