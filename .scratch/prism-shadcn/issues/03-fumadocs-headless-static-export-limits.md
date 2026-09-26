---
Labels: wayfinder:research
Type: research
Status: resolved
---

# What can fumadocs headless do on a static export, and where does it stop

## Question

The old site is `fumadocs-core` and `fumadocs-mdx` with **`fumadocs-ui` not
used at all**: the documentation shell is a Prism-owned page, not fumadocs'
own. That decision is inherited, but it has not been tested against the current
versions, and it is the single largest architectural constraint on the new
site.

Establish the facts against the current releases, `fumadocs-core` 16.x and
`fumadocs-mdx` 15.x, and `next` 16.x:

1. **What headless means today.** Which parts of fumadocs are genuinely
   headless and which are coupled to `fumadocs-ui`. Enumerate the imports the
   old site uses from each package, and say for each whether it drags in
   `fumadocs-ui`.
2. **Static export.** What `output: export` supports and what it does not.
   Specifically: the search index, any route that needs a request, image
   optimization, metadata and sitemap generation, incremental regeneration, and
   middleware. The old map records that empty doc sections only build under
   static export because the section roots are optional catch-all routes, and
   that Next 16 prefetch payloads for catch-all roots 404. Establish whether
   both are still true.
3. **Search.** Whether the search index can be generated at build time and
   shipped as a static asset, what it costs in bundle size, and whether it works
   under static export. This is listed as fog on the map and may graduate.
4. **The MDX pipeline.** `defineDocs` and `defineCollections`, the loader model,
   how a collection is grouped into a sidebar, and how generated routes
   interact with hand-written ones. The docs content plan depends on knowing
   whether per-item pages can be generated from a catalogue and still carry
   hand-written prose.
5. **Embedding live component demos.** How a real, running React component is
   rendered inside a static-exported MDX page, what the client boundary costs,
   and whether a demo that imports from `@nanisoft/prism-ui` works in this
   setup. The old site solved this with a `ComponentDemo` block and a generated
   demos registry; establish what the framework offers instead.
6. **Markdown mirrors.** Whether fumadocs can serve or generate a `.md` version
   of each page, since the agent surface needs per-item Markdown. The old site
   did this with a Worker prefix rewrite over a `prism-llms` artifact, so
   establish whether the framework can do it natively.
7. **The MCP endpoints fumadocs ships.** The old map records that fumadocs' own
   MCP endpoint cannot live in a static export, which is why the docs MCP tools
   went on `prism-mcp-server` instead. Confirm whether that is still true at
   these versions.

Report findings against the versions named above, and flag anything the old
repository got wrong or has since been overtaken on.

## Answer

Full findings, with a provenance tag on every claim, are in
[research/03-fumadocs-headless-static-export-limits.md](../research/03-fumadocs-headless-static-export-limits.md).
Versions tested: `fumadocs-core@16.15.14`, `fumadocs-mdx@15.4.5`,
`fumadocs-ui@16.15.14`, Next.js `16.3.6`. A reproducible search-payload probe
sits beside it as `research/search-index-size-probe.mjs`.

### Both inherited decisions survive

**Headless is valid.** `fumadocs-core@16.15.14` has no `fumadocs-ui` in
`dependencies`, `peerDependencies` or `devDependencies`, and every peer it
declares is `optional: true`. The arrow points one way only: `fumadocs-ui`
declares `fumadocs-core` as an exact pin, and core cannot import UI without
declaring it. Roughly 70 core export paths and 24 mdx export paths were
enumerated; nothing reaches for UI. The headless path asks for one thing from
core rather than from UI: `NextProvider` from
`fumadocs-core/framework/next`.

**fumadocs' MCP cannot live in a static export, confirmed.** The docs now say it
outright: the helpers "register tools only. Connect the server to a transport to
expose it to clients, which requires a server at runtime." The generated route
needs `GET`, `POST` and `DELETE`; static export allows `GET` only. Putting the
docs tools in our own package was the right call.

### One inherited claim is refuted as stated

"Empty docs sections only build under static export because the section roots are
optional catch-all routes" is garbled. The canonical fumadocs route *is* an
optional catch-all, but optionality has nothing to do with emission.
`source.generateParams()` returns one entry per page and nothing else, so a
folder with no `index.mdx` emits no file, under export or under SSR. If the old
site made empty sections work, it did so by other means, and whatever those were
are still required.

The second claim, "Next 16 prefetch payloads for catch-all roots 404", could not
be reproduced and is contradicted in spirit by merged Next PR #89202 and the
undocumented "output export fallback" stack. Treat it as refuted pending an
empirical test, not as a working fact.

### Three findings that were not in the brief

**The official fumadocs `*.md` recipe is incompatible with `output: export`.**
It serves Markdown through `rewrites()`, which Next 16 forbids. Generation,
though, is native and headless: `llms()` from `fumadocs-core/source/llms`, fed by
the `remarkLLMs` plugin and `getText('processed')`, with `postprocess:
{ includeProcessedMarkdown: true }`. Only pretty-URL *serving* is the gap. That
moves work out of the corpus package and into the framework, and it is now an
input to the llms corpus contract.

**Middleware is now `proxy.ts`, and it is forbidden.** That also appears to block
fumadocs' i18n routing, since `fumadocs-core/i18n/middleware` and the "Next.js
proxy for implementing i18n routing" guide are both middleware-based. Flagged,
not confirmed.

**Search payload, measured rather than guessed.** For 60 synthetic pages in
default `advanced` mode: 1.0 to 3.5 MiB raw, 80 to 227 KiB gzipped. It scales
with page length, not page count, because advanced mode explodes each page into
one document per heading and per content block, each repeating `url`,
`breadcrumbs` and `tags`. `simple` mode is 54 KiB raw and 5 KiB gzipped and
forfeits heading-level results. It is a one-time lazy download on first search
interaction, not on page load. Search is therefore decidable with a number
attached, which is why the fog entry is retired.

Also settled: generated and hand-written routes coexist on both the Next.js
routing layer and the content layer, because `loader()` accepts a record of named
sources and a `StaticSource` is a plain object literal, so pages can be
synthesised in code. A page can be partly generated and partly prose by composing
around `page.data.body`. And nothing in fumadocs ships a demo block: the
framework offers MDX, the `components` prop, and remark plugins, and the demo
block remains the app's own work.

### Unverified, and someone has to build to find out

1. Whether Next 16 accepts `export const revalidate = false` on a route handler
   under `output: export`, given its own guide prescribes
   `dynamic = 'force-static'`. fumadocs uses the former in three places.
2. Whether a per-page `.md` handler can serve a pretty `/docs/x.md` URL under
   export without the banned rewrites.
3. Whether the Next 16 "output export fallback" is on by default in 16.3.6, and
   what status an unmatched catch-all root yields.
4. Cloudflare Workers Static Assets specifics for `trailingSlash`, payload routes
   and custom 404 handling. Not investigated.
5. Real index size for our content rather than synthetic pages.
