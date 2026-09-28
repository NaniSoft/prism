---
'@nanisoft/prism-ui': minor
---

Add `Meter`, so a bounded measurement can show the limits it is approaching

A disk at 95 percent and a test at 95 percent are the same reading until you say
where the line is. Prism had a Progress for a task moving toward an end whose
length is not known in advance, and nothing for a quantity that already has an
answer against a limit the caller knows.

```tsx
<Meter
  value={97}
  label="Storage used"
  valueText="97 gigabytes of 100"
  thresholds={[
    { at: 80, tone: 'warning' },
    { at: 95, tone: 'destructive' },
  ]}
>
  <span>97 of 100 GB</span>
</Meter>
```

**The thresholds are the design.** A fill on its own is one number, and a number
with no limit beside it cannot be acted on. Drawing the caller's own limits as
notches on the track puts the boundary next to the reading, so a consumer passing
a latency budget gets a latency budget rather than a generic bar filled to a
similar fraction. The Component has no opinion about which numbers matter.

**It stays neutral below every threshold.** It can see that a value is 40 percent
of a maximum; it cannot see that 40 percent is a problem. The same number is
routine on a latency budget and urgent on a disk quota, so a Component that
coloured itself would be making a claim about the caller's product on the
caller's behalf.

**It is drawn as a hairline with ticks, not as a bar.** The Progress in this system
is a two-pixel rounded trough, and a Meter that looked like one would be read as
one. The difference is visible before it is read.

`role="meter"` rather than `progressbar`, which is the ARIA distinction the whole
Component turns on, and assistive technology reports the two differently. It is
not a live region: the change that moved the reading is usually the thing worth
announcing, so a consumer that wants it announced wraps it in a `LiveRegion`.

Two failures are handled rather than rendered, because neither is visible in a
screenshot. A value past the maximum is clamped to the track instead of drawn
past its end, and a scale whose minimum equals its maximum draws an empty track
instead of a `NaN` width, while still measuring.
