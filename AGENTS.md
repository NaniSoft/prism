# AGENTS.md

Prism is NaniSoft's design system: a DTCG token pipeline, a published React
component library that downstream products compose without writing CSS, a
documentation site, and a machine-readable agent surface.

Read `CONTEXT.md` for the vocabulary, `DESIGN.md` for the visual and token
rules, and `PRODUCT.md` for why the system exists. Use the terms in `CONTEXT.md`
and avoid the words it retires.

## Where things are

| Path | Package | Role |
| --- | --- | --- |
| `packages/tokens` | `@nanisoft/prism-tokens` | foundation and semantic tokens, pack descriptors, the CSS variable contract |
| `packages/ui` | `@nanisoft/prism-ui` | Components, Blocks, Pages, the provider, and the one stylesheet |
| `packages/llms` | `@nanisoft/prism-llms` | generated `llms.txt`, the Markdown mirror, and the store |
| `packages/mcp-server` | `@nanisoft/prism-mcp-server` | read-only MCP tool logic, served from the site Worker |
| `apps/site` | `@nanisoft/site` | static docs site, landing page, themes, and the Worker |
| `scripts` | - | repository gates and release scripts |
| `.scratch/prism-shadcn` | - | the active rebuild map and its tickets |

## Commands

```sh
pnpm install
pnpm dev            # docs site
pnpm build          # turbo build; packages emit dist/, the site exports out/
pnpm test           # Vitest
pnpm check          # contrast, emitted-contract, motion, surface, layout, dash, corpus drift
pnpm lint           # oxlint
pnpm typecheck
pnpm changeset      # declare a release before merging
```

Run one package with `pnpm --filter @nanisoft/prism-ui <task>`. `package.json` is
the source of truth for what a script does today; the command set above is the
settled target.

## Conventions

- **One source of truth.** Every token, style and animation is authored here and
  reaches a consumer through the packages. A component consumes semantic
  utilities (`bg-background`, `text-muted-foreground`) and never a ramp step or a
  raw value.
- **No raw hex outside the token foundation tier**, and no raw ramp utility in a
  component.
- **Motion is by token only.** Name `duration-fast`, `duration-base` or
  `duration-slow` and `ease-out` or `ease-in-out`; never a millisecond value or a
  `cubic-bezier(...)` literal, and never a keyframe.
- **One stylesheet.** A consumer imports `@nanisoft/prism-ui/styles.css` once.
  Tailwind is an internal build dependency of the component package and the site,
  never the consumer's.
- **No override path.** A consumer composes, passes content and data, and chooses
  a pack and a mode. There is no merge, wrapper or copy-out. When Prism lacks
  something, request it upstream (see `CONTRIBUTING.md`).
- **The catalogue is the single list.** Do not keep a second one, and do not
  hand-edit the derived shadcn registry.
- **JSDoc on the exported component is the documentation source.** It is preserved
  into the emitted declarations, which the corpus reads. A component with no JSDoc
  block has no corpus entry.
- **Update the documentation with the code.** When a public surface, token or rule
  changes, update the item's JSDoc or MDX, its catalogue entry, and the document
  that states the rule: `CONTEXT.md` for vocabulary, `DESIGN.md` for visual and
  token rules, `README.md` for adoption.
- **Add a changeset for every published change.** Follow the conventions in
  `CONTRIBUTING.md`.

## Gotchas

- **The token dist is written in place, never wiped.** Do not add an `rm -rf`
  before the token build. Write over the top and prune afterwards, or a running
  dev server loses its module graph.
- **The shadcn registry is internal.** Never serve it or document it as an install
  lane.
- **Root documentation is not yet inside the dash gate.** Keep it free of em and
  en dashes anyway; the quality-gate work adds the root documents to
  `scripts/check-dashes.mjs`.
- **Package scope and layout.** The npm scope is `@nanisoft`; the library
  packages are `@nanisoft/prism-tokens` in `packages/tokens` and
  `@nanisoft/prism-ui` in `packages/ui`, and the site is `@nanisoft/site` in
  `apps/site`. The old `@ds/*` placeholder names are gone.

## Agent skills

### Issue tracker

Issues are markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.
The active map is `.scratch/prism-shadcn/map.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
