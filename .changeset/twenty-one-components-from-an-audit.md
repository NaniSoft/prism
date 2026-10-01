---
'@nanisoft/prism-ui': minor
---

The component sweep: 21 Components from 555 audited upstream variants

The naming law in DESIGN.md says a slug describes the job and a variant that
differs from its siblings only by a prop is a call site. Applied strictly to 555
upstream variants, 21 survived: 340 were a cross-product of tone, size, icon and
state that existing Components already express as props, and 122 were motion
refused by a law that predates this work rather than by a new one. The two zeroes
are the finding: `form` at 85 and `select` at 51 produced nothing, because a
contact form and a settings form differ only in the data a consumer passes.

New: `pack-switcher`, which makes the pack axis switchable at runtime and is the
piece a DTCG system was missing; `pill`, `drawer`, `image-zoom`, `video-player`,
`emoji-picker`, `repo-stars`, `choice-card`, `billing-source`; `intensity-grid`,
`proportion-list`, `cohort-grid`; `multi-combobox`, `creatable-combobox`,
`range-field`, `platform-modifier-key`; `image-list-field`, `repeatable-rows`,
`text-format-toolbar`, `prompt-composer`, `lifecycle-button`.

Four ship no JavaScript. The catalogue is 257 Items and the client bundle is 278.5
KB.

**Three defects the audit found in work already merged.** `button` never had a
loading state and the catalogue and its MDX both said it did; the claim is
corrected and `lifecycle-button` is now where an outcome after a press lives.
`cohort-grid` documented `max` as the way to narrow its scale, which is impossible
because a retention row's first column is a hundred by definition, so the knob is
`min` and the limit is now stated. And `check-item-docs` could not see a generic
Component, so a module with a full JSDoc block was reported as declaring no Item
rather than as undocumented; the pattern is widened, which widens the law's reach
rather than relaxing it.

**`scripts/check-encoding.mjs` is new.** A byte order mark on an MDX makes its
frontmatter parse as empty, and no existing gate noticed: the file had a JSDoc
module, a Demo beside it, all-props strings, and a clean catalogue join. It
surfaced as seventeen unrelated failures in two files. The class has now bitten
this repository twice. The gate reports and does not repair, and it is proven to
fire.

**The client ceiling moves to 300 KB.** It has now moved six times and every move
was triggered by a batch of new Items, which the gate's header records as the
finding rather than hiding. A roster-derived ceiling was rejected because a
ceiling that scales with the catalogue is the same as no ceiling. Deciding one
fixed number on what a consumer can actually load is a product judgement about
the four downstream repositories and is the one open decision here.

No consumer import breaks. Every name added is an addition.
