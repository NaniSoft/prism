---
'@nanisoft/prism-ui': minor
---

SelectableTree picks a record out of a hierarchy

Adds `SelectableTree`, the Component a master and detail screen was assembling by
hand: a tree of records where the reader picks one and the pick is the record the
page shows beside it. A record carries a name, a supporting line, a leading mark
and a trailing fact; a chapter over records is a group and cannot be picked. The
pick is one value the caller holds and `aria-selected` states it, the whole tree
is one Tab stop with the arrows inside it, and Enter or Space picks the record the
reader is on, so browsing with the arrows never rewrites the pane beside it.

It is a second tree rather than a mode on `Tree`, because `Tree` navigates by
address and its own documentation refuses selection. Nothing collapses, the empty
case is authored, and the Component draws no frame: it composes inside
`ListPanel`, which owns the heading, the count, the toolbar and the scroll region.
