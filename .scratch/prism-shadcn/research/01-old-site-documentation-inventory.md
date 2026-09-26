# Old Prism site: documentation content inventory

**Ticket:** `.scratch/prism-shadcn/issues/01-old-site-documentation-inventory.md`
**Subject:** `github.com/NaniSoft/prism` @ `main` (commit `af80270a0d2aeec416752ac87f7d878f8dbdf41c`, 2026-09-25), and `https://prism.nanisoft.com`
**Date:** 2026-09-26
**Method:** GitHub REST `git/trees` + `raw.githubusercontent.com` + live site fetches. No clone.

---

## Read this first — three findings that change the ticket's premises

### 1. The per-item documentation is 100% machine-generated. There is no hand-written prose to classify.

All 43 files at `apps/site/content/{components,blocks,pages}/<item>/index.mdx` are emitted by
`stubMdx()` in `packages/llms/scripts/generate-content.mjs` and carry the marker
`{/* prism:generated-owned v2 */}`. They contain **zero `##` headings**. Every one is the same
template with the item name interpolated. The generator refuses to overwrite a file that has lost
its marker, so an authored page *could* exist — but in `main` none does.

Git history confirms this was never otherwise. `apps/site/content/components/button/index.mdx` has
exactly two commits (`f31fb25c` 2026-09-19, `af80270a` 2026-09-25). At `f31fb25c` it was the v1
antd pass-through stub:

```
{/* prism:generated-stub v1 */}
`Button` is antd's [Button](https://ant.design/components/button), re-exported unchanged.
- Extends: antd **Button` — for inherited props and demos, use the antd MCP (`antd_info Button`).
```

Also generated. So the "43 items × N sections" classification in question 3 has almost no authored
prose behind it. What it actually has is: **43 one-line descriptions in `packages/ui/src/catalog.ts`,
19 authored demo `.tsx` files, and a fixed 452-byte template repeated 43 times.**

### 2. The "six guides" the ticket names are plasma's, not the old Prism site's.

The ticket says: *"The old map claims six guides (About Content, Audience, Voice, Writing mechanics,
Product vocabulary, Glossary)."* Those six titles are plasma's `@content/*` group. Confirmed from
`https://plasma.coveo.com/index.json`:

```
@content/About Content, @content/Audience, @content/Voice,
@content/Writing mechanics, @content/Product vocabulary, @content/Glossary
```

and from `https://plasma.coveo.com/llms.txt`, which publishes that group as `## Content Guidelines`
(Glossary, Product Vocabulary, Target Audience, Voice, Writing Mechanics).

The old Prism site has six guides too, and the count is right, but the **names are entirely
different**: Quickstart, Architecture, Composition, Theming, Agent workflow, Brand policy. Full list
in §2.

### 3. The blog has never had a post.

`apps/site/content/blog/` contains exactly one file, `.gitkeep`, 0 bytes. The path has one commit in
its whole history (`721b5f43`, 2026-09-19, the initial site build). Live confirmation:

- `https://prism.nanisoft.com/blog` renders the empty state: *"Nothing published yet. Posts land as
  `content/blog/<slug>/index.mdx` — folder-per-post, required date, display-only tags."*
- `https://prism.nanisoft.com/rss.xml` is a valid feed with **zero `<item>` elements** and
  `<lastBuildDate>Thu, 01 Jan 1970 00:00:00 GMT</lastBuildDate>`.

The blog is fully built infrastructure around an empty directory. **There is no blog content to
carry over.** Question 4's answer is "none", not "here is the list".

---

## 1. Full route and section map of `apps/site`

Next.js 16 App Router, `output: 'export'` (`apps/site/next.config.ts`, 670 B), served as Cloudflare
Workers Static Assets by `apps/site/worker/` with a custom domain for `prism.nanisoft.com`
(`apps/site/wrangler.jsonc`, 1,640 B).

### 1.1 Routes

| Route file | Bytes | URL(s) | Loads | Content provenance |
|---|---:|---|---|---|
| `app/layout.tsx` | 1,265 | shell | `@nanisoft/prism-ui/styles.css`, `./globals.css` (43,611 B), `SiteHeader`/`SiteFooter`, inline `THEME_BOOTSTRAP_SCRIPT` | authored TSX; global CSS is the old visual identity |
| `app/page.tsx` | 13,894 | `/` | `buildCatalog()` (43 entries); 7 inline prose sections | **authored TSX**; item list generated from `packages/ui/src/catalog.ts` |
| `app/docs/[[...slug]]/page.tsx` | 3,000 | `/docs`, `/docs/<slug>` | `docsSource` → `content/docs/*.mdx` | **authored MDX**, 6 files |
| `app/components/[[...slug]]/page.tsx` | 2,323 | `/components`, `/components/<item>` | `componentsSource` | **generated MDX stubs** |
| `app/blocks/[[...slug]]/page.tsx` | 2,233 | `/blocks`, `/blocks/<item>` | `blocksSource` | **generated MDX stubs** |
| `app/pages/[[...slug]]/page.tsx` | 2,231 | `/pages`, `/pages/<item>` | `pagesSource` | **generated MDX stubs** |
| `app/blog/[[...slug]]/page.tsx` | 4,023 | `/blog`, `/blog/<slug>` | `blogSource` → `content/blog/*/index.mdx` | authored code, **zero content** |
| `app/themes/page.tsx` | 6,628 | `/themes` | `getPrismTheme`, `prismBrandPacks` from `@nanisoft/prism-tokens`; no MDX | **authored TSX** with inline prose |
| `app/rss.xml/route.ts` | 1,394 | `/rss.xml` | `blogSource`, `feed` pkg, `force-static` | generated from blog (currently 0 items) |
| `app/not-found.tsx` | 840 | 404 (`not_found_handling: "404-page"`) | — | authored |
| `app/icon.svg` | 646 | favicon | — | authored |

Content loaders: `apps/site/lib/source.ts` (2,072 B) — five `fumadocs-mdx` collections
(`docs` via `defineDocs`, `components`/`blocks`/`pages`/`blog` via `defineCollections`), each with
`baseUrl` `/docs`, `/components`, `/blocks`, `/pages`, `/blog`. Blog schema extends `pageSchema`
with `date: z.string()` (required), `tags: z.array(z.string()).default([])`,
`draft: z.boolean().default(false)`.

### 1.2 Routes served by the Worker, not the static export

Defined in `apps/site/worker/router.ts` (2,729 B), gated by `run_worker_first` in `wrangler.jsonc`:

| Path | Source |
|---|---|
| `/mcp`, `/mcp/*` | `apps/site/worker/mcp.ts` → `@nanisoft/prism-mcp-server` |
| `/<section>/<slug>.md` for `section ∈ {docs, components, blocks, pages, blog}` | rewritten to `/md/<section>/<slug>.md`, served from `packages/llms/dist/md/` copied into `out/` |
| `/llms.txt`, `/llms-full.txt` | `packages/llms/dist/`, copied into `out/` — plain static assets |

There is **no `/sitemap.xml` and no `/robots.txt`** — both 404 (verified live; the 404 body is the
`noindex` not-found page).

### 1.3 Section index pages

All five collection roots render `apps/site/components/SectionIndex.tsx` (1,534 B) and all five
per-item routes render `apps/site/components/DocArticle.tsx` (2,255 B). Differences:

- `/docs` — `docGroups()` in `app/docs/[[...slug]]/page.tsx` returns one flat group titled
  `Guides`, pinned so `/docs/quickstart` is always first, then alphabetical by title.
- `/components`, `/blocks`, `/pages` — `catalogGroups(layer)` in `lib/section-catalog.ts` (1,617 B)
  groups by `CatalogCategory` in a fixed order: Actions, Forms, Navigation, Overlays, Data display,
  Feedback, Foundations, Layout, Compositions. `GroupOrder`/`GROUP_LABELS` are hardcoded there.
- `/blog` — reverse-chronological list, empty state shown.

Nav labels come from `apps/site/components/SiteHeader.tsx`: `Build` (Components, Blocks, Pages),
`Learn` (Docs, Themes), `Journal` (Blog), plus `/llms.txt`, `/docs/quickstart#for-agents`,
`/docs/brand` in the footer/utilities.

### 1.4 The three build scripts

**`apps/site/scripts/generate.mjs` (1,410 B)** — two duties, both codegen, both deterministic:

1. Calls `generateContent(CONTENT_ROOT)` imported from `packages/llms/scripts/generate-content.mjs`.
   Writes a stub `index.mdx` for every catalog item whose file is missing or still carries a
   generated marker, deletes directories for catalog items that no longer exist, and rewrites
   `content/{components,blocks,pages}/meta.json` (title + `---Category---` separators + `pages` array).
2. Calls `generateDemosRegistry()` from `apps/site/scripts/lib/generate-demos.mjs` (2,942 B), which
   walks `content/<section>/<item>/demos/*.tsx` for `section ∈ {docs, components, blocks, pages, blog}`
   and emits `lib/generated/demos.ts`: a `Record<string, { Component, code }>` keyed
   `<section>/<item>/<slug>`, where `code` is the demo file's source embedded verbatim at codegen time.

**`apps/site/scripts/copy-llms.mjs` (1,312 B)** — copies three artifacts from
`packages/llms/dist/` into `apps/site/out/`: `llms.txt`, `llms-full.txt`, and the whole `md/` mirror
tree. `data.json` is deliberately **not** copied — the Worker bundles it from the package at build
time, to keep the corpus out of the public asset surface.

**`apps/site/scripts/stamp-mcp-data.mjs` (2,162 B)** — `stat()`s `packages/llms/dist/data.json`,
takes its mtime as the corpus build date, and writes
`apps/site/worker/generated/mcp-data-built.ts` exporting
`PRISM_DOCS_BUILT: string | undefined`. `worker/mcp.ts` passes that to
`createPrismMcpServer(store, { built })` for the `list_items` header. A missing `data.json` throws
(a missing corpus is a broken build); an unreadable mtime emits `undefined` so the header omits the
clause rather than fabricating a date. The generated module is gitignored.

### 1.5 Per-item doc page anatomy

`DocArticle` (2,255 B) renders `DocsShell` from `@nanisoft/prism-ui/pages` with the sidebar tree
(fumadocs page tree → `DocsNavEntry[]` via `lib/to-prism-tree.ts`, 1,476 B), a TOC rail filtered to
`depth >= 2 && depth <= 3`, and prev/next from `findNeighbour`. Inside `.site-prose` it renders the
compiled MDX body through `getMdxComponents({ itemKey })` (`lib/mdx-components.tsx`, 1,090 B — the
only custom MDX mapping is `ComponentDemo` → `<Demo id={`${itemKey}/${id}`} />`), then
`<PropsTables itemKey={itemKey} />` (`components/PropsTables.tsx`, 1,636 B) which reads
`packages/ui/dist/<layer>/<id>/*.d.ts` at prerender via `lib/item-props.ts` (1,603 B) and renders
one `## API` table per extracted `*Props` interface.

The site uses **headless fumadocs** — `fumadocs-core` only, no `fumadocs-ui`. All HTML is owned by
the site (`app/globals.css`).

---

## 2. The guides

Six guides, all authored MDX at `apps/site/content/docs/`. Order is pinned in
`apps/site/content/docs/meta.json` (91 B):

```json
{ "pages": ["quickstart", "architecture", "composition", "theming", "agents", "brand"] }
```

| # | Title | Source path | Source bytes | Emitted `.md` | Words | `##` sections |
|---:|---|---|---:|---:|---:|---|
| 1 | Quickstart | `apps/site/content/docs/quickstart.mdx` | 2,994 | 2,967 | ~395 | Install Prism · Load the owned stylesheet · Wrap the app · Import the first component · Compose upward · For agents |
| 2 | Architecture | `apps/site/content/docs/architecture.mdx` | 2,948 | 2,906 | ~409 | The package boundary · Three composition layers *(Components / Blocks / Pages)* · Source-to-corpus pipeline · Styling contract |
| 3 | Composition | `apps/site/content/docs/composition.mdx` | 2,364 | 2,328 | ~320 | Start with a component · Promote repetition into a block · Compose a page last · Composition rules · Explore the catalog |
| 4 | Theming | `apps/site/content/docs/theming.mdx` | 2,432 | 2,406 | ~355 | Registered packs · Create a theme · Semantic overrides · Flash-free switching · What not to theme · Theme gallery |
| 5 | Agent workflow | `apps/site/content/docs/agents.mdx` | 2,145 | 2,119 | ~316 | Fast path · Configure the MCP · Eight tools · Import contract for generated code · Truth rules |
| 6 | Brand policy | `apps/site/content/docs/brand.mdx` | 1,844 | 1,804 | ~298 | What is ours · What you may do · What you may not do · Status |
| | **Total** | | **14,727** | **14,530** | **~2,093** | 29 `##` + 3 `###` |

Frontmatter is fumadocs defaults only — `title` and `description`, no nesting, no implementation
metadata. `lib/source.ts` says so explicitly: *"Frontmatter = fumadocs defaults only — no authored
implementation metadata; `description` is required in practice (prism-llms' drift gate asserts it)."*

Descriptions, verbatim:

- Quickstart — "Install Prism, wrap an app once, and ship the first accessible themed component from one package."
- Architecture — "How Prism keeps accessible primitives, owned recipes, package exports, docs, and agent data on one source of truth."
- Composition — "Choose the right Prism layer and compose components, blocks, and pages without copying design-system code."
- Theming — "Use Prism's five pastel packs, light and beam-dark modes, semantic overrides, and flash-free theme delivery."
- Agent workflow — "Give an AI agent the same owned catalog, examples, tokens, and source that power the human documentation."
- Brand policy — "What the MIT license covers, what it doesn't, and how the Prism and NaniSoft names may be used."

### 2.1 Prose pages that are **not** in the guides collection

These carry real written content but live in TSX, not MDX, so they are not in `llms.txt`, not in the
`md/` mirror, and not in `data.json`:

| URL | File | Bytes | Authored prose |
|---|---|---:|---|
| `/` | `apps/site/app/page.tsx` | 13,894 | 7 headings + 19 prose runs: "Install Prism", "Compose the smallest layer", "Read the same source agents use", "Five packs. Two modes. One grammar.", "One checked source. Four useful doors.", "Build the product, not around it.", plus the catalog search block "Search all 43 checked items." |
| `/themes` | `apps/site/app/themes/page.tsx` | 6,628 | "One beam, five refractions." lede, "Every island is live: try the local controls…", "Every expression is one factory call." foot, and a `createPrismTheme()` snippet |
| 404 | `apps/site/app/not-found.tsx` | 840 | "This page does not exist. The docs live at /docs, the catalog at /components — and agents read /llms.txt." |
| `/blog` empty state | `app/blog/[[...slug]]/page.tsx` | — | "Nothing published yet. Posts land as `content/blog/<slug>/index.mdx` — folder-per-post, required date, display-only tags." |
| `/rss.xml` | `app/rss.xml/route.ts` | — | feed title + description strings |

### 2.2 No other prose surface exists

`apps/site/src` **does not exist**. The site has no `src/` directory; all site code is at
`apps/site/{app,components,lib,scripts,worker,test}`. Total `apps/site` content: 6 guides, 43 item
stubs, 19 demos, 3 `.gitkeep`/stub files, 4 `meta.json`.

---

## 3. Per-item documentation, item by item

### 3.1 There are no MDX sections

Every one of the 43 files is this template (`packages/llms/scripts/generate-content.mjs`,
`stubMdx()`), with `<Item>` and `<noun>` interpolated:

```mdx
---
title: "<Name>"
description: "<catalog description>"
---
{/* prism:generated-owned v2 */}

```ts
import { <Name> } from '@nanisoft/prism-ui/<layer>/<id>';
```

<Name> is a Prism-owned <noun>. Its behavior, public props, and Spectral Refraction recipe ship together from `@nanisoft/prism-ui`.

- Import only from `@nanisoft/prism-ui`.
- Keep the component inside `PrismProvider` when it uses an overlay, popup, or nested theme scope.
- Use `className` for layout composition; visual state stays in the Prism recipe and CSS variables.

<ComponentDemo id="basic" title="<Name>" />      ← 19 of 43 only
```

So I classify **structural blocks** instead of MDX headings:

| ID | Block | Present on | Authored? |
|---|---|---:|---|
| **S1** | frontmatter `description` (the `title` is just the name) | 43 | **yes** — `packages/ui/src/catalog.ts` |
| **S2** | ` ```ts ` import fence | 43 | no — template |
| **S3** | one-sentence paragraph ("…Spectral Refraction recipe…") | 43 | no — template |
| **S4** | the three bullets | 43 | no — template |
| **S5** | `<ComponentDemo id="basic">` | 19 | no (element) / yes (the `.tsx` it renders) |
| **S6** | `## API` table on site / `## Props` in corpus, from built `.d.ts` | 34 | no — extracted |
| **S7** | `## Blocks` / `## Pages` cross-ref list | 5 | no — derived from demo imports |

### 3.2 Per-item table

Sizes: `mdx` = source MDX bytes (GitHub tree); `emit` = live `https://prism.nanisoft.com/md/<layer>/<id>.md`
bytes. `demo` = the co-located `demos/basic.tsx` size, `—` = none.

**Components — 29**

| Item | mdx | emit | demo | S1 class | S5 | S6 | S7 |
|---|---:|---:|---:|---|:-:|:-:|:-:|
| accordion | 586 | 523 | — | portable-verbatim | | | |
| alert | 576 | 763 | — | portable-verbatim | | ✓ | |
| avatar | 579 | 739 | — | portable-verbatim | | ✓ | |
| badge | 570 | 667 | — | portable-verbatim | | ✓ | |
| breadcrumb | 596 | 533 | — | portable-verbatim | | | |
| button | 636 | 1,701 | 761 | portable-verbatim | ✓ | ✓ | |
| card | 576 | 635 | — | **coupled** | | ✓ | |
| checkbox | 594 | 738 | — | portable-verbatim | | ✓ | |
| dialog | 633 | 2,251 | 1,703 | portable-verbatim | ✓ | | |
| drawer | 587 | 524 | — | portable-verbatim | | | |
| empty | 575 | 746 | — | portable-verbatim | | ✓ | |
| field | 628 | 2,023 | 1,199 | portable-verbatim | ✓ | ✓ | |
| icon | 579 | 707 | — | portable-verbatim | | ✓ | |
| input | 577 | 746 | — | portable-verbatim | | ✓ | |
| kbd | 538 | 475 | — | portable-verbatim | | | |
| pagination | 590 | 753 | — | portable-verbatim | | ✓ | |
| popover | 590 | 527 | — | portable-verbatim | | | |
| progress | 609 | 832 | — | portable-verbatim | | ✓ | |
| radio-group | 598 | 732 | — | portable-verbatim | | ✓ | |
| select | 616 | 2,211 | 1,529 | portable-verbatim | ✓ | ✓ | |
| separator | 590 | 716 | — | portable-verbatim | | ✓ | |
| skeleton | 596 | 699 | — | portable-verbatim | | ✓ | |
| slider | 587 | 1,082 | — | portable-verbatim | | ✓ | |
| switch | 605 | 1,378 | 700 | portable-verbatim | ✓ | ✓ | |
| table | 584 | 521 | — | portable-verbatim | | | |
| tabs | 577 | 1,140 | — | portable-verbatim | | ✓ | |
| textarea | 605 | 672 | — | portable-verbatim | | ✓ | |
| tooltip | 597 | 534 | — | portable-verbatim | | | |
| typography | 594 | 1,110 | — | **coupled** | | ✓ | |

**Blocks — 9**

| Item | mdx | emit | demo | S1 class | S5 | S6 | S7 |
|---|---:|---:|---:|---|:-:|:-:|:-:|
| application-shell | 675 | 3,937 | 2,675 | portable-verbatim | ✓ | ✓ | ✓ → DataTable, PageHeader |
| auth-form | 639 | 2,170 | 1,318 | portable-verbatim | ✓ | ✓ | |
| component-demo | 644 | 1,972 | 1,139 | **coupled** | ✓ | ✓ | |
| data-table | 640 | 3,911 | 3,358 | portable-verbatim | ✓ | | |
| page-header | 635 | 2,471 | 1,574 | portable-verbatim | ✓ | ✓ | |
| settings-panel | 646 | 3,370 | 2,486 | portable-verbatim | ✓ | ✓ | |
| site-footer | 639 | 2,063 | 1,138 | **coupled** | ✓ | ✓ | |
| site-header | 652 | 2,174 | 1,197 | **coupled** | ✓ | ✓ | |
| stat-card | 635 | 2,432 | 1,510 | portable-verbatim | ✓ | ✓ | |

**Pages — 5**

| Item | mdx | emit | demo | S1 class | S5 | S6 | S7 |
|---|---:|---:|---:|---|:-:|:-:|:-:|
| auth-page | 640 | 3,640 | 2,659 | **portable-after-edit** | ✓ | ✓ | ✓ → SiteHeader |
| blog-layout | 641 | 5,032 | 4,029 | portable-verbatim | ✓ | ✓ | ✓ → SiteFooter, SiteHeader |
| dashboard-page | 668 | 5,879 | 4,634 | portable-verbatim | ✓ | ✓ | ✓ → DataTable |
| docs-shell | 653 | 4,935 | 3,652 | portable-verbatim | ✓ | ✓ | ✓ → SiteFooter, SiteHeader |
| settings-page | 656 | 4,380 | 3,312 | portable-verbatim | ✓ | ✓ | |

**Totals:** 43 MDX files, **26,231 bytes** of source (avg 610). Emitted per-item corpus **75,642
bytes** — components 26,678 / blocks 24,500 / pages 23,866 *characters*, which is 598 more bytes than
characters once the `→` and `—` in cross-references and demo code are counted as UTF-8.

### 3.3 Classification counts

**By block type, across all 43 items (230 section instances):**

| Block | portable-verbatim | portable-after-edit | coupled | absent |
|---|---:|---:|---:|---:|
| S1 frontmatter description | 37 | 1 | **5** | 0 |
| S2 import fence | 0 | 0 | **43** | 0 |
| S3 paragraph | 0 | 0 | **43** | 0 |
| S4 three bullets | 0 | 0 | **43** | 0 |
| S5 `<ComponentDemo>` | 0 | 0 | **19** | 24 |
| S6 `## Props` / `## API` | 0 | 0 | **34** | 9 |
| S7 cross-ref section | 0 | 0 | **5** | 38 |
| **Total** | **37** | **1** | **192** | |

**37 / 230 = 16.1% portable-verbatim. 1 / 230 = 0.4% portable-after-edit. 192 / 230 = 83.5% coupled.**

The entire portable-verbatim class is 37 one-line descriptions totalling **2,559 bytes**. Against
the 75,642-byte emitted per-item corpus, that is **~3.4%**.

### 3.4 Every `coupled` section, listed explicitly

**S1 — the five coupled descriptions** (verbatim, with the coupling named):

1. `apps/site/content/components/card/index.mdx` — *"A **hairline-elevated** surface for one related body of content."* → "hairline" is Spectral Refraction's depth vocabulary.
2. `apps/site/content/components/typography/index.mdx` — *"Prism text, heading, and **refracted** display primitives."* → "refracted" is Spectral Refraction by name.
3. `apps/site/content/blocks/component-demo/index.mdx` — *"A live example paired with its verbatim source."* → describes the old site's `ComponentDemo` machinery, which the new map rebuilds fresh.
4. `apps/site/content/blocks/site-header/index.mdx` — *"A responsive product header with **theme controls** and mobile navigation."* → "theme controls" is the old pack × mode switcher; also describes the old marketing/docs header, not a general block.
5. `apps/site/content/blocks/site-footer/index.mdx` — *"**Prism product** navigation, consumer links, and legal line."* → the Prism marketing site footer.

**The one `portable-after-edit` description:**

- `apps/site/content/pages/auth-page/index.mdx` — *"A complete authentication page composed from **AuthForm** and page chrome."* → names `AuthForm`, an old block. The taxonomy survives; the named dependency needs rewording once the block roster is settled.

**S2/S3/S4 — all 43 items, identically.** One template, so the coupled sections are listed by
template rather than 129 times. Every occurrence names the old package, the old theme model, or the
old styling contract:

- S2, all 43: `` import { X } from '@nanisoft/prism-ui/<layer>/<id>'; `` — the old package name, the
  old per-item subpath export map, and the old layer taxonomy.
- S3, all 43: *"X is a Prism-owned `<noun>`. Its behavior, public props, and **Spectral Refraction
  recipe** ship together from `@nanisoft/prism-ui`."* — Spectral Refraction by name, on all 43.
- S4, all 43: *"Keep the component inside **`PrismProvider`** when it uses an overlay, popup, or
  nested theme scope"* and *"Use `className` for layout composition; visual state stays in the Prism
  recipe and **CSS variables**"* — the old provider, the old className-only contract, the old
  CSS-custom-property theming model.

**S5 — the 19 `<ComponentDemo>` elements:** `components/{button, dialog, field, select, switch}`,
`blocks/{application-shell, auth-form, component-demo, data-table, page-header, settings-panel,
site-footer, site-header, stat-card}`, `pages/{auth-page, blog-layout, dashboard-page, docs-shell,
settings-page}`. The element itself is coupled (it is a custom MDX tag plus a
`<section>/<item>/<slug>` registry key defined by `lib/mdx-components.tsx` and
`lib/generated/demos.ts`). The demo source it renders is authored but implements the old API — every
one of the 19 imports only `@nanisoft/prism-ui/*` and `react` by contract
(`packages/llms/src/demo-graph.ts`), and all 19 use the old component names and props.

**S6 — the 34 props tables.** Generated from `packages/ui/dist/<layer>/<id>/*.d.ts` by
`packages/llms/src/extractor.ts`. Coupled by construction: every prop name, type expression and
default is the old public API. Which 34: components `alert, avatar, badge, button, card, checkbox,
empty, field, icon, input, pagination, progress, radio-group, select, separator, skeleton, slider,
switch, tabs, textarea, typography`; blocks `application-shell, auth-form, component-demo, data-table,
page-header, settings-panel, site-footer, site-header, stat-card`; pages all 5. The 9 with no table:
`accordion, breadcrumb, dialog, drawer, kbd, popover, table, tooltip` (components) and
`data-table` (blocks) — their declarations expose no Prism-authored props interface, so
`renderPropsSection` collapses them.

**S7 — the 5 cross-ref sections.** `application-shell` → DataTable, PageHeader; `auth-page` →
SiteHeader; `blog-layout` → SiteFooter, SiteHeader; `dashboard-page` → DataTable; `docs-shell` →
SiteFooter, SiteHeader. Derived mechanically from the demo files' `prism-ui` imports
(`scanPrismImports`), so the links are as coupled as the demos.

### 3.5 Borderline calls, marked as such

- **`icon`** — "Prism-owned SVG icons drawn on one consistent 24px stroke grid." Classified
  `portable-verbatim` because it hits none of the ticket's coupling markers. *Inference:* the 24px
  stroke grid is itself an old decision, and the new map puts "A custom icon package" out of scope,
  so this line may need editing regardless of class.
- **`textarea`** — "A multi-line native text control with **Prism sizing** and field integration."
  `portable-verbatim`; "Prism sizing" is a concept that survives, only the name changes.
- **`table`** — "A scroll-safe semantic table with typed columns and empty state."
  `portable-verbatim`, but it ships no `## Props` table, so the spec asserts a typed-column API it
  never documents.
- **`data-table`** — same shape: `portable-verbatim` description, **no** `## Props` section, and the
  largest demo in the set at 3,358 bytes.

---

## 4. The blog

**There are no blog posts.** Not on `main`, not in the live feed, and not in the repository's git
history for that path.

| Evidence | Result |
|---|---|
| `apps/site/content/blog/` in `git/trees/main?recursive=1` | one entry: `.gitkeep`, **0 bytes** |
| `https://github.com/NaniSoft/prism/commits/main/apps/site/content/blog.atom` | **1 commit**, `721b5f43` 2026-09-19 "Land ticket 21: build apps/site for real and deploy prism.nanisoft.com" |
| `https://prism.nanisoft.com/blog` | renders "Nothing published yet." |
| `https://prism.nanisoft.com/rss.xml` | valid RSS 2.0, **zero `<item>`**, `lastBuildDate` = epoch |
| `build.mjs` blog lane | reads `content/blog/<dir>/index.mdx`; emits `md/blog/<slug>.md` only — explicitly *"excluded from data.json / llms.txt / llms-full.txt"* |

No post is about the product rather than the system, because no post exists. **Nothing to flag, and
nothing to carry.** The scaffolding that would have held posts is fully built (schema, route,
reverse-chronological index, prev/next, RSS, draft exclusion from params/index/feed, corpus lane) and
is itself worth reading as prior art.

---

## 5. The brand policy page, `/docs/brand`, in full

Source: `apps/site/content/docs/brand.mdx`, 1,844 bytes. Emitted as
`https://prism.nanisoft.com/md/docs/brand.md`, 1,804 bytes, ~298 words. Four `##` sections.

```mdx
---
title: Brand policy
description: What the MIT license covers, what it doesn't, and how the Prism and NaniSoft names may be used.
---

The Prism packages are [MIT-licensed](https://github.com/NaniSoft/prism) — the
code is yours to use, study, modify, and redistribute, including
commercially. Attribution and third-party notices live in the repository's
`THIRD-PARTY-NOTICES.md`.

A code license grants rights in the code. It does not grant rights in the
brand, and this page — not the license — is where the brand rules live.

## What is ours

The names **Prism** and **NaniSoft**, the Prism wordmark, the Spectral
Refraction visual language, and the brand packs (including their names —
blue, green, lavender, rose, and peach) identify Prism as built by NaniSoft.

## What you may do

- Say, accurately, that your product is *built with* Prism, and link here.
- Fork, modify, and redistribute the code under MIT — including shipping your
  own theme packs — as long as you don't present the result as Prism, or as
  originating from or endorsed by NaniSoft.
- Reference "Prism" in prose, talks, and comparisons to identify the project,
  the way any trademark is used to name the thing it names.

## What you may not do

- Distribute a modified or repackaged version under the Prism or NaniSoft
  names, or with the Prism wordmark.
- Use the names or wordmark as your product, domain, or package name, or in
  a way that implies NaniSoft endorsement or certification.

## Status

We haven't registered these marks; they're protected by the license's
honesty and by common-law rights. If you're unsure whether a use is fine,
ask before you ship — and if you spot a use of the brand that looks off,
tell us. Third-party theme packs demonstrating `createPrismTheme()` are
welcome and encouraged; they just need their own names.
```

**Assessment against the "may survive untouched" hypothesis — it will not, unchanged.** One section
is coupled: *"What is ours"* names **Spectral Refraction** and enumerates the **brand packs** by name
(blue, green, lavender, rose, peach) — both explicitly dropped by the new map. *"Status"* names
`createPrismTheme()`, the old theme factory. The licence mechanics, the may/may-not structure, and
the unregistered-marks reasoning are portable-verbatim. Note also that `blue, green, lavender,
rose, peach` are the *old* pack names; the new map names them Blush, Mint, Lavender, Sky, Peach, so
this page currently contradicts the new identity.

Related and **not** on the site, but part of the same legal set: `LICENSE` (1,065 B),
`THIRD-PARTY-NOTICES.md` (2,172 B), `packages/{llms,mcp-server,tokens,ui}/LICENSE` (1,065 B each),
and the font licences `apps/site/public/fonts/Archivo-OF.txt` (4,381 B) and
`JetBrainsMono-OFL.txt` (4,391 B) — the latter two become dead weight when the fonts are dropped.

---

## 6. The agent-facing corpus in `packages/llms`

### 6.1 `packages/llms/src` is a generator, not a corpus

The ticket asks for "the agent-facing corpus in `packages/llms/src`: full directory listing with
file sizes." **There is no corpus in `src`.** `src/` is four TypeScript modules; the corpus is
emitted to `dist/`, which is never committed.

| File | Bytes | Role |
|---|---:|---|
| `packages/llms/src/extractor.ts` | 8,464 | The one props extractor. Regex structural scanner over `packages/ui/dist/**/*.d.ts`; returns `ExtractedInterface[]` for every `export interface *Props`, with `typeName`, `extendsType`, and per-prop `name` / `typeText` / `description` (JSDoc) / `required` / `defaultValue` (`@defaultValue`). Compiler-API-free: *"TypeScript 7 (this repo's compiler) no longer ships the JS compiler API."* |
| `packages/llms/src/markdown.ts` | 5,159 | The MDX → Markdown lane: `parseMdx`, `stripMdxMechanics`, `renderComponentDemos`, `fence`, `renderTable`, `renderPropsSection`. |
| `packages/llms/src/demo-graph.ts` | 2,615 | The demo contract: `validateDemoSource` (imports must match `/^@nanisoft\/prism-ui(\/[\w.-]+)*$/` or `/^react$/`; must have a default export) and `scanPrismImports`. |
| `packages/llms/src/index.ts` | 629 | Public surface: re-exports the Markdown lane, the extractor *types*, and the demo-graph functions. Root stays compiler-free. |
| **src total** | **16,867** | |

Scripts alongside it:

| File | Bytes | Role |
|---|---:|---|
| `packages/llms/scripts/build.mjs` | 16,044 | `emit(outDir)`. Three lanes: `data.json`, `llms.txt` + `llms-full.txt`, `md/` mirror. Also `renderThemeDoc()`. |
| `packages/llms/scripts/check.mjs` | 9,395 | The seven-invariant drift gate. |
| `packages/llms/scripts/generate-content.mjs` | 5,339 | The stub generator the site delegates to. |
| `packages/llms/package.json` | 1,397 | v0.4.0. Exports `.`, `./extractor`, `./data.json`, `./package.json`. `files: ["dist"]`. |
| `packages/llms/CHANGELOG.md` | 1,842 | 0.2.0 → 0.4.0 plus an unreleased "owned-catalog corpus" breaking entry. |
| `packages/llms/test/{demo-graph,extractor,markdown,store}.test.ts` | 8,661 | |

**Emitted corpus shape** (build output, not in git): `dist/llms.txt` (8,656 B live),
`dist/llms-full.txt` (144,986 B live), `dist/data.json`, and `dist/md/{docs,components,blocks,pages,theme,blog}/`.
Live `llms.txt` has 5 sections: Guides (6), Components (29), Blocks (9), Pages (5), Theming (10) —
71 bullets and **59 unique `md/` link targets**, all of which resolve (6 + 43 + 10). Zero blog files.

### 6.2 The per-item spec format

Assembled in `build.mjs` `emit()`, in this order:

```js
const doc = [`# ${entry.name}\n\n${data.description}`, docBody, props, ...crossRefs]
  .filter(Boolean).join('\n\n')
```

where `docBody = stripMdxMechanics(renderComponentDemos(body, readDemo))` — i.e. the MDX body with
the marker comment stripped, top-level imports removed, and each `<ComponentDemo id>` replaced by
`**Title**` plus a fenced `tsx` block of the demo's verbatim source.

Complete example, `https://prism.nanisoft.com/md/components/button.md`, 1,701 bytes:

```markdown
# Button

The primary action control for commands, links, and loading states.

```ts
import { Button } from '@nanisoft/prism-ui/components/button';
```

Button is a Prism-owned component. Its behavior, public props, and Spectral Refraction recipe ship together from `@nanisoft/prism-ui`.

- Import only from `@nanisoft/prism-ui`.
- Keep the component inside `PrismProvider` when it uses an overlay, popup, or nested theme scope.
- Use `className` for layout composition; visual state stays in the Prism recipe and CSS variables.

**Button**
```tsx
import { Button } from '@nanisoft/prism-ui/components/button';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function ButtonDemo() {
  return (
    <div role="group" aria-label="Synthetic catalog release actions" style={{ display: 'grid', gap: 12 }}>
      <Text variant="tertiary">Synthetic catalog release actions</Text>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary">Create release</Button>
        <Button variant="secondary">Review queue</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Discard draft</Button>
        <Button variant="link" href="#release-guide">Read release guide</Button>
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` (optional) | ButtonVariant | — | — |
| `size` (optional) | ButtonSize | — | — |
| `href` (optional) | string | — | — |
| `loading` (optional) | boolean | — | — |
| `iconStart` (optional) | ReactNode | — | — |
| `iconEnd` (optional) | ReactNode | — | — |
| `children` (optional) | ReactNode | — | — |
```

Optional `## Blocks` / `## Pages` cross-ref section follows for blocks and pages (see §3.4).
Every `Description` and `Default` cell is `—` across the corpus: the old declarations carry no JSDoc
on props and no `@defaultValue` tags, so the tables are name-and-type only.

Guide specs are simpler: `# {title}\n\n{description}` plus `stripMdxMechanics(body)`. Theme specs are
fully synthesised by `renderThemeDoc(pack, mode)`: a `#` title using the label `beam-dark` for dark
mode, a `createPrismTheme` usage fence, then `## Tier 0 — primitives`, `## Tier 1 — semantics`, and
`## CSS custom properties` tables. `md/theme/blue-dark.md` is 5,494 bytes; all ten total ~55 KB.

### 6.3 The seven invariants enforced by `packages/llms/scripts/check.mjs`

The gate's own header comment enumerates them; the code confirms each. It is build-fresh (`rm -rf`
the work dir, `emit()` twice) and wired into CI.

1. **Coverage** — every catalog item has doc MDX (stub or full). Enforced by `emit()` throwing
   `"prism-llms: N catalog item(s) have no doc MDX: … Run pnpm --filter @nanisoft/prism-llms generate-content (stubs) or author the doc."`
2. **Demo self-contained contract** — `validateDemoSource` over every `content/**/demos/*.tsx`.
   Fails a non-allowlisted import, a relative import (`"relative import '…' — demos must be
   self-contained"`), or a missing `export default`.
3. **Cross-refs resolve** — two sub-checks. (a) every name in `scanPrismImports(demo)` must be a key
   of the public `prism-ui` runtime export, else
   `"<file> imports '<name>', which is not a public prism-ui runtime export"`. (b) every
   `<ComponentDemo id="…"/>` in an item's MDX must resolve to a real `demos/<id>.tsx`.
4. **Frontmatter descriptions** — every store item needs a non-empty `description`
   (`"item '<name>' has an empty description"`), because it becomes the `llms.txt` bullet.
5. **`data.json` ↔ `PrismDocsStore`** — writes a throwaway TS project under
   `.turbo/check/store-validate/` that does `parsePrismDocsStore(raw)` and runs
   `tsc -p .turbo/check/store-validate/tsconfig.json` (`strict`, `nodenext`, `resolveJsonModule`).
   Runtime guard plus a type assignment.
6. **`llms.txt` links and `md/` mirror completeness** — four sub-checks: every
   `https://prism.nanisoft.com/md/….md` link scraped from `llms.txt` must have an emitted file; every
   item must have `md/<layer>/<id>.md`; every guide must have `md/docs/<slug>.md`; every theme must
   have `md/theme/<slug>.md`; and every `content/blog/<dir>/` must have `md/blog/<dir>.md`.
7. **Determinism** — `emit()` into two directories, walk both trees, byte-compare every file. Any
   difference fails with `"two builds differ: …"`.

Success line: `prism-llms#check: 7 invariants green — 43 items, 6 guides, 10 themes, N files`.

### 6.4 How much of the spec text is coupled to the old implementation

**83.5% of per-item section instances, and ~97% of per-item bytes.** The breakdown, from measured
byte counts:

| Component of the 75,642-byte per-item corpus | Bytes | Share | Coupled? |
|---|---:|---:|---|
| Demo source, verbatim, ×19 (from the `.tsx` files) | 40,567 | 53.6% | **yes** — authored, but implements the old API; import-locked to `@nanisoft/prism-ui/*` |
| `## Props` tables, ×34 (measured in the live mirrors) | 11,336 | 15.0% | **yes** — extracted from the old `.d.ts` |
| Fixed template prose, ×43 (import fence + paragraph + 3 bullets) | 8,634 | 11.4% | **yes** — names `@nanisoft/prism-ui`, Spectral Refraction, `PrismProvider`, the CSS-variable contract |
| `description` lines, ×43 (from `catalog.ts`) | 2,559 | 3.4% | 37 verbatim, 1 after-edit, 5 coupled |
| `## Blocks` / `## Pages` cross-refs, ×5 (measured) | 595 | 0.8% | **yes** — derived from old demo imports |
| Everything else: `#` title, the 19 demo `**Title**` lines, whitespace | 11,951 | 15.8% | mixed — title is the name, whitespace is nothing |

Measured directly: the fixed template block is **452 bytes per item** in the source MDX
(`26,231` MDX total − `4,318` frontmatter = `21,913`, of which `19,446` is the three template blocks
and the remainder is the marker, blank lines, and the 19 `<ComponentDemo>` elements). In the emitted
mirrors the same three blocks measure 8,634 bytes, the difference being the `ts` fence that becomes
`tsx` in some cases and the per-item name substitutions.

**What survives in the agent corpus is almost nothing authored.** Two consequences worth stating
plainly:

- The corpus is a *projection*, not a source. `build.mjs`'s header: *"File-is-truth per artifact:
  prose from docs MDX, props from prism-ui's built `.d.ts` via the extractor, example code verbatim
  from `demos/*.tsx`, catalog metadata from prism-ui, themes from prism-tokens."* Porting the corpus
  means porting those five inputs, not porting `packages/llms/src`.
- The ten theme specs (~55 KB, the second-largest block in `llms-full.txt` after the demos) are
  generated from token data and are **100% coupled**: raw hex, `rgba()` values, `Archivo Variable`,
  `JetBrains Mono`, `prism-*` custom properties, and the `beam-dark` label in the title
  (`renderThemeDoc`: `const modeLabel = mode === 'dark' ? 'beam-dark' : 'light'`). They will be
  regenerated from the new token pipeline; nothing in them is hand-written.

---

## 7. Old site vs plasma, documentation structure only

`https://plasma.coveo.com/index.json` — 47,560 bytes, `{ v: 5, entries: { … } }`, **159 entries**.
Each entry: `{ id, title, name, importPath, storiesImports, type, tags, subtype?, exportName?, componentPath? }`.
It is a Storybook `index.json`, so the group tree is encoded in the `@group/Title` prefix of `title`.

| Group | Entries | Docs (MDX) | Stories |
|---|---:|---:|---:|
| `@components` | 132 | 59 | 73 |
| `@foundation` | 14 | 7 | 7 |
| `@content` | 6 | 6 | 0 |
| *(ungrouped — `changelogs/*`)* | 5 | 5 | 0 |
| `@overview` | 2 | 2 | 0 |
| **Total** | **159** | **79** | **80** |

`@components` subdivides by job: Call to action (9), Forms and inputs (20, itself split by data type —
`array`, `boolean`, `date`, `number`, `string`), Feedback (11), Layout (12), Data display (6),
Typography (2), Miscellaneous (1), plus an Overview. `@foundation` is a flat 7: Colors, Iconography,
Radii, Shadows, Spacings, Typography, Variables.

`plasma.coveo.com/llms.txt` (12,429 B) publishes 5 sections — Foundations (1), **Content Guidelines
(5)**, Components (62), Optional (2) — 71 bullets, plus a `llms-full.txt` pointer and two
prose rules in the preamble: *"Always import from `@coveord/plasma-mantine`, not directly from a
`@mantine/*` package"* and *"Wrap your app with the `Plasmantine` provider."*

### What the old Prism site does that plasma does not

- **A three-layer catalogue split** (components → blocks → pages) that the corpus and the site nav
  both expose as separate sections. plasma is flat: one `Components` section, 62 entries, no
  composition tier.
- **Blocks and pages as first-class documented items.** Every block and page has a props table, a
  live demo, and generated cross-references to the components it imports. plasma has AppShell as a
  component, not a documented composition layer.
- **A 43-item catalog as the single spine**, machine-checked: `prism-llms#check` invariant 1 fails
  the build if any catalog item lacks a doc, and invariant 6 fails if any item lacks a mirror file.
  plasma's `index.json` has no equivalent coverage assertion.
- **Machine-derived cross-references.** `## Blocks` / `## Pages` sections are computed from the demo
  files' actual imports, so they cannot go stale.
- **Props tables extracted from built `.d.ts`**, gated by a TypeScript project that imports
  `parsePrismDocsStore`. plasma's `llms.txt` carries descriptions only.
- **A generated theme reference per pack × mode** (10 specs, ~55 KB) as a first-class corpus
  section. plasma has `Variables` as a single foundation page.
- **An MCP server** at the docs origin (`/mcp`, eight read-only tools). plasma publishes
  `llms.txt`/`llms-full.txt`; `index.json` includes a `changelogs/plasma-mcp-server` page, so the
  package exists, but the docs site is not the transport.
- **Brand/licence policy as a first-class page** at `/docs/brand`, linked from the site footer and
  from `llms.txt`'s Guides section.

### What plasma does that the old Prism site does not

- **A content-design system**: `@content` — About Content, Audience, Voice, Writing mechanics,
  Product vocabulary, Glossary — published to agents as `## Content Guidelines`. The old site has
  nothing analogous; it documents components, not how to write.
- **A foundation reference tier**: `@foundation` — Colors, Iconography, Radii, Shadows, Spacings,
  Typography, Variables. The old site documents theming only as an API (`createPrismTheme` + token
  dumps) with no reference pages.
- **Grouping by data type inside forms** (`Forms and inputs / string /`, `/boolean /`, `/date /`,
  `/number /`, `/array /`) rather than by component role.
- **Per-package changelog pages**, generated into the same site
  (`changelogs/plasma-llms`, `-plasma-mantine`, `-plasma-mcp-server`, `-plasma-react-icons`,
  `-plasma-tokens`). The old site publishes changelogs only to npm and in
  `packages/llms/CHANGELOG.md`.
- **Deprecation carried in the corpus**: `BlankSlate` is listed with *"Deprecated empty state
  container for views with no content to display; do not use it in new implementations."* The old
  catalog has a `status: 'stable'` literal on all 43 entries and no way to express deprecation.
- **An entry-level example count above 1 per item** (73 component stories + 52 `Demo` stories against
  59 component MDX). The old site has exactly 0 or 1 demo per item.
- **An `Optional` corpus section** — 2 entries — separating optional/add-on components from the
  core set.
- **Live search over the full catalogue** (the landing page's "Search all 43 checked items" is a
  client-side filter over 43 loaded strings, not a search index). plasma runs a real index.

### Neutral observations

- Both publish `llms.txt` + `llms-full.txt` from the docs origin. Prism's `llms-full.txt` is
  144,986 B; plasma's links one without a stated size.
- Both group the top level and both keep the agent corpus as a mirror of the rendered docs.
- plasma's `index.json` tags every entry `test` + `manifest`, and marks 65 of 79 MDX as
  `attached-mdx` (paired with a `.stories.tsx`) versus 14 `unattached-mdx` — a distinction the old
  site has no way to express.

---

## What I could not find, and what I did not check

**Not found / does not exist:**

- Any hand-written per-item prose, in `main` or in the repository's history for
  `apps/site/content/components/button/index.mdx` (2 commits, both generated).
- Any blog post, ever (`content/blog` has 1 commit and 1 zero-byte file).
- A committed agent corpus. `packages/llms/dist/` is gitignored by design; all corpus numbers above
  are measured from the live site.
- The six guides named in the ticket. They belong to plasma.
- `apps/site/src` — that directory does not exist.
- `/sitemap.xml` and `/robots.txt` on prism.nanisoft.com — both 404.

**Blocked:**

- `api.github.com` hit an unauthenticated rate limit partway through, so the commit-history work
  used the `commits/main/<path>.atom` feeds instead. Three specific questions were therefore checked
  by probing filenames at known SHAs rather than by listing trees: the complete set of files in
  `content/docs/` at `721b5f43` and `d23e0393` (I confirmed `brand.mdx` exists at `d23e0393` and
  that no `content/docs/*.mdx` existed at `721b5f43`, by probing 24 plausible slugs at each). A
  file I did not think to probe could in principle have existed at `721b5f43` and been deleted
  before `main`.
- Per-item history for the 42 items other than `button`. Given that `button` — the most-documented
  component, with a demo — was generated in both of its two commits, I infer all 43 were, but I did
  not verify each.

**Checked and deliberately excluded from the content inventory** (present in the old repo, not site
content — flagging so a later sweep does not sweep them in accidentally):

- Root prose: `AGENTS.md` (5,830), `CLAUDE.md` (2,479), `CONTEXT.md` (4,498), `DESIGN.md` (9,485),
  `PRODUCT.md` (4,986), `README.md` (3,087).
- `docs/adr/0001…0007` (89,950 B total) and `docs/design-conventions.md` (3,023 B) — engineering
  decision records, including ADR-0001 *Spectral Refraction visual language* and ADR-0002
  *token architecture* (32,400 B) and ADR-0003 *prism-ui API conventions* (24,277 B).
- `.scratch/prism/` — the old repo's own planning set: `map.md` (26,266), 25 `issues/*.md`,
  6 `research/*.md` (220,237 B), and the Figma import assets.
- `docs/agents/{domain,issue-tracker,triage-labels}.md` (3,591 B) — the old repo's agent-process
  docs, superseded by this repository's own.
- The visual identity, for completeness: `apps/site/app/globals.css` (43,611 B),
  `packages/ui/src/styles.css` (79,312 B), the two `.woff2` files (130,576 B), and the two font
  licences.

**One inference I want to make explicit**, because it is the load-bearing claim of §3: I concluded
the per-item pages have no authored prose because the generator writes them, the file carries the
generator's marker, and the file's two historical versions are both generator output with generator
markers (`v1`, `v2`). If an authored per-item corpus exists, it is not in this repository at
`main`, and I did not find it anywhere else in the repo's tree.
