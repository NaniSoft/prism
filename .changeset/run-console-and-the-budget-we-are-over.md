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

## The client budget is over, and this branch is why

`pnpm check` fails on exactly one thing, and it is not a defect in the new
components:

```
the all-client bundle is 93.1 KB gzipped, over the 92.0 KB ceiling
```

Measured with this branch's three client modules removed from the roster, the
bundle is **90.8 KB**, so this branch adds **2.3 KB** and crosses the line by
**1.1 KB**. The two modules responsible are `tree` and `command-palette`, and both
are client because they are interactive: one owns an arrow-key model and the other
owns a search field and a rank. Neither has fat to cut, because the weight *is* the
feature. `command-palette` measures 25.9 KB standalone but only about 1.2 KB more
than the `Dialog` it composes, which is the price of that composition.

**The ceiling has not been raised.** That number was chosen on purpose, the gate is
deliberately asymmetric (per-item budgets are soft judgements and print; the
all-client ceiling fails), and editing the threshold in the same pull request that
crosses it is the thing the gate exists to prevent. Raising it is a decision, and
it is not the agent's to make quietly.
