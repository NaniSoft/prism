# @nanisoft/prism-mcp-server

Prism's read-only MCP tool surface. Eight retrieval tools answer over the
bundled `PrismDocsStore` corpus from the same Cloudflare Worker that serves the
site, at `https://prism.nanisoft.com/mcp`.

The package is **transport-free**: `createPrismMcpServer(store, options)` returns
an `McpServer`, and the Worker connects it to `createMcpHandler` from the Agents
SDK's MCP server entry. There is one implementation and no stdio binary at
launch; a stdio-only client bridges with `npx mcp-remote
https://prism.nanisoft.com/mcp`.

## Commands

```sh
pnpm --filter @nanisoft/prism-mcp-server build   # stamp the corpus, then tsc into dist/
pnpm --filter @nanisoft/prism-mcp-server test    # the Vitest floor (in-memory round-trips)
```

`pretest` compiles the package first. The suite reaches the corpus through
`@nanisoft/prism-llms`'s emitted `data.json`.

## The eight tools

Every tool is self-contained, idempotent, stateless and returns Markdown. A
lookup miss is an `isError` result with did-you-mean suggestions and a browse
pointer, never a throw. Every description carries the import rule and the
surface rule.

| Tool | Arguments | Purpose |
| --- | --- | --- |
| `list_items` | `{ kind?, category? }` | The kind-grouped catalogue index; `category` is Component-only. |
| `get_item_doc` | `{ name, kind? }` | The assembled per-item Markdown plus its footer. |
| `get_item_props` | `{ name, kind? }` | The `## Props` section, or `## Composition` for a Block or Page. |
| `get_item_source` | `{ name, kind? }` | The public import line plus the verbatim demo. |
| `get_theme_doc` | `{ pack?, mode?, group? }` | A pack's resolved values, or one bound scale. |
| `list_pages` | `{}` | The guides, Foundations and Content page index. |
| `get_page` | `{ url }` | One non-item page as Markdown; a catalogue URL points at `get_item_doc`. |
| `search_docs` | `{ query, kind?, limit? }` | Substring search over names, descriptions and page bodies. |

`kind` is the closed union `component | block | page`; `get_theme_doc`'s `group`
is `semantic | motion | typography | spacing | shadow | breakpoint | container`.

## The store

`createPrismMcpServer` runs `parsePrismDocsStore` from `@nanisoft/prism-llms` at
its door, so a raw `data.json` is validated once and every transport inherits the
same rejection. The Worker bundles `@nanisoft/prism-llms/data.json` as an ESM
module; there is no `fs`, `fetch`, KV, cache or runtime lookup at isolate scope.

## The build stamp

`scripts/stamp-built.mjs` writes the gitignored `src/generated/built.ts` before
the build. The stamp is derived from the corpus source commit date plus the
corpus version, so the same commit rebuilds to the same value. When git or the
corpus is unavailable it is `undefined`, and `list_items` omits the
`(built ...)` clause rather than fabricating a date. The stamp lives in this lane,
never in the corpus `dist`, so corpus build-twice determinism is untouched.

## Auth

Public read-only in version one: the corpus is public and the tools are pure
reads over an immutable blob. The Cloudflare Access escalation is pre-written in
`apps/site/worker/access.ts` and inert until enabled. It flips when a tool gains
anything non-public: org-internal examples, write-back, telemetry or a per-user
quota.
