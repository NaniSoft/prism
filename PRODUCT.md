# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decided upstream in the Prism effort map (`.scratch/prism/map.md`), not by this interview: pnpm + Turborepo monorepo; antd v6 on React 19; Next.js 16 static export for the site; TypeScript strict, ESM-only; changesets + GitHub Actions; Cloudflare Workers Static Assets, with the site Worker also serving `/mcp`.

## Users

- **AI agents** are the primary user of the design system itself: in the agentic era, apps are developed *by* AI agents (Claude Code and peers) that consume Prism's MCP server, `llms.txt`, per-component MD, and agent docs to build complete, branded apps. The system must be machine-legible end to end.
- **NaniSoft developers** supervise that work and build NaniSoft's own apps (prism.nanisoft.com, internal tools) on the same packages.
- Public npm consumers (`@nanisoft` scope, public availability) are secondary — beneficiaries, not the target.

## Product Purpose

Prism is NaniSoft's design system: one design language, many expressions. Apps import from `@nanisoft/prism-ui` (never antd directly), getting themed antd v6 components plus pre-composed blocks and full pages, a docs site (prism.nanisoft.com), and a generated LLM/agent surface. Success: an agent can sit down with Prism alone and produce a NaniSoft-branded, production-quality app; a human can sit down with the site and understand the system in minutes.

## Positioning

The branded, agent-ready antd: a complete opinionated layer over antd v6 — brand themes, docs, MCP + LLM surfaces, codegen-enforced import invariants — that no raw antd install or generic component kit truthfully copies. Built so AI agents compose the brand instead of approximating it.

## Operating Context

- Agentic development workflows: IDE/CLI agents reading MCP tools (`/mcp` on the site Worker), `llms.txt`, and agent docs as their primary interface to the system.
- Docs at prism.nanisoft.com (Fumadocs headless, static on Cloudflare Workers): rendered demos + copyable source.
- Figma: one-way code → Variables token sync via a repo-owned plugin; no hand-built UI kit.
- npm distribution public under the `nanisoft` scope.

## Capabilities and Constraints

- antd v6 + React 19 foundation; `PrismProvider` wraps antd `ConfigProvider`; `@ant-design/icons` re-exported (no custom icons package).
- Taxonomy inside `prism-ui`: components → blocks → pages; everything npm-delivered, never copied into apps.
- Multi-brand theming from day one (`createPrismTheme()`); v1 ships the NaniSoft brand in blue and green color variants, light and dark modes.
- ProComponents' stable line cannot take antd v6 — dashboard blocks build on plain antd v6.
- Explicitly undecided (recorded, not invented): dashboard/admin catalog and visual-regression tooling wait on later map tickets.

## Brand Commitments

- Name: **NaniSoft** (capital S); system name **Prism**. npm scope is lowercase `@nanisoft`.
- Color: **blue and green** both established as brand color variants (user-pinned).
- Modes: **light and dark** both required (user-pinned).
- Character: **professional and next-gen** (user-pinned).
- Anti-goals (user-pinned, binding): never reads as a generic admin template, never toy-startup playful, never heavy-enterprise legacy. Bold expression is NOT ruled out.
- Greenfield: no pre-existing logo, palette, or typeface to honor.

## Evidence on Hand

- Effort map + research findings under `.scratch/prism/` (wayfinder decisions: plasma conventions, antd v6 stack, Fumadocs on Workers, Figma setup, remote MCP on Workers).
- **Absences future work must not fabricate**: no logo, no marketing copy, no customer evidence, no benchmarks, no testimonials. Anything demo-shaped is synthetic until replaced.

## Product Principles

1. **Agents are first-class users.** Everything an agent needs — tokens, docs, component APIs, block source — is generated from one source of truth and never hand-copied.
2. **One design language, many expressions.** Blue/green, light/dark are re-expressions of one system, not separate looks; theming proves the language, it doesn't fork it.
3. **The brand layer is the product.** Prism diverges from stock antd on purpose — the divergence is the brand, and it's encoded in tokens, not overrides scattered through apps.
4. **Assemble, never copy.** Components, blocks, and pages ship as npm packages; consuming apps own no design-system code.
5. **Decisions are recorded, not remembered.** Maps, tickets, and ADRs carry the reasoning so any agent (or human) can pick up the why.
