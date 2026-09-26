# Product

## Positioning

Prism is where NaniSoft products start: a design system whose token pipeline,
React component library and agent surface are the single source of truth, so a
downstream product composes accessible, themed React components and never
writes, imports or overrides a line of CSS.

That one sentence is the test every decision answers to. If a proposal would let
downstream code own a style, a token or an animation, it is out of scope.

## Who it is for

- **NaniSoft product teams.** The first audience. Every subsequent NaniSoft
  product is expected to be built on Prism rather than on a local component
  folder or a second UI kit.
- **AI agents.** The system publishes a machine-readable corpus and a read-only
  MCP endpoint, so an agent can read the same catalogue, props, examples and
  tokens a human reads and write code that imports Prism correctly.
- **Public npm consumers.** The four packages are MIT and public under
  `@nanisoft`. A consumer outside NaniSoft gets the same components, the same
  contract and the same no-override posture.

## What it is

- A DTCG token pipeline (`@nanisoft/prism-tokens`) that authors every design
  value and emits the shadcn-compatible CSS variable contract. Colour, radius,
  typography, spacing, motion, elevation, breakpoints and containers all
  originate there.
- A React component library (`@nanisoft/prism-ui`) of Components, Blocks and
  Pages over Base UI and Tailwind 4, published with one precompiled stylesheet
  and no consumer tooling requirement.
- A documentation site and a generated corpus (`@nanisoft/prism-llms`) that
  project the same checked catalogue.
- A read-only MCP server (`@nanisoft/prism-mcp-server`) served from the same
  Worker as the site.

## What it refuses to be

- **A copy-out registry.** Copy-out and the shadcn registry as a public install
  lane are out of scope. Distribution is the npm package alone, because a copied
  component is a fork with no upgrade path.
- **An override surface.** There is no consumer merge, no token override, no
  per-key theme object and no wrapper-theme seam. The prohibition is enumerated
  in the adoption contract and enforced where it can be, not left to taste.
- **A multi-platform toolkit.** React is the target. React Native and other
  platform outputs are out of scope.
- **A mirror of a large upstream catalogue.** Prism is curated. An item earns
  its place; the library does not track Base UI, shadcn or any other upstream
  one for one.
- **A second visual system for its own docs.** The documentation site is built
  with the system it documents.

## What a reader can do after reading this

- Know whether Prism fits their product, and what adopting it commits them to.
- Find the install command and the provider and theming entry points in
  `README.md`.
- Know the contract they must not break, and where to read it (`DESIGN.md` for
  the visual and token rules, `CONTEXT.md` for the vocabulary).
- Know what to do when Prism lacks something: request it upstream, never wrap or
  fork (`CONTRIBUTING.md`).

## Principles

1. **One source of truth.** Every token, style and animation is owned by Prism
   and reaches the consumer through the packages.
2. **Compose, never copy.** A consumer assembles Components, Blocks and Pages;
   it does not fork source or write CSS.
3. **Contrast is a build gate, not a review step.** A palette change that fails
   is a failed build.
4. **Motion is state feedback.** 80, 160 and 280 milliseconds, strongly
   decelerating, zero overshoot, no decorative or entrance animation.
5. **Agents are first-class.** Every public rule is available in a form an agent
   can read and verify.
6. **Decisions are recorded.** The rebuild map, its tickets and the constitution
   documents carry the reasoning.

## Evidence

The rebuild is planned in `.scratch/prism-shadcn/map.md`. The previous public
system lives at `github.com/NaniSoft/prism` as an untouched archive; its prose is
carried over as content, and its implementation is not.
