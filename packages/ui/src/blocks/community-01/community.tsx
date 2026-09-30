import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One place a product's community is: a channel, a room, a forum, a list.
 *
 * `description` is a slot rather than a string on purpose. What a community space
 * says about itself is the caller's own copy, and in most products it is not one
 * sentence: it is a topic, or a sentence and a link, or a sentence with a count
 * the reader cares about in it. A `string` here would make the second of those
 * three impossible without putting the markup in a string, which is the failure
 * every `dangerouslySetInnerHTML` prop in this package exists to avoid.
 */
export type CommunitySpace = {
  /** A stable key for the space. */
  id: string
  /** The space's own name, as the space spells it. */
  name: string
  /** What the space is for, in the caller's own words. */
  description: ReactNode
  /**
   * How many people are in the space. A number and not a sentence, and the
   * sentence is `membersLabel`. See the Component JSDoc for the whole argument.
   */
  members?: number
  /** The words for that count, given the number. Required whenever `members` is set. */
  membersLabel?: (count: number) => string
  /**
   * How many of them are here now. A number and not a sentence, and the sentence
   * is `onlineLabel`.
   */
  online?: number
  /** The words for that count, given the number. Required whenever `online` is set. */
  onlineLabel?: (count: number) => string
  /**
   * Where the space is.
   *
   * Required, and required with `hrefLabel` rather than on its own, because a
   * space with no destination is a description of somewhere the reader cannot get
   * to. See the Component JSDoc.
   */
  href: string
  /**
   * The words on the link, and the sentence that says joining it is a thing you
   * can do. Required.
   */
  hrefLabel: string
  /**
   * The mark beside the name.
   *
   * A Lucide component, and the type says so on purpose: Lucide is this system's
   * icon lane, and the Block draws the tile, the position and the rule around it.
   * A space whose real identity is an uploaded avatar is application content that
   * this Block has no slot for, and the answer there is the same one
   * `Integration01` gives its mark: licensed artwork is the consumer's to supply,
   * and a set of marks held in a design system is a set of marks that will be
   * wrong within a year.
   */
  icon?: LucideIcon
}

/**
 * The props a Community01 takes.
 *
 * Every string and every number is a prop and the Block ships none. There is no
 * channel list, no member count, no default sentence for a space and no default
 * words on the join control, and the absence of the channel list is the sharpest
 * version of the rule: where a product's community is, and what it is called, is
 * that product's own fact and it changes with the platform underneath it.
 */
export type Community01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The spaces, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which one to join first.
   */
  spaces: readonly CommunitySpace[]
  /**
   * How the spaces are drawn. @defaultValue 'cards'
   *
   * `cards` is the default because a space is four things a reader takes
   * together: what it is called, what it is for, how many people are in it, and
   * how to get there. `rows` is for a long list or a narrow column, and it puts
   * the two readings and the link on one line, which is what a list of ten
   * channels reads like rather than a grid of ten.
   */
  variant?: 'cards' | 'rows'
  /**
   * What the Block renders in place of the list when there are no spaces.
   *
   * A slot rather than a string, and the reason is the same as everywhere else in
   * this package: the honest sentence is the consumer's, and "there is nowhere to
   * ask yet" and "nobody has joined" are not variants of one another. Omit it and
   * a list with no spaces renders nothing at all.
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
 * Where a product's community is: a set of channels or spaces, each with a name, a
 * description, a member or activity reading, and a way in.
 *
 * **This is the NaniSoft reading of a community section, and the translation is
 * worth stating because the upstream pattern is a list of avatars and this is not
 * that.** A pipeline that runs has an on-call rotation, a market that is captured
 * has a watchlist, and an estate that is observed has an operators channel. Those
 * three are the same object: a named place, a sentence about what belongs in it,
 * a reading of how many people are in it right now, and a link that gets you
 * there. What the upstream pattern adds is a wall of member faces, and a wall of
 * faces is a claim about who a product's users are, drawn from an avatar a
 * consumer uploaded, in a component that has no way to know whether those faces
 * consented to being on a marketing page. So the faces are not here, the names
 * and the readings and the link are, and a consumer who wants faces next to a
 * space composes them into `description`, which is a slot for exactly that reason.
 *
 * **The counts are numbers and the labels are functions, and the Block throws
 * without them.** "1,204 members" and "204 online" are sentences, the Block cannot
 * know which, and the reason it cannot know is that they are not two formats of
 * one fact. A member count is a total and an online count is a moment, and a
 * reader who has just been shown the second has no way to guess which of the two
 * a bare figure is when it appears without a word. Every language words them
 * differently too, including the ones that put the count after the noun and the
 * ones that inflect it, so a default here would be an English sentence in every
 * consumer's product with no prop to change it. And a bare numeral beside a
 * channel name tells a screen reader nothing at all about what it counts: "204
 * support" is a support queue with two hundred and four items in it to a reader
 * who cannot see the context, and a number without a noun is a number.
 *
 * **`href` requires `hrefLabel`, and the reason is that a space name is a name.**
 * The sentence that says joining a space is a thing you can do is the caller's,
 * because "Join", "Open", "Read the channel", "Introduce yourself" and "Get help"
 * are five different offers and the one that is right depends on what the space
 * is for and on whether the reader has to fill in a form first. A Block that
 * wrote one of them would be writing an offer on the consumer's behalf, in
 * English, in every deployment. So the Block throws rather than shipping a link
 * whose label is its own, and a caller who has a channel with no join action at
 * all is describing something that is not a place a reader can go, which is a
 * different component.
 *
 * **The link is a `CtaLink` at the foot of the card, not a link on the whole
 * card.** A whole card as an anchor is the arrangement `ProductGrid01` uses and it
 * is right there, because a product row is one destination and the whole row is it.
 * A community space is a description with a destination attached, and making the
 * description part of the link's accessible name would hand a screen reader a
 * sentence ending in a destination for a card whose only actionable part is a
 * control at the bottom. It would also put a heading inside an anchor, which is
 * the arrangement that makes "jump to heading" land on something the reader then
 * has to activate.
 *
 * **The space names are headings, and the level is derived rather than written.**
 * A community list is a set of independent named things a reader may want to jump
 * to, and a reader navigating by heading is looking for exactly the one they
 * want. So each name is a heading at `childLevel(headingLevel)`, which means a
 * Block embedded one level deeper carries its names with it rather than putting
 * eight `h3`s under an `h3`.
 *
 * **The variants are one set of data and two arrangements.** The same space
 * produces the same name, the same description, the same two readings and the same
 * link in either form, and only the frame changes, so a consumer who switches
 * `variant` at render time gets one list in the accessibility tree rather than
 * two.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * join link is a native anchor, so the destination is real and the whole section
 * costs a consumer nothing in client JavaScript.
 */
export function Community01({
  eyebrow,
  title,
  description,
  spaces,
  variant = 'cards',
  empty,
  headingLevel = 'h2',
  className,
}: Community01Props) {
  for (const space of spaces) {
    if (!space.hrefLabel) {
      throw new Error(
        'Community01: a space carries an href with no hrefLabel, so the control that gets a reader into ' +
          'it would be a link announced by its destination alone. A space name is a name, and the ' +
          'sentence saying that joining the space is a thing you can do belongs to the caller.',
      )
    }
    if (space.members !== undefined && !space.membersLabel) {
      throw new Error(
        'Community01: a space carries a member count with no membersLabel, so the reading would be a bare ' +
          'numeral beside a channel name, which tells a screen reader nothing about what it counts. Pass ' +
          'the words for the count in your own language.',
      )
    }
    if (space.online !== undefined && !space.onlineLabel) {
      throw new Error(
        'Community01: a space carries an online count with no onlineLabel, so the reading would be a bare ' +
          'numeral beside a channel name, and a reader could not tell a moment from a total. Pass the ' +
          'words for the count in your own language.',
      )
    }
  }

  if (spaces.length === 0) {
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
        <div data-slot="community-empty" className="text-muted-foreground text-pretty text-sm">
          {empty}
        </div>
      </Section>
    )
  }

  // One step below the section, and not a literal, so the names follow the
  // section when the Block is composed one level deeper than it was written for.
  const Title = childLevel(headingLevel)

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

      {variant === 'cards' ? (
        <ul
          data-slot="community-cards"
          className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}
        >
          {spaces.map((space) => (
            <li key={space.id} data-slot="community-card" className="flex">
              <Card className="w-full gap-4">
                <CardHeader className="gap-3">
                  <span
                    aria-hidden
                    data-slot="community-icon"
                    className="border-border bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border"
                  >
                    {space.icon === undefined ? null : <space.icon className="size-4" />}
                  </span>
                  <Title data-slot="community-name" className="text-base">
                    {space.name}
                  </Title>
                </CardHeader>
                <CardContent className="text-muted-foreground text-pretty text-sm">
                  {space.description}
                </CardContent>
                {space.members === undefined && space.online === undefined ? null : (
                  <div
                    data-slot="community-readings"
                    className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                  >
                    {space.members === undefined ? null : (
                      <span data-slot="community-members">
                        {space.membersLabel?.(space.members)}
                      </span>
                    )}
                    {space.online === undefined ? null : (
                      <span data-slot="community-online">{space.onlineLabel?.(space.online)}</span>
                    )}
                  </div>
                )}
                <CardFooter>
                  <CtaLink href={space.href} size="sm" variant="outline">
                    {space.hrefLabel}
                  </CtaLink>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ul data-slot="community-rows" className={cn('flex flex-col', className)}>
          {spaces.map((space) => (
            <li
              key={space.id}
              data-slot="community-row"
              className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-b py-4 first:border-t"
            >
              <span
                aria-hidden
                data-slot="community-icon"
                className="border-border bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border"
              >
                {space.icon === undefined ? null : <space.icon className="size-4" />}
              </span>
              <Title data-slot="community-name" className="text-sm">
                {space.name}
              </Title>
              <span
                data-slot="community-description"
                className="text-muted-foreground min-w-0 flex-1 text-pretty text-sm"
              >
                {space.description}
              </span>
              {space.members === undefined ? null : (
                <span data-slot="community-members" className="text-muted-foreground text-xs">
                  {space.membersLabel?.(space.members)}
                </span>
              )}
              {space.online === undefined ? null : (
                <span data-slot="community-online" className="text-muted-foreground text-xs">
                  {space.onlineLabel?.(space.online)}
                </span>
              )}
              <CtaLink href={space.href} size="sm" variant="ghost">
                {space.hrefLabel}
              </CtaLink>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

export default Community01
