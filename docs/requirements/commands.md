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
- [ ] `CMD-015` The user can see and undo what they hid.
- [?] `CMD-016` Typing a plugin's name followed by a space narrows the list to that plugin's commands.

## Stability

- [ ] `CMD-017` Pins, hides, and aliases are kept by command id and survive restarts.
- [ ] `CMD-018` A pin, hide, or alias for a command that no longer exists is kept, not deleted.
