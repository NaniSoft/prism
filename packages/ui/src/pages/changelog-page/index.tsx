import type { ReactNode } from 'react'

import { Changelog01 } from '../../blocks/changelog-01'
import { Badge } from '../../components/ui/badge'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One change record inside a release: which kind it is, the line that says what
 * changed, and the sentence under it.
 *
 * `kind` is a closed set of five and it is the taxonomy rather than a severity
 * ladder: a record says what kind of change it is and not how bad it was, because
 * how bad it was is a property of a reader's exposure and not of the record. The
 * words beside the mark are the caller's, and the mark itself is the Block's.
 */
export type ChangelogPageRecord = {
  /** The record's stable key within its release. */
  id: string
  /** Which of the five kinds this record is. */
  kind: 'added' | 'changed' | 'fixed' | 'removed' | 'security'
  /** The one line that says what changed. */
  title: string
  /**
   * The detail under the line: why it changed, what it affects, what to do about
   * it. A node, so a caller may pass a paragraph, a list of migration steps, or a
   * code block showing the old call beside the new one.
   */
  body?: ReactNode
  /** Where the full record lives. Its presence makes the entry carry a link. */
  href?: string
  /** The words on the link. Required whenever `href` is, and enforced by the Block. */
  hrefLabel?: string
}

/**
 * One release: what it is called, when it was, one line about it, and its records.
 *
 * **`version` and `at` are two different facts and both are required by different
 * readers, which is why neither is derived from the other.** A product that cuts
 * a nightly build has a moment and no meaningful version, and a product that ships
 * once a month has a version a reader can compare against their own lockfile and
 * almost no use for the hour. The Page prints what it was handed and invents
 * neither: it holds no calendar, no semver parser and no opinion about which of
 * the two identifies a release, because every product in this repository has
 * answered that differently and the one answer that would fit all of them is the
 * string the caller already had.
 */
export type ChangelogPageRelease = {
  /**
   * The release's stable key, and the fragment a consumer's own changelog links
   * to.
   *
   * A key and not the version, because a fragment has to be a legal anchor and
   * `1.4.0` and `Q3 2026` are not the same shape of string. The Page puts it on
   * the element that wraps the release's own heading, so a link to it lands on the
   * release rather than above it.
   */
  id: string
  /** The version, or the date, or whatever identifies this group of records. */
  version: string
  /** The moment, already written the way a reader should see it. */
  at?: string
  /** One line about the release as a whole, for a reader deciding whether to read on. */
  summary?: ReactNode
  /**
   * The records, in the order the product published them.
   *
   * Order is the caller's and this Page never touches it. A changelog is a record
   * rather than a document, and the order in a record is the order things happened
   * in, which is a publication decision with a long tail of exceptions: a security
   * fix belongs beside the change that made it necessary far more often than it
   * belongs at the top of the list. Sorting by the version string would reorder
   * `1.10.0` before `1.9.0` for every consumer whose versions happen to be
   * strings, and sorting by the date would move a release whose records were
   * written in a different order into one that was not.
   */
  entries: readonly ChangelogPageRecord[]
}

/**
 * One kind the reader can ask for, and whether they have.
 *
 * `state` is a state and not a control: it is what the caller has decided, and the
 * Page draws it. The control that changes it is the caller's, in `filters`,
 * because narrowing a changelog means holding state and a server Page holds none.
 */
export type ChangelogPageFilter = {
  /** A stable key for the filter. */
  id: string
  /** The words on the filter, in the product's own language. */
  label: string
  /** Whether the caller has this kind turned on. */
  state: 'on' | 'off'
}

/**
 * The band that asks a reader to stop reading and start receiving.
 *
 * `cta` is a node rather than a label and a destination because the thing a reader
 * subscribes to is a control: an email field, a feed link, a form the consumer
 * wrote. Prism supplies the heading and the measure and the caller supplies the
 * control, which is the same seam every other slot in this package is.
 */
export type ChangelogPageSubscribe = {
  /** The band's heading. */
  title: ReactNode
  /** One or two sentences under the heading. */
  description?: ReactNode
  /** The control that subscribes the reader, composed by the caller. */
  cta: ReactNode
}

/**
 * The props a ChangelogPage takes.
 *
 * Every string, every version and every record is a prop and the Page ships none
 * of them. A changelog is the highest risk of hardcoded copy in this package,
 * because the vocabulary of change is the most tempting kind of copy to write: five
 * words, a fixed order, and every product apparently needs them. Five words in one
 * language is five words every consumer of this Page inherits, and the corpus
 * publishes them as this design system's own.
 */
export type ChangelogPageProps = {
  /** Optional label above the page's own heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The page's heading.
   *
   * Required, and the Page draws it itself rather than handing it to the first
   * release. See the Page's JSDoc for the state that decided it.
   */
  title: ReactNode
  /** One or two sentences under the heading. */
  description?: ReactNode
  /**
   * The releases, newest first unless the product says otherwise.
   *
   * The Page does not sort them and does not filter them. Order is a publication
   * decision, and which releases are shown at all is a decision about the reader.
   */
  releases: readonly ChangelogPageRelease[]
  /**
   * The kinds the reader can ask for, and which of them they have.
   *
   * Drawn as a legend rather than as a row of controls, because a control that
   * does nothing is worse than no control: this Page is a server Component, it
   * holds no state, and a button on it would be a button a reader presses and
   * nothing happens.
   */
  kinds?: readonly ChangelogPageFilter[]
  /**
   * The filter control itself: a `TagGroup`, a set of `Button`s wired to a query
   * the caller fetches, or a set of links under a query parameter.
   *
   * A slot because a filter is a control and this Page ships no behaviour. The
   * narrowed set comes back through `releases`, which is why the Page never has to
   * know what the control did.
   */
  filters?: ReactNode
  /**
   * The caller's own way of reaching the releases that are not on this page: a
   * load-more control, a pager, a link to an archive route.
   *
   * A slot for the same reason `filters` is one, and for one more: pagination is
   * a routing decision. Whether the next page is a query parameter, a path
   * segment or a second fetch is a fact about the consumer's own router, and a
   * Page that drew a pager would have drawn a router.
   */
  older?: ReactNode
  /** The closing band asking the reader to subscribe. Omit it and the page ends at `older`. */
  subscribe?: ChangelogPageSubscribe
  /**
   * What the page shows instead of the releases when there are none.
   *
   * Required, and for the same reason the empty state is required on a careers
   * page: a product that has not shipped yet still has a changelog route, and a
   * route that draws nothing is a route a reader cannot tell from a broken one.
   */
  empty: ReactNode
  /**
   * The heading level for the page's own heading, and one step below it for every
   * band and for every release heading inside those bands.
   *
   * Defaults to `h1`, because a page owns the top of the document outline.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete record screen: what changed, in the order it changed, with the
 * reader's own way of narrowing it and the product's own way of reaching the rest
 * of it.
 *
 * **It composes one `Changelog01` per release, and that is the first thing a Block
 * cannot do for itself.** A changelog is a record rather than a document, and the
 * difference is not a matter of taste: a document has one reading order that a
 * reader follows from the top, and a record has an order that is a claim about
 * what happened, which is why the Block takes the order it is given and refuses to
 * sort. A page that passed the whole set to one Block would have every release
 * inside a single section, and the cost of that is the second thing this Page
 * exists for. Composing one per release gives each release its own band and its
 * own anchor, and the alternative was a `Section` per release written here, which
 * would have meant re-deriving the container and the rhythm that `Section` owns.
 *
 * **Each release is linkable, and the release's own heading is what the link
 * lands on.** This is the page a product points at when it says "since last time":
 * an email, a status dashboard, a support answer and a customer's own release
 * notes all want to send a reader to one release rather than to the top of a list
 * they then have to scroll. So the caller's `id` goes on the element that wraps
 * each release, the release's heading is the first thing in it, and a fragment link
 * to that id lands on the release rather than a band above it. The Page uses the
 * release's key rather than its version for the anchor, because a fragment has to
 * be legal in a URL and `1.4.0` and `Q3 2026` are not the same shape of string;
 * the cost is that a consumer writing a link by hand has to use the key, which is
 * why the key is a required field and not derived from the version.
 *
 * **The filters and the older-entries slot are the caller's, and the reason is that
 * both are facts about the reader.** A changelog is usually longer than anyone will
 * read, and a reader who wants only the security records and the reader who wants
 * only the ones since their last deploy are asking two different questions of the
 * same page, so the control that asks it belongs to whoever knows the answer.
 * Filtering also means holding state, and a server Page holds none, which is why
 * `filters` is a node the caller fills with a control they wired themselves and
 * `kinds` is a legend this Page draws from the state they reported: a row of
 * pressed-looking marks with no way to press them would be a row of lies, and the
 * legend is the honest form of the same information. `older` is a slot for the
 * same reason plus one more, which is that pagination is a routing decision:
 * whether the next page is a query parameter, a path segment or a second fetch is
 * a fact about the consumer's router, and a Page that drew a pager would have drawn
 * a router.
 *
 * **The page draws its own `h1`, and the state that decided it is the empty one.**
 * The alternative was handing the caller's title to the first `Changelog01`, which
 * is what the about page and the careers page do with their first band, and it was
 * rejected because `Changelog01` returns nothing at all when it is given no
 * releases. A product that has not shipped yet, or a product whose first release
 * is being written right now, still has a changelog route, and on that route the
 * heading would have been inside the one element that does not render, so the
 * screen would have had no `h1`, no title, and a sentence about there being no
 * releases floating under nothing. The Page therefore holds the heading itself, in
 * a band of its own, and every release below it is composed at one level deeper
 * with no title, which is also why a release's heading is a child of the page
 * rather than a sibling of it.
 *
 * **`empty` is required and it is not the same prop as the one a Block would want.**
 * The honest sentence for a changelog with nothing in it is a fact about the
 * product and not about a changelog: "no releases yet" and "your filter matched
 * nothing" want different words, and only the caller knows which one they are
 * showing. So the Page takes the node and draws it in the release band's place, in
 * a band of its own so the reader is told the record is empty rather than being
 * shown a gap where it should be.
 *
 * It is a server Component. It fetches nothing, it holds no state, it takes no
 * function prop and it imports no router, so a consumer renders it from their own
 * changelog route and hands it the releases their release pipeline published.
 */
export function ChangelogPage({
  eyebrow,
  title,
  description,
  releases,
  kinds,
  filters,
  older,
  subscribe,
  empty,
  headingLevel = 'h1',
  className,
}: ChangelogPageProps) {
  const band = childLevel(headingLevel)

  return (
    <div data-slot="changelog-page" className={cn(className)}>
      {/*
        The page's own heading, in a band of its own, and the reason is in the
        JSDoc: the release band renders nothing when there are no releases, and a
        screen whose only heading lives inside the element that does not render has
        no heading at all.
      */}
      <Section data-slot="changelog-page-heading">
        <SectionHeading as={headingLevel} align="left" eyebrow={eyebrow} title={title} description={description} />
      </Section>

      {kinds === undefined && filters === undefined ? null : (
        <Section data-slot="changelog-page-filters">
          <div className="flex flex-col items-start gap-4">
            {kinds === undefined || kinds.length === 0 ? null : (
              <ul data-slot="changelog-page-kinds" className="flex flex-wrap items-center gap-2">
                {kinds.map((kind) => (
                  <li key={kind.id}>
                    <Badge variant={kind.state === 'on' ? 'secondary' : 'outline'} data-state={kind.state}>
                      {kind.label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {filters}
          </div>
        </Section>
      )}

      {releases.length === 0 ? (
        <Section data-slot="changelog-page-empty">
          <div data-slot="changelog-page-empty-body" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        </Section>
      ) : (
        releases.map((release) => (
          <div key={release.id} id={release.id} data-slot="changelog-page-release">
            <Changelog01
              headingLevel={band}
              releases={[
                {
                  id: release.id,
                  version: release.version,
                  at: release.at,
                  summary: release.summary,
                  entries: release.entries.map((entry) => ({ ...entry })),
                },
              ]}
            />
          </div>
        ))
      )}

      {older === undefined ? null : <Section data-slot="changelog-page-older">{older}</Section>}

      {subscribe === undefined ? null : (
        <Section data-slot="changelog-page-subscribe">
          <SectionHeading
            as={band}
            align="left"
            title={subscribe.title}
            description={subscribe.description}
            className="mb-8"
          />
          {subscribe.cta}
        </Section>
      )}
    </div>
  )
}

export default ChangelogPage
