# AGENTS.md

Prism is NaniSoft's design system: an Ant Design–based, plasma-shaped pnpm +
Turborepo monorepo. The **map** — the canonical plan of record — lives at
`.scratch/prism/map.md`; its tickets are under `.scratch/prism/issues/`.

## The one rule

Apps always import from `@nanisoft/prism-ui`, **never from `antd` directly**.
(Plasma's invariant; will be enforced by re-export codegen, not lint, once the
export surface lands — see the prism-ui conventions ticket.)

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
pnpm lint    # oxlint . + stylelint
pnpm changeset  # declare a version bump before merging to main
```

TS is strict and ESM-only with no bundler for packages (types + `import`
exports only); `publint` runs on publish.

## Working here

- Read `.scratch/prism/map.md` first; claim a ticket (set `Status: claimed`)
  before working it — see `docs/agents/issue-tracker.md`.
- Domain language and standing decisions: `CONTEXT.md`, `PRODUCT.md`,
  `docs/adr/`, and the map's Notes section.
- Agent-relevant skills installed in this environment: `ant-design`, `antd`,
  `cloudflare`, `wrangler`, `workers-best-practices`.
