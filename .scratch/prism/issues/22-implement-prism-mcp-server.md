---
Type: task
Status: resolved
Labels: wayfinder:task
Blocked by: 20
---

## Question

Implement ADR-0004 in `@nanisoft/prism-mcp-server`: the pure `createPrismMcpServer(docs)` factory with the **eight read-only tools** (`list_items`, `get_item_doc`, `get_item_props`, `get_item_source`, `get_theme_doc`, `list_pages`, `get_page`, `search_docs`), `PrismDocsStore` as its parameter type (the interface's canonical home — move it here from wherever the placeholder keeps it), and the apps/site Worker wiring `createMcpHandler(factory)` at `/mcp`.

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand:

- **ADR-0004 in full** is the spec: unprefixed names; schemas per §2; markdown-in/out; case-insensitive lookups with did-you-mean misses; `list_items` header line carries `prismVersion` + counts + build date; pass-through routing lines; descriptions carry the import invariant + antd delegation rule; term-frequency search capped at 5; tools only (no resources/prompts in v1).
- **Data**: `data.json` from prism-llms bundled into the Worker at build (ticket 05: no runtime I/O; lookup maps built in the factory, not at isolate boot). `apps/site` imports the factory from here and the data from prism-llms — this package stays a leaf.
- **Transport options** (ticket 05/ADR-0004 §6): `allowedHostnames: ['prism.nanisoft.com']`, `corsOptions: false`, `responseMode: 'json'`; auth none in v1 with the Cloudflare Access escalation pre-written.
- **stdio shim**: `npx mcp-remote` documented as the offline lane — no second implementation.
- **Placeholder swap**: the current `tools: []` placeholder and its test change when this lands.

## Answer

Implemented and deployed 2026-09-20 — the eight-tool MCP surface is **live at https://prism.nanisoft.com/mcp**, verified over real protocol round-trips: `initialize` → `prism-mcp-server@0.1.0`; `tools/list` → exactly the eight unprefixed names; `list_items` → `Prism 0.1.0 — 71 components, 2 blocks, 2 pages (built 2026-09-20)`; non-MCP probes behave per the wired transport (GET 405, bad `accept` 406 JSON-RPC error, unknown Host 403).

- **Factory**: pure `createPrismMcpServer(docs, options?)` in `packages/mcp-server`, decomposed as lookup / search / render / tools / factory — lookup maps built at construction (no runtime I/O, no per-isolate-boot work); `PrismDocsStore` + `parsePrismDocsStore` stay the canonical contract in `store.ts`, validated at the factory door with precise errors.
- **Tools**: all eight per ADR §2 — schemas verbatim, markdown in/out as `{content, isError}`, case-insensitive lookups with Levenshtein-≤3 did-you-mean misses that never throw, pass-throughs routed to the antd MCP via the `Extends` line with the `_No additional props…_` seam, `search_docs` term-frequency capped at 5 (schema max 10), tools only (no resources/prompts); descriptions carry the import invariant + antd delegation rule. All test-enforced over a real MCP `Client` on `InMemoryTransport`; worker tests drive real protocol round-trips over the bundled corpus (ASSETS stubbed, nothing else mocked).
- **Worker**: `apps/site/worker/mcp.ts` replaced the 501 stub — exactly the one-file seam ticket 21 promised; `createMcpHandler(factory)` with `allowedHostnames: ['prism.nanisoft.com']`, `corsOptions: false`, `responseMode: 'json'`. Runtime `ExecutionContext` now threads `index → router → mcp` (review found the entry dropped `ctx` entirely — `NOOP_CONTEXT` was the only context in production; fixed).
- **Data**: `import docsData from '@nanisoft/prism-llms/data.json'` bundled at build (prism-mcp-server stays a leaf). The ADR's `list_items` build-date clause is satisfied via a controller ruling: a committed generator (`stamp-mcp-data.mjs`) reads the bundled corpus's build mtime and emits a gitignored generated module feeding `options.built` — honesty rule intact (no stamp → clause omitted, never fabricated). A `built` field on the prism-llms store remains the clean long-term home (candidate for the go-live/prism-llms pass).
- **stdio**: `npx mcp-remote` documented as the offline lane; no second implementation. **Auth**: none in v1; the Cloudflare Access escalation stays pre-written.
- **Deps added**: `@modelcontextprotocol/server@2.0.0` + `zod` (runtime), `@modelcontextprotocol/client@2.0.0` (dev, real-protocol tests), `agents@0.24.0` + `@nanisoft/prism-mcp-server` in apps/site.
- **Eligibility**: the `.mcp.json` prism entry now meets ticket 15's "real, working" bar — lands in ticket 23's go-live sweep with the handbook updates.
