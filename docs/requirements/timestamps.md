# Timestamps

Timestamp maintenance is an optional vault-wide capability. It applies to eligible Markdown notes independently of model membership and uses file changes detected by Obsidian.

## Configuration

- [ ] `TIM-001` Let the user enable or disable automatic timestamp maintenance.
- [ ] `TIM-002` Maintain timestamps on notes that belong to no model.
- [ ] `TIM-003` Let the user choose the modification-date property name.
- [ ] `TIM-004` Let the user choose the creation-date property name.
- [ ] `TIM-005` Let the user choose the timestamp format.
- [ ] `TIM-006` Let the user exclude folders from timestamp maintenance.
- [ ] `TIM-007` Let the user disable creation-date maintenance independently of modification-date maintenance.

## Modification dates

- [ ] `TIM-008` Update an eligible note's modification-date property when Obsidian detects a file change.
- [ ] `TIM-009` Set the modification-date value from the file modification time reported by Obsidian.
- [ ] `TIM-010` Maintain timestamps for changes detected from sync.
- [ ] `TIM-011` Maintain timestamps for changes detected from other plugins.
- [ ] `TIM-012` Never let a timestamp write trigger a repeating chain of timestamp writes.
- [ ] `TIM-013` Never advance the file's reported modification time solely to maintain its timestamp property.

## Creation dates

- [ ] `TIM-014` Fill a missing creation-date value from the file creation time reported by Obsidian.
- [ ] `TIM-015` Preserve an existing creation-date value.

An attribute default such as `added = today` is evaluated during [model creation](models.md#attributes-and-defaults). Timestamp maintenance preserves that existing value when configured to use the same property.

## Preservation

- [ ] `TIM-016` Preserve the note body during timestamp maintenance.
- [ ] `TIM-017` Preserve unrelated frontmatter values during timestamp maintenance.
- [ ] `TIM-018` Report invalid frontmatter when it prevents timestamp maintenance.
- [ ] `TIM-026` Leave invalid frontmatter unchanged.
- [ ] `TIM-019` Maintain timestamps only on Markdown notes.
- [ ] `TIM-020` Stop automatic timestamp writes when timestamp maintenance is disabled.

## Open proposals

- [?] `TIM-021` Let the user configure a minimum interval between modification-date writes.
- [?] `TIM-022` Let the user fill missing timestamps across existing notes through an explicit bulk action.
- [?] `TIM-023` Let creation-date maintenance have folder exclusions separate from the general timestamp exclusions.
- [?] `TIM-024` Let the user store timestamps as Unix numbers instead of formatted date text.
- [?] `TIM-025` Ignore filesystem notifications when note content has not changed.

These proposals do not determine the behavior of the required change detection or the choice of timestamp property names.
