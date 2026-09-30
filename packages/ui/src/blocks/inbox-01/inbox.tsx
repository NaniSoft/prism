'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * How pressing a queue is one of four things, and the tone each one is drawn in.
 *
 * The four are a queue's whole vocabulary and they are not a severity ladder, which
 * is why the tones are not in order: `urgent` is a judgement about lateness, `new`
 * is a fact about age, and a queue where everything is urgent is a queue where
 * nothing is. `urgent` takes the destructive tone because it is the one state a
 * reader must not miss, `high` takes warning because it is the one they should
 * reach for soon, `normal` takes the cool role that means not an alarm, and `low`
 * takes the muted ink because nothing is being asked of the reader.
 *
 * A fifth would be the one that splits a state that does not need splitting, and
 * each such tier is a colour a reader must learn and a word a maintainer must keep
 * true. The words themselves are the caller's; see `InboxItem.priorityLabel`.
 */
export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * The four states one queued item can be in, and the tone each one is drawn in.
 *
 * `new` is unread, `open` is being worked, `waiting` is with somebody else, and
 * `done` is finished. The tones are the same four in the same order as a reader
 * would sort them by how much they care: `new` is the cool role, `open` is muted,
 * `waiting` is warning because it is a queue a reader cannot advance alone, and
 * `done` is success because it is the only state that is finished.
 *
 * `done` is in this list rather than removed, and the row stays in the table, so a
 * reader can see what a queue has already absorbed. Removing the row would make a
 * queue look emptier every time it worked.
 */
export type InboxState = 'new' | 'open' | 'waiting' | 'done'

/**
 * The tone each of the four priorities is drawn in, from the semantic contract and
 * no other.
 *
 * The table is small on purpose and the reason is that a tone is a claim about
 * urgency that only the caller can make. Four priorities are four things a team
 * argues about in a planning meeting; the Block is given the answer and draws it.
 */
const PRIORITY_TONE: Record<InboxPriority, StatusTone> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'destructive',
}

/**
 * The tone each of the four states is drawn in, from the semantic contract and no
 * other.
 */
const STATE_TONE: Record<InboxState, StatusTone> = {
  new: 'info',
  open: 'neutral',
  waiting: 'warning',
  done: 'success',
}

/**
 * The six cells a row can draw, and the six column names a caller names them with.
 *
 * A closed set, and the closure is the point: the cells are the Block's, so a table
 * with a seventh column would be a column with nothing to put in it. The names are
 * the caller's, which is the other half of the same thing. A queue is drawn by
 * four products with four vocabularies, and the words a reader needs above the
 * same column are "Priority" in one and "Urgency" in the next, so `header` is a
 * prop and `id` is not.
 */
export type InboxCell =
  | 'subject'
  | 'source'
  | 'priority'
  | 'at'
  | 'state'
  | 'actions'

/**
 * One column of a queue: which cell it draws, and the words above it.
 *
 * The shape follows `ResourceListColumn` for the reason that type gives: the cells
 * are closed, so the `cell` function `DataTableColumn` takes is deliberately
 * dropped, and what is left is genuinely the caller's, which is the column's name,
 * its order, and where it sits. `className` is layout, for alignment or a fixed
 * width, and it changes where a column sits and never what a cell looks like.
 */
export type InboxColumn = {
  /** Which of the six cells this column draws. */
  id: InboxCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /**
   * Layout classes for the column, applied to the header cell and to every cell
   * under it.
   */
  className?: string
}

/**
 * One thing waiting for a person, and everything a reader needs to decide whether
 * to be that person.
 *
 * `subject` is the only required field beside `id`, because a row with no subject
 * is a row nobody can act on. Everything else is optional because a queue is
 * heterogeneous by nature: some items came from a system that knows its source and
 * some did not, some are urgent and some are not, and a shape that made every field
 * required would be a table where two thirds of every row is an empty cell drawn as
 * a placeholder.
 */
export type InboxItem = {
  /** The item's stable key within the queue. */
  id: string
  /**
   * What the item is, in the words a reader would use about it.
   *
   * It is the row's identity, so it is the row head, and it is also the words on
   * whatever control opens the item: a link when there is an `href` and a button
   * when there is an `onSelect`. A subject a reader cannot scan down a column is a
   * subject that has to be read one row at a time, which is the one thing a queue
   * is not.
   */
  subject: string
  /**
   * Where the item came from, in the product's own words: a system, a form, a
   * person, a feed.
   *
   * Drawn as passed and in the muted ink, and it is the reason the `source` cell
   * is a column rather than a prefix on the subject: the source is a facet a reader
   * compares, and a prefix is a facet nobody can scan.
   */
  source?: string
  /**
   * How pressing the item is, which is a judgement only the caller can make.
   *
   * The Block maps it to a tone and refuses to print the word, because
   * `urgent` and `waiting` are English and this table ships into operations tools
   * that are not in English. See `InboxItem.priorityLabel`.
   */
  priority?: InboxPriority
  /**
   * The words for the priority, given the priority the caller passed.
   *
   * Required whenever `priority` is set and the run fails without it, for the
   * reason the Component JSDoc on `Status` gives at length: a status with no words
   * is a coloured dot, and a coloured dot is invisible to a reader who cannot
   * separate the tones and unreadable to a screen reader whatever the tones are.
   * The function is a function and not a string because the honest sentence is
   * usually per priority and per product: "overdue", "drop everything", "P1".
   */
  priorityLabel?: (priority: InboxPriority) => string
  /**
   * When the item arrived, in whichever of the three forms the caller holds it.
   *
   * Drawn through `relative-time`, so a number arrives as a date in the reader's
   * own locale and a string is handed to the platform untouched: a date-only key,
   * an ISO 8601 date-time and a locale's own written date all work and none of
   * them is interpreted here. The rejected alternative was drawing the value as
   * passed, which puts a raw epoch on the page for every caller who had
   * milliseconds, and a queue sorted by nothing is a queue a reader cannot trust.
   * A caller who wants a relative phrase composes `relative-time` themselves and
   * passes the node, which is the one case where `at` is not a value.
   */
  at?: number | string | ReactNode
  /**
   * Where the item is in its life, which is a judgement only the caller can make.
   * See `InboxItem.priorityLabel` for why the words are required with it.
   */
  state?: InboxState
  /** The words for the state, in the product's own vocabulary. */
  stateLabel?: string
  /**
   * One line about the item, under the subject.
   *
   * A node because a queue's second line is not always a sentence: it is a quoted
   * first line of a message, a diff summary, a product name, a chart. The Block
   * draws it in the muted ink at one step below the subject and never truncates
   * it, because a truncated sentence on a queue is a sentence the reader has to
   * open the item to read anyway.
   */
  excerpt?: ReactNode
  /**
   * Where the item goes. Its presence makes the subject render as a native
   * anchor, so the destination is real and the browser's own link affordances all
   * work on it.
   */
  href?: string
  /**
   * The words on the link beside the subject, and required whenever `href` is.
   *
   * A link whose only words are the item's own subject tells a reader nothing
   * about what activating it does, which is the same defect `Download01` refuses
   * and for the same reason: the destination is a route in the caller's own
   * application and only the caller knows what is behind it.
   */
  hrefLabel?: string
  /**
   * The controls that act on this one item: assign, defer, dismiss, snooze.
   *
   * A slot and not a set of named controls, because which actions a queue has is
   * the consumer's fact, and a Block that drew a menu would be drawing four
   * products' ideas of what can be done to a queued item. Each control inside is
   * the caller's own Component, so this is where a caller composes their own
   * menu rather than asking the Block to grow one.
   */
  actions?: ReactNode
}

/**
 * The props an Inbox01 takes.
 *
 * Every string is a prop and the Block ships none. There is no sample queue, no
 * column heading, no priority word, no state word, no moment format and no
 * sentence for an empty set, and the absence of the first is the sharpest version
 * of the rule: a queue is a claim about what is waiting on a person right now, and
 * a Block that named one would be publishing somebody else's backlog.
 */
export type Inbox01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Not optional as the other Blocks' titles are, because a table with no heading
   * is an orphan and a queue with no heading is a list a reader cannot name.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The items, in the order a reader should act on them.
   *
   * Order is the caller's and the Block does not sort, because a queue's order is
   * a claim about what matters first and a Block that sorted it would be making
   * that claim on the caller's behalf. A caller who wants it sorted by priority
   * sorts it before passing it, and a queue whose order is a database query is
   * not a Block's problem.
   */
  items: readonly InboxItem[]
  /**
   * The columns, in the order the reader should meet them.
   *
   * The `subject` column has to be among them and the run fails without it, for
   * the reason `ResourceList01` states: a header row with a cell fewer than every
   * body row is a table a reader cannot read, and the subject is also the row head
   * every other cell is read under.
   */
  columns: readonly InboxColumn[]
  /**
   * The row above the table: the caller's own `data-toolbar` with its search, its
   * filters and its count.
   *
   * A slot and not a set of named controls, for the reason `data-toolbar` gives:
   * which controls a queue has is the consumer's fact, and a Block that drew a
   * search box and a sort would be a Block that assumed the set is searchable and
   * sortable. The number of rows the Block was given is drawn at the trailing edge
   * of the same row, beside whatever the caller passed, and never inside it.
   */
  toolbar?: ReactNode
  /**
   * The count, as the caller's own words.
   *
   * A node and not a number, and the reason is the one `list-panel` gives for the
   * same prop on a panel: the sentence around a number belongs to the product.
   * "12 of 40" is true in one language and false in another, and so is "Showing
   * archived", and a Block that assembled the sentence would have assembled it in
   * this package's language, into an operations tool that may not be in English.
   * Omit it and the row is drawn with nothing at its trailing edge rather than
   * with a bare numeral, because a bare number beside a search box is a number
   * with nothing to say what it counts.
   */
  count?: ReactNode
  /**
   * Called with an item's `id` when the reader activates that item's subject and
   * the item has no `href`.
   *
   * A callback and not a router, for the reason the whole package holds: a Block
   * reports an interaction and the consumer decides what it means. An item with an
   * `href` renders as a link and never calls this, so a caller who wants one
   * behaviour for the whole queue passes either a destination for every item or
   * this for every item rather than both and hoping the reader picks correctly.
   */
  onSelect?: (id: string) => void
  /**
   * What the Block renders in place of the rows when there are none.
   *
   * Required and a node, and the reason is the sharpest one in this file: a reader
   * who opened a queue and found nothing is reading exactly one line, and that
   * line is the most load-bearing sentence on the page. "All clear" is a claim,
   * and it is a different claim in a product where the queue is genuinely empty
   * and in a product where the query is broken.
   */
  empty: ReactNode
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The classes each cell takes, before the caller's own layout classes merge in.
 *
 * Only the two prose cells are told to wrap, and the reason is the one
 * `FieldMap01` gives for the same two columns: `table.tsx` sets every cell to
 * `whitespace-nowrap` so a column of numbers lines up, and a subject with an
 * excerpt under it is a paragraph. A table that scrolls a sentence sideways to
 * keep it on one line is a table nobody reads a whole row of.
 */
const CELL: Record<InboxCell, string> = {
  subject: 'font-medium whitespace-normal',
  source: 'text-muted-foreground text-xs',
  priority: '',
  at: 'text-muted-foreground text-xs whitespace-nowrap',
  state: '',
  actions: 'text-right whitespace-nowrap',
}

/**
 * A queue of things waiting for a person: a priority, a source, a subject, a
 * moment, a state and a row of controls, in a real table under the caller's own
 * toolbar.
 *
 * **What an inbox is not in this system, and why it is worth saying first.** It is
 * not a place a queue is fetched, read, refreshed or marked as seen. A Block takes
 * its content as props and fetches no application data, and that is a law held by
 * a gate rather than a habit: `packages/ui/scripts/check-block-imports.mjs` fails a
 * Block that imports a router or a data client or calls a network function. So
 * this is the frame for a queue the consumer populates. A Block that fetched its
 * own queue would have to be reimplemented by every consumer whose queue lives
 * somewhere else, and there is no version of that which is not a fork: four
 * consumers with four stores would each either patch the fetch or copy the Block,
 * and the corpus publishes it as a product-agnostic section, so an agent composing
 * a page from it composes a request the consumer never asked for. What the Block
 * refuses is not the queue, it is the transport.
 *
 * **The table is `table.tsx` and the two words that matter are the caller's.** A
 * queue is read by comparing: which of these four is most pressing, how many are
 * urgent, which source keeps producing them. Comparison is what a table is for and
 * it is what a grid of divs cannot do, because a `div` grid has no `th` to
 * navigate by, no association between a subject and its cells, and nothing for a
 * browser's own table commands to act on. So every header is a `th` with
 * `scope="col"`, the subject is a `th` with `scope="row"`, and the caller names
 * the columns. The rejected alternative was a `DataTable01`, which is the same
 * table with a `cell` function per column and a full toolbar of its own; this
 * Block is that table for the six cells a queue has, which means a caller cannot
 * add a seventh and gets a row header for free.
 *
 * **The priority and the state are drawn in the caller's words or not at all.**
 * Both are closed unions, and both refuse to print themselves. A queue that
 * rendered `urgent` and `waiting` in English into a consumer's operations tool
 * would be the exact defect `check-block-copy.mjs` was written to end, and it is a
 * worse one here than anywhere else in the package, because an operations tool is
 * the place a person reads under time pressure in a product that is very often not
 * in English. So each item that declares a tone must also declare the words, the
 * run fails without them, and `Status` draws the dot beside the caller's sentence.
 * The rejected alternative was to print the union's own name as a fallback, and
 * the cost of that is the whole argument: it is a sentence a consumer cannot
 * translate, inside a design system rather than inside their own code, which is
 * where a translation tool is least likely to look.
 *
 * **The subject is a real control, and which real control depends on the item.** An
 * item with an `href` renders the subject as a native anchor, so the destination
 * is announced as a link, the browser's own affordances work, and middle-click
 * opens it in a new tab. An item without one renders the subject as a `Button`,
 * which is a real `<button>` with the focus ring and the hit target already
 * solved. The rejected arrangement is a `<tr onClick>`, and it is rejected for the
 * same reason `Todo01` refuses a `div` with an `onClick`: a row that listens for a
 * click is not reachable by keyboard at all, and a queue whose every row is
 * unreachable is a queue a keyboard user cannot work. A caller who needs a third
 * arrangement composes their own control in the item's `actions` slot.
 *
 * **The moment goes through `relative-time` rather than being printed, and the
 * cost of that is named.** A bare number is milliseconds and a string is anything,
 * so a cell that drew the value as passed would put a raw epoch on the page for
 * every caller whose data layer holds milliseconds, which is most of them, and
 * would print a number with no date on it for the rest. `relative-time` hands the
 * value to the platform, which knows the reader's locale and does the formatting
 * in it, and hands the sentence back to the caller for the relative half. What
 * that costs is that the moment is in the client graph rather than the server one,
 * which is a cost this Block was already paying: the module carries `'use client'`
 * because a queue has a control in it.
 *
 * **A `done` item keeps its row.** It is drawn in the muted ink and nothing else
 * changes about it, and the reason is the one the whole Block rests on: a queue is
 * read to decide what to do next, and a row that disappears is a decision a reader
 * cannot audit. Removing a completed item is the consumer's filter, and the
 * consumer is the only one who knows whether the reader wanted it.
 *
 * It is a client Component, and the reason is the callback rather than the state:
 * `onSelect` is a function, a function is a piece of state, and state is a client
 * module. A server component cannot hand an event handler to a `<button>`, so a
 * caller rendering this from a server component would get a queue whose subjects
 * do nothing. The rest of the rendering is a table, which is the price of that and
 * a small one.
 */
export function Inbox01({
  eyebrow,
  title,
  description,
  items,
  columns,
  toolbar,
  count,
  onSelect,
  empty,
  headingLevel = 'h2',
  className,
}: Inbox01Props) {
  const seen = new Set<InboxCell>()
  for (const column of columns) {
    if (seen.has(column.id)) {
      throw new Error(
        `Inbox01: the column "${column.id}" is declared twice, so the table would have two columns ` +
          'reading the same value and every cell after the first would be read under the wrong name. ' +
          'Declare each cell once.',
      )
    }
    seen.add(column.id)
  }
  if (!seen.has('subject')) {
    throw new Error(
      'Inbox01: the columns name no "subject" cell, so the header row would have a cell fewer than every ' +
        'body row and no row would have a header for a reader to navigate into. Declare the subject ' +
        'column, which is also the row header for every row.',
    )
  }
  if (seen.has('actions') && !items.some((item) => item.actions !== undefined)) {
    throw new Error(
      'Inbox01: the "actions" column was declared and no item passed any actions, so the table would ' +
        'carry a column of empty cells, which is a column every reader scans twice. Pass the controls a ' +
        'row carries, or drop the column.',
    )
  }
  for (const item of items) {
    if (item.priority !== undefined && item.priorityLabel === undefined) {
      throw new Error(
        `Inbox01: the item "${item.subject}" declares a priority and no priorityLabel, so the tone would be ` +
          'a coloured dot with no sentence beside it, which is invisible to a reader who cannot separate ' +
          'the tones and unreadable to a screen reader whatever the tones are. Pass the words for the ' +
          'priority, or drop the priority.',
      )
    }
    if (item.state !== undefined && item.stateLabel === undefined) {
      throw new Error(
        `Inbox01: the item "${item.subject}" declares a state and no stateLabel, so the tone would be a ` +
          'coloured dot with no sentence beside it. Pass the words for the state, or drop the state.',
      )
    }
    if (item.href !== undefined && item.hrefLabel === undefined) {
      throw new Error(
        `Inbox01: the item "${item.subject}" declares an href with no hrefLabel, so the link would carry ` +
          'no words of its own and a reader would not know what activating it does. Pass the words that ' +
          'say what it does, or omit the href.',
      )
    }
  }

  const hasToolbar = toolbar !== undefined || count !== undefined

  return (
    <Section data-slot="inbox-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {hasToolbar ? (
        /*
         * One row, the caller's own toolbar at the leading edge and the count at
         * the trailing one. `ms-auto` rather than a spacer element, because the
         * row wraps and a spacer becomes a group of its own on the second line,
         * which is the arrangement `data-toolbar` takes for the same reason.
         */
        <div
          data-slot="inbox-01-toolbar"
          className="mb-4 flex flex-wrap items-center gap-3"
        >
          {toolbar}
          {count === undefined ? null : (
            <span data-slot="inbox-01-count" className="text-muted-foreground ms-auto text-sm">
              {count}
            </span>
          )}
        </div>
      ) : null}

      <div data-slot="inbox-01-table" className="border-border overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} scope="col" className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} data-slot="inbox-01-row" data-state={item.state}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(CELL[column.id], column.className)}
                    >
                      {cellOf(column.id, item, onSelect)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Section>
  )
}

/**
 * The cell one column draws for one item.
 *
 * A switch rather than a map of render functions, for the reason `FieldMap01`
 * gives: a map keyed by cell id would be a second recipe of the kind this package
 * keeps off the public surface, and a switch over six cases is the same table with
 * the strings in the same file as the drawing that uses them.
 *
 * The two `Status` cells are narrowed rather than asserted. The diagnostics in
 * `Inbox01` have already refused a tone with no words, so those two conditions
 * cannot be false here, and spelling them out means the types read the same rule
 * the runtime does rather than a non-null assertion standing in for it.
 */
function cellOf(id: InboxCell, item: InboxItem, onSelect?: (id: string) => void): ReactNode {
  switch (id) {
    case 'subject':
      return (
        <div data-slot="inbox-01-subject" className="flex min-w-0 flex-col gap-1">
          {activatorOf(item, onSelect)}
          {item.excerpt === undefined ? null : (
            <span className="text-muted-foreground text-pretty text-xs">{item.excerpt}</span>
          )}
        </div>
      )
    case 'source':
      return item.source ?? null
    case 'priority':
      if (item.priority === undefined || item.priorityLabel === undefined) return null
      return (
        <Status size="sm" tone={PRIORITY_TONE[item.priority]} label={item.priorityLabel(item.priority)} />
      )
    case 'at':
      if (item.at === undefined) return null
      // The node form is the one case where the caller brought the whole reading,
      // including a relative sentence of their own, and there is nothing left to
      // ask the platform for.
      if (typeof item.at !== 'string' && typeof item.at !== 'number') return item.at
      return <RelativeTime date={item.at} />
    case 'state':
      if (item.state === undefined || item.stateLabel === undefined) return null
      return <Status size="sm" tone={STATE_TONE[item.state]} label={item.stateLabel} />
    case 'actions':
      return item.actions ?? null
  }
}

/**
 * The control that opens one item, and the whole of the keyboard question in this
 * Block.
 *
 * A destination gives a native anchor, so the item is announced as a link and the
 * browser's own affordances all work on it. No destination gives a `Button`, which
 * is a real `<button>` with its focus ring and its coarse-pointer hit target
 * already solved. What neither arrangement is, is a row that listens for a click:
 * a `<tr onClick>` is not in the tab order at all, so a queue built that way is
 * one a keyboard user cannot work, and the gate on focus indicators is the gate
 * that says so.
 *
 * The control takes the subject as its own words rather than carrying an extra
 * label beside it, so the accessible name a reader hears is the same text the
 * table's row head carries and the two cannot drift.
 */
function activatorOf(item: InboxItem, onSelect?: (id: string) => void): ReactNode {
  if (item.href !== undefined && item.hrefLabel !== undefined) {
    return (
      <CtaLink
        data-slot="inbox-01-link"
        href={item.href}
        variant="ghost"
        size="sm"
        className="self-start whitespace-normal"
      >
        {item.subject}
      </CtaLink>
    )
  }
  if (onSelect === undefined) {
    return <span data-slot="inbox-01-subject-text">{item.subject}</span>
  }
  return (
    <Button
      data-slot="inbox-01-select"
      type="button"
      variant="ghost"
      size="sm"
      className="self-start whitespace-normal"
      onClick={() => onSelect(item.id)}
    >
      {item.subject}
    </Button>
  )
}

export default Inbox01
