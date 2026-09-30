import type { ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a hero's action row.
 *
 * The same two arms `Hero01` declares, spelled again here rather than imported,
 * and the reason is worth stating because a reader will ask: a shared type would
 * mean `@nanisoft/prism-ui/blocks/hero-01` is a dependency of
 * `@nanisoft/prism-ui/blocks/hero-02`, and a consumer installing the second form
 * to get a bigger figure would be made to resolve the first. The union is four
 * lines of typescript, it is checked in both places, and two Blocks that each
 * answer "is this action a link or a control" correctly is not a fact that drifts.
 *
 * The link arm requires `href` and the button arm declares `href?: never`. That
 * second half is the one that earns its keep: an optional `href` makes both
 * mistakes silent, a link whose address is sometimes undefined rendering as a
 * button that goes nowhere, and that is the likely mistake in a hero because a
 * hero's first action is almost always a link.
 */
export type Hero02Action = {
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

/**
 * The props a Hero02 takes.
 *
 * Every string is a prop and the Block ships none. There is no default eyebrow,
 * no default headline, no default action row and no default figure: this is the
 * third block in the hero family and all three of them hold that line, because a
 * hero with copy in it hands every consumer a claim about somebody else's
 * product at the exact position on the page where a claim is hardest to argue
 * with.
 */
export type Hero02Props = {
  /**
   * Optional label above the headline. It has no default, and the honest state is
   * no eyebrow: an earlier version of the family shipped a hardcoded open beta
   * pill, which meant every consumer who installed the Block inherited a status
   * badge making a claim about their own product.
   */
  eyebrow?: string
  /** The headline. A node, because a caller may set the emphasised word in its own mark. */
  title: ReactNode
  /** The supporting line under the headline. A node for the same reason. */
  description?: ReactNode
  /** Up to two actions. See `Hero02Action`. */
  actions?: Hero02Action[]
  /**
   * The figure: the whole second half of the band.
   *
   * Required, and required rather than optional because the proportion is the
   * Block. This is the form for a claim the reader has to see, so a Block that
   * can render without a figure would be a narrower claim than the one its
   * layout is built to carry.
   *
   * **What may go in it, and the test is falsifiable.** Something that would
   * still be true with every animation stopped: a `PulseSeries` of the queue
   * depth, a `PulseGraph` of the stages a run passes through, a `Chart` of what
   * a week of captures looked like. That is the same claim DESIGN.md's Motion
   * section makes about a demonstration, and this is where a Block has to hold
   * it: stop the animation and the figure is either still true, or it was a
   * video with extra steps and the component it was built with is the wrong one.
   * A slot that only reads while it moves is a decoration with a slot.
   */
  figure: ReactNode
  /**
   * The accessible name of the figure region, published on the `<figure>` this
   * Block draws around the slot and as no visible text.
   *
   * Required, and required for the reason `LogoStrip01` requires its `label`: a
   * Block that ships no copy ships no reader-facing copy either, so the phrase
   * that says which figure a reader has landed on is the caller's. Two heroes on
   * one page are two figures a reader navigating by figure cannot tell apart.
   * Prism will not compose it, because "the pipeline, live", "the estate, now"
   * and "this week in captures" are three different claims about three different
   * systems and none of them is this Block's to choose.
   */
  figureLabel: string
  /**
   * Heading level for the title. Defaults to `h2` because a Block is composed,
   * not a page: it installs into a consumer's layout and renders inside catalogue
   * previews, so the surrounding document already owns the `h1`. A page that uses
   * this Block as its top-level heading opts in with `headingLevel="h1"`. See
   * `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A marketing hero whose figure is the second half of the band, run to the edge
 * of the container.
 *
 * **What earns this form over `Hero01`'s, and the answer is proportion rather
 * than importance.** The three heroes in the family are not three tastes about
 * what matters on a page. They are three answers to how much room a claim needs.
 * `Hero01` splits its two-column band `5fr / 6fr`, and that ratio is a decision
 * its own JSDoc states: the copy needs the measure and the figure needs the
 * width, and at five to six neither is given enough. That is the right answer
 * when the figure is a supporting object, because then the sentence is the claim
 * and the drawing is evidence for it. It is the wrong answer when the figure is
 * the claim, for a reason that is arithmetic rather than aesthetic: at `5fr` of a
 * 72rem container a graph whose nodes are a readable size is a thumbnail, and a
 * node label at that width is four characters across, while the copy column at
 * six shares is already at the end of a comfortable reading measure. There is
 * nothing left to give. So this Block narrows the copy to four shares, drops the
 * gap between the columns to nothing, and spends what that saves on the figure.
 * The copy loses about a fifth of its measure and does not feel it, because a
 * hero's headline is short and a description of one sentence has room to be
 * narrow. The figure gains everything.
 *
 * **The figure bleeds, and it is not in a card.** The band runs to the container's
 * edge rather than stopping short of it, so the figure's own boundary is the
 * page's boundary and there is no rounded rectangle around it saying *object on a
 * surface*. The cost is honest: a full bleed figure has no frame of its own, so
 * Prism draws none here and the slot takes whatever the consumer composed, and a
 * consumer who wants the instrument treatment composes `InstrumentPanel01` into
 * the slot and gets a panel with its own margin inside a bleed. Both are
 * arrangements this system allows and neither is decided here.
 *
 * **The copy is first in the DOM and stays first at every width.** This is the
 * rule `Hero01` states and it is not restated because it is optional. A reader
 * who never sees the figure still reads the headline and the destination, a
 * screen reader reaches the thesis before the drawing, and the visual order at
 * desktop is produced by the grid rather than by the markup. The figure moves to
 * the first position in the visual order only below the breakpoint, where the
 * columns stack, and the order a reader on a phone wants is what this is, then
 * what it does.
 *
 * **The heading is aligned left because there is content beside it, not under
 * it.** That is the exception `SectionHeading`'s own rule states, and `Hero01`
 * is the same exception: a band that is only a heading is the case `center`
 * exists for, and this band is a heading and a figure side by side. A centred
 * headline in a column two fifths of the container wide would be a centred
 * headline in a narrow measure, which is worse than either arrangement it could
 * have chosen.
 *
 * **Actions are real links, and the arrow follows the element.** An action naming
 * an `href` renders as an anchor with the matching `rel`. An action with no
 * destination renders as a `Button`, inert here by design, because a Block ships
 * no behaviour and the honest form of "this does something" in a composed section
 * is the consumer's own control in a slot. The forward arrow marks the row's one
 * primary destination and only appears when that destination is a link that can
 * be followed, which is the rule `Hero01` states: a control wearing a "goes
 * forward" mark is the one control in the row saying it can be followed and
 * cannot be. Its movement is a hover on a control the reader caused, so it is
 * guarded with `motion-safe` and shortened rather than removed.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and
 * the vertical rhythm rather than re-deriving either, and it adds no container
 * width and no section padding of its own.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Hero02({
  eyebrow,
  title,
  description,
  actions = [],
  figure,
  figureLabel,
  headingLevel = 'h2',
  className,
}: Hero02Props) {
  return (
    <Section data-slot="hero-02" className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className="from-primary/5 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b to-transparent"
      />
      {/*
        The band. The two tracks are `4fr / 8fr` and the column gap is zero, which
        is the whole of the difference between this form and `Hero01`'s: the copy
        gives up a fifth of its measure, the gap between the columns gives up
        everything, and the figure takes both. The copy's own padding is what
        separates the two halves now, so the seam is a margin rather than a
        channel and the figure can meet the container's edge.
      */}
      <div
        data-slot="hero-02-band"
        className="grid items-center gap-10 lg:grid-cols-[4fr_8fr] lg:gap-0"
      >
        <div data-slot="hero-02-copy" className="flex flex-col items-start gap-10 text-left lg:pe-14">
          {eyebrow ? (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
              {eyebrow}
            </span>
          ) : null}

          <SectionHeading as={headingLevel} align="left" title={title} description={description} />

          {actions.length ? (
            <div data-slot="hero-02-actions" className="flex flex-col gap-3 sm:flex-row">
              {actions.map((action, index) => {
                const variant = action.variant ?? (index === 0 ? 'default' : 'outline')
                // The arrow follows the element rather than the position, so the
                // rule is the one `Hero01` states: the row's primary destination
                // gets the mark, and only if it is something that can be followed.
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

        {/*
          The figure. It is a slot, so the consumer composes it and Prism draws no
          frame around it, and the name of the region is the caller's because a
          Block ships no reader-facing copy. The negative inline-end margin is the
          container's own padding taken back, so the figure reaches the container's
          edge and stops there rather than running to the viewport's, which is what
          a bleed inside a container is.
        */}
        <figure
          data-slot="hero-02-figure"
          aria-label={figureLabel}
          className="min-w-0 lg:-me-8"
        >
          {figure}
        </figure>
      </div>
    </Section>
  )
}

export default Hero02