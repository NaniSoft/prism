---
'@nanisoft/prism-ui': minor
---

Add the overlay and menu substrate: alert dialog, context menu, hover card, menubar, navigation menu, sheet, collapsible and resizable

The eight Items that every menu-shaped surface in a product otherwise hand-rolls.
Each is composed on the Base UI primitive rather than reimplemented, because focus
trapping, portals, dismiss-on-outside-press and escape handling are four behaviours
that are already correct there and four chances to get one wrong here.

Each one makes a decision a consumer would otherwise make badly:

- **`alert-dialog`** removes dismissal from the *type*, not just the default.
  `modal` and `disablePointerDismissal` are omitted from its props, so a caller
  cannot pass a value that re-enables outside-press dismissal on a surface whose
  subject is a decision. Escape still closes, and there is no corner X, because an X
  is a third answer to a question with two. `AlertDialogAction` is its own part,
  styled destructive by default, because the one button that must exist is that one.
- **`context-menu`** knows which rows are commands and which are destinations.
  `ContextMenuItem` is a `div role=menuitem`; `ContextMenuLinkItem` is a native
  anchor. Two parts rather than one, so the "open in a new tab" case cannot be a div.
- **`hover-card`** can never be the only route to what it shows, which is what makes
  its delay safe. The trigger is a real anchor, so a long delay costs a reader
  nothing, and `delay` is a prop because a pointer rest is a fact about the reader.
- **`menubar`** is one Tab stop and owns the arrows inside itself, and it requires a
  `label` because nothing announces a bar until focus lands on it.
- **`navigation-menu`** knows it holds links, so it ships no command part at all, and
  a closed group holds no links with `keepMounted` as the stated seam.
- **`sheet`** is the Dialog with an edge. `side` is required and excludes `center`.
  All six overlay behaviours are inherited, not reimplemented, and a sheet dismisses
  on an outside press, which is the contrast with the alert dialog.
- **`collapsible`** wires the trigger and the region with the library's own
  `aria-controls` and `aria-expanded`, and unmounts the closed panel so find-in-page
  and a screen reader see the same page the reader does.
- **`resizable`** puts the whole behaviour on a focusable `separator` with a value,
  and remembers nothing: the position is a prop and a callback, because a design
  system cannot know a reader's panes.

**`resizable` is not composed on Base UI, because Base UI 1.8.0 ships none.** The
package's exports were enumerated and there is no `./resizable` and no `Resizable*`
symbol, so the separator role, the focusable-divider keyboard model and the pointer
drag are authored here. That is the one hand-rolled overlay in the batch, and it is
confined to the three things an overlay must not reimplement, none of which a
divider needs. It should be revisited when Base UI ships one.

The focus-indicators gate test no longer pins which slot happens to sort first in
the composite-widget bucket, nor the exact excluded total. Every additional menu in
the package adds members to that bucket, so both were tests that failed when a
correct Component was added. The count is now bounded from below, which is the
invariant that holds as the tree grows.
