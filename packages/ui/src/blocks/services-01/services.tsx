import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The link arm and the no-link arm of one engagement, as a union.
 *
 * The same agreement `CaseStudies01`, `Careers01` and `Industries01` make, for the
 * same reason: the words that say what following a link does are a claim about
 * the destination, so they belong to whoever wrote it.
 */
export type ServiceLink = {
  /** Where the engagement's own page is. Present makes the card carry a link. */
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
 * One engagement or capability: what it is called, what it does, what the reader
 * gets, and what it is for.
 *
 * `deliverables` is a `string[]` and not a node, and the reason is that a
 * deliverables list is a set of short noun phrases the reader is checking off
 * against their own situation. A node would let a caller put a paragraph in one
 * entry, and one paragraph in a five-item list is a list the reader stops
 * scanning. The order is the caller's because it is a claim about what arrives
 * first, and an empty array renders nothing at all rather than an empty heading
 * and an empty list.
 *
 * `outcome` is separate from `body` for the same reason the deliverables are
 * separate: a body says what the work is and an outcome says what came of it, and
 * a reader comparing two engagements needs the second without reading past the
 * first. `icon` is optional and additive, and a card that reserves room for a mark
 * that is not there is a hole.
 */
export type Service = {
  /** A stable key for the engagement. */
  id: string
  /** What the engagement is called. */
  title: string
  /** What the work is, in a few sentences. */
  body: ReactNode
  /** What the reader gets, as short noun phrases. Omit it, or pass an empty array. */
  deliverables?: string[]
  /** What it is for, stated as an effect rather than as a feature. */
  outcome?: ReactNode
  /** The engagement's mark, from the icon set this system uses. */
  icon?: LucideIcon
} & ServiceLink

/**
 * The props a Services01 takes.
 *
 * Every string, every deliverable and every outcome is a prop and the Block ships
 * none: no engagement, no ordinal, no deliverable and no default set of services.
 * A list that hardcoded its engagements would hand every consumer a menu of
 * somebody else's work.
 */
export type Services01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a set composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The engagements, in the order a reader should meet them. Order is the
   * caller's, and it is load-bearing twice over: it is the order the work is
   * offered in, and in the `numbered` variant it is the order the ordinals are
   * derived from.
   */
  services: Service[]
  /**
   * Whether each engagement is numbered or not.
   *
   * `numbered` is opt-in for the reason `FeatureGrid01` states for the same prop
   * and for the same claim, read here from the other side: a number on a card is
   * a claim that the set is a sequence. Engagements and capabilities are usually
   * a set, and a set with numbers on it is read as a set with an order, which
   * makes a reader who disagrees with the order argue with the numbering rather
   * than with the content. So the numbers are the caller's decision.
   */
  variant?: 'numbered' | 'plain'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * What the product does, as a set of engagements: a title, a body, a list of what
 * the reader gets, and an outcome, optionally numbered.
 *
 * **The NaniSoft framing is in this JSDoc and in the Demo, and nowhere in the
 * Block.** What these engagements are is the work of a system that runs: read the
 * estate, capture the market as it moves, decide what changed, and hand the
 * finding to an agent that can act on it. That is a sequence, which is why the
 * `numbered` variant exists and why the Demo uses it, and it is four `title`s,
 * four `body`s and four deliverables lists at the call site. A Block that shipped
 * them would put one company's way of working into every consumer's services page,
 * and a services page is the page a reader is most likely to believe.
 *
 * **The ordinal is derived from the position, never taken from the item, and that
 * is the whole of why it is safe to show at all.** A list that carried its own
 * numbers is a list whose numbers can disagree with its order after a sort, a
 * filter, a CMS re-publish or an insertion, and nothing in the rendering would
 * catch it: the cards would read `03, 01, 02`. Rendering from the index means the
 * numbers and the order cannot come apart, because they are the same value. The
 * cost of deriving it is that a caller who wants the sequence to start at zero, or
 * to skip a retired engagement, cannot, and the honest way to express that is to
 * filter the list before it reaches the Block, which is a decision a consumer can
 * see in its own data rather than one buried in a `number` field.
 *
 * **It is opt-in because a number on a card claims the set is a sequence, and a
 * set of capabilities usually is not.** An engagement a reader buys is a sequence
 * they can follow, and a page listing four capabilities is a set they are
 * comparing. Numbering the second makes a reader look for the one they are missing
 * and for a reason the numbering does not carry. So `plain` is the default, the
 * numbers are the caller's decision, and the mono face is the same annotation the
 * rest of this system uses for a machine value, which is what a position in a
 * list is.
 *
 * **`deliverables` renders as a real list, and an empty array renders nothing.**
 * A `<ul>` rather than a stack of paragraphs, because a reader checks the set off
 * against their own situation and a list is what can be checked off; the marker is
 * suppressed so the list reads as a set of terms under a heading rather than as
 * bullets competing with the body above it. The empty case is worth stating
 * because the alternative is a heading with nothing under it: an array of zero is a
 * caller who has nothing to promise, and the honest rendering of that is absence
 * rather than a titled gap.
 *
 * **The body, the deliverables and the outcome are three elements and not one,
 * because a reader comparing two engagements reads them in that order and at
 * different speeds.** The body says what the work is, the deliverables say what
 * arrives, and the outcome says what it is for. Merging them gives a card whose
 * last paragraph has to carry the effect as well as the description, and a reader
 * scanning for the effect has to read the description to find it. The cost of
 * three is that a caller with one paragraph to say has to choose which element it
 * is, and choosing is the right pressure.
 *
 * A grid of engagements is three across, so a card holds a title, a body of two or
 * three lines, a list and one line of outcome. A card that needs a fifth element
 * is a page, and `PageHeader01` and this Block composed together is the honest
 * arrangement for it.
 *
 * A service's title is a heading one step below the section, derived rather than
 * written, so a Block embedded one level deeper carries its card titles with it.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Services01({
  eyebrow,
  title,
  description,
  services,
  variant = 'plain',
  headingLevel = 'h2',
  className,
}: Services01Props) {
  // A service's title is a heading one step below the section that introduces the
  // set, so four titles under one heading read as four children of it rather than
  // as four competing sections.
  const Title = childLevel(headingLevel)
  const numbered = variant === 'numbered'

  return (
    <Section>
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

      <ul
        data-slot="services-01"
        data-variant={variant}
        className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}
      >
        {services.map((service, index) => (
          <li key={service.id} data-slot="services-01-item" className="h-full">
            <Card className="h-full gap-4 py-6">
              <CardHeader>
                {numbered ? (
                  <span
                    data-slot="services-01-ordinal"
                    className="text-muted-foreground font-mono text-xs tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ) : null}
                {service.icon ? (
                  <span
                    data-slot="services-01-icon"
                    className="bg-accent text-accent-foreground mb-2 flex size-10 items-center justify-center rounded-lg"
                  >
                    <service.icon className="size-5" />
                  </span>
                ) : null}
                <CardTitle>
                  <Title>{service.title}</Title>
                </CardTitle>
                <p className="text-muted-foreground text-pretty text-sm">{service.body}</p>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                {service.deliverables && service.deliverables.length > 0 ? (
                  <ul
                    data-slot="services-01-deliverables"
                    // The markers are suppressed on purpose. A deliverables list is
                    // a set of terms under the engagement, and the reader is
                    // checking it against their own situation rather than reading
                    // a bulleted argument, so the bullets would compete with the
                    // body above them for the same attention.
                    className="flex flex-col gap-1.5 text-sm [&>li]:list-none"
                  >
                    {service.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        data-slot="services-01-deliverable"
                        className="text-muted-foreground text-pretty"
                      >
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {service.outcome ? (
                  <p
                    data-slot="services-01-outcome"
                    className="border-border border-t pt-4 text-pretty text-sm font-medium"
                  >
                    {service.outcome}
                  </p>
                ) : null}

                {service.href !== undefined ? (
                  <CtaLink
                    href={service.href}
                    newTab={service.newTab}
                    variant="ghost"
                    size="sm"
                    className="self-start"
                  >
                    {service.hrefLabel}
                  </CtaLink>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Services01
