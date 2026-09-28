---
'@nanisoft/prism-ui': minor
---

Add `LiveRegion`, a region that announces what just changed in it

Prism had no live region at all, so a result list that filtered as you type, a
search whose count updated, and any stream that appended to the page all changed
silently for anyone using a screen reader. The fourth Kind the design rules
already decide, `live`, is specified to own an event log surface, and an event
log surface is a live region, so this is the prerequisite rather than a
convenience.

```tsx
<LiveRegion busy={streaming} label="Run output">
  {lines.map((line) => (
    <p key={line.id}>{line.text}</p>
  ))}
</LiveRegion>
```

Three decisions are in the Component rather than left to each consumer to make
the same way:

- **It renders nothing when it has nothing to say.** A live region that is
  always present announces every unrelated state change of its ancestors, so an
  empty region is not rendered at all rather than rendered as an empty element.
  The test is "renders nothing" rather than a list of the nothing values, because
  an empty string, a null state and a false condition are three routes to it and a
  list of three is a list a fourth route would miss.
- **The politeness default is the least interruptive value still announced.** A
  run log that announces assertively interrupts a screen reader mid-sentence, and a
  consumer with a genuinely urgent event passes `politeness="assertive"`.
- **`aria-busy` is about the caller's knowledge, not about an animation.** A busy
  region is still readable, and a caller that sets it permanently has told
  assistive technology the stream never ends.

The component owns the region and not the transport. A consumer owns the socket,
the retry, the persistence and the order events arrive in, which is the same split
the documentation Page makes with its navigation, and it is why Prism stays
transport-agnostic and no consumer inherits a connection it did not ask for.
