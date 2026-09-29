---
'@nanisoft/prism-ui': minor
---

A card title is a heading again, at a level the Block derives rather than guesses

**The defect.** `CardTitle` renders a `div`, and that is correct: four cards in a
grid are four titles under one section heading, and four `h2`s under one `h2` is
four sections. But that reasoning is about the **element**, and the catalogue was
reading it as a reason about the **outline** too. Every Block that drew a titled card
drew it as plain text, so a page kept its `h2` and lost every heading below it. A
feature grid of five cards was unreadable by heading navigation while looking
identical. Found while migrating the company site, whose feature section had five
`h4`s before the migration and five `<div>`s after.

**The answer is one function, and it is the same answer in all six places.**
`childLevel(headingLevel)` steps one level down, so a Block that draws a Section
heading and a set of card titles puts the titles *under* the section, and the whole
set moves together when the block is composed one level deeper than it was written
for. A Block that draws no Section heading passes `headingLevel` directly, because
there the card title is the one heading it renders. Both answers are right, and the
test carries which is which rather than assuming one for all six.

This is what answers the ticket's third criterion, that the same question be
answered for *every* Item that draws a titled card. The sites are `FeatureGrid01`,
`Pricing01`, `StackGrid01`, `AuthForm01`, `SettingsPanel01` and `AuthPage`, and the
test that holds them is one file, because the consistency is the thing under test:
five files with one case each would let the next Block answer differently and still
pass, which is the failure this was filed about.

**`CardTitle` gains `as`, defaulting to `div`.** The change is additive and no
existing rendering moves. Its JSDoc previously told a caller to pass Prism's
`Heading` inside it, and that was wrong: `Heading` is a step of the *type* scale
whose floor is `lg`, and a card title sits at body size, so the only way to use it
was to override the size back down, which asks a type-scale component to have no
opinion about type. The element and the visual step are separate questions and this
is the one that answers the element.

**Two levels in one Block that had one hardcoded.** `SettingsPanel01` drew its
group headings as a literal `<h3>`, so a panel composed under an `h4` in a document
whose sections were `h4` announced its groups as siblings of the panel that
introduces them. They are now one step below the panel title, so the panel's whole
outline moves when the panel does.

**`h6` holds rather than wraps.** A section already at `h6` has no child level.
Wrapping to `h1` would put a card title *above* the section that introduces it, which
a reader navigating by heading would meet first; holding at `h6` costs a repeated
level, which a screen reader announces as the same depth rather than as a break in
the outline. The clamp is asserted so a later change to the order is caught.

**The proof that the test can fail.** Replacing `childLevel(headingLevel)` with a
hardcoded `h3` in `FeatureGrid01` fails two cases, the default and the derived one,
which is the exact defect the ticket names. A test that asserts "is a heading" would
have passed that.
