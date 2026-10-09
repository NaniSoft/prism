---
'@nanisoft/prism-ui': minor
---

The record index groups by a key on a row and announces the two selection scopes differently

`DataTable01` widens again rather than adding an Item, and the roster does not
change: a grouped index is the same job with a `groupBy` on a row, not a second
arrangement, so no `-02` is earned.

**Grouping is a key on a row.** `groupBy` takes a row and returns the key it
belongs to, or `undefined` for an ungrouped row, and `groupLabel` names the
heading the Block draws above each run of rows that shares one. The two are a
single arm: `groupLabel` is required wherever `groupBy` is set, because a heading
with no words is a blank row. The Block never reorders the rows it was handed, so
same-key rows must arrive adjacent and a run of them is one group. A group heading
is a row in the same body as any other, and it is not a record: it is never in
the selection set, never in the count and never in what the header's page scope
covers, so forty headings over four hundred rows select four hundred records and
say so.

**The two selection scopes are announced differently, and the filter scope's
number is the caller's.** `selectionScope` is new and is a union. Its page arm is
the default and the Block speaks `labels.selectedCount` over the keys it holds.
Its filter arm reports that the whole matching population is selected and carries
a required `count` from the caller, and the Block speaks
`labels.selectedAllMatching(count)` rather than printing the page as if it were
the total. The Block owns no control that selects a population it cannot see: the
caller selects in its own store and reports the scope here.

**What is new on the surface:**

- `groupBy` and `groupLabel`, together, for a grouped body.
- `selectionScope`, a `DataTable01SelectionScope` union, for the page or the
  filter scope.
- `selectedAllMatching`, a required `labels` member: the summary and announced
  sentence for the filter scope. `selectedCount` is now the page-scope sentence,
  and it should say the page.

The per-row prop that went and the node that replaced it are named in the record
index selection entry in this release: `rowActions`, a declared list of action
objects with an optional handler, is gone, and `renderRowActions`, a node per row,
replace it, so a row that looks like a command and carries none cannot be built.
