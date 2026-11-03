# Intents

Model keywords select a scope. A creation intent names that model, the `create` verb, and an optional title. These inputs are available in the Files mode and the unified view; Commands mode keeps its command-only results.

```
games
games horizon
games create Horizon Zero Dawn
games create
```

## Grammar

- [ ] `INT-001` Accept model actions of the form `<model> <verb> <value…>`.
- [ ] `INT-002` Find the model by its name or any configured keyword, ignoring case and diacritics.
- [ ] `INT-003` Offer `create` as each model's note-creation verb, and accept `add` and `new` as synonyms.
- [ ] `INT-031` Find a model by the plural or singular form of the last word of its name or keyword, so `games create Horizon Zero Dawn` reaches a model named `Game`.
- [ ] `INT-032` Accept the creation verb first, as in `create games Horizon Zero Dawn`, only when a model follows it; otherwise treat the input as an ordinary search.
- [ ] `INT-004` Use everything after `create` as the new note's title.
- [ ] `INT-005` Accept values with spaces without quotes.
- [?] `INT-006` Accept further properties by name, as in `person create Ada Lovelace born:1815`.

## Scoped search

- [ ] `INT-016` List a model's notes when the user enters its keyword without further text.
- [ ] `INT-017` Search within a model's notes for text following its keyword without an action verb.
- [ ] `INT-018` Restore the global file search when the model scope is removed.
- [?] `INT-019` Let the user force literal search when text collides with a model keyword or action verb.

## Suggestions

- [ ] `INT-007` Suggest the models that match the first word while the user types.
- [ ] `INT-008` Suggest a model's verbs after the model.
- [ ] `INT-009` Show what will happen after a verb: which note will be created, where, and with which values.
- [ ] `INT-010` Run an intent's suggestion on Enter.
- [ ] `INT-020` Make a model's creation action discoverable without typing the complete creation syntax.

## Missing and wrong input

- [ ] `INT-023` Create the note without opening a form when `<model> create <title>` is selected and its required values are available.
- [ ] `INT-027` Compose a model's creation command in the existing palette input when its creation action is selected.
- [ ] `INT-028` Take the creation title from the existing palette input, without a separate title form.
- [ ] `INT-029` Keep a creation command without a title ready for title entry, without creating a note.
- [ ] `INT-030` Preserve the full command and title in the palette input after a failed creation.
- [ ] `INT-026` Let a creation intent override the model's configured template.
- [ ] `INT-012` Fall back to normal search when the input matches no model.
- [ ] `INT-013` Report a value of the wrong type next to its property, and create nothing.

## Predictability

- [ ] `INT-014` Never run an intent on partial input; always wait for the user to confirm with Enter.
- [ ] `INT-015` Produce the same intent from the same text every time.

## Retired identifiers

| Identifier | Reason                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `INT-011`  | Creation forms and retained input are specified by INT-021 and INT-022; one-by-one prompting is not required. |
| `INT-021`  | Separate title forms are removed; title entry uses the palette input under INT-027 through INT-029.           |
| `INT-022`  | Creation failure retains the palette command and title under INT-030.                                         |
| `INT-024`  | Title entry stays in the existing input under INT-028, rather than switching to a form view.                  |
| `INT-025`  | The separate creation view is removed, so no return transition is needed.                                     |
