---
'@nanisoft/prism-ui': patch
---

Align `FeatureGrid01` and `Pricing01` section headings left

Both Blocks rendered a centred heading over a grid of cards, and `SectionHeading`
states that `left` is right for a section with content under it. Every other Block
that opens with a heading already aligned left, so a page composed from Blocks put
these two headings out of step with the rest of the page. No prop changed, so no
call site does; a consumer relying on the centred heading was overriding a default
rather than setting a value.
