# Prism

One design language, many expressions.

Prism is NaniSoft's design system: Ant Design v6 under a Prism-owned theme and
component surface (`@nanisoft/prism-*`), with docs and an agent surface at
[prism.nanisoft.com](https://prism.nanisoft.com).

> Bootstrap skeleton — packages are placeholders while the architecture specs
> land. See `.scratch/prism/map.md` for the plan of record.

## Agent workflows

Prism is built agent-first (`PRODUCT.md`), so the repo is navigable without a human in the loop:

- **Plan of record** — the wayfinder map at `.scratch/prism/map.md` (Notes = standing decisions, Decisions so far = closed tickets). Work open, unblocked, unclaimed tickets from `.scratch/prism/issues/`; claim one by setting `Status: claimed`. Tracker conventions: `docs/agents/issue-tracker.md`.
- **Agent entry points** — `AGENTS.md` is the handbook (the one import rule, the components → blocks → pages taxonomy, commands, MCP servers); `CLAUDE.md` is the short pointer-style version. Domain language: `CONTEXT.md`, `PRODUCT.md`, `docs/adr/`.
- **MCP ecosystem** — repo `.mcp.json` wires the antd MCP (`@ant-design/cli`, offline antd knowledge) today. The Figma Dev Mode MCP (ticket 14) and `@nanisoft/prism-mcp-server` (ticket 13) join when they exist; the site Worker will serve the Prism MCP at `/mcp`.
- **Generated agent surface** — `@nanisoft/prism-llms` produces `llms.txt` + per-component MD, served from prism.nanisoft.com as the fallback when MCP is unavailable.
