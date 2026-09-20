# CLAUDE.md

## Project

Prism — an Ant Design–based design system (`@nanisoft/prism-*` packages), with its site at prism.nanisoft.com (Fumadocs headless, static export on Cloudflare Workers). Apps always import from `@nanisoft/prism-ui`, never from antd directly. See the wayfinder map's Notes for all standing decisions.

## Wayfinding

Active effort: **Prism** — map at `.scratch/prism/map.md`. Work open, unblocked, unclaimed tickets from the frontier; set `Status: claimed` on a ticket before starting it.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to default label strings of the same names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Environment skills

Consult before writing code: `ant-design`, `antd` (component APIs, theming, migration), `cloudflare`, `wrangler`, `workers-best-practices` (the site Worker); `interfaces:*` / `impeccable` for UI direction.

## Conventions

- **The one rule**: apps always import from `@nanisoft/prism-ui`, never from `antd` directly (`@ant-design/icons` arrives via the prism-ui re-export).
- **Taxonomy**: components → blocks → pages is an organization taxonomy *inside* `prism-ui` — blocks are pre-composed components, pages are full-page compositions; all npm-delivered, never copied into apps.
- **Theming**: `createPrismTheme()` (prism-tokens) returns one brand pack (blue | green) in one mode (light | beam-dark), mapped to antd seed tokens + algorithms plus a **closed 8-key map-token allowlist** where antd's derivation mathematically can't express the language (ADR-0002).
- **Figma**: designs map to prism-ui components; tokens flow one-way code → Figma Variables, never hand-picked — `docs/design-conventions.md`.
- Full handbook (commands, MCP servers, gotchas): `AGENTS.md`. Both files must agree.

## MCP servers

Repo `.mcp.json` carries only real, working servers — all three wired: `antd` (offline antd knowledge via `@ant-design/cli`), `figma` (remote Dev Mode MCP), and `prism` (the live eight-tool MCP at `https://prism.nanisoft.com/mcp`; stdio lane via `npx mcp-remote`). HTTP entries need both `type` and `url` or Claude Code skips them. Pairing rule: Prism MCP for Prism behaviour, antd MCP for inherited antd props.
