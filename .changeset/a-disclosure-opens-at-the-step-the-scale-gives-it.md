---
'@nanisoft/prism-ui': minor
---

A disclosure opens at the step the motion scale gives it, and the rail says why it is still a width

`DESIGN.md` has said for a while that `duration-slow` is "transform or layout
state such as a disclosure". Three disclosures animated a height or a width at
`duration-base`, which is 160ms against the 280ms the scale assigns them, and both
chevrons rotated at `base` beside a panel that now takes longer than the icon does.

**`AccordionContent`, `CollapsibleContent` and `Sidebar` are on `duration-slow`,
and so are the two chevrons.** A chevron and the panel it opens are one motion, and
a 160ms icon against a 280ms panel is two events where the reader is watching one.

**`Progress` stays at `duration-base` and this is the one exception the scale has.**
A disclosure is a spatial transition that happens once, on a reader's click, and
280ms is what makes it read as opening. A progress indicator's value changes on
every tick of a running job, often several times a second, and the reader did not
cause it: at 280ms the bar lags the work it is reporting. It is the same
distinction the two laws of motion draw, applied inside the feedback scale. An
answer wants the long end of the band; a reading wants the middle of it.

**`Sidebar`'s rail still animates `width`, and it is a named exception rather than
an unexplained gap.** `Progress` and `RangeField` both express their value as a
`scaleX` about the inline start, and a rail cannot: it carries a mark, a list of
items with a 16px icon, each item's label and a trailing count, and a `scaleX`
scales every one of them into ovals, condensed labels and unreadable numbers. The
decisive part is that a transform cannot reflow text. At `scaleX(0.25)` the labels
are still laid out for a 16rem column, so the rail's contents would never reflow
into the 4rem column they are supposed to occupy, and the only property that does
that is the one being animated.

The cost is stated rather than argued away: it is a main-thread layout pass, once
per reader's click, over one element with a small subtree. That is a different
order of cost from a bar that advances on every frame of a running job, which is
why the two were not the same decision.

`DESIGN.md`'s motion section records all of it, so the table and the call sites no
longer disagree.