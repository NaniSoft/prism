# AGENTS.md

Prism is NaniSoft's design system: an Ant Design–based, plasma-shaped pnpm +
Turborepo monorepo. The **map** — the canonical plan of record — lives at
`.scratch/prism/map.md`; its tickets are under `.scratch/prism/issues/`.

## The one rule

Apps always import from `@nanisoft/prism-ui`, **never from `antd` directly**.
(Plasma's invariant; will be enforced by re-export codegen, not lint, once the
export surface lands — see the prism-ui conventions ticket.) `@ant-design/icons`
is re-exported through prism-ui as well — there is deliberately no custom icons
package.

## Taxonomy: components → blocks → pages

An organization taxonomy *inside* `prism-ui`: **components** are the antd-backed
primitives, **blocks** are pre-composed components (a form section, a stat row),
**pages** are full-page compositions. Everything is npm-delivered — consuming
apps assemble, never copy, design-system code.

## Layout

| Path                  | Package                        | Role                                                        |
| --------------------- | ------------------------------ | ----------------------------------------------------------- |
| `packages/tokens`     | `@nanisoft/prism-tokens`       | Token source of truth; `createPrismTheme()`; brand packs    |
| `packages/ui`         | `@nanisoft/prism-ui`           | components → blocks → pages over antd v6; `PrismProvider`   |
| `packages/llms`       | `@nanisoft/prism-llms`         | Generated `llms.txt` + per-component MD (data-only)         |
| `packages/mcp-server` | `@nanisoft/prism-mcp-server`   | MCP tool logic (transport-free factory)                     |
| `apps/site`           | `@nanisoft/site`               | prism.nanisoft.com — Fumadocs headless, static export       |

## Commands

```sh
pnpm build   # turbo run build (packages emit dist/, site exports out/)
pnpm test    # turbo run test (Vitest; RTL in prism-ui)
pnpm check   # turbo run check — the prism-llms drift gate (7 corpus invariants; CI runs it)
pnpm lint    # oxlint . + stylelint
pnpm changeset  # declare a version bump before merging to main
```

The corpus convention: a prism-ui change that alters the docs corpus ships a
prism-llms changeset in the same PR, and `pnpm --filter @nanisoft/prism-llms
generate-content` regenerates stub MDX + `meta.json` into `apps/site/content`
(only marker-carrying generated stubs are ever rewritten — hand-authored docs
are never touched).

TS is strict and ESM-only with no bundler for packages (types + `import`
exports only); `publint` runs on publish.

## Conventions

- **Theming** — `createPrismTheme()` in `@nanisoft/prism-tokens` returns a
  structured `PrismTheme`: one brand pack (blue | green | lavender | rose |
  peach — the pastel spectrum, ADR-0005) in one mode (light | beam-dark). It
  maps Prism tokens onto antd **seed tokens +
  algorithms** plus a **closed 17-key map-token allowlist** (ADR-0002 + the
  ADR-0005 errata: the visual language's radius/motion, plus placeholder
  legibility, are not seed-derivable) — anything outside
  the allowlist is not a hand-set map token — and sets `cssVar.key`
  explicitly (`prism-<pack>-<mode>`, `hashed: false`) so dark mode swaps
  without a flash.
- **`PrismProvider`** wraps antd `ConfigProvider`; it is the theming entry point.
- **ProComponents cannot take antd v6 on stable** — dashboard blocks build on
  plain antd v6.
- **Docs** live in `apps/site` (Fumadocs headless, static export) as rendered
  demos + copyable source (`ComponentDemo`); that MDX is the single source
  `@nanisoft/prism-llms` generates `llms.txt` + per-component MD from — never
  hand-copy content between the two.
- **Figma** is one-way code → Figma Variables (repo-owned plugin fed by
  `prism-tokens` build output). No two-way sync, no hand-built UI kit.
  The full design↔code conventions: `docs/design-conventions.md`.

## MCP servers (`.mcp.json`)

`.mcp.json` is strict JSON and holds **only real, working servers** — no
comments, no placeholders; add a server when it exists. All three below are
wired (HTTP entries need **both** `type` and `url`, or Claude Code silently
skips them).

- **`antd`** — offline antd knowledge over stdio from `@ant-design/cli`
  (`npm i -g @ant-design/cli`): `antd_list`, `antd_info`, `antd_doc`,
  `antd_demo`, `antd_token`, `antd_semantic`, `antd_changelog`. The
  `ant-design` skill's `references/antd-cli.md` is its manual.
- **`figma`** (ticket 14) — remote Dev Mode MCP:
  `{ "type": "http", "url": "https://mcp.figma.com/mcp" }`.
- **`prism`** (ADR-0004) — the live Prism MCP at
  `https://prism.nanisoft.com/mcp`: eight read-only tools over the prism-llms
  corpus, served by the same Worker as the site. Stdio lane if a client
  can't do HTTP: `npx mcp-remote https://prism.nanisoft.com/mcp`.

Pairing rule: **Prism MCP for Prism behaviour, antd MCP for inherited antd
props — and always import from `@nanisoft/prism-ui`.**

## Working here

- Read `.scratch/prism/map.md` first; claim a ticket (set `Status: claimed`)
  before working it — see `docs/agents/issue-tracker.md`.
- Domain language and standing decisions: `CONTEXT.md`, `PRODUCT.md`,
  `docs/adr/`, and the map's Notes section.
- Agent-relevant skills installed in this environment: `ant-design`, `antd`,
  `cloudflare`, `wrangler`, `workers-best-practices`; `interfaces:*` and
  `impeccable` for UI direction.
- Project-scope MCP servers in `.mcp.json` need one-time per-user approval
  (`/mcp` in a session, or `claude mcp reset-project-choices` to re-prompt).
