---
Type: task
Status: resolved
Labels: wayfinder:task
Blocked by:
---

## Question

Implement ADR-0003 for real in `@nanisoft/prism-ui`: wildcard `exports` map with subpath layers `/components|blocks|pages` + per-item entries; antd + `@ant-design/icons` as direct deps; turbo `generate` codegen task (proxy re-exports from installed antd) + `parity.test.ts`; `wrapped-registry.ts` (wrappers gated by the closed 4-item justification list); `PrismProvider` (ConfigProvider → App → children, consumer-last theme merge, locale/direction forward-only); `styles.css` in `@layer prism`.

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand:

- **Registry output feeds two consumers** (from [Docs IA and demo format](12-docs-ia-and-demo-format.md) + [prism-llms shape](16-prism-llms-shape.md)): `wrapped-registry` must carry each item's `antdBase` (pass-through → antd name, wrapper → absent) and the **category table** that both the site's stub-MDX/`meta.json` generation and prism-llms' catalog read.
- **`ComponentDemo` stays a dumb data-in block** (`code: string` + `children`) — no `fs`, no fumadocs; the raw-reading wire is app-level.
- **Pages take Prism-owned structural types** — no `next/*` or fumadocs deps; apps ship `toPrismTree()`.
- **Theme wiring lands on ticket 18's real output**: `PrismProvider` consumes `createPrismTheme()` from prism-tokens; cssVar key `prism-<pack>-<mode>` per ADR-0002.

## Answer

**2026-09-19 — completed.** The claimed first pass had the skeleton (exports map, codegen, styles) but did not compile: extensionless relative imports under `nodenext`, no `@nanisoft/prism-tokens` dependency, a broken `./display-title.js` path, and `PrismProvider` calling `createPrismTheme()` with no arguments. Fixed, extended to the ADR-0003 contract, and verified: **all 13 turbo tasks green** (tokens, ui, site — the site build proving the exports map resolves in a real consumer).

**What landed (auto-applied — veto anything):**

1. **PrismProvider** — `ConfigProvider → App → children`; owns the default theme (`getPrismTheme('blue', 'light')`, per ADR-0003) and the consumer-last merge. Selection is a `prismTheme?: PrismTheme` prop (no pack/mode sugar). Because prism-tokens stays antd-free, `mergePrismTheme`/`toAntdTheme` attach the one algorithm for the theme's mode (`defaultAlgorithm`/`darkAlgorithm` — never an array, ADR-0002 §3).
2. **mergePrismTheme(prismTheme, consumerTheme)** — exported for composition without the provider; deep-merges per key (token, `components[X]` per component), replaces primitives/arrays/functions, never merges by reference. Also accepts a raw `ThemeConfig` base for full control.
3. **wrapped-registry** — now the single catalog both docs consumers read (inherited requirement): `wrappedComponents` (closed 4-justification list; one entry — DisplayTitle/brand-behavior), the category table covering **all** prism-ui items in antd's six doc categories + the Prism group (blocks/pages), and `buildCatalog(passThroughs)` producing `{name, id, layer, antdBase?, category, wrapped?}` — antdBase on pass-throughs only (a wrapper's base is its `antdName`), throws on any uncategorized item. Category data cross-checked against the antd MCP's component list.
4. **Parity tests rewritten** (the old suite depended on `ts-morph`/`type-fest`, which were never installed): regex parsing mirroring the generator; generated set pinned to the installed antd **in both directions** (hard failures, no console.warn cop-out); one proxy module per component and nothing else; wrapped ∩ pass-through = ∅; no hand-written component file; full catalog coverage; wrapper parity (`removedProps` non-empty only under `api-narrowing`).
5. **ADR-0002 tripwire test landed in prism-ui** (§1a): for all four themes, every emitted `antd.token` key must exist in `antdTheme.getDesignToken()`'s resolved output — an antd rename breaks this build, not a consumer's. Light-mode seed identities spot-checked verbatim (beam-dark deliberately re-derives `colorPrimary`, so only presence is asserted there).
6. **Root barrel** — provider + components + blocks + pages; **icons removed from it** (`./icons` stays a separate subpath, ADR-0003).
7. **Blocks/pages restructured to ADR's directories** — `blocks/component-demo/{ComponentDemo.tsx,index.ts}` etc., making the `./blocks/*` and `./pages/*` wildcard exports actually resolve (they pointed at nonexistent `dist/blocks/*/index.js`).
8. **Explicit `.js` extensions everywhere** (ESM-only, `nodenext`); deep antd type import needs it too (`antd/es/typography/Title.js`).
9. **DisplayTitle now matches ADR-0003's own worked example** — `DisplayTitleProps extends TitleProps` with the `width: 'normal' | 'refracted'` axis (the old version invented a props interface and stripped `TitleProps`'s API, which brand-behavior may not do).
10. **ComponentDemo** stays the dumb data-in block per this ticket's refinement of ADR-0003's sketch — `{code, children}` + `language?`; `PageHeader` takes the ADR contract `{title, subtitle?, breadcrumb?, actions?}`. DocsShell/BlogLayout carry modest structural props (nav/toc/neighbours; frontmatter with display-only tags/draft) — the site pass extends additively. All Prism-original items stamp `prism-<name>` classes + `data-prism` markers.
11. **styles.css rules actually live inside `@layer prism { … }`** — the file previously only declared the layer statement; `@font-face` stays outside (not layerable).
12. **package.json** — `@nanisoft/prism-tokens: workspace:*` dependency; `./prototype` subpath export added so the site's landing stand-in (ticket 11) resolves; it is documented in the root barrel as leaving with the site-build pass (ticket 21).

Deliberately unchanged: the license field stays `UNLICENSED` until the go-live pass (ticket 17's sequencing); `PrismPlaceholder` and its test are gone (the ADR's placeholder-replacement consequence).
