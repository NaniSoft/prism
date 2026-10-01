'use client'

import { GripVerticalIcon } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { LiveRegion } from './live-region'
import { cn } from '../../lib/utils'

/**
 * What a move reports to the sentence that is read out after it.
 *
 * The id and the two positions, and nothing else. The id is there because a
 * caller with two reorderable lists on one page needs to say which list moved,
 * and the positions are there because "moved" without a destination is a sentence
 * that has told the reader nothing they can check.
 */
export type ReorderableMove = {
  /** The row that moved, named by the caller's own key for it. */
  id: string
  /** Its position before the move, counting from zero. */
  from: number
  /** Its position after the move, counting from zero. */
  to: number
  /** How many rows the list holds in total, after the move. */
  total: number
}

/**
 * The two facts a row's render prop is handed beside the row itself.
 *
 * `index` is the position in the caller's array and it renumbers on every move,
 * which is the number a caller needs to index their own array with. `locked` is
 * the row's own answer to the rule the Component enforces, handed back so a row
 * that cannot move can say so in its own words rather than being silently inert.
 */
export type ReorderableRowInfo = {
  /** The row's position, counting from zero. */
  index: number
  /** Whether this row holds its position and can be neither picked up nor crossed. */
  locked: boolean
}

/**
 * The props a ReorderableList accepts.
 *
 * The props interface is generic over the row type rather than typed as `object`,
 * for the reason `RepeatableRows` states in full: a row is the caller's own domain
 * value, a line item or a pipeline stage, and a Component that took a shape of its
 * own would make every caller restate their type to satisfy a form. The row type
 * is a parameter of this interface and not of the function, which costs the
 * caller the inference on the render prop's row and buys the Component an
 * interface the corpus can read.
 */
export interface ReorderableListProps<TRow> {
  /**
   * The rows, in the order they are shown.
   *
   * Required, and the objects must be the same objects across renders for the
   * same reason `RepeatableRows` says it: the Component keys each row by its
   * identity rather than by its position, which is what lets a row that stays put
   * keep its element, its controls and its caret however many rows move around it,
   * and an identity is only stable if the caller holds the rows somewhere rather
   * than rebuilding them on every render.
   */
  rows: readonly TRow[]
  /**
   * The caller's key for a row.
   *
   * Required, because a row needs an identity that survives the move and the
   * Component will not read one off a position. It is also the id a move is
   * announced under, so a caller with two lists on a page can tell the reader which
   * one moved.
   */
  getRowId: (row: TRow) => string
  /**
   * Whether a row holds its position.
   *
   * Optional, and the rule it selects is stated on `ReorderableList` at length
   * because it is the one piece of policy here a caller cannot read off the prop's
   * type. A locked row can be neither picked up nor crossed, and a move that would
   * put a row on the far side of one is clamped to the locked row's own slot.
   * Omitted, every row moves.
   */
  isLocked?: (row: TRow) => boolean
  /**
   * Called with the whole new order whenever a row moves, and once when a cancelled
   * keyboard move is restored.
   *
   * The order rather than a pair of positions, and the reason is cancellation. A
   * keyboard reader who picks a row up, moves it three places and presses Escape has
   * to get the original arrangement back in one step, and a callback taking
   * `(from, to)` would make that three calls and three announcements of a move the
   * reader has just undone. It is also why this Component owns the locked-row clamp:
   * the caller's array comes back whole and in the order the reader can see, rather
   * than as a set of edits the caller has to replay and keep true.
   *
   * A mutable array rather than a `readonly` one, because the array is one this
   * Component built for this call and nothing about it requires the caller to treat
   * it as immutable. That is what lets the ordinary caller write
   * `onOrderChange={setRows}` and hand the result straight to a state setter, which
   * is the case almost every caller is.
   */
  onOrderChange: (order: TRow[]) => void
  /**
   * The accessible name of one row's grab control, given the row's position.
   *
   * Required, and a function of the position rather than of the row for the same
   * reason `RepeatableRows` requires it: the sentence has to be true after a move,
   * and a sentence written from the row's own fields goes stale exactly when a
   * reader is reading it. Written as the action and the position, the way a reader
   * counts: "Reorder Billing, position 2 of 5".
   */
  handleLabel: (index: number) => string
  /**
   * The words for this list's keyboard model, read once when the reader lands on
   * a grab control.
   *
   * Required, and required because a keyboard reorder with no stated model is a
   * control that does nothing a reader can discover: pick up, move, put down and
   * put back are four behaviours, and none of them is guessable from the shape of
   * a handle with dots on it. It is one sentence for the whole list rather than one
   * per row, because it is the same sentence every time and a reader who has read
   * it once does not need it again on row nine.
   */
  instructionsLabel: string
  /**
   * The words read after a row has moved, given what moved.
   *
   * Required, and it is the sentence this Component most needs from its caller: a
   * reorder is invisible to a screen reader apart from this, because nothing in
   * the DOM says a row changed places.
   */
  announce: (move: ReorderableMove) => string
  /**
   * The words read when a move is refused because a locked row is in the way,
   * given the locked row's position.
   *
   * Required, and required rather than defaulted because a refusal with no
   * sentence is a key press that produces silence, which a reader takes to mean
   * the control is broken. It is also what a press on a locked row's own handle
   * says. A caller with no locked rows writes a function that is never called.
   */
  blockedLabel: (index: number) => string
  /**
   * The words read after Escape has put a picked-up row back where it started.
   *
   * Required, and it is a fourth reader-facing string rather than a reuse of
   * `blockedLabel` because the two events are not the same one: a blocked move
   * found an obstacle and a cancelled move undid the reader's own work, and
   * announcing them with one sentence tells a reader who cancelled that something
   * in the list is wrong with it.
   */
  cancelLabel: string
  /**
   * The row's own content, given the row and its facts.
   *
   * A render prop rather than a slot, for the reason the other two in this package
   * give: a slot receives the row and nothing else, and a caller who then mints an
   * id per row to label it has reintroduced the arrangement this Component exists
   * to hold still.
   */
  children: (row: TRow, info: ReorderableRowInfo) => ReactNode
  /**
   * The list's own name, drawn above it.
   *
   * Optional, and the omission is the same decision `ListPanel` and
   * `RepeatableRows` make: this is one of the places in the package where a region
   * may arrive anonymous, because "Rows" is a claim that is wrong in every
   * consumer's product and an anonymous region is honestly absent from the
   * landmark list rather than announced as something it is not.
   */
  label?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The grab control, drawn once and used by every row.
 *
 * The coarse-pointer floor is here for the reason it is on every other control in
 * this package that a thumb has to hit: five rows on a phone are five rows, and a
 * 20px target is a target that picks up the wrong one. `touch-none` is what stops
 * the browser scrolling the page out from under a drag that started on a handle.
 * Duplicated as a constant rather than imported because each module draws its own
 * row geometry, and a design system that published one class string as an API
 * would be publishing a styling hook.
 */
const HANDLE =
  'text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-sm outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * One row's frame.
 *
 * The card surface rather than a bare line, because a row that is being picked up
 * or dropped onto needs a boundary the reader can see, and a list of bare lines
 * gives them nothing to aim at. The drop target changes both the border's ink and
 * the fill: the ink alone is a one-pixel difference between two colours that are
 * close in every pack, and the fill alone is a change the reader has to interpret.
 */
const ROW =
  'border-border bg-card flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors duration-fast ease-out'

/** The internal shapes, none of which a caller reads. */

/** A pointer drag in progress. */
type Drag = { id: string; from: number; pointerId: number; clientX: number; clientY: number; target: number }

/** Where a row sat when a drag began, so the overlay can match it and follow the grab. */
type Box = { top: number; middle: number; left: number; width: number }

/**
 * A list of rows the reader can put in a different order with a pointer or with
 * the keyboard, where the two arrangements have to agree.
 *
 * **The two input models are one function, and that is the whole Component.** A
 * pointer drag measures where the finger is and computes a destination; a keyboard
 * reorder computes one destination per arrow key. Both call the same `commit`,
 * which is the only place in this module where a row changes places, which emits
 * the announcement, and which applies the locked-row clamp. The alternative, one
 * handler per model, is the arrangement that produced the defects this Component
 * exists to end: a pointer model that let a row cross a locked one, and a keyboard
 * model whose announcement named a position the pointer would never have produced.
 * The cost is stated rather than hidden: a caller who wants the pointer to feel
 * different from the keyboard cannot have it, because the difference would be
 * exactly the disagreement this Component refuses to permit.
 *
 * **A locked row is an obstacle and not a wall, and that distinction is the rule
 * the keyboard model turns on.** A locked row can be neither picked up nor
 * crossed: it holds its position, and a move that would put another row on the far
 * side of it is clamped to the locked row's own slot. The second half matters more
 * than it looks. If a locked row were a wall rather than an obstacle, a keyboard
 * reader below it pressing the down arrow would stop at the wall and have no way
 * past it, because an arrow key moves one position at a time and the reader would
 * have to know to press it twice to clear a row that is not going anywhere. The
 * clamped move is what a pointer drag produces when a finger crosses a locked row,
 * which is the agreement the first paragraph is about. The cost is real and named:
 * a locked row does not partition the list, so a row above one can still be moved
 * below it in a single gesture, and a consumer whose locked rows are meant to be
 * hard boundaries partitions into two lists instead.
 *
 * **The keyboard model is four behaviours, and three of them happen with no
 * visible control in a different state.** Space or Enter picks the focused row up,
 * the arrow keys move it one position at a time and announce every one of them,
 * Space or Enter puts it down, and Escape restores the arrangement the list had
 * when the row was picked up. Only the picked-up state is drawn, and it is drawn
 * as `aria-pressed` on the handle rather than as a lifted row, because the
 * alternative is a row that looks like it is being dragged when it is not and a
 * reader with two of them on a screen cannot tell which is which. The instructions
 * are a prop because the sequence is a sentence in the consumer's language and
 * because a reader who has not been told it cannot guess any of it from a handle
 * with dots on it. The honest limit is the announcement rather than the handle:
 * nothing in the DOM says a row changed places, so a caller who renders this
 * without `announce` gets a reordering surface a screen reader cannot follow,
 * which is the failure the whole Component is built to prevent.
 *
 * **The arrow keys are the browser's until a row is picked up, and that is
 * deliberate.** A list that swallowed the arrow keys would take them away from
 * every control inside its own rows, and the cost of that is a reader who cannot
 * move through a row's own fields. So nothing is a roving tab stop here: the
 * handles are ordinary tab stops in DOM order, the arrows scroll the page or move
 * a caret inside a control as they always do, and a reader who wants to reorder
 * picks the row up first, which is what tells the Component the arrows are about
 * the row. The price is one extra key press before a keyboard reorder begins, and
 * it buys back every arrow key inside a row.
 *
 * **Escape restores the arrangement rather than unwinding it, and the shape of the
 * callback is why.** The order is snapshotted when the row is picked up and handed
 * back whole on Escape, so a cancelled move is one call and one announcement rather
 * than one per position the row travelled. A caller who took `(from, to)` would
 * have to replay the moves in reverse and would announce a sequence of movements
 * the reader has just undone, which is the opposite of what Escape means.
 *
 * **Focus follows the row, because the row is keyed by identity.** A move reorders
 * the caller's array and React moves the element that already held focus rather
 * than making a new one, so a keyboard reader's cursor stays on the row they are
 * moving without a line of focus code. After a pointer drop the focus is moved to
 * the moved row's handle deliberately, because a pointer reader has no cursor to
 * follow and would otherwise be left wherever the drop happened to leave them.
 *
 * **The drag overlay is the caller's own row and not a picture of it.** The
 * render prop is drawn a second time inside it, so a row holding a chart, an
 * avatar and three badges is lifted as that and not as a grey box approximating
 * it. The overlay carries no transition on its transform, which is the one place
 * in this package where a token duration would be wrong: it is tracking a finger,
 * and an eased follow is lag between the finger and the thing the finger is
 * holding. The motion that is here is the drop target changing, on `duration-fast`.
 *
 * **It does not compose `ListPanel`, and the refusal is worth stating.** A panel
 * would bring a title band, a toolbar slot, a bounded height and a scroll region,
 * and a reorderable list wants none of them by default: the reader has to see the
 * whole arrangement to reorder it, a bounded body hides the row they are about to
 * drop onto, and the panel's toolbar has nothing to say about moving rows. A
 * caller who does want a bounded frame puts this inside `ListPanel`'s body, which
 * is one line and costs nothing.
 *
 * **It is a client Component**, because a drag is a stream of pointer events and a
 * keyboard reorder is a key handler, and because every one of its value props is a
 * function the caller hands it, which is a client-to-client boundary wherever it is
 * written. What that costs is the price of every client control: a server
 * Component may render this list once with its rows already in place, and what it
 * may not do is offer the two reorder models, because both are facts about what
 * happens after the reader acts.
 */
function ReorderableList({
  rows,
  getRowId,
  isLocked,
  onOrderChange,
  handleLabel,
  instructionsLabel,
  announce,
  blockedLabel,
  cancelLabel,
  children,
  label,
  className,
}: ReorderableListProps<any>) {
  const instructionsId = useId()
  const listRef = useRef<HTMLOListElement>(null)
  // The row geometry, measured once when a drag begins. The list does not reorder
  // while a drag is in progress, so the rectangles read at the start stay true
  // until it ends, and the pointer handler never forces a layout on every move.
  const boxes = useRef<Box[]>([])
  // How far into the lifted row the pointer took hold, so the overlay leaves by the
  // edge the reader grabbed rather than snapping to the pointer's own coordinates.
  const grab = useRef(0)
  // The row to hand focus to once the caller's array has caught up with a drop.
  // Armed before the callback runs, because the row that will hold it does not
  // exist until the caller has applied the order the callback was given.
  const focusAfter = useRef<string | null>(null)
  // The arrangement as it stood when the keyboard reader picked a row up.
  const pickedUp = useRef<readonly any[] | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [said, setSaid] = useState('')

  const lockedAt = useCallback(
    (index: number) => (isLocked === undefined ? false : isLocked(rows[index])),
    [isLocked, rows],
  )

  /**
   * The one place a row changes places.
   *
   * `destination` is clamped by walking towards the row's own slot one candidate
   * at a time and taking the first arrangement in which every locked row is
   * exactly where it was. Walking rather than computing is the decision: a move
   * that crosses two locked rows has to stop at the first one, and there is no
   * arithmetic that says which without checking each candidate against the rule.
   * `null` means the row cannot move at all from here, which happens when the row
   * itself is locked or when it already sits against the locked row beside it, and
   * both are reported to the reader rather than swallowed.
   */
  const commit = useCallback(
    (id: string, from: number, destination: number): boolean => {
      if (from < 0 || from >= rows.length) return false
      if (lockedAt(from)) {
        setSaid(blockedLabel(from))
        return false
      }

      const step = destination > from ? 1 : -1
      for (let to = destination; to !== from; to -= step) {
        const order = [...rows]
        const moved = order.splice(from, 1)
        order.splice(to, 0, ...moved)
        if (rows.every((row, at) => !lockedAt(at) || order[at] === row)) {
          setSaid(announce({ id, from, to, total: rows.length }))
          onOrderChange(order)
          return true
        }
      }

      // Everything between here and the locked row beside it is taken, so the
      // refusal is reported against the locked row the reader ran into.
      const blocked = destination > from ? from + 1 : from - 1
      setSaid(
        blocked >= 0 && blocked < rows.length && lockedAt(blocked) ? blockedLabel(blocked) : '',
      )
      return false
    },
    [announce, blockedLabel, lockedAt, onOrderChange, rows],
  )

  // A drop hands focus to the row that moved, and that row only exists once the
  // caller has applied the order, so the focus waits for the render rather than
  // racing it. A keyboard move needs none of this: the element the reader was on is
  // moved rather than remounted, so their cursor is already where it belongs.
  useEffect(() => {
    const wanted = focusAfter.current
    if (wanted === null) return
    const root = listRef.current
    if (root === null) return
    const handle = root.querySelector<HTMLElement>(`[data-reorder-handle="${wanted}"]`)
    if (handle === null) return
    focusAfter.current = null
    handle.focus()
  })

  const measure = (): boolean => {
    const root = listRef.current
    if (root === null) return false
    boxes.current = [...root.children].map((row) => {
      const rect = row.getBoundingClientRect()
      return { top: rect.top, middle: rect.top + rect.height / 2, left: rect.left, width: rect.width }
    })
    return true
  }

  /**
   * The index a pointer at `clientY` is asking for: the number of row middles it
   * has passed. A finger between two rows is asking for the lower of the two, which
   * is what makes the last few pixels above a row's centre feel like they belong
   * to the row above rather than producing a dead band that moves nothing.
   */
  const indexAt = (clientY: number): number => {
    let at = 0
    while (at < boxes.current.length && (boxes.current[at] as Box).middle < clientY) at += 1
    return at
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, id: string, index: number) => {
    if (lockedAt(index)) {
      // A handle that cannot be grabbed would otherwise accept a press and do
      // nothing at all, which is the state `Dropzone` and `LifecycleButton` both
      // refuse to leave a control in.
      event.preventDefault()
      setSaid(blockedLabel(index))
      return
    }
    if (!measure()) return
    const box = boxes.current[index]
    if (box === undefined) return
    // Where in the row the pointer took hold, so the overlay is lifted by the same
    // edge and does not jump out from under the finger that is holding it.
    grab.current = event.clientY - box.top
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      id,
      from: index,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      target: index,
    })
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    setDrag((current) =>
      current === null || current.pointerId !== event.pointerId
        ? current
        : { ...current, clientX: event.clientX, clientY: event.clientY, target: indexAt(event.clientY) },
    )
  }

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return
    if (commit(drag.id, drag.from, drag.target)) focusAfter.current = drag.id
    setDrag(null)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    // `Enter` is read from `key` and the spacebar from `code`, and the asymmetry is
    // deliberate rather than an inconsistency. `event.key` for the spacebar is a
    // literal space character, which is not a name any reader of this file could
    // recognise as a key, while `event.code` names it `Space` and is unambiguous
    // about which physical key was pressed. `Enter` has no such problem: its `key` is
    // already the word, and `code` would fail to match the numeric keypad's.
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault()
      if (picked === null) {
        // The snapshot is taken on pickup rather than on mount, because the
        // arrangement a reader wants back is the one they started from, not the
        // one the list happened to be rendered with.
        pickedUp.current = rows
        setPicked(ids[index] as string)
        return
      }
      pickedUp.current = null
      setPicked(null)
      return
    }

    if (event.key === 'Escape' && picked !== null) {
      event.preventDefault()
      const restore = pickedUp.current
      pickedUp.current = null
      setPicked(null)
      // Copied rather than handed over as it stands, because the snapshot is a
      // `readonly` view of an array the caller gave this Component and the callback
      // asks for one the caller may put straight into their own state.
      if (restore !== null) onOrderChange([...restore])
      setSaid(cancelLabel)
      return
    }

    const key = event.key
    if (key !== 'ArrowUp' && key !== 'ArrowDown') return

    // The arrows do nothing until a row is picked up, because they are the
    // browser's for every control inside a row until then.
    if (picked === null) return
    event.preventDefault()

    const destination = key === 'ArrowUp' ? index - 1 : index + 1
    if (destination < 0 || destination >= rows.length) return
    commit(picked, index, destination)
  }

  const ids = rows.map(getRowId)
  const lifted = drag === null ? null : drag

  return (
    <div data-slot="reorderable-list" className={cn('flex w-full flex-col gap-2', className)}>
      {label === undefined ? null : (
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
      )}

      {/*
       * The keyboard model, stated once for the whole list and pointed at by every
       * handle. `sr-only` rather than visible because it is one sentence for every
       * row of every list, and a reader who has read it once does not need to read
       * it again on row nine.
       */}
      <span id={instructionsId} data-slot="reorderable-list-instructions" className="sr-only">
        {instructionsLabel}
      </span>

      <ol ref={listRef} data-slot="reorderable-list-list" className="flex w-full flex-col gap-2">
        {rows.map((row, index) => {
          const id = getRowId(row)
          const locked = lockedAt(index)
          const dragging = lifted !== null && lifted.id === id
          const target = lifted !== null && !dragging && lifted.target === index

          return (
            <li
              key={id}
              data-slot="reorderable-list-row"
              data-reorder-id={id}
              className={cn(
                ROW,
                // The drop target changes its border's ink and its fill together,
                // and the row being lifted fades rather than disappearing, so the
                // reader can see both the hole it came from and the place it is
                // about to land.
                target && 'border-primary bg-accent',
                dragging && 'opacity-40',
              )}
            >
              <button
                type="button"
                data-slot="reorderable-list-handle"
                data-reorder-handle={id}
                aria-pressed={picked === id}
                aria-describedby={instructionsId}
                aria-label={handleLabel(index)}
                onPointerDown={(event) => onPointerDown(event, id, index)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  HANDLE,
                  locked
                    ? 'cursor-not-allowed opacity-50'
                    : picked === id
                      ? 'cursor-grabbing text-foreground'
                      : '',
                )}
              >
                <GripVerticalIcon className="size-4" aria-hidden="true" />
              </button>

              <div data-slot="reorderable-list-content" className="min-w-0 flex-1">
                {children(row, { index, locked })}
              </div>
            </li>
          )
        })}
      </ol>

      {/*
       * The drag overlay.
       *
       * Positioned from the pointer's own coordinates and matched to the width of
       * the row it was lifted from, so a reader sees the row they are holding
       * rather than a card of an unrelated size sliding under their finger. No
       * transition on the transform, deliberately: it is tracking a pointer, and
       * an eased follow is lag between the finger and the thing the finger is
       * holding. `aria-hidden` because the row is still in the list below, and a
       * second copy of the same row in the accessibility tree is a reader counting
       * the list twice.
       */}
      {lifted === null ? null : (
        <div
          data-slot="reorderable-list-overlay"
          aria-hidden="true"
          style={{
            width: (boxes.current[lifted.from] as Box | undefined)?.width,
            transform: `translate3d(${(boxes.current[lifted.from] as Box | undefined)?.left ?? 0}px, ${Math.round(lifted.clientY - grab.current)}px, 0)`,
          }}
          className="bg-popover text-popover-foreground pointer-events-none fixed z-50 rounded-md border p-2 shadow-md"
        >
          {children(rows[lifted.from] as any, { index: lifted.from, locked: lockedAt(lifted.from) })}
        </div>
      )}

      {/*
       * Every move, every refusal and every cancellation is announced here, and
       * `assertive` because a reader who has just pressed a key and is waiting for
       * a reorder to happen is exactly the reader a polite queue makes wait through
       * whatever else the page had to say. It is mounted from its content rather
       * than held empty, for the reason `LifecycleButton` states at length.
       */}
      <LiveRegion className="sr-only" politeness="assertive">
        {said}
      </LiveRegion>
    </div>
  )
}

export { ReorderableList }
