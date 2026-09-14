---
Type: task
Status: resolved
Labels: wayfinder:task, ready-for-agent
Blocked by: 06
---

## Question

Nothing to decide — make the repo agent-friendly:

- `.mcp.json`: antd MCP, Figma Dev Mode MCP (finalized after ticket 14), placeholder entry for prism-mcp-server.
- `AGENTS.md` + `CLAUDE.md`: the import-from-prism-ui rule, the blocks/pages taxonomy, map pointer, skill pointers (`ant-design`, `antd`, `cloudflare`, `wrangler`).
- README section on agent workflows.

## Answer

Done. Four files touched (`.mcp.json` new, `AGENTS.md`/`CLAUDE.md`/`README.md` extended). No git commands, no installs.

**Deliberate deviation from the ticket text (orchestrator-adjusted plan):** the ticket asked for placeholder `.mcp.json` entries for Figma Dev Mode and prism-mcp-server, each "commented". Verified against the official Claude Code docs: `.mcp.json` is **strict JSON** — no comments, no JSONC, and no documented comment/pending/disabled fields — and unknown keys are undocumented territory. So `.mcp.json` carries **only real, working servers**, and the pending entries live as ready-to-paste snippets here plus a mention in `AGENTS.md`/`README.md`. Net effect is the same (the entries are clearly marked as pending 14/13) without shipping a config Claude Code would reject, warn on, or try to launch and fail.

**1. `.mcp.json` (new)** — one entry, the antd MCP (it was *not* already present; the file did not exist):

```json
{
  "mcpServers": {
    "antd": {
      "type": "stdio",
      "command": "antd",
      "args": ["mcp"]
    }
  }
}
```

That is `@ant-design/cli`'s MCP mode (tools `antd_list`, `antd_info`, `antd_doc`, `antd_demo`, `antd_token`, `antd_semantic`, `antd_changelog` + 2 prompts), which is the real antd MCP surface — the `ant-design`/`antd` *skills* are the docs, not a server. Chosen over an `npx -y @ant-design/cli mcp` invocation because the CLI is already installed globally here and the global bin avoids npx's startup cost and Windows `.cmd`-shim spawn issues; the prerequisite (`npm i -g @ant-design/cli`) is documented in `AGENTS.md`. No `--version` pin: the CLI's default (latest 6.x) matches the map's `antd ^6.6.4` caret pin without a hardcoded number drifting.

Validation: `node -e "JSON.parse(require('fs').readFileSync('.mcp.json'))"` → parses clean. Beyond parsing, verified it actually works: `claude mcp list` recognizes the entry (`antd: antd mcp - ⏸ Pending approval` — the expected one-time project-scope approval gate, not an error) and a raw stdio probe (`initialize` request piped to `antd mcp`) returned a correct handshake: `{"result":{"serverInfo":{"name":"antd","version":"6.6.0"},"capabilities":{"tools":{},"prompts":{}}}}`. Approval itself is left to the user (`/mcp` in a session) — I did not touch user-level approval state.

**2. `AGENTS.md`** — kept its existing structure (intro/map pointer, the one rule, layout table, commands, working here) and added: `@ant-design/icons` re-export note in the one rule; a **Taxonomy** section (components → blocks → pages inside `prism-ui`, npm-delivered, assemble-never-copy); a **Conventions** section (createPrismTheme → brand pack × mode, seed tokens + algorithms never map tokens, `cssVar.key` explicit, PrismProvider as theming entry point, ProComponents can't take antd v6 stable, docs MDX is the single source prism-llms generates from, Figma one-way code → Variables); an **MCP servers** section (what's wired, the strict-JSON/no-placeholders rule, the `type` + `url` requirement for HTTP entries, the pairing rule "Prism MCP for Prism behaviour, antd MCP for inherited antd props — and always import from `@nanisoft/prism-ui`"); skills pointers (`ant-design`, `antd`, `cloudflare`, `wrangler`, `workers-best-practices`, plus `interfaces:*`/`impeccable` for UI direction); and the project-scope approval note.

**3. `CLAUDE.md`** — existing Project / Wayfinding / Agent-skills sections untouched; appended an "Environment skills" subsection under Agent skills, a short **Conventions** section (the one rule, taxonomy, theming, pointer to `AGENTS.md` as the full handbook), and a two-line **MCP servers** section. It stays the shorter pointer-style file; the two documents agree.

**4. `README.md`** — added an **Agent workflows** section: wayfinder map, issue tracker + claiming, agent entry docs (`AGENTS.md`/`CLAUDE.md`, `CONTEXT.md`/`PRODUCT.md`/`docs/adr/`), the `.mcp.json` ecosystem, and the generated prism-llms surface.

**Deferred to other tickets — these two entries stay OUT of `.mcp.json` until real:**

- **Figma Dev Mode MCP — ticket 14.** Ready to paste into `mcpServers` when it lands:
  `"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }` — Figma's documented remote endpoint (research `04-figma-greenfield-setup.md` §4.1), **both** `type` and `url` required or Claude Code silently skips the entry. Ticket 14 finalizes/verifies it (OAuth on first connect).
- **prism-mcp-server — ticket 13.** Tool surface is now proposed in `docs/adr/0004-mcp-tool-surface.md` (eight read-only tools); transport per ticket 05 is Streamable HTTP at `https://prism.nanisoft.com/mcp` with an `npx mcp-remote` stdio bridge. Ready to paste once the Worker serves it: `"prism-mcp-server": { "type": "http", "url": "https://prism.nanisoft.com/mcp" }`. The package has **no `bin`** today, so a stdio entry pointing at it would be broken — another reason not to ship it early.

One accuracy note: ticket 13's ADR landed while this ticket was in flight, so `AGENTS.md` cites it as *proposed* rather than calling the tool surface undecided.
