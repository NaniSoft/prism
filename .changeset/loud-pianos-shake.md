---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
---

A page `h1` is now visibly larger than the `h2` sections under it

A page `h1` rendered at 1.875rem and every section heading under it at 1.5rem, so
the two were one fifth apart and the page had no top to its hierarchy. The fix is
in the type scale rather than in the Component, because the scale stopped at `4xl`
and there was no step for a page's own claim to take.

**Two steps are authored, and they are the two widest gaps in the group.**
`5xl` is 3rem and `6xl` is 3.75rem, both at a line-height of 1. Every other step
in the `text` group is a whole multiple of 0.125rem and these two are too;
`4xl` to `5xl` is four thirds, the first gap in the group wider than any gap it
already had, and `5xl` to `6xl` is five fourths. They are authored as a pair
rather than as one step because every rung of the heading ladder is a pair, a base
step and one step up at `sm`, so a single step above `4xl` would have made the
page heading the one heading in the system that does not grow at a width.

Both steps reach CSS and the published pack contract the way every other authored
step does, so `text-5xl` and `text-6xl` are utilities a consumer can compose, and
neither is a value a consumer has to write.

**The heading ladder now descends from the new ceiling, one authored step per
level, and every level holds a step of its own.** There are exactly six authored
steps at or above Body, so the table lands on the floor with a distinct step at
every rung, where before `h4` through `h6` shared one. `h1` is at `5xl`, rising to
`6xl` at `sm`; `h2` is at `4xl`, rising to `5xl`; and the table descends to `lg` at
`h6`, which is the step Body is set at. **What a consumer sees is every section
title moving up one step and every page heading moving up two**: a section title
goes from 1.5rem to 2.25rem and from 1.875rem to 3rem at `sm`, and a page `h1` goes
from 1.875rem to 3rem and from 2.25rem to 3.75rem at `sm`. No call site changes,
because the level a Block was already passing is still what decides its size.

**Five surfaces that render a page's own `h1` now ask the same table for its size
rather than naming a step.** `page-header-01`, `docs-shell`, `blog-post-page`,
`not-found-page` and `error-page` each wrote a fixed step into a heading that was
meant to be a page's top-level claim, so with the ceiling lifted they would have
rendered a page heading a rung or two below the section titles under it. They ask
`headingSizeClass`, which is what `SectionHeading` and `Cta01` already asked, and
`Cta01` still carries no literal.

**Four more surfaces that resolved their own heading size, found the same way.**
A Block that takes a `headingLevel` and writes the size beside it forwards the level
and changes nothing a reader can see, which is the defect above at the scale of one
Block. `data-table-01` said `text-lg`, `run-console-01` said `text-base`, and both
moved the outline without moving the size. `run-stream-01` renders a literal `h2`
at `text-lg`, which was the floor of the old scale, so a live region's `h2` came
out below the `h3` introducing the section holding it. `/foundation/themes` said
`text-3xl`, which had been Display and is now the `h3` step, so that page's `h1`
rendered a rung below the section titles under it. All four ask `headingSizeClass`
now, and the three Blocks carry `text-balance` with the size they gained: the ladder
states weight, tracking and balance as one package and `SectionHeading` carries all
three at every rung, so a title lifted from 16 or 18 pixels to 24 or 36 is worse
unwrapped than the one it replaced.

**The Item page's appendix heading is on the article's ladder, and asking the Block
ladder for it was the wrong correction.** It said `text-xl`, which put an `h2` at 20
pixels under the prose `h2` at 30 and below the prose `h3` at 24 above it. Asking
`headingSizeClass` removed the third tier and created a worse one: "API reference"
is a section of an article exactly as "Overview" is, so it takes the article's
ladder, and the Block ladder is a step and a half above it at `sm`. The Item page
then carried three sections at 30 pixels and an appendix at 48, and the appendix was
the second largest thing on the page. It is now a bare `<h2>` inside the same
`.prose` wrapper as the Item's own MDX body, so the article's rules size it at 30
pixels and it carries no class of its own: every section heading in that article is
a bare tag the article styles, and a heading naming its own step would be the second
answer to a question the article has already answered. The table stays outside
`.prose`, whose descendant rules would put its cells at the body step in the muted
colour, and the gap above it is the article's own 16 pixels rather than a second
region's 32.

**The five theme names are card titles, and they compose `CardTitle` to say so.**
They carried `font-medium` and no size, so they rendered at 16 pixels and 500 under
a 60 pixel `h1`. Asking the ladder for the size would have been wrong: five themes at
the `h2` step is five 48 pixel headings over five cards on a page whose own claim is
the `h1` above them. `CardTitle` already holds the answer the library needs: a card
title sits at body size, and the element and the visual step are separate questions.
So the size stands, the tag stands at `h2` because the grid draws no section heading
of its own, and the weight now comes from the one Component that owns it rather than
from a literal. What a consumer sees is five theme names one step heavier.

**The two Foundation readers took opposite answers, and the reason is worth more
than either change.** Both render inside an MDX body, which the site wraps in
`.prose`, and both used to carry literals, which a utility layer lets win over the
article's own component-layer rule: `/foundation/colors` published an `h2` at 18
pixels and an `h3` at 14, below the `h3` above them.

`ColorTokens`' four headings are sections. Two divisions of an article and a
partition under one of them is a structure, not a list of labels, so they name no
step and the article decides, which is the one copy of the ladder there is.

`TokenBrowser`'s are not sections, and dropping its literals let the wrong authority
decide them: every group name came out at the prose `h2`, 30 pixels, which is more
than twice the 14 pixels the navigation rail's own section titles are set at, on the
page whose whole job is being navigated. Each of those 184 names is a table's name
and nothing else, so they are captions: `h3` at `text-sm`, in the mono face because a
token key is machine notation, at the same 14 pixels and 500 as the column heads of
the table underneath. That is the caption `ApiTable` already renders for a compound
export's part names on every Item page, so this is the repository's own treatment
rather than a third one. One heading on the page, "Semantic contract", is a division
of the article rather than a label, and it keeps naming no step.

**`Prose` walks the same ladder from one rung down, and a prose heading therefore
sits below a Block heading at the same level.** Its child treatments now set `h1`
at `4xl` and descend one authored step per level to `lg` at `h5` and `h6`,
which is the same scale and the same floor entered at the rung that fits the
reading measure: Display is 3rem, and a 42rem column is fourteen of those. The new
`h5` and `h6` treatments are new, so a document that reached past `h4` before now
has an answer rather than inheriting nothing. **The consequence is stated rather
than left to be found.** A Block-composed `h2` is 2.25rem and 3rem above `sm`; a
prose `h2` is 1.875rem and does not grow. They are 1.2 apart at the base width and
1.6 apart above `sm`, where they were 1.25 apart before this change, so a consumer
who sets a `Prose` section beside a Block section sees two tiers rather than one.
`DESIGN.md` under Typography, Hierarchy now says so, and says which to reach for.
`DocsShell` runs `Prose` at `fullWidth`, so the frame decides the width: 35rem of
article track at a viewport of 1216px or wider, and less below that, which makes
the case for entering one rung down stronger there rather than weaker.

**`Heading`'s free `size` prop is unchanged, and this is stated rather than
implied.** `size` is a choice made beside the tag, for a heading the surrounding
document has already placed and wants attuned, and its largest arm is a step of
the scale rather than a rung of the ladder. Its two largest arms were not removed
and no new ones were added, so no consumer's call site changes and there is still
no second route to a page `h1` from inside the library. `search-page` and
`status-page` are the two surfaces that take a heading's *tag* from
`childLevel(headingLevel)` and its size from this prop, and they are left as they
are: those are labels over a list of results and over a list of incidents, and a
caption is not a rung.

**`scripts/check-heading-scale.mjs` now holds three things it described but did not
check.** Its rule 4 claimed a table that jumps is a finding and only tested for a
table that rises, so a table that skipped a rung passed it: descending, reaching
the ceiling and flooring at or above Body, and rendering the page `h1` one gap
above its own `h2`, which is the defect these steps exist to remove. And the
literal Display step it refused on `Cta01` was written out as `text-3xl` and
`sm:text-4xl`, which stopped being Display the moment the ceiling moved. Both are
now read from the authored scale and the shipped table rather than restated, and
both have a staged fixture in `scripts/__tests__/heading-scale.test.mjs`. The third
is the Item rule below, which is new rather than a restatement.

**The Item document's own table was the retired ladder, and it now states this
one.** `apps/site/items/component/layout/section/section.mdx` is the page a reader
is on when they ask what `as` resolves to, and it listed `h1` at `text-3xl` and
`h4` through `h6` all at `text-lg`: the table as it was before this change. It now
states the ladder the Component renders, and the sentence under it about where the
scale stops has been corrected with it, because a corrected table beside a stale
paragraph is the same disagreement one row down.

**The gate also reads the Item document now, and that is the third copy of the
table.** `apps/site/items/component/layout/section/section.mdx` states the ladder
in its prose, and neither the declaration build nor the corpus reaches it, so when
the ceiling moved it kept publishing the retired table. The new rule compares it to
the same `HEADING_SIZE` the JSDoc is compared to, by the same cell-for-cell shape,
so it names no step of its own; it reads the whole Item rather than a slice, so a
second table in that prose is a finding; and it fails an Item that states no table
at all, because a comparison with no rows finds nothing to disagree with. Three
staged fixtures cover the three cases.

**What the gate still does not hold is written down rather than left to be
discovered.** `Cta01` is named as a root because it is the one Block whose heading
cannot be composed from `SectionHeading` at all, so a literal step on it has no
table to fall back to. Beyond that file the gate cannot go, and the reason is
stated rather than left to be found: whether a heading a Block renders is a rung of
the ladder or a caption inside that Block is not decidable from source.
Forty-eight headings across `packages/ui/src` and `apps/site/src` name a step of
their own, the eleven rungs among them now ask the table, and the thirty-seven that
remain are captions. Two surfaces bind a caption to `headingLevel` rather than to
`childLevel`, so a rule reading the tag cannot sort them, and a root list holding
the rungs would be a list somebody maintains. That is how the `Cta01`-only rule
came to hold the one Block already fixed and pass over the four that were not, and
the count is written into `docs/quality-gates.md` so the next reader starts from it.
`TokenBrowser` adds one more to that population, which is the point of naming a
caption's step rather than inheriting it: the scan can see it, and it is below the
floor by arithmetic.

**The limit of the scan that took that count is now written down too, and it is the
more useful half of it.** The count came from looking for a literal size utility
beside a heading tag, and a heading whose size it inherits names nothing: the five
theme names above carried no size at all, and two scans of exactly that shape passed
them at 16 pixels and 500. A size that is inherited is a size nobody chose, and "no
literal" is invisible to a scan that looks for literals, so that count has never
been a count of every heading that names a step, and the number nobody chose is the
half of it that reached a reader. What the count is good for is the arithmetic: a
heading it reports is a rung if the step it names is at or above the step Body is set
at, and a caption if it is below, so the two sort without anybody deciding which is
which. The remedy for what the scan cannot see is on the surfaces rather than in the
gate, and it is the one the token inventory now uses: a caption names its own step,
so it is visible to the scan and it is below the floor by definition.

The bump is a minor in both packages rather than a patch because a new authored
step is a new public contract: `--text-5xl` and `--text-6xl` with their
`--line-height` companions enter the emitted CSS and the published pack contract,
and every heading on every page composed from a Block moves.
