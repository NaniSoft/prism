---
Type: task
Status: open
Labels: wayfinder:task, ready-for-human
Blocked by: 04, 07
---

## Question

Nothing to decide — execute the Figma setup guide (ticket 04) with the accounts from ticket 07:

- Create the Prism Figma library from antd's official kit; connect synced Figma Variables fed by prism-tokens.
- Enable + verify Dev Mode MCP inside an agent session.
- Write the one-page convention doc ("map designs to prism-ui; tokens come from Variables").

## Inherited requirements

Deferred here by resolved tickets — execute with these in hand (2026-09-14 audit):

- **Verify the chosen plugin imports DTCG `$type: 'shadow'` composites** (from [Token architecture](09-token-architecture-spec.md)) before the floating-shadow token exports as a real composite rather than a `$description`/`$extensions` string.
- **Resolve ticket 04's flagged open items** (see its Answer): kit choice, `boxShadow` STRING syntax, Code Connect needing Organization, Enterprise Variables API re-check.
- **Finalize the `.mcp.json` Figma entry** (from [Wire agent tooling](15-wire-agent-tooling.md)) — ready to paste, *both* fields required or Claude Code silently skips it: `"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }`.

## Answer

<!-- what was done, URLs, who holds seats -->
