---
'@nanisoft/prism-ui': minor
---

Landing band blocks centre their section headings

`FeatureGrid01`, `NoteGrid01`, `ProcessFlow01`, `ProcessRail01`, `StackGrid01`,
`StatusLedger01`, `ProductGrid01`, `LogoStrip01`, `Stats01`, `Testimonial01` and
`Bento01` now centre their section heading and its lede above the band's
content, because a page whose job is to persuade opens every band that way and
the blocks the landing pages compose centre together, so one page never mixes
the two. The rule has run in both directions, and the history is recorded where
the law lives: `SectionHeading`'s documentation states the tier rule, and
`test/section-heading-align.test.tsx` holds the centre roster, so a Block joins
it as a listed decision.

`left` stays where a reader is working rather than deciding: every operate and
reading Block keeps its heading flush left, and copy that sits beside media
stays left too, which is now pinned by a `MediaBand01` row in the same test.
`Hero01` keeps its own `align` and `Cta01` is unchanged. A consumer landing page
sees the change without editing anything; a page that wants the old arrangement
on one band cannot opt out per call site, because alignment is a catalogue
decision and the no-override-path rule is why.
