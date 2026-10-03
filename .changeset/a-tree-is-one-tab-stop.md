---
'@nanisoft/prism-ui': minor
---

A tree is one Tab stop, and no node claims to collapse

`Tree` documented a mechanism it did not have and shipped a state it could not
honour. Its JSDoc said "a tree is one Tab stop, and the arrow keys move inside it.
That is the ARIA pattern" and then described the roving tabindex that makes it true,
and no `tabIndex` appeared anywhere in the file: a forty-node rail was forty Tab
stops. A comment in the same file argued the other way, and it was wrong on its own
terms, because it deferred the keyboard model to "a caller's own keyboard model" in a
Component that does not forward `onKeyDown` and therefore has no caller's model to
defer to.

The roving tabindex is now implemented, in the shape `ToggleGroup` already uses: the
stop is an address rather than an index, so a caller who reorders or removes nodes
does not strand the reader; it lands on the current address when the tree has one and
on the first destination otherwise; and it follows the reader once the arrows move
it, so Tab away and back returns them to where they were. The fallback and the
current address are not two answers: a `currentHref` naming another page is ordinary,
and reading either rule alone would give the tree two tab stops.

**Nothing collapses, so nothing claims to.** Every group with children carried
`aria-expanded="true"`, hard-coded, which promises a second press that folds nothing
away. A node that cannot expand omits the attribute, and `aria-level` is what places
a node in the tree for a reader who wants that instead.

**Two regions announced their bare role name.** `SelectionToolbar` drew the words
"3 selected" in its leading label and pointed at nothing, so a reader tabbing onto
the row heard "toolbar" and no more; it is now named by `aria-labelledby` on the
label, which works for the `ReactNode` label the count requires and cannot drift from
the words on screen. `ToggleGroup` declared `aria-label` optional while its own JSDoc
said the prop was required, so TypeScript enforced nothing and a group shipped
unnamed in both of its roles. See the separate entry for the type change.

To know before you style against it: `Tree` now writes a `tabindex` on every
destination, so a page with two trees has two Tab stops where it had one per node.
