# Search

Search finds things in the vault from what the user types. Model scopes and global property filters use the same membership conditions. [Bar modes](bar.md#search-modes) determine which result kinds are eligible.

## Matching

- [ ] `SRC-001` Search ignores diacritics: `eleve` matches `élève` and `élève` matches `eleve`.
- [ ] `SRC-002` Search ignores letter case.
- [ ] `SRC-003` Search matches words in any order.
- [ ] `SRC-024` Search matches query characters separated by unmatched characters in the result text.
- [ ] `SRC-025` Exact and prefix matches rank above fuzzy matches of the same result kind.
- [ ] `SRC-005` Matched characters are highlighted in the result, including when the text has diacritics.
- [ ] `SRC-006` Highlights cover exactly the characters that matched, with no shift caused by diacritics.

## What is searched

- [ ] `SRC-007` Search finds notes by file name.
- [ ] `SRC-008` Search finds notes by alias.
- [ ] `SRC-009` Search finds headings within notes.
- [ ] `SRC-010` Search finds tags.
- [ ] `SRC-011` A result shows the note's folder path when names are ambiguous.
- [ ] `SRC-012` A note that does not exist yet can be offered as a result to create it.

## Ranking

- [ ] `SRC-013` Recently opened notes rank higher for the same match quality.
- [ ] `SRC-014` With an empty query, the bar shows recent notes.
- [ ] `SRC-015` Results keep a stable order while the user keeps typing, unless a better match appears.
- [ ] `SRC-044` Unified searches rank file, heading, and command matches together by relevance rather than grouping them by kind.
- [ ] `SRC-045` A full exact match outranks a weaker match even when that weaker match has a recency boost.
- [?] `SRC-016` Notes the user opens often from the bar rank higher over time.

## Prefixes

- [ ] `SRC-017` Starting the query with `>` searches commands only.
- [ ] `SRC-018` Starting the query with `#` searches tags and headings only.
- [?] `SRC-019` Starting the query with `@` searches the scope the user has defined for it.
- [ ] `SRC-020` Removing the command prefix restores normal search according to the unified-search setting.
- [ ] `SRC-021` The active prefix is visible in the bar.

## Property filters

- [ ] `SRC-026` A global search can filter frontmatter properties without selecting a model.
- [ ] `SRC-027` `[property]` finds notes containing that property, using Obsidian's property-search syntax.
- [ ] `SRC-028` `[property:value]` finds notes matching that property value, using Obsidian's property-search syntax.
- [ ] `SRC-029` Quoted values allow property filters to contain spaces.
- [ ] `SRC-030` Property filters match values within list properties.
- [ ] `SRC-031` Property filters support properties containing internal note links.
- [ ] `SRC-032` Text outside property filters narrows the eligible notes by the normal filename and alias matching rules.
- [ ] `SRC-033` Model membership conditions and equivalent global property filters return the same eligible notes.
- [ ] `SRC-034` Search reflects property changes detected by Obsidian without restarting Shard.
- [ ] `SRC-035` An invalid property filter shows the reason it cannot be applied.

## Model and contextual scopes

- [ ] `SRC-036` A model-scoped search returns only notes matching that model's membership rules.
- [ ] `SRC-037` A global search does not select a model merely because its results include notes belonging to that model.
- [ ] `SRC-038` The user can enable or disable result suggestions based on the active note's model.
- [ ] `SRC-039` Disabling contextual result suggestions leaves explicit model-scoped search available.

## Saved Bases views

- [ ] `SRC-040` Search finds `.base` files by name.
- [ ] `SRC-041` Search finds saved views within `.base` files by their view names.
- [ ] `SRC-042` A saved view result identifies the Base that contains it.
- [ ] `SRC-043` Selecting a saved view opens that view in its Base.

Searching a saved view means finding the view's name. Evaluating its query to search its rows inside Shard is outside this capability.

## Performance

- [ ] `SRC-022` Results update as the user types without visible delay in vaults of 10,000 notes.
- [ ] `SRC-023` Search never blocks Obsidian's startup.

## Retired identifiers

| Identifier | Reason                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- |
| `SRC-004`  | Fuzzy matching and match-quality ranking are specified separately by SRC-024 and SRC-025. |
