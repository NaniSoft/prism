import type { ReactNode } from 'react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The four states an integration can be in, and the tone each one draws.
 *
 * The four are the four things a reader can be told about a connection, and the
 * order is the order of the reader's question: it is connected, it could be
 * connected, it will be, or it cannot be. `connected` is `success` because it is
 * the one that means the work is done. `available` is `info`, the contract's cool
 * role that means not an alarm, because available is the ordinary state of a
 * product's integration list and a list of eleven rows should not read as eleven
 * warnings. `coming-soon` is `warning` because it is the one state a reader has
 * to act on or accept, and `unavailable` is `neutral` because a capability that
 * is not offered is not in dispute and must not be drawn as though it were.
 */
export type IntegrationState = 'connected' | 'available' | 'coming-soon' | 'unavailable'

/**
 * The tone each state is drawn in, from the semantic contract and no other.
 */
const STATE_TONE: Record<IntegrationState, StatusTone> = {
  connected: 'success',
  available: 'info',
  'coming-soon': 'warning',
  unavailable: 'neutral',
}

/**
 * One system a product connects to: a mark, a name, what it does, a state, and
 * where to go next.
 */
export type Integration = {
  /** A stable key for the row or the card. */
  id: string
  /** The system's own name, as the system spells it. */
  name: string
  /**
   * One line about what connecting it gets a reader.
   *
   * A capability and not a description. "Syncs contacts both ways" is a fact a
   * reader can check by trying it; "a powerful integration for your team" is a
   * sentence about the product, and a line of it on every card is a list of
   * sentences.
   */
  capability: string
  /**
   * Where the integration stands. Omit it and the card draws no state at all,
   * which is the honest state for a list where the reader already knows.
   */
  state?: IntegrationState
  /**
   * The system's own mark, composed by the caller.
   *
   * A slot, and never a set Prism ships. See the Component JSDoc for the whole
   * argument, which is about licensing and about a year.
   */
  mark?: ReactNode
  /** Where the integration goes. Rendered as a native anchor. */
  href?: string
  /** The words on that link. Required whenever `href` is set. */
  hrefLabel?: string
  /** Where the documentation is. Rendered as a second, quieter link. */
  docsHref?: string
  /** The words on that link. Required whenever `docsHref` is set. */
  docsLabel?: string
  /**
   * The group this integration belongs in, for `groupBy="category"`. Omit it and
   * the integration is not grouped, which is the same state as passing
   * `groupBy="none"`.
   */
  category?: string
}

/**
 * One named group of integrations, in the order the caller first named them.
 *
 * A group with no `name` is the one that holds the integrations the caller did
 * not put anywhere, and it is rendered last with no title over it, because a row
 * that quietly disappears from a list is worse than an untitled one.
 */
type IntegrationGroup = { id: string; name?: string; items: Integration[] }

/**
 * The caller's integrations, gathered into the groups they named.
 *
 * First appearance sets the order rather than an alphabet, on the same argument
 * every list in this package takes: order is a claim about what matters first,
 * and an alphabetically sorted set of categories is a claim this Block would be
 * making for the caller about a taxonomy the Block has never seen. A category
 * whose name was passed by two rows that are not adjacent is one group, because
 * grouping by name is the only thing that can be right, and a group that split on
 * position would put the same label on two panels.
 */
function groupOf(integrations: readonly Integration[]): IntegrationGroup[] {
  const groups: IntegrationGroup[] = []
  const byName = new Map<string, IntegrationGroup>()

  for (const integration of integrations) {
    if (integration.category === undefined) continue
    const existing = byName.get(integration.category)
    if (existing !== undefined) {
      existing.items.push(integration)
      continue
    }
    const group: IntegrationGroup = {
      id: integration.category,
      name: integration.category,
      items: [integration],
    }
    byName.set(integration.category, group)
    groups.push(group)
  }

  const loose = integrations.filter((integration) => integration.category === undefined)
  if (loose.length > 0) {
    groups.push({ id: 'ungrouped', items: loose })
  }

  return groups
}

/**
 * The props an Integration01 takes.
 *
 * Every string is a prop and the Block ships none. There is no integration list
 * in this package, no vendor names, no capabilities, no state words and no marks,
 * and the absence of the vendor names is the one worth defending in a sentence:
 * the set of systems a product connects to is that product's own fact, it changes
 * with its commercial agreements, and a Block that shipped one would install a
 * list into every consumer's page.
 */
export type Integration01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The integrations, in the order a reader should meet them. Order is the
   * caller's because it is a claim about what matters first.
   */
  integrations: readonly Integration[]
  /**
   * The words for a state, given the state and the integration it belongs to.
   *
   * Required, and required as a function rather than as a record of four strings
   * because the honest sentence is usually per integration. See the Component
   * JSDoc for why a state name in English is the defect this whole prop exists to
   * end.
   */
  stateLabel: (state: IntegrationState, name: string) => string
  /**
   * Whether the integrations are gathered into the groups they named.
   *
   * @defaultValue 'none'
   *
   * `category` renders one titled group per named category, in the order the
   * caller first named it. A group is a title and a rule rather than a bordered
   * surface, because a bordered panel around a grid of bordered cards is a card
   * inside a card, and the only thing the grouping has to say is "these belong
   * together".
   */
  groupBy?: 'none' | 'category'
  /**
   * How the integrations are drawn. @defaultValue 'cards'
   *
   * `cards` is the default because an integration's mark, its name, its one line
   * and its state are four things a reader takes together, and a card is the shape
   * that holds four things without a reader having to hold them in their head
   * across a row boundary. `rows` is for a long list, or a narrow column, or a
   * set whose states are the point and whose marks are not: a row puts the state
   * and the two links on one line, which is what a list of eleven reads like
   * rather than a grid of eleven.
   */
  variant?: 'cards' | 'rows'
  /**
   * What the Block renders in place of the list when there are no integrations.
   *
   * A slot rather than a string, and the reason is that the two honest answers
   * are opposites. "You are not connected to anything yet" is a statement about
   * the reader, and "This workspace has no integrations available" is a statement
   * about the product, and they are not variants of one sentence. Omit it and a
   * list with no rows renders nothing at all.
   */
  empty?: ReactNode
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The systems a product connects to, as a grid of cards: a mark, a name, one line
 * about what it does, a state, and a way in.
 *
 * **`coming-soon` is a first-class state, and this Block is the honest home for
 * it.** That is the whole reason the state list is four rather than two, and the
 * reason is a defect the two-state version makes every consumer commit. A design
 * system that offers only connected and available leaves a consumer with exactly
 * one way to render a capability the product has announced and not shipped, and
 * the one way on offer is to draw it as `available`. So the reader is told a
 * system is available when it is not, on a card that looks like every other card
 * on the page, and the correction arrives later as a changelog entry or not at
 * all. Shipping the fourth option is what makes the third expressible: once a
 * state exists for it, a consumer renders the truth, and the truth is that eleven
 * systems are available, two are connected, one is coming, and one is not offered
 * in this region. A Block that refused the state would not have prevented that
 * claim, it would only have moved it somewhere a consumer could not see it.
 *
 * **`stateLabel` is required, and it is a function rather than a record of four
 * strings because a state name in a consumer's integration list is exactly the
 * defect the copy gate was written to end.** A `Status` is a dot in a tone and a
 * sentence beside it, and every part of this package that has a state has ended
 * up needing the sentence from the caller: `StatusLedger01` requires
 * `statusLabel`, `InstrumentPanel01` throws on a state with no words, and
 * `MetricProps.deltaFormat` exists because a number has no unit. A map of four
 * English strings would have looked tidier and would have put "Coming soon" into
 * every consumer's product in every language, with no prop to change it. The
 * function rather than a record because the honest sentence is usually per
 * integration: "Connected as the workspace owner", "Needs an admin to approve it",
 * "Not offered in this region", and one of those is wrong for a different product
 * than the other three.
 *
 * **The mark is a slot, and Prism ships no vendor marks at all.** The reason is
 * two problems rather than one. The first is licensing: a vendor's mark is a
 * licensed asset with terms attached, and a design system that bundles a set of
 * them takes on a set of obligations it cannot honour across every consumer's
 * page, in a product it knows nothing about. The second is the one that would
 * have sunk it anyway: a set of marks in a design system is a set of marks that
 * will be wrong within a year, because a vendor rebrands and the design system
 * ships a version, and the consumer has to wait for a design system release to
 * correct a fact about a third party. Meanwhile Prism's icon lane is Lucide,
 * which is a general-purpose open set rather than a set of brand identities, and
 * the honest answer for a product that wants its own integrations to look like its
 * own is that the consumer supplies the artwork and the Block supplies the tile,
 * the position and the rule. The mark is `aria-hidden`, because the name beside it
 * is the identity and a screen reader announcing a logo's file name tells a reader
 * nothing the name has not already said.
 *
 * **The two links are separate, and both need their words.** A product that has
 * shipped an integration and a product that has documented one are two different
 * destinations, and a card that collapsed them into one link would have had to
 * choose which one the reader wanted, on behalf of every consumer. The Block
 * throws when one of them arrives without its words, for the same reason it throws
 * elsewhere: a link announced by its destination alone is a link a screen reader
 * user cannot tell from the neighbouring one, and a name is a name while the
 * sentence saying that following it is a thing you can do is the caller's.
 *
 * **`groupBy="category"` derives the card level from the group level rather than
 * the section level, which is the detail that keeps the outline honest.** Three
 * headings are in play when a list is grouped: the section's own, one per group,
 * and one per card. The group title is `childLevel(headingLevel)`, and the card
 * titles are one step below whatever the group level is, so a grouped list read at
 * `h2` has groups at `h3` and cards at `h4`, and the same Block read at `h3` has
 * groups at `h4` and cards at `h5`. An ungrouped list skips the middle step, which
 * is why the card level is derived from the group level and the group level is
 * derived from the heading rather than both being derived from the heading: a card
 * title that skipped a level would be a sibling of its own group.
 *
 * **The variants are one set of data and two arrangements, not two lists.** A
 * consumer who switches `variant` at render time gets the same integrations in the
 * same order, and the cards and the rows share the name, the capability, the state
 * and the two links; only the frame changes. Two trees would have meant the
 * integration list twice in the accessibility tree and twice for a crawler.
 *
 * **A grouped list still shows the integrations the caller did not group.** They
 * are drawn last, under no title, and the count is on the list element as
 * `data-ungrouped`, so a row that quietly vanished from a list the caller built is
 * a fact in the markup rather than a mystery on the page. Dropping them was the
 * obvious simplification and it is the one that produces the worst support
 * question a component can produce: a reader who counted eleven and found ten.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * two links are native anchors, so the destinations are real and the cards cost a
 * consumer nothing in client JavaScript.
 */
export function Integration01({
  eyebrow,
  title,
  description,
  integrations,
  stateLabel,
  groupBy = 'none',
  variant = 'cards',
  empty,
  headingLevel = 'h2',
  className,
}: Integration01Props) {
  for (const integration of integrations) {
    if (integration.href !== undefined && !integration.hrefLabel) {
      throw new Error(
        'Integration01: an integration carries an href with no hrefLabel, so the link would be announced ' +
          'by its destination alone. A system name is a name, and the sentence saying that following the ' +
          'link is a thing you can do belongs to the caller.',
      )
    }
    if (integration.docsHref !== undefined && !integration.docsLabel) {
      throw new Error(
        'Integration01: an integration carries a docsHref with no docsLabel, so the second link would be ' +
          'announced by its destination alone, and a reader would hear two paths with one name between ' +
          'them.',
      )
    }
  }

  if (integrations.length === 0) {
    if (empty === undefined) return null
    return (
      <Section className={className}>
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div data-slot="integration-empty" className="text-muted-foreground text-pretty text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  // Three heading levels when the list is grouped and two when it is not, and the
  // card level is derived from the level above it rather than from the section, so
  // a card is never a sibling of the group that introduces it.
  const groupLevel = childLevel(headingLevel)
  const cardLevel = groupBy === 'category' ? childLevel(groupLevel) : groupLevel
  const GroupTitle = groupLevel
  const CardTitleAt = cardLevel

  const groups: IntegrationGroup[] =
    groupBy === 'category' ? groupOf(integrations) : [{ id: 'all', items: [...integrations] }]

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

      <div
        data-slot="integration-list"
        data-ungrouped={
          groupBy === 'category' && integrations.some((one) => one.category === undefined)
            ? integrations.filter((one) => one.category === undefined).length
            : undefined
        }
        className={cn('flex flex-col gap-10', className)}
      >
        {groups.map((group) => {
          const items = group.items

          return (
            <section
              key={group.id}
              data-slot="integration-group"
              data-group={group.name}
              className="flex flex-col gap-5"
            >
              {group.name === undefined ? null : (
                <GroupTitle
                  data-slot="integration-group-title"
                  className="border-border text-muted-foreground border-t pt-4 text-sm font-semibold tracking-wide uppercase"
                >
                  {group.name}
                </GroupTitle>
              )}

              {variant === 'cards' ? (
                <ul data-slot="integration-cards" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((integration) => (
                    <li key={integration.id} data-slot="integration-card" className="flex">
                      <Card className="w-full gap-4">
                        <CardHeader className="gap-3">
                          {integration.mark === undefined ? null : (
                            <span
                              aria-hidden
                              data-slot="integration-mark"
                              className="border-border bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-5"
                            >
                              {integration.mark}
                            </span>
                          )}
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <CardTitle as={CardTitleAt} data-slot="integration-name">
                              {integration.name}
                            </CardTitle>
                            {integration.state === undefined ? null : (
                              <Status
                                data-slot="integration-state"
                                size="sm"
                                tone={STATE_TONE[integration.state]}
                                label={stateLabel(integration.state, integration.name)}
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-pretty text-sm">
                          {integration.capability}
                        </CardContent>
                        {integration.href === undefined && integration.docsHref === undefined ? null : (
                          <CardFooter className="flex flex-wrap items-center gap-2">
                            {integration.href === undefined ? null : (
                              <CtaLink href={integration.href} size="sm" variant="outline">
                                {integration.hrefLabel}
                              </CtaLink>
                            )}
                            {integration.docsHref === undefined ? null : (
                              <CtaLink href={integration.docsHref} size="sm" variant="ghost">
                                {integration.docsLabel}
                              </CtaLink>
                            )}
                          </CardFooter>
                        )}
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul data-slot="integration-rows" className="flex flex-col">
                  {items.map((integration) => (
                    <li
                      key={integration.id}
                      data-slot="integration-row"
                      className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-b py-4 first:border-t"
                    >
                      {integration.mark === undefined ? null : (
                        <span
                          aria-hidden
                          data-slot="integration-mark"
                          className="border-border bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4"
                        >
                          {integration.mark}
                        </span>
                      )}
                      <span data-slot="integration-name" className="text-sm font-semibold">
                        {integration.name}
                      </span>
                      <span
                        data-slot="integration-capability"
                        className="text-muted-foreground min-w-0 flex-1 text-pretty text-sm"
                      >
                        {integration.capability}
                      </span>
                      {integration.state === undefined ? null : (
                        <Status
                          data-slot="integration-state"
                          size="sm"
                          tone={STATE_TONE[integration.state]}
                          label={stateLabel(integration.state, integration.name)}
                        />
                      )}
                      {integration.href === undefined ? null : (
                        <CtaLink href={integration.href} size="sm" variant="ghost">
                          {integration.hrefLabel}
                        </CtaLink>
                      )}
                      {integration.docsHref === undefined ? null : (
                        <CtaLink href={integration.docsHref} size="sm" variant="ghost">
                          {integration.docsLabel}
                        </CtaLink>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </Section>
  )
}

export default Integration01
