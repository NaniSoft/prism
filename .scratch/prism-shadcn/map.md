---
Labels: wayfinder:map
---

# Prism rebuild

## Destination

`@nanisoft/prism-ui` is a published React component library, standing on this
repository's DTCG token pipeline and its shadcn and Base UI foundation, that
downstream NaniSoft products compose without writing or overriding a single
style, token, or animation. Alongside it: a plasma-shaped pnpm and Turborepo
monorepo with changesets and a CI release lane, a fumadocs site at
prism.nanisoft.com carrying the documentation content inherited from the old
Prism, and the `llms.txt` and MCP agent surface.

## Notes

**Domain.** A design system: design tokens, a React component library, a
documentation site, and a machine-readable agent surface. The vocabulary is not
settled. It is decided in "Governance and constitution".

**Skills every session should consult.** `grilling` and `domain-modeling`,
always. `research` for the AFK read tickets. `prototype` for theme scoping.
`cloudflare`, `wrangler` and `workers-best-practices` for the site and its
Worker. Do not consult `antd` or `ant-design`: Ant Design is out of scope, and
the old repository's `.mcp.json` wiring to the antd MCP is to be removed rather
than extended. There is no shadcn skill in this environment, so the registry
schema and the Base UI documentation are read directly.

**Standing preferences, settled in the charting session.**

- One source of truth. A downstream product composes components. It never writes
  CSS, never overrides a style, and never forks source.
- Every token, style, and animation is owned here and reaches the consumer
  through the packages.
- Distribution is the npm library only. The shadcn registry survives as an
  internal integrity artifact, never a public lane.
- shadcn's CSS variable contract is the token contract. Semantic names are
  emitted verbatim. No raw hex outside the foundation layer.
- Contrast is a build gate, not a review step.
- Motion is state feedback at 80, 160 and 280 milliseconds, strongly
  decelerating, zero overshoot, and the motion tokens reach CSS. No decorative
  keyframes, no entrance or scroll animation.
- Clean break. The old `@nanisoft/prism-ui` API is not preserved, and the
  cutover is a major bump.

**Repository.** This directory becomes the Prism repository, on fresh git
history. `NaniSoft/prism` is left public and untouched as an archive, with its
prose carried over as content.

## Decisions so far

Settled in the charting session on 2026-09-26 by grilling, before any ticket
existed. They are recorded here rather than on tickets because no ticket holds
them. From "Monorepo shape and package boundaries" onward, every decision is
recorded on its own ticket.

- **The destination is a spec, not the work.** The map is done when someone
  could execute it without asking a question.
- **Reference repository.** coveo/plasma is the conventions reference: turbo,
  changesets, a shared tsconfig base, per-package README and CHANGELOG,
  CODEOWNERS, CONTRIBUTING, CI, and the `llms` and `mcp-server` package pattern.
  Its Storybook site and its oxlint and oxfmt toolchain are not adopted; the
  docs are rebuilt on fumadocs and the linting stays on oxlint.
- **Identity.** Scope `@nanisoft`; names `@nanisoft/prism-tokens`,
  `@nanisoft/prism-ui`, `@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`;
  domain `prism.nanisoft.com`; MIT; repository `NaniSoft/prism`. All four
  confirmed live on npm.
- **Visual identity is this repository's.** Blush, Mint, Lavender, Sky, Peach;
  Inter; OKLCH ramps; DTCG 2025.10 with Style Dictionary. Spectral Refraction,
  Archivo Variable with JetBrains Mono, and the beam-dark naming are dropped.
- **Content is the old repository's.** Prose voice, guides, per-item guidance,
  blog posts, brand policy. `PRODUCT.md`, `DESIGN.md` and `CONTEXT.md` are
  regenerated. The old glossary's vocabulary guardrail does not survive: it
  defines a theme as pack plus mode, and it names the catalogue units
  components, both of which collide with this repository.
- **Taxonomy is components to blocks to pages**, inherited from the content
  being carried over.
- **Catalogue scope.** The old components are re-expressed on the new
  foundation; blocks and pages are rebuilt fresh as composition demos. The v1
  roster is fog rather than a ticket, because it depends on what the
  foundation and the token contract turn out to support.
- **The agent surface is ported, not rebuilt.** The old `prism-llms` and
  `prism-mcp-server` are strictly better than anything built here, and both
  names are already published.
- **Distribution is the npm library only.** Downstream products install
  `@nanisoft/prism-ui` and import one stylesheet. Copy-out is incompatible with
  a single source of truth.
- **Adoption.** This system becomes the foundation for NaniSoft's subsequent
  products, and downstream code never touches CSS. What a downstream product
  does when Prism lacks something is fog.
- **Git.** Fresh history in this directory. The old public repository is
  archived untouched, and its prose is copied in as content.
- **Toolchain.** pnpm, TypeScript, Tailwind 4, oxlint, Vitest, changesets,
  turbo. The local repository has no tests today, which is a gap rather than a
  baseline.

From the charting session's own grilling, the twelve decisions above are the
ones the map was built on. The four decisions below were resolved by the
research tickets fired at charting time, and three of them correct the record
above.

- [fumadocs headless on a static export](issues/03-fumadocs-headless-static-export-limits.md):
  headless is valid and fumadocs' own MCP cannot live in a static export, so
  both inherited decisions stand; but the official `*.md` recipe uses rewrites,
  which export forbids, and the old note about empty sections building was
  wrong about its mechanism.
- [The old repository's release and npm machinery](issues/02-old-repo-release-and-npm-machinery.md):
  the changeset validator, the release preview, `CODEOWNERS` and
  `CONTRIBUTING.md` that this map credited to the old repository are plasma's
  and were never built there. Provenance is off, the site deploys from the CI
  workflow on every merge, and four unconsumed changesets sit on `main`
  including a major for all four packages.
- [The old site's documentation inventory](issues/01-old-site-documentation-inventory.md):
  **the per-item documentation is entirely machine-generated, so there is no
  per-item prose to carry.** The whole authored content of the old site is six
  guides totalling 14 727 bytes, 43 one-line descriptions and 19 demo files. The
  blog has never had a post. This qualifies the decision above to keep the old
  repository's content, which was made on the belief that a documented
  43-item catalogue existed.
- [coveo/plasma's documentation structure](issues/04-plasma-documentation-structure-index.md):
  per-component prose is about 1.7 KB and the weight is in the story and the
  agent spec; the `@content` group is organisational writing practice rather
  than design-system documentation; and plasma's two registers are separated by
  validators rather than by taste, with no build gate on the human side.
- [Monorepo shape and package boundaries](issues/05-monorepo-shape-and-package-boundaries.md):
  `apps/*` and `packages/*` both stay, `packages/registry` is renamed to
  `packages/ui` rather than restructured, the corpus extractor reads emitted
  declarations rather than source, `tsc` plus asset copying replaces a bundler
  that does not yet exist, and the exports map is fixed so the component API
  ticket does not decide it twice.
- [What prism-tokens emits, and what reaches CSS](issues/06-prism-tokens-emitted-contract.md):
  colours keep the verbatim shadcn contract while motion (80/160/280 ms),
  typography and spacing become real tokens, emitted through a single
  `@theme static` block; the spacing coincidence gate is replaced by an
  emitted-contract test; a one-way DTCG projection is added; the selector shape
  is handed to the theme-scoping prototype; and because Tailwind's duration
  namespace is `--transition-duration-*`, that name is emitted alongside
  `--duration-*`.
- [How prism-ui delivers styling, its provider, and its theming API](issues/07-prism-ui-styling-provider-and-theming-api.md):
  one precompiled `styles.css` is the only styling lane and Tailwind stays an
  internal build dependency; `PrismProvider` is optional, has no override path,
  and the axes are `data-pack` plus `.dark`; `./styles.css`, the twelve-key
  exports map and the `tsc` plus asset-copy build are instantiated; a surface
  gate bans Base UI types and variant recipes from emitted declarations; a
  Block never fetches and a Page is a shipped composition demo; and the
  consumer's permission list is enumerated exhaustively.
- [Theme scoping and runtime switching](issues/08-theme-scoping-and-runtime-switching.md):
  the attribute-agnostic `[data-pack="<id>"]` / `[data-pack="<id>"].dark` selector
  is adopted as the cheapest shape that makes descendant scoping work, and it is
  exposed as ticket 06's single `themeSelector` switch (root-scoped remains the
  default); the blocking inline pre-hydration script stays the only first-paint
  mechanism under static export; pack and mode stay two separate axes.
- [Catalogue taxonomy, grouping, and URL IA](issues/09-catalogue-taxonomy-and-url-ia.md):
  Components, Blocks and Pages are the units and "primitive" retires; plasma's
  seven categories are adopted verbatim as a closed set; a checked catalogue is
  the single source for navigation, docs, corpus and MCP; URLs are flat and
  kind-prefixed with `/content/<slug>` added; `kind` is a closed union; a
  Foundations section and a Content section both ship; and `/` is a marketing
  landing page owned by the site, not a catalogue item.
- [Docs site architecture on fumadocs](issues/10-docs-site-architecture-on-fumadocs.md):
  stay headless with a site-owned shell; a required catch-all serves the
  catalogue sections from one merged loader with an explicit index page per
  section; the per-item template is H1, Overview, Usage, Guidelines, generated
  API table; live demos keep the `ComponentDemo` plus generated-registry
  pattern; search is `advanced` mode, our own UI, with a 300 KiB gzip budget;
  the blog is dropped; the Worker owns `/mcp` and the `.md` prefix rewrite with
  glob patterns; and Next 16.3.6 accepts `revalidate = false` under export.
- [CI and release lane](issues/16-ci-and-release-lane.md):
  three workflows (`ci.yml`, `release.yml`, `publish.yml`) over four composite
  actions; publish is manual dispatch behind an `npm-publish` environment using
  npm trusted publishing and provenance; tokens and ui version in `linked`
  lockstep while llms and mcp-server stay independent; a `next` prerelease lane
  exists; `privatePackages` is turned off; and `publint` plus a tarball verifier
  is the release floor.
- [Elevation, layout and breakpoint tokens](issues/18-elevation-layout-and-breakpoint-tokens.md):
  shadows (`--shadow-xs/sm/md`), breakpoints (`sm/md/lg`, `xl` closed) and
  container/measure (`--container-page/measure/measure-narrow`) are authored and
  bound to Tailwind; a residual-Tailwind inventory states exactly what remains
  outside the token source, and a grep gate protects the three new groups.
- [Documentation content plan and authoring flow](issues/11-documentation-content-plan-and-authoring-flow.md):
  a full page inventory down to ship-thin; one hand-written MDX source per item
  with the agent layer derived from it plus emitted declarations and demo source
  (a deliberate departure from plasma's two hand-written registers); 1.7 KB to
  2.5 KB per item, about five pages per agent session with human review, every
  shipped item fully documented; all six guides rewritten; the blog dropped; and
  a six-page Content section adapted from plasma's `@content`.
- [Governance and the written constitution](issues/14-governance-and-constitution.md):
  `PRODUCT.md` written fresh, `DESIGN.md` regenerated with the residual-Tailwind
  inventory, and `CONTEXT.md` settled as a glossary only (theme = pack times
  mode; the catalogue unit is an item whose kinds are component, block and page;
  primitive, colourway, variant, beam-dark, pass-through and wrapper retire);
  `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `LICENSE`,
  `THIRD-PARTY-NOTICES.md`, `CODEOWNERS`, the PR template and `.editorconfig`
  are written; the contribution path is request-upstream or contribute-a-PR, and
  the dash gate becomes a checked result rather than a writing property.
- [Quality gates and test strategy](issues/15-quality-gates-and-test-strategy.md):
  Vitest with a per-package floor; the contrast, emitted-contract, motion,
  surface, elevation/layout, dash and corpus-drift gates split into fail and
  report; axe runs and fails; the client-boundary analyzer stays report-only
  with a claim check; build-twice determinism is kept; visual regression is
  adopted as a report-only Playwright screenshot job with a written promotion
  rule; and ticket 10's four gates are absorbed.
- [The v1 component roster](issues/19-v1-component-roster.md):
  the launch roster is 28 components, 10 blocks and 4 pages, or 42 catalogue
  items, spread across plasma's seven categories with `Miscellaneous` empty; 13
  Base UI primitives are the whole new dependency surface; 15 components stay
  Server Components and 13 are client within a 90 KB client ceiling; and the
  catalogue entries follow ticket 09's schema.
- [The llms corpus contract](issues/12-llms-corpus-contract.md):
  one `dist/` is read three ways (npm, the site's copied export, the MCP's
  build-time-bundled `data.json`); the authority order is MDX, then emitted
  declarations through a compiler-API-free extractor, then verbatim demo source,
  then the catalogue description, then the token atoms; the output set is
  `llms.txt`, `llms-full.txt`, the `md/**` mirror, `data.json` as the one
  manifest, and `prism-skill.md`; the per-item spec is generated with a literal
  `## Props` definition list; the corpus package owns the mirror and fumadocs'
  `llms()` is not adopted; the seven invariants plus a declared-set-equals-emitted
  check all fail the build; and `PrismDocsStore` is canonical in the package with
  a closed `kind` union.
- [MCP tool surface and transport](issues/13-mcp-tool-surface-and-transport.md):
  the eight read-only tools are re-derived (only `list_items` is kind-driven, the
  other seven are retrieval-driven); props come from the generated spec's `## Props`
  list with a documented seam line when an item wraps an upstream primitive;
  source is the import line plus the verbatim demo; `get_theme_doc` answers packs
  and every bound token group; search stays substring with an honest description
  and fumadocs' helpers are rejected; the Worker handler is `createMcpHandler` via
  the agents SDK, public read-only with an Access escalation pre-written but off;
  no stdio bin at launch; the build stamp lives in the MCP lane outside `dist` so
  byte determinism survives; and the test floor is 20 including real protocol
  round-trips.
- [Cutover: git, npm, DNS, and archiving the old repository](issues/17-cutover-git-npm-dns-and-archive.md):
  resolved as a fully staged, human-executable runbook because the destination is
  a spec. The local steps (content record, npm metadata, dry-run rehearsal,
  migration note, map closure) are separated from the steps that need org access
  (repository creation and push, trusted-publisher setup, the publish behind the
  `npm-publish` environment, deprecating the old `0.3.0`/`0.4.0` versions, and the
  Custom Domain move). `MIGRATION.md` is drafted with unknowns marked rather than
  invented, and the map found no remaining gap in the destination.

## Not yet specified

Nothing. Every question the way to the destination needed is now decided. The
roster graduated to ticket 19, the contribution path to ticket 14, and visual
regression was settled by ticket 15. If new fog appears while executing, it
belongs to a fresh map rather than this one.

## Out of scope

- Compatibility with the old `@nanisoft/prism-ui` API. Clean break, major bump,
  following the old repository's own precedent.
- Copy-out, and the shadcn registry as a public distribution lane.
- Spectral Refraction, Archivo Variable with JetBrains Mono, beam-dark mode
  naming.
- Ant Design, `@ant-design/icons`, and the antd MCP wiring in `.mcp.json`.
- Two-way Figma to code token sync.
- SSR or OpenNext for the site. Static export, inherited.
- Multi-platform outputs such as React Native.
- A custom icon package.
- Preservation of the old site's per-item URLs, `/blog`, `/rss.xml` and the old
  per-theme deep links. The clean break drops them; only the top-level routes
  that already match the new shape are kept.
- A one-way Figma Variables sync and its plugin ownership. Ticket 06 decides the
  DTCG output shape, but no sync or plugin is built in this effort.
- Supply-chain and dependency automation: CodeQL, Scorecards,
  `dependency-review-action`, Renovate and pnpm `minimumReleaseAge`. Named and
  deferred in ticket 16.
- Consumer-supplied theme overrides, per-key token merging, and re-exporting
  Base UI. There is no override path; a consumer requests changes upstream.
  Ticket 07 makes the no-escape-hatch posture explicit and checkable.
- A live-edit playground pane. Ticket 10 keeps rendered demos plus copyable
  source; a composed live-edit surface is not built.
- i18n and locale. The site is single-locale with no `[lang]` segment;
  fumadocs' i18n routing is `proxy.ts`-based and forbidden under static export.
  A locale story would be a fresh effort.

## Status

**Complete.** All nineteen tickets are resolved and the map is closed. Tickets
01 to 05 and the research they rest on charted it; 06 to 16, 18 and 19 decided
it; and 17 is the staged runbook for execution. No fog remains that the
destination needs. The next move is not a ticket on this map: it is the
implementation the spec describes, starting from the plan this map produced.
