# AGENTS.md

Prism is NaniSoft's agent-ready React design system: a Prism-owned source catalog
built on accessible Base UI primitives and plain CSS, with the same source
projected into the docs site, `llms.txt`, Markdown mirrors, and the read-only
MCP. The pnpm + Turborepo monorepo is the product workspace.

## The one rule

Consumer applications import from `@nanisoft/prism-ui` and React only. They do
not install or import Base UI, and they never import another UI runtime
directly. Base UI is an implementation detail of `prism-ui`; Prism's public
vocabulary is the components, blocks, pages, provider, and token types exported
by Prism.

## Active wayfinding

The current migration plan is `.scratch/prism-base-ui/map.md`, with its spec and
five implementation tickets in that directory. The older
`.scratch/prism/map.md` and its Ant Design research/ADRs are historical
context; do not treat their retired implementation as current truth. Read the
active map first, then claim an unblocked ticket by setting `Status: claimed`
before editing it. Tracker conventions live in `docs/agents/issue-tracker.md`.

## Taxonomy

`@nanisoft/prism-ui` organizes its public surface as:

- **components** — accessible, single-responsibility controls and primitives;
- **blocks** — pre-composed product patterns assembled from components;
- **pages** — complete structural compositions assembled from blocks and
  components.

The catalog is curated rather than a one-for-one compatibility mirror. Apps
assemble Prism exports from npm; they never copy design-system source. The
checked catalog is `packages/ui/src/catalog.ts` and is the source for docs
navigation, generated content, the LLM corpus, and MCP metadata.

## Layout

| Path | Package | Role |
| --- | --- | --- |
| `packages/tokens` | `@nanisoft/prism-tokens` | Pure primitives, semantics, brand packs, and CSS-variable projection |
| `packages/ui` | `@nanisoft/prism-ui` | React components → blocks → pages, provider, icons, and plain CSS |
| `packages/llms` | `@nanisoft/prism-llms` | Generated `llms.txt`, Markdown mirrors, and the MCP corpus |
| `packages/mcp-server` | `@nanisoft/prism-mcp-server` | Transport-free MCP tool logic and `PrismDocsStore` contract |
| `apps/site` | `@nanisoft/site` | Static Next.js docs, landing page, themes, and Worker assets |

## Commands

```sh
pnpm install                 # install the workspace
pnpm build                   # turbo build; packages emit dist/, site exports out/
pnpm test                    # turbo test; Vitest/RTL coverage
pnpm check                   # prism-llms drift gate (7 corpus invariants)
pnpm lint                    # oxlint + stylelint
pnpm changeset               # declare a release before merging
```

For a focused package, use the workspace filter, for example
`pnpm --filter @nanisoft/prism-ui test`.

## Conventions

- **Theming** — `createPrismTheme({ pack, mode })` returns one frozen
  `PrismTheme` containing `primitives`, `semantics`, and `cssVariables`. The
  five registered packs are blue, green, lavender, rose, and peach; modes are
  light and beam-dark. The stylesheet consumes `--prism-*` variables and ships
  deterministic scopes for all ten expressions.
- **Provider** — `PrismProvider` owns the serializable theme scope, theme
  context, link adapter, and nearest local portal target. It is the only
  supported theming entry point for Prism components.
- **Behavior** — Base UI supplies accessible interaction primitives inside
  `prism-ui`; Prism owns the public wrappers, CSS recipes, types, and visual
  language. No Base UI symbol is re-exported.
- **Styling** — plain CSS, no Tailwind requirement. Use Prism semantic
  variables and documented `className`/`data-prism` hooks; do not reach into
  internal DOM or copy implementation CSS into an app.
- **Motion and shape** — preserve the Spectral Refraction commitments: Archivo
  Variable and JetBrains Mono, hairline elevation, 2/4/6/4 radii, dither rather
  than blended gradients, and the 80/160/280ms decelerating motion family.
- **Docs** — MDX in `apps/site/content` is authoritative prose. Live demos and
  their copyable source are co-located `demos/*.tsx` files. `prism-llms`
  generates the agent corpus from those sources; do not hand-copy content
  between lanes.
- **Figma** — token flow is one-way code → Figma Variables. Never hand-edit a
  generated token file or introduce a second source of visual truth.

## MCP servers

`.mcp.json` is strict JSON and contains only real, working servers:

- `prism` — the public read-only HTTP endpoint at
  `https://prism.nanisoft.com/mcp` (stdio clients can use `npx mcp-remote`).
  It serves eight tools over the generated owned catalog: `list_items`,
  `get_item_doc`, `get_item_props`, `get_item_source`, `get_theme_doc`,
  `list_pages`, `get_page`, and `search_docs`.
- `figma` — the remote Figma Dev Mode MCP at `https://mcp.figma.com/mcp`.

HTTP entries need both `type` and `url` or Claude Code skips them. Project
scope approval is one-time per user (`/mcp`). The Prism MCP is the source for
Prism behavior; it never directs consumers to an upstream UI package.

## Working here

- Read the active map, `CONTEXT.md`, `PRODUCT.md`, `docs/design-conventions.md`,
  and relevant ADRs before changing product language or visual conventions.
- Keep the existing dirty worktree; do not reset or discard unrelated changes.
- Prefer the checked catalog and generated projections over hand-maintained
  duplicate lists.
- When the UI layer changes in a way that alters the docs corpus, update the
  docs source and run `pnpm --filter @nanisoft/prism-llms generate-content`
  when generated stubs are affected, then run the full corpus check.
- Add a changeset for every published package whose public behavior or docs
  projection changes.
