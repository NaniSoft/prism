---
Status: accepted
---

# Token architecture: two Prism tiers in, one antd theme out

`@nanisoft/prism-tokens` has one job: turn a brand pack plus a mode into the single object antd v6 needs, and expose the tiers that object was compiled from as plain data. The package is pure — no React, no runtime dependency on antd, and no build-time dependency on antd's types. Prism owns exactly two token tiers (**primitives** and **semantics**); antd's own three-tier seed → map → alias machine is treated as a *compiler* that Prism feeds, never as Prism's public vocabulary. `createPrismTheme()` returns one object that serves both consumers at once: an `antd` lane that spreads straight into `<ConfigProvider theme={…}>`, and the two tier lanes that feed the docs site, the MCP server, and the Figma-Variables export. Apps never read or write an antd token; `prism-ui` is the only package allowed to.

## 1. `createPrismTheme()` — signature and return type

### 1a. Package shape

- Zero `dependencies`, zero `peerDependencies`, ESM-only, `tsgo`/`tsc` emit with no bundler (plasma recipe, ticket 01). No `antd`, no React, no `@ant-design/cssinjs` at runtime.
- antd's token vocabulary is declared locally as closed string-literal unions (`PrismAntdSeedKey`, `PrismAntdMapKey`), *not* imported from antd. This keeps the package installable in pure-data contexts (Figma plugin, site build, MCP tooling) and makes the antd mapping an explicit, reviewable list rather than an open `AliasToken` hole.
- The antd boundary is enforced at the *consuming* end: `PrismTheme.antd` is a structural type containing only the keys Prism permits, so `theme={prismTheme.antd}` in `prism-ui` typechecks against antd's `ThemeConfig` with no cast. A tripwire test in `prism-ui` asserts every emitted key exists in `theme.getDesignToken()`'s resolved output, so an antd rename breaks the build instead of silently dropping a token.

### 1b. API

```ts
export type PrismPackId = 'blue' | 'green';
export type PrismMode = 'light' | 'dark';

export interface PrismThemeOptions {
  pack: PrismPackId;
  mode: PrismMode;
  /** Semantic-only re-pointing (§5). Apps may override meaning, never antd mechanics. */
  overrides?: PrismThemeOverrides;
}

export interface PrismTheme {
  readonly pack: PrismPackId;
  readonly mode: PrismMode;
  /** Stable antd `cssVar.key`, also the class that carries the baked variables. */
  readonly cssVarKey: string;
  /** ConfigProvider-ready. Spread as <ConfigProvider theme={prismTheme.antd}> — nothing to merge. */
  readonly antd: PrismAntdThemeConfig;
  /** Tier 0, resolved for `mode`. Frozen, plain data. */
  readonly primitives: PrismPrimitiveTokens;
  /** Tier 1, resolved for `mode`. The only tier components and apps consume. */
  readonly semantics: PrismSemanticTokens;
}

export function createPrismTheme(options: PrismThemeOptions): PrismTheme;
/** Convenience for the common no-override case: getPrismTheme('blue', 'dark'). */
export function getPrismTheme(pack: PrismPackId, mode: PrismMode): PrismTheme;
/** The second-brand entry point: validates, freezes, and registers a pack (§4). */
export function defineBrandPack(input: BrandPackInput): BrandPack;
export const prismBrandPacks: Readonly<Record<PrismPackId, BrandPack>>;
/** Tier 0 + 1 as a DTCG document (§2d). Never contains antd tokens. */
export function toDtcg(pack: PrismPackId, mode: PrismMode): PrismDtcgDocument;
/** Single source of truth for the cssVar key scheme, shared with the site's inline script. */
export function prismCssVarKey(pack: PrismPackId, mode: PrismMode): string; // 'prism-blue-dark'
```

**Answer to "theme object, tiers, or both":** both, in one object. Returning a bare antd `ThemeConfig` would couple Prism's public vocabulary to antd's and orphan the docs/MCP/Figma consumers; returning tiers alone would force every app to assemble a theme. `PrismTheme` is deliberately *not* an intersection of antd's `ThemeConfig` — metadata does not ride on the object antd consumes, so nothing extra can leak into antd's merge logic.

**Contracts:**

- **Pure and deterministic.** Same inputs → deep-equal output, no clock, no `Math.random`, no React. This is what lets the site bake both variable sets at build time (ticket 02) and lets tests snapshot themes.
- **Frozen.** `primitives`, `semantics`, and `antd` are deep-frozen; mutating a theme is a runtime error, not a surprise.
- **Memoised.** `getPrismTheme` returns cached instances for the 2 packs × 2 modes; `createPrismTheme` with overrides allocates fresh.
- **No React.** `PrismProvider`, mode switching, and the pre-paint script live in `prism-ui` (ticket 10); the tokens package only supplies `{ antd, cssVarKey }`.

### 1c. `cssVar.key` scheme

`prismCssVarKey` yields `prism-<pack>-<mode>` → `prism-blue-light`, `prism-blue-dark`, `prism-green-light`, `prism-green-dark`, and `createPrismTheme` always sets `cssVar: { key, prefix: 'prism' }, hashed: false`. The key must be explicit (antd otherwise derives it from `useId()`, which is unstable across the build/client boundary — ticket 02) and must carry the *pack* segment too, because a page can legitimately render two packs and each needs its own `--prism-*` namespace. This refines ticket 02's `prism-light` | `prism-dark` sketch, which predates the two-pack decision; the binding rule ("explicit, stable key") is unchanged. The class on `<html>` is therefore the full key (`<html class="prism-green-dark">`), and one blocking inline script owns both the pack and the mode swap.

## 2. Token tiers

### 2a. Tier 0 — primitives (`prism.primitive.*`)

Raw values with no meaning attached. Prism's primitive tier is intentionally *small*: it is the set of inputs to antd's generators plus the raw values antd cannot derive. Prism does **not** maintain 10-step ramps — `@ant-design/colors`-style ramping is exactly what antd's algorithms already do, and duplicating it would create a second source of truth.

| Primitive | Value (blue pack) | Value (green pack) | Notes |
| --- | --- | --- | --- |
| `color.ink.light` / `color.ink.dark` | TBD (human) | TBD (human) | Brand ink per mode; ADR-0001 fixes atmosphere and semantics but not the ink hexes |
| `color.ground.light` | `#F7F9FC` | `#F7FAF8` | Page ground, light (ADR-0001 §1) |
| `color.ground.dark` | `#0B1220` | `#0A1612` | Beam-dark ground = antd `colorBgBase` |
| `color.surface.light` | TBD | TBD | Light-mode container; see §5, decision 5 |
| `color.text.light` / `color.text.dark` | TBD / `#E8EEF9` | TBD / TBD | `colorTextBase` per mode; dark text is fixed by ADR-0001 §2 |
| `color.hairline.light` / `color.hairline.dark` | TBD / `rgba(147,178,255,.16)`-family | TBD | Cool hairlines (ADR-0001 §3) |
| `color.success` | `#16A34A` | = `color.ink.light` | ADR-0001 §8 |
| `color.info` | = `color.ink.light` | `#2563EB` | ADR-0001 §8 |
| `color.warning` / `color.error` | `#D97706` / `#DC2626` | same | Conventional in both packs |
| `space.unit` / `space.step` | `4` / `4` | same | antd's 4px grid, unchanged (ADR-0001 defaults) |
| `shape.radius.sm` / `.base` / `.lg` / `.outer` | `2` / `4` / `6` / `4` | same | Beam-crisp radius family (ADR-0001 §4) |
| `type.family.ui` | `'Archivo Variable', …` | same | `@font-face` ships from `PrismProvider` |
| `type.family.mono` | `'JetBrains Mono', …` | same | Code, token names, annotations |
| `type.size.ui` / `type.weight.strong` | `14` / `600` | same | Stock antd ramp; voice via weight/width |
| `motion.duration.fast` / `.mid` / `.slow` | `80ms` / `160ms` / `280ms` | same | ADR-0001 §6 |
| `motion.curve.standard` | `cubic-bezier(0.25, 1, 0.5, 1)` | same | Strongly decelerating |
| `motion.curve.opacity` | `linear` | same | No antd destination — prism-ui CSS only |
| `elevation.floating.light` / `.dark` | `0 4px 16px rgba(11,18,32,.16)` | TBD (dark alpha) | The single permitted shadow (ADR-0001 §3) |

### 2b. Tier 1 — semantics (`prism.semantic.*`)

Named for meaning; the only tier `prism-ui` components, blocks, pages, and consuming apps read. Every semantic resolves in both modes and every semantic names its antd destination (or explicitly declares none). ~35 tokens total against antd's 234 documented global tokens.

| Semantic | antd destination | Lane |
| --- | --- | --- |
| `surface.ground` | `colorBgLayout` | map allowlist (light mode only; §3) |
| `surface.container` | `colorBgBase` (seed) → `colorBgContainer`, `colorBgElevated` derived | seed |
| `surface.scrim` | `colorBgMask` | map allowlist |
| `text.primary` | `colorTextBase` (seed) → `colorText`, `colorTextHeading` derived | seed |
| `text.secondary` / `.tertiary` / `.faint` | `colorTextSecondary` / `colorTextTertiary` / `colorTextQuaternary` | derived, no override |
| `text.onInk` | `colorTextLightSolid` | derived, no override |
| `ink.primary` | `colorPrimary` **and** `colorLink` (explicitly, not the `colorInfo` fallback) | seed |
| `hairline.strong` | `colorBorder` | map allowlist |
| `hairline.faint` | `colorBorderSecondary`, `colorSplit` | map allowlist |
| `accent.live` (selection/active/pressed flood) | `controlItemBgActive`, `controlItemBgActiveHover`, `colorBgTextActive`, `colorPrimaryTextActive` | map allowlist |
| `focus.ring` | `controlOutline`, `controlOutlineWidth`, `focusOutline`, `lineWidthFocus`, seed `lineWidth` | map allowlist + seed |
| `state.success` / `.warning` / `.error` / `.info` | `colorSuccess` / `colorWarning` / `colorError` / `colorInfo` | seed |
| `shape.radius.sm` / `.base` / `.lg` / `.outer` | `borderRadius` (seed) + `borderRadiusSM`, `borderRadiusLG` (map allowlist — see §2c) | seed + map allowlist |
| `type.*` | `fontFamily`, `fontFamilyCode`, `fontSize`, `fontWeightStrong` | seed + alias |
| `space.unit` / `.step` | `sizeUnit`, `sizeStep` | seed |
| `motion.duration.*` | `motionUnit`, `motionBase` (seed) + `motionDurationSlow` (map allowlist — see §2c) | seed + map allowlist |
| `motion.curve.standard` | `motionEaseOut`, `motionEaseInOut`, `motionEaseOutQuint`, `motionEaseOutCirc` | seed |
| `motion.curve.opacity` | none | prism-ui CSS only |
| `elevation.floating` | `boxShadow` | map allowlist |
| `elevation.none` (in-plane surfaces never shadow) | `boxShadowSecondary`, `boxShadowTertiary` | map allowlist |

### 2c. Tier 2 — the antd mapping: seeds, a closed map allowlist, `components`

Three lanes, in priority order:

1. **Seed tokens.** Where antd offers a seed, Prism sets the seed and lets the algorithm derive: `colorPrimary`, `colorLink`, `colorSuccess`, `colorWarning`, `colorError`, `colorInfo`, `colorBgBase`, `colorTextBase`, `borderRadius`, `lineWidth`, `sizeUnit`, `sizeStep`, `motionUnit`, `motionBase`, `motionEaseOut`, `motionEaseInOut`, `motionEaseOutQuint`, `motionEaseOutCirc`, `fontFamily`, `fontFamilyCode`, `fontSize`. Never `colorBgBase`/`colorTextBase`-adjacent map tokens by hand.
2. **The map-token allowlist (`PrismAntdMapKey`).** Hand-setting map tokens is forbidden *except* where antd's derivation provably cannot express the value. The allowlist is a closed union type, every entry carries a written justification, and a test asserts the emitted keys are a subset of it:

   ```ts
   export type PrismAntdMapKey =
     | 'borderRadiusSM' | 'borderRadiusLG'      // genRadius(4) → 4/4, not 2/6
     | 'motionDurationSlow'                     // motionUnit 0.08 → 240ms, not 280ms
     | 'colorBgLayout' | 'colorBgMask'          // light-mode ground + scrim
     | 'colorBorder' | 'colorBorderSecondary' | 'colorSplit'  // cool hairlines
     | 'controlItemBgActive' | 'controlItemBgActiveHover' | 'colorBgTextActive' | 'colorPrimaryTextActive' // accent flood
     | 'controlOutline' | 'focusOutline'        // hairline focus ring
     | 'boxShadow' | 'boxShadowSecondary' | 'boxShadowTertiary'; // one shadow, or none
   ```

   The two mathematical entries are the reason the allowlist exists and the reason it cannot be waived away. From antd's own source: `genRadius(4)` returns `borderRadiusSM: 4`, `borderRadiusLG: 4`, `borderRadiusOuter: 4` (the `< 6` branch only bumps LG at ≥5), so the Spectral 2/4/6/4 family needs `borderRadius: 4` as a seed plus `borderRadiusSM: 2`, `borderRadiusLG: 6` by hand. And `genCommonMapToken` derives `motionDurationFast/Mid/Slow` as `motionBase + motionUnit × {1,2,3}` seconds, so `motionUnit: 0.08` yields 80/160/**240**ms — the locked 280ms slow duration must be set directly.
3. **`components` overrides.** Only where a *component* token is the only surface that exists, and only with `algorithm: true` set (antd does not re-derive component tokens from seeds unless told to, so a bare override silently behaves as a flat patch):

   ```ts
   components: {
     Button: { primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none', algorithm: true },
     Input:  { activeShadow: 'none', errorActiveShadow: 'none', warningActiveShadow: 'none', algorithm: true },
   }
   ```

   Beam-crisp means flat buttons and hairline focus rings, so every component-level shadow is zeroed; the focus ring comes from `controlOutline`/`focusOutline` instead. Component overrides are enumerated in the pack, never appended ad hoc, and the `algorithm: true` companion is lint-enforced.

### 2d. Where the DTCG / Figma export slots in

The export is a **build output of tiers 0 and 1 only** — antd tokens never reach Figma, because Figma mirrors the design language, not Prism's antd compiler. `toDtcg(pack, mode)` emits one document per pack per mode, written by the package's build script:

```
dist/figma/prism.blue.light.tokens.json
dist/figma/prism.blue.dark.tokens.json
dist/figma/prism.green.light.tokens.json
dist/figma/prism.green.dark.tokens.json
```

- **Shape** (stable DTCG subset only — `$value`, `$type`, `$description`, `$extensions`; the 2025.10 draft's `$extends`/`$root`/color-object forms are deliberately unused): group nesting mirrors the tier trees, token *names* never contain `.`, `{`, `}`, so `primitive.color.ink.light` becomes `primitive → color → ink → light`.
- **Modes**: the light and dark files for a pack share an identical key set (asserted at build time), and the repo-owned plugin (ticket 14) pairs them into one Figma collection with Light/Dark modes.
- **Provenance, not mapping**: each token may carry `$extensions: { 'prism.antd': { seed: 'colorPrimary' } }` for human/agent readers, but the Figma *values* are the resolved Prism values — the antd mapping stays code-side.
- Values are **resolved**, not `{ref}` aliases; the composite `shadow` type is the one risky spot (ticket 04's open `boxShadow` string-syntax item), so the floating shadow is exported as a `$description` plus `$extensions` string until ticket 14 proves the plugin path.

## 3. Dark mode

**Algorithm composition: one algorithm per theme, never an array.** Light mode uses `theme.defaultAlgorithm`, dark mode uses `theme.darkAlgorithm` — nothing else is ever composed into a brand theme. Density is explicitly excluded: `compactAlgorithm` is applied by a nested `<ConfigProvider theme={{ algorithm: theme.compactAlgorithm }}>`, which inherits the pack via antd's default `inherit: true`. Packs therefore stay density-agnostic and `PrismProvider` can offer a `density` prop without touching the pack.

**Beam dark is antd's dark neutral generator fed a tinted base.** This is the load-bearing mechanical fact: `darkAlgorithm.generateNeutralColorPalettes` derives `colorBgLayout = colorBgBase`, `colorBgContainer = base + 8%`, `colorBgElevated = base + 12%`, `colorBgSpotlight = base + 26%` (solid-color mixing toward white). ADR-0001's "surfaces lighten as they elevate" is therefore not hand-authored — it falls out of `colorBgBase = primitive.color.ground.dark` (`#0B1220` / `#0A1612`) plus `colorTextBase` (`#E8EEF9`). Dark mode adds no ground overrides and re-uses the light allowlist with dark-mode values for the entries that must differ (cool hairlines, the floating shadow's alpha, the scrim).

**Light mode is the asymmetric case:** antd's light generator puts the container *at* `colorBgBase` and the layout 4% *darker*, so a tinted page ground and a lighter container cannot both come from the seed. Light mode sets `colorBgBase = primitive.color.surface.light` and allowlists `colorBgLayout = primitive.color.ground.light` (`#F7F9FC` / `#F7FAF8`). Dark mode stays pure seed.

**User override surface:**

- *Mode and pack* are `createPrismTheme` inputs, surfaced by `PrismProvider` as props; the blocking inline script reads the same persisted choice pre-paint so there is no flash.
- *Semantic overrides* (`overrides.semantics`) re-point tier-1 names only — e.g. a destructive panel takes `accent.live` from the error hue. There is no antd-typed override path in v1 (§5, decision 4).
- *Pre-bake contract*: because themes are deterministic and carry stable keys, the site build renders each pack×mode through `@ant-design/static-style-extract@^2.1.0` with `extractStyle(cache, { types: 'cssVar' })` and writes `public/prism-tokens.css` containing all four `.prism-*` rulesets; component CSS stays theme-agnostic, so swapping the `<html>` class is the whole theme switch.

## 4. Brand pack shape

A pack is data, declared through `defineBrandPack()` and validated before it is usable. `BrandPackInput` contains the tier-0 values per mode plus the pack's semantic *choices* (which hue owns `state.success`, whether `color.info` is the ink itself or the other band).

**A second brand may change:**

- every tier-0 color value (ink per mode, grounds, surfaces, hairlines, text, the four state hues);
- which hue is the ink vs. which owns success/info (ADR-0001 §8's blue↔green relationship is a *pack choice*, not a system rule);
- type families (`type.family.ui` / `.mono`) — but a pack that swaps families owns its own `@font-face` delivery; `PrismProvider`'s bundled Archivo/JetBrains set is v1-fixed;
- the floating shadow's geometry within hairline-elevation rules (one shadow, floating layers only);
- nothing else. Any new primitive or semantic name is a system change, not a pack change.

**A second brand must leave alone:**

- the two-tier structure and its naming;
- the antd mapping: which keys are seeds, the contents of `PrismAntdMapKey`, and the `components` enumeration (a pack may change the *values*, never the key set);
- the radius family (2/4/6/4), motion durations and curves, hairline-elevation rules, "one accent owns live states", and beam-dark's lighten-on-elevate behaviour;
- the `cssVarKey` scheme, the DTCG export shape and per-mode key parity, and the frozen-`PrismTheme` contract.

**Validation at `defineBrandPack()`** (fails the build, not the reviewer's eye): every semantic resolves in both modes; every antd key used is `PrismAntdSeedKey ∪ PrismAntdMapKey`; text-on-surface contrast meets WCAG AA (4.5:1 body, 3:1 large/UI); no ground is pure black or pure white (beam rule); packs are deep-frozen on registration; `toDtcg` key parity holds across modes.

## 5. Fidelity rule

**Prism abstracts almost all of antd's token surface.** antd v6 documents 234 global tokens across seed/map/alias and 72 components, each with its own component token set (Button 36, Input 17, Layout 16, Modal 6). Prism exposes ~35 semantics. The rule, in four clauses:

1. **Apps see Prism names only.** No antd imports, no `theme` prop on any `ConfigProvider` an app renders (`PrismProvider` owns the only one), no antd token names in app CSS. Components, blocks, and pages read `prism.theme.semantics`.
2. **`prism-ui` may touch the whole antd surface internally.** It is the implementation of the abstraction, not a consumer of it; when a component needs a token Prism has not named, the obligation is to add a semantic token, not to reach for `token.colorXyz` in app-facing API.
3. **antd's names stay out of Prism's names.** Prism semantics are never `colorPrimaryBg` renamed; where the mapping is not one-to-one, the semantic name wins and the mapping table is the only place the relationship lives.
4. **Escape hatch: none in v1.** No `rawAntd`/`ThemeConfig` input to `createPrismTheme()`. The known future demand is the theme gallery and third-party brand packs (map fog), and that work can graduate an escape hatch when it arrives; shipping one now would re-open the fidelity boundary on day one.

## Considered options

- **Return antd's `ThemeConfig` directly** (pack = theme file): declined — Prism's vocabulary would be antd's, and docs/MCP/Figma would have no tier data to consume.
- **Prism-owned CSS-variable runtime** (the common three-tier design-system shape): declined — duplicates antd's `cssVar` engine and creates a second set of variables to keep in sync with antd's derived values.
- **Hand-set map tokens everywhere**, skipping seeds: declined — antd's own warning on `colorBgBase`/`colorTextBase` and the gradient relationships (`colorPrimaryBg`/`Border`/`Hover`/`Active`) mean hand-set map tokens silently break derivation; hence a closed allowlist with two math-backed entries rather than an open lane.
- **Import antd types for the antd lane** (`peerDependencies` + `import type`): declined — drags antd types into pure-data consumers and softens the boundary, since any `AliasToken` key would typecheck. Closed literal unions plus a runtime drift tripwire keep the mapping honest.
- **`theme.defaultConfig`-style global override**: not available in antd v6 (verified absent from the docs), so the override surface is Prism's own `overrides.semantics`, merged pack-last → override-last in one documented order.

## Consequences

- `prism-tokens` ships with zero dependencies and stays installable by the Figma plugin, the site build, and the MCP server without antd present.
- The 2/4/6/4 radius family and the 280ms slow duration are hand-set by mathematical necessity, and the allowlist is the only sanctioned place that happens.
- `cssVar.key` gains a pack segment (`prism-green-dark`), which the ticket-02 pre-bake recipe must pick up: four rulesets in `prism-tokens.css`, one blocking script that swaps pack and mode.
- Light mode needs a container primitive in addition to the ground primitive; dark mode needs neither.
- `PrismProvider` owns React: mode/pack state, the two OFL `@font-face` rules, the density-nesting behaviour, and the pre-paint script — none of which the tokens package knows about.
- Two brand-ink hex pairs (light + dark, blue + green) are still unpinned; ADR-0001 fixes atmosphere, hairlines, and semantics but not the ink.
- Tests are the enforcement mechanism: determinism, frozen output, allowlist subsetting, DTCG key parity across modes, contrast floors, and the antd-key drift tripwire in `prism-ui`.

## Open questions

Carried as decision points in the ticket (`.scratch/prism/issues/09-token-architecture-spec.md`) — the ADR is not accepted until they are:

1. `PrismTheme` return shape (§1b) — recommendation: the structured object above.
2. Whether `components` overrides belong in v1, and how narrow (§2c) — recommendation: yes, shadow-zeroing only.
3. Whether the map-token allowlist is the right escape from the "seeds + algorithms" rule (§2c) — recommendation: yes, closed and lint-enforced.
4. Whether an antd escape hatch ships in v1 (§5) — recommendation: no.
5. The light-mode `surface.container` primitive (§3) — recommendation: add it.
6. The `wireframe` seed — recommendation: leave `false`; hairline elevation is expressed per component, not by flipping antd's global wireframe mode.
7. The four brand-ink values (§2a) — recommendation: pin them in the pack's implementation pass, not in this ADR.
