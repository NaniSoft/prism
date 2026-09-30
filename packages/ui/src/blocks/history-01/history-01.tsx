import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Price, type PriceProps } from '../../components/ui/price'
import {
  Section,
  SectionHeading,
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
import { cn } from '../../lib/utils'

/**
 * The four states one charge or one consumption can be in, and the tone each one
 * is drawn in.
 *
 * **Four, and they are four positions rather than four words.** A charge either
 * moved, has not moved yet, moved and was given back, or is being argued about.
 * Those are four places a record can be, and between them four NaniSoft products
 * use eleven different sentences for them, which is why the words are the
 * caller's and this type carries no vocabulary of its own.
 *
 * The tones are not a severity ladder and the order says so: `settled` is
 * `success` because the money moved and nothing is being asked of anybody;
 * `pending` is `info`, the contract's cool role meaning not an alarm, because an
 * authorisation that has not captured is the ordinary state of a billing history
 * and a table where every unsettled row is amber is a page of alarms that means
 * nothing; `refunded` is `neutral`, because a reversal that is finished is not in
 * dispute and must not be drawn as though it were; and `disputed` is
 * `destructive`, because it is the one state a reader must not scroll past, and
 * it is the one where the two records disagree.
 *
 * A fifth would be the one that splits a position that does not need splitting,
 * a `failed` beside a `declined` beside a `returned` where a product's ledger
 * keeps three. Each such tier is a colour a reader has to learn and a word a
 * maintainer has to keep true. What a product wants to say about a charge is
 * `stateLabel`, and the four above are the positions a charge can be in.
 */
export type HistoryState = 'settled' | 'pending' | 'refunded' | 'disputed'

/**
 * The tone each of the four states is drawn in, from the semantic contract and no
 * other.
 */
const STATE_TONE: Record<HistoryState, StatusTone> = {
  settled: 'success',
  pending: 'info',
  refunded: 'neutral',
  disputed: 'destructive',
}

/**
 * The cells a history row can draw, and the seven column names a caller names them
 * with.
 *
 * A closed set, and the closure is the point, for the reason `InboxCell` gives:
 * the cells are the Block's, so a table with an eighth column would be a column
 * with nothing to put in it. The names are the caller's, which is the other half
 * of the same thing. A workspace's billing history is read by people whose
 * products count runs, capture volume and agent minutes, and the words a reader
 * needs above the same column are "Kind" in one and "What for" in the next, so
 * `header` is a prop and `id` is not.
 */
export type HistoryColumnId =
  | 'at'
  | 'reference'
  | 'kind'
  | 'quantity'
  | 'amount'
  | 'state'
  | 'link'

/**
 * One column of a history: which cell it draws, and the words above it.
 *
 * The shape follows `InboxColumn` and `ResourceListColumn` for the same reason
 * both of them give: the cells are closed, so the `cell` function
 * `DataTableColumn` takes is deliberately dropped, and what is left is genuinely
 * the caller's, which is the column's name, its order and where it sits.
 * `className` is layout, for alignment or a fixed width, and it changes where a
 * column sits and never what a cell looks like.
 */
export type HistoryColumn = {
  /** Which of the seven cells this column draws. */
  id: HistoryColumnId
  /** The column's name, in the product's own words. */
  header: ReactNode
  /**
   * Layout classes for the column, applied to the header cell and to every cell
   * under it.
   */
  className?: string
}

/**
 * One line of a history: when it happened, what it is, what it cost, how much of
 * it there was, where it stands, and where the full record is kept.
 *
 * **The two required fields beside `id` are the moment and the reference, and the
 * reason is the table rather than the reader's patience.** A row with no
 * reference is a row nobody can be referred to and a row a reader cannot quote to
 * support, and a row with no moment is a charge with no date, which on a billing
 * surface is the one field a dispute is about. Everything else is optional because
 * a history is heterogeneous by nature: a subscription is a period, a metered
 * charge is a quantity and an amount, and a one-off adjustment is a reference and
 * an amount with neither.
 *
 * `amount` is a `PriceProps` rather than a number and a symbol, and the argument
 * for that is the same one `RateCard01` makes at length: a symbol is the least of
 * what a price needs, because a price also has a currency code, a precision, a
 * period and a locale, and `Intl` already knows all four. A history that printed a
 * dollar sign and two decimal places would be wrong in most of the world and wrong
 * for a unit price everywhere.
 */
export type HistoryEntry = {
  /**
   * A key unique within the set, carried on the markup as `data-entry` so a test
   * can name one row rather than the first.
   */
  id: string
  /**
   * When the charge landed or the consumption was metered.
   *
   * A `number` or a `string` and never a `Date`, and the reason is the one
   * `AuditLog01Entry.at` gives: a Block ships no formatting, so the reading a
   * reader should see is the caller's own. A number is epoch milliseconds and is
   * printed as a number, which is honest and almost never what was wanted; a
   * string is printed as written, so a caller who holds "the March invoice
   * period" passes that. The machine value is still on the `time` element's
   * `dateTime`, so a crawler and a screen reader get a timestamp whatever the
   * visible reading says.
   */
  at: number | string
  /**
   * The system's own identifier for the record: an invoice number, a run id, a
   * subscription reference.
   *
   * It is the row header, so a reader who lands on one cell is told which charge
   * they are looking at, and it is drawn in the mono face for the reason
   * `SectionHeading` gives for its own `index` prop: an identifier is machine
   * notation, and the mono stack is what this repository annotates machine
   * notation with. It is a `string` rather than a node for the same reason
   * `Offer01`'s `code` is: a reference is copied, compared and typed, and a
   * caller who composes one out of fragments is one release away from shipping a
   * reference with a space in it.
   */
  reference: string
  /**
   * What the line is, in the product's own words: a plan, a run, a capture, a
   * credit.
   *
   * A short noun phrase, and a `string` rather than a node because a column of
   * these is scanned down its left edge and a kind that wraps to two lines costs
   * every other row its alignment. `kindLabel` is the caller's rendering of it
   * when the machine value and the reading differ.
   */
  kind: string
  /**
   * The words for the kind, when the machine value is not the sentence a reader
   * should read.
   *
   * Optional, and its absence is not a fault: `kind` is already a caller's string
   * and a product whose kind is a code has a reason to print the code. It exists
   * for the other direction, where a record holds a stable identifier and the
   * reader needs a name beside it.
   */
  kindLabel?: string
  /** What it cost, and everything about how that amount is written. See `amount`. */
  amount: PriceProps
  /**
   * How much of it there was, in the unit this product counts in.
   *
   * A bare number and never a formatted string, because a number is a number and
   * a formatted one is a sentence whose unit this Block cannot see. The reading
   * beside it is `quantityLabel`, and a row that carries a quantity with no
   * `quantityLabel` is refused at run time: see the Block's JSDoc.
   */
  quantity?: number
  /**
   * The words for the quantity, given the value and the row it belongs to.
   *
   * Required whenever any entry carries a `quantity`, and a function rather than
   * a string for the reason `Leaderboard01`'s `valueLabel` is one: "1,204 runs"
   * and "1.204 Durchläufe" and "1,204 回の実行" are three products' sentences, and
   * a Block that composed one would have composed it in this package's language,
   * into a billing tool that may not be in English. The entry is in the argument
   * because a column of quantities on a history belongs to more than one unit:
   * a metered line is a count of runs and a storage line is a count of gigabytes,
   * and the honest sentence names which.
   */
  quantityLabel?: (value: number, entry: { id: string; reference: string }) => string
  /**
   * Where the line stands. See `HistoryState`.
   *
   * Required, because a charge with no state is a number a reader has to guess
   * the meaning of, and on a billing surface that is the whole question.
   */
  state: HistoryState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is set, which is always, and a thrown diagnostic
   * rather than a silent absence, for the reason `Status` states in full and
   * `AuditLog01Entry.toneLabel` restates: the tone is a colour and the words are
   * the information, and a publisher that says "reversed" where another's says
   * "credited back" cannot be given one vocabulary by a design system. Falling
   * back to the union's own name would print `refunded` into a financial record
   * as if it were a term of art.
   */
  stateLabel?: string
  /** Where the full record is kept. Its presence makes the row carry a link. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the entry's own reference tells a reader nothing
   * about what following it does, and on a billing surface that is worse than
   * elsewhere, because a reader following a link to check a claim deserves to
   * know what they are about to open.
   */
  hrefLabel?: string
}

/**
 * One figure about the period the table covers.
 *
 * A `label` and a `value` and an optional delta, and nothing else, because the
 * three are what a period summary is and each extra field is a fourth thing a
 * caller has to invent a sentence for.
 */
export type HistorySummaryItem = {
  /** What the figure measures, read under the figure rather than above it. */
  label: string
  /** The figure itself, in the caller's own units and the caller's own formatting. */
  value: ReactNode
  /**
   * The change against the previous period, as a number whose sign is the
   * direction. See `MetricDelta` on the Component.
   */
  delta?: number
}

/**
 * The props a History01 takes.
 *
 * Every string is a prop and the Block ships none: no reference, no kind, no
 * amount, no quantity reading, no state word, no column name, and not one of the
 * two sentences a billing surface is most tempted to ship. The absence of the
 * history itself is the sharpest version of the rule, because a table drawn with
 * a charge in it is the single easiest thing in this package to write by accident
 * and the single most likely to be somebody else's invoice.
 */
export type History01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Not optional as several Blocks' titles are, and the reason is the
   * rectangularity of a table: the heading above it names it, which `table.tsx`
   * states as the exception to its own rule about a caption. A billing table with
   * no heading is a table with no name, and a table with no name is six columns a
   * screen reader user has to be told about out loud.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The columns, in the order a reader should meet them.
   *
   * Order and naming are both the caller's, and both are claims. The order is a
   * claim about what a reader checks first, and on a billing surface that is
   * usually the moment or the amount rather than the reference. The set of ids is
   * closed, so a column this Block cannot fill throws rather than rendering an
   * empty one, and the `reference` column has to be among them because it is the
   * row header every other cell is read under.
   */
  columns: readonly HistoryColumn[]
  /**
   * The lines of the history, in the order the caller's ledger holds them.
   *
   * **The Block does not sort, and on this surface that is not a nicety.** A
   * history that a Block reordered would be a claim about which charge came first,
   * and on a billing surface that claim is a bill. Every other Block in this
   * package refuses to sort because order is a claim about importance, and here it
   * is a claim about fact, which is why the cost is named as well: a ledger whose
   * records arrive out of order has a problem, and the honest responses are to sort
   * once at the store with a stable comparison on the moment plus the record's own
   * sequence, or to pass them through and let the table read as it was received.
   * Both are decisions about a system's truth, and a Block that made either one on
   * the caller's behalf would be inserting itself into a financial record.
   */
  entries: readonly HistoryEntry[]
  /**
   * The figures about the period the table covers, in the order a reader should
   * meet them.
   *
   * Optional, and its absence is a decision rather than a default: a history with
   * no summary is a list of charges and nothing else, which is a real page for a
   * product whose billing is per invoice. Pass one when the reader's first
   * question is how much rather than what.
   */
  summary?: readonly HistorySummaryItem[]
  /**
   * The row above the table: the caller's own `data-toolbar` with its period
   * picker, its export and its filter.
   *
   * A slot and not a set of named controls, for the reason `data-toolbar` gives:
   * which controls a history has is the consumer's fact, and a Block that drew a
   * date range and a sort would be a Block that assumed the set is filterable and
   * sortable.
   */
  toolbar?: ReactNode
  /**
   * What the Block renders in place of the table when there is nothing in the
   * period.
   *
   * Required, and the sentence Prism is least entitled to write on this surface
   * above every other. "No charges in this period" is a claim about a system and a
   * period, and an empty history is either a workspace that has genuinely spent
   * nothing or a query that failed, and only the caller knows which.
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
 * Only the reference wraps, and the reason is the one `FieldMap01` gives for its
 * two prose columns: `table.tsx` sets every cell to `whitespace-nowrap` so a
 * column of numbers lines up, and a reference is whatever the caller's ledger
 * made it, which is sometimes a long one. A table that scrolls an identifier
 * sideways to keep it on one line is a table nobody reads a whole row of.
 */
const CELL: Record<HistoryColumnId, string> = {
  at: 'text-muted-foreground whitespace-nowrap',
  reference: 'font-mono text-xs whitespace-normal',
  kind: 'text-muted-foreground whitespace-normal',
  quantity: 'text-muted-foreground whitespace-nowrap tabular-nums',
  amount: 'text-right whitespace-nowrap',
  state: 'whitespace-nowrap',
  link: 'text-right whitespace-nowrap',
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on a page.
 *
 * Five, and each one is a row that would be unreadable rather than ugly. A state
 * with no words, because a coloured dot is invisible to a reader who cannot
 * separate the tones and unreadable to a screen reader whatever the tones are. A
 * quantity with no unit, because `1204` beside a price is a number nobody can act
 * on and a reader's next question is always what the number counts. A link with
 * no words, or a name with no link beside it. A moment the platform cannot read,
 * so there is no value to put in the `time` element and the row would claim to be
 * a moment it cannot name. And a set of columns this Block cannot fill, which is
 * either an empty one or a header row a reader counts rather than reads.
 */
function assertHistory(
  columns: readonly HistoryColumn[],
  entries: readonly HistoryEntry[],
): void {
  const seen = new Set<HistoryColumnId>()
  for (const column of columns) {
    if (seen.has(column.id)) {
      throw new Error(
        `History01: the column ${JSON.stringify(column.id)} is declared twice, so the table would have two ` +
          'columns reading the same value and every cell after the first would be read under the wrong name. ' +
          'Declare each cell once.',
      )
    }
    if (column.id === 'quantity' && !entries.some((entry) => entry.quantity !== undefined)) {
      throw new Error(
        'History01: the "quantity" column was declared and no line passed a quantity, so the table would carry ' +
          'a column of empty cells, which is a column every reader scans twice. Pass the quantities, or drop the ' +
          'column.',
      )
    }
    if (column.id === 'link' && !entries.some((entry) => entry.href !== undefined)) {
      throw new Error(
        'History01: the "link" column was declared and no line passed an href, so the table would carry a ' +
          'column of empty cells. Pass the destinations, or drop the column.',
      )
    }
    seen.add(column.id)
  }
  if (!seen.has('reference')) {
    throw new Error(
      'History01: the columns name no "reference" cell, so the header row would have a cell fewer than every ' +
        'body row and a reader who landed on one cell would not be told which charge they are looking at. ' +
        'Declare the reference column, which is also the row header for every row.',
    )
  }

  for (const entry of entries) {
    if (entry.stateLabel === undefined || entry.stateLabel.trim() === '') {
      throw new Error(
        `History01: the line ${JSON.stringify(entry.reference)} declares a state and no words for it, so the ` +
          'tone would be a coloured dot with no sentence beside it, in a record a reader may have to show to ' +
          'somebody else. Pass stateLabel in the vocabulary this product uses, which is not this Block choice.',
      )
    }
    if ((entry.href === undefined) !== (entry.hrefLabel === undefined)) {
      throw new Error(
        `History01: the line ${JSON.stringify(entry.reference)} declares one of href and hrefLabel without ` +
          'the other, so the row would carry a link with no words on it, or a name with no link beside it. ' +
          'Pass the words that say what following it does, or omit the href.',
      )
    }
    if (!Number.isFinite(new Date(entry.at).getTime())) {
      throw new Error(
        `History01: the line ${JSON.stringify(entry.reference)} passes an at the platform cannot read, so there ` +
          'is no value to put in the time element and the row would claim to be a moment it cannot name. Pass ' +
          'epoch milliseconds, or a string the platform parses.',
      )
    }
    if (entry.quantity !== undefined && entry.quantityLabel === undefined) {
      throw new Error(
        `History01: the line ${JSON.stringify(entry.reference)} passes a quantity and no quantityLabel, so the ` +
          'cell would hold a bare number beside a price, and a bare number is a number nobody can act on. Pass ' +
          'the words this product uses for the unit, given the value and the line.',
      )
    }
  }
}

/**
 * What a workspace has been charged for and what it has consumed: a moment, a
 * reference, a kind, an amount, a quantity, a state and a link, in a real table,
 * under an optional summary of the period.
 *
 * **The storefront version of this pattern is an order history, and the pattern is
 * the same one.** A shop shows a shopper what they bought, when, how much and
 * whether it settled. What changes here is what the rows are: a workspace is
 * charged for runs it triggered, capture volume it stored and agent minutes it
 * burned, and the same record is read from the other side to answer what it has
 * consumed. There is no shop and no basket anywhere in this Block, and a reader
 * who has used both will recognise the shape and none of the vocabulary, which is
 * the point: the columns are the caller's, the kinds are the caller's, the state
 * words are the caller's, and the only thing this Block contributes is the
 * rectangle they sit in.
 *
 * **It is a real table, and the reference is its row header.** A history is read
 * by comparing: which month cost the most, how many runs are in that line, which
 * reference keeps appearing. Comparison is what a table is for and it is what a
 * grid of `div`s cannot do, because a `div` grid has no `th` to navigate by, no
 * association between a row and its cells, and nothing for a browser's own table
 * commands to act on. So every header is a `th` with `scope="col"` and the
 * reference is a `th` with `scope="row"`, which is the cell a caller can rely on
 * being present because `reference` is required on every entry. The rejected
 * alternative was a `DataTable01`, which is the same table with a `cell` function
 * per column and a full toolbar of its own; this is that table for the seven cells
 * a history has, which means a caller cannot add an eighth and gets a row header
 * for free.
 *
 * **The reference is set in the mono face, for the reason `SectionHeading` states
 * for its own `index` prop.** That prop's documentation says a section's position
 * in a sequence is machine notation rather than a word, and the mono stack is what
 * this repository annotates machine-readable values with. A billing reference is
 * the same kind of value by a stronger margin: it is copied, compared, quoted to
 * support and typed, and it is the one cell on the row a reader may read aloud. A
 * reference set in the interface face reads as a word somebody chose, and the
 * difference is the difference between an identifier and a name. The cost is a
 * row whose reference is a hand-written phrase rather than a code, and a caller
 * who has one should put the phrase in `kind` where it belongs.
 *
 * **The order is the caller's and the Block never sorts, and on this surface that
 * is not a nicety.** An audit trail that a Block reordered would be a claim about
 * which record came first, and on a billing surface the same claim is a bill: a
 * line moved above another one is a different statement about when a workspace was
 * charged. Every other Block in this package refuses to sort because order is a
 * claim about importance, and here it is a claim about fact, which is why the cost
 * is named rather than implied. A ledger whose records arrive out of order has a
 * problem, and the honest answers are to sort once at the store with a stable
 * comparison on the moment plus the record's own sequence, or to pass them through
 * and let the table read as it was received. Both are decisions about a system's
 * truth, and a Block that made either one on the caller's behalf would be inserting
 * itself into a financial record. A caller who wants newest first sorts once,
 * upstream, and the Block draws what it was given in the order it was given it.
 *
 * **A state needs the caller's words and the run throws without them.** That is
 * `StatusLedger01`'s argument with nothing added: the state is a colour and the
 * words are the information, and a publisher that says "reversed" where another's
 * says "credited back" cannot be given one vocabulary by a design system. A
 * missing label throws rather than falling back to the union's own name, which
 * would print `refunded` into a financial record as if it were a term of art, and
 * a financial record is the last place a bare machine word belongs.
 *
 * **A quantity needs the caller's words too, and the reason is narrower.** A
 * quantity on a billing line is never a bare number in a product anybody would
 * ship: it is a count of runs, a count of gigabytes, a count of minutes, and the
 * unit is the whole of what the number means. `1204` beside a price is a number a
 * reader cannot act on, and their next question is always what it counts, so the
 * reading is a function of the value and the line. The entry is in the argument
 * because a history holds more than one unit: a metered line counts runs and a
 * storage line counts gigabytes, and a Block that chose between them would be
 * choosing which product this table is for.
 *
 * **The amount composes `Price` rather than printing a currency, and the moment
 * prints exactly as passed.** A symbol says the currency and nothing else, while
 * an amount also has a currency code, a precision, a period and a locale, and
 * `Intl` already knows all four; a history that hardcoded a dollar sign would make
 * a claim about every consumer's market. The moment goes the other way: a Block
 * that formatted a date would be choosing a locale, a calendar and a granularity
 * on a reader's behalf, so the value is printed as given and the ISO form goes on
 * the `time` element, which means a caller who holds "the March invoice period"
 * can pass exactly that. The cost of printing as given is a raw timestamp beside
 * a price for a caller who passes milliseconds and no formatter, which is honest
 * and almost never what was wanted.
 *
 * **The summary composes `Metric` and draws no card titles.** A period summary is
 * figures, and `Metric` already owns the arrangement a figure is read in: the
 * figure lands first and the name sits under it, and a string value is set in the
 * mono face while a composed one is not. The cost is the one `Metric` states, and
 * it is worth naming here because a caller will meet it on a billing page: a
 * `delta` with no `deltaFormat` prints the bare number, because a Component cannot
 * print a change it has no unit for. A caller who has a formatted change passes
 * the reading as `value` and leaves `delta` off, which is the same amount of work
 * and one fewer prop.
 *
 * **An empty history draws the caller's sentence and no table.** A table of
 * column heads with no rows is a grid a reader looks through, and on this surface
 * it is worse than that: a billing table with headers and nothing in it reads as a
 * statement that was truncated rather than as a period with nothing in it. The
 * cost is that a heading can survive on a page whose history has been purged, and
 * a consumer who would rather see nothing at all should not render the Block.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * toolbar and the summary are the caller's own nodes, so a consumer who passes a
 * client toolbar pays for the toolbar and not for the history.
 */
export function History01({
  eyebrow,
  title,
  description,
  columns,
  entries,
  summary,
  toolbar,
  empty,
  headingLevel = 'h2',
  className,
}: History01Props) {
  if (columns.length === 0) {
    throw new Error(
      'History01: columns is empty, so the history would be a table with no named columns, which is a grid of ' +
        'amounts with nothing to check them against. Name the columns in the order they should be read.',
    )
  }

  /*
    The empty case is decided before the per-entry diagnostics rather than after
    them, and the reason is that two of those diagnostics are about columns no row
    fills. A period with nothing in it has no quantity to put under a quantity
    column, and running that check over an empty array would fail a caller for the
    one state in which the table is not drawn at all.
  */
  if (entries.length === 0) {
    return (
      <Section data-slot="history-01" className={className}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div data-slot="history-01-empty" className="text-muted-foreground text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  assertHistory(columns, entries)

  return (
    <Section data-slot="history-01" className={className}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="history-01-body" className="flex flex-col gap-8">
        {summary === undefined || summary.length === 0 ? null : (
          /*
            The period summary, in a grid rather than in a row, because a figure
            with a name under it is a tile and four tiles in a row of a 68rem
            container leave each one about sixteen. The cost is that the row wraps
            on a phone, which is the right thing for a figure rather than the wrong
            thing, and the grid is one track per figure rather than a count this
            Block chooses, because a summary of two and a summary of six are both
            real and neither is a mistake.
          */
          <div data-slot="history-01-summary" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summary.map((item) => (
              <Metric
                key={item.label}
                data-slot="history-01-figure"
                value={item.value}
                label={item.label}
                delta={item.delta}
              />
            ))}
          </div>
        )}

        {toolbar === undefined ? null : (
          <div data-slot="history-01-toolbar" className="flex flex-wrap items-center gap-3">
            {toolbar}
          </div>
        )}

        <div data-slot="history-01-table-frame" className="border-border overflow-hidden rounded-xl border">
          <Table data-slot="history-01-table">
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
              {entries.map((entry) => (
                <TableRow key={entry.id} data-slot="history-01-entry" data-entry={entry.id}>
                  {columns.map((column) => (
                    <Cell key={column.id} column={column} entry={entry} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Section>
  )
}

/**
 * The one cell of one row, and the whole of this Block's switch over a closed set.
 *
 * A switch rather than a map of render functions, for the reason `FieldMap01`
 * gives: a map keyed by cell id would be a second recipe of the kind this package
 * keeps off the public surface, and a switch over seven cases is the same table
 * with the strings in the same file as the drawing that uses them.
 *
 * The reference is a `TableHead` with `scope="row"` rather than a cell, so a
 * reader who navigates into a single cell is told which charge they are looking
 * at rather than hearing an amount with nothing to attach it to. That is also why
 * the class list sets the ink and the weight explicitly: `TableHead` carries the
 * muted header ink and the header weight, and a row header in the row's own ink
 * is a different thing from a column header that happens to be in the first
 * column.
 */
function Cell({ column, entry }: { column: HistoryColumn; entry: HistoryEntry }) {
  const key = column.id
  const classes = cn(CELL[key], column.className)

  if (key === 'reference') {
    return (
      <TableHead scope="row" className={cn(classes, 'text-foreground font-normal')}>
        {entry.reference}
      </TableHead>
    )
  }

  if (key === 'at') {
    return (
      <TableCell className={classes}>
        <time dateTime={new Date(entry.at).toISOString()}>{entry.at}</time>
      </TableCell>
    )
  }

  if (key === 'kind') {
    return <TableCell className={classes}>{entry.kindLabel ?? entry.kind}</TableCell>
  }

  if (key === 'amount') {
    return (
      <TableCell className={classes}>
        <Price {...entry.amount} size="sm" />
      </TableCell>
    )
  }

  if (key === 'quantity') {
    if (entry.quantity === undefined) return <TableCell className={classes} />
    return (
      <TableCell className={classes}>
        {entry.quantityLabel === undefined
          ? entry.quantity
          : entry.quantityLabel(entry.quantity, { id: entry.id, reference: entry.reference })}
      </TableCell>
    )
  }

  if (key === 'state') {
    /*
      The two are narrowed rather than asserted. The diagnostic in `assertHistory`
      has already refused a state with no words, so this condition cannot be false
      here, and spelling it out means the types read the same rule the runtime does
      rather than a non-null assertion standing in for it.
    */
    if (entry.stateLabel === undefined) return <TableCell className={classes} />
    return (
      <TableCell className={classes}>
        <Status size="sm" tone={STATE_TONE[entry.state]} label={entry.stateLabel} />
      </TableCell>
    )
  }

  return (
    <TableCell className={classes}>
      {entry.href === undefined || entry.hrefLabel === undefined ? null : (
        <CtaLink href={entry.href} variant="ghost" size="sm">
          {entry.hrefLabel}
        </CtaLink>
      )}
    </TableCell>
  )
}

export default History01
