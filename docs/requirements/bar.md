# Bar

The bar is the one input the user types into, and the list under it.

## Opening

- [ ] `BAR-001` The user can open the bar with a command.
- [ ] `BAR-024` The user can assign hotkeys to Shard's entry commands through Obsidian's hotkey settings.
- [ ] `BAR-025` Shard assigns no entry-command hotkeys by default.
- [ ] `BAR-003` Opening the bar focuses the input.
- [ ] `BAR-004` The bar opens in the window the user is working in, including a pop-out window.
- [ ] `BAR-005` Escape closes the bar.

## Search modes

- [ ] `BAR-042` A dedicated file-search entry command opens the bar without a command prefix.
- [ ] `BAR-043` A dedicated command-search entry command opens the bar with `>` already entered.
- [ ] `BAR-044` The user can switch between files and commands by editing the input without closing the bar.
- [ ] `BAR-045` In split mode, Files results contain no commands.
- [ ] `BAR-046` In split mode, Commands results contain no files.
- [ ] `BAR-047` The user can enable or disable a unified view in settings.
- [ ] `BAR-048` The unified view displays matching file and command results together.
- [ ] `BAR-049` The input placeholder identifies whether the query searches files, commands, or both.
- [ ] `BAR-050` The selected model scope is visible in the bar.
- [ ] `BAR-067` Unified search is disabled by default.

The `>` prefix selects command-only search as defined in [search](search.md#prefixes), including when unified search is enabled. Normal input searches files and also includes commands when unified search is enabled. Entry commands allow familiar bindings such as **⌘O** for files and **⌘P** for commands without assigning them automatically. The bar has no mode selector or cycling shortcut.

## Keyboard

- [ ] `BAR-006` The arrow keys move through results.
- [ ] `BAR-007` Enter runs the highlighted result's main action.
- [ ] `BAR-026` The user can open the highlighted result's actions from the keyboard.
- [ ] `BAR-009` Each action shows its shortcut when it has one.
- [ ] `BAR-010` Every action is reachable without the mouse.

## Results

- [ ] `BAR-011` Split search results are grouped by kind, with a heading for each group.
- [ ] `BAR-027` A result can show an icon.
- [ ] `BAR-028` A result shows its title.
- [ ] `BAR-029` A result can show a description.
- [ ] `BAR-030` A result identifies its group.
- [ ] `BAR-031` An empty result list says that no results match.
- [ ] `BAR-032` An empty result list offers a next step when one exists.
- [ ] `BAR-033` A search failure is reported as an error rather than an empty match list.
- [ ] `BAR-034` An action failure is reported to the user.
- [ ] `BAR-015` Results that load slowly show a placeholder, not a blank list.

## Result images

- [ ] `BAR-057` The user can choose the frontmatter property used for result images, such as `cover`.
- [ ] `BAR-058` Desktop note results can display the image referenced by the configured image property.
- [ ] `BAR-059` A note without an image property remains available in search results.
- [ ] `BAR-060` An unavailable image does not prevent the note result from being displayed.
- [ ] `BAR-061` Image loading does not delay the display of matching result text.
- [?] `BAR-062` Mobile note results can display images from the configured property.
- [ ] `BAR-063` Result images support links to image files inside the vault.
- [ ] `BAR-064` Result images support remote image URLs.
- [?] `BAR-065` Result images support Depot attachment references such as `cosmos://2025/04/example.webp`.
- [ ] `BAR-066` The user can enable or disable result image previews.

Local image links and web URLs are supported sources. Depot attachment support requires an integration decision. Image loading follows the [network and privacy requirements](platform.md#network-and-privacy).

## Look

- [ ] `BAR-016` The bar looks right in light and dark themes.
- [ ] `BAR-040` The bar uses the active theme's colors.
- [ ] `BAR-041` The bar uses the active theme's fonts.
- [ ] `BAR-018` The bar respects the user's reduced-motion setting.
- [ ] `BAR-019` The bar is readable at the user's Obsidian font size.

## Actions

- [ ] `BAR-020` Every result has at least one action.
- [ ] `BAR-035` A note result offers opening the note in the current tab.
- [ ] `BAR-036` A note result offers opening the note in a new tab.
- [ ] `BAR-037` A note result offers opening the note to the side.
- [ ] `BAR-038` A note result offers copying a link to the note.
- [ ] `BAR-039` A note result offers revealing the note in the file explorer.
- [ ] `BAR-022` The main action of a result can be changed by the modifier key the user holds.
- [ ] `BAR-023` The user can configure model-specific actions for note results.

## Mobile interaction

- [ ] `BAR-053` Result actions are reachable by touch without a hardware keyboard.
- [ ] `BAR-054` The search input remains visible above the on-screen keyboard.
- [ ] `BAR-055` The user can scroll the results while the on-screen keyboard is open.
- [ ] `BAR-056` Creation forms can be completed by touch while the on-screen keyboard is open.

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
