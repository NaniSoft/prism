---
'@nanisoft/prism-ui': minor
---

A hero action is a destination or your own control, and never an inert button

`Hero01`, `Hero02` and `Hero03` accepted an action of `{ label }` with no
destination, and each Block rendered that as a bare `Button`. Every one of those is
a focusable control, announced as a button, that activates to nothing, and it sat
where a reader looks first: the primary call to action of a marketing hero, in
three published Blocks, so every consumer of any of them shipped a dead button
where the most important action should have been. Each Block's JSDoc called the
button "inert by design" and defended that as a Block shipping no behaviour, which
is true and is not an answer. A Block that ships no behaviour cannot make a control
work, so it should not render a control at all.

**The defect was in the type, not in the render, so the fix is a type.** The
rendering half had already been repaired once: `CtaLink` renders a native anchor
and `Cta01` requires `href`, which is why the three heroes, predating both, kept
the old shape. What survived was the third arm, and it could only be closed by
removing it.

`HeroAction`, `Hero02Action` and `Hero03Action` are now a union of two named arms
rather than one shape with an optional `href`:

- `HeroLinkAction` (and its two siblings) **requires** `href`, so a value that is
  sometimes a string and sometimes `undefined` is a compile error rather than a
  control that navigates on the renders where the address happens to be there.
  `slot` is forbidden on this arm.
- `HeroSlotAction` (and its two siblings) **carries `slot`**, the caller's own
  control, and forbids `label`, `href`, `newTab` and `variant`. It exists because
  a server Component cannot receive an `onClick`, so the honest form of "this does
  something" in a composed section is a node the caller renders. This is
  `Cta01`'s `actionSlot` moved inside the row, because a hero carries an ordered
  list of up to two actions and a sibling prop cannot say which position it fills.
  `check-block-imports.mjs` already holds that a `ReactNode` slot is how a consumer
  injects an interactive child without the Block owning any state.

The Block places a slot and adds no class to it, because a class it adds to a node
it does not render is a style the caller cannot see and cannot remove, and this
package has no override path.

**Nothing else moved.** The anchor is the element the link arm always produced, at
the same size and the same variant, and the positional default variant still
follows the position: the first action in the row is filled and the rest are
outlined, whether the first one is an anchor or a caller's control. The forward
arrow still marks the row's one primary destination and now, with every action
Prism renders being a link, the position is the whole of the test. A `slot` at the
front of the row wears no arrow, because the control the caller drew owns its own
marks. Each Block is still a server Component.

**The bump is `minor` rather than `major`, and the argument is the version line
rather than the severity.** `{ label: 'Coming soon' }` compiled a release ago and
does not now, which is breaking by any ordinary reading, and this entry says so
plainly. `major` in this repository publishes `1.0.0`, and every release to date
has been `minor` on a `0.y.z` line where the `y` is already the breaking-equivalent
slot. Publishing 1.0.0 with this change in it would assert an API stability
guarantee this library has not earned, and it would be the first release in the
project's history to use the bump at all. The same argument carried the `Cta01`
change at 0.6.0. The break is real and is the subject of this entry; the number it
lands on is the line's decision and the line is pre-1.0.

Migration: every action in a hero now carries either a destination or your own
control. Where you passed a label alone and meant a link, give it the `href` it
was always declared with. Where you meant a control that is not a link, a router's
own `Link`, a submit button or a menu trigger, move it into `slot` as the element
itself rather than as a label:

```tsx
// Before
actions={[{ label: 'Start free' }, { label: 'Sign in', href: '/sign-in' }]}

// After
actions={[
  { slot: <NextLink href="/start">Start free</NextLink> },
  { label: 'Sign in', href: '/sign-in' },
]}
```

Both mistakes are now compile errors, which is the point: a consumer upgrading
finds a failed build rather than a site that silently renders nothing.

**The same arm was still in seven sibling Blocks when this was written, and
`a-block-action-is-a-destination-or-your-own-control.md` closes them.** The audit
behind this entry named `About01`, `Careers01`, `CaseStudies01`, `Gallery01`,
`Industries01`, `Services01` and `Showcase01` as carrying the same two-arm union with
a rendered `Button` on the arm that has no `href`, and `PageHeader01` as rendering
its declared `actions` as buttons with no destination at all. **Five of those nine
were correct and four were defective, and the later entry records which is which**:
`About01` and `Showcase01` had the union, `PageHeader01` was worse and had no
destination member at all, and `Pricing01` and `Waitlist01` were not on the list at
all. `Careers01`, `CaseStudies01`, `Industries01` and `Services01` render **nothing**
on their `href`-less arm, which is the right shape for a card, and `Gallery01`'s tile
is a real button with an `onClick` in a client Block.

This entry stands as the record of the heroes. The shape every Block now takes is the
one adopted here, and `scripts/check-block-controls.mjs` is what holds it: the earlier
reasoning in this paragraph, that "a law held by a type in three Blocks is three
types", was right about the risk and wrong about the remedy, and the remedy is a gate
rather than a shared type.