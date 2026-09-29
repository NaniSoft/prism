---
'@nanisoft/prism-ui': minor
---

Add `Timeline`, so a run of events can be read for where the time went

A run's events in order answer "what happened" and are silent on the only other
question anyone has about an agent run, a deploy or an import: which step was
slow. Today that means reading every number and doing the arithmetic.

```tsx
<Timeline
  entries={[
    { id: 'plan', title: 'Plan', duration: 900 },
    { id: 'read', title: 'Read feed', duration: 4200 },
    { id: 'edit', title: 'Edit source', duration: 1200 },
    { id: 'done', title: 'Ready' },
  ]}
  label="Run steps"
/>
```

**The bars share a left edge and are scaled against the longest step in the run.**
That is the whole idea, and the relative scale is the deliberate choice: the shape
of the run is the question, and a shared zero baseline would be a second axis
nobody reads. The consequence worth stating is that the bars answer "which step was
slow" and deliberately do not answer "how long did the run take", because only the
caller knows whether its steps ran sequentially or overlapped.

**A step with no duration draws no bar.** A run's opening event has no length, and
a zero-width bar beside it would read as "this was instant" rather than "this has
no duration", which are different claims and only one is true.

**It is an ordered list, so the sequence and the count are in the accessibility
tree.** The marks and spine are `aria-hidden` on the rail that holds both, and the
entry's own words carry the state, so nothing depends on a reader distinguishing
the marks. It is not a live region: a run still arriving is normally wrapped in a
`LiveRegion` by the caller, because announcing the list itself would re-announce
the whole run on every append.

Three degeneracies are handled rather than rendered, and all three are invisible in
a screenshot: a run where no step reports a duration draws no bars rather than
dividing by nothing, a zero duration does not win the longest-step comparison and
scale everything else away, and the spine stops at the last entry rather than
trailing past the end of the run as though a step had not arrived.

The four states are a different vocabulary from the four product-capability tiers
a `StatusLedger01` row carries, and they are two lists about two subjects rather
than two lists about one: a `planned` agent run is a category error and a `failed`
capability is a category error, which is the test that tells them apart.
