---
'@nanisoft/prism-ui': minor
---

A Block action is a destination or your own control, and a gate now holds it

**Five Blocks shipped a control that could not be acted on, and the previous release
fixed three of them without the law.** `Hero01`, `Hero02` and `Hero03` each declared
an action union whose `href`-less arm rendered a bare `Button`, and that release closed
the arm and then said, in its own changeset, that seven sibling Blocks still had it and
that "a law held by a type in three Blocks is three types". That was the right
reasoning and it was also the reason the hole stayed open: the next audit found five
more Blocks, and one of them had a shape nobody had looked for.

**`About01` and `Showcase01`** declared the same two-arm union as the heroes and
rendered a `Button` on the arm with no `href`. Each one's JSDoc called it "inert by
design" and defended that as a Block shipping no behaviour, which is true and is not an
answer. Both are now a union of two named arms: `AboutLinkAction` /
`AboutSlotAction` and `ShowcaseLinkAction` / `ShowcaseSlotAction`. `href` is required
on the link arm; the slot arm carries the caller's own `ReactNode` and forbids `label`,
`href`, `newTab` and `variant`.

**`PageHeader01` was worse, and its own type said so.** `PageHeaderAction` had **no
`href` member at all**, so there was nothing to make optional: `{ label: 'Share' }` was
the only value the type could express and every value rendered a `Button` that
activated to nothing, at the top of every screen a consumer rendered. It is now the
same two-arm union. Its `actionsSlot` sibling prop is **gone**, and that is the one
structural change here: a sibling slot renders before the row's own actions and cannot
say which position it fills, so a caller who wanted a primary menu trigger at the front
and a link behind it had to put the link first and accept the order, or pass the trigger
in `actions` where it was a dead button. As an arm, position and element are the same
value.

**`Pricing01` was the one no audit had found.** `Plan` carried a required `cta: string`
and the Block rendered it as a `Button`, so every pricing table in every consumer's
product shipped a focusable control, announced as a button, that activated to nothing, on
the card a reader was about to decide on. `cta` is replaced by `action`, a two-arm union,
and a plan whose control is a checkout trigger is the `slot` arm. The featured plan
still draws a filled anchor and the rest an outlined one, so the recommendation still
reads. `pricing-01/index.tsx` also exported the value alone until now, so a consumer
could not name `Plan` at all; `Plan`, `Pricing01Props` and the three action types are on
the surface.

**`Plan` now carries a required `id`, which is the second change to one record and was
deferred from this entry once.** The first version of this changeset recorded the
observation and the reason for leaving it: *"a second breaking change to a record this
release already changes, and bundling two migrations into one entry makes both harder to
read. It is a follow-up, not an oversight."* Both halves of that reasoning have since
stopped applying, and the second one was never quite true.

The `id` is real. `Pricing01` keyed its cards on `plan.name`, which is the word a reader
reads on the card, so a monthly and an annual row of the same tier produced a React
duplicate key and cards the renderer had been told are ambiguous, and a rename in the
copy was a rename in the key, which loses a caller's saved selection over an edit to a
sentence. `Careers01` and every other Block in this package key on an `id` and say why;
`Pricing01` was the last one that did not.

The bundling reason does not survive contact with the release. There is no released
boundary between the two changes, because both are in this same unreleased body of work,
so "bundling" describes nothing a reader would ever have to unpick: they upgrade once
and read one entry either way. And one `Plan` with two migrations in one place is more
readable than one `Plan` with two migrations in two places, because the second entry has
to re-establish that it is talking about the same record. It is in this entry for that
reason and the deferral was the mistake, not the delay.

**`Waitlist01` is the fifth, and it is not a union.** `Waitlist01Referral` declared
`copyLabel` and `copied`: the accessible name of a copy control and the state to draw on
it. The Block then rendered `<Button type="button">{copyLabel}</Button>` with **no
handler**, beside a read-only field holding the code it was labelled as copying. The
JSDoc described a second weight and a `data-copied` attribute for a control that never
copied anything. Both props are gone and `copyControl` is a `ReactNode`. Prism will not
call `navigator.clipboard` on a consumer's behalf and then report a success it cannot
verify: the permission is the caller's to grant, the secure context is the caller's to
know about, and a copy can fail. The sentence that says it worked belongs in `status`,
which is where it already belonged.

**The four Blocks whose union renders nothing on the `href`-less arm were already
correct, and the audit that named them was wrong.** `Careers01`, `CaseStudies01`,
`Industries01` and `Services01` each declare an item union whose no-link arm renders **no
control at all**: the `CtaLink` is inside `isLink ? … : null`. That is the right shape
for a card, where a link is an addition rather than a required part, and there is nothing
to repair. `Gallery01` is the same story with a different reason: its tile is a real
`<button>` with an `onClick` that opens the lightbox, in a `'use client'` Block. Five of
the nine names in the earlier changeset were false positives, and saying so is part of
the record: a list of sites is a claim about a tree, and the tree is what settles it.

**`scripts/check-block-controls.mjs` is the gate, and it is green.** The previous release
declined to write one because it would have failed on five real Blocks, and that was the
right call at the time. It can be green now, so it exists. It reads `packages/ui/src/blocks`
and `packages/ui/src/pages` and fails on a rendered `Button` or `CtaLink` that carries
none of `onClick`, `type="submit"` or `type="reset"`, and no `href`. It deliberately does
**not** read `apps/site/items`, because the documentation Demo for `Button` renders
`<Button>Save changes</Button>` with no handler and showing the control is the whole
point of showing it; the demos are held by the compiler, because a demo passes a Block's
props and fails to build the moment `AboutAction` stops accepting a dead action. The
gate's own proof is `scripts/__tests__/block-controls.test.mjs`, which plants each of the
five shipped shapes as a fixture, because the five Blocks that shipped them have since
been fixed and a gate whose only evidence is a clean run is a gate nobody has watched
fail.

Two things the first version of that gate got wrong are recorded because they are the
kind of defect a clean run hides. It deleted comments rather than blanking them, which
removed their newlines and printed every finding below the first JSDoc block on the
wrong line. And it matched a tag's attributes with `<Name([^<>]*)>`, which stops at the
first `<` or `>` in the attribute text, which in JSX is very often not the end of the tag:
`onClick={() => step(-1)}` contains `=>`, `disabled={position <= 0}` contains `<=`, and
`disabled={currentPage >= pageCount}` contains `>=`. Each truncated the attributes before
the handler two lines further down, so three Blocks with working handlers were reported
as shipping dead buttons. The tag end is found by brace and paren balance now.

**The bump is `minor` rather than `major`, and the argument is the version line rather
than the severity.** Five Blocks' public prop types change and two of them (`Plan.cta`
and `Waitlist01Referral`) do not compile against a value that compiled a release ago.
That is breaking by any ordinary reading and this entry says so plainly. `major` in this
repository publishes `1.0.0`, and every release to date has been `minor` on a `0.y.z`
line where the `y` is already the breaking-equivalent slot; publishing 1.0.0 with this in
it would assert an API stability guarantee this library has not earned, and it would be
the first release in the project's history to use the bump at all. The same argument
carried the hero change and the `Cta01` change at 0.6.0. The break is real and is the
subject of this entry; the number it lands on is the line's decision.

Migration, per Block:

```tsx
// About01, Showcase01, PageHeader01: an action with no href
// Before
actions={[{ label: 'Start free' }, { label: 'Docs', href: '/docs' }]}
// After
actions={[
  { slot: <NextLink href="/start">Start free</NextLink> },
  { label: 'Docs', href: '/docs' },
]

// PageHeader01 only: actionsSlot is gone, and the node moves into the row
// Before
<PageHeader01 actions={[{ label: 'New deployment' }]} actionsSlot={<Menu />} />
// After
<PageHeader01 actions={[{ slot: <Menu /> }, { label: 'New deployment', href: '/deployments/new' }]} />

// Pricing01: `cta: string` becomes `action`, and the card is keyed on an `id`
// Before
plans={[{ name: 'Team', price: '$24', features: [], cta: 'Choose Team' }]}
// After
plans={[{ id: 'team', name: 'Team', price: '$24', features: [], action: { label: 'Choose Team', href: '/signup?plan=team' } }]

// Waitlist01: the copy control is the caller's, whole
// Before
referral={{ value: CODE, label: 'Your referral code', copyLabel: 'Copy code', copied }}
// After
referral={{
  value: CODE,
  label: 'Your referral code',
  copyControl: <Button onClick={() => navigator.clipboard.writeText(CODE)}>Copy code</Button>,
}}
```

Every one of these was a compile error before and is a compile error now, which is the
point: a consumer upgrading finds a failed build rather than a page that silently renders
nothing.

**One thing about the `Pricing01` migration is separate from the rest of it.** Every other
line above changed a member a consumer had to add. The `id` also changes what a consumer
has to add to the same object, so a plan that compiles after this release and renders two
cards correctly is a plan that passed an `id`. Nothing here needs a second entry, and the
observation that started this is in the entry above rather than at the end of this one.
