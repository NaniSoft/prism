---
Type: grilling
Status: resolved
Labels: wayfinder:grilling, ready-for-human
Blocked by: 03, 10
---

## Question

Docs information architecture for prism.nanisoft.com — and the doc templates it ships:

- Nav: top-level sections, component listing organization, blocks/pages catalog presentation.
- Component doc template: `ComponentDemo` block anatomy (live demo, source + copy button, API table); where props/meta come from (antd types? custom meta files?).
- Docs vs blog collections: frontmatter schemas, `defineDocs` / `defineCollections` usage.
- `llms.txt` surface at the site root; how fumadocs' MCP tools expose it.
- Blog: structure, post layout blocks, RSS in static mode.

Output: written IA + template specs the site build implements.

## Inherited requirements

Deferred here by resolved tickets — decide with these in hand (2026-09-14 audit):

- **`ComponentDemo` must yield self-contained TSX per example** (from [MCP tool surface](13-mcp-tool-surface.md) / ADR-0004): `get_item_source(name, example?)` returns documented example TSX only, so the demo format is what makes that answer honest.
- **Keep fumadocs' own `/api/mcp` un-generated** in the static export (ADR-0004): the prism MCP endpoint on the Worker stays the *only* MCP endpoint.
- **Prism-locale merge slot arrives with the first Prism-authored string** (from [prism-ui API conventions](10-prism-ui-api-conventions.md)) — expected to be this ticket's `ComponentDemo` copy button.

## Answer

Resolved 2026-09-14 (grilling). Q1–Q9 answered by the human individually (flat taxonomy URLs; thin generated pass-through pages; antd categories + Prism group; page skeleton; ComponentDemo anatomy + self-contained contract; co-located demos; generated API tables; shell-level pack×mode switcher; defaults-only frontmatter + separator sidebars). The remaining branches below were **auto-applied as recommendations** under the standing "pick confident options" directive — each is individually vetoable. This Answer is the IA + template spec the site build implements.

### 1. Site IA

- **Flat taxonomy URLs**: `/` (Specimen landing) · `/docs` (guides + theming prose) · `/components/*` · `/blocks/*` · `/pages/*` · `/blog/*`. Four doc loaders (docs, components, blocks, pages) + a blog loader — per-section loaders, the research-proven shape; one combined static ZBSearch index spans all sections plus blog, with `tag` = section.
- **Coverage**: thin **generated** pages for every pass-through component — the codegen pipeline emits stub MDX (import line + `Extends: antd X` pointer + antd.dev link, zero hand-written copy, so nothing can drift); antd bump PRs mechanically add/remove stub pages. Full template for wrapped components, blocks, pages. Demos are curated onto stubs progressively — a stub without demos is honest, not broken.
- **Sidebars**: `/components` = "Prism components" group first, then antd's six canonical categories (General, Layout, Navigation, Data Entry, Data Display, Feedback). `/blocks` and `/pages` = flat lists, no categories.

### 2. Doc-page template

- **Skeleton** (wrapped components, blocks, pages; stubs are the thin variant): header (title, one-line description, copyable import line) → `Extends` pointer (conditional) → *When to use* (3–5 bullets — the only prose, nowhere else to drift) → Examples (ComponentDemo sequence, basic → advanced, each under its own heading) → API (Prism-added surface only) → prev/next + "On this page" TOC rail. **No per-page changelog section** — changesets own that; per-item changelogs were plasma's drift bug.
- **ComponentDemo anatomy**: live preview rendering the real component in the ambient theme → slim action bar (`⌄ Code` toggle, `⧉ Copy`) → collapsible syntax-highlighted TSX panel. No per-demo theme toggle (the shell switcher changes all demos at once); no edit-online (live-edit playground stays fog).
- **Self-contained contract** (makes ADR-0004's `get_item_source` honest): each example **is one `.tsx` file** — default-exported component, importing only from `@nanisoft/prism-ui/*` and `react`, no relative imports, no app context; enforced by lint/test so coupling fails CI instead of quietly breaking the MCP answer. Three consumers — preview import, copy string, `get_item_source` — read the same file; nothing to sync.
- **Content model**: demos co-located at `content/docs/<section>/<item>/demos/*.tsx`; **example id = filename slug** (`get_item_source("button", "basic")` → `demos/basic.tsx`); prose and example order live in the MDX, files stay comment-light. prism-ui's `ComponentDemo` remains a dumb data-in block (`code: string` + `children`); the raw-reading wire is an app-level `Demo` component — prism-ui never touches `fs` or fumadocs.
- **API tables**: generated from prism-ui TypeScript types + TSDoc at build; descriptions live beside the prop in prism-ui source. One extractor, two consumers (site tables + prism-llms `get_item_props`). Pass-throughs get the `Extends` line, never a duplicated antd table. Extraction fidelity of gnarly unions is an accepted cosmetic risk (ADR-0003 keeps wrapped props data-in).
- **Theme experience**: shell-level **pack × mode switcher** (blue | green × light | beam-dark), default **beam-dark blue** (continuous with the Specimen landing; its daylight peek links into light-mode docs). Persisted to `localStorage`; flash-free via ticket 02's `cssVar.key` class-swap recipe; the site swaps the `PrismProvider` theme prop, so prism-ui needs only a DocsShell header action slot.

### 3. Collections & frontmatter

- Docs frontmatter = fumadocs `pageSchema` defaults only (`title`, `description`, optional `icon` — an `@ant-design/icons` name resolved via the loader's `icon()` handler). **No authored `kind`** (the section loader is the kind); **no authored `antdBase`** (ticket 16's generator derives it from `wrapped-registry`).
- Categories ride `meta.json` **separators**, files stay flat → URLs remain `/components/button`. `meta.json` is generated from the category table in the codegen pipeline (same generate task emits stub MDX + `meta.json`); a component missing from the table fails CI.

### 4. llms.txt surface + MCP boundary *(auto-applied)*

- **prism-llms is the one authoritative LLM surface.** The site serves its artifacts at `/llms.txt`, `/llms-full.txt`, and per-item MD; the site build depends on prism-llms in the turbo graph and emits the artifacts into `out/`. Fumadocs' own `llms()` route handlers **and** `/api/mcp` stay un-generated — no second LLM surface, no MCP in the export (inherited from ADR-0004).
- `.md` URL negotiation is recovered at the edge: `run_worker_first` covers all five sections (`/docs|/components|/blocks|/pages|/blog/:slug*.md`) rewriting to prism-llms artifacts — concrete artifact paths are ticket 16's file-layout call.
- Site search (UX) spans the four doc sections + blog. The MCP store corpus is prism-llms' business; recommendation handed to 16: reference corpus only (guides + theming + items + theme docs), **blog excluded in v1**.

### 5. Blog *(auto-applied)*

- Ships in v1 (the destination names it). **Folder-per-post**: `content/blog/<slug>/index.mdx` + optional `demos/` — ComponentDemo is usable in posts via the same app `Demo` wire.
- Frontmatter: `pageSchema` + `date` (required, ISO), `tags` (array, default `[]`), `draft` (boolean, default `false`; drafts excluded from params, index, and feed). No author field in v1 (single voice).
- `BlogLayout`: index = reverse-chronological list (title, date, description, tag chips); post = hero (title/date/tags) + MDX body + chronological prev/next. Tags are **display-only** in v1 — no tag index pages.
- **RSS: yes** — `feed` package, `revalidate = false` route → `out/rss.xml` (the research-proven recipe), **summary + link** rather than full content (demos don't survive feed readers). No dynamic OG images in v1.

### 6. Prism-locale merge slot *(auto-applied; inherited from ADR-0003)*

- First Prism-authored strings: the `ComponentDemo` copy feedback ("Copy" / "Copied") — but DocsShell chrome ("On this page", search placeholder, prev/next labels) is likely to ship first in the site build. The **`PrismLocale` merge slot therefore lands with whichever string ships first**, specced now: namespaces `locale.DocsShell.*` and `locale.ComponentDemo.*`, English defaults, consumer-last merge mirroring `mergePrismTheme`, English-only in v1.

### Handoffs

- **Ticket 16** (unblocked by this closure): extractor home; prism-llms artifact file layout (the `.md` rewrite targets); PrismDocsStore corpus (blog-out recommendation above); `examples[].code` = the contents of `demos/*.tsx`; `antdBase` derived from `wrapped-registry`.
- **Fog**: the site-build patch in the map's *Not yet specified* now carries this spec as its IA/template input; it graduates into task ticket(s) once ticket 16 closes.
