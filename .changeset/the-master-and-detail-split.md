---
'@nanisoft/prism-ui': minor
---

Add `IndexDetail01`, the master and detail split

`IndexDetail01` is a composition Block that renders an index pane beside a detail
pane and holds no selection state at all. Selection, routing and which record is
open belong to the consumer, because Prism never imports a router. Nothing in the
Block connects the two panes: the index reports every selection change through its
own callback, and reacting to it is the caller's own read of that callback and a
pass of the record it wants into `detail`.

The tracks hold their ratio at every selection state, so clicking a row does not
move the list out from under the hand that clicked it. The pane before anything is
selected holds what the caller placed, or nothing at all, so the Block ships no
fallback sentence, no frame of its own and no loading mark. The detail slot is a
required node, because a record that is gone, one this reader may not see and one
whose fetch failed are three causes sharing one address and three different
sentences.

The split does not collapse at a narrow viewport. Which pane survives is the
caller's composition rather than a media query deciding a shape, so the narrow
arrangement is one the caller writes. The Block renders no control of its own.

This change also corrects the record index section of the design document, which
claimed the split was already authored while the roster counted from source held no
such Item.
