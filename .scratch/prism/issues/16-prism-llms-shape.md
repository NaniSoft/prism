---
Type: grilling
Status: open
Labels: wayfinder:grilling, ready-for-human
Blocked by: 12, 13
---

## Question

What does `@nanisoft/prism-llms` contain, and how is it generated so it can't drift?

- Contents: `llms.txt`, per-component MD, blocks/pages catalog MD, theme/token MD.
- Generation source: prism-ui types/source vs docs MDX — which is authoritative for what.
- Build integration: turbo task graph; when regenerated; is there a CI gate on drift?
- Consumption: served at the site root, backing store for the MCP server, `npx`-fetchable?

Output: a written spec the package is built against.

## Inherited requirements

Deferred here by resolved tickets — the spec must satisfy these (2026-09-14 audit):

- **Emit `examples[].code` and the `antdBase` flag** (from [MCP tool surface](13-mcp-tool-surface.md) / ADR-0004) — only the generator can know these; `get_item_source` and the antd-MCP delegation routing both depend on them.
- **Project into `PrismDocsStore`** — the interface fixed in ADR-0004 §5 is the binding contract; this ticket picks file layout/index shape/drift gate freely.
- **Per-item MD format gets `## Blocks` / `## Pages` sections** plus the pass-through pointer ("N antd components re-exported unchanged — see antd's `llms.txt`, but import from `@nanisoft/prism-ui`") (from [prism-ui API conventions](10-prism-ui-api-conventions.md)).
- Generate from Fumadocs MDX, not hand-maintained copies — plasma's duplicated-guidelines drift bug is the one to avoid (from [Plasma conventions](01-plasma-conventions.md)).
