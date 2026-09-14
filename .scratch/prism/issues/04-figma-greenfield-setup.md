---
Type: research
Status: resolved
Labels: wayfinder:research, ready-for-agent
---

## Answer

Guide written to `.scratch/prism/research/04-figma-greenfield-setup.md`. Gist:

- **Plan/seat:** Figma **Professional** ($16 Full / $12 Dev / $3 Collab) — paid because libraries and variable modes are paid-only. One **Full seat** owns `NaniSoft Design System`; **Dev seats** for engineers; Collab/View are read-only and MCP-limited to 6 calls/month.
- **No official antd Figma kit exists.** `ant.design/docs/resources` labels every Figma entry "Third Party"; maintainer `arvinxx` in discussion #40405: "We won't support figma for now, and maybe never." Base = free "Ant Design Open Source" file (831698976089873405, stale/v4-era) as a **disposable scaffold**, restyled by binding everything to `prism.primitive` + `prism.semantic` Variables (modes Light default / Dark; Professional = 10 modes max).
- **Recommended sync: a small repo-owned Figma plugin fed by `@nanisoft/prism-tokens` build output** (`dist/figma/prism.tokens.json`, kept DTCG-shaped). The Variables REST API is the better design but `POST /v1/files/:key/variables` is **Enterprise-only**; Tokens Studio's git provider reintroduces the two-way coupling the map forbids. Start with off-the-shelf "Variables Import", then replace.
- **Dev Mode MCP:** remote `https://mcp.figma.com/mcp` is "available on all seats and plans" (no desktop app needed); the desktop server at `http://127.0.0.1:3845/mcp` needs the Figma desktop app **and** a Dev or Full seat on a paid plan. Dev seat on Professional = **200 read-tool calls/day, 15/min** (Starter/Full = 200/day 10/min; View/Collab on paid = 6/month). Wire up via `claude plugin install figma@claude-plugins-official` or `claude mcp add --transport http figma https://mcp.figma.com/mcp`; committed `.mcp.json` needs `type: "http"` **and** `url` — a `url` with no `type` is silently skipped. `get_variable_defs` is the Prism-critical tool.
- Convention doc outline included (three laws + mechanics) for ticket 14; open items flagged: kit choice, `boxShadow` STRING syntax, Code Connect needing Organization, Enterprise API re-check.

## Question

What is the complete, current, step-by-step Figma setup for a greenfield team adopting Prism (one-way code→Figma tokens + antd kit + Dev Mode MCP)?

Cover:
- Team/workspace creation on greenfield: plan realities (what's free vs needs a paid seat — especially for Dev Mode MCP).
- antd's official Figma UI kit: where it lives, licensing, how to import as a team library, restyling via Variables.
- One-way token sync: the best current mechanism to push `@nanisoft/prism-tokens` values into Figma Variables — Tokens Studio sync vs Figma Variables REST API vs a plugin; how dark/other modes map.
- Figma Dev Mode MCP server: current requirements (desktop app? seat type?), enabling it, wiring into Claude Code / `.mcp.json`, what agents can actually read.
- The convention doc content: "designs map to prism-ui components; tokens come from Figma Variables; never hand-pick colors".

Output: the setup guide that ticket 14 executes.
