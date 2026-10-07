---
'@nanisoft/prism-ui': patch
---

The log and event stream is the record index drawing event rows

A delivery log or a console events screen is the record index, `DataTable01`,
drawing rows from the shared event specification, `EventSpec`. No Item, Kind or
Page is added: a log gains a filter region, a second axis on which entries are
compared and a page boundary, and every one of those already belongs to the record
index rather than to a rail. The row type is the shared event specification, and no
sixth event shape is minted for a log or a console.

A screen that wants the events of one record composes `ActivityFeed01`; a screen
that wants to find one entry among many composes `DataTable01`. The Block composes
no disclosure: seeing one entry in full is a destination the caller names with its
required words, expanding a payload in place is the caller's own `Collapsible`
placed in a `slot` cell, and taking an identifier away is the caller's own control
beside a code block. No prop changed; this release adds the Item documentation, the
Demo and the JSDoc that record the arrangement.
