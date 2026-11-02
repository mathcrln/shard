# Timestamps

Timestamp maintenance is an optional vault-wide capability. It applies to eligible Markdown notes independently of model membership and uses file changes detected by Obsidian.

## Configuration

- [ ] `TIM-001` The user can enable or disable automatic timestamp maintenance.
- [ ] `TIM-002` Timestamp maintenance can apply to notes that belong to no model.
- [ ] `TIM-003` The user can choose the modification-date property name.
- [ ] `TIM-004` The user can choose the creation-date property name.
- [ ] `TIM-005` The user can choose the timestamp format.
- [ ] `TIM-006` The user can exclude folders from timestamp maintenance.
- [ ] `TIM-007` The user can disable creation-date maintenance independently of modification-date maintenance.

## Modification dates

- [ ] `TIM-008` A file change detected by Obsidian updates the modification-date property of an eligible note.
- [ ] `TIM-009` The modification-date value reflects the file modification time reported by Obsidian.
- [ ] `TIM-010` Changes detected from sync are eligible for timestamp maintenance.
- [ ] `TIM-011` Changes detected from other plugins are eligible for timestamp maintenance.
- [ ] `TIM-012` A timestamp write does not trigger a repeating chain of timestamp writes.
- [ ] `TIM-013` Timestamp maintenance does not advance the file's reported modification time solely because its timestamp property was maintained.

## Creation dates

- [ ] `TIM-014` Creation-date maintenance fills a missing creation-date value using the file creation time reported by Obsidian.
- [ ] `TIM-015` Creation-date maintenance preserves an existing creation-date value.

An attribute default such as `added = today` is evaluated during [model creation](models.md#attributes-and-defaults). Timestamp maintenance preserves that existing value when configured to use the same property.

## Preservation

- [ ] `TIM-016` Timestamp maintenance preserves the note body.
- [ ] `TIM-017` Timestamp maintenance preserves unrelated frontmatter values.
- [ ] `TIM-018` Invalid frontmatter is reported when it prevents timestamp maintenance.
- [ ] `TIM-026` Timestamp maintenance leaves invalid frontmatter unchanged.
- [ ] `TIM-019` Timestamp maintenance applies only to Markdown notes.
- [ ] `TIM-020` Disabling timestamp maintenance stops automatic timestamp writes.

## Open proposals

- [?] `TIM-021` The user can configure a minimum interval between modification-date writes.
- [?] `TIM-022` The user can fill missing timestamps across existing notes through an explicit bulk action.
- [?] `TIM-023` Creation-date maintenance can have folder exclusions separate from the general timestamp exclusions.
- [?] `TIM-024` The user can store timestamps as Unix numbers instead of formatted date text.
- [?] `TIM-025` Timestamp maintenance ignores filesystem notifications when note content has not changed.

These proposals do not determine the behavior of the required change detection or the choice of timestamp property names.
