---
'@nanisoft/prism-ui': patch
---

`Diagram` keeps a node's label inside the canvas at the frame's edge

A node placed at the caller's own 0 or 100 sits on the padding wall, and a label wider than that wall centred on the mark ran past the viewBox, where the drawing clipped its own words. A label whose measured half-width reaches an edge now ends at the edge instead of centring on the mark, which keeps the whole line and moves it the shortest distance that keeps it; the stroke trim follows the moved ink rather than the mark. Labels that fit the band are drawn exactly as before.
