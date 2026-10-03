'use client'

import { EllipsisIcon } from 'lucide-react'
import {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from '../../lib/utils'

/**
 * One action in the row, whether it is drawn as a button or as a menu row.
 *
 * The same shape either way, which is the point: an action that moves into the
 * menu keeps its label, its mark and its unavailable state, so a reader who finds
 * it there is looking at the same thing they were looking at in the row.
 */
export type OverflowAction = {
  /**
   * The caller's own identity for the action.
   *
   * Required and stable, because it is what the React key is and what
   * `onOverflowChange` reports, and a caller keyed on a localised label remounts
   * the row the moment the reader changes language.
   */
  id: string
  /**
   * The action's label.
   *
   * A `ReactNode`, so a caller can put an emphasis inside it. It is also the
   * measurement: this Component reads each drawn button's own width, so a label
   * made of markup is measured as it is drawn rather than as its text.
   */
  label: ReactNode
  /**
   * The mark for the action.
   *
   * A `ReactNode` and not an icon name, because the vocabulary a product uses for
   * its own rows is its own. Keep it `aria-hidden`, because `label` names the
   * control.
   */
  icon?: ReactNode
  /**
   * How the menu row reads when the action has collapsed into it.
   *
   * `danger` and not `destructive` so a consumer's tone and this Component's tone
   * stay two vocabularies. It has no effect on the drawn button, which wears
   * `outline` because the overflow trigger wears that same frame and the row is
   * not allowed to disagree with its own cap.
   */
  tone?: 'default' | 'danger'
  /** Whether the action refuses the press, in the row and in the menu alike. */
  disabled?: boolean
}

/**
 * The props the Overflow actions accept.
 *
 * A declared interface rather than a forwarded native one: the row is measured
 * and laid out by this Component, so there is no native element whose props could
 * be forwarded without also forwarding a `className` that would break the
 * measurement the whole Component exists to make.
 */
export interface OverflowActionsProps {
  /**
   * The actions, in the order a reader meets them.
   *
   * Required, and the order is the caller's because it is a claim about how often
   * each is used: a row where Archive sits between Open and Delete is one every
   * reader has to learn again. **The order is also what collapses.** Trailing
   * actions move, because the leading ones are the ones a wide row already fits
   * and a narrow one must keep: the actions that survive are the ones that were
   * reachable first.
   */
  actions: readonly OverflowAction[]
  /**
   * The accessible name of the overflow trigger.
   *
   * Required, and the reason is the one `Toast` states for its close control. The
   * trigger is an icon, it appears without the reader asking for it, and an
   * icon-only control they reach towards has to say what it is before they press
   * it. "More actions for this row", "Remaining actions". It is a name and not a
   * visible label because the trigger is three dots and three dots are not a word.
   */
  overflowLabel: string
  /**
   * Called with the ids of the actions currently inside the menu.
   *
   * Optional, and it is here for the caller whose row means something different
   * once the actions are hidden: a tooltip that described them, a measurement,
   * an analytics event. It fires on the change and never on the first render, so
   * a caller does not receive an empty list it already knows is empty. **The cost
   * is that this Component cannot tell a caller *why* an action moved**, only
   * that it did, so a caller whose UI depends on the reason is measuring its own
   * container as well.
   */
  onOverflowChange?: (ids: readonly string[]) => void
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/** The drawn buttons, read back for their own widths rather than for a list of labels. */
const ACTION_SLOT = '[data-slot="overflow-actions-action"]'

/**
 * The gap between two actions, read from the row rather than assumed.
 *
 * A number the caller can change through `className`, because a gap is layout and
 * layout is the one thing `className` is for. Reading it keeps the arithmetic
 * honest when they do: a caller who widens the row's gap gets measured against the
 * gap they set rather than against the one this file was written with.
 *
 * `normal` and an unresolvable value are measured as no gap at all, which is what
 * a flex container's used value is when there is no gap to report. That is the
 * one reading this cannot distinguish from a real zero, and it is the reading that
 * costs the least: a row with no gap is measured as having none.
 */
function gapOf(row: HTMLElement): number {
  const measured = Number.parseFloat(window.getComputedStyle(row).columnGap)
  return Number.isFinite(measured) ? measured : 0
}

/**
 * The text a `ReactNode` draws, flattened, because the text is the width.
 *
 * This is not a measurement and it does not claim to be one. It is the cheapest
 * description of a label that changes when the drawn width does, and it is here so
 * that a render which changed nothing measurable can be told apart from one that
 * changed a label without reading a box to find out.
 *
 * An element contributes its own text wrapped in a bracket, because a caller may put
 * an emphasis inside a label and the markup around the words is part of what has to be
 * measured. Its props are not folded in: a serialised prop is a component's source
 * where the prop holds a component, which would make this a description of the
 * caller's code rather than of the row they are asking about.
 */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node !== null && typeof node === 'object' && isValidElement<{ children?: ReactNode }>(node)) {
    return `<${textOf(node.props.children)}>`
  }
  return ''
}

/**
 * A row of actions that gives up its trailing actions when it runs out of room.
 *
 * **It observes itself, and that is the reason it is a Component.** A row of five
 * actions inside a table cell is a layout problem no prop describes, because the
 * answer depends on a width Prism cannot see: the cell, the sidebar, the zoom
 * level, the font the reader has chosen and the strings the caller localised last
 * week. So the Component holds a measurement, keeps it current, and moves the
 * trailing actions into a menu when the row can no longer hold them beside their
 * cap. No prop combination expresses this, because every prop is a decision taken
 * before the width is known and this is a decision taken after it.
 *
 * **What the first frame draws, and why it is not a guess.** A server render has
 * no width to measure, so the first frame draws every action the caller passed and
 * **no cap**, which is the row the caller described rather than the row this
 * Component would have guessed at. The correction is made in a layout effect,
 * which runs after the DOM is mutated and before the browser paints, so a reader
 * with scripting sees the corrected row as the first frame they ever see and
 * never sees the un-collapsed one at all. What is therefore visible to a reader
 * without scripting, to a crawler and in a print stylesheet is the full row, which
 * is the correct answer for all three: a cap that cannot open is a control that
 * lies, and a row of actions is readable without them.
 *
 * **The cap is always in the document and is taken out of the flow rather than
 * unmounted, and the reason is the measurement.** A trigger that is not rendered
 * has no width to read, and a row that changed width when the cap appeared would
 * move its actions on every resize, so the cap stays in the DOM, keeps its width,
 * and when nothing has collapsed it is `visibility: hidden`, out of flow, out of
 * the tab order and out of the accessibility tree. That is what lets the first
 * decision account for a cap that will need to appear.
 *
 * **Each action's width is read from the action, and it is remembered when the
 * action is hidden.** A button sizes to its own content, so a width measured on
 * the pass where the action was drawn is still its width on the pass where it is
 * not, which is the only reason a hidden action can still be counted. The cost is
 * real and it is this: **a row that shrinks to fit its content has no room to run
 * out of, so nothing collapses.** `className` must give the row a bounded width,
 * and the consequence of ignoring that is not a row that overflows its container
 * but a row that empties itself into a cap.
 *
 * **A pass runs when the measurement could have changed, and not on every render.**
 * Every read a pass makes is a read the browser cannot answer without settling
 * layout first, so a row that measures on every render spends a forced layout on
 * every render, and a table of them spends one per row for every keystroke in a
 * filter box somewhere above it. So a pass runs on mount, when the actions' ids or
 * their labels change, when `className` changes, when the row's own box changes, and
 * when the page's fonts have finished loading. That last one earns its place: a
 * self-hosted face swaps in after the first paint and changes the width of every
 * drawn action without changing the row's width, so nothing else reports it, and a
 * row measured in the fallback face is a row whose widths were never true of the page
 * the reader is looking at. A caller who re-renders a row for a reason of its own
 * pays nothing, which is the whole of the claim: the read happens on the frames
 * where the answer could have been different, and on no others.
 *
 * **The determinate part of the motion budget is not spent here at all.** The row
 * changes membership rather than animating: an action leaves, the cap arrives, and
 * both are one layout pass with no transition on either. That is deliberate. A
 * row that slid its actions sideways would be a movement a reader did not ask for
 * on a control they did not press, and the first motion law in this system is
 * that feedback answers something the reader did; here the reader resized a window
 * or changed a sidebar, and the answer is that the row is still complete.
 *
 * **It composes `Button` and `DropdownMenu` and redraws neither.** The drawn
 * actions are `Button`s at the `outline` step, which is the same frame
 * `DropdownMenuTrigger` draws, so the cap is not a different-looking control
 * sitting in the middle of the row. The menu, its typeahead, its arrow keys and
 * its Escape handling are `DropdownMenu`'s, and the only thing this Component
 * decides is which actions go where.
 *
 * **It is a client Component**, because it reads a width, because it holds the
 * membership of the menu, and because it takes the one callback. What that costs
 * is the price of the whole idea: a server-rendered row of actions is drawn whole
 * and never collapses, so a page that is read without scripting gets a row rather
 * than a menu. That is the same trade `DataToolbar` makes for the opposite
 * problem, and it is the reason this one is a Component and `DataToolbar` is not.
 */
function OverflowActions({
  actions,
  overflowLabel,
  onOverflowChange,
  className,
}: OverflowActionsProps) {
  const rowRef = useRef<HTMLDivElement | null>(null)
  // The width of every action this Component has drawn, whether it is drawn now or
  // not. Held in a ref rather than in state because a width is a measurement and
  // putting it in state would re-render the row once per measured action.
  const widths = useRef(new Map<string, number>())
  const [collapsed, setCollapsed] = useState(0)

  const measure = useCallback(() => {
    const row = rowRef.current
    // A row that is not laid out yet measures zero, and treating zero as a real
    // width would empty the row inside a hidden dialog.
    if (row === null || row.clientWidth === 0) return

    const cap = row.querySelector<HTMLElement>('[data-slot="overflow-actions-cap"]')
    // The cap's own width, read from the cap even while it is out of flow, which
    // is the whole reason the cap is never unmounted.
    const reserve = cap === null ? 0 : cap.offsetWidth
    const gap = gapOf(row)

    for (const node of Array.from(row.querySelectorAll<HTMLElement>(ACTION_SLOT))) {
      const id = node.dataset.actionId
      if (id !== undefined) widths.current.set(id, node.offsetWidth)
    }

    let used = 0
    let fitted = 0
    for (const action of actions) {
      const width = widths.current.get(action.id)
      // An action never drawn has no width, so the row stops counting there and
      // the rest of the actions move. Reporting fewer actions than fit would be a
      // worse answer than moving one that might have fitted.
      if (width === undefined) break
      // The candidate plus the gap that would separate it from the next, plus the
      // gap and the cap that would follow the last one that fits.
      const candidate = used + (fitted === 0 ? 0 : gap) + width
      if (candidate + gap + reserve > row.clientWidth) break
      used = candidate
      fitted += 1
    }

    const hidden = actions.length - fitted
    setCollapsed((current) => (current === hidden ? current : hidden))
  }, [actions])

  // The newest measurement pass, held in a ref and refreshed during render rather
  // than in an effect, so that both callers below can reach the current pass without
  // subscribing to it. A caller that passes a fresh `actions` array each render gives
  // `measure` a new identity each render, and an effect that depended on it would
  // disconnect and re-observe the row that often, and would re-measure it that
  // often, for a subscription whose job never changes.
  const measureRef = useRef(measure)
  measureRef.current = measure

  // What the next pass has to take into account, as one string.
  //
  // `actions` is the input and its identity is not the signal. A caller who maps a
  // list into a fresh array on every render has changed nothing a width depends on,
  // so measuring on that is measuring to find out what was already known. What a key
  // carries is the two things that move a width: each action's id, because it decides
  // which action the row is counting and in what order, and its label's own text,
  // because a button sizes to its content. What is left out is `icon`, and `Button`
  // gives every mark it draws the same square, so a different mark of the same shape
  // is the same width; a caller who wants a different width puts it in the label,
  // which is the field documented as the measurement.
  //
  // The separators are control characters rather than punctuation because an id and
  // a label may both contain anything a reader can type, and a key built from a
  // printable separator can be two different rows reported as one.
  const content = useMemo(
    () => actions.map((action) => `${action.id}\u0000${textOf(action.label)}`).join('\u0001'),
    [actions],
  )

  // On mount, and again when the drawn content or the row's own layout changed.
  //
  // `className` is in the list because a gap is layout and layout is what
  // `className` is for: a caller who widens the row's gap changes the arithmetic
  // without changing the row's box, so the observer below has nothing to report and
  // this is the only signal there is. The pass writes membership rather than
  // geometry, so a pass that finds nothing new costs no render, and a pass that does
  // find something new is followed by a render this effect does not measure again:
  // the content it changed is the content this effect depends on, and re-reading the
  // row immediately after writing to it is the read that forces the layout it just
  // dirtied.
  useLayoutEffect(() => {
    measureRef.current()
  }, [content, className])

  useEffect(() => {
    const row = rowRef.current
    // No observer, no collapsing. A row whose width never changes has never run
    // out of room, and a component that held a hidden observer anyway would be
    // holding a subscription it cannot explain.
    if (row === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measureRef.current())
    observer.observe(row)
    return () => observer.disconnect()
  }, [])

  // The face, when it lands after the first paint.
  //
  // A self-hosted font changes the width of every drawn action and leaves the row's
  // own width exactly where it was, so the observer above never fires for it and a
  // width measured in the fallback face is a width that was never true of the row.
  // `document.fonts.ready` is the one signal that reports it, and it costs one pass
  // on the page rather than one pass per render.
  //
  // The guard is a runtime one because jsdom has no `FontFaceSet`, and a Component
  // that cannot tell is a Component that throws in a test rather than a Component
  // that reads less often.
  useEffect(() => {
    if (typeof document.fonts === 'undefined') return
    let live = true
    void document.fonts.ready.then(() => {
      if (live) measureRef.current()
    })
    return () => {
      live = false
    }
  }, [])

  const inside = actions.slice(0, actions.length - collapsed)
  const spilled = actions.slice(actions.length - collapsed)
  const mounted = useRef(false)
  const reported = useRef<readonly string[] | null>(null)

  useEffect(() => {
    // Never on the first pass. A caller told an empty list it already knew was
    // empty would be hearing about itself rather than about the row.
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const ids = actions.slice(actions.length - collapsed).map((action) => action.id)
    const previous = reported.current
    if (previous !== null && previous.length === ids.length && previous.every((id, at) => id === ids[at])) {
      return
    }
    reported.current = ids
    onOverflowChange?.(ids)
  }, [actions, collapsed, onOverflowChange])

  return (
    <div
      ref={rowRef}
      data-slot="overflow-actions"
      className={cn('relative flex items-center gap-1', className)}
    >
      {inside.map((action) => (
        <Button
          key={action.id}
          data-slot="overflow-actions-action"
          data-action-id={action.id}
          type="button"
          variant="outline"
          disabled={action.disabled}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          data-slot="overflow-actions-cap"
          aria-label={overflowLabel}
          tabIndex={spilled.length === 0 ? -1 : undefined}
          aria-hidden={spilled.length === 0 ? true : undefined}
          className={cn(
            // Out of flow and invisible while the row is whole, so the cap costs
            // the row nothing and nothing can reach it. See the JSDoc.
            spilled.length === 0 && 'invisible pointer-events-none absolute top-0 start-0',
          )}
        >
          <EllipsisIcon aria-hidden="true" />
        </DropdownMenuTrigger>

        {spilled.length === 0 ? null : (
          <DropdownMenuContent align="end">
            {spilled.map((action) => (
              <DropdownMenuItem
                key={action.id}
                variant={action.tone === 'danger' ? 'destructive' : 'default'}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}

export { OverflowActions }