import { Fragment, type ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a hero's action row that names a destination.
 *
 * One of the two arms of `HeroAction`, and named rather than left as an inline
 * member of the union so a consumer assembling a row from its own data can say
 * which arm it is building. `FeatureGrid01` names its two arms the same way and
 * for the same reason.
 *
 * `href` is required and that is the whole of the arm. A control drawn as a call
 * to action and with nowhere to go is the dead end `CtaLink`'s own JSDoc names,
 * and this Block cannot repair it: a Block ships no behaviour, so there is no
 * handler to attach and no destination to invent.
 */
export type HeroLinkAction = {
  /** The words on the control. Every string a hero renders is the caller's. */
  label: string
  /**
   * Where the action goes. Required rather than optional, so that "a link whose
   * address is sometimes undefined" is a compile error rather than a control that
   * navigates on the renders where the address happens to be there.
   */
  href: string
  /** Opens the destination in a new tab, with the matching `rel`. */
  newTab?: boolean
  /**
   * Which weight this action draws at, when the caller does not say.
   *
   * Defaults to `default` for the first action in the row and `outline` for the
   * rest, which is a decision about the row's shape rather than about the
   * element. A slot carries its own weight, so it does not take one from here.
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /**
   * Forbidden, so that an action cannot be both a destination and a caller's own
   * control. The two are rendered by different code on different elements and a
   * value carrying both would have to pick one silently.
   */
  slot?: never
}

/**
 * One action in a hero's action row that is the caller's own control.
 *
 * **This is the arm that replaced a rendered button, and the reason it is a slot
 * rather than an `onClick` is that a Block cannot receive one.** This is a server
 * Component, so a handler is not a prop it can be given, and the earlier arm it
 * replaced rendered a bare `<button>`: focusable, announced as a button, and
 * activating to nothing, on the most important control on a marketing page. The
 * defect was in the **type**, not in the render. A `label` with no destination was
 * a legal value, so the honest form of the escape hatch had to be a node the
 * caller renders itself, which the Block can place but cannot make inert.
 *
 * What belongs here is anything Prism cannot make work: a router's own `Link`, a
 * submit button in the caller's form, a menu trigger, a control that opens a
 * dialog. What does not belong here is a plain anchor; that is the other arm, and
 * it is one property away rather than one component away.
 */
export type HeroSlotAction = {
  /**
   * The caller's own control, placed in the row where this action sits.
   *
   * The whole control, including its own label, its own weight and any icon. The
   * Block draws no frame around it and adds no class to it, because a class it
   * adds is a style the caller cannot see and cannot remove, and this package has
   * no override path.
   */
  slot: ReactNode
  /**
   * Forbidden on this arm, and for a reason rather than by tidiness: the Block
   * renders `slot` and nothing else, so a `label` beside it would be a word no
   * reader ever sees and a caller would reasonably believe had been rendered.
   */
  label?: never
  /** Forbidden: an anchor belongs on the other arm, where Prism renders it. */
  href?: never
  /** Forbidden with `href`, for the same reason. */
  newTab?: never
  /**
   * Forbidden, because the Block cannot style a node it does not render. A weight
   * accepted here and dropped would be the one prop in this Block that a reader
   * of the type could believe was in effect when it is not.
   */
  variant?: never
}

/**
 * One action in a hero's action row, as a union of the two things an action in
 * this position can honestly be.
 *
 * **A caller should not be able to reach a dead control by accident, and the
 * union is what stops it.** The arms are two elements with two jobs, and a single
 * shape with an optional `href` made both of these mistakes silent. Each was a
 * legal value that rendered a control which activated to nothing, on the one a
 * reader looks first:
 *
 * - `{ label: 'Start free' }`, which was the likely mistake because a hero's first
 *   action is almost always a link, and it looked correct on the page.
 * - `{ label: 'Start free', href: maybeUrl }`, which navigated on the renders where
 *   the address happened to be there and rendered a button on the others, a runtime
 *   branch the type said nothing about.
 *
 * The first arm therefore **requires** `href`, and the second carries the caller's
 * own control rather than a `Button` this Block cannot wire to anything. There is no
 * third arm and no optional key, so both of those values are compile errors now.
 * `hero-action.types.ts` holds that as an assertion, because a render cannot prove
 * a value does not compile.
 */
export type HeroAction = HeroLinkAction | HeroSlotAction

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
  /** Up to two actions. See `HeroAction` and its two arms. */
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
 * **Actions are real links, and a control that is not a link is the caller's.**
 * An action naming an `href` renders as an anchor with the matching `rel`,
 * because a control that looks like a link and is not one is a dead end. An
 * action that cannot be a link takes a `slot`, and this Block renders the node it
 * is given rather than a `Button` it cannot wire to anything. The earlier shape
 * had a third possibility, a label with no destination, and it rendered a bare
 * `<button>` on the primary call to action of a marketing hero: focusable,
 * announced as a button, and activating to nothing. That was the type's defect
 * rather than the render's, and the arms above are what close it.
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
            // A slot is the caller's own control, placed where it asked to be and
            // otherwise untouched. Keyed positionally for the reason the other
            // keyed lists in this package state: two actions may share a label, and
            // a row keyed on a localised label remounts when the reader changes
            // language.
            if ('slot' in action) {
              return <Fragment key={index}>{action.slot}</Fragment>
            }

            const variant = action.variant ?? (index === 0 ? 'default' : 'outline')
            // The arrow is a link affordance, so it follows the element and not the
            // position. It was `index === 0`, which put a "goes forward" arrow on an
            // inert button: the one control in the row that cannot be followed wore
            // the mark that says it can. Every action Prism renders is now a link,
            // so the position is the whole of the test, and a slot at the front wears
            // no arrow because the control it carries owns its own marks.
            return (
              <CtaLink
                key={index}
                href={action.href}
                newTab={action.newTab}
                size="lg"
                variant={variant}
                className="group"
              >
                {action.label}
                {index === 0 ? <ArrowRight className="transition-transform size-4 group-hover:translate-x-0.5" /> : null}
              </CtaLink>
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
