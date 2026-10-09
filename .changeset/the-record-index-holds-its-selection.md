---
'@nanisoft/prism-ui': minor
---

The record index draws typed columns and holds the selection set it was given

`DataTable01` widens rather than adding an Item, and the roster does not change:
every one of the in-scope screens is one job, a reader scanning rows and acting on
them, differing only in its columns, its keys, its filters and its sort key. No
`-02` is earned by it.

**The columns are typed data now, and the callback is gone.** `columns` is a
`readonly ColumnSpec[]` from `@nanisoft/prism-ui/spec` rather than an array of
`{ id, header, cell }`. `key`, `header` and `kind` are required on each column,
because a column a reader reaches without a name is a column every row announces
as untitled, and `kind` is drawn from Prism's own cell vocabulary rather than from
an HTML attribute. The row value at the column's key is the cell's content: a
single-node kind draws it as that Component's child, a structured kind takes it as
that Component's props, and the `slot` kind draws it as your own node inside the
header, alignment and sort affordance the Block draws. `DataTableColumn` and
`DataTableRowAction` are removed with it.

**Selection is required whenever the index is selectable.** `getRowId` is required
on the Block, because sorting, filtering, paging and deleting all move a row's
index and an index-keyed selection silently changes which records a batch action
acts on. `onSelectedIdsChange` is required on the selectable arm and `batchActions`
with it; the Block holds the set on its uncontrolled arm and reports every change
through the one callback, so mirroring the set is one line and ignoring it is zero.

**What is new on the surface:**

- `columns`, now `ColumnSpec[]`. `sortable` draws `TableSort` and reports the next
  direction through the new `sort` and `onSortChange`.
- `getRowId`, now required.
- `onSelectedIdsChange`, required on the selectable arm.
- `batchActions`, required on the selectable arm: one `ReactNode` the Block places
  in a bar that mounts only while the set is non-empty and displaces the filter
  controls. The Block draws the count and the dismiss and no command of its own.
- `renderRowActions`, replacing `rowActions`. A node per row rather than a declared
  action list whose handler was optional, so a row that looks like a command and
  carries none cannot be built.
- `sort` and `onSortChange`, for the ordered column.
- `selectRow` is now `(row) => string` so every checkbox names its record,
  `selectedCount` is the count the live region speaks, and `clearedSelection` and
  `dismissSelection` join it. `sort` is the words for the next direction.

**One polite live region carries the count**, never an assertive one, mounted while
there is an announcement; it speaks the count rather than a list of labels, and it
speaks the emptying as its own sentence rather than a count of zero. The visible
summary and the announced number are the same string.

**Nothing else is owned.** The Block fetches nothing, sorts nothing, filters
nothing and slices nothing, owns no action, no aggregate, no address and no second
pane. The detail pane reacts through your read of `onSelectedIdsChange`; no bridge
is built between the two.
