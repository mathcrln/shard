# Virtual content

Virtual content displays shared Markdown on matching notes without inserting that content into the note files. Model membership rules determine which notes receive the content.

## Shared content

- [ ] `VCT-001` The user can enable or disable virtual content independently of search and note creation.
- [ ] `VCT-002` The user can configure shared virtual content for a model.
- [ ] `VCT-003` Shared content applies to notes matching that model's membership rules.
- [ ] `VCT-004` Displaying virtual content leaves the note file unchanged.
- [ ] `VCT-005` Editing shared virtual content changes what is displayed on matching notes without editing those notes.
- [ ] `VCT-006` Disabling virtual content removes its displayed content without changing the notes.

## Open proposals

- [?] `VCT-007` Virtual content can be entered directly in settings.
- [?] `VCT-008` Virtual content can come from a Markdown note in the vault.
- [?] `VCT-009` The user can choose a header or footer placement for virtual content.
- [?] `VCT-010` Virtual content can be displayed in a sidebar.
- [?] `VCT-011` Virtual content can be attached to a selected heading within a note.
- [?] `VCT-012` Virtual content can render native Bases embeds.
- [?] `VCT-013` The user can define virtual-content rules independently of a model.
- [?] `VCT-014` Virtual content is displayed in both Reading mode and Live Preview.

Dataview query execution, arbitrary scripts, and custom rendering engines are not implied by Markdown display. Shard's [product boundaries](platform.md#product-boundaries) apply to this capability.
