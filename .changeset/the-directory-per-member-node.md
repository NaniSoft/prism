---
'@nanisoft/prism-ui': minor
---

`Directory01` gains a per-member node

`Directory01` takes a new `renderMemberAction` prop: a function from a member to a
`ReactNode` the Block places at the member's trailing edge, in both the card and the
row arrangements, and draws nothing of its own where it is not passed.

**The control and its handler are the caller's, and that is why it is a node.** A
directory is a browse, so a plugin or model row's enable is a property of a member
rather than a command on a selection, and `scripts/check-block-controls.mjs`
classifies `Switch` and fails a Block that renders one without its handler. A Block
ships no behaviour and so cannot supply one, so the enable arrives as the caller's
own node, in the shape `DataTable01`'s `renderRowActions` already takes.

No new Item and no new catalogue entry: the change is a prop on an Item that ships,
with its JSDoc, its Demo and its test.
