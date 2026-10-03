---
'@nanisoft/prism-ui': minor
---

Reduced motion is now one unlayered rule in the stylesheet, and it stops everything

If you have the `prefers-reduced-motion` setting on, this release changes what you
see in a way you will notice the first time you open one of our pages.

**What a reader with the setting on gets now.** No animation runs and no transition
runs, anywhere in the component library. A dialog appears already open instead of
fading up, a hover changes colour instantly instead of over 80ms, a disclosure
opens at once instead of growing, a `Spinner` ring stands still instead of turning,
and a `Timeline`'s running mark holds one opacity instead of breathing. Everything
that is not movement is unchanged: nothing is hidden, no figure loses a state, and
every announcement is said exactly as before.

**What this replaces.** The stylesheet already carried a `prefers-reduced-motion`
rule, and it did two things: it set `animation: none`, and it named the seven
`prism-ambient-*` classes rather than every element. So every `transition-*` in the
package ran at full duration, and two unbounded loops ran indefinitely: `Spinner`'s
ring turned for as long as the work did, and a running `Timeline` step breathed for
as long as the step did. The comment above that rule described the opposite, which
is the defect class this repository keeps finding, so the rule and its comment are
now the same document.

**Why one rule rather than a guard at each call site.** A `motion-safe:` variant
ADDS a rule inside `prefers-reduced-motion: no-preference`; it never removes one.
Three Components were guarding a transition per call site and all three were
different shapes: `Drawer` and `ImageZoom` guarded a duration as well as the
property, `Lightbox` guarded the property and not the duration, and `RangeField`
guarded nothing at all while animating `left`, `right` and `width`. The one place
that decides is the stylesheet, and `scripts/check-motion.mjs` now fails on a
`motion-safe:` or `motion-reduce:` variant on a motion utility, so a call site
cannot quietly start answering for itself again.

**What it means for a consumer.** Your own stylesheet is unaffected where it is
qualified by a class, an id or an inline style: the rule is unlayered and universal
rather than `!important`, so a class-qualified rule of yours outranks it and still
wins for your own elements. What changes is the library's motion, which is the
motion you inherited by installing it.

**One Component had to be repaired before this was safe, and that is the load-bearing
part.** A stopped transition starts nothing and so never sends `transitionend`, and
an exit waiting on that event strands whatever it was hiding. `Toast` now asks the
browser what is actually running on its root and hands over on the same commit when
the answer is nothing, so a `Toast` still leaves under this rule and under your own
`transition: none`. The overlays are Base UI's and Base UI settles every popup on
`getAnimations()`, which resolves immediately when nothing is running.

The bump is `minor` because every consumer of this package inherits the change and
one stylesheet is the whole surface it lands on. No prop, import or exported name
changes.