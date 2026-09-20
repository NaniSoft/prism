---
Status: accepted
---

# The pastel pack spectrum: five brand packs

Prism's brand offering expands from the two founding packs (blue, green) to a **pastel-led spectrum of five**: blue and green keep their ids but are re-expressed in pastel voice (a pastel sky and a pastel mint atmosphere), joined by **lavender**, **rose**, and **peach**. Every pack ships in light and beam-dark — ten registered expressions, ten pre-baked site rulesets.

The direction was chosen by the user via an impeccable round (reforge + 3 new) on 2026-09-20, ticket 24.

## The pastel reading (binding)

"Pastel" is the **atmosphere**, never the ink: pastel-tinted grounds, hairlines, live-state washes, and beam-dark grounds carry the colour voice; each pack's ink stays a mid-tone of its own hue. A literal pastel ink cannot pass `defineBrandPack()`'s AA gate (ink doubles as body-link colour in light mode, 4.5:1), and white-on-pastel button text is unreadable — so the gate itself defines the reading. Surfaces stay white; components float as crisp islands on the tinted ground.

Founding-hue inks: blue light `#2563EB` (unchanged) / dark `#4C8DF6`; green light `#117A3B` / dark `#22C55E` (dark unchanged). New packs: lavender `#6A58CE`/`#9D8DF4`, rose `#BC3A6C`/`#F08CB4`, peach `#B04A17`/`#F2A05C`. State hues stay shared across the spectrum (success green, warning amber, error red, info blue; the blue pack's info is its own ink) — meaning must not shift with the spectrum.

## Considered options

- **Retire blue and green** for five brand-new ids: clean pastel-only story, but a breaking change to the published `PrismPackId` and it drops the user-pinned founding hues. Declined.
- **Keep both saturated packs and add five pastels** (seven packs): maximum choice, two visual voices in one system — the saturated founders read off-voice next to the pastels. Declined.

## Consequences

- `PrismPackId` widens to `'blue' | 'green' | 'lavender' | 'rose' | 'peach'` — additive; pack ids are stable API (cssVar classes, storage, DTCG output, MCP slugs).
- The site's flash-free recipe now pre-bakes **ten** variable rulesets; the bake script, the Figma partitioner, and the prism-llms generator derive their pack loops from `prismBrandPacks` — a new pack is one data entry plus tests, never a script edit.
- `get_theme_doc`'s pack enum widens to match; theme atoms become ten.
- The site grows a `/themes` gallery rendering all ten expressions as live themed islands (the cssVar architecture scopes variables per island), the header switcher carries swatch dots, and the landing gains the spectrum band.
- PRODUCT.md's brand commitment moves from "blue and green" to "the pastel five-pack spectrum, founding hues included".
- **ADR-0002 errata (2nd)**: the map-token allowlist grows by one to 17 keys — `colorTextPlaceholder` maps to the pack's `textTertiary` tint. antd's stock placeholder (25% of the text base) measures ≈2.4:1 on tinted beam-dark grounds; the 45% pack-tinted value keeps placeholders legible and hue-true. (1st erratum: `focusOutline` → `controlOutline`.)
