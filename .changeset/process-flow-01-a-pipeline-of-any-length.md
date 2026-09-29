---
'@nanisoft/prism-ui': minor
---

`ProcessFlow01`: a pipeline of any length, drawn in order across as many lines as it needs

`ProcessRail01` holds two, three or four steps and refuses a fifth in its type, and
that decision is not in question. A rail is a claim about a sequence on one line, and
a rail that quietly dropped a step to fit a width would be a diagram of a process that
is not the process. A company site states six stages and was drawing them as a grid of
short points, where the six ordinals and the terminal label were lost: a set read
where a sequence had been.

So the repair is a second shape rather than a wider tuple. Raising the rail's ceiling
to six would have made the fourth column unrepresentable as a type error, which is
the property that made the original decision good.

**It is one ordered list, and the layout is built around that.** A flow that wrapped
into a list per line would be several lists, and a screen reader would announce three
lists of two, which is precisely the set-where-a-sequence-was this Block exists to
prevent. So the stages are one `<ol>` and the wrapping is done by the grid. That has a
consequence worth stating: the Block never learns where a line broke, and therefore
cannot draw anything that is only correct on the widest screen.

**The ordinal is the continuity mechanism, and it is treated as one.** It runs
continuously from `01` to the last stage and it is stated as text rather than only
drawn, so a reader who lands on stage four hears `04` and knows it continues stage
three at whatever width they are using. Nothing else in the Block is load-bearing for
the sequence, and that is why nothing else needs to know where the line broke.

**The thread is a line through the stages, not a box around each one.** Each stage
draws a top border and the grid separates them by a single pixel, so a run of stages
on one line reads as one line broken by hairline gaps and the gap between two lines is
wider. It is the rail's technique, and it is chosen here for one reason: it holds at
any column count, including the single column a phone gets, without the Block knowing
anything about it. A connector drawn between a stage and its successor would need the
column count to be right and would be wrong at every width the type does not describe.

**`stages` is an array and `columns` is a prop**, which is the split the ticket asks
for. The length is content and the grid carries it; how many sit on one line is
layout, and a caller who has to state both has to keep them in step by hand.

**A flow of fewer than two stages throws.** One stage is a label, not a sequence, and
the line the Block draws through it would claim a sequence that is not there. The
message names `ProcessRail01` as the answer for two.

## The proof that the tests can fail

The two assertions that matter are structural rather than visual, and each was proved
by writing the mistake it exists to catch:

- An ordinal that restarts per row, which is what a per-row implementation does, fails
  two cases: the continuous-ordinal assertion and the terminal-label one, because the
  last stage is then no longer the one the label is attached to.
- A list nested per group of three, which is the set-where-a-sequence-was failure
  arriving through the markup, fails four.

An assertion that the flow "looks like" a sequence would have passed both.

The stage names are deliberately **not** headings. The sequence is the list, and
promoting six stages to headings would put six entries in the outline for one process,
so the section title is the only heading this Block renders.
