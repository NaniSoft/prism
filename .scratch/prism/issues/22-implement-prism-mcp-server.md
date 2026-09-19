---
Type: task
Status: claimed
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
