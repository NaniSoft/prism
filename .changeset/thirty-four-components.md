---
'@nanisoft/prism-ui': minor
---

Thirty-four Components, and the audit that refused the other thousand

Component coverage of the upstream catalogue is complete. 1,026 variants were
audited against the naming law and 34 shipped: 392 were a cross-product of tone,
size, shape, icon or state that a shipped Component already expresses as props, and
the rest were motion refused by a law that predates this work.

The zeroes are the result. `form` (85) and `select` (51) produced nothing, because
a contact form and a settings form differ only in the data a consumer passes.
`table` (38), `avatar` (34), `skeleton` (30), `dropdown-menu` (30) and `sheet`
(30) produced nothing for the same reason, and `skeleton` at 30 is six groups of
five, each one a different arrangement of the same placeholder rectangles.

New: `reorderable-list`, `checklist`, `form-dialog`, `form-wizard`, `stateful-table`,
`nested-tabs`, `mega-menu`, `task-progress`, `split-button`, `stepper`,
`overflow-actions`, `selection-toolbar`, `money-field`, `intensity-grid`,
`proportion-list`, `cohort-grid`, `multi-combobox`, `creatable-combobox`,
`range-field`, `platform-modifier-key`, `image-list-field`, `repeatable-rows`,
`text-format-toolbar`, `prompt-composer`, `lifecycle-button`, and the nine from the
category sweep: `pack-switcher`, `pill`, `billing-source`, `drawer`, `image-zoom`,
`video-player`, `emoji-picker`, `repo-stars`, `choice-card`.

Five of the new ones exist because two Components disagree and the disagreement
is the defect: `split-button` joins a trigger and a menu trigger into one shape,
`stepper` clamps two controls at one bound, `overflow-actions` moves actions into
a menu when the row runs out, `selection-toolbar` and `text-format-toolbar` take
opposite positions on whether focus may move, and `nested-tabs` orders two tab
axes that look identical. A boolean cannot express a conflict.

**`form-dialog` is the largest single job found, at 22 upstream variants** across
`dialog`, `alert-dialog` and `popover`. All three ship a container and none owns
what happens between the reader pressing submit and being able to act on the
answer.

**`pack-switcher` makes the pack axis switchable at runtime**, which is the piece
a DTCG system was missing. `video-player` owns no player engine and ships no
JavaScript. `money-field` holds a number for the caller and a locale-formatted
string for the reader at the same time, and the round trip is the Component.

Four defects the audit found in work already merged are fixed in this release, and
each was found by a job that did not exist to find it: `button` never had a
loading state and two documents claimed it did; `cohort-grid` documented a scale
knob that cannot be moved because a retention row's first column is a hundred by
definition; `check-item-docs` could not see a generic Component, so a module with
a full JSDoc block read as declaring no Item rather than as undocumented; and a
byte order mark on an MDX makes its frontmatter parse as empty with no gate
noticing, which is what `scripts/check-encoding.mjs` now exists to prevent.

The catalogue is 270 Items and the client bundle is 286.2 KB, inside the 300 KB
ceiling without moving it, because nine of the thirteen newest compose Components
the bundle already carries. 34 Components across two passes cost 47.6 KB of
aggregate where the sum of their individual measurements is several times that.

No consumer import breaks. Every name added is an addition.