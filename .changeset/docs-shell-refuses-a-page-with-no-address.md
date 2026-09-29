---
'@nanisoft/prism-ui': minor
---

`DocsShell` refuses a page with no address, and renders a link with no words as a label

**This is a behavioural change and the honest reading of it is that a previously
rendered page now throws.** Two leaks fed it. `DocsNavGroup.href === undefined` was
the only guard, so `href: ''` fell to the anchor arm on both arms of the union, and
`flatten` copied the same value into `Neighbour`, so one bad row published a second
broken link in the pager. `title: string` admitted `''` on both arms, rendering a
link announced as "link" and nothing else. Nothing in the type could stop either,
and the Component's own JSDoc claimed that it could.

An anchor with an empty `href` is a control a keyboard can reach and cannot operate,
so the fix is at the tree rather than at the rendering: one pass over both `nav` and
`toc` at the top of `DocsShell`, before anything renders, and a **page** with a
blank address throws, naming the tree and the entry. Only the page arm is refused. A
group with no address has a documented rendering, and a page has nothing to render
in place of the link, so a label there would hide a page the tree is missing rather
than report it.

**Blank counts as absent, and that is required rather than pedantic.** All three
consumer adapters write `url: node.index?.url ?? ''` for a folder with no index, so
on the group arm `''` is the documented "no route" state and must render as a label.

**A second bug surfaced while fixing the first.** `containsHref` read the group's
address directly, and `under('', currentHref)` is `currentHref.startsWith('/')`,
which is true for every absolute address. Treating `''` as "no address" in the
renderer without fixing this would have made every label-only section claim to be
the current one at once, so it reads through the same helper the renderer uses.

The rail and the pager now ask one function whether an entry is a destination, so a
row that is a label on the rail cannot become a neighbour in the pager.
