# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Prism is a pnpm + Turborepo monorepo built on React 19 and TypeScript strict,
ESM-only packages. `@nanisoft/prism-ui` owns the React source catalog and uses
Base UI internally for accessible behavior; `@nanisoft/prism-tokens` is pure
data and emits CSS custom properties. The docs site is a Next.js 16 static
export on Cloudflare Workers Static Assets, and the same Worker serves the
read-only MCP at `/mcp`. Changesets and GitHub Actions govern releases.

## Users

- **AI agents** are the primary users of the system's knowledge surface. They
  consume the MCP, `llms.txt`, per-item Markdown, theme references, and live
  demos to build complete branded applications without reverse-engineering a
  visual language.
- **NaniSoft developers** supervise that work and build NaniSoft products on
  the same packages.
- **Public npm consumers** receive the same MIT-licensed packages and can
  compose the system in their own React applications.

## Product Purpose

Prism is NaniSoft's design system: one design language, many expressions. Apps
install React and `@nanisoft/prism-ui`, then assemble owned components, blocks,
and pages without adopting a second UI vocabulary. The package ships the
Spectral Refraction visual language, accessible behavior, docs, generated
agent references, and one supported import boundary.

Success means an agent can read Prism's public source of truth and produce a
production-quality NaniSoft-branded app, while a human can understand the
system's visual rules and composition model in minutes.

## Positioning

Prism is the branded, agent-ready alternative to a generic component kit: a
small, curated React system whose implementation details stay private and whose
behavior, recipes, examples, and token tables are all inspectable. It does not
attempt to mirror a large upstream component catalog. Every public item earns
its place in a coherent workflow from components to blocks to pages.

## Operating Context

- The docs site is the human door: rendered examples, copyable source, live
  theme controls, and a searchable catalog.
- The generated corpus is the agent door: the site source, `llms.txt`, Markdown
  mirrors, and MCP all project the same checked catalog and co-located demos.
- Figma is a one-way token consumer: code-built DTCG output flows to Variables;
  there is no hand-built UI kit and no two-way sync.
- npm distribution is public under the `@nanisoft` scope.

## Capabilities and Constraints

- React 19 is the consumer peer. Base UI is a direct implementation dependency
  of `prism-ui` only; consumers do not install it.
- The first catalog is intentionally curated: 29 components, 9 blocks, and 5
  pages, organized as components → blocks → pages.
- `PrismProvider` owns the serializable theme scope, theme context, link
  adapter, and nearest local portal target.
- Five brand packs ship in light and beam-dark modes, with AA contrast gates,
  hairline elevation, the 2/4/6/4 radius family, dither texture, and the
  established Archivo Variable / JetBrains Mono typography.
- Styling is plain Prism CSS and generated custom properties. Tailwind is not
  required.
- The static site and MCP remain one product surface: the same generated corpus
  is served to humans and agents.

## Brand Commitments

- Name: **NaniSoft**; system name: **Prism**; npm scope: `@nanisoft`.
- Spectrum: five pastel packs — blue, green, lavender, rose, peach. Pastel is
  atmosphere; mid-tone ink carries meaning and passes AA gates.
- Modes: light and beam-dark.
- Character: professional, precise, and next-generation.
- Anti-goals: generic admin-template appearance, toy-startup playfulness, and
  heavy-enterprise legacy.
- Greenfield: no pre-existing logo, palette, or typeface constrains the system.

## Evidence on Hand

- The active migration map at `.scratch/prism-base-ui/` records the clean-break
  decision, catalog shape, and acceptance gates.
- Historical research and ADRs under `docs/adr/` and `.scratch/prism/` explain
  earlier explorations; they are not evidence that the retired implementation
  remains active.
- Synthetic demos demonstrate composition but are not customer evidence,
  benchmarks, testimonials, or adoption claims.

## Product Principles

1. **Agents are first-class users.** Every public API, token, example, and
   usage rule is available in a form an agent can read and verify.
2. **One design language, many expressions.** A pack or mode changes the
   atmosphere, not the system's grammar.
3. **The brand layer is the product.** Color, type, shape, motion, and texture
   are encoded in Prism's own source and recipes.
4. **Assemble, never copy.** Components, blocks, and pages ship as npm exports;
   applications own their data and composition, not a fork of the system.
5. **Decisions are recorded.** Active maps, tickets, and superseding ADRs carry
   the reasoning so a human or agent can pick up the work.
