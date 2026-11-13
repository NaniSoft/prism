---
'@nanisoft/prism-tokens': minor
---

A `veil` group in the foundation tier: the translucency scale, eight rungs
authored as fractions and emitted as percentages, closed and ascending under the
emitted-contract gate.

Before the group, every alpha in the shipped surface was a hand-picked literal at
its call site, and four surfaces that meant the same thing wore four numbers: a
bar at 0.72, a dialog scrim at 80, a figure veil at 40, aurora planes at 20/15/10.
The rungs are roles rather than percentages, because a percentage is a number
somebody measured once and a role is a decision: `faint` is a wash, `whisper`
through `light` are the aurora planes, `quiet` is a veil that stills a figure,
`glass` is the scrolled bar, `scrim` is a modal, `cover` all but hides the page.

The values reach CSS as percentages rather than unitless fractions because CSS
reads an alpha through `color-mix`, and a fraction substituted there is invalid
at computed-value time: the declaration holds, the property silently becomes
unset, and the surface renders opaque. The build carries the unit and the source
carries the fraction, and neither is ever written where the other belongs.
