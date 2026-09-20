---
Type: task
Status: resolved
---

# 24 — Pastel pack expansion: five brand packs + site theme gallery

## Question

The design system and site ship two brand packs (blue, green). Expand to a pastel-led set of at least five colours that hold up in both light and beam-dark modes, and revamp the site around the new spectrum. User locked the direction via the impeccable round:

**Reforge + 3 new** — `blue` and `green` keep their ids but are re-expressed in pastel voice (Sky-blue, Mint-green atmospheres); Lavender, Rose, and Peach join. Five packs × two modes = ten pre-baked theme expressions. Published `PrismPackId` API stays additive.

## Auto-applied calls (user may veto)

- "Pastel" = pastel **atmosphere** (grounds, hairlines, washes, beam-dark tints) with mid-tone inks — `defineBrandPack()`'s AA gate would throw on literal pastel primaries, and white-on-pastel button text would be unreadable.
- Site revamp: switcher redesigned for five packs (swatch dots), new `/themes` gallery page rendering all ten expressions as live themed islands, landing hero showcasing the spectrum, docs-content sweep.
- Site default stays beam-dark blue.
- `build-figma.mjs`, prism-llms `build.mjs`, and the site's `bake-antd-css.mjs` derive pack lists from `prismBrandPacks` instead of hardcoding `['blue', 'green']`.
- MCP `get_theme_doc` pack parameter widened beyond the two-pack enum.
- ADR-0005 records the decision; ADR-0001, PRODUCT.md, CONTEXT.md, CLAUDE.md, AGENTS.md updated to agree.

## Touchpoints

- `packages/tokens`: `PrismPackId` union, `brands.ts` pack inputs, tests (pinned hexes).
- `packages/tokens/scripts/build-figma.mjs`, `packages/llms/scripts/build.mjs`, `apps/site/scripts/bake-antd-css.mjs`: pack loops.
- `packages/mcp-server`: `get_theme_doc` schema + description.
- `apps/site`: `lib/theme.ts`, `ThemeSwitcher.tsx`, `/themes` gallery, landing page, `antd-vars.css` rebake, content mentions of "two packs".
- Docs: ADR-0005, ADR-0001 amendment, PRODUCT.md, CONTEXT.md, CLAUDE.md, AGENTS.md, map.
- Changesets for the four published packages (minor, additive).

## Answer

Shipped 2026-09-20, verdict **ship** after a two-round impeccable finish review. Five pastel packs (blue/green reforged in pastel voice + lavender, rose, peach), validated by the existing AA gate at `defineBrandPack()`; `PrismPackId` widened additively; bake/figma/llms scripts now derive pack loops from `prismBrandPacks`; MCP enum widened; site rebaked to ten pre-baked rulesets with a swatch-dot switcher, a `/themes` gallery rendering all ten expressions as live themed islands with a "Wear this theme" hand-off, and a landing spectrum band whose daylight peek follows the shell pack. Review-driven additions: a 17th map-token allowlist key `colorTextPlaceholder` → the pack's textTertiary tint (antd's 25% placeholder measured ≈2.4:1 on tinted darks; recorded as the 2nd ADR-0002 erratum in ADR-0005), island chrome keyed to `bg-container` (dark scopes carry no layout ground), meters carrying `strokeColor: var(--prism-color-primary)`, and the mobile header wrapping nav to its own row ≤860px. Recorded in ADR-0005; ADR-0001, PRODUCT.md, CONTEXT.md, CLAUDE.md, AGENTS.md, and `/docs/brand` updated to agree. Changeset: minor across the four published packages.
