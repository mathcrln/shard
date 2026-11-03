# Properties

Shard keeps its own index of the vault's properties, in step with the properties Obsidian reports. The index adds what Obsidian does not store: descriptions, a write order, links to models, and creation keywords.

## Index

- [ ] `PRO-001` Add properties Obsidian reports, from registered property types or note frontmatter, to the index without user action.
- [ ] `PRO-002` Keep a property in the index after Obsidian stops reporting it, until the user removes it.
- [ ] `PRO-013` Mark indexed properties that Obsidian no longer reports as not in the vault.
- [ ] `PRO-003` Allow removing a property from the index only when it is not in the vault.
- [ ] `PRO-004` Store the index in Shard's own settings.
- [ ] `PRO-014` Never read or write the user's notes to maintain the index.

## Management

- [ ] `PRO-005` Let the user write an optional description for each property.
- [ ] `PRO-006` Let the user reorder properties by dragging.
- [ ] `PRO-015` Let the user reorder properties with Move up and Move down actions, for touch and keyboard use.
- [ ] `PRO-007` Write properties to new notes in the index order.
- [ ] `PRO-008` Let the user search properties by name or description.
- [ ] `PRO-016` Disable reordering while a property search is active.
- [ ] `PRO-009` Let a property link to a model, so that its values are notes of that model.
- [ ] `PRO-010` Let a property have one creation keyword, such as `by`, unique across properties.

## Open proposals

- [?] `PRO-011` Let creation keywords differ per model, such as `by` meaning author for Book and developer for Game.
- [?] `PRO-012` Accept property values in a creation command, with suggestions from the linked model's notes.
