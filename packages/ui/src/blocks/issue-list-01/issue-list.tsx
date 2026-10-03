import { useId, type ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
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
 * The eight cells an issue row can draw, and the eight column names a caller names
 * them with.
 *
 * A closed set, and the closure is the point: the cells are the Block's, so a
 * table with a ninth column would be a column with nothing to put in it. The names
 * are the caller's, which is the other half of the same thing, and on a tracker
 * they are not close to Prism's: one product calls the third column "Status",
 * another "Stage" and a third "Queue", and a Block that chose would have put one
 * product's vocabulary of issue workflow into every consumer's page.
 */
export type IssueListCell =
  | 'key'
  | 'title'
  | 'state'
  | 'priority'
  | 'assignee'
  | 'updated'
  | 'labels'
  | 'href'

/**
 * One column of an issue list: which cell it draws, and the words above it.
 *
 * The shape follows `ResourceListColumn` for the reason that type gives: the cells
 * are closed, so the `cell` function `DataTableColumn` takes is deliberately
 * dropped, and what is left is the caller's. `className` is layout, for alignment
 * or a fixed width, and it changes where a column sits and never what a cell looks
 * like.
 */
export type IssueListColumn = {
  /** Which of the eight cells this column draws. */
  id: IssueListCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /**
   * Layout classes for the column, applied to the header cell and to every cell
   * under it.
   */
  className?: string
}

/**
 * One issue: what it is called, what it is called by, where it is, and who has it.
 *
 * `key`, `title` and `state` are required. The key because a row a reader cannot
 * refer to is a row nobody can act on, the title because a row with no title is a
 * row of metadata, and `state` because a tracker with no state on an issue is a
 * list rather than a queue. Everything else is optional because a tracker is
 * heterogeneous: an unassigned issue is the normal case on a new project and a
 * shape that made `assignee` required would be a list of placeholders.
 */
export type IssueListIssue = {
  /** The issue's stable key within the list. */
  id: string
  /**
   * The issue's own reference, as the tracker spells it.
   *
   * Drawn in the mono face beside the title, and the reason is the one
   * `SectionHeading` states for its `index` prop: a position in a sequence is
   * machine notation rather than a word, and the mono stack is what this repository
   * annotates machine-readable values with. An identifier is the same kind of
   * value, and it is read far more often than a section index, because a reader
   * scanning a tracker looks for `NEX-412` and not for the sentence beside it.
   * Setting it in the sans face costs the reader the one thing that makes a column
   * of references scannable.
   */
  key: string
  /** What the issue is, in the words a reader would use about it. */
  title: string
  /**
   * Where the issue is in its life, in the tracker's own vocabulary.
   *
   * A string and not a closed union, and the argument for that is the reason this
   * Block's tone table is a guess rather than a translation. A tracker has its own
   * workflow and its own words for it, and between them the products that compose
   * this Block already use more states than any closed set here could hold:
   * `in-review`, `needs-info`, `waiting-on-third-party`, `ready-for-qa`. A design
   * system that closed the set would force every one of those products to map its
   * state onto one of the system's words and ship a translation nobody asked for,
   * and the translation is the part that goes stale: the moment a tracker adds a
   * state, the product's map is behind and the table is confidently wrong about
   * where its own issues are. So the words are the caller's, unchanged and
   * untranslated, and the Block maps the tone by guessing from the word and
   * guessing to `neutral` when it does not recognise one.
   */
  state: string
  /**
   * The words for the state, when the tracker's own word is not the sentence the
   * reader should see.
   *
   * Optional, and it falls back to `state` itself rather than being required. That
   * is the difference from a Block whose states are a closed union: there the word
   * `waiting` is Prism's and has to be replaced, and here `waiting on third
   * party` is the caller's and is already a sentence a reader can act on.
   */
  stateLabel?: string
  /**
   * How pressing the issue is, in the tracker's own vocabulary.
   *
   * A string for the same reason `state` is, and the tone is a guess for the same
   * reason. The `priorityLabel` function exists because a priority is very often
   * not a word at all: `P1`, `sev-1` and `blocker` are notations, and a notation
   * next to a reader is a notation that has to be expanded somewhere.
   */
  priority?: string
  /**
   * The words for the priority, given the priority the caller passed.
   *
   * Optional, and it falls back to the priority string itself. A caller whose
   * priorities are already words passes nothing, and a caller whose are notations
   * writes the expansion once here rather than in every row.
   */
  priorityLabel?: (priority: string) => string
  /** Who has it, in the product's own words. A person, a team, a role. */
  assignee?: string
  /**
   * The assignee's picture, when there is one.
   *
   * A `name` is required and the `src` is not, because the name is what the
   * fallback initials are made from and a face with no name beside it identifies
   * nobody. Both are the caller's: a tracker that fetched a directory would be a
   * tracker with a data client in it.
   */
  assigneeAvatar?: { src?: string; name: string }
  /**
   * When the issue last moved, in whichever of the three forms the caller holds it.
   *
   * Drawn through `relative-time`, so a number arrives as a date in the reader's
   * own locale and a string is handed to the platform untouched. The rejected
   * alternative was drawing the value as passed, which puts a raw epoch on the page
   * for every caller whose API hands back milliseconds, and a tracker sorted by
   * when it last moved with a column of integers in it is a tracker nobody can
   * read.
   */
  updated?: number | string | ReactNode
  /**
   * The caller's own words for the moment, given the moment they passed.
   *
   * Optional, and used only when `updated` is a value: it is the relative half,
   * and the absolute half is the platform's, which is the split `relative-time`
   * states at length. A caller who wants both halves in their own voice passes a
   * node as `updated` instead, and this is not called.
   */
  updatedLabel?: (value: number | string) => string
  /** Where the issue goes. Its presence makes the row carry a link. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is.
   *
   * A link whose only words are the issue's own title tells a reader nothing about
   * what activating it does, which is the same defect `Download01` refuses.
   */
  hrefLabel?: string
  /**
   * The issue's other labels, in the caller's own words.
   *
   * A set rather than one string because a tracker's facets differ by product: one
   * tags by component, one by release, one by the team that owns the area. The cost
   * is named on the prop: an issue carrying six of them is a row a reader has to
   * read across rather than scan, and that is the caller's decision to make.
   */
  labels?: readonly { id: string; label: string }[]
}

/**
 * The tone each of the caller's own state words maps to, matched exactly.
 *
 * **The words are the caller's and the tone is a guess, and the default is the
 * tone that asserts nothing.** The table is a list of states a tracker might
 * plausibly use, matched whole and lowercased, and anything it does not name comes
 * out `neutral`. That default is the whole design: `neutral` is drawn in the muted
 * foreground and asserts no urgency, so a miss costs a colour and not a lie. A
 * default of `warning` would be the same table with a worse failure, because a
 * tracker with a state this Block has never heard of would arrive as a wall of
 * amber and the reader would learn that amber means nothing.
 *
 * The matching is whole-word and not a substring, and the reason is that a
 * substring match gets the two cases that matter backwards. `unresolved` contains
 * `resolved` and is nothing of the sort, and `not-blocked` contains `blocked` and
 * is the opposite of it. A tracker that says `unresolved` would be drawn as
 * finished by a substring table, and a reader would close an issue that is open.
 *
 * **A `Map` rather than an object, because the key is a string a consumer wrote.**
 * An object would answer `constructor` and `toString` with something out of its own
 * prototype, and a tracker that has an issue state called `constructor` would
 * render a function in a table cell.
 */
const STATE_TONE = new Map<string, StatusTone>([
  ['done', 'success'],
  ['closed', 'success'],
  ['complete', 'success'],
  ['completed', 'success'],
  ['resolved', 'success'],
  ['shipped', 'success'],
  ['released', 'success'],
  ['live', 'success'],
  ['passed', 'success'],
  ['waiting', 'warning'],
  ['pending', 'warning'],
  ['review', 'warning'],
  ['in-review', 'warning'],
  ['in_review', 'warning'],
  ['inreview', 'warning'],
  ['on-hold', 'warning'],
  ['hold', 'warning'],
  ['blocked', 'warning'],
  ['at-risk', 'warning'],
  ['degraded', 'warning'],
  ['stale', 'warning'],
  ['failed', 'destructive'],
  ['error', 'destructive'],
  ['broken', 'destructive'],
  ['rejected', 'destructive'],
  ['cancelled', 'destructive'],
  ['canceled', 'destructive'],
  ['wontfix', 'destructive'],
  ['wont-fix', 'destructive'],
  ['invalid', 'destructive'],
  ['open', 'info'],
  ['new', 'info'],
  ['active', 'info'],
  ['in-progress', 'info'],
  ['in_progress', 'info'],
  ['doing', 'info'],
  ['started', 'info'],
  ['triaged', 'info'],
  ['scheduled', 'info'],
  ['ready', 'info'],
])

/**
 * The tone each of the caller's own priority words maps to, on the same terms as
 * `STATE_TONE`.
 *
 * Priorities are a severer scale than states, so the table is a shift: the top of
 * it takes the destructive tone because a priority is an explicit statement that
 * something is more urgent than something else, and the bottom takes the muted ink
 * because a low priority is the absence of urgency rather than a smaller alarm.
 */
const PRIORITY_TONE = new Map<string, StatusTone>([
  ['urgent', 'destructive'],
  ['critical', 'destructive'],
  ['blocker', 'destructive'],
  ['highest', 'destructive'],
  ['sev1', 'destructive'],
  ['sev-1', 'destructive'],
  ['p0', 'destructive'],
  ['p1', 'destructive'],
  ['high', 'warning'],
  ['major', 'warning'],
  ['important', 'warning'],
  ['p2', 'warning'],
  ['normal', 'info'],
  ['medium', 'info'],
  ['moderate', 'info'],
  ['p3', 'info'],
  ['low', 'neutral'],
  ['lowest', 'neutral'],
  ['minor', 'neutral'],
  ['trivial', 'neutral'],
  ['someday', 'neutral'],
  ['p4', 'neutral'],
  ['p5', 'neutral'],
])

/** The classes each cell takes, before the caller's own layout classes merge in. */
const CELL: Record<IssueListCell, string> = {
  key: 'text-muted-foreground font-mono text-xs',
  title: 'font-medium whitespace-normal',
  state: '',
  priority: '',
  assignee: 'whitespace-nowrap',
  updated: 'text-muted-foreground text-xs whitespace-nowrap',
  labels: 'whitespace-normal',
  href: 'text-right whitespace-nowrap',
}

/**
 * The props an IssueList01 takes.
 *
 * Every string is a prop and the Block ships none. There is no reference format,
 * no column heading, no state word, no priority word and not one issue, and the
 * absence of the last is the sharpest version of the rule: an issue list is a
 * claim about what a team is carrying this week, and a Block that shipped one
 * would be publishing another product's backlog.
 */
export type IssueList01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title, and required. A table with no heading is an orphan. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order the reader should meet them.
   *
   * Order is the caller's because an issue list has several plausible orders and
   * each is a claim about what matters: updated first for a triage queue, priority
   * first for a delivery list. The `title` column has to be among them and the run
   * fails without it, for the reason `ResourceList01` states: the title is the
   * row head every other cell is read under, and a header row with a cell fewer
   * than every body row is a table a reader cannot read.
   */
  columns: readonly IssueListColumn[]
  /**
   * The issues, in the order a reader should meet them.
   *
   * Order is the caller's and the Block does not sort, for the reason every list
   * in this package gives: a tracker query is very often already ordered by the
   * thing that produced it, by rank or by a filter the Block cannot see, and a
   * Block that sorted by updated would undo a triage order somebody reasoned about.
   */
  issues: readonly IssueListIssue[]
  /**
   * The row above the table: the caller's own `data-toolbar` with its search, its
   * filters and its count.
   *
   * A slot and not a set of named controls, for the reason `data-toolbar` gives:
   * which controls a list has is the consumer's fact, and a Block that drew a
   * search box and a filter set would be a Block that assumed the set is
   * searchable.
   */
  toolbar?: ReactNode
  /**
   * The band under the table, for the line that says what the list is: how much
   * of it is shown, where the rest is, or a link to the full set.
   *
   * A slot and not a count, for the reason `data-toolbar` gives about its own
   * trailing slot: the sentence around a number belongs to the product.
   */
  footer?: ReactNode
  /**
   * What the Block renders in place of the rows when there are none.
   *
   * Required and a node, and a tracker is the case where it matters most: an empty
   * issue list means "nothing is carrying", "nothing matches this filter" and "the
   * query failed" are three different facts, and the sentence that distinguishes
   * them is the caller's.
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The two-letter mark a face falls back to, from a name the caller already holds.
 *
 * Two letters and not three, because the circle this sits in is twenty pixels
 * across and a third letter is a mark narrower than the gap between two of them.
 * The name is the caller's data, so this reads it and invents nothing.
 */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

/** The moment half of a row, which is a value, a node, or nothing at all. */
function updatedOf(issue: IssueListIssue): ReactNode {
  if (issue.updated === undefined) return null
  if (typeof issue.updated !== 'string' && typeof issue.updated !== 'number') return issue.updated
  return <RelativeTime date={issue.updated} relative={issue.updatedLabel?.(issue.updated)} />
}

/**
 * An issue list: a reference, a title, a state, a priority, an assignee, when it
 * last moved and a link, in a real table under the caller's own toolbar.
 *
 * **The table is `table.tsx` and the title is a row head, which is the whole
 * accessibility claim.** A tracker is the surface where a reader compares most and
 * reads least: they are looking for the one issue they have to pick up, scanning a
 * column of references and a column of states. That is what a table is for, and it
 * is what a grid of divs cannot do, because a `div` grid has no `th` to navigate
 * by, no association between an issue and its cells, and nothing for a browser's
 * own table commands to act on. So every header is a `th` with `scope="col"` and
 * the title is a `th` with `scope="row"`, which means a reader who has navigated
 * into a single cell is told which issue they are looking at rather than hearing a
 * state with nothing to attach it to.
 *
 * **The reference is set in the mono face, for the reason `SectionHeading` states
 * for its `index` prop, and the reason it matters more here than anywhere.** That
 * prop's note says a position in a sequence is machine notation rather than a word
 * and the mono stack is what this repository annotates machine-readable values
 * with. An issue's own reference is exactly that, and it is the value a tracker
 * reader scans for: they are looking for `NEX-412`, not for the sentence beside
 * it, and a column of references set in the sans face is a column a reader has to
 * read one at a time to confirm. The mono face gives the letters a fixed width so
 * the column aligns and the shapes of the references are distinguishable at a
 * glance, which is the entire job the sans face is bad at.
 *
 * **The state and the priority are strings rather than closed unions, and the
 * argument is that a tracker has its own vocabulary.** A design system that closed
 * the set would force a consumer whose tracker says `in-review`, or
 * `waiting-on-third-party`, or `needs-info` to map that onto one of the system's
 * words and ship a translation nobody asked for. The translation is the part that
 * rots: the week a tracker adds a state, every product's map is a version behind
 * and the table is confidently wrong about where its own issues are, with nothing
 * on the page to say so. So the words cross the seam untouched, they are the
 * caller's own, and the Block takes them as they are.
 *
 * **The tones are still mapped, and the mapping is a guess that says so.** With
 * the words open, a Block that refused to colour anything would be a table of
 * plain text where the one thing a reader was scanning for is missing, so the
 * Block maps a tone by matching the caller's word against a stated list of words a
 * tracker might plausibly use, and matches it whole rather than as a substring, so
 * `unresolved` is not read as `resolved` and `not-blocked` is not read as
 * `blocked`. Anything the list does not name comes out `neutral`, and that default
 * is the design: `neutral` is the tone that asserts nothing, so a state this Block
 * has never heard of costs a colour and not a lie. A consumer whose states need
 * different colours draws its own `Status` in a column of its own, and the answer
 * costs them a column rather than costing every consumer a wrong tone.
 *
 * **The state and the priority labels are optional here and required on the
 * Blocks whose states are closed, and the difference is worth stating because it
 * looks like an inconsistency.** On `Inbox01` the word `urgent` is Prism's, so a
 * consumer whose product says `overdue` has to replace it and the Block refuses to
 * guess. Here the word `waiting on third party` is the consumer's and is already a
 * sentence a reader can act on, so `stateLabel` falls back to the state's own
 * string and a caller who wants a longer sentence passes one. Forcing the function
 * here would be a prop every consumer writes and no consumer needs.
 *
 * It is a server Component: no hook, no state, no effect and no router. The one
 * Component it composes that is a client module is `relative-time`, and only for a
 * caller who passes a moment, so an issue list with no `updated` column costs a
 * consumer nothing in client JavaScript.
 */
export function IssueList01({
  eyebrow,
  title,
  description,
  columns,
  issues,
  toolbar,
  footer,
  empty,
  headingLevel = 'h2',
  className,
}: IssueList01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  const seen = new Set<IssueListCell>()
  for (const column of columns) {
    if (seen.has(column.id)) {
      throw new Error(
        `IssueList01: the column "${column.id}" is declared twice, so the table would have two columns ` +
          'reading the same value and every cell after the first would be read under the wrong name. ' +
          'Declare each cell once.',
      )
    }
    if (column.id === 'href' && !issues.some((issue) => issue.href !== undefined)) {
      throw new Error(
        'IssueList01: the "href" column was declared and no issue passed an href, so the table would ' +
          'carry a column of empty cells, which is a column every reader scans twice. Pass the links, or ' +
          'drop the column.',
      )
    }
    if (column.id === 'labels' && !issues.some((issue) => issue.labels !== undefined)) {
      throw new Error(
        'IssueList01: the "labels" column was declared and no issue passed any labels, so the table would ' +
          'carry a column of empty cells. Pass the labels, or drop the column.',
      )
    }
    seen.add(column.id)
  }
  if (!seen.has('title')) {
    throw new Error(
      'IssueList01: the columns name no "title" cell, so the header row would have a cell fewer than every ' +
        'body row and no row would have a header for a reader to navigate into. Declare the title column, ' +
        'which is also the row header for every row.',
    )
  }
  for (const issue of issues) {
    if (issue.href !== undefined && issue.hrefLabel === undefined) {
      throw new Error(
        `IssueList01: the issue "${issue.key}" declares an href with no hrefLabel, so the link would carry ` +
          'no words of its own and a reader would not know what activating it does. Pass the words that ' +
          'say what it does, or omit the href.',
      )
    }
  }

  return (
    <Section data-slot="issue-list-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {toolbar === undefined ? null : (
        <div data-slot="issue-list-01-toolbar" className="mb-4">
          {toolbar}
        </div>
      )}

      <div data-slot="issue-list-01-table" className="border-border overflow-hidden rounded-xl border">

        {/*
         * The table takes its name from the heading above it rather than from a
         * second copy of the same words. A `<table>` is named by a caption, an
         * `aria-label` or an `aria-labelledby`, and none of the three is inferred
         * from a heading that happens to be nearby, so a reader listing the tables
         * on a page found this one anonymous while every other element around it was
         * named. A reference rather than a caption because a caption is drawn, and a
         * visible line repeating the heading is noise; a reference because `title`
         * is the caller own words and a Block may not compose a second set. See
         * `Table`, which asks for exactly one of the three.
         */}
        <Table aria-labelledby={headingId}>
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
            {issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id} data-slot="issue-list-01-row">
                  {columns.map((column) =>
                    /*
                     * The title is the row head, so a reader who navigates into a
                     * single cell is told which issue they are looking at rather
                     * than hearing a state with nothing to attach it to.
                     */
                    column.id === 'title' ? (
                      <TableHead
                        key={column.id}
                        scope="row"
                        className={cn(CELL[column.id], column.className)}
                      >
                        {issue.title}
                      </TableHead>
                    ) : (
                      <TableCell
                        key={column.id}
                        className={cn(CELL[column.id], column.className)}
                      >
                        {cellOf(column.id, issue)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {footer === undefined ? null : (
          <div
            data-slot="issue-list-01-footer"
            className="bg-muted/50 text-muted-foreground border-t px-4 py-3 text-sm"
          >
            {footer}
          </div>
        )}
      </div>
    </Section>
  )
}

/**
 * The cell one column draws for one issue.
 *
 * A switch rather than a map of render functions, for the reason `FieldMap01`
 * gives: a map keyed by cell id would be a second recipe of the kind this package
 * keeps off the public surface, and a switch over eight cases is the same table
 * with the strings in the same file as the drawing that uses them.
 */
function cellOf(id: IssueListCell, issue: IssueListIssue): ReactNode {
  switch (id) {
    case 'key':
      return issue.key
    case 'title':
      return issue.title
    case 'state':
      return (
        <Status
          size="sm"
          tone={STATE_TONE.get(issue.state.trim().toLowerCase()) ?? 'neutral'}
          label={issue.stateLabel ?? issue.state}
        />
      )
    case 'priority':
      if (issue.priority === undefined) return null
      return (
        <Status
          size="sm"
          tone={PRIORITY_TONE.get(issue.priority.trim().toLowerCase()) ?? 'neutral'}
          label={issue.priorityLabel?.(issue.priority) ?? issue.priority}
        />
      )
    case 'assignee':
      if (issue.assigneeAvatar === undefined && issue.assignee === undefined) return null
      return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {/*
           * The initials as a plain circle rather than the `Avatar` Component, and
           * the reason is what this list costs otherwise. `Avatar` is a client
           * Component, so composing it here would pull Base UI's avatar into the
           * client graph for a twenty pixel decoration on a surface whose whole
           * point is that it is server markup. The circle is `aria-hidden` and the
           * name sits beside it, so the face is never the only statement of who
           * has the issue.
           */}
          {issue.assigneeAvatar === undefined ? null : (
            <span
              data-slot="issue-list-01-assignee"
              className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium"
              aria-hidden="true"
            >
              {initialsOf(issue.assigneeAvatar.name)}
            </span>
          )}
          {issue.assignee ?? issue.assigneeAvatar?.name}
        </span>
      )
    case 'updated':
      return updatedOf(issue)
    case 'labels':
      if (issue.labels === undefined) return null
      return (
        <span className="flex flex-wrap gap-1">
          {issue.labels.map((label) => (
            <Badge key={label.id} variant="secondary">
              {label.label}
            </Badge>
          ))}
        </span>
      )
    case 'href':
      if (issue.href === undefined || issue.hrefLabel === undefined) return null
      return (
        <CtaLink href={issue.href} variant="ghost" size="sm">
          {issue.hrefLabel}
        </CtaLink>
      )
  }
}

export default IssueList01
