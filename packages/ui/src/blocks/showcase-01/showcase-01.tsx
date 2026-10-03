import { Fragment, type ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { CtaLink } from '../../components/ui/cta-link'
import { FactList, type Fact } from '../../components/ui/fact-list'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a showcase's action row that names a destination.
 *
 * One of the two arms of `ShowcaseAction`, and named rather than left as an inline
 * member of the union so a caller assembling a row from its own data can say which
 * arm it is building. `href` is required and that is the whole of the arm: a
 * control drawn as a call to action and with nowhere to go is the dead end
 * `CtaLink`'s own JSDoc names, and this Block cannot repair it, because a Block
 * ships no behaviour.
 */
export type ShowcaseLinkAction = {
  /** The words on the control. Every string a showcase renders is the caller's. */
  label: string
  /**
   * Where the action goes. Required rather than optional, so that "a link whose
   * address is sometimes undefined" is a compile error rather than a control that
   * navigates on the renders where the address happens to be there.
   */
  href: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
  /**
   * Which weight this action draws at, when the caller does not say.
   *
   * Defaults to `default` for the first action in the row and `outline` for the
   * rest. A slot carries its own weight, so it does not take one from here.
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /**
   * Forbidden, so that an action cannot be both a destination and a caller's own
   * control. The two are rendered by different code on different elements, and a
   * value carrying both would have to pick one silently.
   */
  slot?: never
}

/**
 * One action in a showcase's action row that is the caller's own control.
 *
 * **This is the arm that replaced a rendered button, and the reason it is a slot
 * rather than an `onClick` is that a Block cannot receive one.** This is a server
 * Component, so a handler is not a prop it can be given, and the arm it replaced
 * rendered a bare `<Button>` under the standfirst: focusable, announced as a button,
 * and activating to nothing, on the section's primary ask. The defect was in the
 * **type**, not in the render, because a `label` with no destination was a legal
 * value.
 *
 * What belongs here is anything Prism cannot make work: a router's own `Link`, a
 * control that opens a configurator or a trial dialog. What does not belong here is
 * a plain anchor; that is the other arm.
 */
export type ShowcaseSlotAction = {
  /**
   * The caller's own control, placed in the row where this action sits.
   *
   * The whole control, including its own label, its own weight and any icon. The
   * Block draws no frame around it and adds no class to it, because a class it adds
   * is a style the caller cannot see and cannot remove, and this package has no
   * override path.
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
   * accepted here and dropped would be the one prop in this Block that a reader of
   * the type could believe was in effect when it is not.
   */
  variant?: never
}

/**
 * One action in a showcase's action row, as a union of the two things an action in
 * this position can honestly be.
 *
 * **A caller should not be able to reach a dead control by accident, and the union
 * is what stops it.** A single shape with an optional `href` made both of these
 * mistakes silent, and each was a legal value that rendered a control which
 * activated to nothing: `{ label: 'Configure it' }`, which was the likely mistake
 * because a showcase's first action is almost always a link, and
 * `{ label, href: maybeUrl }`, which navigated on the renders where the address
 * happened to be there and rendered a button on the others.
 *
 * The first arm therefore **requires** `href`, and the second carries the caller's
 * own control rather than a `Button` this Block cannot wire to anything.
 *
 * It is declared here rather than imported from `hero-01`, following
 * `ProcessFlow01`'s note on the same point, and `scripts/check-block-controls.mjs`
 * is what holds the shape: a consumer installing a section that shows a capability
 * in depth would otherwise be made to resolve a marketing hero to get it, and a
 * shared type would be a ninth copy of the law that could drift from the other
 * eight. The gate is the single place the law is written down.
 */
export type ShowcaseAction = ShowcaseLinkAction | ShowcaseSlotAction

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
  /**
   * Up to two actions, under the standfirst. See `ShowcaseAction` and its two arms:
   * every action Prism renders here is a link, and an action that cannot be one is a
   * slot the Block places without styling.
   */
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
                // A slot is the caller's own control, placed where it asked to be and
                // otherwise untouched. Keyed positionally for the reason the other
                // keyed lists in this package state: two actions may share a label,
                // and a row keyed on a localised label remounts when the reader
                // changes language.
                if ('slot' in action) {
                  return <Fragment key={index}>{action.slot}</Fragment>
                }

                // The variant follows the position, which is a decision about the
                // row's shape rather than about the element.
                const variant = action.variant ?? (index === 0 ? 'default' : 'outline')

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
                    {index === 0 ? (
                      <ArrowRight className="transition-transform size-4 group-hover:translate-x-0.5" />
                    ) : null}
                  </CtaLink>
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