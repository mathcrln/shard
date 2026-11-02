# Architecture

Shard follows the same project conventions as Depot. Each project owns its code,
dependencies, and releases independently.

## Startup

`src/main.ts` owns the Obsidian plugin lifecycle. It boots the application and
registers features as child components. Keep feature behavior out of this file.

`src/shard.ts` constructs the application services and connects them to Obsidian
adapters. New dependencies are assembled here rather than inside UI components.
Shard boot is asynchronous because it loads the saved settings first.

## Responsibilities

| Location             | Responsibility                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| `src/commands/`      | Stable Obsidian command registration and command-owned cleanup.        |
| `src/queries/`       | Application lookups, search orchestration, ranking, and result limits. |
| `src/search/`        | Search records, results, and the actions offered for each result.      |
| `src/models/`        | Plugin settings, their defaults, and validation of stored data.        |
| `src/text/`          | Framework-independent normalization, matching, and highlight ranges.   |
| `src/platform/`      | Small host contracts and their Obsidian implementations.               |
| `src/ui/bar/`        | Modal hosting, React rendering, keyboard shortcuts, and palette state. |
| `src/ui/settings/`   | The declarative settings tab and its control bindings.                 |
| `tests/`             | Tests that mirror the source paths they exercise.                      |
| `tests/support/`     | External host doubles, application fixtures, and test setup.           |
| `docs/requirements/` | Observable product rules, separate from implementation details.        |

Create an `actions/` directory when application workflows such as note creation
need their own home. Add a setting only with the behavior it controls. Avoid empty architectural layers or unused helper collections.

## Search and interaction

```text
Obsidian command
       |
       +-- Mobile: SuggestModal -> Search.find(query)
       |                |                  |
       |          React result rows <------+
       |                |
       |          Native action menu
       |
       +-- Desktop: BarModal -> BarState -> Search.find(query)
                        |           |
                        +-- React palette and actions panel
                                    |
                                    v
                          Shared result actions
                                    |
                                    v
                          Obsidian platform adapter
```

`Search` owns the results and their order: commands, then notes, then headings.
It reads the live settings on every query, so changes apply without a reload. `Commands` selects the UI host using
Obsidian's `Platform.isMobile` flag. The desktop `BarState` owns its query,
selection, and actions panel. `NativeBarModal` uses the public `SuggestModal`
input, chooser, and keyboard lifecycle, with React rendering the result content.
Native menus expose mobile result actions. The desktop React host remains
independent so it can support richer interactions.

Do not reproduce Obsidian's mobile modal positioning in CSS or track the
visual viewport to reposition its native input. Leave native prompt geometry,
keyboard behavior, and theme styling to Obsidian. Shard's native CSS only formats
its result content and group labels, and suppresses the unwanted close button.

The query, matching code, and palette state use narrow contracts rather than
importing Obsidian implementations. UI code receives the capabilities it needs;
it does not construct application services. Runtime Obsidian imports belong in
host adapters, lifecycle registration, and UI hosts.

## Lifecycle

Use Obsidian child components and registration helpers to own cleanup. The
commands component owns the open palette and closes it during unload. Closing
the modal unmounts its React roots and hides any native action menu. Reopening replaces the previous modal.

## Verification

Vitest separates Node tests from DOM tests through named projects. UI tests and
the plugin lifecycle test run in happy-dom. Pure queries and text behavior run
in Node. `tests/support/obsidian.ts` implements only the host behavior exercised
by the tests; it does not establish compatibility with the real Obsidian app.

Keep setup generic and domain fixtures separate. Test search behavior through
`Search`, rendering through the UI, and startup/cleanup through the plugin.
Manual verification in Obsidian remains necessary for host APIs and mobile UX.

Run the same checks as Depot:

```sh
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build
```
