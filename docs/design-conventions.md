# Prism × Figma conventions

Read this before touching a Figma-derived design or a Prism component. The
current token contract lives in `@nanisoft/prism-tokens`; the older setup
research under `.scratch/prism/research/` is historical context.

## The three laws

1. **Designs map to Prism components.** A Figma frame specifies behavior and
   composition from `@nanisoft/prism-ui`; it is not a hand-written DOM
   description. Consumer apps import Prism and React only.
2. **Tokens come from Prism Variables.** Every color, radius, spacing, motion,
   and type value resolves to a `prism.*` variable. If a design needs a value
   that is not in the token package, add and validate the token rather than
   hand-picking a value in Figma.
3. **Code remains the source of truth.** Figma receives a one-way projection of
   the built DTCG output. Never edit a generated token file or expect a Figma
   edit to flow back into code.

## Team and library

- Team: **NaniSoft**.
- Library: **NaniSoft Design System**.
- Use a Figma plan that supports the team's library and variable needs; the
  remote Dev Mode MCP is available at `https://mcp.figma.com/mcp`.
- A community component file may be used as disposable structural scaffolding
  during setup, but it is never a second visual source. Historical research
  about an older scaffold is not an active package or architecture decision.

## Variables

- `prism.primitive` contains raw, mode-independent values.
- `prism.semantic` contains named meanings and mode aliases; it is the only
  collection consumers should reference in product code.
- Prism ships five packs and two modes. The Figma library may organize modes by
  pack and appearance, but the names must remain traceable to the code contract.
- Shadows are recorded as a string variable for documentation parity and
  applied as a normal effect; Figma cannot bind a string variable to every
  shadow field.

## One-way flow

`@nanisoft/prism-tokens` source → `pnpm build` → DTCG-shaped output under
`dist/figma/` → Variables Import / the repo-owned sync plugin → published Figma
library.

Bring-up may use a proven open-source importer while the token shape settles.
The durable path is a repo-owned plugin, not a hand-edited library. Publishing
is deliberate and mirrors the code release gate.

## Agents

- Configure the Figma Dev Mode MCP with both `type: "http"` and `url`.
- Paste a link to a selection, not a file link or prose-only description.
- `get_variable_defs` should return `prism.*` names. If it does not, fix the
  design-to-token mapping instead of inventing a CSS value.
- Run `whoami` first when a call fails; seat and account details affect limits.
- Review generated design-system rules before committing them.

## Escalation

A design that needs a new value or component starts as a token or catalog
change in the code repository. It is then rebuilt, contrast-checked, generated,
and published to Figma. Never fork a value locally or hand-pick a color to
make a frame look finished.
