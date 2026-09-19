---
Type: task
Status: resolved
Labels: wayfinder:task
Blocked by:
---

## Question

Implement ADR-0002 for real in `@nanisoft/prism-tokens`: `defineBrandPack()` with the **brand-ink hexes**, the AA contrast gate at `defineBrandPack()`, tier-0/1 data for both packs (blue | green) in both modes (light | beam-dark), the closed 8-key antd map-token allowlist, `toDtcg()` over tiers 0–1, and `cssVar.key = prism-<pack>-<mode>`. Unblocks everything visual.

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand:

- **Name the brand-ink hexes in ADR-0001** while landing them (ticket 08/09 residue: hexes were TBD so packs don't re-litigate; the AA gate decides, not taste).
- **Shadow-as-string rule** (from [Execute Figma setup](14-execute-figma-setup.md) prep pass, verified against research): the floating shadow exports as DTCG `$type: "string"` carrying the CSS `box-shadow` string (`0 4px 16px 0 rgba(11, 18, 32, 0.16)`), true composite preserved in `$extensions["prism.shadow"]` — no off-the-shelf plugin imports `$type: "shadow"` composites, and a Figma STRING variable can never bind to an effect anyway.
- **Per-collection×mode file layout** (ADR-0002 §2d as amended): `dist/figma/<pack>/manifest.json` + `primitive.tokens.json` + `semantic.<mode>.tokens.json`; tier 1 ships `{ref}` aliases.
- **Resolve the tier-name collision**: `shape.radius.*` exists in both tiers — ambiguous for the importer's name-based alias lookup; disambiguate before the Figma re-import (ticket 14's fixture notes it).
- **First-import fixture** at `.scratch/prism/assets/14-figma-first-import/` (manifest + 3 token files + README acceptance criteria) carries STAND-IN hexes — real packs must regenerate or validate it.
- **Theme-MD consumer** (from [prism-llms shape](16-prism-llms-shape.md) §2): prism-tokens build output must make prism-llms' 4 theme atoms (`blue|green` × `light|dark`, each with the `createPrismTheme()` snippet + tier tables + antd map-token result) mechanically derivable.

## Answer

**2026-09-19 — implementation reviewed against ADR-0002 + the inherited requirements, then corrected.** The first pass (tests green, 39 assertions) encoded deviations from the ADR as assertions; the review rewrote the suite to the contract and fixed the code. Build, tests (38), lint, and the full turbo pipeline are green.

**Deviations found and fixed (auto-applied — veto anything):**

1. **Numeric seeds were stringified** — `lineWidth` was set to the hairline *color string* (breaking every border width), `motionUnit`/`motionBase` were `'80ms'` strings (poisoning `genCommonMapToken`'s arithmetic), and `sizeUnit`/`borderRadius`/`fontSize`/`fontWeightStrong` were strings. Now numbers: `1`, `0.08`, `0`, `4`, `4`, `14`, `600`.
2. **`hashed: false` was nested inside `cssVar`** where antd ignores it — now a top-level ThemeConfig key (the flash-free class-swap contract from ticket 02).
3. **The accent flood was solid ink** — `controlItemBgActive` et al. = `inkPrimary` made selected states unreadable. Now a tint of the pack's ink (light 0.10, dark 0.20; hover 0.18/0.28). `colorPrimaryTextActive` stays the ink itself. Blue's tint values coincide byte-for-byte with antd's own defaults pattern.
4. **Hardcoded blue-tinted values leaked into the green pack** (textSecondary/Tertiary/Faint, hairlineFaint, focusRing). All derived values now tint from the pack's *own* primitives (`tintRgba`), so each pack generates its variant-tinted atmosphere (ADR-0001); blue's values are unchanged by construction, green's become green. Green's hairline primitives are now green-tinted (`rgba(13,42,26,.08)` / `rgba(134,239,172,.16)`).
5. **`theme.primitives` carried both modes** — now resolved for the mode (ADR-0002 §1b); dark omits `colorSurface` (§3).
6. **Themes weren't frozen** (`semantics` and the memoised themes were plain) — the whole `PrismTheme` is now deep-frozen in both factories.
7. **`overrides.semantics` never reached the antd lane** — `buildAntdConfig` now takes the (possibly overridden) semantics, so an overridden meaning reaches the rendered output.
8. **AA gate checked only ink-vs-ground** — now also text-vs-ground and text-vs-surface at 4.5:1 (the ADR's "text-on-surface" gate).
9. **DTCG tier 1 used a nonstandard `$ref` field the importer ignores** — now DTCG alias *strings* (`$value: "{color.ground.light}"`) matching the verified fixture/research shape, with `$extensions["prism.antd"]` provenance. Tier-1 Figma names are disambiguated from tier-0 paths (`radius/*`, `typography/*`, `spacing/*`, `motion/timing|easing/*`) — resolves the inherited tier-name collision for the importer's name-based alias lookup.
10. **Shadow export** — `$value` is the CSS string with explicit `0` spread (`0 4px 16px 0 rgba(11, 18, 32, 0.16)`), and the true 2023-07 composite rides in the literal `$extensions["prism.shadow"]` (`color` as `#RRGGBBAA`, px offsets, `inset: false`), parsed from the same string — one string, three consumers.
11. **`dist/figma/<pack>/` build output** (inherited requirement, previously missing): `scripts/build-figma.mjs` partitions `toDtcg()` into `manifest.json` + `prism.<pack>.primitive.tokens.json` + `prism.<pack>.semantic.{light,dark}.tokens.json` per ADR-0002 §2d, with per-mode key parity and tier-name-collision guards that fail the build.
12. **First-import fixture regenerated** from the real build (`.scratch/prism/assets/14-figma-first-import/`), STAND-IN hexes replaced with the pinned packs.

**Ratification requested (one ADR erratum):** `focusOutline` left the map-token allowlist — antd v6 types it as a *boolean seed*, not a string map token, so ADR-0002 §2c's entry could not typecheck against `ThemeConfig` (the no-cast rule, §1a). The focus ring color lives on `controlOutline` alone; allowlist is now 16 keys. Also recorded: the antd `algorithm` deliberately does not ride on `PrismTheme.antd` (prism-tokens stays antd-free) — prism-ui attaches `defaultAlgorithm`/`darkAlgorithm` from `PrismTheme.mode`; and dark mode sets `colorBgMask` (per §3: dark re-uses the allowlist with dark values) while `colorBgLayout` stays light-only.

**Theme-MD consumer:** prism-llms' 4 theme atoms derive mechanically from the public API (`createPrismTheme`/`getPrismTheme`/`toDtcg`/`prismBrandPacks` + exported tier resolvers) — exercised here by prism-ui and the tests; no extra build artifact needed.

Green ink `#0D5C30` / ground `#F0F9F5` and success `#16A34A` (pack choice; success keeps the vivid green the darkened ink gave up) are unchanged from the first pass and now pinned by tests.
