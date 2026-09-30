import type { ReactNode } from 'react'

import { Careers01 } from '../../blocks/careers-01'
import { ContentGrid01 } from '../../blocks/content-grid-01'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One open role: what it is, which team it is in, where it is, how it is worked,
 * and where it is applied for.
 *
 * `title`, `team` and `location` are required because they are the three
 * questions a reader asks before deciding whether a job is worth reading about,
 * and a row missing one of them is a title with a link rather than a role.
 *
 * `href` and `hrefLabel` are flat here and a union on the Block, and the seam is
 * the same one the about page draws: a consumer's data model is flat, and the two
 * arms are built once at the call site rather than at every record.
 */
export type CareersPageRole = {
  /** A stable key for the role. */
  id: string
  /** The role's own title, as it is written in the posting. */
  title: string
  /** The team the role sits in. */
  team: string
  /** Where the role is. */
  location: string
  /** The working pattern, for a company that has more than one. */
  pattern?: string
  /** A sentence or two about the work, for a page that has room for it. */
  summary?: ReactNode
  /** When it was posted, already written the way a reader should see it. */
  postedAt?: string
  /**
   * Marks the role as no longer open.
   *
   * A state and not a removal: the row stays, it is dimmed, and the caller's
   * `closedLabel` says what happened. A reader who was told a role existed and
   * finds it gone learns nothing.
   */
  closed?: boolean
  /** Where the role goes. Its presence makes the row carry a link. */
  href?: string
  /** The words on the link. Required whenever `href` is, and enforced below. */
  hrefLabel?: string
}

/**
 * One thing the company holds itself to, as a value.
 *
 * The same shape as a principle and deliberately: a value and a principle are the
 * same kind of object on a careers page, a short name and a sentence saying what
 * it means in practice, and a page that drew them differently would be inventing a
 * difference its data does not contain.
 */
export type CareersPageValue = {
  /** A stable key for the tile. */
  id: string
  /** The value's own name. */
  title: string
  /** What holding to it means here, in practice. */
  body: ReactNode
}

/**
 * One team the company hires into: what it is called, what it does, and
 * optionally how many of its roles are open.
 *
 * `roles` is a number rather than a sentence and `rolesLabel` is the sentence, for
 * the reason `Community01` gives for a member count: "1,204 members" and "204
 * online" are not two formats of one fact, every language words them differently,
 * and a bare numeral beside a team name tells a screen reader nothing about what
 * it counts. The Page throws when a count arrives with no words for it.
 */
export type CareersPageTeam = {
  /** A stable key for the row. */
  id: string
  /** The team's own name, as the team spells it. */
  name: string
  /** What the team works on, in a sentence. */
  detail?: ReactNode
  /** How many of its roles are open. Omit it for a team with no count to publish. */
  roles?: number
  /** The words for that count, given the number and the team. Required whenever `roles` is. */
  rolesLabel?: (count: number, team: string) => string
}

/**
 * One thing a role comes with, as a benefit.
 *
 * A benefit is a promise made by whoever wrote it, and it is the caller's. The
 * Page holds the tile and the measure and nothing else.
 */
export type CareersPageBenefit = {
  /** A stable key for the tile. */
  id: string
  /** The benefit's own name. */
  title: string
  /** What the reader gets, and under what conditions. */
  body: ReactNode
}

/**
 * The closing band: a heading, a supporting line, and one way on.
 *
 * A heading and a link rather than a form, for the reason the about page gives:
 * a contact form's handler is a function, a function cannot cross from a server
 * Component to a client Component, and a Page that carried one would have to be a
 * client Component itself. A careers page's last job is to say where to send a
 * CV, not to take one.
 */
export type CareersPageContact = {
  /** The band's heading. */
  title: ReactNode
  /** One or two sentences under the heading. */
  description?: ReactNode
  /** Where the conversation goes. */
  href: string
  /** The words on the link. */
  hrefLabel: string
}

/**
 * One narrowing link above the roles: a label and a destination.
 *
 * A link and not a control, and the reason is that a filter is state. Narrowing a
 * list to one team means deciding which roles are in it, so a control that does it
 * holds state, and this Page is a server Component and holds none. A set of links
 * under a query parameter narrows the list on a server render with no client code
 * at all, which is the arrangement a product whose roles are published as data can
 * use without making its careers route a client bundle.
 */
export type CareersPageOpening = {
  /** The words on the link. */
  label: string
  /** Where the narrowed list is. */
  href: string
}

/**
 * The props a CareersPage takes.
 *
 * Every string, number and destination is a prop and the Page ships none of them.
 * A careers page hardcodes the two sentences that decide whether anybody applies,
 * and those two sentences are the ones a consumer can least afford to inherit from
 * a component library.
 */
export type CareersPageProps = {
  /** Optional label above the page's own heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The page's heading, and the reason the roles band is not optional.
   *
   * It is the page's `h1`, drawn by the roles band rather than by the Page, and
   * that placement is `Careers01`'s own design: a page that lists roles without
   * saying why it exists reads as a job board. See the Page's JSDoc.
   */
  title: ReactNode
  /**
   * The standfirst: one or two sentences under the heading.
   *
   * A string rather than a node, and the boundary is `Careers01`'s own
   * `description` slot, which is a string because the band holds it inside a
   * `SectionHeading`. The cost is that a caller who needs a link or a mark in the
   * standfirst composes their own opening band above this Page, and the answer
   * they get instead of a node is a sentence they can put a link around by hand.
   */
  description?: string
  /**
   * The roles, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which role leads.
   */
  roles: readonly CareersPageRole[]
  /**
   * The words for a role that is no longer open.
   *
   * Required whenever a role is closed, and the requirement is enforced rather
   * than documented: `Careers01` throws when a closed row arrives with no words
   * on it, because a dimmed row with no explanation is a row a reader cannot tell
   * from a rendering fault.
   */
  closedLabel?: string
  /**
   * The values, in the order a reader should meet them. Omit them and the band is
   * not there.
   */
  values?: readonly CareersPageValue[]
  /** The teams, in the order a reader should meet them. Omit them and the band is not there. */
  teams?: readonly CareersPageTeam[]
  /** The benefits, in the order a reader should meet them. Omit them and the band is not there. */
  benefits?: readonly CareersPageBenefit[]
  /**
   * The caller's own narrowing links, drawn above the roles.
   *
   * Links rather than controls, for the reason `CareersPageOpening` gives: a
   * filter is state and a link is not. They go in the roles band's own filter
   * slot, which is the seam `Careers01` draws for exactly this.
   */
  openings?: readonly CareersPageOpening[]
  /** The accessible name of the narrowing row. Required whenever `openings` is, and enforced below. */
  openingsLabel?: string
  /** The closing band. Omit it and the page ends on the last band that was given. */
  contact?: CareersPageContact
  /**
   * What the roles band shows instead of the rows when there are none.
   *
   * Required, and it is the whole of the argument this Page is a Page and not a
   * `Careers01`. See the Page's JSDoc.
   */
  empty: ReactNode
  /**
   * The heading level for the page's own heading, and one step below it for the
   * Page's own bands.
   *
   * Defaults to `h1`, because a page owns the top of the document outline. A
   * consumer embedding the page under a heading it already owns passes one level
   * deeper and the outline follows.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete careers screen: who the company is, what it is hiring for, what it
 * believes, who you would work with, what you would get, and where to send
 * something.
 *
 * **The decision that makes this a Page rather than a `Careers01` is the empty
 * state, and the Page makes it by refusing to branch on it.** A careers page with
 * no open roles is one of the two states a careers page is always in, and it is
 * the one a list is worst at: a list that renders nothing has told a reader
 * nothing at all, and a route that 404s on the week a company closes its last
 * vacancy is a route that fails exactly when somebody is most likely to be
 * checking. So the roles band is not conditional here. It is always rendered, and
 * it is always given `empty`, so it draws the caller's own sentence in place of the
 * rows and the rest of the screen is unchanged around it. A consumer reading this
 * page in a week with no vacancies still learns what the company is, what it
 * believes, who they would work with and where to send a CV, which is the only
 * thing a careers page is for. The rejected alternative was a `roles.length > 0`
 * branch around the band, and it is the exact failure `ContentGrid01` and
 * `Community01` each refuse in their own way: a section that is not there is a
 * section a reader cannot tell from a section that failed to load.
 *
 * **The page heading is the roles band's own heading, and that is `Careers01`'s
 * design rather than this Page's.** The band requires a title precisely because a
 * page that lists roles without saying why it exists reads as a job board, so the
 * page's `h1` is the one that does the saying and the Page draws no heading of its
 * own above it. A Page that drew its own title and then handed the band a second
 * one would say the same words twice within one screen, and the duplicate is the
 * kind of thing no gate finds and every reader sees.
 *
 * **The order after the roles band is the order a reader asks the rest of it in.**
 * Values, then teams, then benefits, then the way on. "What do you believe" comes
 * before "who would I work with" because a team is a group of people a reader has
 * to have a reason to care about, and it comes before the benefits because a
 * benefit is a promise that needs the belief behind it to be worth reading. The
 * cost is that a consumer who hires into one team only would want that band first,
 * and the answer is the one the about page gives: the bands after the roles are
 * each optional, and a consumer who wants a different order composes the screen
 * from `ContentGrid01` itself.
 *
 * **The values, the teams and the benefits are the same Block three times, and
 * that is a decision rather than a shortage.** Each is a set of titled things with
 * a sentence under it and nothing else: no date, no figure, no status. A Page
 * that drew them three different ways would be inventing differences its data does
 * not contain, and the only difference between them here is the arrangement, which
 * is what the `rows` form is for: a team is a set a reader compares, and a value
 * and a benefit are sets a reader chooses from. The cost is that three consecutive
 * bands share a frame, and the answer is that a consumer with a band of its own
 * composes it in place of the one that is not doing the job.
 *
 * **The Page takes one function prop and it never crosses a boundary.** `rolesLabel`
 * is a function because a count is a number and the words for it are a sentence
 * the consumer writes in its own language, and because no two languages word a
 * count the same way. It is called here, during this render, and what is handed
 * down is the string it returned: a server Component may hold a function and call
 * it, and what it may not do is pass one to a client Component, which is why
 * nothing on this page receives a callback. Every one of the composed Blocks is a
 * server Component, so the screen costs a consumer no client JavaScript at all.
 *
 * **The two checks that run before anything is drawn are the ones that would
 * otherwise be invisible in a screenshot.** A role with an `href` and no
 * `hrefLabel` renders a link announced by its address, and a narrowing row with no
 * accessible name is a landmark announced as nothing, which is the state a screen
 * reader user is least able to recover from. The Page throws on both, naming its
 * own props, and the cost of throwing is that a JavaScript caller with a data file
 * that has drifted finds out at render rather than in review.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports
 * no router, so a consumer renders it from whichever route their framework names
 * for the careers page and hands it the roles their own system published.
 */
export function CareersPage({
  eyebrow,
  title,
  description,
  roles,
  closedLabel,
  values,
  teams,
  benefits,
  openings,
  openingsLabel,
  contact,
  empty,
  headingLevel = 'h1',
  className,
}: CareersPageProps) {
  assertLabels(roles, teams)
  const narrowing = asNarrowing(openings, openingsLabel)

  return (
    <div data-slot="careers-page" className={cn(className)}>
      {/*
        Always rendered, and always given `empty`. The band is not conditional on
        this page, and the JSDoc says the whole of why: a careers page with no
        vacancies still has to say who the company is and where to send something.
      */}
      <Careers01
        eyebrow={eyebrow}
        title={title}
        description={description}
        roles={roles.map(asRole)}
        filters={narrowing}
        empty={empty}
        closedLabel={closedLabel}
        headingLevel={headingLevel}
      />

      {values === undefined || values.length === 0 ? null : (
        <ContentGrid01
          entries={values.map((value) => ({ id: value.id, title: value.title, summary: value.body }))}
          headingLevel={headingLevel}
        />
      )}

      {/*
        The teams are rows rather than cards because a team is a set a reader
        compares, and a card per team puts a box between the name and the count
        they came for.
      */}
      {teams === undefined || teams.length === 0 ? null : (
        <ContentGrid01
          variant="rows"
          entries={teams.map((team) => ({
            id: team.id,
            title: team.name,
            summary: teamSummary(team),
          }))}
          headingLevel={headingLevel}
        />
      )}

      {benefits === undefined || benefits.length === 0 ? null : (
        <ContentGrid01
          entries={benefits.map((benefit) => ({
            id: benefit.id,
            title: benefit.title,
            summary: benefit.body,
          }))}
          headingLevel={headingLevel}
        />
      )}

      {contact === undefined ? null : (
        <Section data-slot="careers-page-contact">
          <SectionHeading
            as={childLevel(headingLevel)}
            align="left"
            title={contact.title}
            description={contact.description}
            className="mb-8"
          />
          <CtaLink href={contact.href}>{contact.hrefLabel}</CtaLink>
        </Section>
      )}
    </div>
  )
}

/**
 * The narrowing row, or nothing at all.
 *
 * A `nav` rather than a list of links on their own, because a row of links that
 * filters a list is a landmark: a screen reader user who lands on the page and
 * jumps to navigation expects to be told what the region is. The accessible name
 * is the caller's, and the check in the same function is why that name is owed
 * rather than optional: a `nav` with no name is announced as "navigation", which
 * on a page with a site header above it is two regions called the same thing and
 * nothing to tell them apart.
 */
function asNarrowing(
  openings: readonly CareersPageOpening[] | undefined,
  openingsLabel: string | undefined,
): ReactNode {
  if (openings === undefined || openings.length === 0) return null

  if (openingsLabel === undefined || openingsLabel.trim() === '') {
    throw new Error(
      'CareersPage: openings were passed with no openingsLabel, so the row would be a navigation landmark announced ' +
        'as nothing in particular, which is the one region on a page a screen reader user cannot then identify. Pass ' +
        'the words that say what the row narrows, or drop the openings.',
    )
  }

  return (
    <nav aria-label={openingsLabel} className="flex flex-wrap items-center gap-3">
      {openings.map((opening) => (
        <CtaLink key={opening.href} href={opening.href} variant="outline" size="sm">
          {opening.label}
        </CtaLink>
      ))}
    </nav>
  )
}

/**
 * One team as a row draws it, with the count under the detail rather than beside
 * the name.
 *
 * A count is a reading and not a name, so it belongs in the row's body where the
 * detail is and not in the row's heading where a reader scanning names would meet
 * a number with no noun beside it. The span is given `block` and nothing else, so
 * the count is a second line at the summary's own size rather than a smaller
 * annotation this Page invented a size for.
 */
function teamSummary(team: CareersPageTeam): ReactNode {
  const counted = team.roles === undefined ? null : (team.rolesLabel?.(team.roles, team.name) ?? null)
  if (team.detail === undefined) return counted
  if (counted === null) return team.detail

  return (
    <>
      {team.detail}
      <span className="block">{counted}</span>
    </>
  )
}

/**
 * One role as the list draws it, with the two link arms kept apart.
 *
 * The same seam the about page draws at its engagements: a consumer's role record
 * is flat, and the pair is built once here rather than narrowed at every record.
 * The `hrefLabel` fallback is unreachable, because the check above throws first,
 * and it is written as an empty string rather than as an assertion so a future
 * change in the order would render an unnamed link rather than lie to the
 * compiler.
 */
function asRole(role: CareersPageRole) {
  const shared = {
    id: role.id,
    title: role.title,
    team: role.team,
    location: role.location,
    pattern: role.pattern,
    summary: role.summary,
    postedAt: role.postedAt,
    closed: role.closed,
  }

  return role.href === undefined
    ? shared
    : { ...shared, href: role.href, hrefLabel: role.hrefLabel ?? '' }
}

/**
 * The two checks the Page owes its own reader before anything is drawn, run once
 * here so the messages name the Page's own props.
 *
 * A role with an `href` and no `hrefLabel` renders a link announced by its address,
 * and a team with a `roles` count and no `rolesLabel` renders a bare numeral beside
 * a name, which tells a screen reader nothing about what it counts. `Careers01`
 * throws for the first of those on its own account and `ContentGrid01` cannot see
 * the second at all, so the second exists here. The cost of throwing rather than
 * degrading is that a caller with a data file that has drifted finds out at render
 * instead of in review, which is the trade every refusal in this package makes.
 */
function assertLabels(roles: readonly CareersPageRole[], teams: readonly CareersPageTeam[] | undefined): void {
  for (const role of roles) {
    if (role.href !== undefined && (role.hrefLabel === undefined || role.hrefLabel.trim() === '')) {
      throw new Error(
        'CareersPage: a role declares an href and no hrefLabel, so the row would carry a link announced by its ' +
          'address, which a screen reader reads out as punctuation rather than as a name. Pass the words that say ' +
          'what following the link does, or drop the href.',
      )
    }
  }

  for (const team of teams ?? []) {
    if (team.roles !== undefined && (team.rolesLabel === undefined || team.rolesLabel === null)) {
      throw new Error(
        'CareersPage: a team declares a roles count and no rolesLabel, so the reading would be a bare numeral ' +
          'beside a team name, which tells a screen reader nothing about what it counts and a sighted reader only ' +
          'that somebody counted. Pass the words for the count in your own language, or drop the count.',
      )
    }
  }
}

export default CareersPage
