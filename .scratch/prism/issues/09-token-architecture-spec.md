---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
Blocked by: 02, 08
---

## Question

Define `@nanisoft/prism-tokens`: the API and architecture.

- `createPrismTheme()` signature and what it returns (ConfigProvider-ready theme object? token tiers? both?).
- Token tiers: primitives → semantics → antd mapping (`token` / `components` / `algorithm`); where the Figma-Variables export slots in.
- Dark mode: algorithm composition strategy, user override surface.
- Brand pack shape: what a second brand may change vs must leave alone.
- Fidelity rule: how much of antd's token surface Prism exposes vs abstracts away.

Output: a written spec (ADR) the tokens package is implemented against.

## Draft proposal

Drafted 2026-09-14 against `docs/adr/0002-token-architecture.md` (`Status: proposed`). antd facts verified against antd 6.6.4 metadata (`antd token` / `antd list`), antd's theme sources (`seed.ts`, `themes/shared/genCommonMapToken.ts`, `themes/shared/genRadius.ts`, `themes/default/colors.ts`, `themes/dark/colors.ts`, `util/alias.ts`), and the antd docs — not from memory.

- **One object, both answers.** `createPrismTheme({ pack, mode, overrides? }): PrismTheme` returns a frozen, deterministic object with an `antd` lane that spreads straight into `<ConfigProvider theme={…}>` *plus* the two Prism tiers (`primitives`, `semantics`) as plain data for the docs site, MCP, and Figma export. `PrismTheme` is not an intersection of antd's `ThemeConfig` — metadata never rides on the object antd consumes.
- **Two Prism tiers; antd is a compiler, not a vocabulary.** Tier 0 primitives (~20 raw values: ink, grounds, hairlines, radius steps, durations, curves, fonts) → tier 1 semantics (~35 named meanings, the only tier apps read) → tier 2 antd mapping in three lanes: seeds + algorithms wherever a seed exists; a **closed `PrismAntdMapKey` allowlist** for the cases antd's derivation mathematically cannot express (`genRadius(4)` yields SM 4/LG 4, not 2/6; `motionUnit: 0.08` yields 240ms, not 280ms); `components` overrides only with `algorithm: true`.
- **Pure, antd-free package.** No runtime deps, no React, and antd's token names declared as closed string-literal unions rather than imported types — so the Figma plugin, site build, and MCP tooling can consume it without antd, and the mapping stays a reviewable list. antd's compiler enforces the boundary at `prism-ui`'s typecheck, with a drift tripwire test against `theme.getDesignToken()`.
- **Dark mode = `darkAlgorithm` + tinted seeds, one algorithm per theme.** Beam-dark's "surfaces lighten as they elevate" is antd's own dark neutral generator (`colorBgLayout` +0, `container` +8, `elevated` +12, `spotlight` +26) fed `colorBgBase = #0B1220`/`#0A1612`. `compactAlgorithm` is never composed into a pack — density is a nested `ConfigProvider`. Override surface: pack + mode via props, semantic-level `overrides.semantics`, no antd-typed path.
- **Figma slots in at tiers 0–1 only.** `toDtcg(pack, mode)` writes `dist/figma/prism.<pack>.<mode>.tokens.json` (four files, identical key sets across modes, asserted), stable DTCG subset (`$value`/`$type`/`$description`/`$extensions`), resolved values with antd destinations as `$extensions` provenance. antd tokens never reach Figma.
- **Fidelity rule: ~35 semantics against antd's 234 global tokens and 72 components.** Apps see Prism names only and never pass `theme`; `prism-ui` may use the whole antd surface internally; no escape hatch in v1. Second brands may change tier-0 values and which hue owns success/info, and must leave the tier names, antd mapping lanes, radius/motion/hairline rules, cssVar key scheme, and DTCG shape alone.

### Decision points for the human

Ranked; each with my recommendation. Drafted, not self-resolved.

1. **Return shape of `createPrismTheme()`** — structured `PrismTheme` (`{ antd, primitives, semantics, cssVarKey, pack, mode }`), vs a bare antd `ThemeConfig`, vs `ThemeConfig & metadata` (one object passed to antd with extra keys riding along). **Recommend the structured object**: the `antd` lane is the only thing antd ever sees; docs/MCP/Figma get tiers without a second API; nothing extra leaks into antd's merge.
2. **Expose antd `components` token overrides?** — none at all, vs a narrow enumerated set with a lint-enforced `algorithm: true` companion, vs open component-token access. **Recommend narrow**: v1 needs exactly the shadow-zeroing entries (`Button.primaryShadow/defaultShadow/dangerShadow: 'none'`, `Input.activeShadow/errorActiveShadow/warningActiveShadow: 'none'`) because beam-crisp means flat controls and hairline focus rings. Opening it further re-creates the "scattered overrides" anti-goal; closing it entirely leaves the brand unable to express flat controls.
3. **Keep the map-token allowlist, or hold the "seeds + algorithms, never map tokens" line absolutely?** — ADR-0001's 2/4/6/4 radius and 80/160/280ms motion are *not* seed-derivable (antd's `genRadius(4)` → SM 4/LG 4/outer 4; `motionUnit 0.08` → slow 240ms), so a strict reading of ticket 02's rule contradicts the locked visual language. **Recommend the closed allowlist** (8 named keys, justification per entry, test-asserted subset) as the explicit escape hatch ticket 02 already anticipated.
4. **antd escape hatch in v1 (`rawAntd: ThemeConfig`)?** — **Recommend no.** No consumer needs it until the theme gallery / third-party pack fog graduates; shipping it now re-opens the fidelity boundary on day one. Cheapest to add later, expensive to remove.
5. **Light-mode ground vs container** — antd's light generator puts the container *at* `colorBgBase` and the page 4% darker, so a tinted page ground (`#F7F9FC`) and a lighter in-plane surface can't both come from the seed. **Recommend adding a `color.surface.light` primitive** + allowlisting `colorBgLayout`; alternative is one ground primitive and accepting ground == container in light mode.
6. **`wireframe` seed** — `true` (antd's bordered, less-filled mode reads superficially like hairline elevation) vs `false`. **Recommend `false`**: hairline elevation is expressed per component (border + tint) and global wireframe would restyle every component's states at once, including ones the language hasn't been tuned for.
7. **The four brand-ink values** (blue/green × light/dark) — ADR-0001 fixes atmosphere, hairlines, and semantics but never pins the ink hexes, and ticket 09 must not invent brand values. **Recommend the human pins them in the pack implementation pass**, with the ADR carrying `TBD` placeholders and a contrast-floor gate (AA text-on-surface) at `defineBrandPack()`.
8. **`cssVar.key` scheme** — `prism-<pack>-<mode>` (`prism-green-dark`) vs ticket 02's sketched `prism-light`/`prism-dark`. **Recommend pack-in-key**: two packs can share a page, and each needs its own `--prism-*` namespace; the explicit-and-stable rule from ticket 02 is unchanged. This refines (not contradicts) the resolved ticket 02 sketch, and the pre-bake recipe becomes four rulesets.

Also recorded, not decided here: suggested follow-up for a later ticket — ADR-0001 could name the ink hexes (point 7) so packs don't each re-litigate them; and ticket 14 should confirm the DTCG `shadow` composite is importable by the chosen Figma plugin before the floating-shadow token is exported as a real `$type: 'shadow'` value rather than a `$description`/`$extensions` string.

## Answer

Resolved 2026-09-14 — human ratified the draft in full ("all four as recommended"). ADR-0002 status → **accepted**.

Adopted, per the draft's recommendations: structured `PrismTheme` return (`{ antd, primitives, semantics, cssVarKey, pack, mode }`); pure antd-free package with closed string-literal unions for antd keys; three mapping lanes — seeds + algorithms, the **closed 8-key map-token allowlist** (radius SM/LG, `motionDurationSlow`, `colorBgLayout`/`colorBgMask`, hairline trio, accent-flood quartet, focus ring, three `boxShadow`s — per-entry justification, test-asserted subset), `components` overrides limited to the six shadow-zeroing entries with `algorithm: true`; no `rawAntd` escape hatch in v1; `color.surface.light` primitive added for the light-mode ground/container split; `wireframe: false`; brand-ink hexes stay `TBD` until the pack implementation pass (AA contrast gate at `defineBrandPack()`); cssVar key = `prism-<pack>-<mode>`.

Ripple effects applied with this resolution: the "never hand-set map tokens" rule in `CLAUDE.md`/`AGENTS.md` (originating in ticket 02) is refined to "seeds + algorithms **plus the closed allowlist**"; ticket 07's npm premise was corrected per ticket 17's finding.

Deferred, recorded where they belong: the ink hexes land in the brand-pack implementation pass (consider naming them in ADR-0001 then); ticket 14 must verify the chosen Figma plugin imports DTCG `$type: 'shadow'` composites before the floating shadow exports as a real composite.
