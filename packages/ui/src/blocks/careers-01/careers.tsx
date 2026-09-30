import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The link arm and the no-link arm of one role, as a union.
 *
 * The same agreement `CaseStudies01` makes, for the same reason: a row whose only
 * link is the job title reads as a title, and the sentence that says what
 * following it does is a claim about the page a reader is about to land on and
 * therefore about whoever wrote that page. So `hrefLabel` is required in the link
 * arm rather than defaulted here.
 */
export type CareersRoleLink = {
  /** Where the role goes. Present makes the row carry a link. */
  href: string
  /** The words on the link, and what following it does. */
  hrefLabel: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
} | {
  href?: never
  hrefLabel?: never
  newTab?: never
}

/**
 * One open role: what it is, which team it is in, where it is, how it is worked,
 * and where it is applied for.
 *
 * `title`, `team` and `location` are required, and the reason is the one the
 * whole section turns on. A role list exists so a reader can decide whether a
 * job is worth reading about, and the three fields are the three questions every
 * reader asks before that: what is it, who would I be working with, and where
 * would I be. A row missing any of them is not a role, it is a title with a link,
 * and a page of those is a page a reader has to open every row to evaluate, which
 * is the cost the list was supposed to remove.
 *
 * `pattern` is the working pattern and it is optional, because a company that
 * works in one place everywhere has nothing to add on that axis and a blank would
 * be a lie in the other direction. `postedAt` is a string for the reason
 * `Story01`'s `at` is: a Block ships no formatting, and the honest way to render a
 * date in a caller's own locale and script is `RelativeTime` or the platform's
 * own `Intl`, both of which the caller composes.
 *
 * `closed` is a state and not a removal, and the JSDoc on the Block says why at
 * length. It is the one field here that exists to make the Block say less.
 */
export type CareersRole = {
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
  /** When it was posted, already written the way the reader should see it. */
  postedAt?: string
  /**
   * Marks the role as no longer open, which dims the row and states the caller's
   * `closedLabel` on it. See the Block's JSDoc for why a closed role is rendered
   * rather than filtered out.
   */
  closed?: boolean
} & CareersRoleLink

/**
 * The props a Careers01 takes.
 *
 * Every string and every summary is a prop, and the Block ships none: no role, no
 * team, no location and no default "no open roles" sentence. A list that
 * hardcoded its rows would hand every consumer a set of jobs that are not theirs.
 */
export type Careers01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title. Required, because a page that lists roles without saying
   * why it exists reads as a job board and not as a company telling a reader
   * what it is working on.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: string
  /**
   * The roles, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which role leads.
   */
  roles: CareersRole[]
  /**
   * The caller's own team and location controls, rendered above the list.
   *
   * A slot and not a `teams` prop, and the reason is that a filter is a control
   * and this Block ships no behaviour. Narrowing a list to one team means reading
   * which roles are in it and rendering fewer of them, so a `teams` prop here
   * would either filter a copy the Block then no longer owns or need the state
   * that a Block is not allowed to hold. A slot lets the caller compose its own
   * `TagGroup`, its own `Combobox` or a set of `Button`s wired to a query it
   * fetches itself, and the list below it stays a list.
   */
  filters?: ReactNode
  /**
   * What a reader sees when the caller's own filter has narrowed the list to
   * nothing. Omit it and an empty list is an empty list.
   */
  empty?: ReactNode
  /**
   * The words for a role that is no longer open. Required when any role is
   * closed, because a dimmed row with no explanation is a row a reader cannot
   * tell from a rendering fault.
   */
  closedLabel?: string
  /**
   * Whether the roles are rows in a list or cards in a grid.
   *
   * `list` is the default because a role list is read by scanning its left edge:
   * a reader is looking for a title they recognise and the location beside it, and
   * a card per role puts a box between them. `cards` is for a page that has
   * narrowed to a handful of roles, where a card gives the summary and the apply
   * link room a row does not have.
   */
  variant?: 'list' | 'cards'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * Open roles: a list where each row carries the role, the team, the location, the
 * working pattern and a link to apply, with a slot for the caller's own filters.
 *
 * **A closed role is rendered dimmed rather than filtered out, and the reason is
 * what a reader learns from each.** A reader who was told a role existed and finds
 * it gone learns nothing at all: the absence is indistinguishable from a mistake,
 * from a pagination bug, or from a company that removes a posting the moment
 * somebody applies. Worse, a list that silently shrinks is a list a reader stops
 * trusting, because a list that can lose a row without saying so is a list whose
 * rows cannot be relied on to be there when a reader comes back. So the row stays,
 * it is dimmed, and the caller's `closedLabel` says what happened. The Block
 * throws when a closed role arrives with no `closedLabel`, because a dimmed row
 * with no words on it is exactly the defect this is fixing: a reader looking at a
 * faded line and given nothing to read about it.
 *
 * **The framing is a recruiting pattern translated, and the claim in this JSDoc is
 * about the pattern rather than about NaniSoft's headcount.** A pipeline that
 * runs needs people watching it, and the pattern every one of these marketing
 * sites wants is the same: here is the work, here is who does it, here is where
 * they sit, and here is the sentence that says what applying does. That is a
 * recruiting page wearing a product's clothes, and a Block that shipped the words
 * would put NaniSoft's own headcount into every consumer's careers page. So the
 * roles, the teams, the locations and the closed label are all props, and the
 * framing is written here and in the Demo where it belongs.
 *
 * **The three required fields are the three questions a reader asks, and requiring
 * them is what makes the list scannable.** What is the job, who would I be working
 * with, and where would I be. A row missing any one of them is a title with a
 * link, and a page of those is a page a reader has to open every row to evaluate,
 * which is the exact cost a list of roles exists to remove. `pattern` and
 * `summary` are optional and additive, so a company with one location and a page
 * with no room for a summary passes neither and the row renders what it has.
 *
 * **`filters` is a slot rather than a `teams` prop, and the reason is that a
 * filter is a control.** Narrowing a list to one team means deciding which roles
 * are in it and rendering fewer of them, so a `teams` prop would either filter a
 * copy the Block then no longer owns, or need the state a Block is not allowed to
 * hold. A `ReactNode` lets the caller compose its own control, wire it to a query
 * it fetches itself, and hand the narrowed list back through `roles`. The cost is
 * that the Block cannot say what happens when the list is empty, which is why
 * `empty` is a prop and not a sentence: the honest empty state for a filtered list
 * is the caller's, because only the caller knows whether the filter or the data is
 * the reason.
 *
 * A role's title is a heading one step below the section, derived rather than
 * written. A summary that runs past three sentences belongs in the posting rather
 * than in a row, because a reader scanning a list is reading titles and locations
 * and a sentence in the middle of that scan is a sentence they skip.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Careers01({
  eyebrow,
  title,
  description,
  roles,
  filters,
  empty,
  closedLabel,
  variant = 'list',
  headingLevel = 'h2',
  className,
}: Careers01Props) {
  // A role's title is a heading one step below the section that introduces the
  // set, so a reader navigating by heading finds the roles under the section that
  // introduces them rather than as a run of siblings of it.
  const Title = childLevel(headingLevel)

  if (roles.some((role) => role.closed) && !closedLabel) {
    throw new Error(
      'Careers01: a role was passed with closed set and no closedLabel, so the row would be dimmed with ' +
        'nothing on it saying why. A reader who was told a role existed and finds a faded row with no words ' +
        'learns less than a page that never showed the role. Pass the words you mean, or drop the flag.',
    )
  }

  const asCards = variant === 'cards'

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {filters ? (
        <div data-slot="careers-01-filters" className="mb-8">
          {filters}
        </div>
      ) : null}

      {roles.length === 0 ? (
        empty ? (
          <div data-slot="careers-01-empty">{empty}</div>
        ) : null
      ) : (
        <ul
          data-slot="careers-01-roles"
          data-variant={variant}
          className={cn(
            asCards ? 'grid gap-6 sm:grid-cols-2' : 'flex flex-col',
            className,
          )}
        >
          {roles.map((role) => {
            const isLink = role.href !== undefined

            return (
              <li
                key={role.id}
                data-slot="careers-01-role"
                data-closed={role.closed ? true : undefined}
                className={cn(
                  asCards && 'h-full',
                  // Dimming is opacity on the whole row rather than a colour on the
                  // title, because a closed row is still a real row that a reader
                  // can read: the words are the same words, they are just quieter,
                  // and a title in a different colour reads as a different kind of
                  // role rather than as a role that is no longer open.
                  role.closed && 'opacity-60',
                )}
              >
                <Card
                  className={cn(
                    'h-full gap-4 py-5',
                    // A row carries its title and its facts on one line, which is
                    // what a scan down the left edge needs; a card stacks them.
                    !asCards && 'md:flex-row md:items-center md:justify-between md:gap-8',
                  )}
                >
                  <CardHeader className="gap-2">
                    <CardTitle>
                      <Title>{role.title}</Title>
                    </CardTitle>
                    {role.summary ? (
                      <p className="text-muted-foreground text-pretty text-sm">{role.summary}</p>
                    ) : null}
                    <div
                      data-slot="careers-01-facts"
                      className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    >
                      <span data-slot="careers-01-team">{role.team}</span>
                      <span data-slot="careers-01-location">{role.location}</span>
                      {role.pattern ? (
                        <span data-slot="careers-01-pattern">{role.pattern}</span>
                      ) : null}
                      {role.postedAt ? (
                        <span data-slot="careers-01-posted" className="font-mono text-xs">
                          {role.postedAt}
                        </span>
                      ) : null}
                    </div>
                    {role.closed ? (
                      <span
                        data-slot="careers-01-closed-label"
                        className="text-muted-foreground text-xs font-medium"
                      >
                        {closedLabel}
                      </span>
                    ) : null}
                  </CardHeader>

                  {isLink ? (
                    <CardContent className="md:shrink-0">
                      <CtaLink href={role.href} newTab={role.newTab} variant="outline" size="sm">
                        {role.hrefLabel}
                      </CtaLink>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default Careers01
