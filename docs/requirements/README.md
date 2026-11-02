# Requirements

Shard centers on user-defined note models: how notes are recognized, created, and acted on. Global search also serves notes without a model. Search, models, timestamps, and optional virtual content belong to one plugin.

These files describe observable product rules. [The roadmap](../../ROADMAP.md) describes their priority. Mobile usability applies to every capability through the [platform requirements](platform.md); it is not a separate final initiative.

| Domain                                | Rules                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Models](models.md)                   | User configuration, membership, attributes, defaults, templates, creation, and relations |
| [Bar](bar.md)                         | Entry commands, search modes, keyboard and touch interactions, and result actions        |
| [Search](search.md)                   | Matching, ranking, property filters, scopes, and saved Bases views                       |
| [Commands](commands.md)               | Command discovery, execution, organization, and contextual model commands                |
| [Intents](intents.md)                 | Model keywords, scoped queries, and creation input                                       |
| [Timestamps](timestamps.md)           | Optional date maintenance across the vault                                               |
| [Virtual content](virtual-content.md) | Optional shared content displayed without changing notes                                 |
| [Platform](platform.md)               | Desktop and mobile usability, packaging, persistence, privacy, and scope boundaries      |

## Conformance

- `[x]`: the complete behavior is verified as satisfied.
- `[ ]`: the behavior is accepted but not completely verified as satisfied.
- `[?]`: the proposal requires a product decision.

Existing source code alone is not evidence for `[x]`. Unchecked items can include implemented behavior awaiting complete verification. A smaller implementation slice does not complete a broader requirement.

Each identifier is permanent and unique. Retired identifiers are reserved in their domain file and must not be reassigned. Changes to an undecided proposal require a user decision.

## Scope boundaries

Shard provides no general macro runner, arbitrary user-script runtime, AI features, or external automation triggers. These capabilities are excluded, rather than entries in a planned automation tier. Existing Obsidian and plugin commands remain searchable regardless of the capabilities their providers offer.

Automatic timestamps apply independently of model membership. Virtual content and contextual behavior are optional. Detailed timestamp policies, relation editing policies, creation variants, and generated templates or Bases remain proposals wherever marked `[?]`.
