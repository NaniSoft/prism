---
Type: research
Status: resolved
Labels: wayfinder:research, ready-for-agent
---

## Question

What does coveo/plasma do *mechanically* — so Prism mirrors its proven shapes rather than reinventing them?

Cover:
- Monorepo layout: workspace/turbo task graph, package scaffolding, build order, ESM-only packaging details.
- Changesets config: how the interdependent packages version together, publish workflow, GitHub Actions wiring.
- `plasma-llms`: exactly what it contains (`llms.txt` shape, per-component MD format) and how it's generated (from source? from docs MDX?) so it can't drift.
- `plasma-mcp-server`: what tools it exposes, schemas, transports, how it pairs with the Mantine MCP for re-exported components.
- Docs site: how it consumes the packages, how component demos are authored, provider wiring.
- The themed-provider pattern (`Plasmantine` over MantineProvider) and how the "always import from plasma-mantine" rule is enforced.

Output: a conventions digest with concrete recommendations for the `@nanisoft/prism-*` equivalents.

## Answer

Full findings: `.scratch/prism/research/01-plasma-conventions.md` (12 recommendations, every fact source-linked).

- **Plasma is `packages/*` flat, no `apps/`** — the docs site at plasma.coveo.com is *Storybook 10 + Chromatic*, not Next/Fumadocs. Seven packages, **independently versioned** (`fixed: []`, `linked: []`, `updateInternalDependencies: "patch"`), released by 3 workflows (`ci.yml` on PRs, `release-pr.yml` on push to master, `cd.yml` manual-only, gated `master`/`next` where `next` runs `changeset pre`).
- **ESM-only with no bundler**: `exports` maps only `types` + `import`; builds are `tsgo` emit + a ~40-line asset copy script; `prepublishOnly: publint` everywhere.
- **The two highest-leverage mechanics**: (1) `GenerateMantineComponentExports.ts` fetches Mantine's upstream index and writes proxy re-exports for every component Plasma doesn't override — **that codegen, not a lint rule, is what makes "always import from plasma-mantine" enforceable**; (2) `scripts/validateChangesets.js` + `releasePreview.js` turn changesets into a CI-enforced, consumer-facing format and a per-PR "what would this publish?" comment.
- **`plasma-llms` is a data-only npm package** (no `exports`/`main`); its `.md` specs are *hand-maintained and the source of truth* — only the derived `llms.txt`/`llms-full.txt`/`data.json` are generated. One `dist/` artifact serves three consumers: npm, the static site (CI `cp`s it into `storybook-static/`), and the MCP server.
- **`plasma-mcp-server` is `tmcp` + valibot, stdio-only**, with 6 tools over a bundled `dist/data.json` (zero runtime I/O) — `list_components`, `get_component_doc`, `get_component_props`, `search_docs`, `list_content_guidelines`, `get_content_guideline`. Remote reach comes from static `llms.txt`, not an HTTP transport; antd coverage is delegated to a second server (`@mantine/mcp-server`: `list_items`/`get_item_doc`/`get_item_props`/`search_docs`) with the import invariant restated in both.
- **`Plasmantine` is a 38-line transparent wrapper** over `MantineProvider` (same props type, forwarded props) with an explicit merge order — plasma theme first, consumer theme second — and a composed CSS-variables resolver.
- **Prism should diverge on the docs site** (Fumadocs already chosen is better) and on MCP transport (Workers is a superset plasma has no precedent for); but should copy plasma's packaging recipe, non-lockstep changesets, changeset validator/preview scripts, re-export codegen, RFC-2119 component-doc format, `AGENTS.md` shape, and supply-chain posture. Watch plasma's one real drift bug: `storybook/src/content/*.mdx` and `llms/src/content/*.md` are duplicate copies of the same guidelines — Prism should generate the LLM pages from Fumadocs MDX instead.

