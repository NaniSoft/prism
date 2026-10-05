---
'@nanisoft/prism-ui': patch
---

`FactList` sets its values flush left, and says why there is no numeric mode

Rendered on `www.nanisoft.com/about`: a three-row fact list where every value was set
`text-align: right`. The middle answer is long enough to wrap, so its second line began
wherever the first one ended and the column read as ragged-left, which is what a mistake
looks like rather than what a decision looks like.

**Right alignment is the right answer in a column of figures, and `FactList` has no
figures.** That was the question to settle before changing anything, because the two
answers need opposite fixes. `FactList` takes `label` and `value` and nothing else: there
is no `numeric` prop, no `tabular-nums` anywhere in the module, no monospaced arm and no
per-row alignment of any kind. So nothing in it is a figure, nothing lines up on its last
digit, and what right alignment moved was the first letter of each answer to a different
place on every row. The suite asserts the absence as a fact rather than restating a prop
list, so a `numeric` prop added later fails there instead of quietly making the default
wrong for every caller that never passes it.

The value is now `text-left`, and `text-balance` stays, because it is the same reason it
was there: a two-line answer should break where it breaks well rather than where the
measure runs out.

A caller that genuinely wants a right-aligned column of figures is not refused anything.
`value` is a `ReactNode`, so the caller can pass the span it wants, and Prism holds no
opinion about a value it did not lay out.

Nothing else about the Component changed: same element, same props, same `data-slot`
values, same server Component with no client code.

**One thing found and not changed, because it is a different claim.** The Component's own
JSDoc says the term column is a fixed fraction rather than a content width, and the code
says otherwise: the `dt` carries `shrink-0` and no basis, so the term column is sized by
its content and the left edge of the value column is therefore not straight down the
list. That is a real mismatch between a documentation source and the thing it documents,
and left-aligning the value does not make it worse or better. Fixing the code to match
the sentence would move every fact list in four consumer repositories, so it is a decision
for the maintainer and not a side effect of this one. Recorded here rather than made.
