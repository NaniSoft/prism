'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { Badge } from '../../components/ui/badge'
import { CtaLink } from '../../components/ui/cta-link'
import { SearchField } from '../../components/ui/search-field'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The query in the form the match reads it: case folded, split on whitespace, with
 * the empty tokens dropped.
 *
 * The tokens are AND rather than OR, and the reason is the one `SearchDialog` and
 * `Help01` each state: a reader who types two words is narrowing, and with OR an
 * address book returns nearly everything, which is not a result but a list the
 * reader has to work through themselves.
 */
function tokensOf(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((token) => token.length > 0)
}

/**
 * Whether every token appears somewhere in one case-folded string.
 *
 * A substring test with no stemming and no typo tolerance, which is the same
 * downgrade `Help01` takes and for the same reason: a fuzzy engine is a large
 * dependency whose ranking a consumer cannot restyle, audit against this package's
 * gates or replace without forking the Block.
 */
function containsAll(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token))
}

/**
 * The words a record can be found by, as one case-folded string.
 *
 * **The name, the organisation, the address lines and the tag, and deliberately
 * not the phone number or the email address.** The first four are the things a
 * reader can see on the record, so searching them is searching what they can read. A
 * phone number and an address are the two fields nobody types into a search box:
 * a reader looking for a colleague remembers the name, the firm, the street or the
 * city, and a reader who does remember the number already has the record they were
 * looking for. Including them would add two fields to the haystack and change no
 * result a reader wanted. The tag is included because it is the one field on a
 * record that classifies it rather than identifying it, and a reader who filters a
 * list by tag is filtering by something they can see.
 */
function haystackOf(record: AddressBook01Record): string {
  return [record.name, record.organisation, record.tag, ...record.lines]
    .filter((part): part is string => typeof part === 'string')
    .join(` `)
    .toLowerCase()
}

/**
 * How many records the filter left on the page, which is what the caller's summary
 * is built from.
 *
 * A separate step rather than a value in the same pass so the number cannot drift
 * from the rows: it is counted from the array that was rendered, so a caller whose
 * summary disagrees with the page has a bug in their own function rather than a
 * Block that passed one number and drew another.
 */
function countRecords(records: readonly AddressBook01Record[]): number {
  return records.length
}

/**
 * What every record carries, whichever contact fields it has.
 *
 * The base is split out so the contact arms below can be a union over the two
 * contact pairs rather than four independent optionals. That is the same mechanism
 * `Contact01Address` uses for its `email` pair and `ShowcaseAction` uses for its
 * `href`, and the reason is the same: a prop that is required in one shape and
 * forbidden in another cannot be said by an optional.
 */
type AddressBook01RecordBase = {
  /** The record's stable key within the book. */
  id: string
  /** The person's or the organisation's own name, as they spell it. */
  name: string
  /**
   * The firm, team or account this record belongs to.
   *
   * Optional rather than required, because a personal address book has no
   * organisation column and an estate one has no name column, and a shape that made
   * both required would be a table where one of the two is always empty.
   */
  organisation?: string
  /**
   * The postal lines, one per entry, in the order a reader reads them.
   *
   * Required and non-empty, and the run throws on an empty one, because a record
   * with no address is a record with nothing to record. A contact with a name, an
   * organisation and two telephone numbers is a real thing and belongs in the
   * caller's own store beside this Block rather than in an address book, so the
   * refusal here is not a gap in the type: it is the type declining to be a contact
   * card. Draw a name and a phone number here and a reader is looking at a list of
   * people they cannot post anything to, which is not what an address book is for.
   */
  lines: string[]
  /**
   * The caller's own label for this record: a site, a region, a category.
   *
   * Drawn in the muted ink and searched, and it is the one field that classifies a
   * record rather than identifying it. A caller with four of them composes `Badge`
   * in the `actions` slot instead and keeps this one a word.
   */
  tag?: string
  /**
   * The controls that act on this one record: edit, remove, set as default.
   *
   * A slot, because which actions an address book has is the caller's fact. The
   * trailing controls are never the only route to the record, which is the rule
   * `Item` states: a row whose only destination is a kebab menu hides its own
   * content from a reader who is not looking for a menu.
   */
  actions?: ReactNode
}

/**
 * The four contact shapes a record can be in, and only four.
 *
 * A record may have a telephone link, an email link, both, or neither, and the two
 * pairs are required together in whichever arms they appear. Four arms rather than two
 * independent unions, and the reason is mechanical as much as it is editorial: two
 * parenthesised unions intersected with each other distribute into four arms anyway,
 * and the two intersections collide in the compiler rather than in a reader's head.
 * Naming the four here is the same four either way, written once.
 */
type AddressBook01Contact =
  | {
      /** The number, and the words that name the link to it. */
      phone: string
      /** The words on the `tel:` link, and its accessible name. */
      phoneLabel: string
      /** The address the `mailto:` link points at. */
      email: string
      /** The words on the `mailto:` link, and its accessible name. */
      emailLabel: string
    }
  | {
      /** The number, and the words that name the link to it. */
      phone: string
      /** The words on the `tel:` link, and its accessible name. */
      phoneLabel: string
      /** No link, so no accessible name to owe. */
      email?: never
      emailLabel?: never
    }
  | {
      /** No link, so no accessible name to owe. */
      phone?: never
      phoneLabel?: never
      /** The address the `mailto:` link points at. */
      email: string
      /** The words on the `mailto:` link, and its accessible name. */
      emailLabel: string
    }
  | {
      /** No link, so no accessible name to owe. */
      phone?: never
      phoneLabel?: never
      /** No link, so no accessible name to owe. */
      email?: never
      emailLabel?: never
    }

/**
 * One address record, as an address book shows it: a name, an organisation, the
 * postal lines, a phone, an email, a label, and the caller's own controls.
 *
 * **The three contact fields are links and they are links that are named.** A
 * `tel:` anchor whose accessible name is the number is announced as a run of
 * characters read one at a time, and a `mailto:` anchor whose accessible name is the
 * address is announced as the word mailto followed by the same run, which is the one
 * link on the record a screen reader user cannot follow and the one a mouse reader
 * cannot copy either, because the words they select are the label rather than the
 * address. So `phoneLabel` is required inside the arm where `phone` is and
 * `emailLabel` inside the arm where `email` is, and the run throws for a JavaScript
 * caller and for a value that came out of a store with the type's guarantee already
 * gone. The addresses live in the `href`, where the browser's own affordances can
 * show them, and the caller's sentence is what a reader meets.
 *
 * The cost of the union is that a caller assembling records generically from a store
 * has to narrow before it can type the array, and the answer to that is a narrowing
 * function in their own code rather than four optionals here. What the union buys is
 * that a caller cannot build a record with a number and no sentence, or a sentence and
 * no number, without the compiler saying so.
 */
export type AddressBook01Record = AddressBook01RecordBase & AddressBook01Contact

/**
 * How the records are drawn: a grid of cards or a list of full-width rows.
 *
 * The type is `AddressBook01Form` and the prop is `variant`, and the two names
 * differing is the surface gate working rather than a slip: `check-surface.mjs`
 * refuses a public entry export whose name ends in `Variant`, because in this
 * package that shape names a cva map. This union is the two arrangements the Block
 * can draw and it is named for the arrangement.
 */
export type AddressBook01Form = 'cards' | 'rows'

/**
 * The props an AddressBook01 takes.
 *
 * Every string is a prop and the Block ships none: no name, no organisation, no
 * postal line, no number, no address, no tag and not one word of the three
 * sentences the search field needs. An address book with Prism's words in it would
 * be a directory of somebody else's contacts.
 */
export type AddressBook01Props = {
  /** The short line above the title, usually what the book is for. */
  eyebrow?: ReactNode
  /** The heading. Required, because an index with no heading is a list in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The query, as the caller holds it.
   *
   * Required and controlled, for the reason `SearchField` gives in full: a search
   * field that owns its own text cannot be emptied from outside itself, and an
   * address book whose field cannot be cleared is a field a reader has to select
   * and delete one character at a time. It is also what this Block is for, so the
   * two are the same prop rather than one of them being derived.
   */
  value: string
  /**
   * Called with the query as the reader changes it, and with an empty string when
   * the clear control is pressed.
   */
  onValueChange: (value: string) => void
  /**
   * The field's visible name and its accessible name.
   *
   * Required and a `string`, because a field has one name and that name is the
   * caller's. A control with no name is announced as a search box, which is the one
   * name every other field of its kind on the page shares.
   */
  label: string
  /**
   * The accessible name of the control that empties the field.
   *
   * Required, and it is what makes the control exist rather than a name for
   * something already on screen: `SearchField` draws the clear control whenever
   * this is passed and draws nothing when it is not. The words are the caller's
   * because a screen reader reads them.
   */
  clearLabel: string
  /**
   * The records, in the order a reader should meet them.
   *
   * The caller holds the whole book, because this Block fetches nothing: see the
   * JSDoc on the Block for why that is a law and not a limitation.
   */
  records: readonly AddressBook01Record[]
  /**
   * The caller's own sentence for a query that matched nothing.
   *
   * Required, and the reason is the one `Help01` states: a reader who has typed
   * something and got nothing is reading exactly one line, and a Block that wrote
   * it would write it in this package's language, in every product that installs
   * it, inside a design system rather than inside a product's copy, which is where
   * a translation tool is least likely to look. It is a node because the honest
   * no-results line is sometimes a sentence and sometimes a link to the caller's own
   * support address.
   */
  empty: ReactNode
  /**
   * The caller's own line about what the query found.
   *
   * A function and not a node, because the count a reader reads is a sentence whose
   * word order and noun inflection belong to their language, and a Block that
   * composed it would compose the English one. A function is also what lets a
   * caller say nothing before the reader has typed anything, by returning null for
   * a count they do not want to announce, which is the case every results line has
   * on its first paint.
   */
  summary?: (matches: number) => ReactNode
  /**
   * How the set is drawn.
   *
   * @defaultValue 'cards'
   *
   * `cards` is right for a book of fewer than about forty records read at a glance,
   * where a record is a thing a reader recognises rather than compares. `rows` is
   * right for a long book or a narrow column, where the postal lines want to wrap
   * under the name and a grid would put four columns of address in a phone's width.
   */
  variant?: AddressBook01Form
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless link on a page.
 *
 * Three, and each one is a control that cannot be used. A record with no postal
 * lines is a record with nothing to record. A telephone link with no sentence is
 * announced as a run of characters. An email link with no sentence is the same run
 * behind the word mailto, which is worse because the word before it looks like a
 * name. Each message names the record, because a caller with two hundred records
 * needs to know which one and not which number.
 */
function assertRecords(records: readonly AddressBook01Record[]): void {
  for (const record of records) {
    if (record.lines.length === 0) {
      throw new Error(
        `AddressBook01: the record "${record.name}" passes no address lines, so the record has a name and ` +
          'nothing to record. A contact with a name and a number is a real thing and belongs in your own ' +
          'store beside this Block rather than in an address book, because a reader looking at a list of ' +
          'people they cannot post anything to is not reading an address book. Pass the lines, or keep the ' +
          'record out of this set.',
      )
    }

    if ((record.phone === undefined) !== (record.phoneLabel === undefined)) {
      throw new Error(
        `AddressBook01: the record "${record.name}" declares one of phone and phoneLabel without the other, ` +
          'so the control would be a link announced as a run of characters read one at a time, or a sentence ' +
          'with no number beside it. Pass both, or neither.',
      )
    }

    if ((record.email === undefined) !== (record.emailLabel === undefined)) {
      throw new Error(
        `AddressBook01: the record "${record.name}" declares one of email and emailLabel without the other, ` +
          'so the control would be a mailto link announced as the word mailto followed by a run of ' +
          'characters, which is the one link on the record no reader can follow. Pass both, or neither.',
      )
    }
  }
}

/**
 * An address book: a search field, a set of records, and the caller's own empty
 * sentence for the query that matched nothing.
 *
 * **This Block filters what it was given and it fetches nothing. It holds no
 * book, it fetches no book, and there is no prop that points at one.** That is a
 * law and not a limitation, and the gate that holds it is
 * `packages/ui/scripts/check-block-imports.mjs`, which fails a Block that imports a
 * router or a data client or calls a network function. A Block that fetched an
 * address book would be a Block every consumer whose contacts live in its own store
 * has to rewrite: four consumers with four stores would each either patch the fetch
 * or fork the Block, and the corpus publishes it as a product-agnostic section, so an
 * agent composing a page from it composes a request the consumer never asked for.
 * The Block that exists instead is a frame over an array, and the frame is the part
 * a consumer can install.
 *
 * **The three contact fields are real links and they carry the caller's sentence,
 * and that is the whole of the accessibility argument for them.** A `tel:` anchor
 * whose accessible name is the number is announced as characters read one at a
 * time, and a `mailto:` anchor whose accessible name is the address is announced as
 * the word mailto followed by the same run, which is the one link on a record a
 * screen reader user cannot follow and the one a mouse reader cannot copy either,
 * because the words they select are the label rather than the address. So the label
 * is required inside the arm where the address is, the type is a union so a
 * TypeScript caller cannot build a record with one and not the other, and the run
 * throws for the JavaScript caller and for a value that came out of a store with the
 * type's guarantee already gone. The addresses live in the `href`, where the status
 * bar and the context menu and the middle click can all reach them. The rejected
 * alternative was a bare `<a>` around the address, and the alternative to the
 * union was two optionals with a check, which is the check that is here anyway.
 *
 * **`lines` is required and non-empty, and the refusal is a refusal to be a
 * contact card.** An address book is a set of places, and a record with a name, an
 * organisation and two telephone numbers and no place in it is not a record in an
 * address book. Drawing it would put a list of people a reader cannot post anything
 * to in a surface whose whole purpose is posting to them, and the fix is a contact
 * store beside this Block rather than a fourth contact field here. The cost is
 * stated rather than hidden: a consumer who wants a personal contacts list reaches
 * for a different Block, and the honest answer is that the two lists are read in
 * opposite directions.
 *
 * **Only the fields a reader can see are searched, and the two that are left out
 * are the phone number and the email address.** A reader looking for a colleague
 * remembers the name, the firm, the street or the city, or the label the caller's
 * own product puts on the record. A reader who remembers the number already has the
 * record. Adding two fields to the haystack would change no result a reader wanted
 * and would make the haystack longer on every keystroke for every record. The tag
 * is included because it is the one field that classifies a record rather than
 * identifying it, and a reader filtering by a label they can see is doing exactly
 * what a search is for.
 *
 * **The record's name is a heading one step below the section, in both
 * arrangements.** A reader who searches an address book and then navigates by
 * heading wants to land on the record, not on a list item in a column, and a name in
 * a `span` is a name they cannot come back to. The two arrangements draw the same
 * tree rather than two, so a record is one heading whether it is on a card or a row
 * and a consumer who switches `variant` at render time gets one list in the
 * accessibility tree rather than two. The alternative was a name in a `span` in the
 * cards arrangement only, which would have made the outline depend on a layout
 * prop.
 *
 * **The field composes `SearchField`, so the clear control, the polite result
 * region and the one tab stop are that Component's rather than a second
 * implementation here.** The result line is where `summary` goes: `SearchField`
 * draws it as a polite live region and announces it when the count changes, which is
 * the only thing on the page reporting the consequence of typing and the only place
 * a screen reader user learns that a search ran. A caller who starts passing a
 * summary after the first render brings the region into the document together with
 * its content, which `SearchField` says is the one case a live region is least
 * reliable about, so pass an empty summary on the first paint.
 *
 * **This Block does not own the search landmark, for the reason `SearchField`
 * gives.** A `<search>` element names a region of the page rather than a control,
 * and a page has two real search regions only when its two fields answer two
 * different questions, so put the landmark on the container if the page really does
 * have one search.
 *
 * It is a client Component, and the reason is the filtering rather than the field:
 * the query is a prop the caller holds, the set that results is derived from it on
 * every keystroke, and a server component cannot re-render its own children. The
 * filtering itself is a substring test per record and holds no index of its own, so
 * the client cost is the derivation and not a running loop.
 */
export function AddressBook01({
  eyebrow,
  title,
  description,
  value,
  onValueChange,
  label,
  clearLabel,
  records,
  empty,
  summary,
  variant = 'cards',
  headingLevel = 'h2',
  className,
}: AddressBook01Props) {
  // A record's name is a heading one step below the section that introduces the
  // set, derived rather than written, so a Block embedded one level deeper carries
  // its names with it.
  const Title = childLevel(headingLevel)
  const asCards = variant === 'cards'

  const tokens = useMemo(() => tokensOf(value), [value])

  const visible = useMemo(() => {
    // An empty query draws the whole book, which is the resting state of an address
    // book and not a special case: a reader who has typed nothing is browsing.
    if (tokens.length === 0) return records
    return records.filter((record) => containsAll(haystackOf(record), tokens))
  }, [records, tokens])

  assertRecords(records)

  const shown = countRecords(visible)

  return (
    <Section data-slot="address-book-01" className={cn(className)}>
      <div data-slot="address-book-01-body" className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {/*
         * The field, in the container's own measure rather than the section's, so
         * the list under it is a reading column and not a band across six columns.
         * `resultSummary` is drawn only once `summary` is passed, so a caller who
         * starts passing one should pass an empty result on the first paint to bring
         * the live region into the document before its first content.
         */}
        <div data-slot="address-book-01-search" className="w-full max-w-measure-narrow">
          <SearchField
            value={value}
            onValueChange={onValueChange}
            label={label}
            clearLabel={clearLabel}
            {...(summary === undefined ? null : { resultSummary: summary(shown) })}
          />
        </div>

        {visible.length === 0 ? (
          /*
           * The caller's own sentence, drawn where the records would have been
           * rather than above them, so the reader is not told there is nothing at
           * the foot of a page that shows a book. A `text-pretty` wrapper is here
           * because the honest no-results line is sometimes a paragraph and
           * `text-balance` would leave a one-word last line in it.
           */
          <p
            data-slot="address-book-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : asCards ? (
          <ul
            data-slot="address-book-01-records"
            data-variant={variant}
            className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((record) => (
              <li
                key={record.id}
                data-slot="address-book-01-card"
                data-record={record.id}
                className="border-border bg-card flex h-full flex-col gap-4 rounded-xl border p-5"
              >
                {record.tag === undefined ? null : (
                  <span data-slot="address-book-01-tag" className="self-start">
                    <Badge variant="secondary">{record.tag}</Badge>
                  </span>
                )}

                <Title data-slot="address-book-01-name" className="text-base font-semibold">
                  {record.name}
                </Title>

                {record.organisation === undefined ? null : (
                  <span
                    data-slot="address-book-01-organisation"
                    className="text-muted-foreground text-sm"
                  >
                    {record.organisation}
                  </span>
                )}

                <Contact record={record} />

                {record.actions === undefined ? null : (
                  <div
                    data-slot="address-book-01-actions"
                    className="mt-auto flex flex-wrap items-center gap-2 pt-2"
                  >
                    {record.actions}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ul
            data-slot="address-book-01-records"
            data-variant={variant}
            className="border-border flex flex-col border-t"
          >
            {visible.map((record) => (
              <li
                key={record.id}
                data-slot="address-book-01-row"
                data-record={record.id}
                className="border-border flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-start sm:gap-8"
              >
                <div data-slot="address-book-01-identity" className="flex min-w-0 flex-1 flex-col gap-1">
                  <Title data-slot="address-book-01-name" className="text-sm font-semibold">
                    {record.name}
                  </Title>
                  {record.organisation === undefined ? null : (
                    <span
                      data-slot="address-book-01-organisation"
                      className="text-muted-foreground text-sm"
                    >
                      {record.organisation}
                    </span>
                  )}
                  {record.tag === undefined ? null : (
                    <span data-slot="address-book-01-tag" className="text-muted-foreground text-xs">
                      {record.tag}
                    </span>
                  )}
                </div>

                <Contact record={record} />

                {record.actions === undefined ? null : (
                  <div
                    data-slot="address-book-01-actions"
                    className="flex shrink-0 flex-wrap items-center gap-2"
                  >
                    {record.actions}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

/**
 * The address and the two contact links of one record, drawn the same way in both
 * arrangements.
 *
 * One helper rather than the markup written twice, and the reason is the same one
 * `Download01` gives for its single `FileMeta`: two copies of this markup would be
 * two answers to what a record's contact block looks like, and the second one is the
 * one that goes stale. A caller who switches `variant` gets the same links in the
 * same order, which also means a reader who has learned one arrangement has learned
 * the other.
 *
 * **The postal lines are an `address` element, and the only reason for the one
 * display utility on it is a platform default.** The element is right because that is
 * what the content is, and a `div` would be a set of lines with no element saying so.
 * The platform renders an `address` in italics and no token in this stylesheet
 * resets that, so `not-italic` restores the reading type. It is a platform default
 * rather than a design decision, which is why it is corrected here in the Block
 * rather than authored into the token tier.
 *
 * **The links are `CtaLink` and not bare anchors, so each one carries the focus
 * ring, the hover state and the announced role of one, and so the address is in the
 * `href` where a reader can copy it rather than being the only words on the
 * control.** The label is the caller's, and the type has already refused to build a
 * record without one.
 */
function Contact({ record }: { record: AddressBook01Record }) {
  return (
    <div data-slot="address-book-01-contact" className="flex min-w-0 flex-1 flex-col gap-2">
      <address
        data-slot="address-book-01-address"
        className="text-muted-foreground flex flex-col not-italic"
      >
        {record.lines.map((line, index) => (
          <span key={`${record.id}-${index}`} data-slot="address-book-01-line" className="block">
            {line}
          </span>
        ))}
      </address>

      {record.phone === undefined || record.phoneLabel === undefined ? null : (
        <CtaLink
          data-slot="address-book-01-phone"
          href={`tel:${record.phone}`}
          variant="ghost"
          size="sm"
          className="self-start"
        >
          {record.phoneLabel}
        </CtaLink>
      )}

      {record.email === undefined || record.emailLabel === undefined ? null : (
        <CtaLink
          data-slot="address-book-01-email"
          href={`mailto:${record.email}`}
          variant="ghost"
          size="sm"
          className="self-start"
        >
          {record.emailLabel}
        </CtaLink>
      )}
    </div>
  )
}

export default AddressBook01
