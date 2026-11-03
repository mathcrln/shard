# Commands

Commands are the actions Obsidian and its plugins register.

## Listing

- [ ] `CMD-001` List every command Obsidian and plugins offer in the bar.
- [ ] `CMD-002` Group commands by the plugin that provides them.
- [ ] `CMD-003` Exclude commands that cannot run in the current context from runnable results.
- [ ] `CMD-004` Show a command registered after startup without restarting.
- [ ] `CMD-005` Remove a command from the list when its plugin is disabled.
- [ ] `CMD-006` Show a command's hotkey when it has one.

## Running

- [ ] `CMD-007` Run a selected command in the context the user was in before opening the bar.
- [ ] `CMD-008` Show the failure when a command fails.

## Ranking

- [ ] `CMD-009` Rank commands the user runs often higher.
- [ ] `CMD-010` Rank recently run commands higher.
- [ ] `CMD-011` Show the user's most used commands first, not an alphabetical wall, for the `>` prefix with an empty query.

## Organizing

- [ ] `CMD-012` Let the user pin a command so it is listed first.
- [ ] `CMD-013` Let the user hide a command so it is never listed.
- [ ] `CMD-014` Let the user give a command an alias that also finds it.
- [ ] `CMD-019` Let the user view hidden commands.
- [ ] `CMD-020` Let the user restore a hidden command to search results.
- [?] `CMD-016` Narrow the list to a plugin's commands when the user types the plugin's name followed by a space.

## Stability

- [ ] `CMD-017` Keep pins, hides, and aliases by command id across restarts.
- [ ] `CMD-018` Keep a pin, hide, or alias for a command that no longer exists instead of deleting it.

## Contextual model commands

- [ ] `CMD-021` Let a model expose commands applicable to its notes.
- [ ] `CMD-022` Determine the active note's model from the user's membership rules.
- [ ] `CMD-023` Let the user enable or disable contextual model commands independently of contextual result suggestions.
- [ ] `CMD-024` Let the user choose a label for a model's contextual command.
- [ ] `CMD-025` Run a contextual command on the note that was active before the bar opened.
- [ ] `CMD-026` Keep global Obsidian command search available when contextual commands are disabled.
- [?] `CMD-027` Offer commands from every matching model together when the active note matches several models.

## Retired identifiers

| Identifier | Reason                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| `CMD-015`  | Viewing hidden commands and restoring them are specified separately by CMD-019 and CMD-020. |
