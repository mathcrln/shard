# Search

Search finds things in the vault from what the user types.

## Matching

- [ ] `SRC-001` Search ignores diacritics: `eleve` matches `élève` and `élève` matches `eleve`.
- [ ] `SRC-002` Search ignores letter case.
- [ ] `SRC-003` Search matches words in any order.
- [ ] `SRC-004` Search tolerates a missing or extra character between matched characters (fuzzy), but ranks exact and prefix matches first.
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
- [?] `SRC-016` Notes the user opens often from the bar rank higher over time.

## Prefixes

- [ ] `SRC-017` Starting the query with `>` searches commands only.
- [ ] `SRC-018` Starting the query with `#` searches tags and headings only.
- [?] `SRC-019` Starting the query with `@` searches the scope the user has defined for it.
- [ ] `SRC-020` Removing the prefix returns to the full search.
- [ ] `SRC-021` The active prefix is visible in the bar.

## Performance

- [ ] `SRC-022` Results update as the user types without visible delay in vaults of 10,000 notes.
- [ ] `SRC-023` Search never blocks Obsidian's startup.
