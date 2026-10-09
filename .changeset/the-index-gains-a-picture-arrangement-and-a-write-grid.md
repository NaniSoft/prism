---
'@nanisoft/prism-ui': minor
---

The index gains a picture arrangement and a write grid

Two coverage gaps in the record-index territory are closed by authoring two Blocks
rather than by widening a union, and each is the arrangement `DESIGN.md` already
named as forcing a second Item.

**`CardIndex01` is the record index as pictures.** It draws a set of records as a
grid of cards rather than as rows, with the caller composing each card's picture,
name and price through `renderCard` and its per card actions through
`renderCardActions`. It shares the record index's selection and announcement
contract, which ticket 166 made the law for the index family: the same `selectable`
union, the same held set of keys, the same three-state header control, the same
single polite live region carrying a count, the same batch bar around the caller's
own `batchActions` node, and the same `selectionScope` distinguishing a page-wide
selection from a filter-wide one. It fetches, sorts, filters and slices nothing.

**`RecordGrid01` is a grid edited in place.** Its columns are the shared
`FieldSpec`, because a cell that writes is a control and the only vocabulary this
package publishes for a control is the field specification; `ColumnKind` is the
vocabulary for a value a reader reads and is held disjoint from it. The Block seeds
each cell from the caller's row, holds the in-progress values so a cell redraws as
it is typed, and reports every edit through a required `onCellChange` as the row
identity and the column key. It fetches nothing, sorts nothing and pages nothing,
and it owns no command.

**Why `ColumnKind` was not widened.** The obvious alternative was an editable cell
arm on `ColumnKind` plus a change callback. That arm would name a field Component
(`Input`, `Select` and their kin), which is a member of `FieldKind`, and
`scripts/check-spec-unions.mjs` reports it as an `overlapping-union` between the
read union and the write union, in the same run that would otherwise pass. The
disjointness the gate protects is exactly the fact that a cell that writes is a
different job from a cell that reads, so the answer is a new Item that takes the
field union rather than a wider column union.
