---
'@nanisoft/prism-ui': minor
'@nanisoft/prism-llms': minor
---

Fourteen items, four catalogue gates, and a Block that publishes its interface

**Fourteen items ship.** Three Components (`Prose`, `FactList`, `ProductSwitcher`),
nine Blocks (`ProcessRail01`, `StatusLedger01`, `ProductGrid01`, `StackGrid01`,
`LogoStrip01`, `NoteGrid01`, `InstrumentPanel01`, `SiteHeader`, `SiteFooter`) and two
Pages (`NotFoundPage`, `BlogPostPage`). Every one of them earns its place by the
growth rule rather than by taste: a marketing Block when at least three of the four
sites compose that section today, a Component when it has one job no existing
Component can express. The evidence is in the ticket and in each item's own
JSDoc, which names the sites and the line numbers.

**The three contested shapes are settled as specified, and the specifications
held.** A process rail admits four steps and refuses five, in the type: `steps` is
a tuple union, so a five-element array is a compile error and not a fifth column. A
status ledger has four tiers rather than five, and the words for a tier are the
caller's: the four sites between them use eight words for those four states
(`live`, `available` and `complete` are one; `approved`, `specified` and `designed`
are one; then `planned`; then `direction`), and the vocabulary is what `statusLabel`
is for. A product row's mark is two parts because a filled dot fails contrast on a
light card, so the mark is `ProductMark`: a hairline ring in `brand-ink` around a
core in the product's own `primary` fill, with the name in the brand ink beside it.

**Four gates the catalogue's own rules depend on now exist and are wired into
`check` and, because they read only `src/`, into `build`.** `check-item-docs`
holds AGENTS.md's claim that a documentation comment is the only path from an Item
to its published interface. `check-block-copy` holds DESIGN.md's claim that a
Block ships no copy and no sample data. `check-item-category` holds CONTEXT.md's
closed set of seven Categories and the sentence that a Block and a Page have none.
`check-block-imports` holds the claim that a Block fetches nothing and a Page
imports no router and no data client. Each resolves its roots from its own
location, fails a root that resolves to nothing, prints its coverage and every
exclusion on every run, has no report-only mode, and is proved red by a fixture
before it is proved green.

**Two of those four gates were red on the tree they were written against, and both
findings were real.** `check-item-docs` found seven exported functions whose
documentation comment was not attached to the declaration: `CardHeader`,
`CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `SectionHeading` and
`Hero01`. A comment three functions above a declaration does not reach the emitted
`.d.ts`, so those seven were absent from the corpus. `check-block-copy` found
`pricing-01` rendering the word "Popular" on a featured plan that passed no badge:
a hardcoded claim every consumer of the Block inherited, published by the corpus as
part of the Block's own documentation. The fallback is gone; a featured plan with
no badge now renders no badge.

**Five additive fields on four shipped items**, each with three of the four
consumers passing a value the item could not take, counted per consumer with a
file and a line and never per string. `SectionHeading.index`, for the mono ordinal
all four sites render above every section head (www `Landing.tsx:49`, atlas
`landing.tsx:48`, nexus `Landing.tsx:38`, alphalens `Landing.tsx:66`).
`Cta01.secondaryAction`, for the pair of actions all four closing bands render
(www `Landing.tsx:186`, atlas `landing.tsx:243`, nexus `Landing.tsx:221`,
alphalens `Landing.tsx:285`). `Cta01.note`, for the footnote three of the four
render under it (atlas `landing.tsx:250`, nexus `Landing.tsx:228`, alphalens
`Landing.tsx:292`). `FeatureGrid01.numbered`, for the ordinal all four render on
every card (www `Landing.tsx:166`, atlas `landing.tsx:116`, nexus `Landing.tsx:132`,
alphalens `Landing.tsx:142`). `Hero01.align`, for the left-aligned hero three of
the four compose (atlas `landing.tsx:69`, nexus `Landing.tsx:63`, alphalens
`Landing.tsx:87`). All five are additive: nothing changed shape and nothing was
removed.

**A Block and a Page publish both an interface section and a composition section.**
`packages/llms` read the extractor's output for a Block and threw the interface half
away, so the tool told an agent a Block had no own props. The extractor reads a
named props type off an emitted declaration whether that declaration belongs to a
Component or to a Block, so both sections are now built and both are assembled into
the mirror file, `llms-full.txt` and the Store's `doc`.

The Store now carries both fields for every kind, and `get_item_props` prints
both when it has both. The sentence "a Block has no own props" is gone from the
tool as well as from the published document. It was the one place the two
sections were still exclusive, because that tool branched on `item.props` and
fell back to the composition section, so a Block was answered with its
composition and a denial of the interface it publishes. The test asserts the
sentence's absence, so a refactor that restores it fails even if the composition
is still printed, and a second test covers the one-present case so the
both-present branch cannot swallow it.

**Four accessible names became required props** on `SiteHeader`, `LogoStrip01`,
`NotFoundPage` and `BlogPostPage`, and a Block that ships no copy ships no
reader-facing copy either. `navLabel`, `productsLabel`, `label`, `linksLabel` and
`trailLabel` are words a screen reader reads out, and no Block should be choosing
them for a consumer whose site calls its own landmarks something else. This is the
one breaking change in the release, and it is on four new Blocks and two new Pages
plus one new required prop on `SiteHeader`, all of which are new in the same
release, so no existing call site changes.

**`ProductSwitcher.label` has no default** for the same reason: a consumer whose set
is not a set of products should pass its own word rather than accept a claim about
what the set is.
