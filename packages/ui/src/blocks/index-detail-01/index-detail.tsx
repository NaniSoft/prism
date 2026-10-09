import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props an `IndexDetail01` takes.
 *
 * Two required nodes and nothing else. `index` is the pane a reader scans and
 * clicks, and `detail` is the pane that answers the click; both are the caller's
 * own composition, and the rendering of either belongs to whatever Block or node
 * the caller puts there. There is no `selectedId`, no `onSelect`, no `defaultRecord`
 * and no bridge of any kind: this Block knows nothing about either pane's contents,
 * which is what makes it hold no selection state at all.
 */
export type IndexDetail01Props = {
  /**
   * The index pane, placed whole.
   *
   * The caller composes it, usually a `DataTable01`, and passes the node. This
   * Block draws the track and nothing inside it, so the pane's columns, its
   * toolbar, its row actions and its own selection set are all the index's own.
   */
  index: ReactNode
  /**
   * The detail pane, placed whole and required.
   *
   * Required, and the requirement is the design. A selection that points at a
   * record Prism cannot render is three causes sharing one address: a record that
   * is gone, a record this reader may not see, and a failed fetch. They want three
   * different sentences in words, in tone and in whether there is a route out, so
   * an alert, a link back or a composed error Page are all the caller's answer and
   * this Block renders none of them by default. At rest the pane holds whatever the
   * caller placed: a record, the caller's own `NothingChosen01`, or nothing at all.
   */
  detail: ReactNode
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The master and detail split: an index pane beside a detail pane, holding no
 * selection of its own.
 *
 * **Nothing in this Block connects the two panes, and that is the whole of the
 * point.** The index reports every selection change through one callback, so
 * reacting to it is the caller's own read of that callback and a pass of the record
 * it wants into `detail`. A bridge that let one pane read the other's selection
 * would be this Block owning selection state under another name, and selection,
 * routing and which record is open all belong to the consumer, because Prism never
 * imports a router. The Item's documentation gives the one line a consumer writes
 * to pass a selected record into the detail pane.
 *
 * **The tracks hold their ratio at every selection state.** A split whose tracks
 * changed ratio when a row is clicked moves the list out from under the hand that
 * clicked it, and the first click is the one a reader is most sure about. What
 * changes is content, and content does not need the help: forty rows beside one
 * sentence is not a competition, and a caller who wants the index louder makes the
 * index denser, which is the index's own decision to take rather than one this Block
 * takes away.
 *
 * **The pane before anything is selected holds what the caller placed, or nothing at
 * all.** This Block cannot know whether it is in that state, and a Block that cannot
 * know a thing cannot default it, so it ships no fallback sentence, no frame of its
 * own and no loading mark. The state where a region is present, capable of holding a
 * record and empty because no selection exists is `NothingChosen01`, a Block of its
 * own the caller chooses to place in `detail`.
 *
 * **The split does not collapse at a narrow viewport.** Which pane survives is the
 * caller's composition rather than a media query deciding a shape, and a narrow
 * screen does not promote either half into a Page, because the surviving pane is the
 * same Block at full width and a shape whose Kind changed with the viewport would
 * make the Kind a property of a media query. So this Block renders two panes at the
 * width it is given, and the narrow arrangement is a composition the caller writes:
 * the index alone under `AppShell01`, and the record as its own screen.
 *
 * **It renders no control of its own.** The index pane is where selection happens
 * and every control in it belongs to whatever the caller put there, so this Block
 * has no control that could select, open, close or navigate, and the two control
 * gates are green on its source by construction rather than by restraint.
 *
 * It is a server Component: no hook, no state and no client code, so a consumer that
 * passes client panes pays for the panes and not for the split.
 */
export function IndexDetail01({ index, detail, className }: IndexDetail01Props) {
  return (
    <div
      data-slot="index-detail-01"
      className={cn(
        /*
         * Two tracks with a fixed ratio, at every width and at every selection
         * state. The ratio does not change when a row is clicked, so the list never
         * moves under the hand that clicked it, and there is no breakpoint that
         * stacks the panes, because which pane survives is selection state read by a
         * Block that holds none.
         */
        'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-6',
        className,
      )}
    >
      <div data-slot="index-detail-01-index" className="min-w-0">
        {index}
      </div>
      <div data-slot="index-detail-01-detail" className="min-w-0">
        {detail}
      </div>
    </div>
  )
}

export default IndexDetail01
