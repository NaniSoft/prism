---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
---

Add a running figure to the system, and the ambient cycle scale that prices it

The system had one law of motion: motion is state feedback, on an 80/160/280
millisecond scale, and there are no keyframes anywhere. That law was right and
it held. It also meant a product page could say what its product does and show
nothing about it, which is what happened to four sites at once.

This adds the second law, and it is a separate law rather than an exception to
the first. Feedback is a response to something the reader did. A cycle is a
demonstration of something the system does, and no reader is waiting for it.
The test for which one a motion is does not require taste: stop the animation
and ask whether the figure is still true and still legible.

**New Components**

- `PulseGraph` draws a running system: named nodes, the relations between them, a
  marker travelling a rail, and a breathing focus. A node's `lane` says it is a
  stage in a sequence, which draws the rail; a node with no lane is a field.
  `carries` on a relation says the line is carrying something, and draws a head
  at its end so the claim survives motion being off.
- `PulseSeries` draws a live instrument: columns rising out of a caller-named
  baseline, with a reticle crossing them once per cycle. The values are the
  caller's own and the tallest sets the scale.
- `SignalField` is a field of marks: the atmosphere a figure is drawn over.
  Decorative by default, still unless asked to drift, and honestly named as the
  one component in the system that is texture.

**`Hero01` gains the band it was missing**

All four sites hand-wrote the same two-column grid, each with its own gap and its
own breakpoint. It is now the `instrument` slot, and an action naming an `href`
renders as a real link rather than a button that goes nowhere. The centred form
is unchanged, so this is additive.

**New tokens**

`ambient` and `ambient-ease` are two closed groups measured in seconds, separate
from `duration` because folding them in would have made one name mean both 280ms
and 7.2s. The emitted contract asserts the closed set and fails any cycle under
one second, because a sub-second cycle is a flicker and no value in the 80 to
280ms band could ever have caught that.

**What this does not change**

Nothing is hidden. No ambient rule sets `opacity: 0` and nothing waits for a
script, an intersection or a timer, so every figure is complete at first paint
and a consumer needs no exception to enable the `hidden-state` gate. Reduced
motion is one `animation: none`, and because every resting state is the full
form, that reader gets the same figure, still. All three are server Components,
so this adds zero bytes of client JavaScript.
