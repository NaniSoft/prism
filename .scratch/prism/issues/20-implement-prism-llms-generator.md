---
Type: task
Status: resolved
Labels: wayfinder:task
Blocked by: 18, 19
---

## Question

Build the `@nanisoft/prism-llms` generator against [prism-llms shape](16-prism-llms-shape.md)'s Answer — that Answer is the spec this task implements. Nothing to decide here except implementation detail: the `dist/` inventory (`data.json` / `llms.txt` / `llms-full.txt` / `md/` mirror tree), the authority split (MDX prose · prism-ui `dist` `.d.ts` props · `demos/*.tsx` verbatim · `antdBase` from the registry · 4 theme atoms from prism-tokens), the extractor (homed here, exported for the site's API tables), and the `prism-llms#check` drift gate wired into the CI PR workflow.

## Inherited requirements

- **The 7 check invariants** (ticket 16 §3) are acceptance criteria, not aspirations: item↔MDX coverage, demo self-contained contract, cross-ref resolution, frontmatter descriptions, `data.json` ↔ `PrismDocsStore` validation, link/mirror completeness, build-twice byte-compare.
- **`data.json` validation** via type-only devDependency on prism-mcp-server (its canonical `PrismDocsStore` home).
- **Deterministic, byte-stable emit** — sorted, stable order; `dist/` never committed.
- **Changeset convention**: prism-ui changes that alter the corpus ship a prism-llms changeset in the same PR.

## Answer

Implemented 2026-09-19. The generator is built against [prism-llms shape](16-prism-llms-shape.md) and all seven check invariants hold: `pnpm exec turbo run lint test check build` is 15/15 green (86 tests, 0 lint warnings), and the demo pipeline was smoke-tested end-to-end with real demos (thrownaway afterwards — the committed corpus is the honest stub state).

### What landed

- **`scripts/build.mjs` — the generator.** Exports `emit(outDir)` (reused by check + tests); `--out` overrides `dist/`. Three lanes exactly per the spec: `data.json` (PrismDocsStore projection, key order = the ADR's field order), `llms.txt` (H1 + blockquote + Guides/Components/Blocks/Pages/Theming sections, absolute `https://prism.nanisoft.com/md/…` links, sections only when non-empty), `llms-full.txt` (guides → items → themes, `---`-separated), and the `md/` mirror (`docs/`, `components/`, `blocks/`, `pages/`, `blog/` lane-only, `theme/`). Byte-stable: CRLF-normalised reads, sorted keys/orders, 2-space JSON + trailing LF.
- **The extractor** (`src/extractor.ts`, exported at `./extractor`): reads prism-ui's built `.d.ts` and returns `*Props` interfaces with TSDoc descriptions and `@defaultValue` tags. **Compiler-API-free** — TypeScript 7 no longer ships the JS compiler API, so it is a small structural scanner for the declaration shape prism-ui emits (brace-balanced, comment-aware, multi-line object literals verified). ADR-0003's cosmetic-risk clause covers any gnarly-union infidelity. Root export stays compiler-free; `./extractor` is the build-tooling subpath.
- **Props → store:** only interfaces with ≥1 own prop become the `props` field + the appended `## Props` table. Pass-throughs carry **no** `props` field — their MDX already ends `_No additional props beyond the antd base component._` (the ADR-0004 seam). Wrappers keep `antdBase` absent (base rides the `Extends` note).
- **Content contract** (what the generator reads — ticket 21's loaders adopt it): `apps/site/content/docs/<slug>.mdx` (guides), `content/{components,blocks,pages}/<id>/index.mdx` + `demos/*.tsx` (example id = filename slug; optional `title="…"` attr becomes the fence label and `examples[].title`), `content/blog/<slug>/index.mdx`. Frontmatter = fumadocs defaults; `description` is **required** everywhere (invariant 4 — it is the llms.txt bullet).
- **`scripts/generate-content.mjs` — the stub generator** (ticket 12's thin pages): import fence + `Extends` pointer + antd.dev link + the no-additional-props seam line for pass-throughs; wrapper/page/block variants with registry justification. Runs today as `pnpm --filter @nanisoft/prism-llms generate-content` and emitted the committed 75 stubs + three `meta.json` sections (Prism group first, then antd's six categories as fumadocs separators). **Only marker-carrying stubs (`{/* prism:generated-stub v1 */}`) are ever rewritten or removed** — hand-authored docs are untouchable; stale stubs are deleted on catalog shrink. Ticket 21 wires the site's `generate` task to this one script (single implementation).
- **Cross-refs:** `## Blocks` / `## Pages` derived by scanning each item's demos' `@nanisoft/prism-ui` imports (`scanPrismImports` — catalog names, aliases resolved to originals, type-only specifiers skipped), verified against the catalog.
- **Theme atoms:** `getPrismTheme()` over blue|green × light|dark from prism-tokens' dist → `# Theming — X pack · y mode` + `createPrismTheme()` snippet + tier-0/tier-1 tables + the antd token lane (seeds + the 16-key allowlist result) + the shadow-zeroing note. Slug `<pack>-<mode>`.
- **`PrismDocsStore`** landed in its canonical home (prism-mcp-server, per the spec) — plus **`parsePrismDocsStore(value)`**: a JSON import widens `kind` to `string`, so only a runtime guard validates the literals; the check runs it over the emit and tsc assigns the result to the interface (invariant 5, both halves real). Ticket 22's factory can reuse it at the door.
- **Catalog single-sourcing:** prism-ui's codegen now also emits `src/generated/pass-throughs.ts`, and `./wrapped-registry` + `./generated/pass-throughs` are export subpaths — prism-llms calls the one `buildCatalog()` (the throwing category gate is the source-side coverage check).

### The drift gate

`prism-llms#check` (`scripts/check.mjs`), wired as a turbo `check` task (`dependsOn: ["^build", "build"]`), root `pnpm check`, and a CI PR-workflow step. Build-fresh: emits twice into `.turbo/check/{a,b}` and byte-compares (invariant 7), then asserts demos' self-contained contract (imports only `@nanisoft/prism-ui*` + `react`, default export required — this gate is the contract's enforcement point), ComponentDemo ids resolve, imported cross-ref names exist, descriptions non-empty, `parsePrismDocsStore` + tsc over `data.json`, every `llms.txt` link target emitted, and mirror completeness for every item/guide/blog/theme atom.

### Vetoes / deviations (implementation detail, spec otherwise intact)

- Extractor is compiler-free instead of TS-API-based (TS 7 dropped the JS API) — same inputs, same outputs, fewer deps.
- The stub script lives in prism-llms rather than `apps/site/scripts` — it owns catalog→corpus coverage and shares the catalog imports; the site's `generate` task will simply invoke it.
- `content/<section>/<item>/` replaces ticket 12's loose `content/docs/<section>/<item>/` phrasing — per-section loaders (its own decision) need section roots.

**Unblocks [ticket 21](21-site-build-deploy.md)** — its inherited IA/template requirements now have the corpus, the extractor (`./extractor` for API tables), the stub generator, and the Markdown lane helpers (`parseMdx`, `renderComponentDemos`, `stripMdxMechanics`) to build against.
