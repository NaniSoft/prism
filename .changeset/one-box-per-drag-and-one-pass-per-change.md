---
'@nanisoft/prism-ui': minor
---

`OverflowActions` and `ResizableHandle` read layout when it can have changed

Neither Component's rendered output changes for a caller who composes them the way
their own documentation says. What changes is how often each of them asks the browser
to settle layout, and a table of rows or a page of dragged panes pays that on the main
thread in the middle of a reader's work.

`OverflowActions` measured itself after every render of every row, reading the row's
own box, the cap and every drawn action, and writing the answer back as state. **A
pass now runs on mount, when the actions' ids or their labels change, when `className`
changes, when the row's own box changes, and when the page's fonts have finished
loading.** Passing a fresh `actions` array on every render now costs nothing, which is
the ordinary case in a table cell under a filter box. **The fonts are in the list
because a self-hosted face swaps in after the first paint and changes the width of
every drawn action without changing the row's width**, so nothing else reported it, and
a row measured in the fallback face was a row whose widths were never true of the page
the reader was looking at.

`ResizableHandle` read the group's box on every `pointermove`, immediately after the
frame before had written the new position and therefore written new styles: one forced
synchronous layout per frame of every drag. **The box is read once at `pointerdown`,
and every frame after that is arithmetic.** A drag measures from the press rather than
from the divider's own box, which is what a divider a pixel wide and a reader takes
hold of wherever their pointer lands requires, and it did that before.

Two cases are pinned rather than handled, and both are written down in the JSDoc and
the site page:

- A group resized by something else part way through a drag finishes that drag against
  the travel it started with. A caller who needs a drag that follows a changing group
  ends that drag and starts it again.
- `OverflowActions` cannot see a change that leaves both the row's box and its drawn
  content exactly as they were: an ancestor's font size changing, or an action's mark
  swapped for a different-width one while that action is drawn. Both used to be
  corrected by the row's next render and neither is now.

The bump is `minor` because those two are behaviour a consumer can observe, even though
no prop, import or rendered element changes.