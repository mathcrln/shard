# Bar

The bar is the one input the user types into, and the list under it.

## Opening

- [ ] `BAR-001` Open the bar with a command.
- [ ] `BAR-024` Let the user assign hotkeys to Shard's entry commands through Obsidian's hotkey settings.
- [ ] `BAR-025` Assign no entry-command hotkeys by default.
- [ ] `BAR-003` Focus the input when the bar opens.
- [ ] `BAR-004` Open the bar in the window the user is working in, including a pop-out window.
- [ ] `BAR-005` Close the bar on Escape.

## Search modes

- [ ] `BAR-042` Open the bar without a command prefix from a dedicated file-search entry command.
- [ ] `BAR-043` Open the bar with `>` already entered from a dedicated command-search entry command.
- [ ] `BAR-044` Switch between files and commands as the user edits the input, without closing the bar.
- [ ] `BAR-045` Exclude commands from Files results in split mode.
- [ ] `BAR-046` Exclude files from Commands results in split mode.
- [ ] `BAR-047` Let the user enable or disable a unified view in settings.
- [ ] `BAR-048` Display matching file and command results together in the unified view.
- [ ] `BAR-049` Identify in the input placeholder whether the query searches files, commands, or both.
- [ ] `BAR-050` Show the selected model scope in the bar.
- [ ] `BAR-067` Disable unified search by default.

The `>` prefix selects command-only search as defined in [search](search.md#prefixes), including when unified search is enabled. Normal input searches files and also includes commands when unified search is enabled. Entry commands allow familiar bindings such as **⌘O** for files and **⌘P** for commands without assigning them automatically. The bar has no mode selector or cycling shortcut.

## Keyboard

- [ ] `BAR-006` Move through results with the arrow keys.
- [ ] `BAR-007` Run the highlighted result's main action on Enter.
- [ ] `BAR-026` Let the user open the highlighted result's actions from the keyboard.
- [ ] `BAR-009` Show each action's shortcut when it has one.
- [ ] `BAR-010` Make every action reachable without the mouse.

## Results

- [ ] `BAR-011` Group split search results by kind, with a heading for each group.
- [ ] `BAR-027` Let a result show an icon.
- [ ] `BAR-028` Show each result's title.
- [ ] `BAR-029` Let a result show a description.
- [ ] `BAR-030` Identify each result's group.
- [ ] `BAR-031` Say that no results match when the result list is empty.
- [ ] `BAR-032` Offer a next step in an empty result list when one exists.
- [ ] `BAR-033` Report a search failure as an error rather than an empty match list.
- [ ] `BAR-034` Report an action failure to the user.
- [ ] `BAR-015` Show a placeholder, not a blank list, while results load slowly.

## Result images

- [ ] `BAR-057` Let the user choose the frontmatter property used for result images, such as `cover`.
- [ ] `BAR-058` Display the image referenced by the configured image property on desktop note results.
- [ ] `BAR-059` Keep notes without an image property available in search results.
- [ ] `BAR-060` Display the note result even when its image is unavailable.
- [ ] `BAR-061` Display matching result text without waiting for images to load.
- [?] `BAR-062` Display images from the configured property on mobile note results.
- [ ] `BAR-063` Support links to image files inside the vault as result images.
- [ ] `BAR-064` Support remote image URLs as result images.
- [?] `BAR-065` Support Depot attachment references such as `cosmos://2025/04/example.webp` as result images.
- [ ] `BAR-066` Let the user enable or disable result image previews.

Local image links and web URLs are supported sources. Depot attachment support requires an integration decision. Image loading follows the [network and privacy requirements](platform.md#network-and-privacy).

## Look

- [ ] `BAR-016` Render the bar correctly in light and dark themes.
- [ ] `BAR-040` Use the active theme's colors in the bar.
- [ ] `BAR-041` Use the active theme's fonts in the bar.
- [ ] `BAR-018` Respect the user's reduced-motion setting in the bar.
- [ ] `BAR-019` Keep the bar readable at the user's Obsidian font size.

## Actions

- [ ] `BAR-020` Give every result at least one action.
- [ ] `BAR-035` Offer opening a note result in the current tab.
- [ ] `BAR-036` Offer opening a note result in a new tab.
- [ ] `BAR-037` Offer opening a note result to the side.
- [ ] `BAR-038` Offer copying a link to a note result.
- [ ] `BAR-039` Offer revealing a note result in the file explorer.
- [ ] `BAR-022` Change a result's main action by the modifier key the user holds.
- [ ] `BAR-023` Let the user configure model-specific actions for note results.

## Mobile interaction

- [ ] `BAR-053` Make result actions reachable by touch without a hardware keyboard.
- [ ] `BAR-054` Keep the search input visible above the on-screen keyboard.
- [ ] `BAR-055` Let the user scroll the results while the on-screen keyboard is open.
- [ ] `BAR-056` Let the user complete creation forms by touch while the on-screen keyboard is open.

## Retired identifiers

| Identifier | Reason                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| `BAR-002`  | User-assigned hotkeys and the absence of default bindings are specified separately by BAR-024 and BAR-025. |
| `BAR-008`  | Opening actions by keyboard is specified by BAR-026; executing them is covered by BAR-010.                 |
| `BAR-012`  | Result presentation is specified separately by BAR-027 through BAR-030.                                    |
| `BAR-013`  | Empty-state feedback and next steps are specified separately by BAR-031 and BAR-032.                       |
| `BAR-014`  | Search and action failures are specified separately by BAR-033 and BAR-034.                                |
| `BAR-017`  | Theme colors and fonts are specified separately by BAR-040 and BAR-041.                                    |
| `BAR-021`  | Note actions are specified separately by BAR-035 through BAR-039.                                          |
| `BAR-051`  | Search modes are selected through the query prefix; the dedicated keyboard toggle is removed.              |
| `BAR-052`  | Search modes are selected through the query prefix; the dedicated touch toggle is removed.                 |
