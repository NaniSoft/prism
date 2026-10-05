---
'@nanisoft/prism-ui': patch
---

`PulseGraph` labels stay legible on a phone, and no stroke crosses one

Three defects, all measured on a four-stage pipeline the way `Diagram`'s two were
measured on the five-node architecture drawing the company site renders.

**Labels now have a floor, and it is the drawing's own coordinate space.** Type
inside a scaled `<svg>` is sized in user units, so a label's rendered size is its
size in user units times the rendered width over the canvas. That is why the
canvas is fixed, and it is not the whole answer, because it has no floor in it. In
the 356 pixels a phone leaves the drawing, a stage name was rendering at 7.23 CSS
pixels and a node's note at 5.56, and ten user units was the smallest type the
whole package emitted anywhere, including inside a figure. The drawing is now
never rendered narrower than 640 pixels, one user unit is therefore never less
than one pixel, and the smallest label the drawing sets is twelve units, which is
what `text-xs` resolves to. A container that cannot give it that much scrolls
sideways rather than letting the labels fall through it, which is the arrangement
`Table` already makes with seven columns. Nothing above 640 pixels of container
changes at all, so no desktop or tablet rendering moves.

**Connectors now stop where the ink runs out, and each label is asked on its own.**
A node's name is printed under its mark, so an edge drawn centre to centre ran
through the name and the note under whichever node it left downward. On the
pipeline this fix lands on, eight of the thirty-two label and connector pairs
intersected: the two stages nearest the top of the canvas, each with its own name
and its own note struck through by the two edges that met it. The first version
of this trimmed every connector back to the box enclosing the mark and every
label beside it, which fixes the crossings and detaches the drawing instead: a
stage's name and note both sit below its mark, so a connector along the rail
touches neither, and backing it off by the half-width of the widest name at the
node left four of the five connectors on the six-stage figure floating free of
both their marks, by up to fifty-five units. A connector is now trimmed against
whichever comes first, its own mark's edge plus the clearance or the far side of
an individual label it actually runs through, so all five connectors on that
six-stage figure touch both their marks with the clearance between them and the
stroke is thirty to fifty units longer, and a connector leaving a node downward
still stops below the name in front of it. The whole line between two marks is
divided once rather than each end trimmed alone, because a name and a note sit
below their mark at two depths and a connector arriving from below runs through
the first and back into the second.

You do not have to space your nodes to avoid this, and you always had to space
them to keep two names from touching each other.

**The rail no longer sits on a note.** The rail was a fixed distance up from the
bottom of the canvas while a node's note reached a fixed distance below its mark,
so the two met on one range of mark positions: a lane whose mark landed low enough
put its note under the rail's own stroke. The fitted area now stops above the band
the rail reserves, which is the rail's distance up from the bottom plus its own
thickness, the drawing's ink clearance, and the deepest ink a node draws. A graph
with no lanes has no rail, so nothing reserves the foot and the fit is unchanged.

**The drawing is wrapped in a container.** It carries `data-slot="pulse-graph"` and
now scrolls, and the wrapper carries `data-slot="pulse-graph-container"`, following
`Table`'s `table-container` and `Diagram`'s `diagram-container`. Every existing
`data-slot` value, the `role="img"`, the passed `aria-label`, `data-lanes` and
`data-unresolved-relations` are unchanged, so no call site and no test that
addresses the drawing by slot needs to move. The Component is still a server
Component with no client code.

`DESIGN.md` records the two rules this applies under **The figure floor** and **The
ink-avoidance rule**, the latter with the direction clause that the first form of
the trim was missing, and the geometry both Components now share is one internal
module rather than a second copy in each.