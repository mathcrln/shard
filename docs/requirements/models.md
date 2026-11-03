# Models

A model is a user-defined kind of note. It describes membership, attributes, creation rules, and available actions. Membership and creation location are independent: models can share a folder, and existing notes can belong to a model wherever they are stored.

## Defining

- [ ] `MDL-001` Let the user define any number of models.
- [ ] `MDL-002` Require each model's name to be unique among the models.
- [ ] `MDL-039` Let the user define a model through Shard's settings.
- [ ] `MDL-040` Let the user edit a model through Shard's settings.
- [ ] `MDL-084` Expand and edit each model inline without leaving the settings page.
- [ ] `MDL-085` Preview matching notes in a scrollable list beneath the model's membership conditions.
- [ ] `MDL-086` Show no error alerts for incomplete membership conditions before the user interacts with the field.
- [ ] `MDL-041` Let a model have multiple optional keywords that select it in the bar.
- [ ] `MDL-004` Let the user choose each model's creation folder anywhere inside the vault.
- [ ] `MDL-087` Use Obsidian's configured new-note location for a model without a creation-folder override.
- [ ] `MDL-005` Let a model declare a filename pattern.
- [ ] `MDL-006` Let a model declare a body template.
- [ ] `MDL-009` Sync model definitions with the vault.
- [ ] `MDL-079` Persist model definitions across Obsidian restarts.
- [ ] `MDL-010` Report an invalid model with the reason it cannot be used.
- [ ] `MDL-049` Let several models use the same creation folder.

## Membership

- [ ] `MDL-042` Select a model's existing notes by folder.
- [ ] `MDL-043` Select a model's existing notes by tag.
- [ ] `MDL-044` Select a model's existing notes by the presence of a frontmatter property.
- [ ] `MDL-045` Select a model's existing notes by a frontmatter property's value.
- [ ] `MDL-088` Select a model's notes by an outgoing link to a chosen note.
- [ ] `MDL-089` Suggest property names used in the vault in property filters.
- [ ] `MDL-090` Suggest values observed for the selected property in property filters.
- [ ] `MDL-091` Suggest folders in the vault in folder filters.
- [ ] `MDL-092` Suggest tags used in the vault in tag filters.
- [ ] `MDL-093` Suggest notes in the vault in link filters.
- [ ] `MDL-046` Let a model require all of its configured conditions to match.
- [ ] `MDL-047` Let a model require any of its configured conditions to match.
- [ ] `MDL-048` Let a model exclude notes matching a configured condition.
- [ ] `MDL-050` Ignore a model's creation folder for membership unless its membership rules use that folder.
- [ ] `MDL-025` List the notes matching a model's membership rules when the model is selected.
- [ ] `MDL-051` Let the user search within the selected model's notes.
- [ ] `MDL-052` Apply changes to a model's membership rules without restarting Shard.

Property conditions follow the [search property-filter rules](search.md#property-filters). The user supplies membership rules; Shard does not infer a scope from an unrelated global query.

## Attributes and defaults

- [ ] `MDL-026` Let the user choose the name of each model attribute.
- [ ] `MDL-027` Let the user choose the type of each model attribute.
- [ ] `MDL-007` Let a model give an attribute a default value.
- [ ] `MDL-008` Let a model mark an attribute as required.
- [ ] `MDL-053` Let a date attribute default to the current date at note creation.
- [ ] `MDL-054` Leave values on existing notes unchanged when creation defaults change.
- [ ] `MDL-022` Preserve each attribute's declared type when writing its value to frontmatter.

Automatic creation and modification dates are governed by [timestamps](timestamps.md), independently of model membership.

## Templating

- [ ] `MDL-059` Let the user select an existing Markdown note in the vault as a model's template.
- [ ] `MDL-060` Report a missing configured template before note creation.
- [ ] `MDL-028` Resolve `{{name}}` to an attribute's value in the filename pattern.
- [ ] `MDL-029` Resolve `{{name}}` to an attribute's value in the creation folder pattern.
- [ ] `MDL-030` Resolve `{{name}}` to another attribute's value in an attribute's default.
- [ ] `MDL-031` Resolve `{{name}}` to an attribute's value in the template body.
- [ ] `MDL-032` Support Obsidian's `{{date}}` placeholder with an optional date format in templates.
- [ ] `MDL-033` Support Obsidian's `{{time}}` placeholder with an optional time format in templates.
- [ ] `MDL-061` Support Obsidian's `{{title}}` placeholder for the new note's title in templates.
- [ ] `MDL-013` Let templates slugify a value.
- [ ] `MDL-014` Report an unknown template placeholder instead of silently replacing it with an empty value.
- [ ] `MDL-071` Create model notes with supported template placeholders without Templater installed.

## Creating

- [ ] `MDL-015` Let the user create a note from a model from the bar.
- [ ] `MDL-016` Ask for required attributes that have no supplied or default value during creation.
- [ ] `MDL-055` Prefill the creation form with the model's default values.
- [ ] `MDL-056` Prefill the creation form with values supplied through the bar.
- [ ] `MDL-057` Prevent creation until an attribute value of the wrong type is corrected.
- [ ] `MDL-058` Create no note when the user cancels the creation form.
- [ ] `MDL-034` Create the new note in the model's configured destination folder.
- [ ] `MDL-035` Write the model's attribute values to the new note's frontmatter.
- [ ] `MDL-036` Take the new note's body from the model's template.
- [ ] `MDL-080` Include frontmatter from the selected template in the created note.
- [ ] `MDL-081` Preserve empty properties declared in a template in the created note.
- [ ] `MDL-082` Give values supplied during creation precedence over defaults.
- [ ] `MDL-018` Create the destination folder when it does not exist.
- [ ] `MDL-019` Never overwrite an existing note when creating a note.
- [ ] `MDL-037` Let the user open the existing note when the filename is taken.
- [ ] `MDL-038` Let the user create a note with a numbered name when the filename is taken.
- [ ] `MDL-021` Let the user configure whether a newly created model note is opened.
- [ ] `MDL-078` Report an invalid destination filename before a note is written.

## Relations and contextual editing

- [ ] `MDL-062` Let the user define a model attribute as a relation to other notes.
- [ ] `MDL-063` Let a relation declare which models its target notes may belong to.
- [ ] `MDL-064` Search only notes belonging to the allowed target models in a relation picker.
- [ ] `MDL-065` Store a selected relation target as an internal note link.
- [ ] `MDL-066` Update the property configured for a relation when the user selects a relation target.
- [ ] `MDL-067` Preserve properties other than the configured relation property during a relation edit.
- [ ] `MDL-070` Leave the note unchanged when the user cancels a relation picker.

Contextual command availability and labels follow [commands](commands.md#contextual-model-commands).

## Open proposals

- [?] `MDL-068` Let a model restrict relation candidates with conditions beyond target model membership.
- [?] `MDL-069` Append an added relation target to existing relation values without duplication.
- [?] `MDL-072` Let a model render its template through Templater when that plugin is available.
- [?] `MDL-073` Let a model offer named creation variants with different templates or defaults.
- [?] `MDL-074` Let a creation variant have its own keyword while remaining part of its parent model.
- [?] `MDL-075` Generate a template from a model's attributes and defaults.
- [?] `MDL-076` Generate a Base from a model's membership rules.
- [?] `MDL-077` Let models reuse attribute definitions with model-specific overrides.
- [?] `MDL-083` Give model attribute defaults precedence over fixed values in the selected template's frontmatter.

## Retired identifiers

| Identifier | Reason                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `MDL-003`  | Attribute names and types are specified separately by MDL-026 and MDL-027.                                                 |
| `MDL-011`  | Attribute references in filenames, destinations, defaults, and bodies are specified separately by MDL-028 through MDL-031. |
| `MDL-012`  | Date and time placeholders are specified separately by MDL-032 and MDL-033.                                                |
| `MDL-017`  | Creation destination, frontmatter, and body are specified separately by MDL-034 through MDL-036.                           |
| `MDL-020`  | Opening an existing note and creating a numbered note are specified separately by MDL-037 and MDL-038.                     |
| `MDL-023`  | Capture into existing note sections is excluded from the model-creation scope.                                             |
| `MDL-024`  | Automatic post-creation command workflows are excluded from the automation scope.                                          |
