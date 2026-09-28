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
| `packages/ui` | `@nanisoft/prism-ui` | Components, Blocks, Pages, the provider, the one stylesheet, and the consumer gate kit |
| `packages/llms` | `@nanisoft/prism-llms` | generated `llms.txt`, the Markdown mirror, and the store |
| `packages/mcp-server` | `@nanisoft/prism-mcp-server` | read-only MCP tool logic, served from the site Worker |
| `apps/site` | `@nanisoft/site` | static docs site, landing page, themes, and the Worker |
| `scripts` | - | repository gates and release scripts |

## Commands

```sh
pnpm install
pnpm dev            # docs site
pnpm build          # turbo build; packages emit dist/, the site exports out/
pnpm test           # Vitest
pnpm check          # contrast, emitted-contract, motion, surface, layout, dash, corpus drift, content joins
pnpm lint           # oxlint
pnpm typecheck
pnpm changeset      # declare a release before merging
```

Run one package with `pnpm --filter @nanisoft/prism-ui <task>`. `package.json` is
the source of truth for what a script does today.

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

## Cross-repository laws

The four consumer repositories are coordinated by the gates in
`@nanisoft/prism-ui/gates`, not by a document. A law is the failure message of a
gate, so a change to one lands here once and reaches every consumer in one release
and cannot be declined there. Read `docs/consumer-gates.md` for where the line is
drawn between a law and a site's own data.

Two rules follow from that, and both are about what may be written where:

- **Never restate a law in a consumer's repository, in a document or in a test.** A
  consumer holds data: its roots, its sheet, its pack map, its coverage floors. A
  law restated in four repositories is four laws that will disagree, and the
  disagreement is invisible until a reader sees it.
- **A comment that names a fact is a record; a comment that instructs is an
  instruction.** The retired-line gate treats the two differently, and so should a
  hand: recording what the old sheet declared is history, while telling a later
  implementer which package to import is the failure this programme spent a
  migration losing readers to.

## Gotchas

- **The token dist is written in place, never wiped.** Do not add an `rm -rf`
  before the token build. Write over the top and prune afterwards, or a running
  dev server loses its module graph.
- **The corpus build reads the site's tree, so `turbo.json` declares it.** It
  names `@nanisoft/site#copy-changelogs` as a task `@nanisoft/prism-llms#build`
  depends on, because the corpus reads the files that copy writes and the corpus
  package is built on its own by the task runner, not only through the site's
  lifecycle. The same task lists the site's content tree, the Item
  documentation tree, the two site script modules the builder imports, the
  workspace globs, the published manifests and the changelogs as that build's
  inputs. A build that reads another package's tree without declaring it is
  hashed over inputs it never looks at, so a warm cache replays it and only a
  cold machine shows the omission. Add a read to the builder, add it to the
  inputs. The same applies to a test that reads its own package's build output:
  `@nanisoft/prism-ui#test` declares `dependsOn: ["build"]` because the surface
  gate reads `dist/` and the gate's own test spawns it. Without that entry the
  `test` task depends on `^build`, which is the DEPENDENCIES' builds, so a clean
  runner has no `dist/` and a test that passed locally after a manual build
  fails. A test that quietly depends on the order things ran in is a test of the
  order.
- **The shadcn registry is internal.** Never serve it or document it as an install
  lane.
- **`packages/ui/gates/` is published and `packages/ui/src` is the library.** The
  kit is a build-time program for a consumer's repository, so it lives outside
  `src/`, outside `dist/`, and outside the token build. Adding a gate to `src/`
  would put a Node-only program in a consumer's module graph and its bundle. The
  kit's own gate is `packages/ui/scripts/check-gate-kit.mjs` and it is the only
  part of the kit this repository runs.
- **A consumer resolves the token package through the component package.** The kit
  seeds a `require` from `@nanisoft/prism-ui/package.json`, which is a published
  export, so `@nanisoft/prism-tokens` is prism-ui's dependency and not a consumer's.
  That is why no consumer declares it, and the pin gate fails on a consumer that
  does: the token version is one repository's decision and five declarations of it
  are five facts to keep in step with a release.
- **Root documentation is inside the dash gate.** `scripts/check-dashes.mjs`
  scans `README.md`, `DESIGN.md`, `PRODUCT.md`, `CONTEXT.md`, `AGENTS.md`,
  `CONTRIBUTING.md` and `docs/**` alongside the package sources, and fails on an
  em or en dash or a `???` sequence in reader-facing copy. Keep them free of
  all three.
- **Package scope and layout.** The npm scope is `@nanisoft`; the library
  packages are `@nanisoft/prism-tokens` in `packages/tokens` and
  `@nanisoft/prism-ui` in `packages/ui`, and the site is `@nanisoft/site` in
  `apps/site`. The old `@ds/*` placeholder names are gone.

## Agent skills

### Issue tracker

Issues are GitHub issues at `github.com/NaniSoft/prism/issues`; a change lands as
a pull request. There is no file-based ticket tree in the repository. A decision
is recorded in the constitution at the root, not in a ticket.
See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` at the repo root. `docs/adr/` is the convention
if an architecture decision needs its own file, and it does not exist yet.
See `docs/agents/domain.md`.
