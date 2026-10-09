---
'@nanisoft/prism-ui': minor
---

The record detail draws one record and its relationships

`RecordDetail01` is a new Block: one record in full, its relationships drawn open
as one ordered list, and its own actions beside its identity. It is a Block rather
than a Page because the frame and the claim belong to a caller and a Page owns no
URL, so a detail Page would have to own the selection the consumer holds. It is
authored beside `Summary01` and `QuickView01` rather than by widening either,
because a summary exists to add up and a quick view is a transient dialog.

**Relationships are one declared list on one frame, not a card per relation.**
Each entry is a `RelationSpec` from `@nanisoft/prism-ui/spec` plus the words its
own empty frame needs, drawn in the declared order under one heading level inside
one bounded frame with one rule between them. The `kind` names a collection
arrangement this package already draws: `Table`, `ListPanel`, `Timeline`,
`AvatarGroup` or the caller's own `slot`. **Depth is one, and the bound is in the
type**: a relation's members never name `RelationSpec`, so a related record with
its own related records is a graph the consumer walks, reached by the caller's
`href` rather than by depth. The Block composes no disclosure anywhere.

**The record's actions are one optional node, placed in the record's own band.**
The Block renders no control of its own, there is no declared action union and no
destination arm, and the confirmation for a destructive action is the caller's own
`AlertDialog` composed around their control in the same slot. **A relation with no
members draws `EmptyState01` at a reason the caller names**, in the relation's own
frame, because a customer with no invoices is a collection that is empty and
`NothingChosen01` is a statement about a reader's pointer at the index beside the
pane, which this Block cannot be in. **The Block takes no total, no count and no
sum**: a relation's `count` is the caller's own string and is never derived from
the members, and a screen that wants a figure composes `Summary01` or `Stats01`
into the Block's `children`.
