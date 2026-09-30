'use client'

import { useMemo, type ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { SearchField } from '../../components/ui/search-field'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Heading } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One result on the screen: what it is, where it goes, and which group of the
 * caller's it belongs to.
 *
 * `group` is required on every entry rather than optional, because a results
 * screen that sometimes groups and sometimes does not is a screen whose reader
 * cannot tell a heading from a coincidence. One group is a list, and the Page
 * draws it the same way; see `groupLabel` on the props for the one case where the
 * difference is visible.
 *
 * `title` is a `string` and not a node, for the reason `Help01Article` states:
 * a result's name is what the reader reads, what a caller's index carries, and
 * what a caller's own ranking scored. A node here would have to be walked for
 * words by whoever wants to search it, and a Page reading a caller's markup for
 * something to match is a Page that has started to own the content.
 */
export type SearchPageResult = {
  /** The result's stable key. The route is the usual choice and needs no coordination. */
  id: string
  /**
   * Which group of the caller's this result belongs to, in the caller's own words.
   *
   * The Page draws the groups in the order they first appear in `results` and
   * never reorders them, because the order is a claim about what matters first
   * and the caller's index made that claim before this Page saw anything.
   */
  group: string
  /** The result's own name, as the caller's index spells it. */
  title: string
  /**
   * One line of context under the name, drawn exactly as passed.
   *
   * A node, because a line of context is sometimes a sentence, sometimes a code
   * fragment and sometimes a row of badges, and a string prop would force the
   * caller to flatten whichever of those their index holds.
   */
  summary?: ReactNode
  /** Where the result goes. */
  href: string
  /**
   * The words on the link, for a caller whose titles are not the sentence they
   * want a reader to read on a link.
   *
   * Omit it, which is the ordinary case, and the title is the link's words. Pass
   * it when the title is written to match a query rather than to promise what
   * following it does, which is most of the time on a documentation index: "the
   * heading" is a good query target and a poor link. The two shapes are one
   * decision rather than two props, because a link with a title on it and a
   * second link underneath it is a row with two ways out of it.
   */
  hrefLabel?: string
  /**
   * When the result last changed, in the caller's own words, drawn as passed.
   *
   * Prism formats no date on this Page, for the reason `Help01` gives: a date's
   * honest reading is `RelativeTime` or a caller's own formatter, and the string
   * a caller holds may be a locale, a quarter or a release name rather than a
   * date at all.
   */
  updatedAt?: string
}

/**
 * The props a SearchPage takes.
 *
 * Every string is a prop and the Page ships none: no "Search", no "No results",
 * no "results" and no count. The three sentences a search screen says are the
 * three a Page is least entitled to choose, and the reason is on the Component
 * below in full.
 */
export type SearchPageProps = {
  /** The short line above the title, usually what is being searched. */
  eyebrow?: ReactNode
  /**
   * The screen's heading, and its `h1` at the default level.
   *
   * A node rather than a string because a search page's heading is often the
   * caller's own navigation: "Search the handbook" is one line and "Search" with
   * a muted count beside it is two, and the count is the caller's to compose.
   */
  title: ReactNode
  /** One or two sentences under the heading, for anything a reader should know first. */
  description?: ReactNode
  /**
   * The query, as the caller holds it.
   *
   * Required and controlled, for the reason `SearchField` gives in full: a field
   * that owns its own text cannot be emptied from outside itself, and a results
   * page whose field cannot be cleared is a page where a reader has to select the
   * query and delete it one character at a time.
   */
  value: string
  /** Called with the query as the reader changes it, and with an empty string when cleared. */
  onValueChange: (value: string) => void
  /**
   * The field's visible name, and the accessible name that goes with it.
   *
   * A `string`, and the caller's. "Search" is the one name every field of this
   * kind on a site shares, so a screen reader's list of search boxes is a list of
   * identically named boxes unless the caller says which corpus, which index or
   * which site.
   */
  label: string
  /**
   * The accessible name of the control that empties the field.
   *
   * Required, and it is what makes the control exist rather than a name for
   * something already on screen: `SearchField` draws the clear control whenever
   * this is passed and draws nothing when it is not.
   */
  clearLabel: string
  /**
   * The results, in the order a reader should meet them.
   *
   * The caller holds the index, the ranking and the page window, because this
   * Page searches nothing and fetches nothing. It renders the array it was
   * given, so a consumer whose content is one static JSON file filters it in the
   * browser and a consumer whose content is a store pages it on the server get
   * the same screen with no index in this package.
   */
  results: readonly SearchPageResult[]
  /**
   * The accessible name of the region holding the groups.
   *
   * Required as soon as the results carry more than one `group`, and optional
   * when they carry one, because a single group is a list rather than a grouping
   * and a named landmark around one list is a landmark a reader did not ask for.
   * The alternative was to require it always and to throw without it, and a
   * missing region name costs a reader a landmark while a throw costs the whole
   * screen: a Page that cannot draw its results because nobody named a region has
   * failed at the wrong thing.
   */
  groupLabel?: string
  /**
   * The caller's own line about what the query found, drawn under the field in
   * the field's polite live region.
   *
   * A function and not a node, for the reason `Help01` gives at length: "12
   * results", "3 of 40 invoices" and "showing the newest first" are three
   * different sentences, only the caller knows which one is true, and only the
   * caller knows what to say when the number is zero. Prism is handed the number
   * and hands the sentence back, and it is the number of results this Page was
   * given rather than a total the Page looked for.
   *
   * Pass an empty summary on the first paint: a live region that arrives with its
   * content is the one case a region is least reliable about, and this one is
   * drawn only once `summary` is passed.
   */
  summary?: (matches: number) => ReactNode
  /**
   * Which result is the current one.
   *
   * The caller's fact, and marked with `aria-current` so a screen reader reads
   * it, plus a fill and a left rule so a reader who is not using one sees it.
   * The Page does not move it: a roving tab stop over results is a keyboard model
   * a Page would have to own, and a search screen's own field already owns the
   * tab stop a reader meets first.
   */
  selectedId?: string
  /**
   * Called with a result's `id` when the reader activates it.
   *
   * The Page does not prevent the navigation, because the link is a link and a
   * reader who pressed it meant to go there. This is the caller's hook for
   * recording the choice, for moving a highlight, or for a panel beside the
   * results that follows what the reader last picked.
   */
  onSelect?: (id: string) => void
  /**
   * The caller's own node for a query that returned nothing.
   *
   * Required, and the reason is the sharpest thing this Page has to say: this is
   * the one line a reader is guaranteed to read after typing, and a Page that
   * wrote it would write it in this package's language, in every product that
   * installs it, inside a design system rather than inside a product's copy.
   *
   * It is a node because the Page cannot tell an empty query from a query that
   * matched nothing: both arrive as an empty `results` array, and "type to
   * search" and "nothing matches that" are different sentences about different
   * situations. `EmptyState01` with `reason="no-match"` is one thing to pass.
   */
  empty: ReactNode
  /**
   * A slot for the caller's own recent searches, drawn between the field and the
   * results.
   *
   * A slot rather than a prop because a list of recent searches is a Block or a
   * control the caller already has, and a Page that took one per prop would be a
   * Page whose interface lists the catalogue.
   */
  recent?: ReactNode
  /**
   * A slot for the caller's own pager, drawn under the results.
   *
   * A slot for the same reason, and for a second one: a pager is where the total
   * and the page size live, and this Page is the screen that has just declined to
   * claim a total. `Pagination` is the Component in this package, and its window
   * state is the caller's.
   */
  pagination?: ReactNode
  /**
   * Heading level for the screen's own heading, and one below it for the group
   * names. @defaultValue 'h1'
   *
   * `h1` because a Page owns the document's top-level heading. A Page rendered
   * inside another page's own `h1` passes `h2`, and the group names follow it.
   */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The results in the order the caller's groups first appear, each with its own
 * rows.
 *
 * First appearance rather than alphabetical and rather than longest first,
 * because both of those are claims about what matters and the caller made a claim
 * already by putting the rows in that order. Grouping is the one piece of
 * structure this Page derives, and it derives it from the data rather than from a
 * prop that restates it.
 */
function groupOf(results: readonly SearchPageResult[]): { name: string; rows: SearchPageResult[] }[] {
  const order: string[] = []
  const byGroup = new Map<string, SearchPageResult[]>()
  for (const result of results) {
    const rows = byGroup.get(result.group)
    if (rows === undefined) {
      order.push(result.group)
      byGroup.set(result.group, [result])
      continue
    }
    rows.push(result)
  }
  return order.map((name) => ({ name, rows: byGroup.get(name) ?? [] }))
}

/**
 * A complete search screen: the heading, the field, the caller's count, the
 * caller's groups of results, and the caller's own ways back and forward.
 *
 * **The decision this screen exists to make is that it counts nothing and claims
 * nothing.** There is no result count this Page computes, no sentence it writes
 * when nothing matched, and no total it can stand behind. All three are the
 * caller's: the count line is a function they compose from the number of results
 * they passed, and the empty state is a node they wrote. The argument for the
 * other side is real, and it is the argument most search screens win with: a
 * count is the most useful single thing on a results page, and a screen without
 * one leaves a reader unsure whether their query ran at all. The argument against
 * it is what the count is a count *of*. An index is one file on a static route,
 * or a vector store, or three stores and a cache with a ranking in front of them,
 * and this Page sees a `results` array and nothing else, so a number composed
 * here is a number about the subset the caller handed over, presented as the
 * whole. A search that reports no results when the index is one file and the
 * reader's term is in another has lied to somebody looking for a document they
 * were told exists, and the cost of that lie is a ticket about a page the reader
 * never reached.
 *
 * `SearchDialog` is the counter-example that makes this rule sharper rather than
 * softer, and it is worth naming because it is in this package and it does own a
 * count. The dialog fetches the whole index itself, on the first keystroke, so
 * the array it ranks is the array it counts and the total it speaks is the total.
 * That is why it can take a `one` and an `other` and compose the sentence. A Page
 * is handed its results by a consumer whose index it cannot see, and what it was
 * handed is not the world. The same reasoning is why `summary` is a function and
 * not a `matches` number with a label beside it: the sentence is a sentence in
 * the reader's language, and the number underneath it is the caller's count of
 * the caller's own results.
 *
 * **It composes `SearchField` rather than drawing a field, for the four things
 * that field already gets right and a Page would get wrong.** The clear control
 * stays where it was when the field is empty, so a keyboard reader's focus never
 * falls through to the body; the platform's own clear mark is switched off, so
 * there is one mark doing one job and it has a name; the label is drawn from the
 * caller's own words and names the control through the label element, so what a
 * reader sees and what a screen reader announces are one thing; and the count
 * line rides inside the field's polite live region, which is the only part of the
 * screen that reports the consequence of typing. The alternative was a second
 * field in this Page, and two fields in one package is two answers to the
 * question of what a search box says when a reader empties it.
 *
 * **The query is the caller's and this Page reads no URL.** `value` is a string
 * the caller holds and `onValueChange` is how it changes, and that pair is what
 * makes the field controlled and what lets a caller clear the query from outside
 * the field when their result set empties. A Page that read a query string would
 * be a Page that routes, and a Page that imports a router is a Page every
 * consumer whose router is not that one has to reimplement.
 *
 * **It is a client Component, and that is a cost a server-rendered route pays.**
 * A search screen is the one screen a framework most wants to render on the
 * server, because the query is in the address and the results come from the
 * store, and rendering this Page from a server component makes the whole screen
 * a client module: a callback prop cannot cross from a server Component to a
 * client one, and this Page takes two. The alternative was a `field` slot
 * holding the caller's own client control with this Page a server Component, and
 * that is the better shape for a framework that renders its routes on the server.
 * It was rejected because the controlled field and the count line are the two
 * centrepieces of the screen, and a Page that took both as slots would be a frame
 * with two holes in it where its own reason to exist should be. The cost is
 * named rather than hidden: a consumer that cannot make its search route a client
 * module composes `SearchField` in a client component of its own, and this Page
 * is not the answer for them.
 *
 * **The current result is marked with `aria-current`, and colour is not the only
 * signal.** The attribute is what a screen reader reads, and the row also takes a
 * fill and a left rule a reader who cannot separate two fills can see. The rule
 * is the same width whether it is drawn or not, so marking one result does not
 * move the rows beside it, and the Page never moves the mark itself: `selectedId`
 * is the caller's fact, because a roving tab stop over a list of results is a
 * keyboard model this Page would have to own and defend, and a search screen's
 * own field already holds the tab stop a reader meets first.
 *
 * **It does not own the search landmark, for the reason `SearchField` gives.** A
 * `search` element names a region of the page rather than a control, and a page
 * has two real search regions only when its two fields answer two different
 * questions. Wrap the Page in your own `search` element when the page really does
 * have one search, so that moving the Page between a shell and a bare route does
 * not drag the landmark with it.
 *
 * **Nothing here refreshes itself.** The Page renders the array it was given and
 * no timer, no subscription and no interval touches it, because a list of results
 * that rearranges itself under a reader who is reading it is an attention loop,
 * and a screen reader user has no way to tell a result set that updated from one
 * that moved. A consumer that wants its results to change asks its own store to
 * change and renders this Page again, which is a decision about their data and
 * not about this screen.
 */
export function SearchPage({
  eyebrow,
  title,
  description,
  value,
  onValueChange,
  label,
  clearLabel,
  results,
  groupLabel,
  summary,
  selectedId,
  onSelect,
  empty,
  recent,
  pagination,
  headingLevel = 'h1',
  className,
}: SearchPageProps) {
  // A group name is a heading one step below the screen's own, so a reader who has
  // learned the outline on one screen finds it the same on this one. A hardcoded
  // `h2` would be right exactly once, at the nesting depth it was written for.
  const GroupTitle = childLevel(headingLevel)

  const groups = useMemo(() => groupOf(results), [results])

  return (
    <Section data-slot="search-page" className={className}>
      <div data-slot="search-page-body" className="flex flex-col gap-8">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          * The field, in the reading measure rather than the section's full width,
          * because a result set under a field that spans six columns is a list with
          * no column to read it in. `resultSummary` is drawn only once `summary` is
          * passed, so a caller who starts passing one should pass an empty summary
          * on the first paint to bring the live region into the document before its
          * first content.
          */}
        <div data-slot="search-page-field" className="w-full max-w-measure-narrow">
          <SearchField
            value={value}
            onValueChange={onValueChange}
            label={label}
            clearLabel={clearLabel}
            {...(summary === undefined ? null : { resultSummary: summary(results.length) })}
          />
        </div>

        {recent ? <div data-slot="search-page-recent">{recent}</div> : null}

        {groups.length === 0 ? (
          /*
           * The caller's own sentence, drawn where the results would have been rather
           * than above them, so a reader with nothing is not told so twice. A
           * `text-pretty` wrapper is here because the honest no-results line is
           * sometimes a paragraph and a balanced one would leave a single word on
           * its own last line.
           */
          <p
            data-slot="search-page-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <section
            data-slot="search-page-results"
            aria-label={groupLabel}
            className="flex flex-col gap-8"
          >
            {groups.map((group) => (
              <div key={group.name} data-slot="search-page-group" className="flex flex-col gap-3">
                <Heading as={GroupTitle} size="lg" className="text-foreground">
                  {group.name}
                </Heading>

                <ul data-slot="search-page-results-list" className="border-border flex flex-col border-t">
                  {group.rows.map((result) => {
                    const current = result.id === selectedId
                    return (
                      <li
                        key={result.id}
                        data-slot="search-page-result"
                        data-current={current || undefined}
                        aria-current={current || undefined}
                        className={cn(
                          'border-border flex flex-col gap-1 border-b border-l-2 px-3 py-4',
                          current ? 'bg-muted border-primary' : null,
                        )}
                      >
                        {/*
                          * The two shapes a result's link takes, and the activation
                          * handler goes on whichever one this result has. A row that
                          * carried both would be a row with two destinations, and a
                          * reader looking at a result would have to guess which of
                          * them they meant.
                          */}
                        {result.hrefLabel === undefined ? (
                          <a
                            href={result.href}
                            onClick={onSelect === undefined ? undefined : () => onSelect(result.id)}
                            className="text-foreground rounded-sm text-sm font-medium underline-offset-4 hover:underline"
                          >
                            {result.title}
                          </a>
                        ) : (
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-foreground text-sm font-medium">
                              {result.title}
                            </span>
                            <CtaLink
                              href={result.href}
                              variant="ghost"
                              size="sm"
                              className="self-start"
                              onClick={onSelect === undefined ? undefined : () => onSelect(result.id)}
                            >
                              {result.hrefLabel}
                            </CtaLink>
                          </div>
                        )}

                          {result.summary ? (
                            <div
                              data-slot="search-page-result-summary"
                              className="text-muted-foreground text-pretty text-sm"
                            >
                              {result.summary}
                            </div>
                          ) : null}

                          {result.updatedAt === undefined ? null : (
                            <span
                              data-slot="search-page-result-updated"
                              className="text-muted-foreground text-xs"
                            >
                              {result.updatedAt}
                            </span>
                          )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}

        {pagination ? <div data-slot="search-page-pagination">{pagination}</div> : null}
      </div>
    </Section>
  )
}

export default SearchPage
