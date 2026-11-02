# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Settings tab to show commands when the bar opens, choose how many recent notes to list, and turn heading search on or off
- File and command search entry commands, with `>` prefilled for command search
- Optional unified search to include commands in normal queries
- Inline model accordions with editable names, optional extra keywords, and membership conditions
- Folder, tag, and frontmatter membership rules with all/any matching and inverted conditions
- Scrollable matching-note preview directly beneath model conditions
- Vault-local model persistence with field validation and discreet storage diagnostics
- Model name and keyword scopes for listing and searching matching notes
- Model creation folders and optional Markdown templates with native title, date, and time placeholders
- Direct note creation from the palette input with Obsidian's default new-note folder when no model override is set

### Changed

- Concise settings labels and search states without instructional helper copy
- Always-visible search preferences with native Obsidian controls aligned to the right
- Unified search mixes notes, headings, and commands by relevance, with exact matches ranked first
- Native Obsidian suggestion modal and action menus on mobile
- Desktop React palette retained for richer actions and future scopes
- Shared matching, result actions, and modifier shortcuts across both presentations

### Removed

- Custom mobile sheet and keyboard positioning
- Floating modal close button and additional search-bar close control on both platforms
- Navigation instruction legend

### Fixed

- Template lookup accepts note names, extensionless paths, and wikilinks using Obsidian's note resolution
