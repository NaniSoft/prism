---
'@nanisoft/prism-ui': major
---

The activity trail takes the shared event specification

`ActivityFeed01.events` is now an `EventSpec[]` from `@nanisoft/prism-ui/spec`
rather than the Block's own `ActivityFeed01Event`, and that local type is gone from
the published interface. The trail is the activity feed Block widened, so no new
Item appears beside it: a shipment's chain of events, an issue's whole history and a
transaction's trail are record details, and the trail's own entry declaration is the
one declaration of a dated attributed occurrence every Block in this package takes.

An entry carries a stable `key` that is never the words of a label, a moment printed
exactly as the caller passed it with the machine value on the element, a required
`actor` and `action`, an optional `target`, an optional `detail` node, a `tone` whose
`toneLabel` is required wherever the tone is set, and a destination whose words are
required wherever it is set.

The specification names no vocabulary of what happened: there is no `kind`, because
a closed union is legitimate only when its members are Components this package
ships, and a caller needing one puts the word in `action` or composes a status into
`detail`. Immutability is a rendering fact and nothing more, so there is no
`immutable` prop, no seal glyph and no verification mark. A trail draws a moment and
never a length, so there is no scale, no range and no axis, and the Block owns no
retention window, archive, purge, legal hold, export or as-of clock.

# Migration

- Replace `ActivityFeed01Event` with `EventSpec`, imported from
  `@nanisoft/prism-ui/spec`, on the `events` prop.
- Rename each entry's `id` to `key`.
- Move the tone's label to `toneLabel` wherever `tone` is set.
- Remove any `kind`, `immutable`, seal, verification, scale, range, axis or
  retention member: the specification does not carry them and does not accept them.
  Put a happened- word in `action`, and compose a status into `detail`.
