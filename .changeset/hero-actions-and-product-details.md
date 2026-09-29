---
'@nanisoft/prism-ui': minor
---

A hero action is the element you asked for, and a product row can carry its own sentence

**`HeroAction` is a union, so a wrong action is a compile error.** It was one shape
with an optional `href`, which made both likely mistakes silent. `{ label: 'Start
free' }` compiled and rendered a primary button that went nowhere, and a hero's
first action is almost always a link, so that is the likely one and it looks
correct on the page. `{ label: 'Start free', href: maybeUrl }` compiled too, and
rendered a button whenever `maybeUrl` was `undefined`, which is a runtime branch the
type said nothing about.

So the link arm **requires** `href` and the button arm **forbids** it, as
`href?: never`. The second is the one worth having: a value that is sometimes a
string and sometimes `undefined` is now a type error rather than a button. That is
the ticket's "a caller should not be able to get it wrong silently", and it is a
type rather than a runtime branch, which is the criterion the ticket asked for.

**The forward arrow now follows the element, not the position.** It was
`index === 0`, so an inert button was the one control in the action row wearing the
mark that says it can be followed. A first action that is genuinely a button gets no
arrow, and a second action gets none even when it is a link, because the arrow marks
the row's one primary destination.

The default **variant** stays positional, deliberately, and the two now move
separately. What looks primary is a fact about the row's shape; whether it navigates
is a fact about the element. Asserting they do not move together is the point,
because the arrow used to follow position for both.

The ticket's claim that the Block "renders every action as a plain `<Button>`" was
stale, the way the Cta01 one was: `CtaLink` had already fixed the rendering. What
was left was the half that had not been fixed, the type, plus the arrow and a test
file, which did not exist. Eight tests assert the rendered element for each arm, the
negative as well as the positive, the arrow on a link and its absence on a button,
and `newTab` with its `rel`.

**`ProductGrid01Product` gains an optional `detail`, and the JSDoc settles which
level a sentence belongs at.** The documentation previously said a second line
"belongs above the grid in `description`, where it applies to the set". That is true
of a sentence about the set and false of a sentence about one product, and the
company site had five products each carrying a sentence that was true of one and
vacuous beside the other four. The migration folded nothing in, so three published
sentences were dropped and the ledger recorded the loss as a catalogue gap rather
than papering over it with a copy edit.

Both levels now exist and the question to ask is written down: **does the sentence
survive its neighbours?** A `description` would be equally true if you deleted any
one row. A `detail` is false, or vacuous, beside the other four. A tagline is the
shortest true thing about a member and reads the same in every row, which is what
distinguishes it from a `detail`.

A `detail` is drawn only when passed. A row that reserved the line would push every
row below it down by one, and this is a stack of full-width rules where a ragged
left edge is the most visible thing on the page. Six tests render both shapes,
because a test asserting only the new field would pass on a Block that had quietly
stopped drawing the grid-level description, which is the half every existing caller
depends on.

**Two proofs that the new tests can fail.** Reverting the arrow to `index === 0`
fails exactly one case, the one the defect lives in. Reverting
`childLevel(headingLevel)` to a hardcoded `h3` in the card-title work fails two.
Neither defect would have been caught by an assertion of the shape the ticket
described.
