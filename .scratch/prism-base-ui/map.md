---
Labels: wayfinder:map
---

# Prism Base UI clean break

## Destination

`@nanisoft/prism-ui` is a Prism-owned React design system built from accessible Base UI primitives and plain CSS. Consumers import Prism and React only. The same source ships curated components, blocks, pages, docs, `llms.txt`, and MCP without a second UI vocabulary.

## Notes

- Clean break: no temporary aliases and no parity chase against the retired catalog.
- Taxonomy: components → blocks → pages. shadcnblocks informs the organization and composition depth, not Prism's visual identity.
- Visual authority remains Spectral Refraction: five pastel packs × light/beam-dark, Archivo Variable, JetBrains Mono, hairline elevation, dither rather than blended gradients.
- Base UI is an implementation detail of `prism-ui`; no Base UI symbols leak through the public API.
- Plain CSS and Prism CSS custom properties are shipped from `prism-ui`; Tailwind is not required.
- The site remains a static Next.js export on Cloudflare Workers and the same Worker continues to serve the read-only MCP.

## Decisions so far

- The replacement is an approved system change, not a second visual identity. Existing visual commitments win over shadcn/shadcnblocks styling.
- The first catalog is curated around production work: forms, navigation, overlays, feedback, data display, and layout primitives; blocks and pages demonstrate real composition.

## Resolution

- [01 — Base UI runtime and CSS token foundation](issues/01-base-ui-runtime-and-css-tokens.md) is resolved: Prism tokens, provider scope, baked CSS variables, and the internal Base UI boundary are in place.
- [02 — Curated Prism component catalog](issues/02-curated-component-catalog.md) is resolved: 29 owned components replace generated pass-throughs.
- [03 — Prism blocks and full-page compositions](issues/03-blocks-and-pages.md) is resolved: nine blocks and five pages establish the composition model.
- [04 — Docs and website rebuild](issues/04-docs-and-website-rebuild.md) is resolved: the static site, live catalog, themes, demos, and responsive visual pass use the owned system.
- [05 — Agent surface and repository truth sweep](issues/05-agent-surface-and-repo-sweep.md) is resolved: the corpus, MCP, current docs, metadata, history markers, and breaking release notes tell one current truth.

## Verification

- `pnpm build`, `pnpm test`, `pnpm check`, and `pnpm lint` pass.
- The generated corpus reports 43 items, 6 guides, 10 themes, and 62 files; MCP tests report 40 passing tests.
- Production static screenshots were inspected at desktop and mobile sizes in light and beam-dark modes; the final pass verified primary contrast, theme restoration, and no horizontal overflow.

## Fog

- Visual regression tooling remains a later effort; this rewrite lands deterministic corpus and build checks first.
- A public copy-out registry can graduate later if consumers need source templates beyond the npm package.

## Out of scope

- Compatibility with the retired component API.
- Recreating every retired component.
- Exposing Base UI, raw tokens, or CSS recipes as consumer escape hatches.
