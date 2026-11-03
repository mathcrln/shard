# Virtual content

Virtual content displays shared Markdown on matching notes without inserting that content into the note files. Model membership rules determine which notes receive the content.

## Shared content

- [ ] `VCT-001` Let the user enable or disable virtual content independently of search and note creation.
- [ ] `VCT-002` Let the user configure shared virtual content for a model.
- [ ] `VCT-003` Apply shared content to notes matching the model's membership rules.
- [ ] `VCT-004` Leave the note file unchanged when displaying virtual content.
- [ ] `VCT-005` Update what matching notes display when shared virtual content is edited, without editing those notes.
- [ ] `VCT-006` Remove displayed virtual content without changing the notes when virtual content is disabled.

## Open proposals

- [?] `VCT-007` Let the user enter virtual content directly in settings.
- [?] `VCT-008` Take virtual content from a Markdown note in the vault.
- [?] `VCT-009` Let the user choose a header or footer placement for virtual content.
- [?] `VCT-010` Display virtual content in a sidebar.
- [?] `VCT-011` Attach virtual content to a selected heading within a note.
- [?] `VCT-012` Render native Bases embeds in virtual content.
- [?] `VCT-013` Let the user define virtual-content rules independently of a model.
- [?] `VCT-014` Display virtual content in both Reading mode and Live Preview.

Dataview query execution, arbitrary scripts, and custom rendering engines are not implied by Markdown display. Shard's [product boundaries](platform.md#product-boundaries) apply to this capability.
