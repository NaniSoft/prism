---
'@nanisoft/prism-ui': minor
---

The record detail draws a dated trail as one of its relations

`RelationKind` gains the `ActivityFeed01` arm, so a record's event history is a
first-class relation drawn over `EventSpec` values rather than the generic `slot`
arm. The union previously offered only `Timeline`, whose `TimelineEntry` carries a
`duration` and a `state` and no `at`, so a record's dated occurrences had no
relation to draw them. A `Timeline` is an instrument and a trail is not, so the fix
is a new arm and not a moment on `TimelineEntry`: one Component carrying both a
moment and a duration would be a second answer to a question that already has one.

`RecordDetail01` draws the arm with the shared `ActivityFeed01` Block, exactly as
it draws the other arms, and its relations are unchanged otherwise. The roster does
not change: this widens an existing union and an existing Block, and no new Item,
Kind, Page or catalogue entry appears.
