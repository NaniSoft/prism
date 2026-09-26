# Research: fumadocs headless + Next.js 16 `output: export` — capability surface

Ticket: `.scratch/prism-shadcn/issues/03-fumadocs-headless-static-export-limits.md`
Date: 2026-09-26
Target versions: `fumadocs-core@16.15.14`, `fumadocs-mdx@15.4.5`, `fumadocs-ui@16.15.14`, Next.js `16.3.6`

## How to read this file

Every claim is tagged with how it was established:

| Tag | Meaning |
| --- | --- |
| `[npm]` | Read from the npm registry metadata for the `latest` version |
| `[src]` | Read from raw source on GitHub (`fuma-nama/fumadocs`, branch `main`) or the shipped `dist/` via unpkg |
| `[docs]` | Quoted from the fumadocs documentation site |
| `[nextjs]` | Quoted from the Next.js documentation site (version 16.3.6) |
| `[measured]` | I ran it; numbers are reproducible |
| `[inferred]` | My reasoning from the above, not a documented statement |
| `[UNVERIFIED]` | I could not establish this |

Two headline facts up front, because they change the shape of everything else:

1. **`fumadocs-core` does not depend on, peer-depend on, or dev-depend on `fumadocs-ui`.** The inherited "headless, no `fumadocs-ui`" decision is *still valid* at these versions. `[npm]`
2. **The inherited "fumadocs MCP cannot live in a static export" conclusion is still valid**, and the current docs say so in as many words. `[docs]`

---

## 1. What "headless" means today

### 1.1 The dependency direction

`fumadocs-core@16.15.14`: `[npm]`

```jsonc
"dependencies": { yaml, shiki, vfile, remark, unified, zbsearch, remark-gfm,
                  tinyglobby, npm-to-yarn, remark-rehype, github-slugger,
                  mdast-util-mdx, unist-util-visit, @fumari/image-size,
                  hast-util-to-estree, mdast-util-to-markdown,
                  hast-util-to-jsx-runtime, scroll-into-view-if-needed,
                  estree-util-value-to-estree }
"peerDependencies": { zod, next, waku, react, react-dom, flexsearch, @mdx-js/mdx,
                      @orama/core, @types/hast, @types/mdast, @types/react,
                      lucide-react, react-router, algoliasearch, @mixedbread/sdk,
                      @types/estree-jsx, @oramacloud/client,
                      @tanstack/react-router, @modelcontextprotocol/server }
"devDependencies": { next: 16.3.5, waku, react-router, ... }  // no fumadocs-ui
```

**No `fumadocs-ui` anywhere.** Every peer dependency is marked `optional: true` in `peerDependenciesMeta`, including `next` and `react`.

`fumadocs-mdx@15.4.5`: `[npm]` `dependencies` has no `fumadocs-ui`; peers are
`fumadocs-core: ^16.15.3`, `next: ^15.3.0 || ^16.0.0`, `react: ^19.2.0`, plus
optional vite/rolldown/satteri peers. `fumadocs-core` appears only in
`devDependencies` here.

`fumadocs-ui@16.15.14`: `[npm]` peers include **`fumadocs-core: 16.15.14`** (an exact
pin, no caret).

So the arrow points one way only: `fumadocs-ui → fumadocs-core`. **[inferred from npm
metadata, and structurally guaranteed — `fumadocs-core` could not `import 'fumadocs-ui'`
without declaring it, and it does not.]**

> **Loud statement, as requested:** `fumadocs-core` does **not** depend on or require
> `fumadocs-ui` at 16.15.14. The inherited headless decision is **not** invalidated.

Note the `fumadocs-ui` peer pin: it is an *exact* version. If we ever adopt
`fumadocs-ui`, it constrains us to exactly the `fumadocs-core` build it shipped against.
Today `latest` of both is `16.15.14`, so they are aligned.

### 1.2 `fumadocs-core` export surface

From the package `exports` map. `[npm]` "requires `fumadocs-ui`?" is answered by
whether the entry point's shipped code imports it (spot-checked at `[src]`).

**Content / source / routing (all headless):**

| Export | Purpose | Needs `fumadocs-ui`? |
| --- | --- | --- |
| `./source` | `loader()`, `dynamicLoader()`, `llms()`, `createGetUrl()` | No |
| `./source/schema` | `pageSchema`, `metaSchema` | No |
| `./source/client` | `useFumadocsLoader` (non-RSC consumers) | No |
| `./source/llms` | re-export of `llms()` | No |
| `./source/dynamic` | dynamic source helpers | No |
| `./source/plugins/*` | `slugs`, `lucide-icons`, `status-badges` | No |
| `./page-tree` | page tree types + utils | No |
| `./breadcrumb` | headless breadcrumb component | No |
| `./toc` | headless TOC | No |
| `./link` | headless `Link` | No |
| `./dynamic-link` | dynamic link | No |

**Search (all headless; optional peers only):**

| Export | Purpose | Needs `fumadocs-ui`? |
| --- | --- | --- |
| `./search` | `SearchServer` types | No |
| `./search/server` | `createFromSource`, `createSearchAPI`, `createI18nSearchAPI`, `initAdvancedSearch`, `initSimpleSearch` | No |
| `./search/client` | `useDocsSearch` | No |
| `./search/client/fetch` | `fetchClient` (needs a runtime API route) | No |
| `./search/client/orama-static` | `staticClient` — **build-time index, computed in browser** | No |
| `./search/client/flexsearch-static` | `flexsearchStaticClient` | No (`flexsearch` peer) |
| `./search/flexsearch` | `flexsearch`, `flexsearchFromSource`, `flexsearchI18n` | No |
| `./search/algolia`, `./search/client/algolia` | Algolia | No |
| `./search/orama-cloud`, `./search/client/orama-cloud` | Orama Cloud | No |
| `./search/orama-cloud-legacy`, `./search/client/orama-cloud-legacy` | legacy Orama | No |
| `./search/mixedbread`, `./search/client/mixedbread` | Mixedbread | No |

**LLM / markdown (headless):**

| Export | Purpose | Needs `fumadocs-ui`? |
| --- | --- | --- |
| `./mcp` | `registerSourceTools`, `registerSearchTool` | No — `dist/mcp.js` imports **only** `zod` `[src]` |
| `./negotiation` | `isMarkdownPreferred`, `rewritePath` | No |
| `./content/md` | `createMarkdownRenderer` (react-markdown-style) | No |
| `./content/toc`, `./content/github`, `./content/md/frontmatter` | utilities | No |
| `./content/mdx/preset-bundler`, `./content/mdx/preset-runtime` | MDX presets for non-fumadocs-mdx pipelines | No |

**MDX plugins (headless):** `./mdx-plugins` plus `rehype-code`, `rehype-toc`,
`remark-gfm`, `remark-image`, `remark-heading`, `remark-structure`, `remark-steps`,
`remark-npm`, `remark-code-tab`, `remark-admonition`,
`remark-directive-admonition`, `remark-mdx-files`, `remark-mdx-mermaid`,
`remark-block-id`, `remark-feedback-block`, `stringifier`, `codeblock-utils`,
`transformer-icon`, **`remark-llms`**, **`remark-llms.runtime`**.

**Framework bindings (headless):** `./framework`, `./framework/next`,
`./framework/waku`, `./framework/astro`, `./framework/tanstack`,
`./framework/react-router`.

**Misc:** `./highlight`, `./highlight/shiki`, `./highlight/shiki/full`,
`./highlight/shiki/react`, `./highlight/client`, `./i18n`, `./i18n/middleware`,
`./server` (with a `browser` export condition), `./server.browser`,
`./utils/use-on-change`, `./utils/use-media-query`, `./package.json`.

`./server` is used for React→Markdown rendering: `renderToMarkdown`, `asMarkdown`, `md`
(tagged template). `[docs]` `/docs/headless/mdx/remark-llms#output`

### 1.3 `fumadocs-mdx` export surface

`[npm]` — **no export requires `fumadocs-ui`.**

`.` (config/loader), `./bin`, `./next` (the `createMDX()` Next config plugin),
`./vite`, `./rolldown`, `./bun`, `./node`, `./node/loader`, `./node/_loader`,
**`./macro`** (`defineDocs` / `defineCollections` in app modules — no codegen),
**`./config`** (`defineConfig` / `defineDocs` / `defineCollections` in
`source.config.ts` — generates entry files under `.source`), `./webpack/mdx`,
`./webpack/meta`, `./webpack/macro`, `./runtime/macro`, `./runtime/types`,
`./runtime/server`, `./runtime/browser`, `./runtime/dynamic`,
`./plugins/index-file`, `./plugins/json-schema`, `./plugins/last-modified`.

### 1.4 What genuinely does pull in `fumadocs-ui`

Only things you import *from* `fumadocs-ui`:
`fumadocs-ui/layouts/*` (Docs, Flux, Glass, Home, Notebook layouts + page shells),
`fumadocs-ui/provider/*` (`RootProvider`), `fumadocs-ui/mdx` (default MDX components
map), `fumadocs-ui/contexts/{i18n,tree,search}`, `fumadocs-ui/components/**`,
`fumadocs-ui/style.css` + `fumadocs-ui/css/*.css`, `fumadocs-ui/page`, `fumadocs-ui/i18n`,
`fumadocs-ui/og`, `fumadocs-ui/legacy/*`.

The fumadocs docs are explicit that the headless path is a first-class mode:

> "Fumadocs Core offers server-side functions and headless components to build docs on
> React.js frameworks like Next.js, Waku, and Astro with React islands." `[docs]` `/docs/headless`
>
> "It can be used without Fumadocs UI, in other words, it's headless." `[docs]` `/docs/headless`

The only thing the headless path asks for is a framework provider from **core**, not UI:
`NextProvider` from `fumadocs-core/framework/next`. `[docs]` `/docs/headless`

---

## 2. Static export support

### 2.1 fumadocs documents a static mode

There is a dedicated page: **`/docs/deploying/static` — "Fumadocs (Framework Mode): Static
Build"**. `[docs]`

> "By default, Fumadocs use a server-first approach which always requires a running server
> to serve. You can output a static build by configuring your React framework."

Its Next.js section is just `output: 'export'`, and it points at the Next.js guide for
limitations:

> "You can enable Next.js static export, it allows you to export the app as a static HTML
> site without a Node.js server. […] See [Next.js docs](https://nextjs.org/docs/app/guides/static-exports)
> for limitations and details."

**Important scoping observation:** the static-build page has exactly two concerns —
`Search` and `Deployment`. It says **nothing** about the LLM routes (`llms.txt`,
`*.md`) or MCP under static export. `[inferred from reading the whole page]` That
silence is itself evidence: those features are not part of the supported static story.

### 2.2 Next.js 16 `output: export` — supported / forbidden

From `/docs/app/guides/static-exports` (version 16.3.6, lastUpdated 2026-08-25). `[nextjs]`

**Supported:**

| Feature | Note |
| --- | --- |
| Server Components | run during `next build`; emit static HTML + a static payload for client navigation |
| Client Components | prerendered to HTML; browser APIs only in effects |
| `next/image` | **only** with a custom `loader: 'custom'` + `loaderFile`. Default loader unsupported. |
| Route Handlers | `GET` only. "you must explicitly mark the handler as static by adding `export const dynamic = 'force-static'` when a static export is enabled" |

**Unsupported — verbatim list.** `[nextjs]`

> * Dynamic Routes with `dynamicParams: true`
> * Dynamic Routes without `generateStaticParams()`
> * Route Handlers that rely on Request
> * Cookies
> * **Rewrites**
> * **Redirects**
> * Headers
> * **Proxy**   ← this is the Next 16 name for `middleware.ts`
> * **Incremental Static Regeneration**
> * Image Optimization with the default `loader`
> * Draft Mode
> * **Server Actions**
> * Intercepting Routes

> "Attempting to use any of these features with `next dev` will result in an error,
> similar to setting the `dynamic` option to `error` in the root layout."

Note the rename: **middleware is now `proxy.ts`** in Next 16 and is on the forbidden list.
This matters because fumadocs' i18n and content-negotiation recipes are middleware/proxy
based (see §6).

Answering the specific sub-questions:

- **Search index** — a Route Handler, so *possible*, but only as a `GET` +
  `force-static` route. See §3. Fumadocs' own static recipe uses `export const revalidate = false`
  instead of `dynamic = 'force-static'`. `[docs]` `/docs/headless/search/orama#static-export`
  Both mean "never revalidate"; whether Next 16 accepts `revalidate` under `output: export`
  or requires `force-static` as the guide states is **[UNVERIFIED]** — I did not build it.
- **Any route depending on request data** — forbidden. "If you need to read dynamic values
  from the incoming request, you cannot use a static export." `[nextjs]`
- **Image optimization** — default loader forbidden; custom loader required.
- **`generateMetadata` / sitemap / robots** — **allowed.** `sitemap.(js|ts)` "is a special
  Route Handler that is cached by default unless it uses a Request-time API or `dynamic`
  config option." `[nextjs]` `/docs/app/api-reference/file-conventions/metadata/sitemap`
  Both are computed at build from your own `source`, so this works.
- **ISR** — forbidden. Reinforced in the ISR guide's platform table:
  "Static export | No", and "ISR is not supported when creating a Static Export." `[nextjs]`
- **Middleware** — forbidden (now `proxy.ts`). `[nextjs]`
- **Rewrites** — forbidden. `[nextjs]` ← *this breaks fumadocs' documented `*.md` recipe, see §6.*
- **Dynamic route params at request time** — forbidden (`dynamicParams: true` unsupported). `[nextjs]`
- **`notFound()`** — **works, and is the correct tool.** It throws
  `NEXT_HTTP_ERROR_FALLBACK;404`, terminates that route segment, and injects
  `<meta name="robots" content="noindex" />`. `[nextjs]`
  Caveat from the docs: if the check runs *inside* a `<Suspense>` boundary after
  streaming starts, the HTTP status is already `200` and you get a soft 404 with
  `noindex`. For a real 404 under export, check before streaming. `[nextjs]`
  This is exactly what the canonical fumadocs route does — `if (!page) notFound()` in
  the page body, before returning. `[docs]` `/docs/manual-installation/next`

### 2.3 Claim (a): "empty docs sections only build under static export because the section roots are optional catch-all routes"

**Verdict: the conclusion is right, the stated mechanism is wrong. The claim is garbled.**

Two separate facts, both verifiable:

1. **The canonical fumadocs docs route *is* an optional catch-all**:
   `app/docs/[[...slug]]/page.tsx`. `[docs]` `/docs/manual-installation/next` So the
   *shape* the claim gestures at is real.

2. **But optionality of the segment has nothing to do with whether a section root gets
   built.** What emits files is `generateStaticParams()`. And `source.generateParams()`
   returns **one entry per page, nothing else**: `[src]` `packages/core/src/source/loader.ts`

   ```ts
   generateParams(slug, lang) {
     if (i18n) {
       return this.getLanguages().flatMap((entry) =>
         entry.pages.map((page) => ({
           [slug ?? 'slug']: page.slugs,
           [lang ?? 'lang']: entry.language,
         })),
       );
     }
     return this.getPages().map((page) => ({ [slug ?? 'slug']: page.slugs }));
   }
   ```

   A folder with no `index.mdx` has no page, so no params entry, so **no emitted file** —
   under static export *or* under SSR. The section root 404s either way.

So: **refute as stated.** Section roots do not "only build under static export"; they
build if and only if an index page exists. If the old site made empty sections work, it
did so by other means (an explicit `[...slug]`/index page, a `pages` entry, or a
synthetic index file) — and the same mechanism is required under `output: export` now.

There is a real adjacent Next.js behaviour worth recording, because it is probably what
the old note was *actually* about. From `/docs/app/api-reference/functions/generate-static-params`: `[nextjs]`

> "To prevent unspecified paths from being prerendered at runtime, add the
> `export const dynamicParams = false` option in a route segment. When this config option
> is used, only paths provided by `generateStaticParams` will be served, and unspecified
> routes will 404 **or match (in the case of catch-all routes)**."

So a closed catch-all will *match* rather than 404 for unspecified paths — which under
`output: export` just means it falls through to the not-found document. And `dynamicParams: true`
is unsupported under export, so `dynamicParams` must be `false` or unset here.

### 2.4 Claim (b): "Next 16 prefetch payloads for catch-all roots 404"

**Verdict: could not confirm; strong evidence it is now overtaken. Treat as refuted-pending-reproduction.**

I could not find the original report, and I could not reproduce it (no Next 16 app in this
repo). But the Next.js 16 canary changelog contains a whole feature stack aimed at exactly
this, merged Jan–Apr 2026:

- **#89202 "fix: fully static pages should emit & serve static rsc payloads"** — *merged into
  `canary` 2026-01-29.* Author's words: "This restores old behavior of emitting a `.rsc`
  file for a fully static route. This information technically also exists in the `.segments`
  directory, but it's split into parts […] In addition to emitting the route, this also
  ensures we set `prefetchDataRoute` to point to this." It also adds an e2e asserting
  "`prefetch={false}` navigation does not wait for a dynamic render." `[src]` GitHub PR
- A dedicated **"output export fallback"** stack (#93013–#93022, then superseded by
  #93025 → #93031), including:
  - **#93020 "output export fallback: prefetch and dedupe fallback payloads"**
  - **#92555 "output export fallback: recover unmatched routes with `_not-found`"**
  - #93016 "hide the bootstrap shell", #93017 "guard server-only APIs",
    #93019 "avoid fallback document URL swaps", #93022 "prefer deeper static prefixes"

**What I could not establish:** whether this fallback is on by default, whether it is
stable in 16.3.6, and whether it changes the observable status code for a request to an
unmatched catch-all root. Critically, **the fallback is entirely undocumented** — I
fetched `docs/01-app/02-guides/static-exports.mdx` from the `canary` branch and it is
byte-identical in substance to the published 16.3.6 page: the unsupported list above,
with no mention of any fallback. `[nextjs]`

So: the specific old observation may have been real on some earlier 16.x, but a blanket
"Next 16 prefetch payloads for catch-all roots 404" is not supportable against current
canary, and the fallback stack's own PR titles argue against it. **Flagged for empirical
re-test**, not for acceptance.

---

## 3. Search

### 3.1 Yes — the index can be built at build time and shipped as a static asset

This is a first-class, documented feature. `[docs]` `/docs/headless/search/orama#static-export`

> "To support usage with static site, use `staticGET` from search server and make the route
> static or pre-rendered."

```ts title="app/api/search/route.ts"
// Next.js tab, verbatim from the docs
import { source } from '@/lib/source';
import { createFromSource(source) from 'fumadocs-core/search/server';

export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
```

What `staticGET` actually is, from source: `[src]` `packages/core/src/search/server/endpoint.ts`

```ts
async staticGET() {
  return Response.json(await server.export());
},
```

i.e. **the entire serialised search database, as one JSON body.** No query parameter, no
search at request time. `[inferred]`

`staticGET` is also on `createSearchAPI` and on `flexsearchFromSource` / `flexsearch`. `[docs]`

### 3.2 The API surface

Server, `fumadocs-core/search/server`: `[src]` `packages/core/src/search/zbsearch/create-server.ts`

- `createFromSource(loader, options?)` — builds from a Loader API instance. Returns
  `{ GET, staticGET, export, search }`. If `loader._i18n` is set it auto-delegates to
  `createI18nSearchAPI('advanced', …)`.
- `createSearchAPI('simple' | 'advanced', { indexes, … })` — builds from raw indexes.
- `createI18nSearchAPI('simple' | 'advanced', { i18n, indexes })`
- `initSimpleSearch(options)` / `initAdvancedSearch(options)` — the raw `SearchServer`,
  with a `.search(query, opts)` method. This is the "host it on Express/Elysia" path. `[docs]`
- `options.buildIndex(page)` lets you map a page to an index entry (used for `tag`). `[docs]`
- `options.tokenizer` / `options.localeMap` for stemming; note the warning that a custom
  `tokenizer` **must also be given to the client** via `initDB`, since the browser has to
  tokenize the query identically. `[docs]`

Client, all headless (no `fumadocs-ui`): `[docs]` + `[src]`

```ts
import { useDocsSearch } from 'fumadocs-core/search/client';
import { fetchClient } from 'fumadocs-core/search/client/fetch';        // needs a runtime route
// or, for static:
import { staticClient } from 'fumadocs-core/search/client/orama-static';
// or FlexSearch:
import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
```

`staticClient` reads from `from` (default `'/api/search'`) with a plain `fetch`, then
`load(db, data)` into a ZBSearch instance held in a module-level `Map` cache keyed by URL.
`[src]` `packages/core/src/search/client/orama-static.ts` — so **the whole index is
downloaded and deserialised in the browser, once, on first search**, and never leaves
the client afterwards.

### 3.3 Payload size for ~60 pages — measured

Not documented anywhere, so I measured it. `[measured]`

Method: installed `fumadocs-core@16.15.14` in a scratch dir, synthesised 60 realistic
design-system pages (title, description, 8 headings, 40 prose blocks, breadcrumbs), ran
`createSearchAPI(mode, { indexes }).export()` — the exact call behind `staticGET()` — and
measured `JSON.stringify` of the result. Raw = what the client downloads; gzip = what a CDN
would serve.

| Mode | Pages | Index documents | Raw | gzip | Raw/page |
| --- | --- | --- | --- | --- | --- |
| `advanced` (default) | 60 | 3 000 | **3 607 KiB (3.5 MiB)** | 227 KiB | 61 562 B |
| `advanced` (leaner pages) | 60 | 960 | **1 053 KiB (1.0 MiB)** | 80 KiB | 17 967 B |
| `simple` | 60 | 60 | **54 KiB** | 5 KiB | 927 B |

**Read this as: 1–3.5 MiB raw, 80–230 KiB gzipped, for advanced mode at 60 pages.** It scales
with *page length*, not page count, because advanced mode explodes each page into one
document per heading and per content block, and each of those documents repeats `url`,
`breadcrumbs`, `tags`, and `locale`. From `build-doc.ts`: `[src]`

```ts
docs.push({ id: page.id, page_id: page.id, type: 'page', content: page.title, … });
if (page.description && !data.contents.some(…)) docs.push({ type: 'text', content: page.description, … });
for (const heading of data.headings)     docs.push({ type: 'heading', content: heading.content, url: `${page.url}#${heading.id}`, … });
for (const content of data.contents)     docs.push({ type: 'text',      content: content.content,     url: `${content.heading ? `${page.url}#${content.heading}` : page.url}`, … });
```

`simple` mode is ~55× smaller because it stores one document per page with a single
concatenated `content` field — but it forfeits heading-level results.

Two things that keep this from being worse: the `embeddings: 'vector[512]'` field in
`advancedSchema` is **not populated by `buildDocuments`** — it only fills if you configure a
vectorizer plugin/proxy, so the default export carries no embedding payload. `[src]`
And gzip does a lot of work here (12–16×), because the repeated field names compress well.

The docs' own warning matches this measurement: `[docs]`
> "Static Search requires clients to download the exported search indexes. For large docs
> sites, it can be expensive. You should use cloud solutions like Orama Cloud or Algolia for
> these cases."

**For ~60 pages this is a real but bounded cost**, and it is a one-time lazy download on
first search interaction, not on page load. `[inferred]`

### 3.4 Does it work under `output: export`?

Per the docs: yes, that's the whole point of the static-build page's Search section, which
says: `[docs]` `/docs/deploying/static`

> "1. Configure Search Server. 2. Configure Search UI/Client. After the configurations,
> your app will statically store the search indexes, and search will be computed on browser
> instead."

Two caveats `[inferred from cross-referencing §2.2]`:
- The route handler needs `dynamic = 'force-static'` per Next.js's own guide; the fumadocs
  snippet uses `revalidate = false`. Probably equivalent, untested here. **[UNVERIFIED]**
- Cloud search (Algolia / Orama Cloud / Mixedbread / Typesense) needs no configuration at
  all under export, per the same page: "Since the search functionality is powered by remote
  servers, static export works without configuration." `[docs]`

### 3.5 Is there a headless search option that does not require `fumadocs-ui`? Yes, entirely.

The whole search stack — server, clients, static mode — is in `fumadocs-core` and imports
nothing from `fumadocs-ui`. `[npm]` `[src]` Headless options available without `fumadocs-ui`:
built-in ZBSearch (`staticClient`), FlexSearch (`flexsearchStaticClient`), and the
client adapters for Algolia, Orama Cloud, and Mixedbread.

The docs present this explicitly as the alternative to the UI: `[docs]` `/docs/headless/search/orama`
> "**Search Client**: […] import { useDocsSearch } from 'fumadocs-core/search/client';
> import { staticClient } from 'fumadocs-core/search/client/orama-static';"

### 3.6 Does `fumadocs-ui` provide a search dialog, and is it usable standalone?

Yes to both, with a caveat. `[docs]` `/docs/search/orama` + `[src]` `dist/components/dialog/search.js`

Exports from `fumadocs-ui/components/dialog/search`: `SearchDialog`, `SearchDialogOverlay`,
`SearchDialogContent`, `SearchDialogHeader`, `SearchDialogIcon`, `SearchDialogInput`,
`SearchDialogClose`, `SearchDialogFooter`, `SearchDialogList`, `SearchDialogListItem`,
`TagsList`, `TagsListItem`, plus `useSearch` / `useSearchList` / `useTagsList`. The docs
show it being re-created from scratch and passed to `<RootProvider search={{ SearchDialog }} />`. `[docs]`

**Standalone-usable, with three qualifications I verified in the shipped code:**
1. It does **not** import `fumadocs-core/i18n` or `RootProvider` — so it can be rendered
   without a Fumadocs UI provider tree. `[src]`
2. It *does* import `@radix-ui/react-dialog`, `fumadocs-core/framework` (`useRouter`),
   `fumadocs-core/content/md`, `rehype-raw`, `class-variance-authority`, `lucide-react`,
   `@fuma-translate/react`, and `scroll-into-view-if-needed` — all of which come along as
   `fumadocs-ui` dependencies. So adopting it means adopting `fumadocs-ui` (and its
   Radix/`motion` dependency tree), just not its layouts. `[src]`
3. Every visual class is a **fumadocs-ui design token** — `bg-fd-popover`, `text-fd-muted-foreground`,
   `border-fd-border`, `animate-fd-dialog-in`, and so on. Without
   `fumadocs-ui/css/preset.css` it renders unstyled. `[src]`

So: usable without `RootProvider` or the layouts, but **not** usable without the package and
its stylesheet.

---

## 4. The MDX pipeline

### 4.1 Two ways to define collections

Both exist and are current. `[docs]`

**Macro API** (`fumadocs-mdx/macro`) — declare in an app module, no codegen, no
`source.config.ts`. This is what the official Next.js guide uses. `[docs]` `/docs/mdx/macro`

```ts
// lib/source.ts
import { defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';

const docs = defineDocs({ dir: 'content/docs' });
export const source = loader({ baseUrl: '/docs', source: docs.toFumadocsSource() });
```

Macro constraints, verbatim: `[docs]`
- "Assign each call to a top-level `const` (the variable name identifies the collection)."
- "Options that shape how content is bundled (`dir`, `files`, `async`) must be statically
  analyzable (string / boolean literals)."
- "`dynamic` collections are not supported by the Macro API yet."
- "Re-exporting from `fumadocs-mdx/macro` is not supported."
- Configurable via `createMDX({ macro: { include: ['lib/**/*.ts'] } })`; disable with `macro: false`.

**Config API** (`fumadocs-mdx/config`) — `defineConfig` / `defineDocs` / `defineCollections`
in `source.config.ts`, generating entry files under `.source`. Needed for `dynamic: true`
and for `includeProcessedMarkdown` (see §6), which the macro form cannot express. `[docs]` `/docs/mdx/collections`

`defineCollections({ type: 'doc' | 'meta', dir, files, schema, mdxOptions, postprocess, async, dynamic, lastModified, … })`. `[docs]`
Setting collection-level `mdxOptions` "**removes** the default options & plugins" — use
`applyMdxPreset({...})` to extend rather than replace. `[docs]`

### 4.2 The loader model

`loader()` is **not** a filesystem reader and **not** a build-time macro. `[docs]` `/docs/headless/source-api`

> "`loader()` is a server-side API, not a build-time magic or browser compatible API.
> It uses in-memory storage, the files are passed from your content sources."

It takes a `StaticSource` (a `{ files: [...] }` array — plain objects, with **virtual**
paths only: `'file.mdx'` and `'content/file.mdx'` are legal, `'./file.mdx'` and `'D://…'` are
not) or a `Record<string, StaticSource>` for multiple named sources. `[docs]` `[src]`

`fumadocs-mdx` is just one such source; it hands `loader()` an array of files it produced at
compile time. `[docs]` `/docs/mdx/entry/server`

`loader()` output: `getPage`, `getPages`, `getPageTree`, `getPageByUrl`, `getPageByHref`,
`getNodePage`, `getNodeMeta`, `generateParams`, `getLanguages`,
`serializePageTree` (for non-RSC consumers via `useFumadocsLoader`). `[docs]` `[src]`

Config surface: `baseUrl` (or a `url(slugs, locale)` function), `slugs(file, next)`,
`icon(icon)`, `i18n`, `pageTree`, and `plugins`. `[docs]` `[src]`

`dynamicLoader()` wraps a `DynamicSource` and adds `invalidate()` / `revalidate()`. `[docs]`

### 4.3 How a collection becomes a sidebar group

Not via `meta.json` → sidebar directly. The chain is: **files → slugs → page tree → your
component**. `[docs]` `/docs/headless/page-conventions`

> "Fumadocs generates **page slugs** and **page tree** (sidebar items) from your content
> directory using `loader()`, **the routing functionality will be handled by your React framework**."

Slugs come from file path: `./dir/page.mdx` → `['dir','page']`; `./dir/index.mdx` → `['dir']`.
Wrapping a folder in parens — `./(group)/page.mdx` → `['page']` — decouples the URL from
the folder. `[docs]` `[src]`

`meta.json` controls tree *presentation* of an otherwise-implicit tree. Keys: `title`,
`icon`, `defaultOpen`, `collapsible`, `pages`, `pagesIndex`. `[docs]`

- `pages` is an ordered expression list, and **"When specified, items are not included
  unless they are listed in `pages`."** Syntax: `./path`, `---Label---` (separator),
  `[Text](url)` (link, `external:` prefix for external), `...` (rest, alphabetical),
  `z...a` (reversed rest), `...folder` (extract), `!item` (except). `[docs]`
- `pagesIndex` makes a folder clickable, pointing at an `index` file by default, or a Path
  or a Link. `[docs]`
- `root: true` (or `root: '<type>'`) marks a *root folder* — a version/tab grouping that
  hides sibling trees and enables "structural projection" between same-type roots
  (`v1/guide.mdx` ↔ `v2/guide.mdx`). `[docs]`
- Hard constraint: "**No Duplicated URL** — The same page URL must not appear more than once
  in the entire page tree. Duplicated page items are not allowed." `[docs]`
- Icons are stored as **names**, not components: "Since Fumadocs doesn't include an icon
  library, you have to convert the icon names to JSX elements in runtime" via the
  `loader({ icon })` handler, or the `lucideIconsPlugin`. `[docs]`

Loader plugins can rewrite all of this: `transformStorage({ storage })` for virtual-FS
surgery, and `transformPageTree` with per-node `file` / `folder` / `separator` visitors
that can replace `node.name` with arbitrary JSX. `[docs]` `/docs/headless/source-api/plugins`

### 4.4 Can generated routes coexist with hand-written ones? Yes — two independent layers.

**Next.js routing layer.** `app/docs/[[...slug]]/page.tsx` and `app/docs/hand-written/page.tsx`
coexist; Next.js gives the static segment precedence. Nothing in fumadocs objects.
`[inferred from Next.js segment precedence + the docs, which never forbid it]`

**Content layer.** `loader()` accepts a **record of named sources** and merges them into
one page tree. `[docs]` `/docs/headless/source-api/source`

```ts
export const source = loader(
  { docs: docs.toFumadocsSource(), openapi: blog.toFumadocsSource() },
  { baseUrl: '/docs' },
);

const page = source.getPage(['...']);
if (page.type === 'docs') { /* … */ } else { /* … */ }
```

You can also mix a fumadocs-mdx collection with hand-built `StaticSource` objects — a
`StaticSource` is just `{ files: [...] }` with virtual paths, so you can synthesise pages
in code. `[docs]` `[src]`

`fumadocs-mdx` additionally lets you **import MDX files as components or as pages**:
`import MyPage from '@/content/page.mdx'`, or place `page.mdx` in `app/` with
`export { default } from '@/components/layouts/page'`. `[docs]` `/docs/mdx/entry/import`

### 4.5 Can a page be partly generated and partly hand-written prose? Yes — several ways.

1. **Compose around the MDX body.** `page.data.body` is a component; you render it inside
   whatever you like. The canonical route does exactly this. `[docs]` `/docs/mdx/entry/server`
   ```tsx
   const MDX = page.data.body;
   return (
     <PageShell>
       <GeneratedPropTable {...page.data} />
       <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
       <HandWrittenFooter />
     </PageShell>
   );
   ```
2. **MDX can import and render your own components**, or receive them via the `components`
   prop / `providerImportSource`. The docs prefer the prop: "You can also import them in
   MDX Files, but it is not recommended." `[docs]` `/docs/headless/content-collections`
3. **Frontmatter → generated data.** `schema: pageSchema.extend({ … })` adds typed fields
   your page component reads. `[docs]` `/docs/mdx/collections`
4. **`valueToExport`** lifts a remark plugin's `vfile.data` output into real ESM exports on
   the compiled MDX module. `[docs]` `/docs/mdx/collections`
5. **`getText('processed')`** gives you the page's Markdown as a string, so you can compose
   Markdown-level aggregates across pages. `[docs]` `/docs/integrations/llms`

### 4.6 Producing per-item pages for a 40–60 item catalogue with per-item prose

The mechanism is **one MDX file per item**, plus a generated data source — not one template
with a slug loop. Concretely, all of these are current capabilities:

- **Content from a catalogue** — build a `StaticSource` (or a `DynamicSource`) in code from
  your component registry and hand it to `loader()`. `StaticSource` is a plain object
  literal in the docs; nothing requires files on disk. `[docs]`
- **Prose from MDX** — each item's `body` is MDX, rendered as a component; you can pass
  `components` (your demo registry) so MDX can mount a live `<ButtonDemo />`.
- **`generateParams()` covers all of them** from `getPages()`. `[src]`
- **Search indexes all of them** via `createFromSource(source, { buildIndex })`; `buildIndex`
  is the hook for per-item `tag`s, which is exactly how you scope search per section. `[docs]`
- **One `meta.json` per section** orders and labels the generated tree, or you generate
  the tree with a `transformPageTree` plugin. `[docs]`
- **Scalars for 40–60 items:** irrelevant at this size. fumadocs only recommends
  `async: true` "if you hit performance bottlenecks"; even then, "Turbopack doesn't support
  lazy bundling at the moment, async mode will only improve server performance." `[docs]` `/docs/mdx/async`
  `dynamic: true` exists but is on-demand compilation at *runtime* and is unsuitable for a
  static export, and it forbids `import`/`export` inside MDX. `[docs]`

**Not a fumadocs feature, but relevant:** there is an official **Typescript integration**
(`/docs/integrations/typescript`, "Generate docs from Typescript definitions") and
**AsyncAPI / OpenAPI / GraphQL** integrations, each with a documented **"Headless"** page
("the state and logic of X pages, without UI") and a `generateFiles()` that writes MDX
files. `[docs]` `llms.txt` index. So "generate MDX from a schema" is a supported shape —
with the note that OpenAPI/AsyncAPI/GraphQL *servers* are runtime components and their
generated files are the static part.

---

## 5. Live React component demos in a static-exported MDX page

### 5.1 The requirement is ordinary React, not anything fumadocs-specific

An MDX file compiles to a React component, so any `'use client'` component you pass in via
`components` (or import) is a normal client component in the RSC tree. The MDX body renders
during `next build` into static HTML; the client subtree hydrates. `[nextjs]`

Next.js is explicit that this is the supported path under export: `[nextjs]`
> "Client Components are prerendered to HTML during `next build`. Because Web APIs like
> `window`, `localStorage`, and `navigator` are not available on the server, you need to
> safely access these APIs only when running in the browser."

And the server-component guarantee: `[nextjs]`
> "The resulting component will be rendered into static HTML for the initial page load and a
> static payload for client navigation between routes."

**So: yes, MDX under `output: export` supports client components normally.** There is no
fumadocs-specific client boundary, no `dynamic import` requirement, and no special
`ssr: false` escape hatch.

### 5.2 The recommended wiring

```ts
// source.config.ts (or fumadocs-mdx/global)
export default defineConfig({
  mdxOptions: {
    providerImportSource: '@/components/mdx',   // [docs] /docs/mdx/entry/import
  },
});
```

```tsx
// components/mdx.tsx  — this file is the boundary
import { ButtonDemo } from '@/components/demos/button-demo';
export function getMDXComponents(components?: MDXComponents) {
  return { ButtonDemo, ...components };
}
export const useMDXComponents = getMDXComponents;
```

`ButtonDemo` is then `'use client'` and imports from your design-system package normally.
`[inferred]`, but the shape is exactly the documented `getMDXComponents` / `useMDXComponents`
contract. `[docs]` `/docs/mdx/entry/import`

### 5.3 Known constraints

- **Direct MDX imports of node_modules packages are discouraged**, and the reason given is
  bundler-shaped, not export-shaped: `[docs]` `/docs/headless/content-collections`
  > "It requires esbuild to bundle these components, while it should be done by the
  > framework's bundler (e.g. Vite or Turbopack). You can refactor the import path of
  > components without changing your MDX files."
  This is from the Content Collections page but the `getMDXComponents` pattern is shared.
- **Browser APIs** must be inside effects, per the Next.js quote above.
- **Interactions cannot be server-observed.** A demo whose rendered HTML must reflect request
  state is not available; the static HTML is frozen at build time. `[inferred]`
- **`dynamic: true` collections** forbid `import`/`export` in MDX, so demos passed by import
  are out; use `components`. `[docs]` `/docs/mdx/async`
- **Mermaid** is available as a remark plugin (`remark-mdx-mermaid`) and would be a
  client component. `[npm]`
- **Nothing in fumadocs ships a `ComponentDemo` block.** `[inferred from the full export
  list + llms.txt]` The framework offers MDX, the `components` prop, and the plugins; the
  demo block itself is the app's own work. fumadocs' comparable facilities are
  `fumadocs-ui/components/dynamic-codeblock` (live-highlighted code, `fumadocs-ui` only) and
  `/docs/integrations/story` (Storybook-style, with its own Headless page).

---

## 6. Markdown mirrors

### 6.1 fumadocs can generate Markdown per page — the core primitive is solid

`fumadocs-core/source/llms` → `llms(loader, { renderPage })`. `[src]` `packages/core/src/source/llms.ts`

```ts
interface LLMsWithPages<Page> extends LLMs {
  page:  (page: Page) => Promise<string>;
  full:  (lang?: string) => Promise<string>;
  index: (lang?: string) => Promise<string>;   // llms.txt
  indexNode: (node, lang?) => Promise<string>;
}
```

It is pure: `index()` walks the page tree, `full()` maps `renderPage` over `getPages()`.
For Fumadocs MDX it needs `renderPage` reading `getText('processed')`. `[docs]` `/docs/integrations/llms`

`getText('processed')` is fed by the `remarkLLMs` remark plugin, which **stringifies the
processed Markdown AST at compile time** and exports it as `_markdown`. Enabled via
`postprocess: { includeProcessedMarkdown: true }`. `[docs]` `/docs/headless/mdx/remark-llms` `[docs]` `/docs/mdx/collections`

This is a rich, first-class subsystem, and it is **entirely in `fumadocs-core` / `fumadocs-mdx`** —
`remark-llms`, `remark-llms.runtime`, `mdx-plugins/stringifier`, `content/md`,
`server` (`renderToMarkdown` / `asMarkdown` / `md`). No `fumadocs-ui`. `[npm]`

Notably, components can define their own Markdown form by calling `asMarkdown()` during
render, and `output: 'function'` mode renders JSX elements for real to produce richer
Markdown than the string mode. `[docs]`

CLI: `npx @fumadocs/cli feature llms` wires this up and creates the routes. `[docs]`

### 6.2 But there is **no built-in route handler and no `page.md` convention**

This is the key negative finding. Fumadocs ships **route *templates* you copy into your app**,
not routes it registers for you. There is no `fumadocs-core` middleware/plugin that mounts
`/docs/**.md`, and no `page.md` file convention. `[inferred from the full export list and
the `npx @fumadocs/cli feature llms` framing, which exists precisely to create the files]`

The documented Next.js `*.md` recipe is a route handler at
**`app/llms.mdx/docs/[[...slug]]/route.ts`** plus a **`rewrites()`** entry in
`next.config.ts`. `[docs]` `/docs/integrations/llms`

```ts
// next.config.ts, verbatim from the docs
const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/docs/:slug*.md', destination: '/llms.mdx/docs/:slug*/content.md' }];
  },
};
```

### 6.3 …and that recipe is **incompatible with `output: export`**

**`rewrites` is on Next.js's forbidden list.** `[nextjs]` This is a direct, documented
collision: the official fumadocs `*.md` recipe cannot run under the deployment model we
have. `[inferred]`

Three further problems with the recipe as written:

1. **`export const revalidate = false`** appears in the `llms.txt`, `llms-full.txt`, and
   `*.md` handlers `[docs]`, whereas Next.js's own guide prescribes
   `export const dynamic = 'force-static'` for handlers under export. `[nextjs]`
   Probably equivalent; **[UNVERIFIED]**.
2. **URL shape is unfortunate.** The public URL is `/llms.mdx/docs/<slug>/content.md`, and
   only becomes `/docs/<slug>.md` *via the rewrite*. With rewrites banned, the pretty URL
   disappears. `[inferred]`
3. **The `Accept`-header negotiation variant is middleware/proxy based** and therefore also
   banned. `[docs]` `[nextjs]`

   ```ts title="proxy.ts (Next.js)"   // from the fumadocs docs
   export default function proxy(request: NextRequest) { /* … */ }
   ```
   It uses `fumadocs-core/negotiation` (`isMarkdownPreferred`, `rewritePath`) — headless and
   usable, but the transport is `proxy.ts`, which `output: export` forbids.
   The docs even flag a Next.js wrinkle here: "Next.js discards `Vary` on App Router **page**
   responses, so the HTML side of the branch above can't carry the header from inside the
   app. Set it at your CDN." `[docs]`

Also note: `fumadocs-core` ships an `i18n/middleware` entry (a 67 KB bundled middleware
helper) and `/docs/headless/internationalization/middleware` is titled "Next.js proxy for
implementing i18n routing" — so **fumadocs' i18n routing is middleware-dependent too**, and
therefore unavailable under `output: export`. `[npm]` `[docs]`

### 6.4 Verdict on the old site's approach

The previous site did this "with a Cloudflare Worker prefix rewrite over a separately
generated artifact". The framework **can** generate the Markdown natively — `llms()` +
`remarkLLMs` + `getText('processed')` is exactly the right primitive, and it is headless.
What the framework **cannot** do natively is *serve* it at a pretty URL under
`output: export`, because its only documented serving mechanism is `rewrites()` or
`proxy.ts`, both forbidden. `[inferred from the above]`

An app-level route handler at a permitted path, with `generateStaticParams()` +
`dynamic = 'force-static'`, is the shape the framework's own components support; whether
that composes cleanly with a *pretty* `/docs/x.md` URL is the open question. **[UNVERIFIED]**

---

## 7. fumadocs' own MCP endpoints

### 7.1 What fumadocs ships

`fumadocs-core/mcp` exports exactly two functions. `[src]` `dist/mcp.js` (imports **only** `zod`)

```ts
export function registerSearchTool(mcp, server)  // registers tool "search"
export function registerSourceTools(mcp, source, llms)  // registers "list_pages" and "get_page"
```

Three tools, per the docs table. `[docs]` `/docs/headless/utils/mcp`

| Tool | Input | Result |
| --- | --- | --- |
| `list_pages` | none | the page index from `llms.index()` |
| `get_page` | `url` (pathname) | the Markdown from `llms.page(page)` |
| `search` | `query`, optional `locale` | JSON-encoded search results |

Install: `fumadocs-core @modelcontextprotocol/server zod`. `[docs]`
`@modelcontextprotocol/server` is an **optional peer** pinned to `2.x.x` in
`fumadocs-core@16.15.14`; `zod` is an optional peer `4.x.x`. `[npm]`

The `dist/mcp.js` is 1 460 bytes. There is no HTTP layer in it — the two functions call
`mcp.registerTool(...)` and nothing else. `[src]`

### 7.2 Confirmed: the transport cannot live in a static export

The fumadocs docs say this in so many words. `[docs]` `/docs/headless/utils/mcp`

> "These helpers **register tools only**. Connect the server to a transport to expose it to
> clients. The integration guide includes framework routes using the streamable HTTP
> transport, **which requires a server at runtime**."

And the generated route, `[docs]` `/docs/integrations/llms`:

```ts title="app/api/mcp/route.ts"
export async function GET(request)    { return handler.fetch(request); }
export async function POST(request)   { return handler.fetch(request); }
export async function DELETE(request) { return handler.fetch(request); }
```

Three reasons this cannot be a static asset: `[inferred]`
1. Under `output: export`, "Only the `GET` HTTP verb is supported" for route handlers. `[nextjs]`
   MCP streamable HTTP needs `POST` (and `DELETE` for session teardown).
2. Even a `GET` handler "that rel[ies] on Request" is unsupported. `[nextjs]`
3. MCP is a stateful streaming protocol. A build-time artifact cannot speak it.

**Verdict: the old site's conclusion is CONFIRMED at current versions.** fumadocs' MCP
endpoint requires a runtime server and cannot live in a static export. Putting docs MCP
tools in a separate package was the right call.

### 7.3 The nuance: the *tool logic* is headless and reusable

`registerSourceTools` / `registerSearchTool` take any `McpServer` and do not care about the
transport. So if we ever run a Worker, we can import these two functions from
`fumadocs-core/mcp` and reuse them against the same `source` and `docsLlms` objects the
static site already builds — no reimplementation of `list_pages` / `get_page` / `search`
needed. `[inferred from the source]`

Also new and adjacent: **WebMCP** (`npx @fumadocs/cli feature webmcp`) exposes
`search_docs` and `read_page` to the *browser's* AI agent, "on top of the LLM routes" —
so it inherits the same route constraints. Marked Experimental, Chrome 149+ behind a flag. `[docs]`

---

## 8. Versions and compatibility

`[npm]`, all read from `registry.npmjs.org` on 2026-09-26.

| Package | Latest | Notable peers |
| --- | --- | --- |
| `fumadocs-core` | **16.15.14** | `next: 16.x.x`, `react: ^19.2.0`, `react-dom: ^19.2.0`, `zod: 4.x.x`, plus optional `flexsearch`, `@orama/core: 1.x.x`, `algoliasearch: 5.x.x`, `@mixedbread/sdk: 0.x.x`, `@oramacloud/client: 2.x.x`, `react-router: 7.x.x \|\| 8.x.x`, `@tanstack/react-router: 1.x.x`, `@modelcontextprotocol/server: 2.x.x` |
| `fumadocs-mdx` | **15.4.5** | `fumadocs-core: ^16.15.3`, `next: ^15.3.0 \|\| ^16.0.0`, `react: ^19.2.0`, optional `vite: 7.x.x \|\| 8.x.x`, `satteri: ^0.10.5`, `rolldown: *` |
| `fumadocs-ui` | **16.15.14** | **`fumadocs-core: 16.15.14`** (exact), `next: 16.x.x`, `react: ^19.2.0`, `react-dom: ^19.2.0`, optional `takumi-js` |

**Conflicts with our target stack (Next 16, React 19):**

- ✅ **`fumadocs-core` + Next 16**: `next: 16.x.x`. Match. Core's own devDependency is
  `next: 16.3.5`; ours would be 16.3.6. No conflict.
- ✅ **`fumadocs-mdx` + Next 16**: `^15.3.0 || ^16.0.0`. Match. Its devDep is `next: ^16.3.5`.
- ✅ **React 19**: all three want `^19.2.0`. Match. Core's devDeps are `@types/react: ^19.3.0`.
- ✅ **`fumadocs-core` ↔ `fumadocs-mdx`**: `^16.15.3` vs `16.15.14`. Satisfied.
- ✅ **Every peer in `fumadocs-core` is `optional: true`**, so a pure Next+React install
  installs nothing extra. `[npm]`
- ⚠️ **If `fumadocs-ui` were ever adopted**, its `fumadocs-core` peer is an **exact** pin
  (`16.15.14`) — no caret. Any core bump requires a matching UI bump. Not a blocker under
  the current headless decision; a real constraint if that changes.
- ⚠️ **`@orama/core: 1.x.x`** is a `fumadocs-core` optional peer, but the default engine is
  now **ZBSearch** (`zbsearch` is a hard `dependency`, not a peer). The `@orama/*` peers are
  legacy/compat surface. `[npm]` `[src]`
- ℹ️ **`fumadocs-mdx` supports Next 15.3 too** — wider than core, which is `16.x.x` only.
- ℹ️ `fumadocs-ui`'s React peer requires `^19.2.0`; the Next 16 minimum React is satisfied.

**No peer-dependency conflict with Next 16 or React 19 in the headless configuration.**

Two operational notes from the docs: `[docs]`
- `fumadocs-mdx` is **ESM-only**; use `next.config.mjs`, or a `.ts` config with Next's
  native Node TypeScript resolver.
- `/docs/manual-installation/next` states the prerequisite as "**Next.js 16. Tailwind CSS 4**."

---

## Explicitly unverified

1. **Claim (b) — "Next 16 prefetch payloads for catch-all roots 404."** No reproduction, no
   originating report found. Contradicted in spirit by merged PR #89202 and the
   "output export fallback" stack. Undocumented in the static-exports guide. **Needs an
   empirical test.**
2. **Whether Next 16 accepts `export const revalidate = false` on a route handler under
   `output: export`**, given its guide prescribes `dynamic = 'force-static'`. fumadocs uses
   the former in three places. **Needs a build.**
3. **Whether a per-page `.md` route handler can serve a pretty `/docs/x.md` URL under
   `output: export`** without the banned `rewrites()`. **Needs a build.**
4. **Whether the Next 16 "output export fallback" is on by default in 16.3.6** and what
   status code it yields for an unmatched catch-all root. Undocumented.
5. **Cloudflare Workers Static Assets specifics** — asset-serving behaviour for
   `trailingSlash`, `.rsc`/`.txt` payload routes, and custom 404 handling. Out of scope for
   the sources I was pointed at; not investigated.
6. **Fumadocs' i18n under static export.** `fumadocs-core/i18n/middleware` and the
   "Next.js proxy" guide are middleware-based, so i18n routing appears unavailable under
   `output: export`. I did not find a documented static-export-safe i18n story. **Likely
   blocked, not confirmed.**
7. **Real-world index size for *our* content.** §3.3's numbers are from synthetic pages I
   authored to a realistic shape. The real figure depends on our actual page lengths.

## Corrections to the old repository's record

| Old claim | Status |
| --- | --- |
| Headless = `fumadocs-core` + `fumadocs-mdx`, no `fumadocs-ui` | **Still correct.** No reverse dependency at 16.15.14 / 15.4.5. |
| "Empty doc sections only build under static export because the section roots are optional catch-all routes" | **Wrong mechanism.** `generateParams()` emits one entry per *page*; a folder with no `index.mdx` never emits a file, under export or SSR. |
| "Next 16 prefetch payloads for catch-all roots 404" | **Unconfirmed, probably overtaken.** See §2.4. |
| fumadocs MCP cannot live in a static export | **Confirmed**, and the current docs state it explicitly. |
| Markdown mirrors needed a separate artifact + Worker rewrite | **Partly overtaken.** Markdown *generation* is now native and headless (`llms()`, `remarkLLMs`, `getText('processed')`). Pretty-URL *serving* still needs something outside the framework, because `rewrites()`/`proxy.ts` are banned under export. |
| Search was "fog" | **Now documented and measured.** Build-time static index works under export; 1–3.5 MiB raw / 80–230 KiB gz at 60 pages in default advanced mode. |

## Sources

**fumadocs docs** (all `https://fumadocs.dev/…`): `/llms.txt` (full URL index),
`/docs/headless`, `/docs/headless/source-api`, `/docs/headless/source-api/source`,
`/docs/headless/source-api/plugins`, `/docs/headless/page-conventions`,
`/docs/headless/components`, `/docs/headless/search`, `/docs/headless/search/orama`,
`/docs/headless/search/flexsearch`, `/docs/headless/content-collections`,
`/docs/headless/utils/mcp`, `/docs/headless/mdx/remark-llms`,
`/docs/headless/internationalization/middleware`,
`/docs/deploying/static`, `/docs/integrations/llms`, `/docs/search/orama`,
`/docs/mdx`, `/docs/mdx/next`, `/docs/mdx/collections`, `/docs/mdx/macro`, `/docs/mdx/mdx`,
`/docs/mdx/async`, `/docs/mdx/entry/server`, `/docs/mdx/entry/dynamic`,
`/docs/mdx/entry/import`, `/docs/manual-installation/next`.

**fumadocs source** (`https://raw.githubusercontent.com/fuma-nama/fumadocs/main/…`):
`packages/core/src/source/loader.ts`, `packages/core/src/source/llms.ts`,
`packages/core/src/search/server/endpoint.ts`,
`packages/core/src/search/zbsearch/create-server.ts`,
`packages/core/src/search/zbsearch/create-db.ts`,
`packages/core/src/search/server/build-doc.ts`,
`packages/core/src/search/client/orama-static.ts`.
Shipped artefacts via unpkg: `fumadocs-core@16.15.14/dist/mcp.js`,
`fumadocs-ui@16.15.14/dist/components/dialog/search.js`, and the
`fumadocs-core@16.15.14` file manifest.

**npm registry**: `/fumadocs-core/latest`, `/fumadocs-mdx/latest`, `/fumadocs-ui/latest`.

**Next.js docs** (version 16.3.6): `/docs/app/guides/static-exports`,
`/docs/app/api-reference/file-conventions/dynamic-routes`,
`/docs/app/api-reference/functions/generate-static-params`,
`/docs/app/api-reference/functions/not-found`,
`/docs/app/api-reference/file-conventions/metadata/sitemap`,
`/docs/app/guides/incremental-static-regeneration`. Also the `canary` source of
`docs/01-app/02-guides/static-exports.mdx`, to check for undocumented behaviour.

**Next.js repo**: PR #89202 (merged 2026-01-29), PRs #93013–#93022 and #92555
(April 2026 "output export fallback" stack), via `api.github.com` search and PR pages.

**Measurement**: local probe against `fumadocs-core@16.15.14`, calling
`createSearchAPI(mode, { indexes }).export()` for 60 synthetic pages in both
`advanced` and `simple` modes; raw `JSON.stringify` byte length and `zlib.gzipSync`
length. Reproducible script and scratch dir noted in §3.3.
