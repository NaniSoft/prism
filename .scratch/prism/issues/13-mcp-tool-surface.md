---
Type: grilling
Status: open
Labels: wayfinder:grilling, ready-for-human
Blocked by: 01, 05
---

## Question

What tools does `@nanisoft/prism-mcp-server` expose, and for whom?

- Tool set: search components/blocks/pages, get component API/usage, get theme tokens, get block/page source, search docs — which earn their place in v1, which wait.
- Primary client: Claude Code sessions building NaniSoft apps — optimize for that loop; remote access secondary.
- Schemas + naming; the relationship to (and deduplication with) the antd MCP and fumadocs' built-in MCP tools.
- Auth stance, using ticket 05's recommendation (org-only?).
- Docs data source: prism-llms output as the single backing store.

Output: tool spec (ADR) the MCP Worker is implemented against.
