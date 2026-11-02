# Platform

- [ ] `PLT-001` Shard works on Obsidian desktop.
- [ ] `PLT-002` Shard works on Obsidian mobile.
- [ ] `PLT-003` Shard works without desktop-only APIs.
- [ ] `PLT-004` Shard works in pop-out windows.
- [ ] `PLT-006` Shard starts without slowing Obsidian's startup.
- [ ] `PLT-007` Shard cleans up all its listeners and DOM when disabled.
- [ ] `PLT-008` Shard works with the Obsidian version it declares as its minimum.
- [?] `PLT-009` Shard keeps working when Obsidian's internal command registry changes shape, by failing visibly instead of crashing.

## Usability and configuration

- [ ] `PLT-012` Shard's capabilities are available through one installed plugin.
- [ ] `PLT-013` Model configuration is usable on mobile without a hardware keyboard.
- [ ] `PLT-014` Relation editing is usable on mobile without a hardware keyboard.
- [ ] `PLT-015` Global search works without configured models.
- [ ] `PLT-016` Notes without a model remain discoverable through global file search.
- [ ] `PLT-017` User settings persist across Obsidian restarts.
- [ ] `PLT-024` Regular settings use Obsidian's native controls with labels on the left and controls on the right.

Desktop and mobile conformance apply to every domain in these requirements, including configuration, creation, timestamps, and virtual content.

## Network and privacy

- [ ] `PLT-010` Shard makes network requests only to load images referenced by the user-configured result image property.
- [ ] `PLT-011` Shard does not upload note contents.
- [ ] `PLT-022` Disabling result image previews prevents Shard from loading remote result images.
- [ ] `PLT-023` Shard collects no telemetry.

## Product boundaries

- [ ] `PLT-018` Shard provides no general macro runner.
- [ ] `PLT-019` Shard provides no arbitrary user-script execution feature.
- [ ] `PLT-020` Shard provides no AI features.
- [ ] `PLT-021` Shard provides no external automation triggers.

These boundaries describe Shard's own features. They do not restrict which existing Obsidian or plugin commands the user can find and run.

## Retired identifiers

| Identifier | Reason                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `PLT-005`  | Network behavior and note-content privacy are specified separately by PLT-010 and PLT-011, including the accepted remote-image exception. |
