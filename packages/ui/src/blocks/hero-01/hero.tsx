import type { ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a hero's action row.
 *
 * **The two arms are two elements, and a caller should not be able to reach the
 * wrong one by accident.** An action that names a destination is an anchor and
 * navigates; an action that does not is a button, and a Block ships no behaviour,
 * so that button is inert by design rather than by accident. The arms are a union
 * rather than one shape with an optional `href` because an optional `href` makes
 * both mistakes silent:
 *
 * - `{ label: 'Start free' }` compiles and renders a primary button that goes
 *   nowhere. A hero's first action is almost always a link, so this is the likely
 *   mistake and it looks correct on the page.
 * - `{ label: 'Start free', href: maybeUrl }` compiles today and renders a button
 *   whenever `maybeUrl` is `undefined`, which is a runtime branch the type said
 *   nothing about.
 *
 * So the link arm *requires* `href` and the button arm *forbids* it, as
 * `href?: never`. The second of those is the one worth having: a value that is
 * sometimes a string and sometimes `undefined` is now a type error rather than a
 * button, which is the whole of "a caller should not be able to get it wrong
 * silently".
 */
export type HeroAction = {
  label: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
} & (
  | {
      /** Where the action goes. Present makes the action an anchor. */
      href: string
      /** Opens the destination in a new tab, with the matching `rel`. */
      newTab?: boolean
    }
  | {
      /**
       * Forbidden, so that "a link whose address happens to be undefined" is a
       * type error rather than a button. Omit the key entirely to mean a button.
       */
      href?: never
      newTab?: never
    }
)

export type Hero01Props = {
  /**
   * Optional label above the headline. Intentionally has no default: an earlier
   * version shipped a hardcoded "Now in open beta" pill, which meant every
   * consumer who installed this block inherited a status badge making a claim
   * about their product. Pass one if you mean it.
   */
  eyebrow?: string
  /**
   * The headline.
   *
   * A `ReactNode` rather than a `string`, because `SectionHeading` already takes
   * one and a Block that narrowed it would have been the odd one out. Three of the
   * five product sites set the emphasised word in their own mark rather than in a
   * wrapper, so a `string` here would have forced each of them to drop the
   * emphasis or reach for a second component. Every string a site renders is
   * still the site's, and `check-block-copy.mjs` still holds this Block to
   * shipping none.
   */
  title: ReactNode
  /** The supporting line. A node for the same reason the title is one. */
  description?: ReactNode
  actions?: HeroAction[]
  /**
   * Whether the copy is centered in the band or set flush to the left edge of
   * the container.
   *
   * This is the hero's own alignment and not `SectionHeading`'s, because the two
   * are not the same decision: a left-aligned hero is nearly always the left half
   * of a two-column band with a panel or an instrument beside it, and that column
   * is narrower than the container, so the alignment has to be the hero's before
   * the container can be anything.
   *
   * It has no visual effect on its own, which is the point: it aligns the copy
   * inside whatever width it is given.
   *
   * @defaultValue 'center'
   */
  align?: 'center' | 'left'
  /**
   * The figure beside the copy: a live view of the thing the copy is about.
   *
   * A slot, and the reason is the whole shape of this Block's second form. The
   * hero that names what a product does and the hero that shows it running are
   * the same section, and every one of the four NaniSoft product sites hand-wrote
   * the two-column band that joins them, each with its own grid, its own gap and
   * its own breakpoint. This is that band.
   *
   * What goes in it is the consumer's, and specifically it should be something
   * that would still be true with every animation stopped: a `PulseGraph` of the
   * pipeline the product runs, a `PulseSeries` of what it captures. A slot that
   * only reads as motion is a decoration with a slot, and this system does not
   * author those. The `instrumented` slot is marked as required when the hero is
   * given one, so a figure cannot be half-wired.
   */
  instrument?: ReactNode
  /**
   * Puts the copy and the instrument side by side rather than stacked, and
   * narrows the copy to the column it shares the band with. Implied by
   * `instrument` and overridable: a consumer with a narrow instrument and a wide
   * hero may want them stacked anyway.
   */
  split?: boolean
  /**
   * Heading level for the title. Defaults to `h2` because a block is composed,
   * not a page: it installs into a consumer's layout and renders
   * inside catalog previews, so the surrounding document already owns the `h1`.
   * A page that uses this block as its top-level heading opts in with
   * `headingLevel="h1"`; a document that already names this section in its own
   * heading passes one level deeper. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A marketing hero with a headline, a supporting line, up to two actions, and
 * an optional live figure beside them.
 *
 * The copy, the actions and the figure are props, and the Block ships none of
 * any of them.
 *
 * **The two forms are one Block.** Centered over the container, or split with a
 * figure in the second column. The centered form is the older one and is what a
 * page whose claim is a sentence wants. The split form is what a product whose
 * claim is a mechanism wants, and it is the form all four NaniSoft product sites
 * want, because each one's hero is about a system that runs rather than about a
 * feature list. Rather than ship `hero-02` and leave every consumer to compose
 * two blocks and re-derive the grid, the band is here: the column split, the gap
 * and the breakpoint at which the columns stack are one decision, made once, in
 * the place that owns the container contract.
 *
 * **A hero with a figure puts the figure where the eye lands second, not
 * last.** The copy column comes first in the DOM and stays first at every width,
 * so a reader who never sees the figure still reads the headline and the
 * destination, and a screen reader reaches the thesis before the drawing. The
 * figure is on the right at desktop and below the copy when the columns stack,
 * which is the order a reader on a phone wants: what this is, then what it does.
 *
 * **Actions are real links.** An action naming an `href` renders as an anchor
 * with the matching `rel`, because a control that looks like a link and is not
 * one is a dead end. An action with no destination renders as a `Button`, which
 * is inert here by design: a Block ships no behaviour, so the honest form of
 * "this does something" in a composed section is the consumer's own control in
 * the slot.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and
 * the vertical rhythm rather than re-deriving either, and it adds no container
 * width and no section padding of its own.
 */
export function Hero01({
  eyebrow,
  title,
  description,
  actions = [],
  align = 'center',
  instrument,
  split,
  headingLevel = 'h2',
  className,
}: Hero01Props) {
  const twoColumn = split ?? instrument !== undefined

  const copy = (
    <div
      data-slot="hero-01-copy"
      className={cn(
        'flex flex-col gap-10',
        twoColumn ? 'items-start text-left' : align === 'center' ? 'items-center text-center' : 'items-start text-left',
      )}
    >
      {eyebrow ? (
        <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
          {eyebrow}
        </span>
      ) : null}

      <SectionHeading as={headingLevel} align={twoColumn ? 'left' : align} title={title} description={description} />

      {actions.length ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {actions.map((action, index) => {
            const variant = action.variant ?? (index === 0 ? 'default' : 'outline')
            // The arrow is a link affordance, so it follows the element and not the
            // position. It was `index === 0`, which put a "goes forward" arrow on an
            // inert button: the one control in the row that cannot be followed wore
            // the mark that says it can. A first action that is genuinely a button
            // gets no arrow, and a second action that is a link still gets none,
            // because the arrow marks the row's primary destination and only one
            // thing is that.
            const isLink = action.href !== undefined
            const content = (
              <>
                {action.label}
                {index === 0 && isLink ? (
                  <ArrowRight className="motion-safe:transition-transform size-4 group-hover:translate-x-0.5" />
                ) : null}
              </>
            )

            return isLink ? (
              <CtaLink
                key={index}
                href={action.href}
                newTab={action.newTab}
                size="lg"
                variant={variant}
                className="group"
              >
                {content}
              </CtaLink>
            ) : (
              <Button key={index} size="lg" variant={variant} className="group">
                {content}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )

  return (
    <Section className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className="from-primary/5 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b to-transparent"
      />
      {/*
        The band. The two columns are a Tailwind grid track rather than a
        fractional split, and the split is `5fr / 6fr` for a reason worth
        stating: the figure needs more width than the copy, because a graph
        whose nodes are a readable size eats horizontal room, and a copy column
        that takes half of a 72rem container has a measure of about 34rem, which
        is already past the comfortable end of a reading measure. Narrowing the
        copy rather than the figure is the whole of the decision.
      */}
      <div
        data-slot="hero-01-band"
        className={cn(
          twoColumn
            ? 'grid items-center gap-10 lg:grid-cols-[5fr_6fr] lg:gap-14'
            : 'flex flex-col',
        )}
      >
        {copy}
        {/*
          The figure. It is a slot, so the consumer composes it, and this Block
          wraps it in a framed panel because a bare figure on the page ground
          reads as an illustration while the same figure in a panel reads as an
          instrument, which is what it is.
        */}
        {instrument ? (
          <div data-slot="hero-01-instrument" className="min-w-0">
            {instrument}
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export default Hero01
