---
'@nanisoft/prism-ui': minor
---

`BlogPostPage` refuses a post whose display date is its machine date

Measured on `www.nanisoft.com/blog/where-the-products-stand`: the page rendered the date
as `2026-09-26`, the raw machine value. All four NaniSoft sites pass one raw ISO string to
both `date` and `dateTime`, so the reader was handed a machine value and the `datetime`
attribute was handed the same one.

**The contract stands and the Page now holds it.** `date` is the words a reader sees and
`dateTime` is the machine value on the `time` element, and they are separate props
precisely so the two can differ. Formatting is a locale decision, so it belongs to
whoever owns the fact, and Prism renders `date` verbatim. What was missing was any way for
the library to notice when a caller did not do that: a prop called `date` that takes a
`string` is not obviously wrong, the defect is invisible to every reviewer who does not
open the page, and a JSDoc block is read only by whoever is integrating the library. So
the Page now throws when `date` and `dateTime` are the same string, naming the fix in the
message. `StackGrid01` refuses its own missing `ownLabel` for the same reason and by the
same mechanism, and a rule that is only written down is a rule four repositories read and
none of them are caught by.

**The refusal is on the pair, not on the shape of either value.** A site that writes
`2 Sep 2026` and a site that writes `2026-09-26` both pass. What fails is handing the
Page no display formatting at all, and the machine value is already on the element in the
`datetime` attribute for every feed reader and every index, so displaying it a second
time is a redundancy rather than a choice.

**`dateTime` is typed as the shape it is**, `` `${number}-${number}-${number}` ``, so a
formatted string passed there is a compile error rather than an attribute no reader can
check. `date` stays a `string`, and the reason is in the Component's JSDoc: no TypeScript
type separates `21 September 2026` from `2026-09-26`, which is exactly why the refusal
above has to exist at run time.

**This is a breaking change and it is released as a minor.** It breaks every consumer at
build time, so it is a break and not an additive change, and each of the four call sites
below has to change in the same release:

- `alphalens/app/blog/[[...slug]]/page.tsx`, lines 121 and 122
- `atlas/app/blog/[[...slug]]/page.tsx`, lines 137 and 138
- `landing-page/app/blog/[[...slug]]/page.tsx`, lines 119 and 120
- `nexus/app/blog/[[...slug]]/page.tsx`, lines 135 and 136

Each is the same two lines, `date={page.data.date}` and `dateTime={page.data.date}`, and
each needs a formatted string in the first. `CONTRIBUTING.md` says a breaking change is a
`major`; `DESIGN.md` records the decision that a minor is the right line for a break from
a `0.x` version, with the reasoning that taking `1.0.0` would declare the public API stable
rather than describe the change. That reasoning is dated and deliberate, so the minor is
taken here and the disagreement with the contributing guide is recorded rather than
silently resolved.

`DESIGN.md` states the rule once, in **The composition layers** beside the other Page
rules. Nothing else about the Page changed: same props, same elements, same `data-slot`
values, and it is still a server Component with no client code and no router.
