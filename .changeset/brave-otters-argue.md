---
'@nanisoft/prism-ui': patch
---

`Diagram` labels stay legible on a phone, and no stroke crosses one

Two defects, both measured on the five-node architecture drawing the company
site renders. Its node names were drawing at 6.95 CSS pixels and its relation
words at 5.88 in the 342 pixels a phone leaves the drawing, and ten of the
twenty-five label and stroke pairs on that drawing intersected: all five node
names were struck through by an edge leaving their own node, and all five
relation words sat on their own line.

**Labels now have a floor, and it is the drawing's own coordinate space.** Type
inside a scaled `<svg>` is sized in user units, so a label's rendered size is its
size in user units times the rendered width over the canvas. That is why the
canvas is fixed, and it is not the whole answer, because it has no floor in it.
The drawing is now never rendered narrower than 640 pixels, one user unit is
therefore never less than one pixel, and the smallest label the drawing sets is
twelve units, which is what `text-xs` resolves to. A container that cannot give
it that much scrolls sideways rather than letting the labels fall through it,
which is the arrangement `Table` already makes with seven columns and `Gantt01`
with a schedule of names and bars.

The cost is stated rather than hidden: on a phone a reader sees about half the
drawing at a time and pans for the rest. The alternative was the whole drawing at
5.88-pixel type, and `DESIGN.md` records that trade under **The figure floor**.
Nothing above 640 pixels of container changes at all, so no desktop or tablet
rendering moves.

**Strokes now stop where the ink runs out, and each label is asked on its own.**
A node's name is printed under its mark, so a relation drawn centre to centre ran
through the name under whichever node it left downward. The first version of this
fixed that by trimming every stroke back to the box enclosing the mark and every
label beside it, which is also wrong in the other direction: a relation along a
row never touches the name printed under its mark, so backing it off by the
half-width of that name detached it from the mark it connects. On three things on
one baseline with names at length, every end of every relation stood sixty units
clear of its mark. A relation is now trimmed against whichever comes first, its
own mark's edge plus the clearance or the far side of an individual label the
stroke actually runs through, so a relation leaving sideways reaches its mark and
one leaving downward still stops below the name in front of it. The whole line
between the two marks is divided once rather than each end trimmed alone, because
a name and a subtitle sit below their mark at two depths and a stroke arriving
from below runs through the first and back into the second.

The box is computable from a server Component because every label in a drawing is
set in the monospaced face, where a label's width is its character count rather
than a measurement. That is what `DESIGN.md` records under **The ink-avoidance
rule**, with the reason a halo was rejected and the direction clause that the
first form of the rule was missing.

**The drawing is wrapped in a container.** It carries `data-slot="diagram"` and
still scrolls, and the wrapper carries `data-slot="diagram-container"`, following
`Table`'s `table-container`. Every existing `data-slot` value, the derived or
passed `aria-label`, `role="img"`, and `data-unresolved-relations` are unchanged,
so no call site and no test that addresses the drawing by slot needs to move. The
Component is still a server Component with no client code.