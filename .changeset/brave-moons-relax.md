---
'@nanisoft/prism-ui': patch
---

Render `Sparkline`'s hidden numbers table without the `Table` Component's scroll container

The readings behind a `Sparkline` are published to assistive technology as a
table in a visually hidden wrapper. The wrapper is one pixel wide, so the
horizontal scroll container `Table` wraps its table in always computed
scrollable and never focusable, which the `scrollable-region-focusable` rule
fails on wherever a `Sparkline` renders. The hidden table is now plain `table`
markup with the same caption, row heads and cells: a table nobody can see
cannot be panned, and the semantics are the whole of what it owes.
