---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 03, 07, 09
---

# Docs site architecture on fumadocs

## Question

The site is a fully static export of Next 16 on Cloudflare Workers, built on
fumadocs, and its shell is a page from our own component package rather than
`fumadocs-ui`.

**Research input, already in.** The
[fumadocs findings](../research/03-fumadocs-headless-static-export-limits.md)
settled the inherited questions, so do not re-litigate them:

- Headless is valid. `fumadocs-core@16.15.14` never references `fumadocs-ui` in
  any dependency field, every peer it declares is optional, and the dependency
  arrow points one way. The only thing the headless path asks for is
  `NextProvider` from `fumadocs-core/framework/next`.
- So question 1 below is no longer "headless or not". It is whether to keep the
  shell as our own page, given that `fumadocs-ui` would pin `fumadocs-core` to an
  **exact** version and constrain every future core bump.
- Versions are compatible with no conflict: core wants `next 16.x.x` and
  `react ^19.2.0`, mdx wants `next ^16`, and every core peer is optional.
- The empty-sections claim in the old repository is **wrong about its
  mechanism**. `generateParams()` returns one entry per page, so a folder with
  no index page emits no file under export or SSR. If empty sections must
  build, they need an explicit index page, and that is a decision, not a
  consequence of the route shape.
- `middleware.ts` is now `proxy.ts` and is forbidden under export.
- Nothing in fumadocs ships a demo block. MDX, the `components` prop and the
  remark plugins are all it offers, so the demo block is this app's own work.

Settle:

1. **Headless or `fumadocs-ui`.** The inherited decision is headless, and it
   buys one thing above all: the documentation shell is our own component, so
   the site is built with the system it documents rather than beside it. State
   the decision, and if the capability findings show headless is no longer
   viable at these versions, say what replaces it and what is lost.
2. **The route tree.** Every route, which loader serves it, and which are
   generated from the catalogue rather than hand-written. Two mechanisms are
   available and both work: the Next.js routing layer, where a static segment
   takes precedence over a catch-all, and the content layer, where `loader()`
   accepts a record of named sources and merges them into one page tree. A
   `StaticSource` is a plain object literal, so pages can be synthesised in code
   with no file on disk. If a section must build while empty, it needs an
   explicit index page, and whether it does is a decision rather than a
   consequence of the route shape.
3. **The shell.** Which page from the component package is the documentation
   frame, what it must provide (section navigation, article, table of contents,
   prev and next, the pack and mode switcher, search entry), and what a docs
   frame owes the system it documents. The old `DocsShell` and `BlogLayout` were
   catalogue items; decide whether the new ones are too, and whether shipping
   them in the published package is a feature or a leak of site concerns into
   the library.
4. **The per-item page template.** Section order, which sections are generated
   from the catalogue and the component's types, and which are hand-written
   prose. This is the template the documentation content plan instantiates, so
   it has to be decided here. The old template was import line, then an
   extends line, then when-to-use prose, then the demo sequence, then generated
   API tables, then prev and next plus a table of contents.
5. **Live demos.** How a real running component is rendered inside a
   statically exported MDX page, what the client boundary costs, and how a
   demo's source is obtained for the copy control. The old answer was a
   `ComponentDemo` block plus a generated demos registry where one
   self-contained `.tsx` file was the source for three consumers. Decide
   whether that is kept, and if the framework now offers something better.
6. **Theme switching in the site.** The site needs a pack and mode switcher,
   and the themes route needs to show all five packs side by side. The second
   is the descendant-scoping problem the prototype ticket is settling, so
   coordinate rather than deciding it twice. State what the site does if
   descendant scoping is not supported.
7. **Search.** This is now decidable with a number attached, so the fog entry is
   retired. Measured on 60 synthetic pages: default `advanced` mode is 1.0 to
   3.5 MiB raw and 80 to 227 KiB gzipped, because it explodes each page into one
   document per heading and per content block; `simple` mode is 54 KiB raw and
   5 KiB gzipped and forfeits heading-level results. The whole index downloads
   lazily on first search interaction, not on page load, and the entire stack is
   in `fumadocs-core` with no `fumadocs-ui` involved. Decide: advanced or simple,
   and whether the search UI is ours or `fumadocs-ui`'s dialog, which is
   standalone-renderable but drags in Radix, `motion` and a stylesheet built from
   its own design tokens. Note also that a custom tokenizer must be given to
   both the server and the client, since the browser has to tokenize the query
   identically.
8. **The blog.** The inventory settles the content question: there is none. The
   old `content/blog/` is a 0-byte `.gitkeep` with one commit, the live `/blog`
   renders an empty state and `/rss.xml` has zero items. So the question is
   whether to author a blog or drop the section, not which posts to port. An
   empty section is a worse signal than no section, so "does not exist" is a
   legitimate answer.
9. **Static assets and output.** What is copied from which package into the
   export, including the token CSS, the fonts, the generated registry
   artifacts, and the agent-surface files that the old site copied into `out/`
   with a script. Decide what the site reads at build time and what it copies.
   One build-time check is required here rather than deferred: fumadocs uses
   `export const revalidate = false` on three handlers where Next's own guide
   prescribes `dynamic = 'force-static'` for a handler under export. Build it
   and find out which one this version accepts, because every static handler in
   the site depends on the answer.
10. **The Worker.** What the Worker must do beyond serving static assets. Two
    things are now settled: the read-only MCP cannot be a static asset, because
    the transport needs `POST` and `DELETE` and export allows `GET` only, so it
    stays a Worker route. And `rewrites()` is forbidden under export, so the
    pretty `.md` URLs the old site produced with a Worker prefix rule are the
    only way to serve them, which makes that rule load-bearing. Carry forward the
    recorded lesson that `run_worker_first` needs glob patterns and that a
    route-style `:slug*.md` pattern silently never matches.
11. **NotFound under export.** `notFound()` works and is the right tool, but the
    recorded caveat matters here: if the check runs inside a `Suspense` boundary
    after streaming starts, the status is already 200 and you get a soft 404 with
    `noindex`. The canonical fumadocs route checks before returning, so follow
    it.

Read `apps/docs/` in full first: `next.config.ts`, `src/app/layout.tsx`,
`src/app/globals.css`, every route, `src/lib/catalog.ts`,
`src/components/theme-switcher.tsx`, and `scripts/analyze-blocks.mjs`. Consult
`cloudflare` and `workers-best-practices` for the Worker, and `wrangler` before
touching any deploy configuration.

## Answer

All eleven are decided, and the recommended shape is adopted. Three points go
beyond the recommendation because the current versions forced the issue: the
route tree's catch-all shape and the `?category=` mechanism (§2), and the
Markdown mirror being a copied tree rather than a route handler (§9, §10). Two
build-time facts were measured against Next.js `16.3.6` rather than inferred
(§9, §11).

**Measured against `next@16.3.6` before answering.** A throwaway Next app with
`output: 'export'` settled four things the research had left open. It is
reproduced in the report and was deleted afterwards; it touched nothing in this
repository.

1. `export const revalidate = false` **is accepted** on a route handler under
   `output: 'export'`. The build succeeds and emits `out/api/search` as a static
   file. `export const dynamic = 'force-static'` is also accepted. With
   **neither**, the build fails: `export const dynamic = "force-static"/export
   const revalidate not configured on route "/api/search" with "output:
   export"`. So the requirement is "one of the two", and the answer to the
   ticket's required check is: keep `revalidate = false`, matching fumadocs'
   own snippets.
2. `app/page.tsx` and a **required** catch-all `app/[...slug]/page.tsx` coexist;
   Next gives `/` to `app/page.tsx`. An **optional** catch-all
   (`app/[[...slug]]/page.tsx`) is rejected at build with "You cannot define a
   route with the same specificity as an optional catch-all route (`/` and
   `/[[...slug]]`)". The route tree therefore uses a required catch-all.
3. Reading `searchParams` in a server page fails the export build
   (`Route /[...slug] with "dynamic = "error"" couldn't be rendered statically
   because it used await searchParams`). A client component reading
   `useSearchParams()` is supported and prerenders its `<Suspense>` fallback
   (`BAILOUT_TO_CLIENT_SIDE_RENDERING`), which is why §2's section index renders
   the real grid as that fallback.
4. A route handler with `generateStaticParams` that emits both a prefix path and
   a child path (`/md/components` and `/md/components/button`) fails the export
   copy step. This is why the `.md` mirror is a copied tree, not a route
   handler.

### 1. Headless: keep it

`fumadocs-core` + `fumadocs-mdx`, no `fumadocs-ui`, is the decision, unchanged
from the inherited one and now confirmed viable at `16.15.14`/`15.4.5`. The
reason is the map's standing preference, made concrete: the documentation shell
is a site page composed from `@nanisoft/prism-ui`, so **the site is built with
the system it documents**, and the package the site renders is the package a
consumer installs. Adopting `fumadocs-ui` would (a) exact-pin
`fumadocs-core@16.15.14`, so every core bump becomes a coordinated UI bump, (b)
drag in Radix, `motion` and a stylesheet built from fumadocs' own design tokens,
which the site would then have to reconcile with Prism's tokens, and (c) give
the docs a second visual system. Nothing replaces it: headless is viable, so
the question does not arise. If it ever stopped being viable, `fumadocs-ui`
would be adopted **only** for its layout/provider components and the exact core
pin accepted as the cost; that is not needed at these versions.

### 2. The route tree

**One required catch-all, plus static segments for the site-owned pages.**

```
apps/site/src/app/
├── layout.tsx           root layout: token CSS, next/font, data-pack + dark, PrismProvider
├── page.tsx             /                       site-owned marketing landing (composed from blocks)
├── themes/page.tsx      /themes                 site-owned pack-by-mode showcase
├── not-found.tsx        the 404 body            -> out/404.html
├── [...slug]/page.tsx   everything in the page tree below
└── api/search/route.ts  the static search index -> out/api/search
```

The catch-all serves every section and item, generated by one merged
`loader()`. Static segments win over the catch-all, so `/` and `/themes` are
plain files and never enter the page tree.

| Route | Served by | Source | Generated? |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | none (blocks at the call site) | hand-written |
| `/themes` | `app/themes/page.tsx` | `@nanisoft/prism-tokens` manifests | hand-written |
| `/docs`, `/docs/<slug>` | `app/[...slug]/page.tsx` | `site` collection, `content/docs/**` | hand-written MDX |
| `/foundations`, `/foundations/<slug>` | same | `site` collection, `content/foundations/**` | hand-written MDX |
| `/content`, `/content/<slug>` | same | `site` collection, `content/content/**` | hand-written MDX |
| `/components`, `/components/<slug>` | same | `catalogue` `StaticSource` + `prose` for the body | **generated** |
| `/blocks`, `/blocks/<slug>` | same | " | **generated** |
| `/pages`, `/pages/<slug>` | same | " | **generated** |
| `/api/search` | `app/api/search/route.ts` | `createSearchAPI` over `source` + `prose` | generated |
| `/llms.txt`, `/llms-full.txt`, `/prism-skill.md` | copied into `out/` post-build | `packages/llms/dist` | generated |
| `/<section>/<slug>.md` | Worker prefix rewrite to `out/md/**` | the mirror tree | generated |
| `/mcp` | `worker/index.ts` | ticket 13 | runtime |
| any unmatched path | `out/404.html` via `not_found_handling` | `app/not-found.tsx` | hand-written |

**Loader names and shapes.**

- `apps/site/source.config.ts` uses the **config API**
  (`defineConfig` + `defineCollections`), not the macro API, because
  `postprocess: { includeProcessedMarkdown: true }` (needed for the Markdown
  mirror, ticket 12) cannot be expressed with the macro form. It declares:
  - `site = defineCollections({ type: 'doc', dir: 'content' })` — the
    hand-written `content/docs/**`, `content/foundations/**`,
    `content/content/**` trees.
  - `prose = defineCollections({ type: 'doc', dir: 'items' })` — one optional
    MDX file per catalogue item at `items/<kind>/<slug>.mdx`.
- `apps/site/src/lib/source.ts`:
  - `export const source = loader({ site: site.toFumadocsSource(), catalogue: catalogueSource }, { baseUrl: '/' })`
    — the one routed tree. `catalogueSource` comes from
    `apps/site/src/lib/catalogue-source.ts`.
  - `export const prose = loader({ baseUrl: '/_prose', source: proseCollection.toFumadocsSource() })`
    — internal, not routed.
- `apps/site/src/lib/catalogue-source.ts` exports
  `catalogueSource: StaticSource` built from `buildCatalog()`. It is a plain
  object literal (no file on disk), with one `page` per item at the virtual path
  `<kind>s/<slug>.mdx` and `data` carrying the entry fields (`title`,
  `description`, `kind`, `category`, `status`, `exports`, `source`). It also
  emits one explicit `page` per section root at `<kind>s/index.mdx`, which is
  the "explicit index page so a section builds while thin" mechanism ticket 03
  identified: `generateParams()` emits one entry per page, so the index page is
  what makes `/components` exist when the catalogue is empty.
- `apps/site/src/app/[...slug]/page.tsx`:
  - `export function generateStaticParams() { return source.generateParams() }`
  - `export const dynamicParams = false`
  - `const page = source.getPage(slug); if (!page) notFound()` **before**
    returning, never inside a `<Suspense>` (Q11).
  - dispatches on `page.data.kind` for item pages, `page.data.index` for
    catalogue section indices, and the route prefix for the docs sections.

**`?category=` is a client island, because the server cannot read it.** Ticket
09 fixed the section index's category filter as `/components?category=…`. The
probe (finding 3) shows a server `searchParams` read makes the route dynamic
and fails the export. The index therefore renders
`<Suspense fallback={<ItemGrid items={items} />}><CategoryGrid items={items} /></Suspense>`:
`ItemGrid` is a pure presentational component (services the fallback, so the
full list is in the initial HTML for crawlers and no-JS readers), and
`CategoryGrid` is a `'use client'` island reading `useSearchParams()` and
filtering the same inlined item metadata. `CategoryNav` renders the links. The
item **previews** do not appear on the index, so the island ships metadata, not
demo code.

### 3. The shell is site-owned, and shipping it would leak

The docs frame is a site component, `apps/site/src/components/docs-shell.tsx`,
**not** a package export. Ticket 09 fixed the catalogue units as Component,
Block, Page; a docs frame is not one of them, and shipping it would leak site
concerns across the seam: the navigation shape of this site's page tree, the
search index URL, the theme defaults and the MDX component map. A consumer
cannot install a "DocsShell" without also adopting this site's IA. The honest
statement is that a generic **Page** composition demo could be added to
`pages/*` later if the roster wants one, and it would be a product-agnostic
screen model, not this shell.

`DocsShell` (Server Component) provides:

- `SectionNav` — the section sidebar, rendered from the merged page tree
  (`source.getPageTree()`), grouped by section and kind.
- `DocsArticle` — the article column.
- `TableOfContents` — `fumadocs-core/toc` (headless), fed by the page's
  `data.toc`.
- `Pager` — prev/next, from the flattened page tree.
- `ThemeControls` — `'use client'`, the pack and mode switcher, in §6.
- `SearchEntry` — `'use client'`, the button that lazily mounts the search
  dialog, in §7.
- `SiteHeader`, `MobileNav` and `Footer` — the site chrome, as today.

**What a docs frame owes the system it documents**, stated so it is checkable:
it composes `@nanisoft/prism-ui` exports and the semantic utilities emitted from
the same token `@theme`; it never declares a token value, a raw hex, a ramp
utility or a component-style override; it renders live demos from the package a
consumer installs; and it exposes the pack and mode axes exactly as the
consumer API defines them (`data-pack` + `.dark`, ticket 07). It imports no Base
UI and no internal path. The site's own Tailwind build is internal to the site
(ticket 07 §2 already says Tailwind is a dependency of the package and the
site), which is what lets the shell use the semantic utilities without the
library shipping them.

### 4. The per-item page template

One template, driven by `page.data.kind`, in this order:

1. **Header** — `h1` (the prose H1 when present, else the catalogue `name`),
   the catalogue `description` as the lede, and `Badge`s for kind, category and
   status.
2. **Overview** — hand-written MDX (`prose`), optional.
3. **Usage** — the library import line (`import { Button } from
   '@nanisoft/prism-ui/components/button'`; ticket 11 Q9 owns the exact copy)
   plus `<ComponentDemo slug={…} />` (live preview, copyable source).
4. **Guidelines** — hand-written MDX: `## When to use`, `## When not to use`,
   `## Best practices`, `## Content guidelines` (optional). Ticket 11 adopts
   plasma's skeleton; this ticket fixes only the slots and how they are filled.
5. **API reference** — the first and, for a component, only generated section:
   the props table built from the item's **emitted `.d.ts`** through ticket 12's
   extractor. A Block or Page substitutes a generated composition table (its
   `exports`, its files, its dependencies) because it has no own props.
6. **Shell** — prev/next and the table of contents.

**Which half owns what:** the hand-written MDX owns the H1, Overview and
Guidelines; the checked catalogue plus the emitted declarations own the API
table, the demo registry and the section indices. An item with no prose is a
valid page: slots 2 and 4 are absent, and the catalogue alone fills 1, 3, 5 and
6. That is what makes a partial catalogue shippable.

### 5. Live demos: keep `ComponentDemo` plus a generated registry

Kept, and hooked to the analyzer. Nothing in fumadocs ships a demo block
(research 03 §5.3), so this is the app's work either way.

- **One self-contained `.tsx` per demo**, `apps/site/src/demos/<slug>.tsx`,
  site-owned (demos are documentation, not catalogue items, so they are not in
  `packages/ui`). The file is the single source for the preview, the copy
  control and the corpus.
- **A generated registry**, `apps/site/scripts/generate-demos.mjs` scanning
  `src/demos/*.tsx` and emitting `apps/site/src/generated/demos.ts`, keyed by
  catalogue slug, carrying `{ component, source, client }`. `client` is measured
  the same way `analyze-blocks.mjs` measures today: `'use client'`, one of the
  client hooks, or a `next/*` client import. The registry is the demo analogue
  of `block-meta.json`.
- **`ComponentDemo`** (`apps/site/src/components/component-demo.tsx`) renders
  the preview in a bordered frame with a Preview/Code toggle and the existing
  `CopyButton` fed `source`.
- **The client boundary is recorded, not hidden.** A demo that needs
  interactivity is `'use client'` and hydrates; a demo that does not is a Server
  Component and adds nothing. The registry's measured `client` flag is what the
  page states. MDX pages remain Server Components; a client demo is an ordinary
  client island, which research 03 §5.1 confirms is the supported path under
  export.

This is also the answer to half of the map's "Playground" fog: rendered demos
plus copyable source, with the live-edit pane still not built.

### 6. Theme switching: the two axes now, scoping later

The site uses **`data-pack` plus a `.dark` class** on the document element and
mounts `PrismProvider`; `ThemeControls` calls `usePrismTheme()` for `setPack`,
`setMode` and `toggleMode`. `data-pack` and `.dark` are fixed by ticket 07 and
this ticket does not re-decide them. `PrismThemeScript` (or whatever first-paint
mechanism ticket 08 chooses) is placed in `<head>`, and `<html>` carries
`suppressHydrationWarning`.

**Selector scoping is ticket 08's, and this ticket does not decide it.** The
one place the site needs descendant scoping is `/themes`, which shows all five
packs at once:

- If ticket 08 makes pool selectors attribute-agnostic, `/themes` wraps each
  card in `data-pack="<id>"` and the card's own utility classes resolve against
  its pack.
- If ticket 08 rejects descendant scoping, the fallback is the current themes
  page's mechanism, stated only as a fallback and held to exactly as it exists:
  each card paints its own compiled values from `@nanisoft/prism-tokens`'
  resolved token modules as inline literals, so a card never inherits the active
  pack. This is a fallback, not a preference, and it is 08's to accept or
  replace.

Ticket 08 owns the choice; this ticket owns only that `/themes` has a working
rendering on either branch.

### 7. Search: `advanced` in `fumadocs-core`, our own UI, 300 KiB budget

**`advanced` mode, from `fumadocs-core` only, with a site-owned dialog.**

- **Index.** `apps/site/src/lib/search.ts` builds `createSearchAPI('advanced',
  { tokenizer: prismTokenizer, indexes })`; `indexes` is assembled from
  `source.getPages()` (catalogue metadata) and `prose.getPages()` (body text and
  headings), with the prose pages' internal `/_prose/…` URL rewritten to their
  public item URL. `apps/site/src/app/api/search/route.ts` is
  `export const revalidate = false` plus `export const { staticGET: GET }` from
  that API, which ships the whole serialised index as one file at `/api/search`.
- **UI is ours.** `SearchEntry` lazily `import()`s
  `apps/site/src/components/search/search-dialog.tsx` on first activation; the
  dialog uses `useDocsSearch` from `fumadocs-core/search/client` and
  `staticClient` from `fumadocs-core/search/client/orama-static`. No
  `fumadocs-ui`, no Radix, no `motion`, no `fumadocs-ui` stylesheet. The whole
  index is fetched once, on first search, not on page load.
- **Tokenizer is shared.** `apps/site/src/lib/search-tokenizer.ts` exports
  `prismTokenizer`, passed to `createSearchAPI` server-side and to the client
  through the static client's `initDB` hook, because the browser must tokenize
  the query identically to the build.
- **Budget.** A build-time gate, `apps/site/scripts/check-search-budget.mjs`,
  reads `out/api/search`, gzips it with `node:zlib`, and fails the build above
  **300 KiB gzipped**. The measured baseline from research 03 §3.3 is advanced
  80 to 227 KiB gzip for 60 pages; 300 KiB leaves headroom and is the tripwire.
- **Why advanced, and when simple wins.** Heading-level results are the point of
  a docs search: deep links to `#when-to-use` are what make the index worth
  downloading. `simple` is 5 KiB gzip but forfeits heading results (research 03
  §3.3). If the real index exceeds the budget, or if search is cut from v1,
  `simple` (or `flexsearchStaticClient`) wins; the budget gate is what forces
  that conversation instead of letting a multi-megabyte payload ship quietly.

### 8. The blog does not exist

`/blog` and `/rss.xml` are dropped: no route, no navigation item, no sitemap
entry, no corpus entry, no `MD_SECTIONS` entry and no redirect. The inventory
found a 0-byte `.gitkeep`, an empty live page and zero RSS items, and an empty
section is a worse signal than no section. Ticket 09 Q8 already dropped them
without redirect; this confirms it.

### 9. Static output and what is copied

`apps/site/next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true }, // the default loader is forbidden under export
  trailingSlash: false,          // out/docs.html and out/docs/quickstart.html
}
```

No `transpilePackages`: `@nanisoft/prism-ui` ships compiled JS and declarations
(tickets 05, 07), unlike the current `@ds/registry`.

**The build-time check, answered.** Next `16.3.6` accepts
`export const revalidate = false` on a static route handler under
`output: 'export'`, so every static handler uses it, matching fumadocs' own
snippets. `export const dynamic = 'force-static'` is accepted too; the two are
interchangeable here. With neither, the build fails. Concretely,
`app/api/search/route.ts` is the only route handler that needs it.

**What is copied, and what is only bundled.**

- **Bundled, not copied:** the token CSS. The site imports
  `@nanisoft/prism-ui/styles.css` once in `app/layout.tsx` (ticket 07's single
  lane) and its own `app/globals.css` adds only site chrome; Next emits the
  compiled, hashed CSS into `out/_next/static/css/**`. There is no
  hand-copied token stylesheet. (If the site ever wants to offer a downloadable
  token stylesheet, that is one `copyFile` in the script below, and it is not
  needed for rendering.)
- **Self-hosted fonts:** `next/font/local` over a committed Inter variable
  `woff2` under `apps/site/src/fonts/`, exposing a `--font-inter` variable
  applied on `<html>`, with the token `fontFamily.sans` stack pointing at it.
  Local over `next/font/google` for a deterministic CI build with no network
  fetch; the files land in `out/_next/static/media/**`. `next/font` is
  supported under `output: export`.
- **Copied post-build:** `apps/site/scripts/copy-agent-surface.mjs` copies
  `packages/llms/dist/llms.txt`, `llms-full.txt` and `prism-skill.md` into
  `out/`, and `packages/llms/dist/md/**` into `out/md/**`. It deliberately does
  **not** copy `data.json`: the Worker bundles it from the package, keeping it
  off the public asset surface (the old repository's rule, kept). Ticket 12
  owns how the mirror tree is produced; this ticket owns that the site copies
  it rather than routing it (see §10 for why).
- **Never copied:** the internal shadcn registry
  (`packages/ui/registry.json`, `packages/ui/public/r/**`). It is an integrity
  artifact (tickets 07, 09), not an asset directory, and nothing serves it.

`apps/site/package.json` scripts:

```jsonc
{
  "prebuild": "turbo run build --filter=@nanisoft/prism-tokens --filter=@nanisoft/prism-ui --filter=@nanisoft/prism-llms && node scripts/generate-catalogue.mjs && node scripts/generate-demos.mjs",
  "build": "next build",
  "postbuild": "node scripts/copy-agent-surface.mjs && node scripts/check-search-budget.mjs",
  "deploy": "wrangler deploy"
}
```

### 10. The Worker

Workers Static Assets serves the export asset-first. Three things cannot be
assets and go through the Worker: `/mcp` (POST and DELETE), the pretty `.md`
rewrite (because a missing asset must be caught before `not_found_handling`),
and, on the mirror path, the fact that a navigation request would otherwise
prefer asset serving and skip the Worker. That last point is why
`run_worker_first` is load-bearing, not incidental.

`apps/site/wrangler.jsonc`:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "prism-site",
  "main": "worker/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true },
  "assets": {
    "directory": "./out",
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash",
    "run_worker_first": [
      "/mcp",
      "/mcp/*",
      "/docs/*.md",
      "/components/*.md",
      "/blocks/*.md",
      "/pages/*.md",
      "/foundations/*.md",
      "/content/*.md"
    ]
  },
  "routes": [{ "pattern": "prism.nanisoft.com", "custom_domain": true }]
}
```

- **`worker/router.ts`** exports `MD_SECTIONS = ['docs', 'components', 'blocks',
  'pages', 'foundations', 'content']` and `rewriteMdPathname(pathname)`:
  `/docs/quickstart.md` → `/md/docs/quickstart.md`, then `env.ASSETS.fetch`
  of the rewritten request. The globs in `run_worker_first` and `MD_SECTIONS`
  are the same set, kept in sync by hand (the old repository's one known
  duplication; ticket 15 can add a check that they match).
- **`worker/index.ts`** routes `/mcp` and `/mcp/*` to the MCP handler (ticket
  13) and everything else through `rewriteMdPathname` before falling back to
  `env.ASSETS.fetch(request)`.
- **The recorded lesson is carried forward, and extended.** `run_worker_first`
  takes **glob** patterns; a route-style `:slug*.md` pattern silently never
  matches, so the Worker is never invoked and the mirror 404s as a plain asset.
  The old config also observed that `*` did not cross `/`; current Cloudflare
  docs say the array globs support deep matching, so the recommendation is to
  verify depth with `wrangler deploy --dry-run` and use `**` if a nested mirror
  path is ever introduced. The section slugs are flat, so `/<section>/*.md` is
  correct today.
- **`.md` mirrors are a copied tree, not a route handler.** Finding 4 is the
  reason: a route handler that emits both a prefix path and a child path
  (`/md/components` and `/md/components/button`) collides in the export copy
  step. The mirror is therefore generated into `packages/llms/dist/md/**` and
  copied into `out/md/**` (§9), and the pretty URL is the Worker rewrite. This
  also keeps the mirror out of `generateStaticParams`, out of the page tree and
  out of the Next route table entirely.

### 11. NotFound under export

The canonical route shape is kept, and it is not what makes the status real.

- `apps/site/src/app/not-found.tsx` is the site's 404 body, composed from
  `@nanisoft/prism-ui`; Next emits it to `out/404.html`.
- `assets.not_found_handling: "404-page"` makes Cloudflare return a real
  `404 Not Found` with that nearest `404.html` for any path with no asset.
- `app/[...slug]/page.tsx` keeps `const page = source.getPage(slug); if (!page)
  notFound()` **before** returning, never inside a `<Suspense>` boundary, so a
  request-time render would produce a real 404 rather than a soft 200 with
  `noindex`. This matches the canonical fumadocs route.
- `dynamicParams = false` means only `generateStaticParams` paths are emitted;
  unknown slugs have no file at all, so they reach `404.html`.

**The measured caveat that must be recorded.** Under export, `notFound()` at
build does not produce a 404 status. The probe generated a parameter for a
"ghost" path, called `notFound()`, and the export emitted `out/ghost.html`
containing the not-found body, alongside `out/404.html`. A static asset server
serves that file with a 200. So `notFound()` alone is a soft 404 under export;
the asset layer's `not_found_handling: "404-page"` is what makes the status
real. The canonical check is kept for shape and defense, and the real 404 is
declared in the Worker config.

### Handed to other tickets

- **Ticket 08:** selector scoping and first paint; §6's `/themes` fallback is
  conditional on 08's answer and is not decided here.
- **Ticket 11:** the prose skeleton's wording, the six guides' fate, the exact
  import-line copy, and the authoring plan; §4 fixes the slots it fills.
- **Ticket 12:** how the mirror tree is produced (framework `llms()` versus
  `prism-llms`), the corpus format, and the store; §9/§10 fix that the site
  copies it and the Worker serves it.
- **Ticket 13:** the MCP tool surface and transport inside `/mcp`; §10 fixes
  only that it is a Worker route.
- **Ticket 15:** the new gates this answer creates: `check-search-budget.mjs`,
  the demo `client`-flag measurement, the `run_worker_first`-vs-`MD_SECTIONS`
  set check, and an assertion that `packages/ui/public/r` never reaches `out/`.
- **Ticket 17:** the DNS and Worker-name move; §10 carries forward `prism-site`
  and `prism.nanisoft.com` from the old config, which ticket 17 confirms or
  overturns.
