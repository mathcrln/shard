# Models

A model is a user-defined kind of note. It describes membership, attributes, creation rules, and available actions. Membership and creation location are independent: models can share a folder, and existing notes can belong to a model wherever they are stored.

## Defining

- [ ] `MDL-001` The user can define any number of models.
- [ ] `MDL-002` Each model has a name that is unique among the models.
- [ ] `MDL-039` The user can define a model through Shard's settings.
- [ ] `MDL-040` The user can edit a model through Shard's settings.
- [ ] `MDL-084` Each model can be expanded and edited inline without leaving the settings page.
- [ ] `MDL-085` Matching notes are previewed in a scrollable list beneath the model's membership conditions.
- [ ] `MDL-086` Incomplete membership conditions do not show error alerts before field interaction.
- [ ] `MDL-041` A model can have multiple optional keywords used to select it in the bar.
- [ ] `MDL-004` The user chooses each model's creation folder anywhere inside the vault.
- [ ] `MDL-087` A model without a creation-folder override uses Obsidian's configured new-note location.
- [ ] `MDL-005` A model declares a filename pattern.
- [ ] `MDL-006` A model declares a body template.
- [ ] `MDL-009` Model definitions sync with the vault.
- [ ] `MDL-079` Model definitions persist across Obsidian restarts.
- [ ] `MDL-010` An invalid model is reported with the reason it cannot be used.
- [ ] `MDL-049` Several models can use the same creation folder.

## Membership

- [ ] `MDL-042` A model can select existing notes by folder.
- [ ] `MDL-043` A model can select existing notes by tag.
- [ ] `MDL-044` A model can select existing notes by the presence of a frontmatter property.
- [ ] `MDL-045` A model can select existing notes by a frontmatter property's value.
- [ ] `MDL-046` A model can require all of its configured conditions to match.
- [ ] `MDL-047` A model can require any of its configured conditions to match.
- [ ] `MDL-048` A model can exclude notes matching a configured condition.
- [ ] `MDL-050` A model's creation folder does not determine membership unless its membership rules use that folder.
- [ ] `MDL-025` Selecting a model lists notes matching its membership rules.
- [ ] `MDL-051` The user can search within the selected model's notes.
- [ ] `MDL-052` Changes to a model's membership rules apply without restarting Shard.

Property conditions follow the [search property-filter rules](search.md#property-filters). The user supplies membership rules; Shard does not infer a scope from an unrelated global query.

## Attributes and defaults

- [ ] `MDL-026` The user chooses the name of each model attribute.
- [ ] `MDL-027` The user chooses the type of each model attribute.
- [ ] `MDL-007` A model can give an attribute a default value.
- [ ] `MDL-008` A model can mark an attribute as required.
- [ ] `MDL-053` A date attribute's default can be the current date at note creation.
- [ ] `MDL-054` Creation defaults do not change values on existing notes.
- [ ] `MDL-022` Attribute values written to frontmatter preserve their declared type.

Automatic creation and modification dates are governed by [timestamps](timestamps.md), independently of model membership.

## Templating

- [ ] `MDL-059` The user can select an existing Markdown note in the vault as a model's template.
- [ ] `MDL-060` A missing configured template is reported before note creation.
- [ ] `MDL-028` The filename pattern can reference an attribute's value as `{{name}}`.
- [ ] `MDL-029` The creation folder pattern can reference an attribute's value as `{{name}}`.
- [ ] `MDL-030` An attribute's default can reference another attribute's value as `{{name}}`.
- [ ] `MDL-031` The template body can reference an attribute's value as `{{name}}`.
- [ ] `MDL-032` Templates support Obsidian's `{{date}}` placeholder with an optional date format.
- [ ] `MDL-033` Templates support Obsidian's `{{time}}` placeholder with an optional time format.
- [ ] `MDL-061` Templates support Obsidian's `{{title}}` placeholder for the new note's title.
- [ ] `MDL-013` Templates can slugify a value.
- [ ] `MDL-014` An unknown template placeholder is reported instead of being silently replaced with an empty value.
- [ ] `MDL-071` Model creation with supported template placeholders works without Templater installed.

## Creating

- [ ] `MDL-015` The user can create a note from a model from the bar.
- [ ] `MDL-016` Creation asks for required attributes that have no supplied or default value.
- [ ] `MDL-055` The creation form is prefilled with the model's default values.
- [ ] `MDL-056` The creation form is prefilled with values supplied through the bar.
- [ ] `MDL-057` An attribute value of the wrong type prevents creation until corrected.
- [ ] `MDL-058` Cancelling the creation form creates no note.
- [ ] `MDL-034` The new note is created in the model's configured destination folder.
- [ ] `MDL-035` The new note contains the model's attribute values in frontmatter.
- [ ] `MDL-036` The new note's body comes from the model's template.
- [ ] `MDL-080` Frontmatter from the selected template is included in the created note.
- [ ] `MDL-081` Empty properties declared in a template are preserved in the created note.
- [ ] `MDL-082` Values supplied during creation take precedence over defaults.
- [ ] `MDL-018` The destination folder is created if it does not exist.
- [ ] `MDL-019` Creating a note never overwrites an existing note.
- [ ] `MDL-037` When the filename is taken, the user can open the existing note.
- [ ] `MDL-038` When the filename is taken, the user can create a note with a numbered name.
- [ ] `MDL-021` The user can configure whether a newly created model note is opened.
- [ ] `MDL-078` An invalid destination filename is reported before a note is written.

## Relations and contextual editing

- [ ] `MDL-062` The user can define a model attribute as a relation to other notes.
- [ ] `MDL-063` A relation declares which models its target notes may belong to.
- [ ] `MDL-064` A relation picker searches only notes belonging to the allowed target models.
- [ ] `MDL-065` A selected relation target is stored as an internal note link.
- [ ] `MDL-066` Selecting a relation target updates the property configured for that relation.
- [ ] `MDL-067` A relation edit preserves properties other than the configured relation property.
- [ ] `MDL-070` Cancelling a relation picker leaves the note unchanged.

Contextual command availability and labels follow [commands](commands.md#contextual-model-commands).

## Open proposals

- [?] `MDL-068` A model can restrict relation candidates with conditions beyond target model membership.
- [?] `MDL-069` Adding a relation target appends it to existing relation values without duplication.
- [?] `MDL-072` A model can render its template through Templater when that plugin is available.
- [?] `MDL-073` A model can offer named creation variants with different templates or defaults.
- [?] `MDL-074` A creation variant can have its own keyword while remaining part of its parent model.
- [?] `MDL-075` Shard can generate a template from a model's attributes and defaults.
- [?] `MDL-076` Shard can generate a Base from a model's membership rules.
- [?] `MDL-077` Attribute definitions can be reused across models with model-specific overrides.
- [?] `MDL-083` Model attribute defaults take precedence over fixed values in the selected template's frontmatter.

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
