---
'@nanisoft/prism-ui': minor
---

Add `RunConsole01`, a run as a heading, a budget and the steps that got there

The surface the fourth Kind exists for, and a Block rather than a Component
because a run console is not one thing: it is a measurement beside a sequence
beside a stream, and a reader needs all three in the same frame to answer the
only question they have, which is whether the run will finish and what it is
costing.

```tsx
<RunConsole01
  title="Nightly reconcile"
  streaming={running}
  copy={{
    budgetLabel: 'Budget spent',
    budgetValue: (value, max) => `${value} of ${max} credits`,
    stepsLabel: 'Run steps',
    title: 'Run',
    waiting: 'Waiting for the first step',
  }}
  budget={{ value: 4200, max: 5000, thresholds: [{ at: 4500, tone: 'warning' }] }}
  steps={steps}
/>
```

**It reimplements nothing.** The budget is a `Meter`, which draws the limits the
caller named and stays neutral below all of them. The steps are a `Timeline`, which
draws each duration to scale against the slowest one. What the Block adds is the
arrangement, and two facts belonging to neither component: a run with no budget
gets no budget meter, because a local run has no ceiling to be near and an empty
meter is a measurement of nothing that is invisible because an empty meter looks
like a meter; and the budget sits above the steps, because the first question about
a run is whether it will finish and two columns would make the reader choose.

**The live region exists only while the run is arriving.** A test caught this. The
first draft wrapped the steps unconditionally, which left a live region on the
page for a run that had already finished: it announces nothing on mount, but it is
still there, and a later re-render with different steps is an unrelated change it
will announce. Mounting it when the run starts is also the order that does not
lose an announcement, because the region is on the page before the first event
arrives, which is when a screen reader is listening. It wraps the steps and not the
budget, so an append does not re-read the spending every time.

**`LiveRegion` is a server Component, and that is a correction.** It shipped in
0.8.0 carrying `'use client'` while reading its props, holding no state, running no
hook and taking no event handler. The directive was a claim about work the
Component does not do, and sixteen of forty-one components in this package are
client. A live region is announced by the browser's own mutation observer rather
than by JavaScript, which is the reason it is a good primitive: it works in a
server-rendered page.

## The client budget

The whole-tree client bundle measures **108.1 KB** with this branch's components
in it, against a 116 KB ceiling, and the five components here cost about **0.1 KB**.

That is worth stating plainly, because the number looked very different for a
while. An earlier draft of this branch reported that the components added 2.3 KB,
crossed a 92 KB ceiling, and needed the ceiling raised. That measurement was taken
against a gate whose roster read two directories, and it was wrong for the same
reason the old ceiling was: 53 emitted client modules were never read. The roster
has since been widened to the whole tree, the honest figure is 108 KB, and these
components land inside the existing ceiling with about 8 KB of headroom.

**No ceiling change is proposed here.** The one that was drafted has been dropped
rather than applied, because it would have moved a number to accommodate a
measurement that was itself measuring the wrong set of files.
