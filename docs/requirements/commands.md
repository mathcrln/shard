# Commands

Commands are the actions Obsidian and its plugins register.

## Listing

- [ ] `CMD-001` The bar lists every command Obsidian and plugins offer.
- [ ] `CMD-002` Commands are grouped by the plugin that provides them.
- [ ] `CMD-003` A command that cannot run in the current context is not listed as runnable.
- [ ] `CMD-004` A command registered after startup appears without restarting.
- [ ] `CMD-005` A command removed by disabling its plugin disappears.
- [ ] `CMD-006` A command shows its hotkey when it has one.

## Running

- [ ] `CMD-007` Selecting a command runs it in the context the user was in before opening the bar.
- [ ] `CMD-008` A command that fails shows the failure.

## Ranking

- [ ] `CMD-009` Commands the user runs often rank higher.
- [ ] `CMD-010` Recently run commands rank higher.
- [ ] `CMD-011` With the `>` prefix and an empty query, the bar shows the user's most used commands first, not an alphabetical wall.

## Organizing

- [ ] `CMD-012` The user can pin a command so it is listed first.
- [ ] `CMD-013` The user can hide a command so it is never listed.
- [ ] `CMD-014` The user can give a command an alias that also finds it.
- [ ] `CMD-019` The user can view hidden commands.
- [ ] `CMD-020` The user can restore a hidden command to search results.
- [?] `CMD-016` Typing a plugin's name followed by a space narrows the list to that plugin's commands.

## Stability

- [ ] `CMD-017` Pins, hides, and aliases are kept by command id and survive restarts.
- [ ] `CMD-018` A pin, hide, or alias for a command that no longer exists is kept, not deleted.

## Contextual model commands

- [ ] `CMD-021` A model can expose commands applicable to its notes.
- [ ] `CMD-022` The active note's model is determined from the user's membership rules.
- [ ] `CMD-023` The user can enable or disable contextual model commands independently of contextual result suggestions.
- [ ] `CMD-024` The user can choose a label for a model's contextual command.
- [ ] `CMD-025` A contextual command acts on the note active before the bar opened.
- [ ] `CMD-026` Disabling contextual commands leaves global Obsidian command search available.
- [?] `CMD-027` When the active note matches several models, commands from every matching model are offered together.

## Retired identifiers

| Identifier | Reason                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| `CMD-015`  | Viewing hidden commands and restoring them are specified separately by CMD-019 and CMD-020. |
