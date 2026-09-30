import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Diff } from '../../components/ui/diff'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn, dayKey } from '../../lib/utils'

/**
 * The columns an audit log can hold, as a closed set.
 *
 * **Six, and they are the six facts a record of a change has.** A moment, an actor, a
 * target, a description of the change, the change itself when there is a before and
 * an after, and where the record can be read in full. An audit log is the surface
 * where a design system is most tempted to grow a seventh column: a source, an
 * environment, a request id, a user agent. Each one is a claim about the reader's
 * system, because a Block cannot know whether a seventh thing is required, and a
 * caller who has one composes it into `change`, which is a string. So the set is
 * closed and the naming and the order are the caller's.
 */
export type AuditLogColumnId = 'at' | 'actor' | 'target' | 'change' | 'diff' | 'link'

/**
 * One column: a machine id the Block reads the cell from, and the caller's own words
 * above it.
 *
 * The `header` shape is `DataTableColumn`'s, and the reason is that a table is a table:
 * a reader who has learned what a column is called on one surface has learned it on
 * every surface, and two words for the same column in two Blocks is a vocabulary
 * problem rather than a design one. What this type does not carry is the `cell`
 * renderer `DataTableColumn` has, because the cells here are the six above and a
 * renderer would be a way for a caller to put anything in a cell that a table's
 * column semantics then describe wrongly.
 */
export type AuditLogColumn = {
  /** Which of the six facts this column holds. */
  id: AuditLogColumnId
  /** The words above the column, in the reader's own vocabulary. */
  header: ReactNode
}

/**
 * The words `diff.tsx` needs, and the reason this Block cannot write them.
 *
 * `Diff` states the whole argument: a diff that announced "added" and "removed" in
 * English would be a diff every consumer inherits in a language they did not choose,
 * because a shared library cannot know whether the word for this is "added" or
 * "ajoute" or "hinzugefuegt". So the Component asks, and this Block asks in turn.
 *
 * `context` is required even though a change of a value never draws an unchanged line,
 * and that is a real cost of composing a Component whose prop is closed at three. The
 * type cannot be narrowed from here and the alternative was for this Block to write a
 * word for a state it never draws, which is the exact defect `diff.tsx` exists to
 * refuse. A caller passes their own word for it and the line is never reached, and the
 * cost is one prop rather than a fork.
 */
export type AuditLog01DiffLabels = {
  /** Read for the line that was there before. */
  removed: string
  /** Read for the line that is there now. */
  added: string
  /** Read for a line that did not change, which a value change never draws. */
  context: string
}

/**
 * One record of a change: a moment, an actor, a target, what changed, and where the
 * before and after live when there are any.
 *
 * **The first four are the four parts of a record of a change, and the rest is
 * annotation.** An entry with no target is rare rather than ordinary, because a
 * change to nothing is not a change, so `target` is required. The optional fields are
 * all things a given product has and another does not.
 *
 * `change` is the caller's words for what happened, and that is the one field in this
 * Block that could not be anything else. "Updated the record limit" and "removed the
 * old export" are sentences about a product, and a Block that assembled one would be
 * publishing a claim about somebody else's system. It is also the row header the
 * table announces with every other cell in the row, so it is the one string a reader
 * hears more than once.
 */
export type AuditLog01Entry = {
  /** A key unique within the set, carried on the markup as `data-entry`. */
  id: string
  /**
   * When the change happened, printed exactly as passed.
   *
   * A `number` or a `string` and never a `Date`, and the reason is the one
   * `ContentGrid01Entry`'s `at` gives: a Block ships no formatting, so the reading a
   * reader should see is the caller's own. A number is epoch milliseconds and is
   * printed as a number, which is honest and almost never what was wanted; a string
   * is printed as written. The machine value is still on the `time` element's
   * `dateTime`, so a crawler and a screen reader get a timestamp whatever the visible
   * reading says.
   */
  at: number | string
  /** Who made the change, in the words the system uses for a person or a process. */
  actor: string
  /**
   * What changed: a record, a setting, a document, a key.
   *
   * Required, because a change to nothing is not a change, and a log whose row has no
   * target is a log of events rather than a log of changes.
   */
  target: string
  /**
   * What happened, in the caller's own words.
   *
   * The row header the table announces with every other cell in the row, and a
   * `string` rather than a node because a table cell holding a node is a cell a
   * reader cannot scan down.
   */
  change: string
  /**
   * What the target held before, when the product records it.
   *
   * A `string` and not a node, because a value is a value and a `Diff` compares two
   * of them. A caller whose before is a document composes the diff themselves and
   * passes it in the surface they already have.
   */
  before?: string
  /** What the target holds now, when the product records it. */
  after?: string
  /** Where the record is kept. Its presence makes the row carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the entry's own change tells a reader nothing about
   * what following it does, and on an audit log that is worse than elsewhere, because
   * a reader following a link to check a claim deserves to know what they are about
   * to open.
   */
  hrefLabel?: string
  /**
   * The urgency of the change, drawn as a `Status` beside the change words.
   *
   * Required with `toneLabel` and refused without it, for the reason
   * `StatusLedger01` states in full: the state is a colour and the words are the
   * information, and a publisher that says "reverted" where another's says "reverted
   * by policy" cannot be given one vocabulary by a design system.
   */
  tone?: StatusTone
  /**
   * The words for that urgency, in the system's own vocabulary.
   *
   * Required whenever `tone` is set, and not defaulted, because the machine value
   * would be printed into an audit document as if it were a term of art.
   */
  toneLabel?: string
}

/**
 * The refusals, as checks, so a row that would render a link nobody can name, a moment
 * with no machine value, an urgency with no words, or a diff with no words for its
 * sides is a diagnostic in a console rather than a rendered control.
 *
 * The first three are the house pair rules and each one names the field. The fourth is
 * the one that earns its place on an audit log in particular: a diff that announces
 * its two sides in English is an English sentence inside somebody else's compliance
 * record, and there is no arrangement in which that is acceptable.
 */
function assertEntry(
  entry: AuditLog01Entry,
  diffLabels: AuditLog01DiffLabels | undefined,
  showDiffs: boolean,
): void {
  if ((entry.href === undefined) !== (entry.hrefLabel === undefined)) {
    throw new Error(
      `AuditLog01: the entry "${entry.change}" on ${entry.target} declares one of href and hrefLabel without the ` +
        'other, so the row would carry a link with no words on it, or a name with no link beside it. Pass the ' +
        'words that say what following it does, or omit the href.',
    )
  }

  if (!Number.isFinite(new Date(entry.at).getTime())) {
    throw new Error(
      `AuditLog01: the entry "${entry.change}" on ${entry.target} passes an at the platform cannot read, so there ` +
        'is no value to put in the time element and the row would claim to be a moment it cannot name. Pass epoch ' +
        'milliseconds, or a string the platform parses.',
    )
  }

  if (entry.tone !== undefined && entry.toneLabel === undefined) {
    throw new Error(
      `AuditLog01: the entry "${entry.change}" on ${entry.target} declares a tone and no words for it, so the mark ` +
        'would be a colour with nothing to read beside it, in a record a reader may have to show to somebody else. ' +
        'Pass toneLabel in the vocabulary the system uses, which is not this Block choice.',
    )
  }

  const diffable = entry.before !== undefined || entry.after !== undefined
  if (showDiffs && diffable && diffLabels === undefined) {
    throw new Error(
      `AuditLog01: the entry "${entry.change}" on ${entry.target} carries a before or an after and no diffLabels ` +
        'were passed, so the change would be drawn with no words for the two sides, and a reader using a screen ' +
        'reader would hear two lines and no way to tell which is which. Pass the words this product uses.',
    )
  }
}


/**
 * The props an AuditLog01 takes, as a union over whether the log is grouped.
 *
 * A union rather than an optional `dayLabel` beside an optional `groupBy`, for the
 * reason `HeroAction` is the reference and `activity-feed-01` states in full: a label
 * that is required in one arm and forbidden in the other is a prop whose absence is
 * sometimes a mistake and sometimes a decision, and a caller who writes
 * `groupBy="day"` and forgets the label should not compile.
 */
export type AuditLog01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, required.
   *
   * Required because this is the one surface where an unlabelled table of changes is
   * a defect rather than a layout: a table of assertions with no statement of whose
   * system they are about reads as a record nobody issued.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order they should be read.
   *
   * Order and naming are both the caller's, and both are claims. The order is a claim
   * about what a reader checks first, and on an audit log that is usually the actor or
   * the moment rather than the change. The set of ids is closed, so a column this
   * Block cannot fill throws rather than rendering an empty one.
   */
  columns: readonly AuditLogColumn[]
  /**
   * The entries, newest first unless the system says otherwise.
   *
   * The Block does not sort, and the reason is the one `changelog-01` gives and it is
   * stronger here: an audit trail that a Block reordered would be a claim about which
   * record came first, and that claim is the record. See the Block's JSDoc.
   */
  entries: readonly AuditLog01Entry[]
  /**
   * Whether a before and an after are drawn.
   *
   * @defaultValue true
   *
   * On by default, because a change nobody can see the content of is an assertion, and
   * an assertion in an audit record is the one thing a log must not be. Pass `false`
   * for the log whose entries name a change in prose and carry no values, where the
   * `diff` column would be a column of gaps. Doing so also drops the `diff` column
   * from `columns` if it was named, because a column of empty cells in a log is a
   * column a reader checks and finds nothing in.
   */
  showDiffs?: boolean
  /**
   * The words `diff.tsx` needs for the two sides of a change.
   *
   * Optional in the type and required in practice for the same reason `unreadLabel`
   * is on `notification-center-01`: a consumer whose entries carry no before and no
   * after should not have to invent two words for a comparison nothing draws. So an
   * entry that carries either one and no labels throws, which is the enforcement
   * `StatusLedger01` uses for `statusLabel` and `Compliance01` uses for `stateLabel`.
   */
  diffLabels?: AuditLog01DiffLabels
  /**
   * What a reader is told when the log has nothing in it.
   *
   * Required, and it is the sentence Prism is least entitled to write on this surface
   * above every other: "No changes recorded" is a claim about a system and a period,
   * and an empty audit log is either a new deployment or a broken collector and only
   * the caller knows which.
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
} & (
  | {
      /**
       * Group the entries under a heading per day.
       *
       * A day heading is a heading and not a rule across the table, because a reader
       * navigating by heading is looking for a day and a rule is a thing they cannot
       * jump to.
       */
      groupBy: 'day'
      /**
       * The words for a day, given the day.
       *
       * Required in this arm, and a function rather than a string, because "Today",
       * "Yesterday" and "Tuesday" are the system's sentences and the key is a fact.
       * The key is an ISO calendar date in the runtime's own zone, so a caller hands
       * it to `Intl.DateTimeFormat` and gets their locale's reading of it, or writes
       * their own. The rejected alternative was the Block calling `Intl` itself, which
       * would put a locale this package does not own into every consumer's log.
       */
      dayLabel: (key: string) => string
    }
  | {
      /** One table, no day headings. @defaultValue 'none' */
      groupBy?: 'none'
      /** Forbidden in this arm, because there is no day to name. */
      dayLabel?: never
    }
)

/**
 * An append-only record of what changed: a moment, an actor, a target, the change in
 * the caller's own words, an optional before and after, and a link.
 *
 * **The order is the caller's and the Block never sorts, and on this surface that is
 * not a nicety.** An audit trail that a Block reordered would be a claim about which
 * record came first, and on an audit trail that claim is the record: the order is the
 * evidence. Every other Block in this package refuses to sort because order is a claim
 * about importance, and here it is a claim about fact, which is why this JSDoc says it
 * in those words and why the cost is named too. A collector whose records arrive out
 * of order has a problem, and the honest responses are to sort them at the collector
 * with a stable comparison on the moment plus a sequence number, or to pass them
 * through and let the log read as it was received. Both are decisions about a system's
 * truth, and a Block that made either one on the caller's behalf would be inserting
 * itself into a record. A caller who wants newest first sorts once, upstream, and the
 * Block draws what it was given in the order it was given it.
 *
 * **It is a real table, with a column head for every column and a row head for every
 * row.** `Table` is used rather than a grid of `div`s for the reason the whole
 * component exists: a reader moving by row hears the change with every cell in the
 * row, and a reader moving by column hears the whole history of a target. The change
 * is the row header, and it is the row header on purpose: it is the one cell that says
 * what the record is, so it is what a screen reader announces beside the actor, the
 * moment and the target, and it is the cell a caller can rely on being present because
 * `change` is required on every entry.
 *
 * **A before and an after is drawn by `diff.tsx` and not by hand, and the reason is
 * that `diff.tsx` has already made the argument this Block would have to make again.**
 * It states that a diff emphasises by weight and not by colour, because a diff that
 * tinted its changed words would be leaning on the two hues a reader is most likely to
 * be unable to distinguish, and because the tint would fight the line's own state
 * colour. It states that the line numbers carry the side rather than the colour, which
 * is how every diff reader a developer has ever used distinguishes an addition from a
 * removal and which does not depend on telling red from green. And it states that the
 * bar is change density rather than a side marker, so a reader's eye goes to the line
 * that was rewritten rather than the line that was touched. A second implementation
 * with a green tint and a red tint would lose all three, silently, and an audit log is
 * the last place to lose them.
 *
 * **The `diff` column is a `Diff` whose file name is the entry's target, and that is a
 * decision worth naming.** A `Diff` draws a header band, and the two things that band
 * exists for are the name of the thing being diffed and a summary. The summary is a
 * sentence and therefore the caller's, and there is no summary field on the entry, so
 * the band carries the target. The cost is stated rather than hidden: a caller who
 * names both a `target` column and a `diff` column sees the target twice, once in the
 * column and once in the band, and the answer is that a caller who does not want it
 * twice does not name the `target` column.
 *
 * **A tone needs a caller-supplied label whenever it is used, and the run throws
 * otherwise.** That is `StatusLedger01`'s argument with nothing added: the state is a
 * colour, the words are the information, and a system that says "reverted" where
 * another's says "reverted by policy" cannot be given one vocabulary by a design
 * system. A missing label throws rather than falling back to the machine value, which
 * would print `destructive` into an audit document as if it were a term of art, and an
 * audit document is the last place a bare machine word belongs.
 *
 * **The day key is the runtime's calendar, and the cost is that it is not the reader's.**
 * A change at half past midnight is grouped by the server's day, because Prism ships
 * no calendar and a Block cannot pick the reader's zone without a prop that would be a
 * guess dressed as a setting. A consumer whose records are grouped by a named zone
 * groups them itself and passes one entry per group with `groupBy="none"`. The moment
 * itself is printed exactly as passed and the ISO form goes on the `time` element, so
 * a reader who disagrees with the grouping still has the machine value in front of
 * them.
 *
 * **`change` and `target` carry `whitespace-normal` and `h-auto`, and that is the one
 * place in this Block where a `className` changes a Prism-owned property rather than
 * placing something.** `TableHead` and `TableCell` set `whitespace-nowrap` and a fixed
 * header height, which is right for a figure in a data grid and wrong for a sentence
 * that is the row's own name. It is stated here rather than left to be discovered, and
 * it is the same override `Compliance01` makes and for the same reason.
 *
 * **An empty log draws the caller's sentence and no table.** A table of column heads
 * with no rows is a grid a reader looks through, and on this surface it is worse than
 * that: an audit table with headers and nothing in it reads as a record that was
 * truncated. The cost is that a heading can survive on a page whose changes have all
 * been purged, and a consumer who would rather see nothing at all should not render
 * the Block.
 *
 * It is a server Component: no hook, no state, no client code and no motion. A caller
 * who wants a control in a row composes it in their own surface beside the log, which
 * is the arrangement a `ReactNode` exists for.
 */
export function AuditLog01({
  eyebrow,
  title,
  description,
  columns,
  entries,
  showDiffs = true,
  diffLabels,
  empty,
  groupBy = 'none',
  dayLabel,
  headingLevel = 'h2',
  className,
}: AuditLog01Props) {
  // A day's heading is one step below the section that introduces the log, so a log
  // embedded one level deeper carries its outline with it.
  const GroupHeading = childLevel(headingLevel)

  for (const entry of entries) assertEntry(entry, diffLabels, showDiffs)

  if (columns.length === 0) {
    throw new Error(
      'AuditLog01: columns is empty, so the log would be a table with no named columns, which is a grid of ' +
        'assertions with nothing to check them against. Name the columns in the order they should be read.',
    )
  }

  /*
    The `diff` column is dropped rather than filled with nothing when `showDiffs` is
    off, and the count is taken after the filter so the group header's `colSpan` is
    the number of columns actually drawn. A column of empty cells in an audit log is a
    column a reader checks and finds nothing in.
  */
  const drawn = showDiffs ? columns : columns.filter((column) => column.id !== 'diff')

  /*
    The test is on `dayLabel` and not on `groupBy` alone, because destructuring the
    props loses the discriminant the union carries: a caller who wrote
    `groupBy="day"` without the label has a type error rather than a runtime one, and
    this is the guard for a JavaScript caller who did not get that far.
  */
  const grouped = groupBy === 'day' && dayLabel !== undefined

  /*
    One row. The diff lines are built here rather than inside the cell so the `Diff`
    receives an array it can count, which is what it needs for the change density its
    own documentation describes. A `before` alone is one removed line and an `after`
    alone is one added line, and neither is dropped: a record that says what was
    removed and nothing about what replaced it is a real state, and a `Diff` with one
    line draws it exactly as it draws two.
  */
  function row(entry: AuditLog01Entry) {
    return (
      <TableRow key={entry.id} data-slot="audit-log-01-entry" data-entry={entry.id}>
        {drawn.map((column) => {
          const key = column.id

          if (key === 'change') {
            return (
              <TableHead
                key={key}
                scope="row"
                className="text-foreground h-auto whitespace-normal font-medium"
              >
                <span className="flex flex-wrap items-baseline gap-x-2">
                  {entry.tone === undefined ? null : (
                    <Status
                      data-slot="audit-log-01-tone"
                      tone={entry.tone}
                      label={entry.toneLabel as string}
                      size="sm"
                    />
                  )}
                  <span>{entry.change}</span>
                </span>
              </TableHead>
            )
          }

          if (key === 'diff') {
            const lines =
              entry.before === undefined && entry.after === undefined
                ? []
                : [
                    ...(entry.before === undefined
                      ? []
                      : [{ kind: 'removed' as const, oldNumber: 1, content: entry.before }]),
                    ...(entry.after === undefined
                      ? []
                      : [{ kind: 'added' as const, newNumber: 1, content: entry.after }]),
                  ]

            return (
              <TableCell key={key} className="min-w-0 whitespace-normal align-top">
                {lines.length === 0 || diffLabels === undefined ? null : (
                  <Diff
                    data-slot="audit-log-01-diff"
                    lines={lines}
                    // The name of the change is the target it happened to, which is
                    // the one thing in this Block that is true about every diff on it.
                    label={entry.target}
                    file={entry.target}
                    labels={diffLabels}
                  />
                )}
              </TableCell>
            )
          }

          if (key === 'link') {
            return (
              <TableCell key={key}>
                {entry.href === undefined ? null : (
                  <CtaLink href={entry.href} variant="ghost" size="sm">
                    {entry.hrefLabel}
                  </CtaLink>
                )}
              </TableCell>
            )
          }

          return (
            <TableCell key={key} className={cn(key === 'at' && 'whitespace-nowrap')}>
              {key === 'at' ? (
                <time dateTime={new Date(entry.at).toISOString()} className="font-mono text-xs">
                  {entry.at}
                </time>
              ) : key === 'actor' ? (
                entry.actor
              ) : key === 'target' ? (
                entry.target
              ) : null}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

  const head = (
    <TableHeader>
      <TableRow>
        {drawn.map((column) => (
          <TableHead key={column.id} scope="col">
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )

  if (entries.length === 0) {
    return (
      <Section data-slot="audit-log-01" className={className}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div data-slot="audit-log-01-empty" className="text-muted-foreground text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  if (grouped) {
    /*
      Two passes and the order of both is the caller's. The days come out in the order
      they first appear rather than sorted, because sorting them is the one thing this
      Block refuses to do anywhere: an audit trail this Block reordered would be a
      claim about which record came first, and that claim is the record.
    */
    const days = new Map<string, AuditLog01Entry[]>()
    for (const entry of entries) {
      const key = dayKey(entry.at)
      const found = days.get(key)
      if (found === undefined) days.set(key, [entry])
      else found.push(entry)
    }

    return (
      <Section data-slot="audit-log-01" className={className}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-8"
        />

        <Table data-slot="audit-log-01-table">
          {head}

          {[...days].map(([key, inDay]) => (
            <TableBody key={key} data-slot="audit-log-01-day" data-day={key}>
              {/*
                One body per day, so a reader moving by list of rows hears the day and
                then the changes in it, and so the last row of each group loses its
                bottom rule the way the last row of a table does. The heading is
                inside a cell that spans every column, which is the one place a span is
                right: there is no single column a day belongs to.
              */}
              <TableRow>
                <TableCell colSpan={drawn.length} className="bg-muted/40 h-auto whitespace-normal">
                  <GroupHeading
                    data-slot="audit-log-01-day-label"
                    className="text-sm font-semibold"
                  >
                    {dayLabel(key)}
                  </GroupHeading>
                </TableCell>
              </TableRow>

              {inDay.map(row)}
            </TableBody>
          ))}
        </Table>
      </Section>
    )
  }

  return (
    <Section data-slot="audit-log-01" className={className}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-8"
      />

      <Table data-slot="audit-log-01-table">
        {head}
        <TableBody>{entries.map(row)}</TableBody>
      </Table>
    </Section>
  )
}

export default AuditLog01
