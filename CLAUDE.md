# CLAUDE.md

## Project

Prism is NaniSoft's Prism-owned React design system. `@nanisoft/prism-ui`
provides accessible components, pre-composed blocks, and complete pages over
plain Prism CSS; Base UI is internal to that package. The docs site at
[prism.nanisoft.com](https://prism.nanisoft.com) is a Next.js static export on
Cloudflare Workers, with the same generated corpus served through the live
Prism MCP. Consumer applications import Prism and React only.

## Wayfinding

The active migration map is `.scratch/prism-base-ui/map.md`; its spec and
implementation tickets live beside it. The older `.scratch/prism/map.md` is
historical context. Read the active map first, claim an unblocked ticket with
`Status: claimed`, and use `docs/agents/issue-tracker.md` for tracker rules.

## Agent skills

- Issue tracker: `docs/agents/issue-tracker.md`
- Triage labels: `docs/agents/triage-labels.md`
- Domain language: `CONTEXT.md`, `PRODUCT.md`, and `docs/adr/`
- UI direction: `impeccable` / `emil-design-eng`
- Cloudflare work: `cloudflare`, `wrangler`, `workers-best-practices`

## Conventions

- **One import boundary:** apps use `@nanisoft/prism-ui`; Base UI and other UI
  runtimes are never consumer dependencies.
- **Taxonomy:** components → blocks → pages is the public organization inside
  `prism-ui`; all layers are npm-delivered and assembled, never copied.
- **Theming:** `createPrismTheme({ pack, mode })` returns frozen primitives,
  semantics, and `--prism-*` variables for five packs (blue, green, lavender,
  rose, peach) × light/beam-dark. `PrismProvider` owns the scope and portal
  target.
- **Styling:** plain CSS, hairline elevation, 2/4/6/4 radii, dither texture,
  Archivo Variable / JetBrains Mono, and the 80/160/280ms decelerating motion
  family. No Tailwind requirement.
- **Source truth:** `apps/site/content` MDX plus co-located `demos/*.tsx` feed
  the site, `prism-llms`, and MCP. Do not hand-copy generated artifacts.
- **Verification:** run `pnpm build`, `pnpm test`, `pnpm check`, and `pnpm lint`
  before handing off a broad change; add changesets for published packages.

## MCP servers

`.mcp.json` contains the live read-only `prism` HTTP server at
`https://prism.nanisoft.com/mcp` and the Figma Dev Mode server. It is strict
JSON with only working entries. The Prism MCP serves eight owned-catalog tools
and is the source for Prism behavior; it does not route consumers to an
upstream component library. Full handbook: `AGENTS.md`.
