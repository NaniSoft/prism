# Research 03 — Fumadocs headless on a statically exported Next.js app on Cloudflare Workers Static Assets

Researched: 2026-09-14, against primary sources only (fumadocs.dev docs, `fuma-nama/fumadocs` source at `main`, npm registry, nextjs.org, developers.cloudflare.com).

## Verdict

**GO.** Fumadocs explicitly and actively supports `output: 'export'` — the repo carries a maintained official example, `examples/next-static`, built against Next.js 16.x — and every headless primitive we need (`loader()` Source API, `PageTree`, `useBreadcrumb`, `fumadocs-core/toc`, static search, `llms.txt` routes) is exported from `fumadocs-core` independently of `fumadocs-ui`.

Two hard constraints shape the design:

1. **The built-in MCP endpoint cannot live inside the static export.** Fumadocs' own CLI refuses to add it to a static project (`packages/cli/src/features/mcp.ts`: `supports: (project) => project.static ? 'MCP requires a server at runtime' : ...`). It must go on a separate Worker — which is exactly what the map already plans as `@nanisoft/prism-mcp-server`.
2. **Next.js static export has no middleware/proxy, no rewrites, no headers config.** That kills Fumadocs' `Accept: text/markdown` negotiation and its `/docs/foo.md` → `/llms.mdx/...` rewrite *inside* Next. Cloudflare recovers both, cheaply, via `run_worker_first` route patterns on the same Worker that serves the assets.

---

## 1. Versions (exact, as of 2026-09-14)

| Package | Latest | Published |
| --- | --- | --- |
| `fumadocs-core` | **16.15.10** | 2026-09-13 |
| `fumadocs-ui` | **16.15.10** | 2026-09-13 |
| `fumadocs-mdx` | **15.4.0** | 2026-08-27 |
| `@fumadocs/cli` | 1.6.0 | — |
| `next` | **16.3.5** | 2026-09-11 |
| `wrangler` | **4.131.2** | 2026-09-14 |
| `@cloudflare/workers-types` | 5.20260914.1 | 2026-09-14 |

Load-bearing peer-dependency ranges (from `packages/*/package.json` on `main`):

- `fumadocs-core@16.15.10`: `next: 16.x.x`, `react: ^19.2.0`, `react-dom: ^19.2.0`, `zod: 4.x.x`, `@modelcontextprotocol/server: 2.x.x`. Dependency: `zbsearch: ^4.0.0`.
- `fumadocs-mdx@15.4.0`: `next: ^15.3.0 || ^16.0.0`, `fumadocs-core: ^16.15.3`, `react: ^19.2.0`, `zod: ^4.5.4`.
- `@modelcontextprotocol/server` latest is **2.0.0** (the new MCP 2.x package; `@modelcontextprotocol/sdk` is still on 1.30.0 — do not mix them up).

React `^19.2.0` is compatible with Prism's React 19 + antd v6 stack. Note `fumadocs-core` pins `next` to `16.x.x` while `fumadocs-mdx` also accepts `^15.3.0` — on Next 16 both are satisfied.

## 2. `output: 'export'` — supported, with a maintained reference

Fumadocs' static-build doc (`/docs/deploying/static`) says the library defaults to a server-first approach but you "can output a static build by configuring your React framework", and gives exactly this for Next.js:

```js
// next.config.mjs
const nextConfig = {
  output: 'export',
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
};
```

The stronger evidence is `examples/next-static` in the repo — a complete, working app whose `package.json` declares `next: 16.3.4` and whose config is literally `createMDX()` + `output: 'export'`, with docs pages, static search, `llms.txt` / `llms-full.txt` / per-page Markdown routes, and OG image routes. Build it, get `out/`, serve it with any static server (`"start": "serve out"`).

### Gotchas (each verified)

| Gotcha | Reality | Mitigation |
| --- | --- | --- |
| Middleware/`proxy.ts` | Unsupported in static export (Next's own unsupported list). Fumadocs' `Accept`-header negotiation and the `/docs/*.md` rewrite live here. | Do it at the edge with Workers `run_worker_first` (see §5), or ship plain `/llms.mdx/docs/**/content.md` URLs. |
| `rewrites` / `redirects` / `headers` in `next.config` | Unsupported. | `_headers` / `_redirects` files in the assets directory (Cloudflare-side). |
| Route Handlers | Only `GET`; must be statically prerendered. Next's docs say to add `export const dynamic = 'force-static'`; the official Fumadocs example uses `export const revalidate = false` and works — prefer the form the example proves. | Use `revalidate = false` on every route handler. |
| ISR | Unsupported. `revalidate = false` only. | — |
| Route Handlers that read the `Request` | Unsupported. | Keep handlers request-free (all Fumadocs static handlers are). |
| Dynamic routes | Need `generateStaticParams()`. | `source.generateParams()` covers docs; blog needs its own. |
| `next/image` default loader | Unsupported. | `images: { unoptimized: true }` or a custom loader. Fumadocs' `NextProvider` accepts a custom `Image` override if we want antd `Image`/plain `<img>`. |
| 404 | Next emits `out/404.html` when `app/not-found.tsx` exists. | Pair with Cloudflare `not_found_handling: "404-page"`. |
| Search index in the bundle | `staticGET` makes the client download the whole index. | Fine for a component-library docs site (small corpus). Revisit Orama Cloud/Algolia if it grows. |

## 3. `fumadocs-mdx` — `defineDocs` / `defineCollections` today

Two APIs. **Macro API** (`fumadocs-mdx/macro`) is now the default and recommended path — no `source.config.ts`, no codegen; the bundler compiles `defineDocs` / `defineCollections` into imports of content files. **Config API** (`fumadocs-mdx/config`) remains for a `source.config.ts` with global options.

### Macro API (recommended)

```ts
// lib/source.ts
import { llms, loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { defineCollections } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',          // dir lives on defineDocs, not per-collection
  docs: {                       // optional: options of the `doc` collection
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },  // needed for LLM Markdown
  },
  meta: {                       // optional: options of the `meta` collection
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

// blog as its own collection + its own loader
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: z.object({ date: z.string(), tags: z.array(z.string()).default([]) }),
});
export const blogSource = loader({ baseUrl: '/blog', source: blog.toFumadocsSource() });
```

Wire it into Next (ESM-only — use `next.config.mjs`; a `.ts` config needs Node's native TS resolver):

```js
// next.config.mjs
import { createMDX } from 'fumadocs-mdx/next';
const withMDX = createMDX();
export default withMDX({ output: 'export', reactStrictMode: true });
```

`createMDX({ macro: { include: ['lib/**/*.ts'] } })` narrows which modules the macro transform runs on. By default all JS/TS modules are eligible (`node_modules` always excluded).

### Macro constraints (these bite)

- Assign each call to a **top-level `const`** — `defineDocs()` inside a function is not supported.
- Options that shape bundling (`dir`, `files`, `async`) must be **string/boolean literals**; dynamic logic goes in `schema` / `mdxOptions`.
- `dynamic` collections are unsupported by the Macro API; use `async` for lazy loading.
- Re-exporting from `fumadocs-mdx/macro` is **not** supported (matters for how `prism-*` packages share config — Prism must not try to re-export these helpers).

### Config API equivalent

```ts
import { defineCollections, defineDocs } from 'fumadocs-mdx/config';
```
Same options; lives in `source.config.ts` and generates entry files under `.source`.

### Frontmatter schemas

`defineDocs` ships a **Zod 4** default; extend rather than replace:

```ts
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
defineDocs({
  docs: { schema: pageSchema.extend({ index: z.boolean().default(false) }) },
  meta: { schema: metaSchema.extend({ /* … */ }) },
});
```

Any **Standard Schema**-compatible validator works (Zod included). Validation is build-time, so output must be serializable. `schema` may be a function receiving a transform context (`ctx.path` = original file path).

Built-in doc frontmatter fields Fumadocs reads for page trees: `title`, `description`, `icon`. Each MDX module also exports `frontmatter`, `toc`, `structuredData` (search), and `extractedReferences`.

### `doc` / `meta` collection options

- `type: 'doc'` — Markdown/MDX → React components. Options: `dir`, `schema`, `mdxOptions`, `postprocess`, `async`.
- `type: 'meta'` — JSON/YAML → data arrays (the `meta.json` files).
- `mdxOptions` **replaces** all defaults (global config *and* Fumadocs MDX's). Wrap with `applyMdxPreset({ … })` to keep the preset.
- `postprocess.includeProcessedMarkdown: true` bakes the processed Markdown in, retrieved via `await page.data.getText('processed')`. Required for `llms()` `renderPage`.
- `postprocess.valueToExport: ['dataName']` promotes remark-plugin outputs from compile-time `vfile.data` into ESM exports.

### Per-page Markdown for LLMs

```ts
import { llms } from 'fumadocs-core/source';

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})\n\n${await page.data.getText('processed')}`,
});
```
`docsLlms.index(lang?)` → `llms.txt` from the page tree; `docsLlms.page(page)` → one page; `docsLlms.full(lang?)` → everything. `renderPage` is **required** for `page()`/`full()`.

## 4. Headless `fumadocs-core` — what we get free vs. what Prism builds

The docs are explicit: "It can be used without Fumadocs UI, in other words, it's headless."

**Required wrapper:** `NextProvider` from `fumadocs-core/framework/next` in the root layout. It is a thin `FrameworkProvider` binding `usePathname` / `useRouter` / `useParams` plus optional `Link` and `Image` overrides — the injection seam is exactly where Prism can hand it antd-friendly `Link`/`Image`. (Fumadocs UI's `RootProvider` is a superset; skip it.)

### Free from core

| Capability | Import | Notes |
| --- | --- | --- |
| Content loader | `loader` from `fumadocs-core/source` | Server-side, in-memory. `getPage(slugs, locale?)`, `getPages(locale?)`, `getPageTree(locale?)`, `getPageByUrl(url)`, `getNodePage(node)`, `getNodeMeta(node)`, `getLanguages()`, `generateParams()`, `serializePageTree(tree)`. |
| Page-tree types | `import type * as PageTree from 'fumadocs-core/page-tree'` | `Root`, `Page`, `Folder`, `Separator`. `type: 'page' \| 'folder' \| 'separator'`, `$ref` is internal. Tree is serialized to the client, so no functions/large data. |
| Tree utilities | `fumadocs-core/page-tree` | `findNeighbour`, `findSiblings`, `findParent`, `findPath`, `getPageTreeRoots` — prev/next pagination and parent chains are one call, not our code. |
| Breadcrumb | `useBreadcrumb(pathname, tree)` from `fumadocs-core/breadcrumb` | A **hook**, not a component — returns items; Prism renders them on antd `Breadcrumb`. Folder index page is used as the item when present. |
| TOC | `import * as Base from 'fumadocs-core/toc'` | `<Base.AnchorProvider>` (IntersectionObserver active-anchor), `<Base.ScrollProvider>`, `<Base.TOCItem>` exposing `data-active`. Zero styling — Prism styles via antd tokens. |
| Loader plugins | `plugins: [...]` on `loader()` | Hook into slug/tree generation. |
| Icons | `icon(iconName)` handler on `loader()` | Fumadocs ships no icon library; map names to `@ant-design/icons` (already re-exported by `prism-ui`). |
| Search client hook | `useDocsSearch({ client })` from `fumadocs-core/search/client` | Returns `{ search, setSearch, query }`. |
| Multiple sources | `loader({ docs: …, blog: … }, { baseUrl })` | Or one loader per section (cleaner for `/docs` + `/blog`). |
| Client hydration | `useFumadocsLoader` from `fumadocs-core/source/client` | Only needed for non-RSC client consumption. |

### Prism builds itself (on antd / prism-ui)

- `DocsShell` / `BlogLayout` page compositions (sidebar, header, footer, pagination, "On this page") — `DocsLayout`, `DocsPage`, `DocsBody` etc. all live in `fumadocs-ui`, which the map excludes.
- MDX component mapping (`getMDXComponents`) — maps headings/tables/code to Prism-styled antd components. Note `createRelativeLink(source, page)` from `fumadocs-ui/mdx` is UI-package; a ~10-line headless equivalent resolves relative links via `source.getPage`.
- Search dialog UI on antd (`Modal`/`Input`/`List`) driven by `useDocsSearch`.
- `ComponentDemo` block (rendered demo + copyable source) — Prism's docs-format v1.
- `notFound()` still comes from `next/navigation`.

### Page-tree conventions worth knowing

- Slugs come from file path: `./dir/page.mdx` → `['dir','page']`; `./dir/index.mdx` → `['dir']`; `./(group)/page.mdx` → `['page']` (parenthesised folders don't affect slugs).
- `meta.json` per folder: `title`, `icon`, `defaultOpen`, `collapsible`, `pagesIndex`, and `pages` supporting `---Separator---`, `[Text](url)`, `external:[Text](url)`, `...` (rest), `z...a`, `...folder` (extract), `!item` (exclude).
- Root folders (`"root": true`) scope the sidebar; `"root": "version"` gives version tabs with structural projection.
- **Hard rule: a page URL must appear at most once in the whole tree** — Fumadocs locates the active item purely by pathname. Relevant if `/docs/x` and `/blog/x` ever collide.

## 5. Search in static mode

The built-in engine changed: **it is now ZBSearch** (`zbsearch@^4.0.0`, zbsearch.dev), described as "the default but also the recommended option since it can be self-hosted and totally free". The docs page URL is still `/docs/headless/search/orama`, and the static client path is still `…/client/orama-static` (legacy naming). FlexSearch remains available as an alternative.

### Server → static file

```ts
// app/api/search/route.ts  → emits a static JSON index at build time
import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
```

Mechanically, `createEndpoint` exposes `staticGET()` as `Response.json(await server.export())` — the serialised ZBSearch DB (`{ type: 'advanced' | 'simple', i18n?, …save(db) }`) written into `out/api/search` (via `index.txt`). `staticGET` also exists on `createSearchAPI` and `flexsearchFromSource`. The dynamic counterpart is `GET(request)` reading `?query=`, `?tag=`, `?locale=`, `?limit=`.

### Client

```ts
import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';

const { search, setSearch, query } = useDocsSearch({ client: staticClient({ locale }) });
```
(The fetch-based variant is `fetchClient()` from `fumadocs-core/search/client/fetch` for a real server.)

Fed into a Prism search dialog built on antd `Modal` + `Input` + `List`; `query.data` is `'empty'` or the result array.

### Indexing options

- `createFromSource(source, { buildIndex(page) { … } })` — derive the index; add `tag` (e.g. `page.slugs[0]`) for per-section filtering, which maps cleanly onto "components vs. blog".
- Or build from raw indexes with `createSearchAPI('advanced', { indexes: source.getPages().map(…) })`, each entry needing `structuredData` (supplied by Fumadocs MDX, or from the `remark-structure` plugin).
- Headless hosting on any backend: `initAdvancedSearch({ indexes })` then `server.search(query, { tag, locale, limit })` — this is the primitive to reuse inside `prism-mcp-server`.
- i18n: default `multilingual` tokenizer handles all languages with zero config; a custom `tokenizer` must also be given to the **client** via `initDB` on `staticClient`.

### Caveat Fumadocs states outright

"Static Search requires clients to download the exported search indexes. For large docs sites, it can be expensive." For a component-library docs site this is a non-issue; if it becomes one, the escape hatch is Orama Cloud / Algolia, which "works without configuration" in static mode because the index lives on a remote server.

## 6. The built-in MCP tools — and why they can't live in the export

`fumadocs-core/mcp` exposes three tools over a Source API loader plus a search server:

| Tool | Input | Result |
| --- | --- | --- |
| `list_pages` | none | The page index from `llms.index()` (i.e. `llms.txt`) |
| `get_page` | `url`: page pathname | Markdown from `llms.page(page)`; resolves via `source.getPageByUrl()`; returns `isError: true` when unmatched |
| `search` | `query`, optional `locale` | JSON-encoded search results from `SearchServer.search()` |

Registration is decoupled from transport — `registerSourceTools(mcp, source, docsLlms)` and `registerSearchTool(mcp, createFromSource(source))` on an `McpServer` from `@modelcontextprotocol/server`, usable independently. The CLI-generated route is:

```ts
// app/api/mcp/route.ts  (fumadocs CLI: `npx @fumadocs/cli feature mcp`)
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { registerSearchTool, registerSourceTools } from 'fumadocs-core/mcp';
import { createFromSource } from 'fumadocs-core/search/server';
import { docsLlms, source } from '@/lib/source';

const handler = createMcpHandler(() => {
  const mcp = new McpServer({ name: 'docs', version: '1.0.0' });
  registerSourceTools(mcp, source, docsLlms);
  registerSearchTool(mcp, createFromSource(source));
  return mcp;
});

export const { GET, POST, DELETE } = handler; // streamable HTTP transport
```

**Why it can't be in the static export:** streamable HTTP requires a runtime server, and Fumadocs' own CLI gates it —

```ts
// packages/cli/src/features/mcp.ts
supports: (project) =>
  project.static ? 'MCP requires a server at runtime' : requiresMarkdown(project),
```

`examples/next-static` carries the `llms.txt`, `llms-full.txt` and per-page Markdown routes but **no** `/api/mcp`. Confirmed: MCP must be a separate server.

### Recommendation: `@nanisoft/prism-mcp-server` on Workers

The `registerSourceTools` / `registerSearchTool` helpers are framework-agnostic and take plain loaders — but a Worker importing the site's `.source` entries would drag MDX React components into the Worker bundle. Two sane shapes:

- **A. Mirror the static artefacts (recommended, matches the map).** The site build already emits `/llms.txt`, `/llms-full.txt` and `/llms.mdx/docs/**/content.md` as static files. `prism-mcp-server` binds `assets` to the same `out/` directory (or fetches the live URLs) and implements the three tools as thin wrappers: `list_pages` → `llms.txt`, `get_page` → fetch that page's `content.md`, `search` → either the site's own `/api/search` endpoint or a ZBSearch DB rebuilt in the Worker via `initAdvancedSearch({ indexes })`. Zero duplication, always in sync with the deployed site, no React in the Worker bundle. Deploy as its own Worker with a route pattern so it can sit on the same hostname.
- **B. Same Worker as the site.** `run_worker_first: ["/api/mcp*"]` with a `main` script — only `/api/mcp` is Worker-first, everything else stays pure asset serving. Viable, but couples the docs Worker to the site deploy and still needs option A's content strategy.

Option A is preferred: `prism-mcp-server` is already a planned package with both remote (Workers) and stdio targets, and the tool implementations are then shared between the two transports.

## 7. Blog as a collection, tags, RSS

- **Blog**: `defineCollections({ type: 'doc', dir: 'content/blog', schema })` + a second `loader({ baseUrl: '/blog', source: blog.toFumadocsSource() })`. The repo's own blog is exactly this shape (`apps/docs/content/blog/*.mdx`). `getPages()` is unsorted — sort by the schema's `date` in the blog layout.
- **Tags**: frontmatter `tags: z.array(z.string()).default([])`; filter in the layout, or feed into search `tag` for faceted search.
- **RSS in static mode: works.** Official guide uses the `feed` package and a `revalidate = false` route handler, so `app/rss.xml/route.ts` prerenders to `out/rss.xml`:

```ts
import { Feed } from 'feed';
import { blogSource } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const feed = new Feed({ title: 'Prism Blog', id: `${baseUrl}/blog`, /* … */ });
  for (const page of blogSource.getPages()) {
    feed.addItem({
      id: page.url, title: page.data.title, description: page.data.description,
      link: `${baseUrl}${page.url}`, date: new Date(page.data.date),
    });
  }
  return new Response(feed.rss2(), { headers: { 'Content-Type': 'application/rss+xml' } });
}
```
  Pair with `metadata.alternates.types['application/rss+xml']` in the root layout. Route handlers are `GET`-only and must not read the `Request` — both satisfied.

## 8. Cloudflare Workers Static Assets — wrangler config

Confirmed keys under `assets` (from the official wrangler configuration reference):

| Key | Values | Default |
| --- | --- | --- |
| `directory` | path to the export dir | — (required unless using the Cloudflare Vite plugin) |
| `binding` | name for `env.ASSETS.fetch()` | — ("only useful when a Worker script is set with `main`") |
| `not_found_handling` | `"none"` \| `"404-page"` \| `"single-page-application"` | `"none"` |
| `html_handling` | `"auto-trailing-slash"` \| `"force-trailing-slash"` \| `"drop-trailing-slash"` \| `"none"` | `"auto-trailing-slash"` |
| `run_worker_first` | `boolean` \| `string[]` (globs, `!` exclusions, max 100, must start with `/` or `!/`) | `false` |

Only one assets collection per Worker.

```jsonc
// apps/site/wrangler.jsonc
{
  "name": "prism-site",
  "compatibility_date": "2026-09-12",
  "main": "./worker/index.ts",
  "assets": {
    "directory": "./out",                 // Next.js static export output
    "binding": "ASSETS",
    "not_found_handling": "404-page",     // serves nearest 404.html with status 404
    "html_handling": "auto-trailing-slash",
    "run_worker_first": [
      "/docs/:slug*.md",                  // /docs/foo.md -> /llms.mdx/docs/foo/content.md
      "/api/mcp*"                         // if MCP ever co-locates (see §6 option B)
    ]
  }
}
```

### Trailing-slash alignment (matches by default)

Next's static export with `trailingSlash: false` (default) emits `out/docs/foo.html` for the link `/docs/foo`, plus `out/docs/index.html` and `out/404.html`. Cloudflare's default `auto-trailing-slash` "serves files like `foo.html` without a trailing slash and folder indexes like `foo/index.html` with one." Default + default line up; no `trailingSlash: true` needed. (If we ever prefer `/docs/foo/` URLs everywhere, set `trailingSlash: true` in Next and keep `auto-trailing-slash`.)

### 404

`not_found_handling: "404-page"` rewrites unmatched requests to the nearest `404.html` with a `404 Not Found` status. Requires `app/not-found.tsx` so Next emits `out/404.html`.

### Caching / headers

Defaults from Cloudflare: `Content-Type` from detected MIME, `Cache-Control: public, max-age=0, must-revalidate`, an `ETag` (file hash) honoured via `If-None-Match`, and `CF-Cache-Status`.

`_headers` is a plain extension-less file **in the assets directory** (i.e. `out/_headers`). It is never served, its rules override the defaults, and — important — it does **not** apply to Worker-generated responses. Up to 100 rules, 2000 chars/line, `*` splats referenced as `:splat`, `:name` placeholders, `! Name` to remove a header.

Put it in `public/_headers` so Next copies it into `out/` on every build:

```txt
/_next/static/*
  Cache-Control: public, max-age=31556952, immutable

/sw.js
  Cache-Control: no-cache

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

`_next/static/*` files are content-hashed, so `immutable` is correct and is the single biggest win. There is **no** `headers` key under `assets` — the `_headers` file is the only mechanism.

### Worker + assets routing order

Default is asset-first: Cloudflare serves a matching asset and only invokes the Worker when nothing matches. Navigation requests (`Sec-Fetch-Mode: navigate`) skip the Worker entirely at compatibility date `2025-04-01`+ (or with `assets_navigation_prefers_asset_serving`), cutting billable invocations. `run_worker_first: true` puts the Worker in front of everything; an array scopes it to specific paths — the mechanism that restores `/docs/*.md` and `/api/mcp` on a static host. Note: a `run_worker_first` array is "often paired with `not_found_handling: 'single-page-application'`", and combining it with Smart Placement can misplace the Worker (the whole script is one unit).

Also note `_headers` doesn't apply to Worker responses — set headers on the Worker's own `Response`.

---

## 9. Recommended `apps/site` skeleton

```
apps/site/
├── next.config.mjs              # createMDX() + output: 'export'
├── wrangler.jsonc               # assets: { directory: './out', not_found_handling: '404-page', … }
├── public/
│   └── _headers                 # copied into out/ by next build
├── worker/
│   └── index.ts                 # optional: run_worker_first handler for /docs/*.md rewrite
├── content/
│   ├── docs/                    # component docs; meta.json per folder
│   │   ├── meta.json
│   │   └── components/
│   │       ├── meta.json
│   │       └── button.mdx
│   └── blog/                    # blog collection
│       └── 2026-09-14-hello.mdx
├── lib/
│   ├── source.ts                # defineDocs + blog defineCollections + loaders + docsLlms
│   ├── blog.ts                  # (or fold into source.ts; macro forbids re-exporting fumadocs-mdx/macro)
│   ├── shared.ts                # docsRoute / blogRoute / getPageMarkdownUrl / gitConfig
│   └── mdx.tsx                  # getMDXComponents → Prism/antd mapping
├── app/
│   ├── layout.tsx               # <PrismProvider><NextProvider>…  (antd ConfigProvider wraps everything)
│   ├── not-found.tsx            # → out/404.html
│   ├── (home)/page.tsx
│   ├── docs/
│   │   ├── layout.tsx           # <DocsShell tree={source.getPageTree()}>  (Prism page)
│   │   └── [[...slug]]/page.tsx # generateStaticParams → source.generateParams()
│   ├── blog/
│   │   ├── layout.tsx           # <BlogLayout>  (Prism page)
│   │   ├── page.tsx             # sorted by date; generateStaticParams for /blog
│   │   └── [[...slug]]/page.tsx # generateStaticParams over blogSource
│   ├── api/search/route.ts      # revalidate = false; staticGET → out/api/search/index.txt
│   ├── rss.xml/route.ts         # revalidate = false; feed.rss2() → out/rss.xml
│   ├── llms.txt/route.ts        # revalidate = false; docsLlms.index()
│   ├── llms-full.txt/route.ts   # revalidate = false; docsLlms.full()
│   └── llms.mdx/
│       └── docs/[[...slug]]/route.ts   # revalidate = false; per-page Markdown
├── components/                  # Prism blocks composed for the site
│   ├── docs-shell.tsx           # antd Layout + Sider driven by source.getPageTree()
│   ├── toc.tsx                  # fumadocs-core/toc providers + Prism-styled items
│   ├── breadcrumb.tsx           # useBreadcrumb → antd Breadcrumb
│   ├── search-dialog.tsx        # antd Modal/Input/List + useDocsSearch({ client: staticClient() })
│   └── component-demo.tsx       # docs-format v1: rendered demo + copyable source
└── package.json                 # fumadocs-core, fumadocs-mdx, @types/mdx, zod@4, feed
```

Dependencies: `fumadocs-core@^16.15.10`, `fumadocs-mdx@^15.4.0`, `next@16.x`, `react@^19.2.0`, `zod@^4`, `@types/mdx`, `feed`, `@modelcontextprotocol/server@^2` (only in `prism-mcp-server`). **No `fumadocs-ui`.**

Deploy: `next build` → `out/` → `wrangler deploy` with the assets config above.

### Ordering / sequencing notes

1. `DocsShell` and `BlogLayout` belong in `prism-ui` as pages (per the map) — `apps/site` composes them. Their props should accept a `PageTree.Root` and a `loader()` output so the site stays thin.
2. Because `fumadocs-mdx/macro` cannot be re-exported, `prism-ui` must not try to ship a "docs collection helper". Content-source wiring is app-level; only the rendering surfaces (`DocsShell`, `BlogLayout`, `ComponentDemo`) are packages.
3. Ship `llms.txt` / `llms-full.txt` / per-page `.md` in v1 — they are free in static mode and are the substrate `prism-llms` and `prism-mcp-server` both consume.

## 10. Risks / open items

- **`revalidate = false` vs `dynamic = 'force-static'`** on route handlers: Fumadocs' static example uses the former and works; Next's docs prescribe the latter. Verify once on the first real build; if a handler isn't prerendered, add `dynamic = 'force-static'`.
- **Search index size** — only a concern if the docs corpus grows large; monitor `out/api/search` size in CI.
- **`run_worker_first` + Smart Placement** — Cloudflare warns the Worker is placed as a single unit. Irrelevant if we go with option A (separate MCP Worker) and only use `run_worker_first` for the `.md` rewrite, or not at all.
- **`examples/next-static` still uses `fumadocs-ui`** for the visual layer, so it is not a headless reference end-to-end. The headless pieces it exercises (`loader`, `llms`, `staticGET`, `staticClient`, `generateParams`, `PageTree`) are all core and independently verified above; the Prism-owned shell is the only genuinely new code.
- **Version churn** — `fumadocs-core` 16.x ships near-daily. Pin exact versions in `apps/site/package.json` and let changesets manage bumps, rather than ranging across minors.

## Sources

- Fumadocs docs — headless: https://fumadocs.dev/docs/headless
- Fumadocs docs — Source/Loader API: https://fumadocs.dev/docs/headless/source-api
- Fumadocs docs — Source adapters: https://fumadocs.dev/docs/headless/source-api/source
- Fumadocs docs — Page Slugs & Page Tree: https://fumadocs.dev/docs/headless/page-conventions
- Fumadocs docs — Page Tree: https://fumadocs.dev/docs/headless/page-tree
- Fumadocs docs — Breadcrumb: https://fumadocs.dev/docs/headless/components/breadcrumb
- Fumadocs docs — TOC: https://fumadocs.dev/docs/headless/components/toc
- Fumadocs docs — MCP: https://fumadocs.dev/docs/headless/utils/mcp
- Fumadocs docs — Built-in Search (ZBSearch): https://fumadocs.dev/docs/headless/search/orama
- Fumadocs docs — FlexSearch: https://fumadocs.dev/docs/headless/search/flexsearch
- Fumadocs docs — MDX Collections: https://fumadocs.dev/docs/mdx/collections
- Fumadocs docs — MDX Macro API: https://fumadocs.dev/docs/mdx/macro
- Fumadocs docs — MDX + Next.js: https://fumadocs.dev/docs/mdx/next
- Fumadocs docs — Static Build: https://fumadocs.dev/docs/deploying/static
- Fumadocs docs — AI & LLMs (llms.txt, MCP server, WebMCP): https://fumadocs.dev/docs/integrations/llms
- Fumadocs docs — RSS Feed: https://fumadocs.dev/docs/guides/rss
- Official static-export example: https://github.com/fuma-nama/fumadocs/tree/main/examples/next-static
- MCP feature template (static gate): https://github.com/fuma-nama/fumadocs/blob/main/packages/cli/src/features/mcp.ts
- LLMs feature template: https://github.com/fuma-nama/fumadocs/blob/main/packages/cli/src/features/llms.ts
- `fumadocs-core/mcp` source: https://github.com/fuma-nama/fumadocs/blob/main/packages/core/src/mcp.ts
- Search endpoint source (`staticGET`): https://github.com/fuma-nama/fumadocs/blob/main/packages/core/src/search/server/endpoint.ts
- Next.js — Static Exports: https://nextjs.org/docs/app/guides/static-exports
- Cloudflare — Workers Static Assets, SSG & 404: https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- Cloudflare — Workers Static Assets, Worker script routing: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- Cloudflare — Workers Static Assets, custom headers: https://developers.cloudflare.com/workers/static-assets/headers/
- Cloudflare — Wrangler configuration (`assets` schema): https://developers.cloudflare.com/workers/wrangler/configuration/
- npm registry (versions/dist-tags): https://registry.npmjs.org/-/package/fumadocs-core/dist-tags, `…/fumadocs-mdx`, `…/fumadocs-ui`, `…/next`, `…/wrangler`, `…/zbsearch`, `…/@modelcontextprotocol/server`
