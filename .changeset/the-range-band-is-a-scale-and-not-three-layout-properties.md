---
'@nanisoft/prism-ui': minor
---

`RangeField` expresses its band as a transform rather than as three layout properties

The band between two bounds was transitioned with `transition-[left,right,width]`.
Base UI positions that element with a logical `inset-inline-start` and a `width`,
so `left` and `right` were properties the browser checked on every frame in order
to discover they had not moved, and `width` was a layout-and-paint animation on
every frame of every drag. A range is the one control in this package whose value
changes on every pointer move rather than on every commit, which is why the cost
was larger here than on the Component that retired the same mechanism a release
ago.

**The band is now as wide as the track and is scaled about the inline start.**
`aria-valuenow` still comes from Base UI and still reports each bound; the scale
factor is the same division read a second time, and the test suite holds the two to
each other by asserting the transform against what the two thumbs announce.

Three things to know:

- **A rule that sized or positioned `[data-slot="range-field-indicator"]` is now
  sizing or positioning a box this Component does not resize.** Style its
  `transform`, or style the track. Its own inline `width` is `100%` and outranks any
  class, because Base UI writes a percentage width onto the element as an inline
  declaration. Its POSITION is still Base UI's, untouched: the element keeps the
  logical `inset-inline-start` that places the band's left edge on the lower bound
  under a left-to-right `dir` and on the same distance from the other end under a
  right-to-left one, so a `dir="rtl"` band needs no arithmetic of its own.
- **A partial band has a straight edge where it stops, and no rounded edge.** The
  previous fill carried `rounded-full`, and a `scaleX` scales the shape it is applied
  to, including its own corners, so a band at 40 percent drew a 3px cap squashed to
  1.2px on one axis and left at 3px on the other. The ends of a band are the two
  round thumbs drawn on top of it, so the radius was a second, smaller circle under a
  larger one and squashing it landed on exactly the edge the reader is looking at.
  The track still carries `rounded-full` with `overflow-hidden`, so a band at full
  span has both of its ends rounded. This is the one place the shape differs from
  `Progress`, and the reason is on the Component.
- **A vertical field scales on `scaleY` about the bottom edge**, chosen by the
  `orientation` the Component already forwards, rather than having the horizontal
  animation applied to a vertical box.

`RangeField` also carried a `motion-safe:` variant on that transition, which was
doing nothing: the variant adds a rule rather than removing one, so the unguarded
transition ran at every setting. See the reduced-motion changeset for where the
policy now lives.

The bump is `minor` because a consumer who styles the indicator has to move with it.
No prop, import or announced value changes.