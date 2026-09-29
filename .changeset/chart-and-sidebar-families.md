---
'@nanisoft/prism-ui': minor
---

Add `ChartFrame` and `Sidebar`, the two token families that shipped with no consumer

`chart-1` through `chart-5` and the eight `sidebar-*` roles were in the contract
and used by nothing. These two Components are what consume them honestly.

**`ChartFrame` puts the table inside the frame rather than beside it.** Marks and
cells are two renderings of one `series` array, so drift is structurally
impossible; a table passed as a sibling prop is a table that says last quarter.
The table is always in the document and `table="visible" | "hidden"` only decides
whether it is *seen*, because `hidden` is `sr-only`: it is still announced and
still findable in the page.

**One frame means every chart in a product aligns to the same plot box.** Five
charts each drawing their own axes is five sets of numbers that do not line up, and
a dashboard where two charts disagree by six pixels looks broken in a way nobody
can name. `mark="line" | "bar"` is a prop and the marks are internal on purpose: a
mark with no axis, no gridline and no baseline is a bar that lies, and exporting
one for a caller to place is the exact failure the frame exists to prevent.

**`Sidebar`'s collapsed state is the same rail at a smaller width, not a second
Component.** Hover surface, focus ring, current marking and accessible name are
all present in both states and only the words and the padding change. The name
moves to `sr-only` rather than unmounting and the trailing count is `aria-hidden`,
so the name is the same *string* at both widths and a reader who collapses the rail
loses nothing.

## The measured findings behind both

**The sidebar needs its own ring, and the numbers are in the tests.** `ring` on a
`sidebar` surface measures 2.86:1 on Mint light, 2.97 on Sky, 3.13 on Peach, 3.16 on
Lavender and 3.22 on Blush. Four of the six light-mode packs would have shipped a
sub-3:1 focus indicator had the rail inherited the page ring, which is the
measured justification for the whole `sidebar-ring` family existing.

**The chart tokens are below 3:1 and that is why the legend is not optional.** In
light mode `chart-2` measures 2.49:1 against `card` and `chart-3` measures 2.15:1.
Both are exempt from the contrast gate as graphic objects, so a mark in either is
found by position and shape rather than by colour. That is why the legend is
mandatory, the stroke is 2px, and the table is not optional. Past about three
series hue is the only channel left, which the documentation states as a consumer
decision rather than hiding.

**One pair in this family is unmeasured.** `sidebar-ring` against `sidebar-accent`,
the surface a focused item sits on while hovered or selected, is 3.19:1 in the
base pack's dark mode and 3.82 to 4.21 in the light packs. It passes everywhere
and it is the tightest pair in the family with no row in `check-contrast.mjs`, so it
is reported rather than papered over.

## Two gate gaps found and closed

**`check-variant-ink` listed eleven foreground roles and omitted the two sidebar
ones.** `sidebar-primary-foreground` and `sidebar-accent-foreground` are both
required 4.5:1 rows in the contrast table, so the list was telling the `Sidebar`
that its own required pairing was an inherited one. It is the first Component in
the package to put a `sidebar-*` fill in a variant, so nothing had hit it. The
alternative was to add a decoy `text-sidebar-foreground` to silence the gate, which
would have been a false pass.

**`check-focus-indicators` recognised `ring-ring` only**, so a `ring-sidebar-ring`
would have been reported non-compliant. The `Sidebar` therefore keeps the browser's
outline as well as drawing its ring, which is asserted by a test so it stays a
deliberate guarantee rather than an accident. Both ring roles are now accepted.
