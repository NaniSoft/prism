import type { ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { FactList, type Fact } from '../../components/ui/fact-list'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a showcase's action row.
 *
 * The same two arms `Hero01` declares, spelled again here rather than imported, and
 * the reason is the same one: a shared type would make
 * `@nanisoft/prism-ui/blocks/hero-01` a dependency of
 * `@nanisoft/prism-ui/blocks/showcase-01`, and a consumer installing a section that
 * shows a capability in depth would be made to resolve a marketing hero to get it.
 * The link arm requires `href` and the button arm declares `href?: never`, because an
 * optional `href` makes a link whose address is sometimes undefined compile into a
 * button that goes nowhere.
 */
export type ShowcaseAction = {
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
       * Forbidden, so that "a link whose address happens to be undefined" is a type
       * error rather than a button.
       */
      href?: never
      newTab?: never
    }
)

/**
 * The props a Showcase01 takes. Every string is a prop and the Block ships none.
 */
export type Showcase01Props = {
  /** Optional label above the name. It has no default, and the honest state is none. */
  eyebrow?: string
  /**
   * The name of the thing being shown, set at the section's heading step.
   *
   * A string and not a node, and the difference is worth naming: this is the one
   * heading in this system that names a single proper noun rather than making a
   * claim in prose, so there is no emphasised word inside it to set in a caller's
   * mark. A caller whose name is a phrase and needs a claim beside it writes the
   * claim in `standfirst`.
   */
  name: string
  /**
   * The standfirst: the sentence under the name that says what the thing is for.
   *
   * A node, because the same three NaniSoft sites set part of this line in their own
   * mark. Optional rather than required, because a name that is self-describing, such
   * as a service or a pipeline, needs no gloss and a gloss that repeats the name is
   * worse than no gloss.
   */
  standfirst?: ReactNode
  /**
   * The specification, as the caller's own facts. See `Fact`.
   *
   * `Fact['value']` is a node rather than a string, and that is what lets a row hold
   * a `CodeBlock`: a specification row whose answer is a command or a fragment is a
   * specification, and a caller who cannot put source in a cell is pushed into a
   * paragraph underneath, which is where specifications go to stop being readable.
   */
  facts: readonly Fact[]
  /**
   * The media panel's contents, drawn by the caller inside the frame this Block
   * draws around it. Omit it for a showcase that is a specification and nothing else.
   */
  media?: ReactNode
  /**
   * The accessible name of the media region, published on the `<figure>` and as no
   * visible text.
   *
   * Required whenever `media` is passed, and the Block throws without it. The rule is
   * `FeatureRows01`'s: a figure a reader cannot name is a figure a reader navigating
   * by figure cannot find again, and this Block's whole subject is one capability on
   * a page that may carry three of them.
   */
  mediaLabel?: string
  /** Up to two actions, under the standfirst. See `ShowcaseAction`. */
  actions?: ShowcaseAction[]
  /**
   * Which side the media panel takes.
   *
   * A layout prop rather than a `className`, because swapping the panel from one
   * side to the other is a composition decision a page makes repeatedly and
   * re-deriving it from utility classes at each call site is how a page ends up with
   * two panels on opposite sides and no reason why.
   *
   * @defaultValue 'panel-right'
   */
  layout?: 'panel-left' | 'panel-right'
  /**
   * Heading level for the name. Defaults to `h2` because a Block is composed, not a
   * page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * One capability in depth: its name, a standfirst, a specification, a panel, and at
 * most two actions.
 *
 * **This is the upstream experience and service pattern, and the translation is the
 * decision the whole effort rests on, so it is stated rather than assumed.** The
 * published pattern is a storefront's product page: a name, a paragraph about it, a
 * table of specifications, a gallery, and a buy button. Everything about that pattern
 * is layout and accessibility work, and all of it transfers without a change: a
 * specification is a description list whichever product it describes, a gallery is a
 * figure a reader has to be able to name, and the buy button is a real anchor rather
 * than a styled `div`. What does not transfer is the framing, and framing is where
 * most of the prose in such a page goes. So the layout is the storefront's and the
 * writing is Prism's: a pipeline that runs, a market that is captured, an estate that
 * is observed, a run that is finished and can be read afterwards. The Demo holds that
 * vocabulary and this component holds none of it, because a Block ships no copy and
 * a showcase whose examples were authored by a design system would hand every
 * consumer a page about somebody else's product.
 *
 * **The specification is `FactList` and the panel is a `figure`, and neither is
 * re-derived here.** `FactList` is a real `<dl>` with the term before its answer,
 * which is what a specification is and what a table of key and value cells is not: a
 * screen reader announces the term before the answer in one and reads two columns of
 * equal weight in the other, and a reader who lands mid-list cannot tell which half
 * they are in. The panel is a `<figure>` with a required name for the reason
 * `FeatureRows01` states. Re-deriving either here would put a second answer to "how
 * does a specification read" in one package, and the second answer is always the one
 * that disagrees.
 *
 * **What this is not, and the reason matters more than the list would.** This is not
 * a pricing Block and it carries no price, no period, no currency and no tier. That is
 * not a missing feature, it is the refusal that keeps the item honest: a Block that
 * holds a number the caller has to remember to change is a Block that ships a stale
 * claim, and a stale price is the one number on a marketing page that a reader acts
 * on. `Price` exists as a Component and `Pricing01` exists as a Block, and a caller
 * who wants a price composes them beside this one rather than putting the figure in
 * here where nothing would tell them it can go stale.
 *
 * **The panel is drawn by this Block, and the copy column is first in the DOM on both
 * layouts.** The name and the specification are the content; the panel is evidence
 * for them, and a reader who never reaches the panel has still read everything the
 * section claims. `layout` therefore moves the panel in the visual order with `order`
 * rather than by swapping the columns in the markup, so the reading order is the same
 * whichever side the panel is drawn on.
 *
 * **The heading is aligned left.** `SectionHeading` states the rule and this section
 * has a specification and a panel beside and under the name, so there is content and
 * the answer is left.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width and
 * no section padding of its own.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Showcase01({
  eyebrow,
  name,
  standfirst,
  facts,
  media,
  mediaLabel,
  actions = [],
  layout = 'panel-right',
  headingLevel = 'h2',
  className,
}: Showcase01Props) {
  if (media !== undefined && !mediaLabel) {
    throw new Error(
      'Showcase01: a media node was passed with no mediaLabel, so the figure would be one a reader ' +
        'navigating by figure cannot tell from the next showcase on the page. Pass the words you mean, or omit the media.',
    )
  }

  const panelFirst = layout === 'panel-left'

  return (
    <Section data-slot="showcase-01" className={className}>
      <div data-slot="showcase-01-band" className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          data-slot="showcase-01-copy"
          className={cn('flex min-w-0 flex-col gap-8', panelFirst ? 'lg:order-2' : 'lg:order-1')}
        >
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={name}
            description={standfirst}
          />

          {actions.length ? (
            <div data-slot="showcase-01-actions" className="flex flex-col gap-3 sm:flex-row">
              {actions.map((action, index) => {
                const variant = action.variant ?? (index === 0 ? 'default' : 'outline')
                // The arrow follows the element rather than the position, for the
                // reason `Hero01` states: the row's primary destination gets the
                // mark, and only if it is something that can be followed.
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

          {/*
            The specification. `FactList` draws the `<dl>` and the hairlines and
            nothing else, and it renders nothing at all for an empty list, so a caller
            with no specification does not get an empty frame under the standfirst.
          */}
          <FactList facts={facts} />
        </div>

        {/*
          The panel. A `figure` with the caller's own name on it, drawn inside the
          frame this Block owns for the reason `FeatureRows01` states: a bare figure
          on the page ground reads as an illustration, and the same figure inside a
          panel reads as an instrument.
        */}
        {media ? (
          <figure
            data-slot="showcase-01-media"
            aria-label={mediaLabel}
            className={cn(
              'bg-card flex min-w-0 flex-col justify-center rounded-xl border p-4 shadow-sm',
              panelFirst ? 'lg:order-1' : 'lg:order-2',
            )}
          >
            {media}
          </figure>
        ) : null}
      </div>
    </Section>
  )
}

export default Showcase01