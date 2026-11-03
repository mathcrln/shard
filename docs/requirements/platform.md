# Platform

Shard centers on user-defined note models: how notes are recognized, created, and acted on. Search, models, timestamps, and optional virtual content belong to one plugin.

- [ ] `PLT-001` Run on Obsidian desktop.
- [ ] `PLT-002` Run on Obsidian mobile.
- [ ] `PLT-003` Run without desktop-only APIs.
- [ ] `PLT-004` Run in pop-out windows.
- [ ] `PLT-006` Start without slowing Obsidian's startup.
- [ ] `PLT-007` Clean up all listeners and DOM when disabled.
- [ ] `PLT-008` Run on the Obsidian version declared as the minimum.
- [?] `PLT-009` Fail visibly instead of crashing when Obsidian's internal command registry changes shape.

## Usability and configuration

- [ ] `PLT-012` Provide every Shard capability through one installed plugin.
- [ ] `PLT-013` Make model configuration usable on mobile without a hardware keyboard.
- [ ] `PLT-014` Make relation editing usable on mobile without a hardware keyboard.
- [ ] `PLT-015` Provide global search without configured models.
- [ ] `PLT-016` Keep notes without a model discoverable through global file search.
- [ ] `PLT-017` Persist user settings across Obsidian restarts.
- [ ] `PLT-024` Use Obsidian's native controls for regular settings, with labels on the left and controls on the right.

Desktop and mobile conformance apply to every domain in these requirements, including configuration, creation, timestamps, and virtual content.

## Network and privacy

- [ ] `PLT-010` Make network requests only to load images referenced by the user-configured result image property.
- [ ] `PLT-011` Never upload note contents.
- [ ] `PLT-022` Load no remote result images while result image previews are disabled.
- [ ] `PLT-023` Collect no telemetry.

## Product boundaries

- [ ] `PLT-018` Provide no general macro runner.
- [ ] `PLT-019` Provide no arbitrary user-script execution.
- [ ] `PLT-020` Provide no AI features.
- [ ] `PLT-021` Provide no external automation triggers.

These boundaries describe Shard's own features. They do not restrict which existing Obsidian or plugin commands the user can find and run.

## Retired identifiers

| Identifier | Reason                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `PLT-005`  | Network behavior and note-content privacy are specified separately by PLT-010 and PLT-011, including the accepted remote-image exception. |
