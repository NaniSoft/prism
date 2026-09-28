---
'@nanisoft/prism-ui': minor
---

A diagram is a Component, and a product's mark is one item rather than two copies

Three of the four product sites draw something in the position where an empty box
is most visible, and all of it was a canvas. A canvas reads computed style from
one element while a pack is an attribute on an ancestor, so a scoped `data-pack`
boundary hands it the pack's light values on a dark page, and no token gate can
see it: the value the drawing holds is a legal token value, applied to the wrong
pack. Cutting the canvases without a replacement is the alternative, and it
leaves three heroes with an empty slot.

`Diagram` draws named things and the labelled relations between them as inline
vector markup. Every stroke and every fill is a semantic utility, never a
resolved value, so a boundary restyles the drawing through the cascade exactly as
it restyles a heading. It is a server Component: no hook, no mode, no context, no
prop spread, and no client code, so a consumer renders it from a server file
with no provider mounted. Its node mark is a circle and a relation is a path
because both are shapes with no radius concept, which is what keeps a boundary
from moving anything but colour; a `<rect>` was rejected because its corner
attribute is a CSS property and no utility pins it. Every mark names an explicit
stroke width, an explicit stroke and an explicit fill, because a shape left to
its defaults either paints opaque black over its own labels or resolves its edge
to the surface it sits on. A relation naming a node it does not have is dropped,
and the count of dropped relations is on the element rather than swallowed.

`ProductMark` promotes the two-part mark the product row and the product switcher
each hand-wrote into one catalogue item. The ring is `brand-ink` and the core is
`primary`, which is not a preference: a pastel brand value is a fill and never
text, so the core may be `primary` and the name may not, and a wordmark reads
`brand-ink` rather than `foreground` or `primary-foreground`. A hand-written copy
gets one of those two wrong and nothing in the rendered result says which. The
mark carries its own `data-pack` boundary, so a product's hue follows from the
pack the caller passed rather than from whichever pack the page is wearing, and
the boundary sits on an element with no radius utility, which is the placement
the pack-boundary law allows. A product with no pack of its own is drawn as the
full spectrum rather than as a colourless mark, built from the five series tokens
because they are the only five-way colour set the contract publishes.

`scripts/check-vector-ink.mjs` holds both Components to the emitted contract. It
fails a literal colour, a gradient whose stops are not contract references, a
`var(--x)` naming a property the contract does not publish, and a paint utility
whose suffix is not a contract role, which is the last of the four a colour
regex cannot see because a Tailwind class is a name and not a value. Its scanned
set is a declared list of two file names rather than a pattern, a Component that
is not on disk fails the run rather than emptying it, and every exclusion carries
a reason and is printed on every run, with an exclusion that resolves to nothing
a finding rather than a line that quietly stops appearing.
