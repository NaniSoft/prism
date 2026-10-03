'use client'

import { useId, useMemo, type ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { FactList, type Fact } from '../../components/ui/fact-list'
import { Price, type PriceProps } from '../../components/ui/price'
import { SearchField } from '../../components/ui/search-field'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
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
 * The tone each of a product's own capability words maps to.
 *
 * Whole words, matched whole rather than as substrings, so a state called
 * `unavailable-for-maintenance` is not read as `available` and a state called
 * `not-supported` is not read as `supported`. The table is a guess and says so, and
 * anything it does not name comes out `neutral`, which is the design: `neutral` is
 * the tone that asserts nothing, so a state this Block has never heard of costs a
 * colour and not a lie. The words themselves are never changed.
 */
const STATE_TONE = new Map<string, StatusTone>([
  ['available', 'success'],
  ['live', 'success'],
  ['enabled', 'success'],
  ['general-availability', 'success'],
  ['production', 'success'],
  ['ready', 'success'],
  ['supported', 'success'],
  ['beta', 'info'],
  ['in-preview', 'info'],
  ['limited', 'info'],
  ['pilot', 'info'],
  ['preview', 'info'],
  ['trial', 'info'],
  ['backlog', 'neutral'],
  ['coming-soon', 'neutral'],
  ['planned', 'neutral'],
  ['roadmap', 'neutral'],
  ['deprecated', 'destructive'],
  ['discontinued', 'destructive'],
  ['end-of-life', 'destructive'],
  ['retired', 'destructive'],
  ['sunset', 'destructive'],
  ['unavailable', 'destructive'],
  ['withdrawn', 'destructive'],
])

/**
 * The six cells an offering row can draw, and the set is closed.
 *
 * The cells are the Block's, so a table with a seventh column would be a column
 * with nothing to put in it. The names above them are the caller's, which is the
 * other half of the same thing: the words a reader needs beside a capability differ
 * by product, and "Plan", "State" and "Status" are three names for one column and
 * only the set's owner can say which is right. So `header` is a prop and `id` is
 * not, and the precedent is `ResourceList01`'s, which makes the same split for the
 * same reason.
 */
export type OfferingListCell = 'name' | 'standfirst' | 'state' | 'price' | 'facts' | 'href'

/**
 * The two ways this Block draws a set, and the prop that selects between them.
 *
 * Named for what it selects rather than for the word variant, because in this
 * package a name ending in `Variant` is the shape that names a cva recipe and the
 * surface gate refuses it. The prop is still called `variant`, because that is what
 * the word means here and it is what every other Block in this package calls it.
 */
export type OfferingList01Form = 'cards' | 'table'

/**
 * One column of the table arrangement: which cell it draws, and the words above it.
 *
 * `className` is layout, for alignment or a fixed width, and it is the same prop
 * `ResourceListColumn` carries under the same rule: it changes where a column sits
 * and never what a cell looks like.
 */
export type OfferingListColumn = {
  /** Which of the six cells this column draws. */
  id: OfferingListCell
  /** The column's name, in the product's own words. */
  header: ReactNode
  /** Layout classes for the column, applied to the header cell and every cell under it. */
  className?: string
}

/** One limit of a capability, in the shape a card and a cell both draw. */
export type OfferingList01Fact = {
  /** The limit's stable key, so a caller can address one row by name. */
  id: string
  /** What is measured, in the product's own words. */
  label: string
  /** The answer. A string, or any node a caller composes. */
  value: ReactNode
}

/**
 * One capability in the set, in whichever of the six cells the caller declared.
 *
 * Every field except the name is optional, and the shape of what is optional is the
 * point of the type. A catalogue page holds capabilities at four different stages of
 * their lives at once, and a row that has to declare a price, a state and a link to
 * exist is a row the caller has to invent data for. So the fields the caller has
 * are the fields they pass, and a row with three of the six cells is a legitimate
 * row rather than a half-built one.
 */
export type OfferingList01Offering = {
  /** The capability's stable key within the set. */
  id: string
  /**
   * The capability's own name, which is also the row header in the table
   * arrangement and the card title in the cards one.
   *
   * A string and not a node, for the reason every name in this package is: a grid
   * of capabilities is scanned down its left edge and a name that wraps costs every
   * other card its alignment.
   */
  name: string
  /** One line about what it is, in the caller's own words. */
  standfirst?: ReactNode
  /**
   * Where the capability is in its life, in the product's own vocabulary.
   *
   * A string and not a closed union, and the argument is that a product has its own
   * vocabulary for what a capability is doing. Between them the products that
   * compose this Block already use more states than any closed set here could hold:
   * `in-preview`, `design`, `awaiting-certificate`, `two-of-three-sites`. A design
   * system that closed the set would force every one of those products to map its
   * state onto one of the system's words and ship a translation nobody asked for,
   * and the translation is the part that rots: the week a product adds a state,
   * every map is a version behind and the table is confidently wrong about where its
   * own capabilities are, with nothing on the page to say so. So the words cross
   * the seam untouched and the Block takes them as they are. The tones are still
   * mapped, and the mapping is a guess that says so: a whole-word match against a
   * stated list, and `neutral` for anything the list does not name, so a state this
   * Block has never heard of costs a colour rather than a wrong one.
   *
   * Compare `Offering01`, whose state is a closed union of four. The difference
   * between the two Blocks is the number of rows, and it is worth stating because it
   * looks like an inconsistency: one capability in depth can be given a type that
   * says which answers exist and a diagnostic when it is given none, and a
   * catalogue of forty rows cannot afford to refuse to render a row over a word.
   */
  state?: string
  /**
   * The words for the state, when the product's own word is not the sentence the
   * reader should see.
   *
   * Optional, and it falls back to `state` itself rather than being required. That
   * is the difference from a Block whose states are closed: there the word
   * `preview` is Prism's and has to be replaced, and here `awaiting-certificate` is
   * the caller's and is already a sentence a reader can act on. Forcing the prop
   * here would be one every consumer writes and no consumer needs.
   */
  stateLabel?: string
  /** What the capability costs, composed by the platform's own currency formatter. */
  price?: PriceProps
  /** The capability's limits. See `OfferingList01Fact`. */
  facts?: readonly OfferingList01Fact[]
  /** Where the row goes, when it goes anywhere. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the capability's own name tells a reader nothing
   * about what activating it will do, which is the same defect `Download01` and
   * `Help01` refuse and for the same reason: the destination is a route in the
   * caller's application, the caller knows what is behind it, and the reader is
   * guessing from a title that is often deliberately short.
   */
  hrefLabel?: string
}

/**
 * The props an OfferingList01 takes.
 *
 * Every string is a prop and the Block ships none: no capability, no state word, no
 * column heading, no link label and not one sentence for the empty case. A
 * catalogue that hardcoded its rows would hand every consumer a set of capabilities
 * that are not theirs, which is a claim about a roadmap.
 */
export type OfferingList01Props = {
  /** Optional label above the section title. It has no default. */
  eyebrow?: string
  /** The section title, and required. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The query, as the caller holds it.
   *
   * Optional, and optional only as a pair with `onValueChange`. With no handler
   * there is no search field and no filtering, which is the resting state of a
   * catalogue of a dozen capabilities; see the Block's JSDoc for why a search field
   * over twelve rows is a control that does nothing useful and why two hundred rows
   * cannot do without one.
   */
  value?: string
  /**
   * Called with the query as the reader changes it, and with an empty string when
   * the clear control is pressed.
   *
   * Passing it is what turns the search on. There is no half of this Block with a
   * field and no filtering, because a field over the whole set is a control that
   * claims to reduce something it is not reducing.
   */
  onValueChange?: (value: string) => void
  /**
   * The field's visible name and its accessible name.
   *
   * Required whenever `onValueChange` is passed, and the run throws without it. A
   * control with no name is announced as a search box, which is the one name every
   * other field of its kind on the page shares.
   */
  label?: string
  /**
   * The accessible name of the control that empties the field.
   *
   * Required whenever `onValueChange` is passed. It is what makes the control exist
   * rather than naming something already on screen: `SearchField` draws the clear
   * control whenever this is passed and draws nothing when it is not. The words are
   * the caller's because a screen reader reads them.
   */
  clearLabel?: string
  /**
   * The capabilities, in the order a reader should meet them.
   *
   * Order is the caller's and the Block does not sort, for the reason every list in
   * this package gives: a capability catalogue is very often already ordered by a
   * build step or a query the Block cannot see, and a Block that sorted by name
   * would undo an order somebody reasoned about. The set is the one the caller has
   * already narrowed, so the Block filters it and never reaches further.
   */
  offerings: readonly OfferingList01Offering[]
  /**
   * The row above the set: the caller's own controls.
   *
   * A slot and not a set of named controls, for the reason `IssueList01` gives for
   * its own `toolbar`: which controls a list has is the consumer's fact, and a Block
   * that drew an export button and a sort menu would be a Block that assumed the set
   * is exportable.
   */
  toolbar?: ReactNode
  /**
   * The row of applied filters under the search, for the caller's own removable
   * chips.
   *
   * A slot and not a filter panel, because the facets are the caller's and a Block
   * that drew them would own a taxonomy. `FilterPanel` and `TagGroup` are the
   * Components that hold this shape.
   */
  filters?: ReactNode
  /**
   * The caller's own line about how much of the set is showing.
   *
   * A function and not a node, for the reason `Help01` gives for its own `summary`:
   * the count a reader reads is a sentence whose word order and noun inflection
   * belong to their language, and a Block that composed it would compose the English
   * one. It goes into `SearchField`'s polite result region when there is a search,
   * and above the set when there is not, so a caller who passes it gets it either
   * way. A caller who starts passing one should pass an empty result on the first
   * paint, which brings the live region into the document before its first content.
   */
  summary?: (matches: number) => ReactNode
  /**
   * The caller's own sentence for a query that matched nothing.
   *
   * Required, and a node. "No results" is English, and it is the one sentence in a
   * catalogue a reader is guaranteed to read, so a Block that wrote it would put it
   * into every product that installs this one, in a product whose interface is in
   * another language, inside a design system rather than inside a product's copy,
   * which is where a translation tool is least likely to look. It is a node because
   * the honest empty line is sometimes a sentence and sometimes a link to the
   * caller's own contact address, and a string prop would force the caller to
   * flatten it.
   */
  empty: ReactNode
  /**
   * How the set is drawn: a grid of cards, or a real table.
   *
   * `cards` is the default and the default is the argument rather than a shrug.
   * Cards are the arrangement a reader browses in, and they carry a standfirst, a
   * state, a price and a link without any of them being a column header. `table` is
   * for the reader who is comparing, where the columns are the reader's route into
   * the set and a grid would be six cards they have to read one at a time.
   *
   * @defaultValue 'cards'
   */
  variant?: OfferingList01Form
  /**
   * The columns, in the order the reader should meet them.
   *
   * Required in the `table` arrangement and refused outside it, and the run fails
   * without it there for the reason `ResourceList01` states: a table whose columns
   * are counted rather than named is unreadable to a screen reader, and a Block that
   * named them itself would put one product's vocabulary into every consumer's page.
   * The `name` column has to be among them and the run fails without it, because the
   * name is the row header every other cell is read under.
   */
  columns?: readonly OfferingListColumn[]
  /**
   * Heading level for the section title.
   *
   * Defaults to `h2` because a Block is composed, not a page. See `HeadingLevel`.
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
 * The name and the standfirst wrap because both are sentences, and the state, the
 * price and the link do not because all three are short and a wrapping state mark
 * reads as a second line of prose.
 */
const CELL: Record<OfferingListCell, string> = {
  name: 'font-medium whitespace-normal',
  standfirst: 'text-muted-foreground whitespace-normal',
  state: 'whitespace-nowrap',
  price: 'whitespace-nowrap',
  facts: 'whitespace-normal',
  href: 'text-right whitespace-nowrap',
}

/**
 * The query in the form the match reads it: case folded, split on whitespace, with
 * the empty tokens dropped.
 *
 * The tokens are AND rather than OR, for the reason `Help01` gives for the same
 * step: a reader who types two words is narrowing, and with OR a catalogue returns
 * nearly everything, which is not a result but a list the reader has to work through
 * themselves.
 */
function tokensOf(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((token) => token.length > 0)
}

/**
 * Whether every token appears somewhere in one case-folded string.
 *
 * A substring test with no stemming and no typo tolerance, which is the same
 * downgrade `SearchDialog` and `Help01` take and for the same reason: a fuzzy
 * engine is a large dependency whose ranking a consumer cannot restyle, audit
 * against this package's gates or replace without forking the Block.
 */
function containsAll(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token))
}

/**
 * The tone one of the caller's own state words is drawn in.
 *
 * `STATE_TONE` when it recognises the word whole, and `neutral` when it does not.
 * The neutral fallback is the design rather than an oversight: `Status` says
 * `neutral` is the tone for a state with nothing to alarm about, so a word this
 * Block has never heard of costs a colour and not a lie.
 */
function toneOf(state: string): StatusTone {
  return STATE_TONE.get(state.trim().toLowerCase()) ?? 'neutral'
}

/**
 * The capability's limits in the shape `FactList` draws, which is what both
 * arrangements use.
 *
 * A `FactList` inside a table cell is a definition list inside a cell, which is
 * valid and is the reason the `facts` cell exists at all. The cost is stated rather
 * than hidden: a table that carries a specification per row is a tall table, and a
 * caller whose capabilities have three or four limits each is better served by the
 * cards arrangement here or by a `spec-table-01` beside the list. Re-deriving a
 * compact specification for the cell instead would put a second answer to "how does
 * a specification read" in one package.
 */
function factsOf(offering: OfferingList01Offering): Fact[] {
  return (offering.facts ?? []).map((fact) => ({ label: fact.label, value: fact.value }))
}

/**
 * The cell one column draws for one capability.
 *
 * A switch rather than a map of render functions, for the reason `FieldMap01`
 * gives: a map keyed by cell id would be a second recipe of the kind this package
 * keeps off the public surface, and a switch over six cases is the same table with
 * the strings in the same file as the drawing that uses them.
 */
function cellOf(id: OfferingListCell, offering: OfferingList01Offering): ReactNode {
  switch (id) {
    case 'standfirst':
      return offering.standfirst ?? null
    case 'state':
      if (offering.state === undefined) return null
      return (
        <Status
          size="sm"
          tone={toneOf(offering.state)}
          label={offering.stateLabel ?? offering.state}
        />
      )
    case 'price':
      if (offering.price === undefined) return null
      return <Price {...offering.price} size="md" />
    case 'facts':
      return <FactList facts={factsOf(offering)} />
    case 'href':
      if (offering.href === undefined || offering.hrefLabel === undefined) return null
      return (
        <CtaLink href={offering.href} variant="ghost" size="sm">
          {offering.hrefLabel}
        </CtaLink>
      )
    case 'name':
      return offering.name
  }
}

/**
 * A set of capabilities as cards or as a real table, with an optional search, a
 * filter slot and an empty state.
 *
 * **The storefront version of this pattern is a product listing page, and the
 * translation is the noun.** What that page publishes is a grid of items for sale
 * and, on the same surface, the category strip above it: a filter row, a sort
 * control, a result count, and a card or a comparison table per item. Every part of
 * the layout and every part of the accessibility work transfers unchanged, because a
 * result count is a polite live region whichever set it counts and a comparison
 * table is a table whichever things it compares. What does not transfer is the
 * thing being listed. The rows here are capabilities a product offers: capture
 * sources, agents, connectors, tiers. A reader is not choosing between things to
 * buy, so there is no sort by price worth defaulting to and no add-to-basket in the
 * card, and the state mark on each row answers a different question than stock ever
 * does.
 *
 * **The search is optional as a pair, and the reason is the count of rows, which is
 * a fact about the set rather than about the design.** A static list of twelve
 * capabilities does not need one, because twelve rows are shorter than a phone
 * screen at the size this Block draws them, so a reader who wants one of them either
 * sees it or does not and scrolling is a shorter act than typing. Worse than
 * useless, it is a claim: a search field says the set is too large to read, and a
 * reader who believes it and finds twelve rows has been told the page is bigger
 * than it is. A list of two hundred cannot do without one, because there the reader
 * genuinely does not know whether the thing they want is present. So `value`,
 * `onValueChange`, `label` and `clearLabel` travel together, the run throws when
 * half a pair is passed, and the Block draws no field and filters nothing when the
 * pair is absent. The rejected default was a field on every list, which is the shape
 * most catalogue templates reach for first.
 *
 * **The state is an open string and the tones are still mapped, and the difference
 * between those two facts is the argument.** A product has its own vocabulary for
 * what a capability is doing, and between them the products that compose this Block
 * already use more states than any closed set here could hold. A closed set would
 * force every one of them to map its words onto ours and ship a translation nobody
 * asked for, and the translation is the part that rots: the week a product adds a
 * state, every map is a version behind and the table is confidently wrong about
 * where its own capabilities are, with nothing on the page to say so. So the words
 * cross the seam untouched, and the Block still colours the row, because a table of
 * plain text is missing the one thing a reader was scanning for. The colouring is a
 * whole-word match against the stated list above, and anything the list does not
 * name comes out `neutral`, which is the tone that asserts nothing. The cost is
 * named rather than hidden: a product whose states need different colours draws its
 * own `Status` in a column of its own, and that costs the consumer a column rather
 * than costing every consumer a wrong tone.
 *
 * **`Offering01` takes a closed union of four states and this Block takes an open
 * string, and the two are not an inconsistency.** One capability in depth can be
 * given a type that says which answers exist and a diagnostic when it is given
 * none. A catalogue of forty rows cannot afford to refuse to render a row over a
 * word it has not heard of, and the whole argument for a closed set evaporates at
 * that size. Two answers, each right at its own scale.
 *
 * **The table is `table.tsx` and not a grid of `div`s, for the reason
 * `ResourceList01` states in full.** Comparison is what a table is for, and the three
 * things a `<div>` grid gets wrong are the three a reader comparing capabilities
 * needs: there is no `th` to navigate by, there is no association between a row's
 * name and its cells, and there is nothing for a browser's own table commands to
 * act on. So every column header is a `th` with `scope="col"` and every capability
 * name is a `th` with `scope="row"`, and the table is the one `table.tsx` draws in
 * the one scroll container it draws.
 *
 * **The column names are the caller's and the cells are this Block's.** `columns` is
 * required in the table arrangement and refused outside it, so a declared column
 * set can never sit in the markup drawing nothing. What the Block does not do is
 * accept a cell function the way `DataTableColumn` does, because the six cells are
 * closed. The cost is real: a caller whose table needs a seventh fact per
 * capability cannot render it here, and the answer is `DataTable01`, which is a
 * table section with the caller's own cells and a toolbar, at the cost of every
 * label on it.
 *
 * **The search composes `SearchField`, so the clear control, the one tab stop and
 * the polite result region are that Component's rather than a second implementation
 * here.** The result line is where `summary` goes when there is a search, and above
 * the set when there is not, so a caller who passes it gets it either way and never
 * sees it twice.
 *
 * **The card title is a heading one step below the section, derived rather than
 * written.** A set of forty capabilities is forty titles under one heading, so they
 * nest, and moving this Block from an `h2` section to an `h3` one carries them with
 * it. In the table arrangement the names are row headers and not headings, because a
 * table's names are not sections and forty of them in the outline is a list a reader
 * has to walk past.
 *
 * **The heading is aligned left**, because the set is content and it sits under the
 * heading. `SectionHeading` states the rule and this Block has rows underneath it.
 *
 * It is a client Component, and the reason is the filtering rather than the field:
 * the query is a prop the caller holds, the set that results is derived from it on
 * every keystroke, and a server Component cannot re-render its own children. It
 * owns no state of its own, so the client cost is one `useMemo` over the rows the
 * caller passed and not a running loop. Because it carries the directive, a
 * consumer's server file can still render it: the directive puts this module in the
 * client graph, and the props crossing into it are data.
 */
export function OfferingList01({
  eyebrow,
  title,
  description,
  value,
  onValueChange,
  label,
  clearLabel,
  offerings,
  toolbar,
  filters,
  summary,
  empty,
  variant = 'cards',
  columns,
  headingLevel = 'h2',
  className,
}: OfferingList01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  const searching = onValueChange !== undefined

  /*
   * The search is a pair or it is nothing, and every half of that is a throw rather
   * than a silent omission. A field with no handler cannot be typed into and does
   * not filter, which is a control that looks live and is not. A handler with no
   * name is announced as a search box. A handler with no clear label leaves the
   * reader unable to empty the field except by selecting the text, which is the
   * defect `SearchField` was made controlled to end. And a `value` with no handler
   * is state that cannot change, which is the half of a controlled field that
   * cannot be emptied.
   */
  if (searching && (label === undefined || label.trim() === '')) {
    throw new Error(
      'OfferingList01: onValueChange was passed with no label, so the search field would be announced as a ' +
        'search box, which is the one name every other field of its kind on the page shares. Pass the words ' +
        'that say what is being searched.',
    )
  }
  if (searching && (clearLabel === undefined || clearLabel.trim() === '')) {
    throw new Error(
      'OfferingList01: onValueChange was passed with no clearLabel, so the field would carry no way to ' +
        'empty it except selecting the text and deleting it a character at a time. Pass the words that name ' +
        'the control that clears it.',
    )
  }
  if (!searching && (label !== undefined || clearLabel !== undefined || value !== undefined)) {
    throw new Error(
      'OfferingList01: a label, a clear label or a query was passed with no onValueChange, so the field ' +
        'would be drawn dead or not drawn at all while the props say the set is searchable. A search over a ' +
        'set of a dozen rows is a control that does nothing useful; pass the whole pair or none of it.',
    )
  }
  if (variant === 'table' && (columns === undefined || columns.length === 0)) {
    throw new Error(
      'OfferingList01: the table arrangement was chosen with no columns, so the header row would have no ' +
        'words and a screen reader user would be told about four columns of values with no idea which is ' +
        'which. Name the columns, or use the cards arrangement.',
    )
  }
  if (variant !== 'table' && columns !== undefined) {
    throw new Error(
      'OfferingList01: columns were declared for the cards arrangement, where no column is drawn, so the ' +
        'column names would be published in the documentation and rendered nowhere. Declare the columns, or ' +
        'choose the table arrangement.',
    )
  }

  /*
   * Checked before anything is drawn, so the run fails once with the name of the
   * field rather than once per row with a malformed table on the page.
   */
  if (columns !== undefined) {
    const seen = new Set<OfferingListCell>()
    for (const column of columns) {
      const id = column.id
      if (seen.has(id)) {
        throw new Error(
          `OfferingList01: the column "${id}" is declared twice, so the table would have two columns ` +
            'reading the same value and every cell after the first would be read under the wrong name. ' +
            'Declare each cell once.',
        )
      }
      if (id !== 'name' && !offerings.some((offering) => carries(offering, id))) {
        throw new Error(
          `OfferingList01: the "${id}" column was declared and no capability carries it, so the ` +
            'table would carry a column of empty cells, which is a column every reader scans twice. Pass ' +
            'the value on at least one capability, or drop the column.',
        )
      }
      seen.add(id)
    }
    if (!seen.has('name')) {
      throw new Error(
        'OfferingList01: the columns name no "name" cell, so the header row would have a cell fewer than ' +
          'every body row and no row would have a header for a reader to navigate into. Declare the name ' +
          'column, which is also the row header for every row.',
      )
    }
  }

  for (const offering of offerings) {
    if (offering.href !== undefined && (offering.hrefLabel === undefined || offering.hrefLabel.trim() === '')) {
      throw new Error(
        `OfferingList01: the capability "${offering.name}" declares an href with no hrefLabel, so the link ` +
          'would carry no words of its own and a reader would not know what activating it does. Pass the ' +
          'words that say what it does, or omit the href.',
      )
    }
  }

  // A card title nests one level below the section that introduces the set, so a
  // reader who has learned the outline on one Block finds it the same on this one.
  const Title = childLevel(headingLevel)

  const tokens = useMemo(() => tokensOf(searching ? (value ?? '') : ''), [searching, value])

  const visible = useMemo(() => {
    // No handler means no search, so the whole set is the resting state and the
    // Block draws nothing that claims to narrow it. See the JSDoc for why.
    if (!searching || tokens.length === 0) return offerings

    /*
     * Only the name is searched, and that is a limit rather than an oversight. The
     * standfirst, the state and the price are all nodes, and matching them would mean
     * walking the caller's markup for words, which is a Block reading somebody else's
     * content looking for something to search. A caller who wants a standfirst
     * searched passes a name that carries the words their readers would type, and the
     * alternative is a search that matches on words nobody can see.
     */
    return offerings.filter((offering) => containsAll(offering.name.toLowerCase(), tokens))
  }, [offerings, searching, tokens])

  const count = visible.length

  return (
    <Section data-slot="offering-list-01" className={className}>
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="offering-list-01-controls" className="mb-8 flex flex-col gap-4">
        {toolbar === undefined ? null : (
          <div data-slot="offering-list-01-toolbar">{toolbar}</div>
        )}

        {/*
          The field, in the container's own measure rather than the section's, so
          the set under it is a reading column and not a band across six columns.
          `resultSummary` is drawn only once `summary` is passed, so a caller who
          starts passing one should pass an empty result on the first paint to bring
          the live region into the document before its first content.
        */}
        {searching ? (
          <div data-slot="offering-list-01-search" className="w-full max-w-measure-narrow">
            <SearchField
              value={value ?? ''}
              onValueChange={onValueChange}
              label={label}
              clearLabel={clearLabel}
              resultSummary={summary === undefined ? undefined : summary(count)}
            />
          </div>
        ) : summary === undefined ? null : (
          <p data-slot="offering-list-01-summary" className="text-muted-foreground text-sm">
            {summary(count)}
          </p>
        )}

        {filters === undefined ? null : (
          <div data-slot="offering-list-01-filters">{filters}</div>
        )}
      </div>

      {count === 0 ? (
        /*
         * The caller's own sentence, drawn where the capabilities would have been
         * rather than above them, so a reader is not told there is nothing at the
         * foot of a page that shows a catalogue. `text-pretty` is here because the
         * honest empty line is sometimes a paragraph and `text-balance` would leave
         * a one-word last line in it.
         */
        <p data-slot="offering-list-01-empty" className="text-muted-foreground max-w-measure-narrow text-pretty">
          {empty}
        </p>
      ) : variant === 'table' && columns !== undefined ? (
        <div
          data-slot="offering-list-01-table"
          className={cn('border-border overflow-hidden rounded-xl border', className)}
        >

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
              {visible.map((offering) => (
                <TableRow
                  key={offering.id}
                  data-slot="offering-list-01-row"
                  data-offering={offering.id}
                >
                  {columns.map((column) =>
                    // The name is a row header, so a reader who navigates into a
                    // single cell is told which capability they are looking at rather
                    // than hearing a state with nothing to attach it to.
                    column.id === 'name' ? (
                      <TableHead
                        key={column.id}
                        scope="row"
                        className={cn(CELL[column.id], column.className)}
                      >
                        {offering.name}
                      </TableHead>
                    ) : (
                      <TableCell
                        key={column.id}
                        className={cn(CELL[column.id], column.className)}
                      >
                        {cellOf(column.id, offering)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ul
          data-slot="offering-list-01-cards"
          className={cn('grid gap-6', 'sm:grid-cols-2 lg:grid-cols-3', className)}
        >
          {visible.map((offering) => (
            <li key={offering.id} data-slot="offering-list-01-card" data-offering={offering.id} className="h-full">
              <Card className="h-full gap-4 py-6">
                <CardHeader>
                  <CardTitle as={Title}>{offering.name}</CardTitle>
                  {offering.standfirst === undefined ? null : (
                    <CardDescription>{offering.standfirst}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  {offering.state === undefined ? null : (
                    <Status
                      size="sm"
                      tone={toneOf(offering.state)}
                      label={offering.stateLabel ?? offering.state}
                    />
                  )}

                  {offering.price === undefined ? null : (
                    <Price {...offering.price} size="md" />
                  )}

                  <FactList facts={factsOf(offering)} />

                  {offering.href === undefined || offering.hrefLabel === undefined ? null : (
                    <CtaLink href={offering.href} variant="ghost" size="sm" className="self-start">
                      {offering.hrefLabel}
                    </CtaLink>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

/**
 * Whether at least one capability carries the value a column draws.
 *
 * A separate step so the column check reads as a sentence rather than as a chain of
 * optional fields, and so adding a seventh cell later is one line here rather than
 * four edits across the checks above.
 */
function carries(offering: OfferingList01Offering, id: Exclude<OfferingListCell, 'name'>): boolean {
  switch (id) {
    case 'standfirst':
      return offering.standfirst !== undefined
    case 'state':
      return offering.state !== undefined
    case 'price':
      return offering.price !== undefined
    case 'facts':
      return offering.facts !== undefined
    case 'href':
      return offering.href !== undefined
  }
}

export default OfferingList01
