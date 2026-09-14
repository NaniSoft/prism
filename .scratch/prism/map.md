---
Labels: wayfinder:map
---

# Prism — one design language, many expressions

## Destination

prism.nanisoft.com live on Cloudflare Workers — landing page, docs, and blog, all built **with** Prism components and theme — alongside a monorepo whose `@nanisoft/prism-*` packages are publishable to npm (working changesets + CI release pipeline). The first actual npm publish is a task, not the destination.

## Notes

- **Shape**: plasma-shaped pnpm + Turborepo monorepo at github.com/NaniSoft/prism — packages `@nanisoft/prism-tokens`, `@nanisoft/prism-ui`, `@nanisoft/prism-llms`, `@nanisoft/prism-mcp-server`, plus `apps/site`.
- **Foundation**: antd v6 on React 19, TypeScript strict, ESM-only. `PrismProvider` wraps antd `ConfigProvider`; apps always import from `prism-ui`, never antd directly (plasma's rule). `@ant-design/icons` re-exported — no custom icons package.
- **Taxonomy**: components → blocks → pages is an organization taxonomy *inside* `prism-ui` (blocks = pre-composed components; pages = full-page compositions). Everything npm-delivered; code is never copied into consuming apps.
- **Theming**: token architecture is multi-brand from day one (`createPrismTheme()`); v1 ships the NaniSoft brand as **two brand packs — blue and green** (ticket 08), each in light and beam-dark modes.
- **Site**: Fumadocs **headless** (fumadocs-core + fumadocs-mdx `defineDocs`/`defineCollections`; fumadocs-ui styling not used) — Prism-owned `DocsShell`/`BlogLayout` ship as prism-ui pages. Static export → Cloudflare Workers Static Assets. Docs format v1 = rendered demos + copyable source (`ComponentDemo` block).
- **LLM/agent surface**: `prism-llms` (generated `llms.txt` + per-component MD), `prism-mcp-server` (tool-logic package; the `apps/site` Worker serves the HTTP MCP at `/mcp` — one Worker, not two — with an optional stdio shim), ecosystem MCPs in repo `.mcp.json`, agent docs (`AGENTS.md`/`CLAUDE.md`). The antd-skill skills (`ant-design`, `antd`) are already installed in this environment.
- **Figma**: greenfield. One-way token sync code → Figma Variables via a repo-owned plugin fed by DTCG-shaped `prism-tokens` build output (Variables REST API is Enterprise-only; Tokens Studio's git sync is the two-way coupling we forbade). Base library: the free "Ant Design Open Source" file as a **disposable scaffold** restyled via Variables — *no official antd Figma kit exists* (all entries "Third Party"; maintainers won't support Figma). Dev Mode MCP: remote endpoint (`mcp.figma.com`) works on all plans; the desktop endpoint needs a paid seat. **Professional** plan required for libraries + variable modes. No hand-built UI kit; no two-way sync.
- **Toolchain**: pnpm + Turborepo, changesets, oxlint + stylelint, Vitest + RTL, GitHub Actions (PR checks → changeset publish → `wrangler deploy`).
- **Skills to consult**: `ant-design`, `antd`, `cloudflare`, `wrangler`, `workers-best-practices`; `interfaces:*` / `impeccable` for UI direction.
- npm distribution is **public** under the `nanisoft` scope (org-internal in intent, public in availability).

## Decisions so far

<!-- one line per closed ticket — the answer lives in the ticket, this is only the gist + link -->

- [Fumadocs on Workers](issues/03-fumadocs-on-workers.md) — **GO**: fumadocs officially supports static export; DocsShell/BlogLayout are buildable as Prism-owned pages. Macro API is the default `defineDocs` path and forbids re-exporting, so content wiring stays app-level. Fumadocs' MCP endpoint can't live in the static export — docs-MCP tools go on prism-mcp-server, mirroring static `llms.txt` artefacts. Workers config specifics (assets dir, 404 handling, `run_worker_first` for `.md` routes) in the ticket.
- [Plasma conventions](issues/01-plasma-conventions.md) — plasma is a flat `packages/*` monorepo (no `apps/`; its docs site is Storybook, which Prism deliberately replaces with Fumadocs). Packages independently versioned, ESM-only with no bundler. Two mechanics to copy: (1) the "always import from plasma-mantine" invariant is enforced by **codegen** — proxy re-exports generated from upstream Mantine's index — so prism-ui should do the same against antd; (2) changeset validator + per-PR "what would this publish?" preview scripts. `plasma-llms` is a data-only npm package whose hand-maintained per-component MD is the source of truth; one `dist/` serves npm + site + the stdio-only `tmcp` MCP server (6 tools over a bundled `data.json`; antd-coverage delegated to the antd MCP). Prism diverges on MCP transport (Workers) and generates LLM pages from Fumadocs MDX to avoid plasma's duplicated-guidelines drift bug.
- [Figma greenfield setup](issues/04-figma-greenfield-setup.md) — full step-by-step guide in the findings. **No official antd Figma kit exists** — base = the free, stale "Ant Design Open Source" file as a disposable scaffold, restyled via Variables. Token sync = repo-owned Figma plugin fed by DTCG-shaped prism-tokens build output (Variables REST API is Enterprise-only). Dev Mode MCP: remote endpoint on all plans; Professional plan needed for libraries/variable modes; `.mcp.json` entries need `type: "http"` *and* `url` or Claude Code silently skips them.
- [antd v6 × React 19 × Next integration](issues/02-antd-v6-react19-next.md) — the stack works; static export is the *easy* case (`@ant-design/nextjs-registry` bakes antd CSS into the prerendered HTML). Pins: antd ^6.6.4, react ^19.3.0, next ^16.3.5, icons ^6.3.4. Flash-free dark mode: explicit `cssVar.key` per theme (`hashed: false`) + pre-baked variable sets via `@ant-design/static-style-extract` + inline class-swap — `createPrismTheme()` must set `cssVar.key` explicitly and map prism tokens to **seed tokens + algorithms**, never hand-set map tokens. Tailwind conflict moot for headless fumadocs-core. **ProComponents cannot take antd 6 on stable** (only a beta) — dashboard blocks build on plain antd v6; `@ant-design/x ^2.9.0` is healthy and antd-6-only.
- [Remote MCP on Workers](issues/05-remote-mcp-on-workers.md) — one Worker serves the site *and* MCP: `assets.run_worker_first: ["/mcp", "/mcp/*"]` with a stateless `createMcpHandler(factory)` from `agents/mcp/server`. **`McpAgent` is deprecated** (ignore all 2025 tutorials); `workers-mcp` is superseded. Tool logic lives once in a pure `createPrismMcpServer(docs)` factory (HTTP lane + optional `npx mcp-remote` stdio shim), fed by build-time-bundled prism-llms output — no runtime I/O. Auth v1 = none (public read-only docs), with Cloudflare Access pre-written as the org-only escalation. Wrangler gotchas in the ticket.
- [Prism visual language](issues/08-prism-visual-language.md) — **Spectral Refraction**: two brand packs (blue/green), each generating variant-tinted neutrals + beam dark; hairline elevation (one cool shadow, floating layers only); 4px radius; Archivo Variable + JetBrains Mono (width axis as refraction); 80/160/280ms decelerating motion, zero bounce; one accent owns live states; success joins the green pack; dithered-not-blended gradients; named/replayable states. `PRODUCT.md`, `CONTEXT.md`, and ADR-0001 now exist at the repo root. Unblocks ticket 09.

## Not yet specified

- **Dashboard/admin catalog** — shells and CRUD blocks for dashboards/admin sites. Note from ticket 02: ProComponents' stable line **cannot** take antd v6 (only a beta), so these blocks build on plain antd v6 (or wait for stable ProComponents) — that choice is part of what this fog must resolve when it graduates after the site ships.
- **Live-edit playground** — editable demo pane (react-live-style). Rendered demos + source copy ship in v1; the playground graduates only if wanted post-launch.
- **Visual-regression testing** for `prism-ui` — tool choice hangs on CI maturity after bootstrap.
- **Theme gallery + external brand pack** — the green pack (v1, ticket 08) already proves multi-pack theming in-house; what graduates later is a *third-party* brand pack proving `createPrismTheme()` for strangers, plus the gallery that shows all packs; hangs on the token architecture being exercised by the site.
- **Blog content plan** — voice, categories, first posts; hangs on `BlogLayout` existing.
- **Site i18n / locale strategy** — antd has locale machinery, but nothing demands it yet.

## Out of scope

- **Multi-platform outputs (React Native etc.)** — a separate future effort, not this map.
- **Custom icons package** — deliberately skipped; `@ant-design/icons` is re-exported through prism-ui.
- **Two-way Figma ↔ code token sync** — tar pit; code → Figma only.
- **Hand-built Prism Figma UI kit** — the free "Ant Design Open Source" file, restyled via Variables, instead (research found no official antd kit exists to restyle).
- **SSR / OpenNext for the site** — static export chosen; revisit only if the site gains real server-side behavior.
