---
'@nanisoft/prism-ui': minor
---

Nineteen Blocks name their table, and the name is the heading they already draw

A `<table>` is named by a caption, an `aria-label` or an `aria-labelledby`, and by
nothing else. A heading that happens to sit above it does not name it: no assistive
technology derives a table's accessible name from a neighbouring heading. Nineteen
Blocks drew a real `<table>` under a caller-owned `SectionHeading` and gave the table
no name at all, so a reader listing the tables on a page found nineteen anonymous
entries while every element around them was named. `Table`'s own JSDoc asks for one
of the three.

A Block cannot compose the words itself, so each one takes the name from the heading
it already draws, by reference. `SectionHeading` gains an optional `id` for the
handle; a generated id would be no handle at all, since nothing could be written
down to point at it. No new prop on any Block, no string shipped, and no caption
drawn: a visible line repeating the heading is noise, and a reference cannot drift
from the heading it names.

**Three of them write the reference only while the heading is drawn.** `Compare01`,
`PricingCompare01`, `RateCard01` and `DataTable01` render their heading only when the
caller passed a `title`, so an unconditional reference would point at an element that
is not on the page, which is the defect this same release removed from
`CommandPalette`'s listbox. In the one state where a caller passed no title the table
is therefore unnamed, which is the honest trade and the caller's own choice: the
alternative is a reference to nothing.

`DataTable01` also has a `caption` prop, and where a caller passes one the caption
wins, because a reference outranks a `<caption>` in the accessible name algorithm.
Writing both would quietly make the heading the name and the caller's own words the
thing only read on request. `Gantt01` already captioned its table and is unchanged.

The rule is held by a test rather than a gate, and the reason is in that test's
header: whether a table is named is a runtime property, because the reference has to
resolve in every state a caller can reach. A source scan would only prove the
attribute is written, and this repository does not accept a report-only gate.

No import breaks and no prop is removed.
