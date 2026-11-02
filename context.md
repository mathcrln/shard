# Shard — session handoff

Obsidian plugin (`id: shard`, by mathcrln): an action-focused bar for the vault. It finds notes, runs commands, and creates notes from models, all from one input. Inspired by Ariane (`@madinco/ariane`, a React command palette), with a React UI hosted inside an Obsidian modal.

This folder is the plugin itself (scaffolded from Depot) plus its plan. Built so far: the switcher first pass. See `docs/architecture.md` for the module boundaries shared in style with Depot. Dependencies are installed separately by the user.

## Working with the user

- Keep everything short, simple, human: replies, UI copy, docs. No redundancy.
- Brainstorm ≠ approval: don't build until they say go.
- Never commit or branch unless asked.
- Code follows the `fluent-design` (call site first) and `testing-approach` (TDD, Given/When helpers, mirrored tests) skills. Names over comments.
- Requirements live in `docs/requirements/*.md` (stable IDs, never reused, `[?]` while unconfirmed).
- Roadmap keeps a `## Done` section, like Depot's.

## Docs in this folder

- `vision.md`: what Shard is and why.
- `ROADMAP.md`: now, next, later.
- `docs/requirements/`: the rules, one file per area (`search`, `bar`, `commands`, `models`, `intents`, `platform`).

## Built (112 tests; native mobile host awaits on-device verification)

- **Text:** `Folded` (diacritics, case, `ß`/`æ` expansion, index map back to the original), `Matcher` (words in any order, exact then scattered letters, scores, highlight ranges), `segmentsOf`, `mergeRanges`.
- **Search:** `Search.find(query)` returns grouped `Result`s: recent notes (empty query), notes by name and alias, headings (2+ letters). Recency boosts ranking. Every result carries its actions (open, new tab, side, copy link).
- **Bar:** desktop keeps the React `BarView`, `ResultList`, `ActionsPanel`, and pure `BarState`. Mobile uses `NativeBarModal extends SuggestModal<Result>`, native input and chooser behavior, React `NativeResult` content, and native `Menu` actions. Both use the same `Search` and result action definitions. Custom visual-viewport positioning and both close controls were removed.
- **Platform:** `Vault`, `Recents`, `Workspace`, and `Commands` contracts live alongside their Obsidian adapters in `src/platform/`. `Shard.boot(app)` wires these into `queries/Search`; `main.ts` registers the lifecycle-managed commands component.
- **Command:** `Open bar`, with no default hotkey.
- **Commands:** normal queries include available commands; `>` restricts the search to commands.
- **Not built yet:** other prefixes, tags, reveal in explorer, models, intents, settings, an index cache for large vaults.

## Verification and dependencies

The user will run `pnpm install` in this folder after the structure refactor to reconcile the
lockfile with the exact dependency pins and TypeScript 6.0.3. Installation is left
to the user. TypeScript 6 matches Depot and is supported by the existing ESLint
stack; the previously installed TypeScript 7 prevents `pnpm lint` from starting.

Then run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test:run`, and
`pnpm build`. Vitest uses named Node and happy-dom projects, with Obsidian host
doubles in `tests/support/`. The palette and matching tests retain their behavior;
the plugin lifecycle tests cover command registration, opening, and unload.

## Why it exists

- Obsidian's quick switcher and command palette are basic. QuickSwitcher++ is better but has the same gaps: no diacritic-insensitive search (`é è à`), many small rough edges, no per-result actions.
- QuickAdd covers note creation but is heavy and has quirks. Shard keeps only its core idea, in a leaner form.
- Ariane already solved the hard parts: intent grammar (`<model> <verb> <name>`), grouping, matching, a per-record actions panel.

## Key decisions (and discarded options)

- **Two UI hosts, shared application behavior.** Mobile uses the public `SuggestModal` and `Menu` APIs so Obsidian owns keyboard layout and native theme styling. Desktop retains the React palette and actions panel for future Raycast/Ariane-style interactions. React also renders the mobile suggestion content. Neither host shows an added close control.
- **Native mobile behavior.** QuickSwitcher++ was inspected in `.local/obsidian-switcher-plus`: it extends the internal core quick switcher, itself a `SuggestModal`. Shard uses the public `SuggestModal` directly and does not inherit core plugin internals. Do not reintroduce a custom mobile `Modal` layout or viewport positioning.
- **Sources become search providers.** Notes, headings, tags, commands, recents. Each has a prefix: `>` commands, `#` tags and headings, `@` (to define).
- **Own matcher.** Normalize to NFD, strip combining marks, lowercase, for query and text. Highlighting needs a per-character index map because NFD changes the length. Don't use `prepareFuzzySearch`.
- **Commands come from `app.commands`.** `commands`, `listCommands()`, `executeCommandById(id)`. Not in the public typings (needs a shim), but long stable and used by other plugins. Ids are `pluginId:commandId`, so grouping by plugin is free. `checkCallback` tells which commands apply now.
- **Models, not QuickAdd.** A model defines typed properties, a destination folder, a filename pattern and a body template, and creates notes. No migration path and no QuickAdd bridge. Users who want QuickAdd keep it.
- **Plain templating, no expression engine.** `{{title}}`, `{{date}}`, a few formatters (`slug`, date formats). An evaluator is added only if a real need shows up.
- **Build order.** Switcher first (it is the daily driver and must beat QuickSwitcher++), then commands, then models and intents.
- **Popout windows.** Use `activeDocument` and `activeWindow`, never `document` and `window` globals.
- **Hotkey.** No hardcoded `⌘K`; it clashes with Obsidian. Register with `addCommand` and let the user bind it.
- **Name.** Shard (obsidian is glass; a result is a fragment). Rejected: Clew, Theseus, Daedalus, Naxos, Tephra, Flint. Don't put "Obsidian" in the name (plugin guidelines). Not yet checked against the community plugin list or npm.

## Open ideas, not decided

- **Formula fields.** Separate package, outside Shard. A `Person` model declares `full_name: first_name + " " + last_name` once; every note of that model shows it. Frontmatter holds real data only.
    - Bases exposes no public evaluator for arbitrary strings. `BasesViewConfig.getEvaluatedFormula(view, key)` only evaluates formulas in a `.base` config, from inside a registered Bases view. Reusing Obsidian's engine would mean a custom Bases view (`registerBasesView`) that renders model formulas as columns. That works inside Bases, not in frontmatter.
    - Showing it in the properties panel means patching undocumented DOM (`.metadata-property[data-property-key]`). Fragile.
- **Organizing user commands.** Group by plugin, scope with a prefix (`git ` drills into that plugin), pin, hide, alias, frecency. Which of these ship first is open.
- **User-defined shards vs models.** "Shard" may also name the definitions themselves. Undecided.
- **Where definitions live.** A vault file (syncs, versioned) is the lean option. Format open (JSON, YAML, note frontmatter).
- **Script escape hatch** for what declarative models can't express.
- **Prefix `@`.** Meaning to decide.

## Unverified

- Everything about Obsidian internals: `app.commands` shape, `checkCallback` behavior, mobile modal behavior.
- Whether Bases has gained a public evaluator or custom function API since the 1.10.2 typings.

## Gotchas expected

- NFD length changes break naive highlight ranges.
- Radix and cmdk portal into the main `document`; irrelevant once native, which is the point.
- The quick switcher's own hotkeys and Obsidian's `Modal` keymap scope can swallow keys; use `Scope` on the modal.
- Mobile: no hover, small screens, virtual keyboard resizes the viewport.

## External references checked

- Obsidian API docs: `BasesView`, `BasesViewConfig.getEvaluatedFormula` (added 1.10.2), `registerBasesView`. No custom property widget API seen in the typings read (the fetch was truncated).
- Forum request "Bases: API for plugins to add custom functions": no sign it shipped.
- Sibling plugin and conventions: `~/Developer/obsidian-depot` (AGENTS.md, `.local/house-style`, requirements format).
- Ariane source: `src/engine/` (entries, groups, intent, suggestions), `src/utils/match.ts`, `src/definitions/`.
