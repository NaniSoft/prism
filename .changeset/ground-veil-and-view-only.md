---
'@nanisoft/prism-ui': minor
---

`Ground01`, the page's one continuous ground as a published Block: the aurora
wash, the particle field, the fixed `site-atmosphere` layer and the bar's
transparency state in one composition, so an application no longer assembles the
four by hand in its layout and the assembly cannot drift per site. `AuroraWash`
gains an `intensity` prop that steps every plane one rung down the veil ladder,
which retires the wrapper-opacity dimming a working surface used to carry.

Every translucent surface in the library now names a rung of the `veil` scale
the token package publishes: the wash planes, the hero and CTA washes, the
backdrop veil, the gallery cover, the dialog family's scrims, and the bar that
turns to glass on scroll. A utility reaches a rung as
`bg-primary/(--veil-light)`, which compiles to a `color-mix` on the token, so a
retune of the scale reaches every translucent surface at once. The `site-main`
stacking contract is now held for a `main` carrying the slot, which the
stylesheet's own comment always described and no markup could actually reach.

The gate kit's contract generation is 2. It adds the `view-only` law and its
gate, for the repositories that have decided Prism is a view-only library and
hold themselves to it: no stylesheet, no style-tooling configuration or
dependency, no client module, no inline style. The law is named rather than
universal, so a consumer declares it by naming the gate; the showcase
applications run it at kit generation 2.
