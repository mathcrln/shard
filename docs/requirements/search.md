# Search

Search finds things in the vault from what the user types. Model scopes and global property filters use the same membership conditions. [Bar modes](bar.md#search-modes) determine which result kinds are eligible.

## Matching

- [ ] `SRC-001` Ignore diacritics: match `élève` from `eleve` and `eleve` from `élève`.
- [ ] `SRC-002` Ignore letter case.
- [ ] `SRC-003` Match query words in any order.
- [ ] `SRC-024` Match query characters separated by unmatched characters in the result text.
- [ ] `SRC-025` Rank exact and prefix matches above fuzzy matches of the same result kind.
- [ ] `SRC-005` Highlight matched characters in the result, including when the text has diacritics.
- [ ] `SRC-006` Highlight exactly the characters that matched, with no shift caused by diacritics.

## What is searched

- [ ] `SRC-007` Find notes by file name.
- [ ] `SRC-008` Find notes by alias.
- [ ] `SRC-009` Find headings within notes.
- [ ] `SRC-010` Find tags.
- [ ] `SRC-011` Show a note's folder path when names are ambiguous.
- [ ] `SRC-012` Offer a note that does not exist yet as a result to create it.

## Ranking

- [ ] `SRC-013` Rank recently opened notes higher for the same match quality.
- [ ] `SRC-014` Show recent notes for an empty query.
- [ ] `SRC-015` Keep results in a stable order while the user keeps typing, unless a better match appears.
- [ ] `SRC-044` Rank file, heading, and command matches together by relevance in unified searches, rather than grouping them by kind.
- [ ] `SRC-045` Rank a full exact match above a weaker match, even when the weaker match has a recency boost.
- [?] `SRC-016` Rank notes the user often opens from the bar higher over time.

## Prefixes

- [ ] `SRC-017` Search commands only when the query starts with `>`.
- [ ] `SRC-018` Search tags and headings only when the query starts with `#`.
- [?] `SRC-019` Search the user-defined scope when the query starts with `@`.
- [ ] `SRC-020` Restore normal search according to the unified-search setting when the command prefix is removed.
- [ ] `SRC-021` Show the active prefix in the bar.

## Property filters

- [ ] `SRC-026` Filter frontmatter properties in a global search without selecting a model.
- [ ] `SRC-027` Find notes containing a property with `[property]`, using Obsidian's property-search syntax.
- [ ] `SRC-028` Find notes matching a property value with `[property:value]`, using Obsidian's property-search syntax.
- [ ] `SRC-029` Accept quoted values containing spaces in property filters.
- [ ] `SRC-030` Match values within list properties in property filters.
- [ ] `SRC-031` Support properties containing internal note links in property filters.
- [ ] `SRC-032` Narrow the eligible notes by text outside property filters, using the normal filename and alias matching rules.
- [ ] `SRC-033` Return the same eligible notes for model membership conditions and equivalent global property filters.
- [ ] `SRC-034` Reflect property changes detected by Obsidian without restarting Shard.
- [ ] `SRC-035` Show the reason an invalid property filter cannot be applied.

## Model and contextual scopes

- [ ] `SRC-036` Return only notes matching the model's membership rules in a model-scoped search.
- [ ] `SRC-037` Never select a model in a global search merely because its results include notes belonging to that model.
- [ ] `SRC-038` Let the user enable or disable result suggestions based on the active note's model.
- [ ] `SRC-039` Keep explicit model-scoped search available when contextual result suggestions are disabled.

## Saved Bases views

- [ ] `SRC-040` Find `.base` files by name.
- [ ] `SRC-041` Find saved views within `.base` files by their view names.
- [ ] `SRC-042` Identify the Base that contains a saved view result.
- [ ] `SRC-043` Open a selected saved view in its Base.

Searching a saved view means finding the view's name. Evaluating its query to search its rows inside Shard is outside this capability.

## Performance

- [ ] `SRC-022` Update results as the user types without visible delay in vaults of 10,000 notes.
- [ ] `SRC-023` Never block Obsidian's startup with search.

## Retired identifiers

| Identifier | Reason                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- |
| `SRC-004`  | Fuzzy matching and match-quality ranking are specified separately by SRC-024 and SRC-025. |
