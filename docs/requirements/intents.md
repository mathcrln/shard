# Intents

Model keywords select a scope. A creation intent names that model, the `create` verb, and an optional title. These inputs are available in the Files mode and the unified view; Commands mode keeps its command-only results.

```
games
games horizon
games create Horizon Zero Dawn
games create
```

## Grammar

- [ ] `INT-001` A model action has the form `<model> <verb> <value…>`.
- [ ] `INT-002` The model is found by its name or any configured keyword, ignoring case and diacritics.
- [ ] `INT-003` Models offer `create` as their note-creation verb, and `add` and `new` are accepted as synonyms.
- [ ] `INT-031` A model is also found by the plural or singular form of its name or keyword's last word, so a model named `Game` answers to `games create Horizon Zero Dawn`.
- [ ] `INT-032` The creation verb may also come first, as in `create games Horizon Zero Dawn`. A leading verb counts only when a model follows it; otherwise the input is an ordinary search.
- [ ] `INT-004` Everything after `create` supplies the new note's title.
- [ ] `INT-005` A value with spaces needs no quotes.
- [?] `INT-006` Further properties can be given by name, as in `person create Ada Lovelace born:1815`.

## Scoped search

- [ ] `INT-016` A model keyword without further text lists that model's notes.
- [ ] `INT-017` Text following a model keyword without an action verb searches within that model's notes.
- [ ] `INT-018` Removing a model scope restores the global file search.
- [?] `INT-019` The user can force literal search when text collides with a model keyword or action verb.

## Suggestions

- [ ] `INT-007` While the user types, the bar suggests the models that match the first word.
- [ ] `INT-008` After a model, the bar suggests its verbs.
- [ ] `INT-009` After a verb, the bar shows what will happen: what note will be created, where, and with which values.
- [ ] `INT-010` The suggestion for an intent runs it on Enter.
- [ ] `INT-020` A model's creation action is discoverable without typing the complete creation syntax.

## Missing and wrong input

- [ ] `INT-023` Selecting `<model> create <title>` creates the note without opening a form when its required values are available.
- [ ] `INT-027` Selecting a model's creation action composes its creation command in the existing palette input.
- [ ] `INT-028` The user supplies a creation title through the existing palette input without a separate title form.
- [ ] `INT-029` A creation command without a title stays ready for title entry without creating a note.
- [ ] `INT-030` A failed creation preserves the full command and title in the palette input.
- [ ] `INT-026` A creation intent can override the model's configured template.
- [ ] `INT-012` Typing something that matches no model falls back to normal search.
- [ ] `INT-013` A value of the wrong type is reported next to the property, and nothing is created.

## Predictability

- [ ] `INT-014` An intent never runs on partial input: the user always confirms with Enter.
- [ ] `INT-015` The same text always produces the same intent.

## Retired identifiers

| Identifier | Reason                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `INT-011`  | Creation forms and retained input are specified by INT-021 and INT-022; one-by-one prompting is not required. |
| `INT-021`  | Separate title forms are removed; title entry uses the palette input under INT-027 through INT-029.           |
| `INT-022`  | Creation failure retains the palette command and title under INT-030.                                         |
| `INT-024`  | Title entry stays in the existing input under INT-028, rather than switching to a form view.                  |
| `INT-025`  | The separate creation view is removed, so no return transition is needed.                                     |
