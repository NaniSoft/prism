---
'@nanisoft/prism-ui': minor
---

A heading's size follows its level, so a page `h1` and its section titles are no longer one size

**If you composed a page from Blocks, every section title on it just got smaller.**
An `h2` section title moves from 1.875rem to 1.5rem, and above `sm` from 2.25rem to
1.875rem. A page `h1` is unchanged at 1.875rem, and 2.25rem above `sm`. Nothing
about the props you pass changes, and nothing about the outline changes: the same
`headingLevel` you already pass now decides the size as well as the tag.

`DESIGN.md` gave Display two roles at once, "section titles, the CTA banner
heading, and every page `h1`", and `SectionHeading` implemented that literally by
writing one class string for all six levels. So an `h1` and an `h2` came out
byte-identical, and a landing page of a hero plus six Blocks showed one `h1` and
six section titles at 36 pixels, with no hierarchy between what the page claims
and what it elaborates. The level was already on every Block as `headingLevel`
and `childLevel()` already existed to carry it down a level, so the document
decided where each heading sits in the outline and the visual size simply never
followed it.

**The table, and where it stops.**

| level | step | value | above `sm` |
| --- | --- | --- | --- |
| `h1` | `text-3xl` | 1.875rem | 2.25rem |
| `h2` | `text-2xl` | 1.5rem | 1.875rem |
| `h3` | `text-xl` | 1.25rem | 1.5rem |
| `h4` | `text-lg` | 1.125rem | 1.25rem |
| `h5` | `text-lg` | 1.125rem | 1.25rem |
| `h6` | `text-lg` | 1.125rem | 1.25rem |

It is the authored scale walked down one step per level, and it floors at `h4`.
`lg` is the deepest authored step that is not smaller than Body, which is 400 at
1.125rem, so a heading one step further down would render smaller than the copy it
introduces and read as a caption. `h5` and `h6` hold at that step rather than
wrapping, which is the same trade `childLevel()` makes when it clamps at `h6`. A
heading at the floor is still a heading: it keeps `font-semibold`,
`tracking-tight` and `text-balance` at every step, so weight and tracking tell it
apart from body copy where size no longer can.

**Nothing goes above `4xl`, and no scale changed.** The step above Display does
not exist and this does not invent one, so `DESIGN.md`'s ceiling holds untouched
and `@nanisoft/prism-tokens` is unchanged. `h1` is Display because that is the
role the document gives it, and `h2` is the step below.

**No new prop.** The alternative was a `size` on `SectionHeading` and on every
Block that renders one, which widens the public surface across more than a
hundred call sites for a decision the surrounding document has already made by
choosing a level. You get the hierarchy by passing the level you were already
passing, and a Block moved from an `h2` section into an `h3` one carries its size
with it, which is what `headingLevel` was introduced to do. Nothing about the
no-override-path rule changes: a consumer who wanted Display for their thesis
still has it, at `h1`.

**`Cta01` follows its level too, and this is the one Block outside
`SectionHeading`.** It draws a centred title on a filled primary panel with
nothing under it, so the muted description colour and `gap-4` are wrong there and
it resolves its own heading element. It was carrying the same hardcoded size, so
fixing the Component and not it would have left a closing banner one step above
every other section title on the page and level with the page's own `h1`. Its
banner moves with everything else: an `h2` closing banner is 1.5rem, and at `h1`
it is 1.875rem.

**The blast radius, measured rather than guessed.** 132 `SectionHeading` render
sites across 115 files resolve to this table. 6 are at `h1` and are unchanged.
125 are at `h2` and each moves from `text-3xl sm:text-4xl` to
`text-2xl sm:text-3xl`. 1 is at `h3` and moves to `text-xl sm:text-2xl`. That is
the whole change, and it is deliberately not softened: a documentation site
whose own prose hierarchy shifts is a visible change, and the point of the fix is
that the shift is the hierarchy coming back.

**A gate now holds the table, and proof it fires.**
`scripts/check-heading-scale.mjs` reads the table out of `section.tsx`, judges
every step in it against the `text` group in the token source rather than a list
beside the gate, and holds it against the markdown table the Component's own
JSDoc states, which is the documentation source the declaration build preserves
and the corpus reads. It fails on a level with no size, on a step the token source
does not author, on `h1` and `h2` sharing one step, on a step-down table that
rises, on a level deeper than the page heading rendering above it, on a floor below
Body, on the heading losing its weight, tracking or balance, on the JSDoc and the
code disagreeing, and on `DESIGN.md` giving Display the section title as well as
the `h1`. `scripts/__tests__/heading-scale.test.mjs` stages each of those against
a tree the gate reads, including the table the Component actually shipped before
this change, and asserts the gate is red on it.