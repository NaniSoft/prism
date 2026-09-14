---
Type: grilling
Status: open
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
