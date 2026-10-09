---
'@nanisoft/prism-ui': minor
---

Add `@nanisoft/prism-ui/spec`: one shared specification module, and the gate for it

This adds published surface and changes no existing one. Nothing you compose
differs today; what changes is that five screens worth of declared content now
have one declaration each instead of several that disagree, and that the
declarations are held by a gate rather than by review.

**The five specifications.** `FieldSpec` and `FieldSpecGroup` describe the fields
a write form, a wizard or a settings region renders, in the order the array is
written. `ColumnSpec` describes a column of a record index. `RelationSpec`
describes one relationship of a record, one ring deep. `MetricSpec` describes a
figure taken over a population. `EventSpec` describes one dated, attributed
occurrence. Every one of them is plain serialisable data: no validator, no
constraint object, no schema, no pattern, no callback. That is what lets an agent
read one out of a document, and it is why validation is yours entirely.

**Three closed unions, and the one arm that is an escape rather than a catch-all.**
`FieldKind` names the input Components this package ships, `ColumnKind` the
reading Components, `RelationKind` the collection arrangements already drawn. Each
carries a `slot` member for the control, cell or arrangement you draw yourself, and
Prism still draws the shell around it: the label, the help, the error, the header,
the alignment, the frame. A `props` bag would have been the alternative and would
have put the hole back.

**What is deliberately absent, so that you are not waiting for it.** A
specification carries no rule and no validator, because a Block ships no behaviour
and evaluating a rule is behaviour; `required` stays, and it is the mark and the
HTML attribute rather than a check. A metric carries no period, because a
comparison needs a period and a billing screen's month is not a trading screen's
week: the words for it go in `deltaFormat` and `hint`, in your own units. An event
carries no `kind`, no immutability, no retention window and no time axis, because
no enumeration of what your product calls a thing that happened is ours to publish
and because a drawing has no authority over the store behind it. A relation holds
members and never another relation; a descendant is reached by a link you pass.

**The gate.** `packages/ui/scripts/check-spec-unions.mjs` reads the emitted
declarations rather than the source, because that is the seam your editor
resolves. It fails when a union member names something this package does not
ship, when two of the three unions claim the same member, when a specification
grows a validator, a rule, a schema, a pattern, an immutability claim, a retention
window or a time axis, when an event grows a `kind`, and when a relation holds a
relation. Before it existed, every one of those was accepted by every gate in the
repository, because a specification type is not an Item and no catalogue gate reads
the module at all.

**One thing it does not hold, so you know what a green run means.** It does not
hold that there is one shape per concept: a second declaration of the field, column,
relation, metric or event shape would be named differently from the first, and the
rule that would catch it would be a list somebody maintains. That is held by review.

**The surface gate's internal boundary moved with it, in one direction only.**
`packages/ui/src/lib/` is where the internal helpers live, but the `exports` map is
what decides: a declaration under it that a published entry reaches is public
surface and the surface gate reads it, and one that no entry reaches is still
internal and still has to be declared. `dist/lib/spec.d.ts` is the first such file.
Nothing under `dist/lib` was declared internal and then undeclared, and no published
subpath was removed.