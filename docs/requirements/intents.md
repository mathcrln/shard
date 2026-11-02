# Intents

An intent is a sentence typed in the bar that names a model, a verb, and the values. It runs without leaving the keyboard.

```
person new Ada Lovelace
```

## Grammar

- [ ] `INT-001` An intent has the form `<model> <verb> <value…>`.
- [ ] `INT-002` The model is found by name or alias, ignoring case and diacritics.
- [ ] `INT-003` The verb is one the model offers, such as `new`.
- [ ] `INT-004` Everything after the verb is the value of the model's first required property.
- [ ] `INT-005` A value with spaces needs no quotes.
- [?] `INT-006` Further properties can be given by name, as in `person new Ada Lovelace born:1815`.

## Suggestions

- [ ] `INT-007` While the user types, the bar suggests the models that match the first word.
- [ ] `INT-008` After a model, the bar suggests its verbs.
- [ ] `INT-009` After a verb, the bar shows what will happen: what note will be created, where, and with which values.
- [ ] `INT-010` The suggestion for an intent runs it on Enter.

## Missing and wrong input

- [ ] `INT-011` If required values are missing, the bar asks for them one by one, then runs.
- [ ] `INT-012` Typing something that matches no model falls back to normal search.
- [ ] `INT-013` A value of the wrong type is reported next to the property, and nothing is created.

## Predictability

- [ ] `INT-014` An intent never runs on partial input: the user always confirms with Enter.
- [ ] `INT-015` The same text always produces the same intent.
