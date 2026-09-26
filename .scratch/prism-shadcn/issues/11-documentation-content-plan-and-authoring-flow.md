---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 01, 09, 10
---

# Documentation content plan and authoring flow

## Question

**This ticket was rewritten after the documentation inventory resolved. Read
this before planning anything.** The original brief asked which of the old
site's sections were portable. The answer is that the old site has almost no
prose to port, so the question is no longer "adapt" but "author".

The facts, from
[the inventory](../research/01-old-site-documentation-inventory.md) and
[plasma's structure](../research/04-plasma-documentation-structure.md):

- All 43 per-item pages are machine-generated stubs with zero `##` headings.
  There is no per-item prose anywhere in the old repository.
- The old site's entire authored content is six guides totalling 14 727 bytes:
  Quickstart, Architecture, Composition, Theming, Agent workflow, Brand policy.
  Plus 43 one-line descriptions in the catalogue and 19 authored demo files.
- The blog has never had a post. It is a 0-byte `.gitkeep`.
- plasma's per-component prose is about 1.7 KB, and 58 of its 58 component pages
  are byte-identical in outline. Its weight sits in the story and the agent
  spec, not the page.
- plasma's `@content` group is organisational writing practice, not
  design-system documentation.

So the content work is not a port. It is roughly 1.7 KB of prose per item times
forty to sixty items, plus whatever guides and foundations pages the information
architecture calls for. Decide how that gets written and by what.

Settle:

1. **The page inventory.** Every page the new site needs, in the information
   architecture from the taxonomy ticket, with its route, its audience, and
   whether it ships at launch. Be honest about which pages ship thin.
2. **What is ported, rewritten, or dropped.** Only three things are genuinely
   portable: the six guides, subject to rewrite rather than copy since they
   describe the old architecture; the 19 demo files, which are React and
   therefore candidates for porting subject to the new component API; and the
   brand policy page, whose "What is ours" section names Spectral Refraction
   and the old pack identifiers and so contradicts the new identity. Decide the
   fate of each explicitly. A 452-byte template repeated 43 times is not content
   and should not be counted as any.
3. **The per-item page skeleton, taken from plasma's.** All 58 of its component
   pages share one outline: H1, Overview, Usage, Guidelines, When to use, When
   not to use, Best practices, with Content guidelines optional. Adopt that
   skeleton, or state a different one and say why. The recorded detail worth
   keeping is the controls rule: the reported default is the component's
   default, never the story's `args` value, because a story's default is a
   demonstration choice and reporting it as the component's default is a lie.
4. **The authoring cost, as a number.** 1.7 KB of prose per item, times the v1
   roster, is the size of this effort and nothing else in the map is larger.
   State it as items per session with a named author, and say what a launch with
   a partial catalogue looks like: twelve items fully documented, or forty items
   thinly. This is the decision the destination actually turns on, and the
   roster is fog, so the plan has to work at more than one roster size.
5. **The authoring source of truth.** plasma keeps a hand-written agent spec and
   a separate human page in deliberately different voices, forbids copying
   between them, and enforces the separation with validators. The old repository
   had generated pages and a corpus derived from MDX plus types plus demo source.
   Decide which model to use. Note the measured asymmetry: plasma's agent specs
   are 3 to 6 times larger than its human pages, so "one document, two
   audiences" is not the cheap option it appears to be. Also note that plasma
   enforces its human-layer voice rules with no build gate at all, so if the
   separation is copied, the checking has to be decided with it.
6. **Who writes it.** A single author, an agent, or a review loop. The old
   repository used per-concern skills under `.github/skills/`, which does not
   exist here. Decide whether this repository grows that mechanism and what each
   skill enforces.
7. **What is generated and what is written.** Enumerate every generated
   artifact: API tables from component types, demo registries, catalogue
   navigation, per-item Markdown for the agent surface, the site search index.
   For each, name the source of truth and the failure mode when the source
   changes without the artifact being rebuilt.
8. **The drift gate.** What must fail the build, and which check would have
   caught the known defect where a renamed registry file left the site rendering
   while the install 404'd. The old repository's seven invariants are a
   reasonable starting set and are enumerated in the inventory report; the
   build-twice byte comparison is what makes artifacts safe to diff in review,
   so say explicitly if it is dropped.
9. **The install command in the docs.** Under a library-only model the command
   changes shape: it becomes an import, not a `shadcn add` invocation. Decide
   what each per-item page shows instead, and confirm the internal registry
   artifact appears nowhere user-facing.
10. **The blog.** There is no content and the live site shows an empty state.
    Decide whether the section ships, ships with authored posts, or does not
    exist, and whether RSS is in scope. A design system with an empty blog
    section is a worse signal than no blog section, so "does not exist" is a
    legitimate answer and "empty section" probably is not.
11. **The guides.** The six old guides describe an architecture being replaced,
    so they are rewrites rather than copies. Decide which survive: Quickstart
    and Theming clearly map onto new material, while Architecture and
    Composition may be the most valuable of the six precisely because they
    describe intent rather than implementation. Say which are rewritten, which
    are merged, and which are dropped.
12. **The Content section.** Ticket 09 decided the information architecture
    ships a Content section adapted from plasma's `@content` — the user asked
    for "content as per coveo". That section is not otherwise owned: this ticket
    plans the guides and the per-item pages, but never plasma's voice, audience,
    writing-mechanics, product-vocabulary and glossary pages. Decide what those
    pages are, what is NaniSoft-specific rather than inherited, whether they are
    a Lerna for organisational writing rather than design-system documentation,
    and who authors them. Record it here rather than opening a separate ticket,
    so the page inventory in question 1 is complete.

Consult `writing-for-agents` for anything that is instructions rather than
documentation, and `domain-modeling` before introducing a new content noun.

## Answer

All twelve are decided. The headline is that the content is the largest body of
work on the map and this ticket is where it gets a number, a skeleton and a
register. Three points go beyond the recommended answers, each justified in
place: the single-register authoring model is adopted with its measured cost
stated (§5), the Content section carries the RFC 2119 and `RULE:` register that
item pages forbid (§12), and the launch roster is authoring-bounded rather than
date-bounded (§4). The page shapes are consistent with ticket 09's flat,
kind-prefixed URLs and ticket 10's shell, route tree and per-item template.

### 1. The page inventory

The inventory below is the whole site. Routes are ticket 09's; the loader and
shell are ticket 10's. "Ships" is answered for launch; the only items deferred
to v1.1 are catalogue items beyond the launch cut in §4, and nothing else waits.
"Thin" is used honestly: a Foundations page is one sentence plus a live table by
design, and that is not the same failure as a per-item page with no prose.

| Route | Page | Audience | Source of truth | Ships | Thin? |
| --- | --- | --- | --- | --- | --- |
| `/` | Marketing landing | Developer choosing whether to adopt | Site TSX, blocks at the call site (09 Q7, 10 §2) | launch | no |
| `/themes` | Pack-by-mode showcase | Developer, designer | Site TSX + `prism-tokens` manifests (10 §6) | launch | no |
| `/docs` | Guides index | Developer | explicit index page (03/10) | launch | n/a |
| `/docs/quickstart` | Quickstart | Developer | hand-written MDX, rewrite (§11) | launch | no |
| `/docs/architecture` | Architecture | Contributor, developer | hand-written MDX, rewrite | launch | no |
| `/docs/composition` | Composition | Developer | hand-written MDX, rewrite | launch | no |
| `/docs/theming` | Theming | Developer | hand-written MDX, rewrite | launch | no |
| `/docs/agent-workflow` | Agent workflow | Developer, agent | hand-written MDX, rewrite | launch | no |
| `/docs/brand` | Brand policy | Legal, any reader | hand-written MDX, rewrite | launch | no |
| `/foundations` | Foundations index | Developer, designer | explicit index (09 §6) | launch | n/a |
| `/foundations/colors` | Colors | Developer, designer | live token reader | launch | thin, by design |
| `/foundations/iconography` | Iconography | Developer | live token reader | launch | thin, by design |
| `/foundations/radii` | Radii | Developer | live token reader | launch | thin, by design |
| `/foundations/shadows` | Shadows | Developer | live token reader | launch | thin, by design |
| `/foundations/spacings` | Spacings | Developer | live token reader | launch | thin, by design |
| `/foundations/typography` | Typography | Developer, designer | live token reader | launch | thin, by design |
| `/foundations/motion` | Motion | Developer | live token reader | launch | thin, by design |
| `/foundations/variables` | Variables | Developer | token browser (09 §6) | launch | no |
| `/content` | Content index | Writer | explicit index (09 §6) | launch | n/a |
| `/content/about-content` | About content | Writer | hand-written MDX (§12) | launch | thin |
| `/content/audience` | Audience | Writer | hand-written MDX | launch | thin |
| `/content/voice` | Voice | Writer | hand-written MDX | launch | no |
| `/content/writing-mechanics` | Writing mechanics | Writer | hand-written MDX | launch | no |
| `/content/product-vocabulary` | Product vocabulary | Writer | hand-written MDX | launch | no |
| `/content/glossary` | Glossary | Writer, contributor | hand-written MDX, terms owned by ticket 14 | launch | no |
| `/components` | Components index | Developer | generated from `catalog.ts` (09 §3, 10 §2) | launch if roster non-empty | n/a |
| `/components/<slug>` | Component pages | Developer | catalogue + MDX prose + generated API table | launch, roster-bounded | no (§4) |
| `/blocks` | Blocks index | Developer | generated from `catalog.ts` | launch if roster non-empty | n/a |
| `/blocks/<slug>` | Block pages | Developer | catalogue + prose + generated composition table | launch, roster-bounded | no (§4) |
| `/pages` | Pages index | Developer | generated from `catalog.ts` | launch if roster non-empty | n/a |
| `/pages/<slug>` | Page pages | Developer | catalogue + prose + generated composition table | launch, roster-bounded | no (§4) |
| `/api/search` | Search index | Machine | `source` + `prose` page trees, `advanced` mode (10 §7) | launch | n/a |
| `/<section>/<slug>.md` | Markdown mirror | Agent | MDX + emitted `.d.ts` + demo source (12) | per item | n/a |
| `/llms.txt`, `/llms-full.txt`, `/prism-skill.md` | Agent surface | Agent | `packages/llms` corpus (12) | launch | n/a |
| `/mcp` | MCP endpoint | Agent | ticket 13, Worker route (10 §10) | launch | n/a |
| `out/404.html` | Not found | Any | site TSX (10 §11) | launch | n/a |

**Nothing ships as a generated empty stub.** The old 43 stub pages are not
ported and no stub generator replaces them (§2). Ticket 10 §4 is right that the
*mechanism* tolerates an item page with no prose (slots 2 and 4 absent); that is
a capability for later, not the launch policy. At launch a catalogue entry whose
`prose` file is missing or whose demo is absent is a bug, and the coverage gate
in §8 fails the build.

**Which pages ship thin, stated plainly.** The seven Foundations readers are one
description sentence plus a live table of the emitted cascade (research 04 §4:
plasma's entire `@foundation` section carries no prose). `About content` and
`Audience` in the Content section start as short living pages and grow; they are
organisational writing, not design-system documentation (§12). Every guide, the
Glossary, Writing mechanics and Product vocabulary ship full. Every catalogue
item page ships complete or the item does not ship (§4).

### 2. What is ported, rewritten, or dropped

Everything is classified. The old site's entire authored prose was 14,727 bytes
in six guides, 43 one-line descriptions and 19 demo files (research 01).

**The six guides: all six are rewritten, none copied.** They describe the old
architecture (antd re-exports, `Spectral Refraction`, `createPrismTheme`, the
old package's subpaths), so a copy would be false. The rewrites are specified in
§11.

**The 19 demo files: 14 are porting candidates, 5 are dropped.** They are React
and self-contained (research 01 §6.1: imports must be `@nanisoft/prism-ui/*` or
`react`, and a default export is required), so the port is a re-expression
against ticket 07's API, not a rewrite from scratch. Each ported demo must pass
the demo contract in §8.

| Old demo | Kind | Fate |
| --- | --- | --- |
| `button`, `dialog`, `field`, `select`, `switch` | component | candidates, re-expressed against the new API |
| `application-shell`, `auth-form`, `data-table`, `page-header`, `settings-panel`, `stat-card` | block | candidates |
| `auth-page`, `dashboard-page`, `settings-page` | page | candidates |
| `component-demo` | block | **dropped as a catalogue item.** It was the old site's demo machinery; ticket 10 §5 re-implements it as the site's own `apps/site/src/components/component-demo.tsx`, not a Block |
| `site-header`, `site-footer` | block | **dropped as catalogue items.** Site chrome is site-owned (09 §6, 10 §3); the site rebuilds its own header and footer |
| `docs-shell` | page | **dropped as a catalogue item.** The docs frame is a site component, not an installable Page (10 §3) |
| `blog-layout` | page | **dropped with the blog** (§10) |

The dropped five are dropped because the roster changed, not because the demo
was bad. A demo whose item is deferred to v1.1 ports with it.

**The 43 generated item stubs: dropped.** They are a 452-byte template repeated
43 times with zero `##` headings (research 01 §3.1); a stub is not content. No
stub generator is carried over. What *is* carried over is the 43 one-line
descriptions from `packages/ui/src/catalog.ts`, reassigned to the checked
catalogue's `description` field (09 §3):

- **37 carried forward** as the catalogue description (subject to the dash gate
  and to the new item names).
- **6 rewritten.** The five the inventory marks coupled (`card` names
  "hairline"; `typography` names "refracted"; `component-demo`, `site-header`
  and `site-footer` describe the old site) plus the one after-edit
  (`auth-page` names `AuthForm`). Three of those five belong to items that are
  dropped anyway, so the surviving rewrites are `card`, `typography` and
  `auth-page`. The old `icon` and `textarea` descriptions are reviewed but kept,
  with "Prism sizing" allowed and the 24px stroke claim re-checked against the
  new iconography decision.

**The brand policy page: rewritten, not copied.** `What is ours` names Spectral
Refraction and the old pack identifiers (`blue, green, lavender, rose, peach`),
which contradict the new identity, and `Status` names `createPrismTheme()`. The
licence mechanics, the may/may-not structure and the unregistered-marks
reasoning are preserved (research 01 §5). Ticket 14 Q8 owns the placeholder
wording; this ticket fixes that the page survives as a rewrite.

**The blog, `/rss.xml` and the old per-item URLs: dropped.** §10 and 09 Q8.

**The agent corpus generator: ported by ticket 12, not by this ticket.** The old
`packages/llms` is a generator (16,867 bytes of `src`), and its output is build
output (research 01 §6.1). This ticket's input to ticket 12 is the
single-register model in §5 and the drift gate in §8.

### 3. The per-item skeleton

**Plasma's skeleton is adopted exactly**, because it is uniform across 58 of 58
component pages and its ceiling is the point (research 04 §2, §9):

```
H1                     the item name (catalogue `name`)
one-sentence lede      the catalogue `description`
## Overview            hand-written MDX
## Usage               the import line + <ComponentDemo slug> (live preview + copyable source)
## Guidelines          hand-written MDX
### When to use        named contexts, not restated description
### When not to use    each misuse names the alternative
### Best practices     the consequential decision, hierarchy, layout and behaviour guidance
### Content guidelines optional: present only when the item owns user-facing copy
API reference          generated (ticket 10 §4 slot 5)
```

This maps onto ticket 10 §4's template one-for-one: slot 1 is the header, slot 2
is `## Overview`, slot 3 is `## Usage`, slot 4 is `## Guidelines`, slot 5 is the
generated API reference, slot 6 is the shell. The H1, the Overview, the
Guidelines and the optional Content guidelines are hand-written; the API table,
the demo and the header's badges are generated.

**The controls rule is kept and restated for our architecture.** The reported
default is the **component's** default, never the demo's value. Plasma's rule:
"Do not infer a component default from the representative story's `args`"
(research 04 §3). Under our architecture there is no Storybook `args` at all: the
API table is generated from the emitted `.d.ts` (ticket 12's extractor), so a
default is read from JSDoc `@defaultValue` on the declaration or reported as `—`,
never inferred from the demo. The demo is free to pass different initial values.
A build check (§8) asserts that no generated API table cell can trace to a demo
file.

The other plasma rules adopted with the skeleton: the TOC shows H2 only, so the
Guidelines subsections are H3 (research 04 §2); variants and states belong in
the live demo, not a bullet list ("Keep variants, states, accessibility
inventories, props, and code samples out when Usage already communicates them");
`When not to use` must name an alternative.

### 4. The authoring cost, as a number

**The planning number is 1.7 KB of prose per item.** That is plasma's measured
per-component page (research 04 §2, §8: 1,144 to 1,846 bytes). The
single-register model in §5 absorbs into `Guidelines` the guidance plasma keeps
only in its agent register, so a page plans at **1.7 KB and caps at 2.5 KB**;
budget the midpoint, **2 KB**. At 40 items that is about 80 KB of new prose,
which is roughly 5.5 times the old site's entire 14,727-byte authored corpus.

**Items per agent session.** One agent authoring session produces **5 item
pages** against the skeleton, the catalogue and the emitted declarations. A
Block or Page page carries a generated composition table and a larger demo
instead of a props table, so an all-Blocks/Pages batch plans at **4 per
session**. Every session ends at a human review pass, and a page is done only
when its MDX, its demo and its generated mirror all pass the §8 gate. The plan
works at every roster size ticket 19 might name:

| v1 roster (items) | Authoring sessions | Notes |
| ---: | ---: | --- |
| 20 | 4 | a small, fully documented catalogue |
| 30 | 6 | |
| 40 | 8 | |
| 50 | 10 | |
| 60 | 12 | the plasma-scale ceiling |

**The launch policy: complete page per item, roster-bounded.** Every shipped
item has `Overview` and all three required `Guidelines` subsections. V1 launches
with the items whose pages are complete and defers the rest to v1.1; it does not
launch a large thinly documented catalogue. This is the decision the destination
turns on, so it is stated as a rule rather than a preference:

- The roster number ticket 19 names is the number of **documented** items. If
  ticket 19 names 60 and the authoring capacity before the cutover is 40, v1
  ships 40 and the other 20 are `.scratch`-tracked v1.1 work.
- An item is added to `catalog.ts` only when its `prose` file passes the gate.
  The catalogue is the single list (09 §3), so the gate is the roster's gate.
- The reverse never happens: a page is not thinned to admit an item, and a
  generated stub is never counted as a page.

This is deliberate against the alternative ("forty items thinly"): the old site
already proved what 43 thin pages look like, and a half-documented catalogue is
a worse signal than a smaller one. It also makes ticket 07's "an item with no
prose is a valid page" a fallback for deprecated or agent-only items, not a
launch strategy.

### 5. The authoring source of truth: one written register, one generated

**Deviation from plasma, stated deliberately.** Plasma keeps two hand-written
registers and enforces their separation with validators. This repository keeps
**one hand-written per-item page**, the MDX at plasma's skeleton and depth, and
**derives the agent layer from it** plus the emitted declarations and the demo
source. That is the old repository's model, kept.

The rationale is the measured asymmetry and the missing gate:

- Plasma's agent specs are **3 to 6 times larger** than its human pages
  (`Button` 5,335 vs 1,712; `Table` 11,544 vs 1,846; research 04 §8). A second
  hand-written register is not the cheap option it looks like; it is the larger
  half of the work.
- Plasma enforces the human layer's voice rules with **no build gate at all**
  (research 04 §8, "Weakness of the arrangement": `fmt:check`, the Storybook
  build and oxlint cannot detect a `MUST`, an em dash or a copied prop
  inventory). The separation is specified, not enforced, and the empirical scan
  shows drift.
- A second hand-written register **duplicates the guidance** and drifts from the
  page it restates, and the drift is invisible because nothing compares them.

So the single source is the MDX page. The generator (ticket 12) produces the
per-item agent spec from four inputs:

1. the MDX prose, with MDX mechanics stripped (`Overview` and the `Guidelines`
   subsections become the agent's problem/guidance prose);
2. the emitted `.d.ts`, through ticket 12's compiler-API-free extractor, as the
   `## Props` definition list in plasma's machine format (`` **`prop`** `Type` ·
   optional · default: `X` — description``, no blank lines);
3. the demo `.tsx` source, verbatim;
4. the catalogue `description`.

The `## Props` heading and definition-list format are kept **because the MCP
server's regex keys on the literal `## Props`** (research 04 §3). The format is
load-bearing, so it is generated into a fixed shape and checked in §8, rather
than hand-approximated.

**What is lost, named.** Plasma's agent register carries sections its human page
deliberately compresses away (`Accessibility expectations`, `Interaction
notes`, `States`, `Variants`). Because one page must feed both audiences, this
page does **not** apply plasma's compression rule wholesale: accessibility and
interaction guidance that a consumer needs goes into `Best practices` or a
named alternative, and the props and usage stay generated. That is the source of
the 1.7 to 2.5 KB budget spread in §4. `Accessibility expectations` is not a
separate hand-written section; where it exists it is part of `Best practices`.

**The agent register is enforced by a build check on its generated output,**
never by a human checklist: the `## Props` round-trip (test extraction against a
fixture), the section skeleton, the description non-emptiness, and the mirror
coverage (§8). If the two-register model is ever reinstated, the added cost must
be stated then, and the human register must gain a build gate it currently lacks
in plasma; neither is chosen here.

### 6. Who writes it

**An agent authors, a human reviews.** The agent authors against the per-item
skeleton and the checked catalogue; it reads the component source, the emitted
`.d.ts`, the demo and the catalogue entry before writing. A human reviews one
pull request per authoring session and owns the merge. This matches ticket 14's
pull-request governance and ticket 15's gate list.

The authoring instructions live in **`.opencode/skills/`**, which is the
directory this repository already uses (it holds `writing-for-agents`,
`grilling`, `domain-modeling`; `.github/skills/` does not exist here, and the old
repository's location is not revived). Three skills, each with one invocation
branch and an explicit completion criterion:

| Skill | Fires on | Enforces |
| --- | --- | --- |
| `prism-item-docs` | "document `Button`", "write the `[Block]` page", "add an item to the docs" | the §3 skeleton exactly; the import line and `<ComponentDemo>` in `Usage`; the controls rule (component default, never the demo's); human-layer voice (active, plain, sentence case, "you", **no** `MUST`/`SHOULD`/`MAY`, **no** em or en dashes); the catalogue `description` as the lede; the ported demo passes the demo contract. Done when the MDX, the demo and the generated mirror pass the §8 gate |
| `prism-guide-docs` | "write the Quickstart", "update Theming", "add a Foundations page" | the guide sets and section moves in §11; Foundations pages as live cascade readers (title + description as props, a preview column, no hardcoded token value); the same human-layer voice rules |
| `prism-content-guidelines` | "edit Voice", "update the avoid list", "add a product term" | the `/content` page set (§12); the `RULE:` prefix on every rule; the avoid-terms table shape; the RFC 2119 register (§12); every glossary term sourced from ticket 14's `CONTEXT.md`. Done when `check-content-rules.mjs` is green |

`AGENTS.md` gains a context pointer to each skill (ticket 14 Q5 owns that file's
final shape). The shared item skeleton lives once, in
`prism-item-docs/references/page-skeleton.md`, and the other skills point at it
rather than restating it, per `writing-for-agents`' single-source rule. The
skills are instructions; the pages they produce are documentation.

**The human is the author of record for three pages**, because they are
judgement about NaniSoft's own identity rather than extraction from the code:
`/content/voice`, `/content/audience` and `/docs/brand`. An agent drafts; the
maintainer owns. Everything else is agent-authored with review.

### 7. What is generated and what is written

The split is fixed here so no later ticket re-invents it. **Written by hand:**
every MDX page (the six guides, the eight Foundations pages, the six Content
pages, the per-item `prose` files), the site's shell and chrome, the landing,
the `/themes` page, the demos, the `catalog.ts` module and the token manifests.
**Generated:** everything below, all from those inputs.

| Artifact | Path | Source of truth | Failure mode if the source changes without a rebuild |
| --- | --- | --- | --- |
| API tables | in-page, from `packages/ui/dist/**/*.d.ts` | emitted declarations (05, 12) | page shows a stale prop, type or default; a renamed prop is still listed; the mirror check fires |
| Demos registry | `apps/site/src/generated/demos.ts` | `apps/site/src/demos/*.tsx` (10 §5) | a page's `<ComponentDemo slug>` resolves to a missing or old demo; the demo-registry check fails |
| Catalogue navigation and section indices | `apps/site/src/lib/catalogue-source.ts` + the merged loader tree | `packages/ui/src/catalog.ts` (09 §3) | a nav entry is missing, stale or duplicated; the coverage gate fails |
| Per-item Markdown mirror | `packages/llms/dist/md/**` copied to `out/md/**` | MDX prose + `.d.ts` + demo source | the copied `.md` 404s or serves stale prose; the `llms.txt` link and mirror-completeness checks fail |
| Site search index | `out/api/search` | `source` + `prose` page trees (10 §7) | search returns stale or missing pages; the 300 KiB gzip budget check fails or the index lies |
| `llms.txt`, `llms-full.txt`, `prism-skill.md` | `packages/llms/dist/` copied to `out/` | catalogue + mirror + declarations (12) | the agent surface advertises a page that does not exist; the link check fails |
| `PrismDocsStore` (`data.json`) | bundled into the Worker, never copied (10 §9) | catalogue + mirror | the MCP server serves stale item metadata or props; the store type check throws |
| Demo `client` flag | the registry's measured field | demo source (10 §5) | the site's client-boundary claim is wrong; the analyzer check fails |

**The general rule that makes the table safe:** `dist/` is never committed
(ticket 12 confirms build-fresh for the corpus; ticket 10's `prebuild` regenerates
the catalogue and demo registries), so a source change with no rebuild cannot be
merged unnoticed: the build that regenerates also runs the gates in §8. The
"failure mode" column is what each gate catches when a rebuild is skipped or a
generator changes shape.

### 8. The drift gate

**The seven invariants are kept and re-derived**, and the build-twice byte
comparison is kept explicitly. Ticket 12 owns the corpus package's
implementation; this ticket fixes the set that the documentation content
depends on:

1. **Coverage.** Every catalogue item has a doc page (its `prose` file or, if
   deliberately absent, a recorded reason) and a `.md` mirror. This is the
   cross-artifact coverage gate.
2. **Demo self-contained contract.** Every `apps/site/src/demos/*.tsx` imports
   only `@nanisoft/prism-ui/*` or `react`, and has a default export.
3. **Cross-references resolve.** Every demo import is a public runtime export
   (catalogue gap 7 in 09 §3); every `<ComponentDemo slug>` resolves to a
   registry key.
4. **Descriptions.** Every catalogue item has a non-empty `description` and
   every page a non-empty `title`; the frontmatter belongs to the catalogue, not
   to a hand-copied duplicate.
5. **Store type.** `data.json` parses through the runtime guard and assigns to
   `PrismDocsStore` in a throwaway `tsc` project (09 Q5, 12).
6. **Link and mirror completeness.** Every `llms.txt` link resolves; every item,
   guide, foundation and content page has a mirror file.
7. **Determinism.** Emit into two directories, walk both trees, byte-compare
   every file. **Kept, not dropped.** It is what makes an artifact safe to diff
   in review, and it is the only check that catches a generator whose output
   changes shape between runs.

**The renamed-registry-file failure, and the check that now catches it.** The
old defect was an item referencing a renamed file: the docs site kept rendering
because its page body was generated, while the install path 404'd. Under the
library model the install path is an import (Q9) and the file list is the
published package, so the defect splits into two, each with a named check:

- **A renamed source file the catalogue still points at.** Caught by
  `buildCatalog()` gap 6, "a `source` that does not resolve on disk" (09 §3), and
  by invariant 1's coverage gate, which asserts every catalogue item has every
  artifact rather than only that the page rendered. This is **the check that
  would have caught it**: coverage, not rendering. A page that renders while its
  source, demo or mirror is missing is exactly the state coverage forbids.
- **A file the package promised but did not emit.** Caught by `publint` and the
  tarball verifier (ticket 16) plus `buildCatalog()` gap 7 (an `exports` name not
  in the package's public runtime exports).

**Handed to ticket 15** (it owns the quality-gate ticket, and this ticket only
names the doc-side checks): the coverage gate, the `## Props` round-trip
fixture, the byte comparison, and the demo `client`-flag measurement. Ticket 15
also decides whether the checks fail the build or report; the recommendation
here is **fail the build** for all seven, because a stale doc is a lie and the
old `check.mjs` already fails on every one of them.

### 9. The install command in the docs

Under the library model the command is an **import plus a JSX snippet**, never
`shadcn add`. Each per-item page's `## Usage` shows exactly two things:

```tsx
import { Button } from '@nanisoft/prism-ui/components/button'

<Button variant="primary">Create release</Button>
```

The import line uses ticket 07 §5's subpath shape:
`@nanisoft/prism-ui/components/<slug>`, `@nanisoft/prism-ui/blocks/<slug>`,
`@nanisoft/prism-ui/pages/<slug>`. Compound parts stay inside their module
(`@nanisoft/prism-ui/components/card` exports `Card`, `CardHeader`,
`CardTitle`, `CardContent`, `CardFooter`; there is no `card-header` subpath).
The root-layout import and the optional provider appear once, in Quickstart and
in `prism-skill.md`, not on every item page.

The copy control's source **is** the demo file (ticket 10 §5: one `.tsx` is the
source for the preview, the copy control and the corpus), so the copied snippet
and the rendered import cannot disagree. A demo import must be a public runtime
export (invariant 3).

**The internal registry artifact appears nowhere user-facing.** No per-item
page, guide, README, `llms.txt` or MCP tool mentions `packages/ui/registry.json`,
`packages/ui/public/r/**`, `npx shadcn add`, a registry URL or `components.json`.
The registry is an integrity artifact (05, 07, 09) and nothing serves it (10
§9). Ticket 15 asserts `packages/ui/public/r` never reaches `out/`.

### 10. The blog

**It does not exist. Do not ship it. No RSS.** No route, no navigation item, no
sitemap entry, no corpus entry, no `MD_SECTIONS` entry, no redirect, and
`/rss.xml` is dropped with it. The inventory found a 0-byte `.gitkeep`, an empty
live page and a zero-item feed (research 01 §4); an empty section is a worse
signal than no section, and ticket 10 §8 already decided the same. This ticket
confirms it and adds the content rule: if a post is ever written it is a fresh
effort with an owning ticket, not a revival of this section. Ticket 09 Q8
already dropped the URLs without redirect.

### 11. The guides

Six guides, **all six rewritten**, each because it describes the old
architecture. No guide is merged into another and none is dropped: each has a
distinct audience and task, and the two that looked redundant
(Architecture/Composition) differ exactly as the ticket suspected, describing
intent versus use.

| Guide | Fate | What changes |
| --- | --- | --- |
| Quickstart | rewrite | new install: `import '@nanisoft/prism-ui/styles.css'`, optional `PrismProvider` + `PrismThemeScript`, first component, first block. The old "Install Prism" and "Load the owned stylesheet" sections are superseded by 07's one-stylesheet lane |
| Theming | rewrite | `data-pack` + `.dark`, the six pack ids (neutral `default`, Blush, Mint, Lavender, Sky, Peach), pack and mode as two axes, `usePrismTheme`, flash-free switching. `Create a theme` and `Semantic overrides` are dropped: no `createPrismTheme`, no per-key merge, no override path (07 §3, §4). `What not to theme` becomes "there is no consumer theming; request changes upstream" |
| Architecture | rewrite | keep the intent: one source of truth, the package boundary, Component -> Block -> Page, the source-to-corpus pipeline, the styling contract. Update every implementation fact |
| Composition | rewrite | keep the intent: start with a Component, promote repetition into a Block, compose a Page last, the composition rules. `Explore the catalog` is dropped (the search index replaces the old client-side filter) |
| Agent workflow | rewrite | the ported agent surface: `prism-skill.md`, the MCP tool list (ticket 13), the import contract, the truth rules. The old eight-tool list and antd MCP references are replaced entirely |
| Brand policy | rewrite | 14 Q8 owns the wording; preserve the licence mechanics, the may/may-not structure and the unregistered-marks reasoning, remove the `What is ours` identifiers and the `createPrismTheme()` status line |

**Section-level moves, stated so nothing is silently lost.** The old Quickstart's
`For agents` section moves into Agent workflow. The old Architecture's
`Source-to-corpus pipeline` section moves into Agent workflow (the corpus is the
agent surface now), and Architecture keeps a one-paragraph summary with a link.
The old Composition's `Explore the catalog` section is dropped. No whole guide
is merged or dropped.

### 12. The Content section

The section ships, adapted from plasma's `@content`, at ticket 09's
`/content/<slug>` route. It is **organisational writing practice, not
design-system documentation** (research 04 §5): five of its six pages document
how NaniSoft writes product copy, and only `Glossary` documents the design
system's own vocabulary. Six pages plus the index:

| Page | Slug | Content | NaniSoft-specific or inherited? |
| --- | --- | --- | --- |
| About content | `/content/about-content` | what "content" means here, the scope of the section. Human-only, like plasma's (no agent mirror) | **NaniSoft-specific** |
| Audience | `/content/audience` | the user personas the product copy serves | **NaniSoft-specific** (personas) |
| Voice | `/content/voice` | fixed voice qualities plus a tone-by-context matrix | **NaniSoft-specific** (the voice is ours) |
| Writing mechanics | `/content/writing-mechanics` | capitalisation, punctuation, grammar, syntax and structure rules | **inherited in shape, rewritten** to NaniSoft conventions (sentence case, plain language) |
| Product vocabulary | `/content/product-vocabulary` | sentence/title-case terms and the avoid-terms table | **NaniSoft-specific terms**; the avoid-table and `RULE:` convention are inherited |
| Glossary | `/content/glossary` | the design system's own vocabulary | **NaniSoft-specific**; the terms are owned by ticket 14's `CONTEXT.md` and this page only hosts them (09 §6) |

**The glossary boundary case is settled here, not deferred.** Five of the six
pages are organisational; `Glossary` is the one design-system page. It is
`/content/glossary` because ticket 09 put it there, and the terms come from
ticket 14; this ticket does not define a term.

**An owner and a checking story, because the section is otherwise unowned.**
The owner is the maintainer, named in `CODEOWNERS` and in `AGENTS.md` (ticket
14 Q6, Q5). The checking story has two registers, and this is the second
deliberate deviation:

- **The `/content` pages are the exception to the item-page voice rule.** Their
  subject is a rule the reader must follow, so they carry the machine-greppable
  `RULE:` prefix on every rule and use **RFC 2119** keywords, exactly as plasma's
  agent register does (research 04 §5). Item pages forbid those keywords; content
  pages require them. On every other page the human-layer voice applies
  unchanged.
- **`check-content-rules.mjs`** (ticket 15 owns it, this ticket specifies it)
  asserts: the avoid-terms table parses and is well-formed; a scan of gated
  product copy finds no avoid-term; every rule line carries the `RULE:` prefix;
  and every glossary term exists in `CONTEXT.md`. It fails the build.
- **The dash gate is extended.** `scripts/check-dashes.mjs`'s `ROOTS`/`GATED`
  lists gain `apps/site/content/**` and the generated agent mirror, so the
  Content pages and the item pages are held to the same em-dash ban. Ticket 15
  Q7 also closes the recorded gap where root documentation was in neither list.
- **The agent mirror is generated**, like the item mirror (§5): the `/content`
  pages are the human source, and the corpus projection is derived, so the
  section cannot drift from what agents read.

The `RULE:` convention and the avoid-terms table are the two inherited
mechanics worth keeping; Coveo's product names, features, personas and
vocabulary are replaced throughout, exactly as ticket 09 §6 requires.

### Consistency and hand-offs

- **Ticket 09:** every route in §1 uses 09's shape; `/content/<slug>` is
  instantiated; the Foundation/Content sections are hand-written doc pages, not
  catalogue kinds; the catalogue descriptions in §2 are the entries' `description`
  field.
- **Ticket 10:** the skeleton in §3 fills ticket 10 §4's slots; the generated
  artifacts in §7 are ticket 10's loader, registry, mirror, search and copy
  mechanisms; the blog is confirmed dropped; the shell and the landing are
  site-owned.
- **Ticket 12:** §5 fixes the single-register model and the four derivation
  inputs; §8 fixes the invariant set and keeps the byte comparison; §7 fixes the
  mirror as generated.
- **Ticket 13:** §11 hands Agent workflow its rewritten content, sourced from
  ticket 13's tool list.
- **Ticket 14:** the glossary page hosts 14's vocabulary; 14 owns the brand
  rewrite's final wording, `CODEOWNERS`, `AGENTS.md` and `CONTRIBUTING.md`.
- **Ticket 15:** §8 and §12 name the checks it implements: the coverage gate, the
  `## Props` round-trip, the byte comparison, the demo client-flag measurement,
  `check-content-rules.mjs`, and the dash-gate extension.
- **Ticket 19:** §4's session table is parameterised by the roster number 19
  names; the launch policy is that the number is the documented-item count.

### Postscript: reconciled with ticket 19

Ticket 19 resolved alongside this one and fixed the v1 roster at **28 components,
10 blocks and 4 pages, 42 catalogue items**. Instantiating §4 at that number:
28 components at 5 per session is 6 sessions, 10 blocks at 4 per session is 3,
and 4 pages at 4 per session is 1, so the plan is **10 authoring sessions** with
10 human review passes. The launch policy reads: v1 documents all 42 items, or
it ships the subset whose pages are complete and defers the rest to v1.1.
