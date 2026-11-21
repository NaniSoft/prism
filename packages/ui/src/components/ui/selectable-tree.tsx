'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * A label over a list of nodes, at any depth.
 *
 * A group is a label and never a destination. It carries no `id`, because an
 * `id` here would be a selected value, and a chapter heading that the reader
 * could pick would put two rows of one hierarchy into one single-selection at
 * once: the group they are looking at and the phase they are editing. Its
 * `items` are required, because a group that renders a heading and holds
 * nothing is an empty entry rather than a group.
 */
export type SelectableTreeGroup = {
  type: 'group'
  /** The words on the heading, read as the group's place in the hierarchy. */
  title: ReactNode
  /**
   * A short fact about the group, drawn at the trailing edge of its heading.
   *
   * The same field and the same job as on an item: a count, a state, a mark. It
   * is a `ReactNode` rather than a `string` because the common use is a `Badge`,
   * and a Component that flattened one to its text would be deciding a shape
   * that belongs to the caller.
   */
  meta?: ReactNode
  /** The nodes under this group, in the order a reader should meet them. */
  items: readonly SelectableTreeNode[]
}

/**
 * One record the reader can pick: a name, what it is, and where it sits.
 *
 * `id` is required, and required rather than derived, for the reason `ItemEntry`
 * gives: this is a single-selection that survives edits, insertions and
 * reordering, and a record identified by its position has the reader's pick land
 * on a different record the moment one above it moves.
 *
 * An item may hold `items`, and that is how a hierarchy of records is written
 * where the middle is a record too: a folder that can be picked and also
 * contains folders. A group is the other half of the same decision, and the
 * difference is whether the level itself is one of the picks.
 */
export type SelectableTreeItem = {
  type: 'item'
  /** A stable key for the record, and the value a pick reports. */
  id: string
  /** The name of the thing this row is about. */
  title: ReactNode
  /**
   * One line under the name, in the muted ink.
   *
   * Omit it rather than passing an empty string. A row with no supporting line
   * is one line tall; a row with an empty one is one line tall with the reader
   * looking for the thing that is not there.
   */
  description?: ReactNode
  /**
   * The mark before the name, in a fixed column so names line up down the tree.
   *
   * An ordinal in a sequence, an icon for a kind, a dot for a state. A `ReactNode`
   * because only the caller knows which of the three a row has, and a fixed
   * column because a tree whose names start at whatever width the mark happens
   * to be is a tree a reader cannot scan.
   */
  leading?: ReactNode
  /**
   * A short fact that belongs to the row but is not its name.
   *
   * Drawn at the trailing edge of the name's own line: a count, a model, a
   * state. It is the item's `meta` and not its `description`, because a badge
   * belongs beside the name a reader is scanning rather than under it.
   */
  meta?: ReactNode
  /** The nodes under this record, in the order a reader should meet them. */
  items?: readonly SelectableTreeNode[]
}

/**
 * One node in a selectable tree, of either kind.
 *
 * The union is closed, and the two arms are a real distinction rather than an
 * optional field: a group is a place in the hierarchy, and an item is a record
 * the reader picks. One shape with an optional `id` would make "this row cannot
 * be picked" a prop whose absence is sometimes a mistake and sometimes a
 * decision.
 */
export type SelectableTreeNode = SelectableTreeGroup | SelectableTreeItem

/** The props a SelectableTree accepts. */
export interface SelectableTreeProps {
  /** The nodes, in the order a reader should meet them. */
  nodes: readonly SelectableTreeNode[]
  /**
   * The id of the record the reader has picked, or `null` for none yet.
   *
   * Controlled, and there is no internal copy. The caller's value is the only
   * truth, because the page beside this tree usually shows the picked record,
   * and a Component that held a second answer would be a Component that can
   * disagree with the pane it is driving.
   */
  value: string | null
  /**
   * Called with the id the reader picked, from a press or from a key.
   *
   * It is not called when the arrows move, and that is a decision rather than an
   * omission: a reader browsing a pipeline with the arrow keys is not choosing
   * each phase they pass, and a tree that committed on focus would rewrite the
   * editor beside it once per key press.
   */
  onValueChange: (id: string) => void
  /**
   * The accessible name of the tree, read before its nodes.
   *
   * Required rather than defaulted, because a tree with no name is announced as
   * "tree" and a page with two of them is a page where a reader cannot tell
   * which is which.
   */
  label: string
  /**
   * The words a reader is told when the tree is empty, and optionally what to do
   * about it.
   *
   * A tree that renders nothing is a control with nothing in it, so the empty
   * case is authored rather than left to a caller to notice.
   */
  empty?: { message: string; action?: ReactNode }
  /** Layout only. */
  className?: string
}

/** Every selectable id under a level, depth first, which is the order they render in. */
function idsOf(nodes: readonly SelectableTreeNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.type === 'item') ids.push(node.id)
    ids.push(...idsOf(node.type === 'group' ? node.items : (node.items ?? [])))
  }
  return ids
}

function Level({
  nodes,
  value,
  depth,
  tabStopFor,
  onFocusItem,
  onValueChange,
}: {
  nodes: readonly SelectableTreeNode[]
  value: string | null
  depth: number
  tabStopFor: (id: string) => boolean
  onFocusItem: (id: string) => void
  onValueChange: (id: string) => void
}) {
  return (
    <ul
      data-slot="selectable-tree-list"
      data-depth={depth}
      // `group` on the list, not `treeitem`: the rows are what a reader picks
      // between, and a list of them is a group. `role="none"` on each item below
      // removes the listitem role so the record is owned by the tree rather than
      // by the wrapper around it.
      role="group"
      className={cn(
        'flex flex-col gap-0.5',
        // One level of indent per nested level and none at the top, so the depth
        // reads from the rule rather than from the words.
        depth > 0 && 'border-border ms-2 border-l ps-2',
      )}
    >
      {nodes.map((node, index) =>
        node.type === 'group' ? (
          <li
            key={`group:${index}`}
            data-slot="selectable-tree-group"
            role="none"
            className={cn(depth === 0 && 'mt-4 first:mt-0')}
          >
            {/*
             * A group is a treeitem that cannot be selected or focused, which is
             * the one shape ARIA's tree pattern names for a level that is not a
             * record. It carries the level so a reader is placed in the
             * hierarchy, and it carries no `aria-selected`, because the value
             * belongs to the records rather than to the chapters over them. It
             * also carries no `aria-expanded`: nothing here collapses, and the
             * attribute would promise a second press that does nothing.
             */}
            <div
              data-slot="selectable-tree-group-label"
              role="treeitem"
              aria-level={depth + 1}
              className="flex items-center justify-between gap-2 px-2 pb-1"
            >
              <span className="text-muted-foreground min-w-0 truncate text-xs font-medium tracking-wide uppercase">
                {node.title}
              </span>
              {node.meta === undefined || node.meta === null || node.meta === false ? null : (
                <span
                  data-slot="selectable-tree-group-meta"
                  className="flex shrink-0 items-center"
                >
                  {node.meta}
                </span>
              )}
            </div>

            {node.items.length === 0 ? null : (
              <Level
                nodes={node.items}
                value={value}
                depth={depth + 1}
                tabStopFor={tabStopFor}
                onFocusItem={onFocusItem}
                onValueChange={onValueChange}
              />
            )}
          </li>
        ) : (
          <li key={node.id} data-slot="selectable-tree-row" role="none">
            <button
              type="button"
              data-slot="selectable-tree-item"
              data-selectable-id={node.id}
              data-selected={node.id === value ? 'true' : undefined}
              // A record in a tree is a `treeitem`, and it is a treeitem in a
              // tree whose selection is one value, so the pick is carried by the
              // attribute rather than only by the fill. A selected row that
              // differed from its neighbours by colour alone would be invisible
              // to a reader who cannot separate the two inks, and this is the
              // same order every Component in this package keeps meaning in.
              role="treeitem"
              aria-level={depth + 1}
              aria-selected={node.id === value}
              // The roving tab stop, so a tree of forty records is one Tab stop
              // rather than forty, which is the ARIA pattern and the part a
              // consumer cannot assemble for themselves.
              tabIndex={tabStopFor(node.id) ? 0 : -1}
              onFocus={() => onFocusItem(node.id)}
              // A press selects, and so does Enter and Space, because this is a
              // native button and the browser turns both keys into a click. No
              // second handler is written for them, which is what keeps the
              // keyboard and the pointer from deciding two different things.
              onClick={() => onValueChange(node.id)}
              className={cn(
                'relative flex w-full min-h-9 items-start gap-2 rounded-md px-2.5 py-2 text-left',
                'outline-none transition-colors duration-fast ease-out',
                'pointer-coarse:min-h-11',
                'focus-visible:ring-ring focus-visible:ring-[3px]',
                // The resting surface and the pick differ by a step of the muted
                // pane and by the rule at the edge, not by the accent fill. The
                // accent is the colour this package gives navigation, and a
                // record picked inside a page must not read as the page the
                // reader is on: two purple blocks at two levels is a reader who
                // cannot tell which one is a place and which is a thing.
                node.id === value ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted/60',
              )}
            >
              {/*
               * The leading marker: one rule of primary ink at the edge of the
               * row, drawn with the muted step on the surface rather than
               * instead of it. The step alone sits close to the hover step, and a
               * pick a reader has to compare against the hover they just left is
               * a pick they cannot find; the rule is what makes the selected row
               * survive the pointer moving across its neighbours. It is
               * `aria-hidden` because it repeats `aria-selected`.
               */}
              <span
                aria-hidden="true"
                data-slot="selectable-tree-marker"
                className={cn(
                  'bg-primary absolute inset-y-2 start-0 w-0.5 rounded-full transition-opacity duration-fast ease-out',
                  node.id === value ? 'opacity-100' : 'opacity-0',
                )}
              />

              {node.leading === undefined ||
              node.leading === null ||
              node.leading === false ? null : (
                <span
                  data-slot="selectable-tree-leading"
                  className={cn(
                    'mt-px w-5 shrink-0 text-center text-xs tabular-nums',
                    node.id === value ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {node.leading}
                </span>
              )}

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    data-slot="selectable-tree-item-title"
                    className="min-w-0 flex-1 truncate text-sm font-medium"
                  >
                    {node.title}
                  </span>

                  {node.meta === undefined || node.meta === null || node.meta === false ? null : (
                    <span
                      data-slot="selectable-tree-item-meta"
                      className="flex shrink-0 items-center"
                    >
                      {node.meta}
                    </span>
                  )}
                </span>

                {node.description === undefined ||
                node.description === null ||
                node.description === false ? null : (
                  <span
                    data-slot="selectable-tree-item-description"
                    className="text-muted-foreground min-w-0 truncate text-xs"
                  >
                    {node.description}
                  </span>
                )}
              </span>
            </button>

            {node.items === undefined || node.items.length === 0 ? null : (
              <Level
                nodes={node.items}
                value={value}
                depth={depth + 1}
                tabStopFor={tabStopFor}
                onFocusItem={onFocusItem}
                onValueChange={onValueChange}
              />
            )}
          </li>
        ),
      )}
    </ul>
  )
}

/**
 * A hierarchy of records the reader picks one of, and the pick is the record the
 * page shows beside it.
 *
 * **It is a second tree and not a mode on the first, and the reason is in the
 * words.** `Tree` is a way through a hierarchy: every node is an anchor with an
 * address, the current node is marked with `aria-current`, and its own
 * documentation says not to use it to select, because a control that both
 * navigates and selects is two controls wearing one. This is the other job: no
 * node has an address, the pick is one value, and `aria-selected` is the state.
 * Folding the two into one Component would have meant a node whose meaning
 * depended on which props a caller happened to pass, which is the arrangement
 * this package refuses everywhere else.
 *
 * **The hierarchy is real or it is flat.** A caller passing only items gets a
 * flat tree, because an outline of one level is a tree of one level and a
 * Component that required nesting to express a list would make the common case
 * the awkward one. A caller with chapters passes groups; a caller whose middle
 * levels are records themselves passes an item with `items`, and the two may sit
 * beside each other under one tree.
 *
 * **Selection is one value and the caller holds it.** `value` and
 * `onValueChange` are the whole of the state, and there is no internal copy: the
 * common consumer renders the picked record in a pane beside this one, and two
 * answers to "which record" is a pane that can disagree with the highlight that
 * opened it. A row is selected by a press or by Enter or Space, and not by the
 * arrow keys, because a reader moving through a pipeline is browsing rather than
 * choosing: committing on focus would rewrite the editor beside the tree once
 * per key press, and every one of those rewrites would be a decision they did
 * not make.
 *
 * **The whole tree is one Tab stop.** The arrows move which record holds it, Home
 * and End take it to the first and last, and the stop follows the reader once
 * they have moved, so Tab returns them to the record they were on rather than to
 * the top of the tree. It starts on the caller's current value when that value
 * is in the tree and on the first record otherwise, which is the one rule that
 * keeps a page load from putting two tab stops in one tree.
 *
 * **The rows are marked in the attribute and at the edge.** The pick is
 * `aria-selected` plus one rule of primary ink at the leading edge of the row,
 * on a surface one step above the resting one. The accent fill is deliberately
 * not the pick: this package gives the accent to navigation, and a record picked
 * inside a page would read as the page the reader is on. Two purple blocks at two
 * levels is a reader who cannot tell which one is a place and which is a thing.
 * The leading mark, the name, the supporting line and the trailing fact each sit
 * in a column of their own, so a reader scanning names down a rail is not reading
 * names that start at four different widths.
 *
 * **Nothing collapses, so nothing claims to.** There is no open set, no
 * `aria-expanded` and no arrow that folds a subtree away. A reader browsing a
 * pipeline set needs to see the whole set to compare one phase in it against
 * another, and a node that says it can fold when it cannot is a promise the next
 * press breaks.
 *
 * **It draws no frame.** A tree is a control, not a section: the panel, its
 * title, its count, its toolbar and its footer belong to `ListPanel`, and a
 * consumer who wants a bounded rail puts this in one. The cost is stated rather
 * than hidden: a caller who expected a rail writes one element around this and
 * gets the panel's header, scroll region and footer with it.
 *
 * **There is no live region.** Selection is announced by `aria-selected` on the
 * record a reader is standing on, which every screen reader reports when it
 * changes. A second announcement of the same fact would be the same sentence
 * twice, and the region would then speak over the reader moving through the
 * records that follow.
 *
 * **It is a client Component**, because a pick is an event and a roving tab stop
 * is state, and because `onValueChange` is a function the caller hands it, which
 * is a client-to-client boundary wherever it is written. What that costs is the
 * price of every client control: a server Component may render the tree once
 * with its records in place, and what it may not do is let a reader pick one.
 */
function SelectableTree({
  nodes,
  value,
  onValueChange,
  label,
  empty,
  className,
}: SelectableTreeProps) {
  const root = useRef<HTMLDivElement>(null)
  // The roving tab stop, held as an id rather than as an index, so a caller who
  // reorders or removes records cannot strand the reader on one that moved.
  const [stop, setStop] = useState<string | null>(null)

  // Every id once per render rather than once per row. The tab stop question is
  // asked of every record, and a walk of the whole tree from inside that question
  // is a walk per row, which is quadratic in a rail that holds a few hundred.
  const flat = idsOf(nodes)
  const fallback = flat[0]
  const pickedElsewhere = value === null || !flat.includes(value)

  /**
   * Which record holds the tree's one tab stop.
   *
   * `null` is "the reader has not been here yet", and it resolves to the current
   * value rather than to the first record, for the reason a rail that Tab lands
   * on at the top while the page is twenty records down reports the wrong place
   * through the tab order alone. The first record is the fallback rather than a
   * second answer, so it applies only when the caller's value is not in this
   * tree.
   */
  const tabStopFor = (id: string): boolean => {
    if (stop !== null) return stop === id
    if (!pickedElsewhere) return value === id
    return fallback === id
  }

  /**
   * The keyboard model.
   *
   * It is read from the DOM rather than computed from the node data, because the
   * DOM is what a reader actually moves through and a second walk of the data is
   * a second order to fall behind the first. Only records take part, so a group
   * heading is skipped rather than focused and doing nothing. Down and Up stop at
   * the ends instead of wrapping: a tree that wraps is a carousel, and a reader
   * cannot tell that they have wrapped.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const element = root.current
    if (element === null) return
    const items = [
      ...element.querySelectorAll<HTMLElement>('[data-slot="selectable-tree-item"]'),
    ]
    if (items.length === 0) return

    const at = items.indexOf(document.activeElement as HTMLElement)
    if (at === -1) return
    event.preventDefault()

    const next =
      event.key === 'ArrowDown'
        ? Math.min(at + 1, items.length - 1)
        : event.key === 'ArrowUp'
          ? Math.max(at - 1, 0)
          : event.key === 'Home'
            ? 0
            : items.length - 1
    items[next]?.focus()
  }

  if (nodes.length === 0) {
    // A tree that renders nothing is a control with nothing in it, so the empty
    // case is authored rather than left for a caller to notice.
    return (
      <div
        data-slot="selectable-tree-empty"
        className={cn('text-muted-foreground flex flex-col gap-2 px-2 py-3 text-sm', className)}
      >
        <span>{empty?.message ?? null}</span>
        {empty?.action}
      </div>
    )
  }

  return (
    <div
      data-slot="selectable-tree"
      ref={root}
      // `tree` rather than `listbox`, because the records sit at different
      // levels and the level is what places them. A listbox is flat, and nesting
      // one would leave a reader without the place in the hierarchy that is the
      // whole reason this is not a list.
      role="tree"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex w-full flex-col', className)}
    >
      <Level
        nodes={nodes}
        value={value}
        depth={0}
        tabStopFor={tabStopFor}
        onFocusItem={setStop}
        onValueChange={onValueChange}
      />
    </div>
  )
}

export { SelectableTree }
