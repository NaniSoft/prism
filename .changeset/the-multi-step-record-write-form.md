---
'@nanisoft/prism-ui': minor
---

Add `RecordWizard01`, the multi-step record write form

`RecordWizard01` is the write form's second arrangement rather than a prop on the
plain form. A wizard draws one group of fields at a time above a rail and asks a
decision the plain form never asks, which is whether a step may be left forwards, so
it earns its own name: it is a property of how many fields a record has, not one of
two renderings a consumer picks between on purpose.

The step is the consumer's. `current` is controlled and `onStepChange` is required,
and the Block draws the step it was handed and no reachability at all. The
specification is per step, and a step is a `FieldSpecGroup` from
`@nanisoft/prism-ui/spec` with a stable `id` and a string `label`, so nothing new is
declared in order to hold the steps and a group's heading and its rail label are one
word. One specification sliced by a caller grouping is refused.

Every field on the stepped arm is controlled and carries the consumer's value and
change handler, so the values are the consumer's from the first keystroke. Back, the
forward control and the rail are `FormWizard`'s, and this Block renders none of
them, declares no submission arm of its own, and leaves an issue naming a key that
is not on the step being drawn undrawn without moving the reader.
