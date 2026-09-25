# ADR-0007: Prism-owned source over an internal Base UI runtime

- Status: Accepted
- Date: 2026-09-25
- Supersedes: the active-runtime portions of ADR-0002, ADR-0003, and ADR-0004
- Preserves: the Spectral Refraction visual language, five pastel packs, light
  and beam-dark modes, hairline elevation, dither texture, typography, motion,
  and the static site/MCP delivery model

## Context

Prism's earlier implementation treated a large upstream component runtime as a
public compatibility layer. That made the catalog reactive to an upstream
release, split the product truth between upstream docs and Prism docs, and
forced consumers to reason about two UI vocabularies. It also made a clean
production design system impossible to own at the source level.

The replacement needs accessible behavior without exposing that behavior's
implementation as a second consumer API.

## Decision

`@nanisoft/prism-ui` is a Prism-owned React source catalog backed internally by
`@base-ui/react` and native HTML elements. The public contract is exactly the
Prism components, blocks, pages, provider, catalog, and token types. Base UI is
a direct implementation dependency of `prism-ui`; it is not a peer dependency,
consumer install, re-export, or documented import path.

The catalog is curated around production work and is organized as:

1. components — focused accessible controls and primitives;
2. blocks — repeated product patterns;
3. pages — complete structural compositions.

There are no generated pass-throughs, compatibility aliases, upstream base
fields, or one-for-one legacy parity obligations. A new item is added when it
earns a place in the system and has a stable Prism API, recipe, docs page, and
representative example.

## Token and theme boundary

`@nanisoft/prism-tokens` is pure data. `createPrismTheme({ pack, mode })` and
`getPrismTheme(pack, mode)` return a frozen `PrismTheme` with:

- `primitives` — mode-resolved raw values;
- `semantics` — the named meanings consumed by Prism UI;
- `cssVariables` — the complete `--prism-*` projection consumed by the shipped
  stylesheet; and
- `cssVarKey` — the stable `prism-<pack>-<mode>` scope class.

There is no upstream theme lane. `PrismProvider` applies the serializable theme
scope, exposes Prism theme context, supplies the local link adapter, and owns
the nearest portal target. The site applies a theme class before first paint and
uses the same CSS recipes as consumer applications.

The five registered packs remain `blue`, `green`, `lavender`, `rose`, and
`peach`; modes remain `light` and `dark` (shown to people as beam-dark). The
AA gates, 2/4/6/4 radius family, hairline elevation, dither texture, Archivo
Variable / JetBrains Mono typography, and 80/160/280ms motion family are
product commitments, not implementation details.

## Docs and agent boundary

The MDX docs and co-located `demos/*.tsx` files are authoritative. The site,
`@nanisoft/prism-llms`, and the MCP project those same sources. The corpus
contract now carries `primitive: 'base-ui' | 'native'` as descriptive internal
metadata; it never carries a consumer routing target. MCP descriptions and
rendered answers state the Prism import boundary and keep all eight tools
inside the Prism-owned surface.

The static Next.js site remains the human door. Its Worker remains the single
transport for the public read-only MCP. Blog content stays a site-only lane;
the generated catalog, guides, themes, and per-item Markdown are served from
the same build.

## Consequences

### Positive

- The product has one source of truth for visual behavior, API, examples, and
  agent guidance.
- Consumers need only React and Prism; upstream implementation upgrades cannot
  silently change Prism's public contract.
- The catalog can stay small enough to document and review while still
  covering real application work.
- Plain CSS variables make themes deterministic, inspectable, and flash-free.

### Costs and boundaries

- Prism owns accessibility regressions and responsive behavior for its
  curated items; upstream fixes do not arrive automatically.
- A missing component requires a product decision and a source implementation,
  not a generated alias.
- The package carries Base UI as a transitive implementation dependency and
  must keep its public declarations free of Base UI symbols.
- Visual regression and broader catalog growth remain later work; the first
  catalog is intentionally curated.

## Migration rules

- Remove old generated pass-through source, adapters, scripts, and docs rather
  than preserving compatibility aliases.
- Preserve historical ADRs and research as records, but mark superseded
  architecture claims when they are no longer active.
- A docs or catalog change ships with the corresponding generated corpus and a
  breaking changeset when the public package contract changes.
- No consumer-facing source may import Base UI or another component runtime.
