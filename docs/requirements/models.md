# Models

A model describes one kind of note: what it holds, where it goes, how it is named, and what it starts with.

## Defining

- [ ] `MDL-001` The user can define any number of models.
- [ ] `MDL-002` Each model has a name that is unique among the models.
- [ ] `MDL-003` A model declares its properties, each with a name and a type.
- [ ] `MDL-004` A model declares the folder its notes are created in.
- [ ] `MDL-005` A model declares a filename pattern.
- [ ] `MDL-006` A model declares a body template.
- [ ] `MDL-007` A model can give a property a default value.
- [ ] `MDL-008` A model can mark a property as required.
- [ ] `MDL-009` Models are stored in the vault, so they sync with it.
- [ ] `MDL-010` A model that is invalid is reported with the reason, and never silently ignored.

## Templating

- [ ] `MDL-011` Filename pattern, folder, defaults, and body can use a property's value as `{{name}}`.
- [ ] `MDL-012` Templates can use today's date and time, with a chosen format.
- [ ] `MDL-013` Templates can slugify a value.
- [ ] `MDL-014` An unknown `{{name}}` in a template is reported, not left blank.

## Creating

- [ ] `MDL-015` The user can create a note from a model from the bar.
- [ ] `MDL-016` The user is asked only for the properties that have no value yet.
- [ ] `MDL-017` The new note is created in the model's folder, with the model's properties in its frontmatter and its body from the template.
- [ ] `MDL-018` The folder is created if it does not exist.
- [ ] `MDL-019` Creating a note never overwrites an existing note.
- [ ] `MDL-020` When the filename is taken, the user can open the existing note or create one with a numbered name.
- [ ] `MDL-021` After creating, the user chooses whether to open the note, or the model decides.
- [ ] `MDL-022` Property values written to frontmatter keep their type.

## Beyond creating

- [?] `MDL-023` A model can append to a section of an existing note instead of creating one.
- [?] `MDL-024` A model can run a command after creating the note.
- [?] `MDL-025` A model can list its notes.
