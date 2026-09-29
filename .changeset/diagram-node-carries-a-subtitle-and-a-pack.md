---
'@nanisoft/prism-ui': minor
---

`DiagramNode` carries a subtitle and a pack, and an unlabelled `Diagram` is named by its nodes

**The subtitle is drawn, not only announced.** `DiagramNode` had one line of text
and `DiagramProps` forced `label` on the non-decorative arm, so the only channel
to a screen reader was the label. That is a text-only channel: a sighted reader
looking at the picture got nothing, and the drawn name and the announced label
were two strings a caller had to keep in step by hand. The subtitle is a second
`<text>` under the name, and a node without one emits no `<text>` at all, so an
absent subtitle is not an empty line.

**A derived name makes the drift structurally impossible rather than discouraged.**
`DiagramProps` gains a third union arm in which `label` is absent and the name is
built from the nodes in draw order: `Tokens (the shared language), Pipeline (the
engine), Twins`. The arm is `label?: never` and not `label?: string`, so an unnamed
diagram and a diagram named with an empty string cannot be confused, and a blank
label falls back to the derived name rather than announcing an unnamed image.

Relation words are deliberately **not** in a derived name. Inventing a sentence out
of the edges would make `Diagram` write words, which this system does not do; a
caller who needs the relations announced passes `label`, and the JSDoc says so.

**`pack` is per node and typed `PackId`, not `string`.** A free-text field would
accept a name matching no emitted rule and the mark would silently keep the pack
above it. The closed six-pack union is the one `ProductMark` already uses. It is
per node rather than per diagram because a `pack` is a boundary on a **mark**, and
a mark in a diagram is a node; a pack on the whole diagram would be a boundary on
the arrangement, which is the thing the boundary law is not for. It is set on the
`<circle>` rather than the `<svg>` or the node's `<g>`, so it re-inks that one mark
and moves nothing else, and a circle is a shape the pack cannot re-round.
`'default'` is the absence of the attribute, as `ProductMark` spells it.

`check-pack-boundary` now reads three boundaries and reports 0 findings.
