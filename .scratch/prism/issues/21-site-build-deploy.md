---
Type: task
Status: resolved
Labels: wayfinder:task
Blocked by: 19, 20
---

## Question

Build `apps/site` for real and deploy it: the IA + template spec (ticket 12's Answer), the Specimen landing page as a real prism-ui page (ticket 11), the flash-free dark-mode pre-bake (ticket 02), wrangler config + custom-domain attach (tickets 03/05/07), and the prism-llms artifact copy + `.md` prefix rewrite (ticket 16). Output: prism.nanisoft.com live.

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand:

- **IA**: flat taxonomy URLs (`/docs`, `/components`, `/blocks`, `/pages`, `/blog`); four doc loaders + blog; sidebars = Prism group + antd's six categories; shell-level pack × mode switcher defaulting beam-dark blue; frontmatter = fumadocs defaults only.
- **Codegen emission** (from [Docs IA and demo format](12-docs-ia-and-demo-format.md)): the site's generate task emits thin stub MDX + `meta.json` from the category table; a component missing from the table fails CI. Full template for wrapped/blocks/pages: header → `Extends` pointer → when-to-use (only prose) → ComponentDemo sequence → generated API tables (via prism-llms' extractor) → prev/next + TOC.
- **ComponentDemo wire**: app-level `Demo` component reads co-located `demos/*.tsx` (self-contained contract); live preview + copy/expand bar.
- **Landing page**: rebuild `/` as a real prism-ui page in the **Specimen direction** — dark-first, antd-loud specimen hero; taxonomy as spatial progression bands; light mode as the "docs in daylight" peek. Variant A stand-in is live on `/`; the full set is preserved on branch `prototype/landing-variants` — raid it.
- **Dark mode**: ticket 02's recipe — explicit `cssVar.key` per theme (`hashed: false`), pre-baked variable sets via `@ant-design/static-style-extract`, inline class-swap.
- **Wrangler** (from [Fumadocs on Workers](03-fumadocs-on-workers.md) + [Remote MCP on Workers](05-remote-mcp-on-workers.md)): static assets dir, `not_found_handling`, `run_worker_first` for the five `.md` sections + `/mcp` + `/mcp/*`; the `.md` rewrite is ticket 16's one prefix rule (`/<section>/<slug>.md` → `/md/<section>/<slug>.md`); fumadocs' own `llms()`/`/api/mcp` stay un-generated; Custom Domain auto-creates DNS on attach.

## Answer

Implemented and deployed 2026-09-19 — **prism.nanisoft.com is live** (Worker `prism-site`, Custom Domain attached; DNS auto-created as ticket 07 predicted).

- **IA**: five loaders (`docs`/`components`/`blocks`/`pages` via fumadocs-mdx `defineDocs`/`defineCollections` + blog with `date`/`tags`/`draft`); optional catch-all routes per section (`/docs` index + `/docs/<slug>` doc) — the optional root is what lets empty sections build under `output: export` (Next requires every dynamic route to emit ≥1 page). Section indexes for components/blocks/pages are grouped by prism-ui's `buildCatalog()` category table (Prism group first, then antd's six) — single-sourced, not scraped from the loader tree.
- **Template**: header → Extends → when-to-use → ComponentDemo sequence → generated API tables (prism-llms' shared `extractProps` over prism-ui's built declarations, rendered per item by `PropsTables`) → prev/next + TOC via prism-ui `DocsShell`; posts via `BlogLayout` with chronological prev/next; drafts excluded from params/index/feed; RSS at `/rss.xml` (`feed` package, summary-only, `force-static`).
- **ComponentDemo wire**: `scripts/generate.mjs` emits the demos registry (`lib/generated/demos.ts`, gitignored) mapping `<section>/<item>/<slug>` → live component + verbatim source; app-level `Demo`/`DemoView` render prism-ui's data-in block with a Code-toggle/Copy bar. No demos exist yet; the wire is tested.
- **Specimen landing**: rebuilt as a real prism-ui page (per-item subpath imports, `DisplayTitle` through a client boundary, nested `PrismProvider` light peek) — hero specimen plate, three progression bands, dithered dividers, daylight card. The prototype stand-in import is gone from `/`.
- **Flash-free theming**: `scripts/bake-antd-css.mjs` pre-bakes the four `prism-<pack>-<mode>` variable rulesets (~250 KB total) by running `@ant-design/static-style-extract` under `PrismProvider` and keeping only the theme-scoped rules; a blocking bootstrap script applies the stored-or-default class before paint; `SiteThemeProvider` syncs React + antd's re-registration on switch. Default: beam-dark blue; persisted in localStorage. The prism-ui font faces are real now — `public/fonts/*.woff2` ship the latin variable subsets (antd's `fontFamily` names 'Archivo Variable' directly).
- **Worker**: `worker/router.ts` rewrites `/<section>/<slug>.md` → `/md/<section>/<slug>.md` for the five sections and reserves `/mcp` (501 stub module — ticket 22 replaces exactly one file). wrangler `run_worker_first` must use GLOB patterns: route-style `:slug*.md` silently never matches (verified live); the working set is `["/mcp", "/mcp/*", "/docs/*.md", …]`.
- **LLM surface**: `scripts/copy-llms.mjs` copies `llms.txt`, `llms-full.txt`, `md/**` into `out/` post-build; `data.json` stays out of the asset surface (ticket 22 bundles it).
- **Consumer-side package fix**: prism-ui's `./styles.css` export was dangling (tsc never copied it); its build now copies the stylesheet (patch changeset).

Deviations / notes: Next 16 prefetch payloads for optional-catch-all roots 404 (cosmetic console noise; navigation falls back to full page loads — a Next static-export quirk). Site search UI (ticket 12 §4) was not part of this ticket's inherited set and is deferred. The ticket-12 `PrismLocale` merge slot still needs its prism-ui home (ruling: no prism-ui API changes here); the site hardcodes English strings.

## Comments

- Reviewed 2026-09-20: spec ✅; one Important fixed in review round 1 (`pnpm dev` now self-sufficient — dev chain generates both gitignored artifacts before `next dev`; `bake` exposed as a named script). Nine minors deferred to the whole-branch review ledger; the OFL font-license text item graduated into ticket 23's THIRD-PARTY-NOTICES pass.
