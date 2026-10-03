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
pnpm check          # the repository gates; docs/quality-gates.md is the table,
                    # and scripts/check-gate-table.mjs holds it against the chains
pnpm lint           # oxlint
pnpm typecheck
pnpm changeset      # declare a release before merging
```

Run one package with `pnpm --filter @nanisoft/prism-ui <task>`. `package.json` is
the source of truth for what a script does today, and the gate list is not
restated above on purpose: a second list of the gates is a list that will drift,
so the one in `docs/quality-gates.md` is compared to every `check` task in every
manifest by `scripts/check-gate-table.mjs` and fails in both directions. Add a
gate to a chain and the table finding names the file; rename one and it fails the
other way.

## Conventions

- **One source of truth.** Every token, style and animation is authored here and
  reaches a consumer through the packages. A component consumes semantic
  utilities (`bg-background`, `text-muted-foreground`) and never a ramp step or a
  raw value.
- **No raw hex outside the token foundation tier**, and no raw ramp utility in a
  component.
- **Motion is by token only.** Name `duration-fast`, `duration-base` or
  `duration-slow` and `ease-out` or `ease-in-out`; never a millisecond value or a
  `cubic-bezier(...)` literal, and never a keyframe. A figure that shows a system
  running is the one other case: name an `ambient-*` token and one of the six
  `prism-ambient-*` classes the stylesheet publishes, which resolves the cycle
  for you. Read `DESIGN.md` under Motion before authoring one. The gate is
  `scripts/check-motion.mjs`.
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
- **The motion gate reads component source and the one stylesheet that decides
  reduced motion.** `scripts/check-motion.mjs` reads `packages/ui/src`,
  `packages/llms/src`, `packages/mcp-server/src`, `apps/site/src` and
  `apps/site/items`, and it reads `packages/ui/src/styles.css` twice over: once as
  component source and once as the file the reduced-motion policy lives in. It does
  not read `packages/tokens`, which owns the values; `scripts/**`,
  `packages/*/scripts/**` or `packages/ui/gates/**`, which spell out the patterns
  they ban as a matter of course; or `apps/site/src/generated`, whose Demos are read
  in `apps/site/items`. So a curve literal in a Component is a finding and a curve
  literal in a gate's own rule table is not, and the run prints which surfaces it
  did not read rather than leaving that in this list alone. The policy is one
  unlayered `@media (prefers-reduced-motion: reduce)` rule setting `animation: none`
  and `transition: none` on the universal selector, so a Component that re-decides
  reduced motion with a `motion-safe:` or `motion-reduce:` variant is a finding and
  a block narrowed back to a list of class names is a finding.
- **A control inside a control is a finding, and the reason is that the alternative
  is unreachable.** `scripts/check-nested-controls.mjs` reads the JSX in
  `packages/ui/src`, `apps/site/src` and `apps/site/items`, and fails on a control
  nested inside one. `Button` carries no `render` and no `asChild`, so a caller who
  wants a button that navigates cannot make one element that is both, and the only
  route left is to nest an anchor inside a button or a button inside an anchor,
  which is invalid markup and two tab stops for one action. Where a Component
  already takes a `render` element, use it: `DropdownMenuItem` is the one, and
  `blocks/site-navbar/sites-menu.tsx` is the call site that says why. Two things
  the gate deliberately does not call a finding: a `label` wrapping the control it
  names, which is the pattern the specification recommends and this repository
  ships four of, and an anchor with no `href`, which is a placeholder under the
  transparent content model. Its proof is `scripts/__tests__/nested-controls.test.mjs`.
- **A Block rendering a control that cannot act is a finding, and the gate is the only
  reason five of them are not still shipping one.** `scripts/check-block-controls.mjs`
  reads `packages/ui/src/blocks` and `packages/ui/src/pages` and fails on a rendered
  `Button` or `CtaLink` carrying none of `onClick`, `type="submit"`, `type="reset"` or
  `href`. A Block ships no behaviour, so a `<button>` it renders cannot be given a
  handler: it is a server Component unless it says `'use client'`, and it is
  focusable, announced as a button, and activates to nothing. Five Blocks shipped one,
  every one at the place a reader looks first. The escape is a slot: `href` required on
  the arm that navigates, a `ReactNode` the Block places without styling on the arm that
  is not a link, which is `hero-01`'s `HeroLinkAction` and `HeroSlotAction`. It does
  **not** read `apps/site/items`, because the documentation Demo for `Button` renders a
  `Button` with no handler and showing the control is the point; the demos are held by
  the compiler, since a Demo passes a Block's props. Two defects in the gate's own first
  version are recorded in `scripts/__tests__/block-controls.test.mjs`: deleting comments
  rather than blanking them moved every line number below a JSDoc block, and matching a
  tag's attributes with a pattern stopped at the `<` or `>` inside `=>`, `<=` and `>=`.
  Read a tag's end by brace and paren balance.
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
