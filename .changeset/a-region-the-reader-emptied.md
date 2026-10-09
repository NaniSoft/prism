---
'@nanisoft/prism-ui': minor
---

Add `emptied-by-reader` to `EMPTY_REASONS`, for a region the reader emptied

`EmptyState01` takes a fourth reason beside the three it takes today: a region
whose records were there and that this reader's own earlier action moved every one
of them out of. A bin, an archive or a recycle view a reader has just cleared is
the case it exists for.

**A member on a published union, not a new Block and not a catalogue row.** The
existing `EmptyReason` type gains its fourth member and the changeset says so
because a consumer's own code that enumerates the union now has one more case to
handle. `EMPTY_REASONS` is published through
`@nanisoft/prism-ui/blocks/empty-state-01` beside the Block, and `catalog.ts`
holds the same number of rows it held before, because a union member is a value on
an existing exported type rather than an Item: it has no slug, no page, no Demo
and no corpus entry of its own.

**It is a fourth reason rather than a fourth Block because it is a statement about
a collection, which is what the other three are.** Each of them answers what
happened to the set the region would have drawn, so the frame they share stays
true of all four: there is nothing here to read, and the frame makes no claim
about why. A bin the reader emptied has nothing readable beside it, so the shared
frame is honest there. That is the whole difference from `NothingChosen01`, which
is a statement about a reader's pointer at a record and whose records are all
still there: it draws no frame, it is a separate Block, and the two arguments
argue the same line from opposite sides.

**Two of the four are the reader's own doing and they are not the same doing.**
`no-match` hides rows out of a set that is still there, so clearing it brings them
back. `emptied-by-reader` is a record gone from the live set rather than hidden in
it, and the reader put it there. Every saved view a caller builds out of the filter
values it holds is already `no-match` whenever it comes back empty; a trash view
is the one that differs in kind, because it fetches a different collection rather
than narrowing this one. So the two members differ in exactly the fact a reader
must be told honestly, and one sentence for both would tell a reader who has
deleted everything that their own search found nothing. Both are named in the
JSDoc on the union, which the emitted declarations preserve and the corpus reads.

**It renders no control, and the Block already had that arm.** The reason takes
the caller's `title` and an optional `body` and nothing else, because a reader who
has deleted nothing has nothing to restore and the records a restore would bring
back are the caller's own nodes in the index around this region. `EmptyState01`
has never rendered an action without an `actionLabel`, so the member adds no
render branch, no prop and no gate exemption: `scripts/check-block-controls.mjs`
is green on the source exactly as it was, and the one control in it is still the
`Button` behind that label.

It carries no ink either, for the reason the Block gives: nothing is broken,
nothing is missing, and nobody is blocked. `REASON_INK` is unchanged, so the only
reason drawn in `muted-foreground` is still the permission boundary.