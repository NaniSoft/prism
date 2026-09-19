# Prism × Figma conventions

One page. Read it before touching a Figma-derived design or component. The
setup these conventions govern was executed in map ticket 14; the full guide
they summarize is `.scratch/prism/research/04-figma-greenfield-setup.md`.

## The three laws

1. **Designs map to prism-ui components.** A Figma frame is a specification
   for `@nanisoft/prism-ui` components, never a description of DOM to write
   by hand. Apps import from `prism-ui`; antd is never imported directly.
2. **Tokens come from Figma Variables.** Every colour, radius, spacing and
   type value in a design resolves to a `prism.*` variable. If
   `get_variable_defs` returns nothing for a node, the design is wrong — fix
   the design, not the code.
3. **Never hand-pick colors.** No hex, no "close enough". A value missing
   from `prism.semantic` is a missing token: add it to
   `@nanisoft/prism-tokens`, re-run the sync, publish the library, then use
   it.

## Team + seats

- Team **NaniSoft**, Figma **Professional** (paid for libraries + variable
  modes — not for MCP). One **Full seat** owns the library; **Dev seats** for
  engineers; Collab/View are read-only and rate-limited to 6 MCP calls/month —
  anyone running an agent against Figma needs a Dev seat.
- Library source file: **`NaniSoft Design System`**. Only that file publishes.

## The base kit is scaffolding, not truth

There is no official antd Figma kit (the antd team has declined to build one).
The library started as the free **"Ant Design Open Source"** community file,
duplicated into the team and restyled through Prism Variables. Components come
from the published library, never copy-pasted between files. If the stale
scaffold's variants block real work, the paid third-party v6 file is the
fallback — its token layer still gets stripped in favour of Prism's.

## Variables

- **`prism.primitive`** — raw values, no modes. Nothing references it
  directly except `prism.semantic`.
- **`prism.semantic`** — aliases into primitives; the only collection with
  modes: **Light** (default) and **Dark**. An alias resolves per active mode.
- Shadows are the one exception to "tokens are Variables": Figma cannot bind
  a STRING variable to an effect. The floating shadow is *recorded* as a
  STRING variable (Dev Mode parity) and applied to layers as a normal effect —
  per-field variable binding (FLOAT offsets/blur/spread + COLOR for the
  shadow colour) is available if wanted.

## How tokens flow (one-way only)

`@nanisoft/prism-tokens` source → `pnpm build` → `dist/figma/<pack>/`
(DTCG-shaped tiers 0–1: one modeless `primitive.tokens.json`, one
`semantic.<mode>.tokens.json` per mode, plus the importer `manifest.json` —
ADR-0002 §2d) → sync plugin run inside `NaniSoft Design System` → **publish
the library**. Bring-up uses Microsoft's open-source **Variables Import**
plugin; the durable path is the repo-owned `prism-figma-sync` plugin once the
token shape stabilises. Publishing is manual and deliberate — the
design-side release gate, mirroring changesets on the code side.

Never edit variables in Figma and expect them to reach code. Never edit the
generated JSON. Two-way sync is out of scope by decision.

## Agents

- Remote Dev Mode MCP server `https://mcp.figma.com/mcp`, wired in the repo
  `.mcp.json` (both `type: "http"` and `url`, or Claude Code silently skips
  the entry). One-time per-user approval + OAuth via `/mcp`.
- Paste a **link to selection** (right-click layer → *Copy link to
  selection*), never a file link or a prose description — the server has no
  "browse the file" tool.
- `get_variable_defs` is the Prism-critical tool: expect `prism.*` names,
  mapped 1:1 to `@nanisoft/prism-tokens` keys.
- Budget: 200 read calls/day, 15/min on a Dev seat (200/day, 10/min on
  Starter). One frame per ask. `whoami` is exempt from rate limits and reports
  seat + email — run it first when a call fails.
- `create_design_system_rules` output is reviewed and committed, not trusted
  blind.

## Escalation

A design that needs a value, token, or component prism-ui doesn't have gets
filed against the token package first — never fork the value locally, never
hand-pick it in Figma.
