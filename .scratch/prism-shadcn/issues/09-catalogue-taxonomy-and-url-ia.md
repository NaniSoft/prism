---
Labels: wayfinder:grilling
Type: grilling
Status: resolved
Blocked by: 05
---

# Catalogue taxonomy, grouping, and URL IA

## Question

The old catalogue organised itself as components to blocks to pages, and that
taxonomy is inherited because the inherited content is written that way. How
items are grouped inside components, and what the URLs are, is not inherited
and is decided here.

Settle:

1. **The unit names.** The old glossary held that a component is a focused
   accessible export, a block is a pre-composed product pattern, and a page is
   a complete structural composition, and it explicitly refused the words
   pass-through and wrapper. This repository currently says primitive, and its
   `DESIGN.md` speaks of three primitives and one shared container pair. Decide
   the three canonical unit names, note that the glossary is settled properly
   in the governance ticket, and make sure whatever is decided here is
   consistent with it.
2. **Grouping inside components.** plasma groups its components into Call to
   action, Forms and inputs, Feedback, Layout, Data display, Typography and
   Miscellaneous. The old Prism site had no such grouping, only a flat
   component list. Decide whether to adopt plasma's category taxonomy, a
   smaller one, or none, and state the rule for adding an item to a category so
   the grouping cannot become a dumping ground.
3. **The catalogue as one source.** The old repository held a checked
   `catalog.ts` in the component package that was the single source for
   navigation, docs generation, the LLM corpus and MCP metadata, and it had a
   `buildCatalog()` that throws on gaps. Decide whether that is the model, where
   the catalogue file lives, what an entry contains, and what makes it
   "checked" rather than merely listed. This file is load-bearing for the
   docs, the corpus and the MCP, so three later tickets depend on the answer.
4. **URL shape.** The old site used flat URLs: `/docs`, `/components`,
   `/blocks`, `/pages`, `/blog`, plus per-item paths and `/themes`. Decide the
   new shape, whether categories appear in the URL or only in navigation,
   whether per-item pages are `/components/button` or `/docs/components/button`,
   and how a block or page item is distinguished from a component in a URL
   given they may share a name.
5. **The `kind` question.** The old corpus had `kind` widened to `string` at one
   point to work around a JSON import widening, and the item kinds were
   component, block and page. Decide the kind vocabulary and whether it is a
   closed union, given the agent surface validates it at runtime.
6. **Foundations and content as sections.** plasma's index has `@foundation`
   and `@content` groups alongside `@components`, and the old Prism site had
   six guides and a themes page but no equivalent grouping. Decide whether the
   new information architecture has a foundations section, a content-guideline
   section, or both, and what belongs in each. This is a structural question
   only; the content itself is decided in the documentation content plan.
7. **What the `/` route is.** The old landing page was a designed specimen
   page, not an index. This repository's `/` composes live registry blocks.
   Decide what the new landing route is and whether it is a docs concern or a
   marketing concern, since that determines which package it lives in.
8. **Redirects.** The old site is public and its URLs are indexed. Decide
   whether the new site preserves any old URL, and if so what maps to what. The
   pack identifiers also change, so a theme deep link is affected too.

Read `apps/docs/src/app/` in full, `apps/docs/src/lib/catalog.ts`, and the old
repository's `packages/ui/src/catalog.ts` and `apps/site` route files for
comparison. Consult `domain-modeling` for the unit names.

## Answer

All eight are decided. Where a downstream ticket owns a sub-question, that is
named rather than decided twice. The decisions below are the strongest option in
each case; the two places where they go beyond the recommended shape (a `/content`
prefix, and keeping the token browser inside Foundations) are justified in place.

### 1. The unit names: Component, Block, Page. "Primitive" is retired.

The three canonical units are **Component**, **Block** and **Page**, inherited
from the content and already used by the map and by ticket 05's exports map. The
definitions are the old glossary's, kept because they are the vocabulary the
inherited content is written in:

- **Component** - a focused, accessible, product-agnostic export with one job.
  Capitalised as a domain term. It always means a catalogue item; a site-chrome
  React component is not a domain Component and is referred to by its name.
- **Block** - a pre-composed, product-agnostic section assembled from components
  that takes its content as props and fetches nothing.
- **Page** - a complete structural composition of blocks and components that
  models a whole screen.

The old glossary explicitly refused the words *pass-through* and *wrapper*, and
that refusal is kept: a component that re-exports Base UI unchanged is still a
Component, not a "wrapper". Two words are added to the avoid list:

- **primitive** is retired as a unit noun. `DESIGN.md` currently uses it for the
  three installable components and separately for the raw token ramps - exactly
  the overload a glossary exists to kill. The raw ramps are **foundation tokens**.
- **layer** is retired as a unit noun, because it already names the token tiers
  (foundation / semantic) and would collide with the composition units.

The full avoid-lists and the final glossary strings are written in ticket 14.
This ticket fixes the three nouns and their meanings; ticket 14 records them and
is the reason they are phrased here as domain terms rather than informal labels.

### 2. Grouping inside components: plasma's seven categories, closed and role-assigned

Adopt plasma's seven categories verbatim, in plasma's order:

**Call to action · Forms and inputs · Feedback · Layout · Data display ·
Typography · Miscellaneous.**

The rules that stop it becoming a dumping ground:

- **Assignment is by the item's primary role** - the job it does for an app -
  never by data type, file path, visual form, or where the implementation
  happens to live. plasma's own filesystem split of Forms and inputs into
  `array/ boolean/ date/ number/ string/` is an implementation artefact and does
  not appear in the taxonomy.
- **The set is closed at seven.** An eighth category is added only when at least
  three components share a role that no existing category names; the new
  category is then promoted out of Miscellaneous. A category that falls below two
  components is merged back.
- **Miscellaneous is the single fallback and is not a role.** An item lands there
  only when no role category fits. It is never a target of choice, and it is
  exempt from the three-item rule precisely because it is not a role.
- **Blocks and pages are not categorised.** They are grouped by kind, and the
  `category` field is `null` for them. The old block categories
  (marketing/application) are dropped: two categories do not justify a
  taxonomy, and reusing a component role taxonomy for a different unit overloads
  it. Block or page grouping, if ever needed, reuses the same three-item rule.

Illustrative only, and not the roster: Button -> Call to action;
TextField/Select/Switch -> Forms and inputs; Alert/Progress/Tooltip -> Feedback;
Tabs/Accordion/Dialog -> Layout; Badge/Card/Table -> Data display;
Text/Heading/Kbd -> Typography.

### 3. The catalogue: one checked module at `packages/ui/src/catalog.ts`

The old model is kept and strengthened. The catalogue is a single authored
TypeScript module, `packages/ui/src/catalog.ts`, exposed as
`@nanisoft/prism-ui/catalog` (the key ticket 05 already reserved for exactly this
purpose). It is the **only** list. Navigation for the item sections, the
generated per-item docs, the LLM corpus (`llms.txt`, the mirror tree, the store)
and the MCP metadata all call `buildCatalog()`; none keeps a second list. The
internal shadcn registry artifact is derived from it, or validated against it,
never the reverse, and the docs app's current `catalog.tsx` becomes a consumer of
it plus previews keyed by slug rather than a parallel source.

An entry carries at minimum:

- `name` - the display name;
- `slug` - the URL segment, explicit and checked, never computed at render time;
- `kind` - the closed union of Q5;
- `category` - one of the seven for a component, `null` for a block or page;
- `description` - one sentence, the `llms.txt` bullet and the page lede;
- `source` - the file the item is defined in;
- `exports` - the public runtime export names the item promises;
- `status` - `'stable' | 'deprecated'`. The old catalogue carried a
  `status: 'stable'` literal on all 43 entries with no way to express
  deprecation; plasma carries deprecation, so a deprecated item can be listed
  without being recommended.

**What makes it "checked" rather than merely listed.** `buildCatalog()` is a pure
function that takes the authored declarations, validates them, and returns the
frozen catalogue. It **throws on any gap**, so a gap fails the build that calls
it. The gaps it throws on:

1. a required field missing or empty;
2. a `kind` outside the union;
3. a component `category` outside the seven;
4. a `slug` that is not unique within its kind;
5. a duplicated `name` within a kind;
6. a `source` that does not resolve on disk;
7. an `exports` name that is not in the package's public runtime exports;
8. a `'deprecated'` item with no note, or a `'stable'` item with a note.

Cross-artifact coverage - every catalogue item has a docs page, every item has a
`.md` mirror, the store round-trips against its type - is a **separate** gate
owned by tickets 11, 12 and 13 that consumes this catalogue. The split is
deliberate: `buildCatalog()` owns catalogue integrity, and those gates own
artifact coverage. Refusing to hand a malformed list to the corpus and the docs
generator is what keeps the later gates honest.

**Scope note.** The single-source rule is about the item catalogue: nothing about
a component, block or page is declared in two places. The guides, foundations and
content pages are documentation pages, declared once in the docs content
collection, and their navigation comes from that collection (ticket 10). The
catalogue does not pretend to own them.

### 4. URL shape: flat and kind-prefixed

```
/                        the marketing landing page (Q7)
/components              section index
/components/<slug>       a component
/blocks                  section index
/blocks/<slug>           a block
/pages                   section index
/pages/<slug>            a page
/docs                    guides index
/docs/<slug>             a guide
/foundations             foundations index
/foundations/<slug>      a foundation page
/content                 content-guidelines index
/content/<slug>          a content-guideline page
/themes                  the theme showcase
```

- **The URL is flat.** One path segment per level; the kind prefix is the only
  structural segment. `/docs/components/button` is rejected: it privileges one
  section and adds a segment that only ever holds one value.
- **Categories never appear in a URL.** They appear in navigation and as a query
  parameter on a section index (`?category=`), never as
  `/components/forms-and-inputs/button`. The current `/blocks?category=` pattern
  survives in shape.
- **The kind prefix disambiguates same-named items.** A component and a block
  both named Card are `/components/card` and `/blocks/card`; nothing collides and
  no suffix scheme is needed.
- **Every section index is an explicit route.** A folder with no index page emits
  no file under static export (ticket 03), so each section that ships gets an
  index page. Whether a section exists at all is driven by its catalogue count.
- **`/content/<slug>` is the one addition to the recommended shape.** Answer 6
  requires a Content section, and a section with no route would be a gap.
  plasma's group is `@content`; `/docs` is already the guides, so `/content` is
  the parallel prefix and `/content/<slug>` follows the same rule as
  `/foundations/<slug>`.
- **A page's Markdown mirror is its canonical URL plus `.md`** (for example
  `/components/button.md`), served by the Worker and not by the static export,
  matching the old site. The serving mechanism is tickets 10 and 12; the URL
  shape is fixed here so ticket 12 does not have to invent a second one.

### 5. The `kind` question: a closed union, validated literally

```ts
export const CATALOG_KINDS = ['component', 'block', 'page'] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];
```

- The values are **singular**. The plural forms (`components`, `blocks`,
  `pages`) are route segments and section labels only, never `kind` values.
- The type lives with the catalogue and is re-exported; the store type is
  declared referencing it type-only, per ticket 05's rule.
- **The runtime guard validates membership literally**, `CATALOG_KINDS.includes(value)`,
  and the array is `satisfies readonly CatalogKind[]` so the runtime list and the
  type cannot drift.
- **The JSON-widening bug is closed at the source.** The authored catalogue is
  `satisfies`-checked TypeScript rather than a JSON import, so a typo fails
  compilation. Where a JSON artifact (the store, `data.json`) is parsed, it is
  parsed through a guard that narrows to `CatalogKind`; `kind` is never widened
  to `string` and never assigned with `as`, and a value outside the three throws.
  This is recorded here so ticket 12's store contract and ticket 13's MCP guard
  inherit one answer instead of two.

### 6. Foundations and content as sections: both

**Foundations** (`/foundations`) - one page per token family, built as live
readers of the emitted cascade in plasma's shape (title and one-sentence
description as props, the body a rendered table with a preview column):
**Colors, Iconography, Radii, Shadows, Spacings, Typography, Motion, Variables.**
Two deliberate departures from plasma's list:

- **Motion is added**, because this system has motion tokens that reach CSS and
  plasma has none.
- **Variables is kept.** The recommendation's parenthetical omitted it, but
  research 04 section 9 is explicit that "a token browser is not a colour page"
  and plasma needed both a token-page tier and a token-inventory page. This
  repository already has that token browser at `/tokens`, so it maps onto
  `/foundations/variables` rather than being dropped.

`/themes` does **not** live in Foundations. It stays a top-level route (Q4),
because it is a showcase of the pack-by-mode axis rather than a token family.
The pack and mode vocabulary itself is tickets 07, 08 and 14's, not this one's.

**Content** (`/content`) - a lighter adaptation of plasma's `@content`, carrying
writing guidance: voice, audience, writing mechanics, product vocabulary, and a
Prism glossary. Two scoping rules:

- It is **writing guidance, not design-system documentation.** The one page that
  is design-system vocabulary is the glossary page, and ticket 14 owns that
  vocabulary; this section only hosts the page.
- It is **adapted, not copied.** plasma's content names Coveo products and
  features throughout. The Prism version keeps the shape (the page set, the
  machine-greppable `RULE:` convention, the avoid-terms table) and replaces the
  product content. The user explicitly asked for "content as per coveo", so the
  section ships; the authoring of it is a content problem, not an IA problem.

The catalogue groups proper are **Components, Blocks, Pages.** Foundations and
Content are sections, not catalogue kinds: their pages have no `kind`, are not
installable, and are not in the corpus as items. They are hand-written doc pages.

### 7. The `/` route: a marketing landing page in the site app

`/` is a **marketing landing page composed from live blocks**, owned by the
**site app** (`apps/site`). It is:

- **not a catalogue item** - no `kind`, no entry, no per-item page;
- **not a docs page** - absent from the docs sidebar and from the corpus;
- **not in the published package** - it lives in the site and is never installed
  by a consumer.

It renders blocks from `@nanisoft/prism-ui` live, with all copy at the call site,
because blocks take their content as props. That is exactly what the current
`apps/docs/src/app/page.tsx` already does, and it is kept. The distinction from a
catalogue **Page** is what settles the package question: a catalogue Page is an
installable composition demo - a product-agnostic screen model - while the
landing is this site's own page and would be meaningless installed in a consumer's
product. Ticket 10 owns the landing's structure and its prose.

### 8. Redirects: no slug-level redirects; keep only matching top-level routes

Clean break, so:

- **Preserved, because the path already matches the new shape:** `/docs`,
  `/components`, `/blocks`, `/pages`, `/themes`. These need no redirect; they
  continue to serve the new section index at the same path.
- **Not preserved:** every old per-item URL
  (`/components/<old-slug>`, `/blocks/<old-slug>`, `/pages/<old-slug>`,
  `/docs/<old-guide-slug>`) and every per-theme deep link. No slug-level redirect
  table is authored. The v1 roster and the guide set both change, and a table
  mapping identifiers that no longer exist is maintenance with no reader; a 404
  is the honest signal for a break we have already declared with a major bump.
- **`/blog` and `/rss.xml` are dropped with no redirect.** There was never a
  post, so a redirect would point at a page about something else. Tickets 10 and
  11 confirm the blog's removal; if either ships a blog instead, it owns the
  blog's URLs.
- **Theme deep links are therefore not preserved, and that is recorded as a
  consequence rather than an oversight.** `/themes` survives; `/themes#<old-pack>`
  and the old `/md/theme/<old-pack>-<mode>.md` addresses do not, because the pack
  identifiers change.

### Handed to other tickets

- The block and page runtime contracts (what a block may fetch, whether a page is
  a component or a recipe): **ticket 07**, question 8.
- The pack-versus-theme vocabulary and the full glossary including this ticket's
  three nouns: **ticket 14**, question 3 and question 9.
- The route tree, the docs shell, the demo block, the blog's fate and the search
  UI: **ticket 10**.
- The content of the Content section and of the Foundations pages: **ticket 11**
  (see the recommendation in the report).
- The store type, the `data.json` shape and the per-item corpus format:
  **ticket 12**.
- The MCP tool list and its runtime guard over `kind`: **ticket 13**.
