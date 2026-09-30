import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup` applies and it is repeated here
 * rather than imported, and the reason is a boundary rather than an oversight:
 * that helper is private to its module, and exporting it would make a private
 * derivation part of the published surface of a Component in order to save six
 * lines in a Block. The cost of the repetition is stated rather than hidden: two
 * modules carry this rule, so a change to it is a change in both, and a caller
 * who needs a case the rule does not cover passes their own node.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * One person, as a team section shows them.
 *
 * Four things, and the fourth is the one that varies: a portrait may be absent
 * and a biography may be absent and a destination may be absent, and each absence
 * is a fact about what the consumer publishes rather than a state this Block has
 * to render around.
 */
export type Team01Person = {
  /**
   * A stable key for the cell, and carried on the markup as `data-person` so a
   * test can name one person rather than the first one, and so `highlight` can
   * name them.
   */
  id: string
  /**
   * The person's own name, as they publish it.
   *
   * The anchor of the cell and the card title. It is also the source of the
   * initials the portrait falls back to, so a name a consumer wants displayed
   * differently from the one it wants abbreviated is a caller problem this Block
   * has no opinion about.
   */
  name: string
  /**
   * What they do, in the words the consumer uses.
   *
   * Required, because a portrait with a name and no role says who someone is and
   * not what they are for, which on a team page is the only reason the person is
   * in it.
   */
  role: string
  /**
   * A sentence or two about the person, as a node.
   *
   * Set at the prose measure rather than at the card measure, because a
   * biography is prose and a line of text at card width is a caption. Nothing
   * here truncates it: see the Block's JSDoc for why this Block will not cut a
   * biography short.
   */
  bio?: ReactNode
  /**
   * The portrait, with the name the initials come from.
   *
   * A name rather than a string here, because an `Avatar` without a fallback is
   * an empty circle for exactly as long as the image takes to arrive and forever
   * if it never does. Omit the whole field for a person the consumer has no
   * photograph of and would rather show as a card with a name on it.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
  /**
   * Where the person goes.
   *
   * A native anchor `href`, and it makes the whole cell or the whole row the
   * destination rather than a control in the corner of it.
   */
  href?: string
  /**
   * The words naming the destination, drawn inside the link.
   *
   * Required whenever `href` is given, and not defaulted, for the reason
   * `Compliance01` states for its evidence label: a link whose name is its
   * address is announced as punctuation. Keeping the words inside the link rather
   * than replacing the link's accessible name is deliberate: the visible name of
   * the cell has to be contained in the accessible name, so a label that
   * overrode it would break the one rule a screen reader user cannot see broken.
   */
  hrefLabel?: string
}

/**
 * The props a Team01 takes.
 *
 * Every string is a prop and the Block ships none: no name, no role, no biography
 * and not one person. A team section that hardcoded any of them would put Prism
 * staff inside a consumer's product.
 */
export type Team01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The people, in the order a reader should meet them. Order is the caller's. */
  people: readonly Team01Person[]
  /**
   * `cards` draws a card per person with the portrait above the name. `list`
   * draws hairline rows with the portrait at the leading edge.
   *
   * @defaultValue 'cards'
   */
  variant?: 'cards' | 'list'
  /**
   * The ids that get a stronger border.
   *
   * Ids rather than names or positions, because a border that follows a position
   * moves to a different person after a reorder, and a border is a claim about
   * who matters on this page. The Block draws a border in `primary` and nothing
   * else: no fill, no ring, no badge, because a highlight on a marketing page
   * becomes a statement about rank and the only statement this Block can make is
   * the one the consumer asked for. An id here that is not in `people` throws,
   * because a highlight that silently does nothing is worse than one that fails.
   */
  highlight?: readonly string[]
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The checks that keep a claim about a person from being one Prism made.
 *
 * A label with no link is a word with nothing behind it, which is the same defect
 * `Status` refuses with its own `label`; a highlight naming a person who is not
 * in the set is a border drawn around nobody, which is invisible in review and
 * permanent in the rendered page. Both throw rather than degrade.
 */
function assertPeople(people: readonly Team01Person[], highlight: readonly string[] | undefined): void {
  for (const id of highlight ?? []) {
    if (!people.some((person) => person.id === id)) {
      throw new Error(
        'Team01: highlight names an id that is not in people, so the border would be drawn around nobody and the ' +
          'page would look deliberate. Name a person, or drop the id.',
      )
    }
  }

  for (const person of people) {
    if (person.href !== undefined && (person.hrefLabel === undefined || person.hrefLabel.trim() === '')) {
      throw new Error(
        'Team01: a person declares an href and no hrefLabel, so the link would be announced by its address, which ' +
          'is punctuation rather than a name. Pass the words that say where the person goes.',
      )
    }
  }
}

/**
 * A grid or a list of people: a portrait where there is one, a name, a role, a
 * biography, and a destination where the consumer publishes one.
 *
 * All four NaniSoft sites publish a team section and each one wrote it by hand:
 * a grid of portraits with a name and a role under each, on a marketing page, for
 * the people who watch a pipeline, who read a market, and who keep an estate
 * observed. Four copies of the same arrangement, four decisions about whether
 * the biography was set at card width or at the reading measure, and four
 * decisions about what a person with no photograph looks like. None of those is a
 * hard problem. The reason the section is worth a Block is the opposite of the
 * usual one, which is that it is where a marketing page is most tempted to make a
 * claim about a person: a card with a portrait and a job title under it reads as
 * an endorsement, so the arrangement this Block ships keeps the person's own name
 * as the anchor, keeps the role in the words the consumer wrote, and refuses to
 * invent either.
 *
 * **The biography is not truncated, and the caller is the one who decides how long
 * it is.** A Block that cut a biography at three lines with an ellipsis would be
 * deciding which part of a person's account of their own work matters, and it
 * would do it by cutting mid-sentence, which is the one place a truncation is
 * guaranteed to remove the qualification rather than the flattery. So the bio is
 * rendered at the measure and at whatever length the caller passed, and a caller
 * who wants three lines writes three lines. The cost is stated rather than
 * hidden: a card grid with six two-paragraph biographies is a very tall page, and
 * the fix is the caller's editing rather than this Block's ellipsis.
 *
 * **`avatar-group` is deliberately not composed here.** It is the right
 * Component for a set a page is summarising rather than showing: a row of
 * overlapping discs with a count for the rest is a statement that the set is
 * longer than the space. A team page shows every person, because the person is
 * the content, so the count would replace a person with a numeral. The one place
 * a group belongs on a team page is a related section about a project, and that
 * is a caller's row rather than this Block's job.
 *
 * **A card with a destination is a native anchor wrapping the card, so the focus
 * ring bounds the card rather than the words inside it.** That is the argument
 * `Item` states in full and it is the reason the anchor sits outside the surface
 * here. The link's words are drawn inside it as the trailing label, and the
 * label is required whenever the link is, because a link announced by its address
 * is a link a reader cannot follow. A person with no `href` is not a disabled
 * link: the card is a card.
 *
 * The card title is composed at `childLevel(headingLevel)` rather than at a fixed
 * level, so a team grid embedded one level deeper than it was written for carries
 * its titles with it. An empty set renders nothing, for the reason
 * `ProductSwitcher` and `AvatarGroup` each state: an empty frame is worse than an
 * absent one, and a team page with nobody on it has nothing to say.
 *
 * It is a server Component: no hook, no state and no client code of its own. The
 * portrait is `Avatar`, which is a client Component whose only client work is
 * measuring whether an image has loaded, so a grid of twelve people costs no
 * JavaScript from this module beyond that.
 */
export function Team01({
  eyebrow,
  title,
  description,
  people,
  variant = 'cards',
  highlight,
  headingLevel = 'h2',
  className,
}: Team01Props) {
  if (people.length === 0) return null

  assertPeople(people, highlight)

  const Title = childLevel(headingLevel)
  const marked = (id: string): boolean => highlight?.includes(id) === true

  return (
    <Section className={className}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      {variant === 'list' ? (
        <ul data-slot="team" data-variant={variant} className="flex flex-col">
          {people.map((person) => {
            const row = (
              <>
                {person.avatar === undefined ? null : (
                  <Avatar className="size-10">
                    {person.avatar.src === undefined ? null : (
                      <AvatarImage src={person.avatar.src} alt="" />
                    )}
                    <AvatarFallback>{initialsOf(person.avatar.name)}</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">{person.name}</span>
                  <span className="text-muted-foreground text-sm">{person.role}</span>
                  {person.bio === undefined ? null : (
                    <p className="text-muted-foreground max-w-measure text-pretty text-sm">
                      {person.bio}
                    </p>
                  )}
                </div>

                {person.hrefLabel === undefined ? null : (
                  <span className="text-muted-foreground shrink-0 text-sm">{person.hrefLabel}</span>
                )}
              </>
            )

            return (
              <li
                key={person.id}
                data-slot="team-item"
                data-person={person.id}
                data-highlighted={marked(person.id) ? 'true' : undefined}
                className={cn(
                  'border-border border-b first:border-t',
                  marked(person.id) ? 'border-primary border-l-2 pl-4' : '',
                )}
              >
                {person.href === undefined ? (
                  <div className="flex items-start gap-4 py-5">{row}</div>
                ) : (
                  <a
                    data-slot="team-link"
                    href={person.href}
                    className="hover:bg-accent/50 focus-visible:ring-ring flex items-start gap-4 rounded-sm px-2 py-5 transition-colors duration-fast ease-out focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    {row}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <ul
          data-slot="team"
          data-variant={variant}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {people.map((person) => {
            const card = (
              <Card className={cn('h-full gap-4 py-6', marked(person.id) ? 'border-primary' : '')}>
                <CardHeader className="gap-2.5">
                  {person.avatar === undefined ? null : (
                    <Avatar className="size-16">
                      {person.avatar.src === undefined ? null : (
                        <AvatarImage src={person.avatar.src} alt="" />
                      )}
                      <AvatarFallback>{initialsOf(person.avatar.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <CardTitle as={Title}>{person.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{person.role}</p>
                </CardHeader>

                {person.bio === undefined ? null : (
                  <CardContent className="text-muted-foreground max-w-measure text-pretty text-sm">
                    {person.bio}
                  </CardContent>
                )}

                {person.hrefLabel === undefined ? null : (
                  <CardFooter className="text-muted-foreground text-sm">
                    {person.hrefLabel}
                  </CardFooter>
                )}
              </Card>
            )

            return (
              <li
                key={person.id}
                data-slot="team-item"
                data-person={person.id}
                data-highlighted={marked(person.id) ? 'true' : undefined}
                className="h-full"
              >
                {person.href === undefined ? (
                  card
                ) : (
                  <a
                    data-slot="team-link"
                    href={person.href}
                    className="focus-visible:ring-ring block h-full rounded-xl transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    {card}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default Team01