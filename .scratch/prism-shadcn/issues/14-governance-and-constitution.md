---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 05, 06, 07, 18
---

# Governance and the written constitution

## Question

The user was explicit: generate a new `PRODUCT.md` and `DESIGN.md` from this
repository's system, not from the old one. The old repository also has a
`CONTEXT.md` glossary with a hard vocabulary guardrail that does not survive the
move, and the local `DESIGN.md` opens by saying this repository has no declared
brand north star. This ticket writes the constitution the rest of the map is
accountable to.

Settle:

1. **`PRODUCT.md`.** What the product is, who it is for, what it refuses to be,
   and what a reader should be able to do after reading it. The old one
   described a design system as an agent-ready React library with five pastel
   packs; this repository's system has no north star to describe yet, so this
   is written rather than adapted. State the one-sentence positioning, and
   check it against the user's stated purpose: this system is the foundation
   for NaniSoft's subsequent products, and downstream code never touches CSS.
2. **`DESIGN.md`.** The local file is a thorough description of what the code
   establishes, with eight sections and a token-contract appendix, a theme
   switching section and a known-open-items section. Decide its fate: keep the
   shape and regenerate the content against the new system, or adopt a
   different structure. Note the local file's own closing admission that its
   dash-freedom is a property of how it was written rather than a checked
   result, and that making it a checked result requires adding it to the gate
   configuration in two places.
3. **`CONTEXT.md`.** The glossary. The old one ran to a strict guardrail: it
   defined brand pack, mode, theme, component, block, page, catalog, owned
   source, internal primitive, corpus and agent door, each with an avoid-list,
   and it ended by naming the words that must not be revived. The new one has to
   replace that vocabulary, because the old definitions of theme and component
   both collide with this repository. Decide every canonical term and its
   avoid-list. This is the highest-value output of the ticket and the one with
   the longest tail, because every doc page, every code comment and every agent
   instruction inherits from it.
4. **The domain versus the implementation boundary.** The domain-modeling
   discipline says `CONTEXT.md` is a glossary and nothing else. The old
   repository's glossary had drifted toward describing implementation, and its
   map records a decision to keep the base UI boundary as metadata rather than
   an extension API. Decide where that line sits now, given Tailwind is a
   published part of this architecture rather than an internal detail.
5. **`AGENTS.md`.** The old one was a handbook written so an agent could
   contribute a complete review-ready pull request without asking a human how.
   Decide the new one: what an agent must know to work in this repository, the
   commands, the conventions, the documentation update rule, and the gotchas.
   The local repository's `AGENTS.md` currently points at `README.md` and
   `DESIGN.md` and says nothing else.
6. **`CONTRIBUTING.md`** and the pull request template. Decide what a human
   contributor is asked to do, and whether the acceptance criteria include a
   changeset. Note that the old repository has **no `CONTRIBUTING.md`**, so
   there is nothing to adapt: the rules people remember as plasma's are
   plasma's, and the changeset requirements in particular were written down
   there and never built here.
7. **`README.md`.** The audience is a developer deciding whether to adopt this,
   so it needs the install command, the provider usage, the theming API, the
   agent surface, and the repository map. Decide its section order and what the
   first screen says, given the old README opened with a positioning line and
   the local one opens with a directory tree.
8. **`LICENSE`, `THIRD-PARTY-NOTICES.md` and `CODEOWNERS`.** The old repository's
   licence is a thin MIT with `THIRD-PARTY-NOTICES.md` beside it, and both are
   worth carrying. Decide the copyright holder wording, and whether the brand
   policy page carries the trademark material: the old repository kept the two
   separate on purpose, with brand protection as a policy page and never as
   licence clauses. That page needs rewriting rather than copying, because its
   "What is ours" section names Spectral Refraction and the old pack identifiers
   and therefore contradicts the new identity. `CODEOWNERS` exists in neither
   repository, so it is greenfield: decide whether a design system with one
   maintainer wants one at all, since a catch-all owner line is the only
   meaningful content until there is more than one team. For the notices file,
   state what belongs in it when the dependency set includes Base UI, Tailwind,
   fumadocs and the fonts.
9. **The vocabulary decision, once.** Several earlier tickets defer terms to
   this one. Collect them here and settle them together rather than letting
   each ticket decide independently: the three catalogue unit names, the theme
   axis question, what a pack is versus what a theme is, and what the agent
   surface's primary noun is. Then state which earlier tickets need updating
   with the answer.
10. **The contribution path.** Ticket 07's adoption contract closed with this as
   its one open question: when Prism lacks a component, token or variant, a
   downstream product cannot override or wrap. Decide what it does instead -
   request it upstream, contribute a pull request, or something else - who owns
   the decision, and how it is written down. This was the map's "contribution
   path" fog, and it graduates here rather than as a separate ticket because the
   answer is governance and lands in `CONTRIBUTING.md` (question 6).

Read the local `AGENTS.md`, `README.md` and `DESIGN.md` in full, and the old
repository's `PRODUCT.md`, `CONTEXT.md`, `AGENTS.md` and `CLAUDE.md`. It has no
`CONTRIBUTING.md` and no `CODEOWNERS`, so for those two, read plasma's instead as
the reference for what a design system of this size puts in them. Consult
`domain-modeling` throughout and `writing-for-agents` for `AGENTS.md`.

## Answer

The constitution is written, not adapted. Every root document is now authored
from this repository's settled system, in the vocabulary tickets 06, 07, 08, 09
and 18 fixed. Three cross-cutting decisions run through all of them and are
stated once here:

- **Dash freedom becomes a checked result.** `PRODUCT.md`, `CONTEXT.md`,
  `DESIGN.md`, `README.md`, `AGENTS.md` and `CONTRIBUTING.md` are written with
  no em or en dashes, and the decision is that the gate should enforce it:
  ticket 15 adds the root documents to **both** `ROOTS` and `GATED` in
  `scripts/check-dashes.mjs`. Adding them to `ROOTS` alone would report without
  gating. This ticket does not edit the gate; it records the requirement and
  marks the current state as a writing property in `DESIGN.md` (Known Open
  Items) and `AGENTS.md` (Gotchas).
- **Prose says catalogue; code keeps `catalog`.** `CONTEXT.md` makes
  *catalogue* canonical and records that the code identifiers (`catalog.ts`,
  `buildCatalog()`, `CATALOG_KINDS`) keep the `catalog` spelling fixed by ticket
  09. The glossary is a vocabulary rule, not a rename ticket.
- **The impeccable product-schema marker is not carried.** The old
  `PRODUCT.md` opened with `<!-- impeccable:product-schema 1 -->`; the new
  `PRODUCT.md` is a fresh document and does not carry it. `DESIGN.md` keeps its
  summary frontmatter because `.impeccable/design.json` is generated from it;
  that summary is otherwise stale and is recorded as such.

### 1. `PRODUCT.md`

Written fresh. One-sentence positioning: **Prism is where NaniSoft products
start: a design system whose token pipeline, React component library and agent
surface are the single source of truth, so a downstream product composes
accessible, themed React components and never writes, imports or overrides a
line of CSS.** The document then states who it is for (NaniSoft product teams
first, then agents, then public npm consumers), what it is, what it refuses to be
(a copy-out registry, an override surface, a multi-platform toolkit, a mirror of
a large upstream catalogue, a second visual system for its own docs), what a
reader can do after reading it, six principles, and the evidence (the map and the
archived old repository).

### 2. `DESIGN.md`

The eight-section shape is kept and its content is regenerated against the new
system: **Overview, Colors, Typography, Layout, Elevation & Depth, Shapes,
Components, Do's and Don'ts**, then the **Token Contract** appendix, **Theme
Switching** and **Known Open Items**. Regenerated content, per the hand-offs in
tickets 06, 08 and 18:

- Colour is the contract unchanged: `default` plus Blush, Mint, Lavender, Sky
  and Peach, semantic names verbatim, the four named colour rules.
- Typography, spacing and motion now **reach CSS**; the Overview, Typography and
  Token Contract say so, and the "authored but unbound" open item is closed.
- Elevation (`--shadow-xs/sm/md`), breakpoints (`sm/md/lg`, `xl` and `2xl`
  closed) and containers (`--container-page/measure/measure-narrow`) are
  authored; the Three-Step and Unlit Shadow rules are structural. The docs-only
  `shadow-lg` floating panel is named as the single residual shadow literal.
- The Layout section carries ticket 18's full residual-Tailwind inventory, so
  "every style is driven from here" is true for every token value and precisely
  qualified for composition.
- Theme Switching records `data-pack` plus `.dark`, attribute-agnostic
  selectors, **descendant scoping supported** (the old defect is closed), pack
  and mode as two axes, the optional provider, and the blocking first-paint
  script.
- Known Open Items is honest: the rebuild is not executed, the v1 roster is not
  settled, the new groups are not emitted yet, the dash gate does not cover root
  docs, the `base-nova` identifier is unverified, `CODEOWNERS` has a placeholder
  handle, and `.impeccable/design.json` is stale.

The summary frontmatter is retained for the impeccable tooling and its values
are grounded in the current committed build. Decision recorded: the dash gate
becomes a checked result (see above); until ticket 15 lands it, dash freedom in
`DESIGN.md` is a writing property.

### 3. `CONTEXT.md`

The glossary, and nothing else. It defines, each with an avoid-list: **pack**
(and pack id), **mode**, **theme** (pack times mode), **foundation token**,
**semantic token**, **token contract**, **token**, **component**, **block**,
**page**, **item**, **kind**, **category**, **catalogue**, **registry**, **owned
source**, **internal dependency**, **provider**, **corpus**, **store** and
**agent surface**. The two collisions are resolved: *theme* is pack times mode,
never pack plus mode and never an object; *item* is the catalogue unit and a
*component* is one of its three kinds. The closing Retired Words list removes
*primitive* (unit noun), *colourway*, *variant* (unit noun), *beam-dark*,
*pass-through*, *wrapper*, *agent door*, *internal primitive*, *catalog* (in
prose), *layer* (unit noun), and the dropped identity names.

### 4. The domain versus implementation boundary

- `CONTEXT.md` is vocabulary: terms, definitions, avoid-lists. It names the
  catalogue and the registry as distinctions without documenting their files.
- `DESIGN.md` is visual and structural description: token tiers, the emitted
  contract, the visual rules, the token and theme mechanics, and the residual
  Tailwind inventory.
- `AGENTS.md` is instructions for an agent working here: paths, commands,
  conventions and gotchas.
- `PRODUCT.md` is positioning. `README.md` is adoption. `CONTRIBUTING.md` is the
  process.
- **Tailwind is a published part of the architecture**, because it compiles
  `styles.css`, so it is described where it lives: in `DESIGN.md` (Layout's
  residual inventory and Token Contract), and in `AGENTS.md` as an internal
  dependency. It is not glossed over and not hidden.

### 5. `AGENTS.md`

Rewritten for an agent to work here without asking, in the `writing-for-agents`
register: what the repository is, the three documents to read, the package map,
the settled command set, the conventions (semantic utilities only, no raw hex
outside the foundation, tokens drive styles and motion, one stylesheet, no
override path, one catalogue, JSDoc as the doc source, the documentation-update
rule, a changeset for every published change), and the gotchas (the dist is
written in place, the registry is internal, root docs are outside the dash gate,
the repository is mid-rebuild). The `docs/agents/*` pointers are kept.

### 6. `CONTRIBUTING.md` and the pull request template

`CONTRIBUTING.md` is new. It states the contribution path (below), the
prerequisites and commands, the authoring and documentation rules, the test
conventions (Vitest, behaviour not implementation, no "should", keyboard and
focus coverage), and the changeset rules. It adopts ticket 16's four enforced
conventions verbatim: a title of 100 characters or fewer, no trailing period, no
`BREAKING:` prefix, a body and a `# Migration` section on a `major` (and a body
on a `minor`). The PR template carries the acceptance criteria including a
changeset and a dash check.

### 7. `README.md`

The audience is a developer deciding whether to adopt, and the first screen is
the positioning line, not a directory tree. Section order: positioning, install,
the provider, theming, Components and Blocks and Pages, the agent surface, the
repository map, status, contributing. It shows the one stylesheet import, the
canonical `layout.tsx`, the provider and the `usePrismTheme` hook, the
`data-pack` plus `.dark` axes with `themeAttributes`, the MCP configuration, and
a short honest status note that the rebuild is in flight.

### 8. `LICENSE`, `THIRD-PARTY-NOTICES.md` and `CODEOWNERS`

- `LICENSE` is a thin MIT with no brand clauses, copyright **NaniSoft**, 2026.
- `THIRD-PARTY-NOTICES.md` is new and covers Base UI, Tailwind, fumadocs,
  Lucide, Inter, and the rest of the dependency set (MCP SDK, zod, React, Next,
  `agents`, `class-variance-authority`, `clsx`, `tailwind-merge`), with the
  build toolchain listed as not redistributed. Inter is attributed under SIL OFL
  1.1 and is site-hosted.
- **Brand and trademark material does not live in the licence.** It belongs to
  the site's brand policy page, which ticket 11 owns and which must be rewritten
  because its "What is ours" section still names Spectral Refraction and the old
  pack identifiers. Handed to 11.
- `CODEOWNERS` is new: a **single catch-all owner line**, because this is a
  one-maintainer project. The handle is the placeholder `@NaniSoft/maintainers`,
  with the placeholder stated in the file; the repository cutover confirms it.
  Recorded in Known Open Items.

### 9. The vocabulary decision, once

Settled here, as recommended, and collected from every ticket that deferred a
term:

- The three unit names are **Component**, **Block**, **Page**. Confirms 09 and
  retires *primitive* and *layer*.
- The axes are **pack** and **mode**; a **theme** is pack times mode. Confirms
  06; the runtime attribute is `data-pack` and the mode is `.dark`. Confirms 07
  and 08.
- The agent surface's primary noun is **item**, with `component`, `block` and
  `page` as its `kind`s. This is new here: 09 fixed the kinds, and 12 and 13
  inherit *item* as the noun their tools and store use.
- Extension beyond 06's avoid-list, stated for the record: **brand pack** is
  retired in favour of **pack**, because `default` is a pack too and the
  qualifier adds nothing. **agent door** becomes **agent surface**, and
  **internal primitive** becomes **internal dependency**, because *primitive* is
  retired.

**Tickets this confirms or updates:** 06, 07, 08, 09, 18 are confirmed. 10's
theme-switching section is updated (descendant scoping is supported, so the
`/themes` inline-value fallback is no longer needed). 11 must write every page in
this vocabulary and rewrite the brand policy page. 12 and 13 inherit *item*,
*kind* and *store*. 15 gains the dash-gate requirement and the gate list named in
`DESIGN.md`. 16's conventions are documented in `CONTRIBUTING.md`. 17 confirms
the `CODEOWNERS` handle.

### 10. The contribution path

**A downstream product requests the change upstream, and contributes a pull
request against this repository. It never writes a local override, a wrapper
theme or a copied component.** The maintainer owns the decision and records the
reasoning on the issue. This is stated in `PRODUCT.md`, `AGENTS.md` and
`CONTRIBUTING.md`, where the three steps and the "never a local override" rule
live. This closes the map's contribution-path fog and ticket 07's one open
question.

### Deviations, and what was deliberately not written

- **`CLAUDE.md` is not written.** Ticket 05 lists it in the root file set, but
  this ticket's delegated write scope excludes it, and `AGENTS.md` is the single
  agent instruction file. If a `CLAUDE.md` is wanted it should be a thin pointer
  to `AGENTS.md`, not a second source of truth.
- **The impeccable product-schema marker is dropped** from `PRODUCT.md` (see the
  cross-cutting decisions).
- **`DESIGN.md`'s frontmatter is kept** for the impeccable tooling rather than
  dropped; the body is the constitution and the frontmatter is a summary of it.

### Files written

- `.scratch/prism-shadcn/issues/14-governance-and-constitution.md` (this file)
- `PRODUCT.md`
- `CONTEXT.md`
- `DESIGN.md`
- `AGENTS.md`
- `README.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `THIRD-PARTY-NOTICES.md`
- `CODEOWNERS`
- `.github/pull_request_template.md`
- `.editorconfig`
