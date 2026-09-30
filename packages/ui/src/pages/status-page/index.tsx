import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Heading } from '../../components/ui/typography'

/**
 * How an estate as a whole is standing, as a closed set of five.
 *
 * Five, and the set is closed for the reason the four incident states are closed:
 * this is a vocabulary about an *estate*, and an estate has one. Every product
 * that publishes a status page is describing the same five situations, and the
 * alternative to a closed set is a `string` the Page branches on, which is a
 * second vocabulary with no gate on it and no way to add a state without editing
 * a package.
 *
 * The **words** are still the caller's, in `label`. A product that says "All
 * systems go" and one that says "Operational" are describing the same state, and
 * neither sentence is Prism's to write. Prism owns which of the five gets which
 * dot.
 */
export type ServiceOverallState =
  | 'operational'
  | 'degraded'
  | 'partial-outage'
  | 'major-outage'
  | 'maintenance'

/**
 * Where an incident has got to, as a closed set of four.
 *
 * **This is a lifecycle, and that is the whole reason the set is closed while a
 * service's own state is not.** A lifecycle has one right vocabulary: an
 * incident is looked into, then a cause is found, then a fix is watched, then it
 * is over, and the order is the same in every product that publishes one. A
 * product's own statuses are the opposite case: a queue is draining, a replica is
 * resyncing, a pipeline is throttled and a dataset is stale, and between four
 * products there are dozens of those words and no order behind them. So
 * `ServicePageService.state` is a plain `string` the Page draws the caller's words
 * for and never branches on, and this union is closed because the sequence
 * through it is a fact about incidents rather than about any one product.
 *
 * The words are the caller's, in `stateLabel`, for the same reason they are
 * everywhere else: "Investigating" and "We are looking into it" are the same
 * moment.
 */
export type IncidentState = 'investigating' | 'identified' | 'monitoring' | 'resolved'

/**
 * How the estate as a whole is announced, and what is said under it.
 *
 * `label` is required and separate from `state`, and the reason is the colour: a
 * status with no words is a coloured dot, which is invisible to a reader who
 * cannot separate the tones and is never announced at all. `Status` refuses to
 * render unlabelled for exactly that reason, so this Page cannot draw an
 * unlabelled state either.
 */
export type StatusPageOverall = {
  /**
   * Which of the five the estate is in. See `ServiceOverallState`.
   *
   * The caller's judgement and not a computation over the rows below it, and the
   * Component's own JSDoc argues the whole of why in the place a reader will
   * look for it.
   */
  state: ServiceOverallState
  /** The words for that state, in the product's own vocabulary. */
  label: string
  /**
   * One sentence under the state, for the part the state cannot carry: what is
   * affected, when it will be over, what a reader should do.
   */
  note?: ReactNode
}

/**
 * One service in the estate: what it is called, what state it is in, and where
 * its own page is.
 *
 * `state` is a `string` and not a union, and the reason is on `IncidentState` in
 * full: a service's own state is a product's vocabulary rather than a lifecycle,
 * so there are as many of them as the product likes. The Page carries the machine
 * value on the row as `data-state`, for a test to key on and for a consumer whose
 * own stylesheet or telemetry reads it, and it draws the words from `stateLabel`.
 * It does not branch on it, which is exactly why it is a string: a Page that
 * branched on a product's vocabulary would need a tone map the caller did not
 * write.
 *
 * The link is a pair rather than one optional prop, and a caller who wants a
 * service row to go somewhere passes both or neither. A link with no words is a
 * control a reader has to guess at, and the second half of the pair is what stops
 * that happening silently.
 */
export type StatusPageService = {
  /** The service's stable key. The name is the usual choice and needs no coordination. */
  id: string
  /** The service's name, as the estate's own inventory spells it. */
  name: string
  /**
   * The service's state, in the product's own vocabulary, carried as a machine
   * value and never branched on. See the note on the type.
   */
  state: string
  /** The words a reader reads for that state. */
  stateLabel: string
  /** One line under the name, for the part of the service's health the state cannot carry. */
  detail?: ReactNode
} & (
  | { href?: undefined; hrefLabel?: undefined }
  | { href: string; hrefLabel: string }
)

/**
 * One update on an incident: when the caller's system said it, and what it said.
 *
 * `body` is a node because an update is sometimes a sentence, sometimes a code
 * block of a stack trace and sometimes a list of affected regions, and a string
 * would force the caller to flatten whichever one their incident feed carries.
 */
export type StatusPageIncidentUpdate = {
  /** The update's stable key within its incident. */
  id: string
  /**
   * The moment, in the caller's own value.
   *
   * A string and not a number because the Page does not read it as a date: see
   * `dateLabel` on the incident. The same value is drawn for the incident and for
   * each of its updates, so one formatter covers both.
   */
  at: string
  /** What the update says. */
  body: ReactNode
}

/**
 * One recent incident: what it was, where it has got to, and what has been said
 * about it since.
 *
 * `stateLabel` is required for the same reason `state` is required, in the other
 * order: the dot is the machine value and the words are the fact, and a reader
 * who cannot see the dot still has to be told which moment this is.
 */
export type StatusPageIncident = {
  /** The incident's stable key, which is usually the reference a reader quotes. */
  id: string
  /** The incident's title, in the words a reader will recognise it by. */
  title: string
  /** Where the incident has got to. See `IncidentState`. */
  state: IncidentState
  /** The words for that moment, in the product's own vocabulary. */
  stateLabel: string
  /**
   * When the incident was opened, in the caller's own value.
   *
   * Drawn as passed, or through `dateLabel` when that is given. Prism formats no
   * date here, and the reason is the one `RelativeTime` gives at length: "12
   * minutes ago" is a sentence with a plural that changes shape past a day, and a
   * design system that shipped one of those would put a sentence into every
   * consumer's product that the consumer could not translate, inflect or
   * reorder. So the value is the caller's and the reading is the caller's.
   */
  at?: string
  /**
   * The caller's reading of `at`, and of every update's `at`.
   *
   * A function rather than a pre-formatted string, because the same value is
   * drawn in two places per incident and formatting it twice in a consumer's
   * render is a second place for the two to disagree. A caller who wants a
   * localised absolute reading plus relative words composes `RelativeTime` and
   * returns its two halves, or passes the node through `body`.
   */
  dateLabel?: (value: string) => string
  /** The incident's own description, one or two sentences or a short block. */
  body?: ReactNode
  /**
   * The updates in order, oldest first.
   *
   * A list rather than a string because an incident's history is a sequence of
   * moments, and a status page that collapses them into a paragraph is a status
   * page a reader has to trust rather than read. Omit it for an incident whose
   * feed carries one entry, because a list of one is a list of one.
   */
  updates?: readonly StatusPageIncidentUpdate[]
} & ({ href?: undefined; hrefLabel?: undefined } | { href: string; hrefLabel: string })

/**
 * The props a StatusPage takes.
 *
 * Every string is a prop and the Page ships none: no state word, no "Services",
 * no "Recent incidents", no "All systems operational" and no relative time. The
 * Page owns the arrangement and the five-way treatment of the overall state, and
 * every sentence on the screen is the caller's.
 */
export type StatusPageProps = {
  /** The short line above the title, usually the product's name. */
  eyebrow?: ReactNode
  /**
   * The screen's heading, and its `h1` at the default level.
   *
   * A node because a status page's heading is often the product's own mark beside
   * a word, and flattening that to a string would make every consumer rebuild it
   * in their own layout.
   */
  title: ReactNode
  /** One or two sentences under the heading, for anything a reader should know first. */
  description?: ReactNode
  /**
   * How the estate as a whole is standing.
   *
   * Required, and required as a judgement rather than as a computation: see the
   * Component's own JSDoc for the argument, which is the sharpest sentence in
   * this Item.
   */
  overall: StatusPageOverall
  /**
   * The services, in the order a reader should meet them.
   *
   * The order is the caller's, because on a status page the order is a claim
   * about what matters when everything is degraded, and a Page that sorted by
   * severity would be making that claim on the caller's behalf with a rule the
   * caller cannot see.
   */
  services: readonly StatusPageService[]
  /**
   * The recent incidents, newest first.
   *
   * Optional, and omitted rather than passed empty wherever the estate has never
   * had one: an empty array and no array are the same state, and the difference
   * between them is not one a consumer should have to hold in their own data.
   */
  incidents?: readonly StatusPageIncident[]
  /**
   * The accessible name of the region holding the incidents.
   *
   * It is a word a reader hears: a screen with two named regions and a list of
   * states under each of them is a screen whose reader needs to know which one
   * they have moved into. "Recent incidents" is this Page's own phrasing; a
   * product that files them as "History" names the same landmark something else.
   *
   * Required, and required even by a caller with no incidents to name, which is
   * a decision rather than an oversight. The alternative was a union that made
   * the label conditional on the array, and a status page's incidents arrive from
   * a fetched payload typed as `StatusPageIncident[] | undefined`, so a union
   * would have asked the caller for a static word in the same expression as a
   * dynamic array and made a rendered page fail to type-check on the day the feed
   * had nothing in it. The cost is stated: a caller whose estate has never had an
   * incident passes a name for a region that is not drawn, and one string in their
   * render is the price for a page that does not change shape with their data.
   */
  incidentsLabel: string
  /**
   * A slot for the caller's own way of reading more: a full report, a postmortem,
   * an archive, a feed.
   *
   * A slot rather than a prop because every one of those is a Block, and a Page
   * that took a Block per prop would be a Page whose interface lists the whole
   * catalogue.
   */
  updates?: ReactNode
  /**
   * A slot for the caller's own subscribe control, drawn under the incidents.
   *
   * A slot and not a button, because subscribing is a form with the caller's
   * fields, their consent line and their own endpoint, and a Page that drew a
   * button here would be a control that cannot act.
   */
  subscribe?: ReactNode
  /**
   * The caller's own node for an estate with no recent incidents.
   *
   * Required, and the reason is specific: this is the one line on a status page
   * that a reader is guaranteed to read, because it is the line that tells them
   * nothing is wrong. A Page that drew nothing there would leave a reader unable
   * to tell an all-clear from a feed that failed, and a status page that cannot
   * be trusted to say "nothing has happened" is not one anybody will keep open in
   * a second tab.
   */
  empty: ReactNode
  /**
   * Heading level for the screen's own heading, and one below it for the incident
   * titles. @defaultValue 'h1'
   */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The dot each of the five overall states is drawn in.
 *
 * `degraded` and `partial-outage` share `warning`, and that is a cost rather than
 * an oversight: `StatusTone` publishes three state roles and a dot that is the
 * only signal is invisible to a reader who cannot separate them anyway, so the
 * two states are told apart by the words beside them, which are the caller's and
 * are required. `maintenance` takes `info`, which is the one role in the contract
 * that means "not an alarm" and is the honest reading of planned work.
 */
const OVERALL_TONE: Record<ServiceOverallState, StatusTone> = {
  operational: 'success',
  degraded: 'warning',
  'partial-outage': 'warning',
  'major-outage': 'destructive',
  maintenance: 'info',
}

/**
 * The dot each of the four incident states is drawn in, which is the lifecycle
 * read as a scale: a warning while it is being looked into, a warning once the
 * cause is known, the neutral role while a fix is watched, and a success when it
 * is over.
 *
 * The first two share `warning` for the reason the two overall states do, and
 * there is a reason the second is not `info`: an identified cause is not yet an
 * all-clear, and a dot that relaxes the moment somebody knows what is wrong
 * teaches a reader to distrust the colour.
 */
const INCIDENT_TONE: Record<IncidentState, StatusTone> = {
  investigating: 'warning',
  identified: 'warning',
  monitoring: 'info',
  resolved: 'success',
}

/**
 * A complete service-status screen: the estate's own state, the services under
 * it, the incidents that shaped it, and the caller's ways to follow along.
 *
 * **The overall state is the caller's judgement and not a computation over the
 * rows, and this is the sharpest decision in the Item.** A screen that computed
 * it would be self-maintaining: rows change, the banner follows, and the Page
 * could not ship a wrong one. The reason that is not enough is that the rows are
 * not the estate. An estate can be degrading in a way no single service admits
 * to: every node is individually healthy, every job finished, every replica
 * caught up, and the product is unusable because the thing a reader came for is
 * the sum of those services rather than any of them. A Page that computed the
 * overall state from its own rows would be forced into one of two failures, and
 * both are on the same screen. It would over-report, painting a red banner over
 * one degraded node out of forty that nobody can feel, which trains a reader to
 * ignore the banner and is how a real outage gets read as routine. Or it would
 * under-report, drawing green beside forty green rows while the product is down,
 * which is the failure that costs a trust once and does not get it back. Neither
 * is something a design system can decide for a product, because the weight of a
 * service, the shape of a dependency between them and the definition of degraded
 * are all facts about the product and none of them are visible from a row. So
 * `overall` is a prop: the caller already knows, because the caller's monitoring
 * already decided it, and the cost is stated rather than hidden. The caller can
 * get it wrong, and a caller whose banner disagrees with their own rows has a bug
 * in their own state, which is a bug in one repository rather than a wrong
 * sentence in five.
 *
 * **Two vocabularies are in this Page and only one of them is closed.** The
 * estate's state is one of five because an estate has one, and the four incident
 * states are closed because an incident is a lifecycle, and a lifecycle has one
 * right order: looked into, cause found, fix watched, over. A *service's* state is
 * a plain string, because that is a product's own vocabulary with as many words in
 * it as the product likes, and a Page that branched on it would need a tone map
 * the caller never wrote. The consequence is visible on the screen and is the
 * right consequence: the estate and each incident get a dot, because Prism owns
 * how those two look, and a service's state is drawn as the caller's words with
 * the machine value on the row as `data-state`, because a service row with a dot
 * and no words is the thing `Status` refuses to render.
 *
 * **The two states are drawn with `Status`, so the dot is never the signal.** The
 * label is required on every state on this screen, the dot is `aria-hidden` inside
 * that Component, and a reader who cannot separate `warning` from `destructive`
 * reads the same fact from the words. That is also why the two overall states that
 * share a tone are safe to share it: the cost of a five-way palette on a status
 * page is that some pairs collide, and the alternative is a state role invented
 * for this Page, which would be a second source of truth for colour in a package
 * whose whole claim is that there is one.
 *
 * **Prism formats no date on this screen.** `at` is the caller's value and
 * `dateLabel` is the caller's reading of it, for the reason `RelativeTime` gives:
 * a relative phrase is a sentence in the reader's language, not a number with a
 * suffix, and shipping one would put a sentence into every consumer's product that
 * they could not translate. The cost is named: a reader's browser cannot read the
 * incident date off this Page as a machine value, and a caller who needs that
 * composes `RelativeTime` where their own `datetime` is, which is the right place
 * for it.
 *
 * **The services band and the incidents band carry no visible heading, and the
 * incidents region is named instead.** Their names are the caller's words and this
 * Page ships none, so the incidents band is a `<section>` named by
 * `incidentsLabel` and the services band is a plain list. The incident titles are
 * headings one step below the screen's own, so a reader navigating by heading meets
 * each incident rather than a wall of links.
 *
 * **Nothing here refreshes itself, and that is the decision a status page most
 * wants to get wrong.** There is no timer, no subscription and no interval in
 * this file, because a banner that changes under a reader is a claim about the
 * estate made by a design system that cannot see the estate, and a reader who
 * cannot tell a real change from a repaint stops reading the banner at all. A
 * consumer that wants a live status page renders this Page again from new props,
 * which is a decision about their data and not about this screen, and
 * `ToolLedger01` is the surface in this package for the case where the change has
 * to arrive without a render.
 *
 * **It is a server Component.** It holds no state, runs no hook, imports no
 * router and fetches nothing, so a consumer renders it from whichever route their
 * framework names. The one function prop it takes, `dateLabel`, is called while
 * this Page renders, which is a server-to-server call and not the thing the client
 * boundary forbids: a callback cannot cross *out of* a server Component into a
 * client one, and nothing on this screen is a client one. Every control a status
 * page usually carries is a `ReactNode` slot instead, because a slot is how a
 * consumer injects their own client control without this Page owning any state.
 */
export function StatusPage({
  eyebrow,
  title,
  description,
  overall,
  services,
  incidents,
  incidentsLabel,
  updates,
  subscribe,
  empty,
  headingLevel = 'h1',
  className,
}: StatusPageProps) {
  // An incident's title is a heading one step below the screen's own, so the
  // outline a reader learns here is the one they meet on every other Page.
  const IncidentTitle = childLevel(headingLevel)

  return (
    <Section data-slot="status-page" className={className}>
      <div data-slot="status-page-body" className="flex flex-col gap-12">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          * The estate's own state, in its own panel and at the larger of the two
          * status steps, because it is the one judgement on this screen that is not
          * about a single row. The panel is a `border` and not a fill: tinting a
          * whole banner by severity is this package choosing how alarming a product's
          * own outage looks, which is the same claim the tone inside it was refused.
          */}
        <div
          data-slot="status-page-overall"
          data-state={overall.state}
          className="border-border flex flex-col gap-2 rounded-lg border p-6"
        >
          <Status
            data-slot="status-page-overall-state"
            tone={OVERALL_TONE[overall.state]}
            label={overall.label}
          />
          {overall.note ? (
            <p
              data-slot="status-page-overall-note"
              className="text-muted-foreground max-w-measure text-pretty text-sm"
            >
              {overall.note}
            </p>
          ) : null}
        </div>

        {/*
          * The services, as a list of hairline rows rather than a table. A table
          * would want a caption and a row of column headings, and every one of those
          * is a sentence a reader reads, so a table here would put reader-facing
          * words on the screen that this package does not own. The rows are what a
          * status page has always been, and they hold their shape at a narrow
          * viewport where three columns do not.
          */}
        <ul data-slot="status-page-services" className="border-border flex flex-col border-t">
          {services.map((service) => (
            <li
              key={service.id}
              data-slot="status-page-service"
              data-state={service.state}
              className="border-border flex flex-col gap-1 border-b py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-foreground text-sm font-medium">{service.name}</span>
                {service.detail ? (
                  <span className="text-muted-foreground text-pretty text-sm">
                    {service.detail}
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {/*
                  * The service's own words, in the mono face a machine value gets,
                  * and no dot. A dot here would have to be a tone this Page chose for
                  * a state it does not have a vocabulary for, and a service row with a
                  * dot and no label is the unlabelled status `Status` refuses to draw.
                  */}
                <span className="text-muted-foreground font-mono text-xs">
                  {service.stateLabel}
                </span>
                {service.hrefLabel === undefined ? null : (
                  <CtaLink href={service.href} variant="ghost" size="sm" className="self-start">
                    {service.hrefLabel}
                  </CtaLink>
                )}
              </div>
            </li>
          ))}
        </ul>

        {incidents === undefined || incidents.length === 0 ? (
          /*
           * The caller's own all-clear, drawn where the incidents would have been, so
           * a reader is not told the estate is quiet twice.
           */
          <p
            data-slot="status-page-empty"
            className="text-muted-foreground max-w-measure text-pretty text-sm"
          >
            {empty}
          </p>
        ) : (
          <section
            data-slot="status-page-incidents"
            aria-label={incidentsLabel}
            className="flex flex-col gap-6"
          >
            <ol data-slot="status-page-incident-list" className="flex flex-col gap-8">
              {incidents.map((incident) => (
                <li
                  key={incident.id}
                  data-slot="status-page-incident"
                  data-state={incident.state}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <Heading as={IncidentTitle} size="lg" className="text-foreground">
                      {incident.title}
                    </Heading>
                    <Status
                      data-slot="status-page-incident-state"
                      tone={INCIDENT_TONE[incident.state]}
                      label={incident.stateLabel}
                      size="sm"
                    />
                  </div>

                  {incident.at === undefined ? null : (
                    <p
                      data-slot="status-page-incident-at"
                      className="text-muted-foreground font-mono text-xs"
                    >
                      {incident.dateLabel === undefined
                        ? incident.at
                        : incident.dateLabel(incident.at)}
                    </p>
                  )}

                  {incident.body ? (
                    <div
                      data-slot="status-page-incident-body"
                      className="text-pretty text-sm"
                    >
                      {incident.body}
                    </div>
                  ) : null}

                  {/*
                    * The updates as a list of moments rather than a paragraph, because
                    * an incident's history is a sequence and a reader checking whether
                    * a fix is holding is reading the last entry far more often than
                    * the first. A rule between the entries rather than a gap alone, so
                    * the boundary survives at a zoom level where the gap stops being
                    * visible.
                    */}
                  {incident.updates === undefined || incident.updates.length === 0 ? null : (
                    <ol
                      data-slot="status-page-incident-updates"
                      className="border-border flex flex-col gap-3 border-t pt-4"
                    >
                      {incident.updates.map((update) => (
                        <li
                          key={update.id}
                          data-slot="status-page-incident-update"
                          className="flex flex-col gap-1"
                        >
                          {incident.dateLabel === undefined ? (
                            <span className="text-muted-foreground font-mono text-xs">
                              {update.at}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-mono text-xs">
                              {incident.dateLabel(update.at)}
                            </span>
                          )}
                          <div className="text-pretty text-sm">{update.body}</div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {incident.hrefLabel === undefined ? null : (
                    <CtaLink
                      href={incident.href}
                      variant="ghost"
                      size="sm"
                      className="self-start"
                    >
                      {incident.hrefLabel}
                    </CtaLink>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {updates ? <div data-slot="status-page-updates">{updates}</div> : null}
        {subscribe ? <div data-slot="status-page-subscribe">{subscribe}</div> : null}
      </div>
    </Section>
  )
}

export default StatusPage
