---
'@nanisoft/prism-ui': minor
---

The issue detail Block is deprecated in favour of the record detail Block

`IssueDetail01` is deprecated, not merged and not deleted. It is the same job as
`RecordDetail01` under a name that is wrong the moment the record is an invoice, an
order or a subscription, and a name that has to be wrong about nine tenths of its
uses is a name that fails the test that its name survives being wrong. The Item
still renders and is still supported for now, but nothing new should be started on
it, and a consumer composing a record detail today composes `RecordDetail01`.

**The published interface is unchanged.** This release marks the Item and changes
its JSDoc and its documentation; no export is removed, renamed or re-shaped, so a
consumer already composing `IssueDetail01` keeps composing it and can read the
release without moving. `IssueDetail01` and its four types stay exported from
`@nanisoft/prism-ui/blocks/issue-detail-01`. Its own field declaration stays with
it and is not migrated onto the shared field specification, because it is a label
and a value node a reader is entitled to be told about a record rather than an
input.

The catalogue entry carries the `deprecated` status, so the Item page shows a
deprecated mark, and the Item page and the record detail Block's documentation each
name the other, so a reader arriving at either arrives at the answer.
