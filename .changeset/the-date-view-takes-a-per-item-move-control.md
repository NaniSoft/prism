---
'@nanisoft/prism-ui': minor
---

The date view takes a per-item move control

`Calendar01` exposes a per-item `handle`, a node the caller fills with their own
control and wires to whatever owns their schedule. It exists for the one
interaction a date view has that the Block does not own: a reschedule, which is a
drag with a drop target, a new order, a write and a conflict, every one of them the
consumer's. The Block places the node at the leading edge of the item's row and
owns nothing beyond it: no drag, no drop, no order and no move callback, which is
the arrangement `Kanban01` already takes for a board's drag.

A `CalendarItem` gains an optional `handle: ReactNode`; `Calendar01`'s props are
otherwise unchanged. The roster does not change: no new Item, Kind, Page or
catalogue entry appears.
