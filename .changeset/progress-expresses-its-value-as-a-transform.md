---
'@nanisoft/prism-ui': minor
---

`Progress` expresses its value as a transform rather than as a width

The fill was transitioned with `transition-[width]`, and `width` is a layout
property, so every frame of every advancing bar made the browser settle layout on
the main thread. `Progress` is one of the two or three most-composed Components in
this package, which is what makes it worth a release of its own: the cost was not
one bar on one page, it was every bar on every page, in every consumer that
composes one.

**The indicator is now as wide as the track at every value and is scaled along the
reading axis.** `aria-valuenow` still comes from `ProgressRoot` and still reports
`value`, `min` and `max`; the scale factor is the same three numbers read a second
time, and the test suite holds the two to each other by asserting the transform
against the announced value rather than against a copy of the arithmetic.

Three things to know:

- **A rule that sized `[data-slot="progress-indicator"]` is now sizing a box this
  Component does not resize.** Style the track's `height`, the track's `width`, or
  the indicator's `transform` instead. The indicator's own inline `width` is `100%`
  and outranks any class, because Base UI writes a percentage width onto the
  element as an inline declaration and nothing in a class list can beat that.
- **The fill grows from the inline start edge in both directions.** `origin-left`
  under a left-to-right `dir` and `rtl:origin-right` under a right-to-left one, so
  the bar reads from the same end it always did. It takes the `rtl:` variant rather
  than a logical property because CSS has no logical keyword for
  `transform-origin` and Tailwind's `origin` utility ships the nine physical
  positions and nothing else.
- **At a low value the leading cap is flatter than it was.** A scaled shape's corner
  radius is scaled with it, so a bar at five percent is a short pill with a
  compressed cap rather than a five percent slice of a round one. It is the standing
  trade for a compositor animation, and it is the same one every other
  compositor-priced fill in this package already makes.

`value={null}` is unchanged: an unknown length renders no transform at all, so it is
the resting state it has always been rather than a zero to animate away from when
the length becomes known.

The bump is `minor` rather than `patch` because a consumer who styles the indicator
has to move with it. No prop, import or announced value changes.
