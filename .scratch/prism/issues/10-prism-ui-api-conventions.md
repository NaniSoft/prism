---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
Blocked by: 02, 03
---

## Question

Define `@nanisoft/prism-ui` conventions:

- Export surface: barrel structure, subpath organization for components/blocks/pages; what `PrismProvider` owns (ConfigProvider, theme, locale, direction?) vs leaves to apps.
- antd re-export policy: which components pass through untouched, which get Prism wrappers (and what added value justifies a wrapper), how parity is kept when antd upgrades.
- Blocks/pages taxonomy: naming conventions, prop conventions (data-in vs composition-in), how blocks compose components and pages compose blocks.
- Styling extension points for consumers that don't break encapsulation.
- Deprecation/versioning policy across the taxonomy.

Output: written conventions (ADR) prism-ui is implemented against.

## Draft proposal

Drafted as `docs/adr/0003-prism-ui-api-conventions.md` (`Status: proposed` — it becomes `accepted` when the human locks the calls below). Not self-resolved.

- **One package, three subpath layers.** `@nanisoft/prism-ui/{components,blocks,pages}` (+ `/{components,blocks,pages}/*` per-item entries, `/provider`, `/icons`, `/styles.css`) — the taxonomy is organizational, never a second package or version. Names carry no layer suffix; the subpath does (`prism-ui/blocks/page-header` → `PageHeader`).
- **Pass-through by default, generated.** Every antd component Prism doesn't wrap gets a codegen'd proxy re-export, generated from the *installed* antd entry (hermetic, not plasma's upstream-`master` fetch) plus a checked-in turbo `generate` task and a `parity.test.ts` — so antd bump PRs show the delta as a diff, and the "never import antd" invariant is satisfiable and self-healing. antd becomes a *direct* dependency of prism-ui, so pnpm's isolated `node_modules` makes the invariant physical, not lint-enforced.
- **Wrappers are the exception, gated by a closed list.** Justifications: `brand-behavior` (antd tokens can't express it), `api-narrowing`, `invariant`, `upstream-gap` (with a deletion plan). Anything else is a block, not a wrapper. Worked pair in the ADR: `Button` stays a pass-through (every Spectral Refraction delta is a token), `DisplayTitle` is wrapped (the Archivo `wdth` axis is CSS, not `ThemeConfig`). Registry: `src/wrapped-registry.ts`.
- **`PrismProvider` = plasma's `Plasmantine` shape**: extends antd `ConfigProviderProps`, forwards everything, renders `ConfigProvider → App → children`. Owns default theme + consumer-last merge (`mergePrismTheme`), antd `App` mount, and a `link` adapter (`usePrismLink()`). Forwards `locale` and `direction` with no opinion. Never owns data fetching, routing, SSR style extraction, or `<html>` class flipping (app-level, ticket 02 contract: `prism-light`/`prism-dark`).
- **Taxonomy prop rules**: components are composition-in (antd props); blocks are data-in for canonical slots + `ReactNode` slot props (`PageHeader`, `ComponentDemo`); pages are data-in view-model props + `children` (`DocsShell`, `BlogLayout`), with Prism-owned structural types so prism-ui carries **no `next`/`fumadocs-*` dependency** — the app maps loader output via `toPrismTree()`. Zero data fetching anywhere in prism-ui; internal layering (`pages → blocks → components → antd`) lint-enforced, consumer invariant codegen-enforced.
- **Styling extension points in five tiers** (tokens → antd `components[X]` config → documented `className`/`styles`/`data-prism` hooks → `--prism-*` variables + `@layer prism` → composition), with internals off-limits. **Versioning**: one package version; pass-throughs only ever follow antd (antd major = prism-ui major); blocks/pages break on documented-hook breakage, never on internal DOM churn; deprecations are JSDoc + changeset + `prism-llms` section, removed no earlier than next major.

### Decision points for the human

1. **Wrapper justification bar** — closed four-item list + registry (recommended), or case-by-case review? _Recommended: the closed list; it's machine-checkable via `wrapped-registry.ts` and keeps wrapper count in single digits._
2. **antd as direct dependency vs peerDependency of prism-ui** — direct (recommended: single-version guarantee + pnpm isolation physically blocks consumer imports) or peer (consumers pick/pin antd, but the invariant becomes unenforceable)?
3. **Does `PrismProvider` own locale?** _Recommended: forward-only in v1, with a small Prism-locale merge slot added when the first Prism-authored string lands (the `ComponentDemo` copy button, ticket 12) — adopting antd's locale wholesale now would drag in untranslated Prism copy._
4. **Pages layer framework coupling** — Prism-owned structural props + app adapter `toPrismTree()` (recommended: `prism-ui` stays free of `fumadocs-*`), or peer-depend on `fumadocs-core` for `DocsShell`/`BlogLayout` (less app code, but the npm package is coupled to a docs framework)?
5. **Router seam** — `PrismProvider link={Component}` + `usePrismLink()` (recommended: set once, no `next` import in the package), or per-block `renderLink`/`as` props (more explicit, repeated at every call site)?
6. **CSS delivery** — app-imported `@nanisoft/prism-ui/styles.css` in `@layer prism` (recommended: keeps `"sideEffects": []` honest, cascade order app-owned), or `PrismProvider` importing it plasma-style (zero setup steps, but bundler side-effect semantics)?
7. **`@ant-design/x` in v1?** _Recommended: not re-exported in v1; it becomes a prism-ui dependency when the AI-blocks fog graduates, so apps never import `@ant-design/x` directly either._
8. **Direction/RTL** — forward-only and honestly documented as untested (recommended), or do we commit v1 to RTL support and add it to the visual-regression backlog now?

### Suggested follow-ups (not done here — outside this ticket's file scope)

- `packages/ui/package.json` needs the wildcard `exports` map, `antd` + `@ant-design/icons` deps, and the turbo `generate` task — belongs to the implementation ticket that lands the real surface (replaces `PrismPlaceholder`).
- `CONTEXT.md` glossary candidates: **pass-through component**, **wrapped component**, **block**, **page** (the taxonomy terms are currently only in the map's Notes).
- Ticket 16 (`prism-llms` shape): add the pass-through pointer ("N antd components re-exported unchanged — see antd's `llms.txt`, but import from `@nanisoft/prism-ui`") and `## Blocks` / `## Pages` sections to the per-item MD format.
- Release tooling (ticket 01's scripts): extend the changeset validator so an antd-bump PR's changeset must state what antd added/deprecated/removed.
- Numbering note: this file is **0003** but no 0002 exists yet — ticket 09's token ADR will presumably take it. If 09 lands elsewhere, renumber this file rather than leaving a gap.

## Answer

Resolved 2026-09-14 — human ratified the draft in full ("all four as recommended"). ADR-0003 status → **accepted**.

Adopted, per the draft's recommendations: three subpath layers with per-item entries; pass-through by default via hermetic codegen from installed antd + `parity.test.ts`; wrappers gated by the closed four-item justification list + `wrapped-registry.ts`; antd as a direct dependency of prism-ui; `PrismProvider` forwards locale/direction only (no locale ownership in v1 — a Prism-locale merge slot arrives with the first Prism-authored string); pages take Prism-owned structural types with an app-side `toPrismTree()`; router seam = `link` on `PrismProvider` + `usePrismLink()`; CSS is app-imported (`styles.css` in `@layer prism`); `@ant-design/x` not re-exported in v1; RTL forward-only and documented untested.

The numbering note above is moot — ticket 09 landed as ADR-0002 in the same batch, so 0001–0004 is continuous. Remaining follow-ups belong to implementation tickets, not decisions here: wildcard `exports` map + deps + turbo `generate` task in `packages/ui/package.json`; `CONTEXT.md` glossary terms (pass-through, wrapped component, block, page); ticket 16's per-item `## Blocks`/`## Pages` sections + pass-through pointer; changeset-validator rule for antd-bump PRs.
