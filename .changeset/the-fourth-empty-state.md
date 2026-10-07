---
'@nanisoft/prism-ui': minor
---

Add `NothingChosen01`, the resting state of a detail pane

`NothingChosen01` draws a region that can hold a record and has none chosen in it
yet: the caller's words, an optional sentence under them, and an optional mark of
the caller's choosing. It is a new Block beside `EmptyState01` rather than a fourth
reason on it, and the difference is the shape of the claim rather than a matter of
taste.

The three reasons `EmptyState01` takes are all statements about a collection:
nothing ever existed in it, the reader's own filter emptied it, or this reader may
not see it. The dashed frame and the height floor those three share assert
something that follows from all three together: there is nothing here to read.
Nothing chosen is not that. No collection has been emptied, filtered or hidden, the
records are in the index a few centimetres away, and what is missing is the
reader's pointer at one of them. A fourth arm would have had to keep that frame
honest while a readable region sat next to it, which is the failure the separate
Block exists rather than to commit.

So the Block ships no reason value, because one cause is not a choice a caller
makes; no default sentence and no fallback, because the words are entirely yours;
no frame, for the reason above; and no action. That last one is not an omission. A
Block ships no behaviour, so a control here would be either one this Block cannot
wire or a second copy of an affordance the index beside it already draws for the
same reader, and `scripts/check-block-controls.mjs` has nothing to catch in a
source that contains no control.

It also declares no height floor. A pane in a grid is already as tall as its
neighbour, so a `min-h` authored here would be a second answer to a question the
split's tracks have already answered. What the Block does is fill the height it is
given and centre itself in it.

Two things it inherits rather than re-derives: the icon is a slot drawn
`aria-hidden`, because a mark a screen reader reads is a second announcement of
something the words already say, and the title is a `<p>` rather than a heading,
because the pane outlives its contents and an outline entry that vanishes on the
first click is an entry a reader navigating by heading cannot follow.

The split's tracks hold their ratio at every selection state, so the list never
moves out from under the hand that clicked it. What changes is content, and a
caller who wants the index louder makes the index denser, which is the index's own
decision to take.