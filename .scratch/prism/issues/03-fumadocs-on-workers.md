---
Type: research
Status: resolved
Labels: wayfinder:research, ready-for-agent
---

## Question

Can Fumadocs run **headless** on a statically exported Next.js app served by Cloudflare Workers Static Assets — and how, exactly?

Cover:
- `fumadocs-mdx` `defineDocs` / `defineCollections`: current API, docs + blog as collections, frontmatter schemas, MDX config.
- Headless consumption of `fumadocs-core`: Source API, page trees, Sidebar/TOC/Breadcrumb headless components — what we build ourselves on Prism components vs what core gives free.
- Static rendering/export: does fumadocs support `output: 'export'`? Known gotchas (search index generation, dynamic params, `generateStaticParams`).
- Search headless: built-in client search options (flexsearch/orama), index generation in static mode, custom search UI on Prism components.
- Fumadocs' built-in MCP tools: endpoint shape; can it coexist with static export, or must it live on a separate Worker (likely ours: prism-mcp-server)? How it exposes page discovery/read/search.
- Blog-as-collection: post layout, tags, RSS feasibility in static mode.
- Workers Static Assets deploy specifics: wrangler config (assets directory, not_found_handling), headers/caching for `_next` assets.

Output: go/no-go confirmation plus a concrete app skeleton recommendation for `apps/site`.

## Answer

**GO.** Fumadocs officially supports `output: 'export'` — the repo ships a maintained `examples/next-static` app on Next 16 — and every headless primitive we need lives in `fumadocs-core`, not `fumadocs-ui`. Versions as of 2026-09-14: `fumadocs-core`/`fumadocs-ui` 16.15.10, `fumadocs-mdx` 15.4.0, `next` 16.3.5, `wrangler` 4.131.2 (core peers: React ^19.2.0, Zod 4, `next` 16.x).

- `defineDocs`/`defineCollections` from **`fumadocs-mdx/macro`** (Macro API is now default: no `source.config.ts`, no codegen). `dir` sits on `defineDocs`; blog is a second `defineCollections({ type: 'doc', dir: 'content/blog' })` + its own `loader()`. Macro constraints: top-level `const` only, literal `dir`, and **no re-exporting** `fumadocs-mdx/macro`.
- Headless: `NextProvider` (`fumadocs-core/framework/next`, accepts `Link`/`Image` overrides) + `loader()` Source API, `PageTree.Root` types, `findNeighbour`/`findParent`, `useBreadcrumb` (hook), `fumadocs-core/toc` (`AnchorProvider`/`ScrollProvider`/`TOCItem` with `data-active`). We build only `DocsShell`/`BlogLayout`, MDX mapping, and the search dialog on antd.
- Static search: `export const revalidate = false; export const { staticGET: GET } = createFromSource(source)` prerenders the index; client is `staticClient()` from `fumadocs-core/search/client/orama-static` (engine renamed to **ZBSearch**, path kept for compat).
- **MCP cannot live in the export** — Fumadocs' own CLI gates it: `project.static ? 'MCP requires a server at runtime' : …`. It goes on `@nanisoft/prism-mcp-server` (Workers), which mirrors the already-static `llms.txt` / `llms-full.txt` / `content.md` artefacts.
- Workers: `assets.directory: './out'`, `not_found_handling: '404-page'`, default `html_handling: 'auto-trailing-slash'` already aligns with Next's default `trailingSlash: false`; `public/_headers` → `out/_headers` gives `_next/static/*` immutable caching. Next's missing middleware/rewrites are recovered by `run_worker_first: ["/docs/:slug*.md"]`.

Full findings + `apps/site` skeleton: [.scratch/prism/research/03-fumadocs-on-workers.md](../research/03-fumadocs-on-workers.md)
