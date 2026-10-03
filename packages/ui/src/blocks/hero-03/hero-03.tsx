import { Fragment, type ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One action in a hero's action row that names a destination.
 *
 * One of the two arms of `Hero03Action`, named for the reason `Hero01` names its
 * own: a consumer assembling a row from its own data can say which arm it is
 * building, and `FeatureGrid01` names its two arms the same way. See
 * `Hero02LinkAction` for the two arms and for why the union is spelled again here
 * rather than imported.
 *
 * `href` is required and that is the whole of the arm. A control drawn as a call
 * to action and with nowhere to go is a dead end, and this Block cannot repair
 * one: a Block ships no behaviour, so there is no handler to attach and no
 * destination to invent.
 */
export type Hero03LinkAction = {
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
   * Which weight this action draws at, when the caller does not say. Defaults to
   * `default` for the first action in the row and `outline` for the rest, which is
   * a decision about the row's shape rather than about the element. A slot carries
   * its own weight, so it does not take one from here.
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
 * Component, so a handler is not a prop it can be given, and the arm it replaced
 * rendered a bare `<button>`: focusable, announced as a button, and activating to
 * nothing, in the position a reader looks first. The defect was in the **type**,
 * not in the render, so the fix is a type: the honest form of the escape hatch is
 * a node the caller renders itself, which this Block can place but cannot make
 * inert.
 *
 * What belongs here is anything Prism cannot make work: a router's own `Link`, a
 * submit button in the caller's form, a menu trigger. What does not belong here is
 * a plain anchor; that is the other arm, one property away rather than one
 * component away.
 */
export type Hero03SlotAction = {
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
 * this position can honestly be. See `Hero02Action` for the two arms and for why
 * the union is spelled again here rather than imported.
 */
export type Hero03Action = Hero03LinkAction | Hero03SlotAction

/**
 * One of the things the product does, in the order a reader should meet them.
 *
 * A title and a sentence, and no icon. The three arms of the family differ in
 * proportion and this is where the difference is visible in the data: a list of
 * three named things with an icon beside each one is a `FeatureGrid01` in a
 * narrower column, and the reader's second question on a hero is not what the
 * features are.
 */
export type Hero03Point = {
  /** The name of the thing. A title, set at the level below the section heading. */
  title: string
  /** One sentence about it. */
  body: string
}

/**
 * One figure in the proof row, passed to `Metric` as it is given.
 *
 * The four fields are `Metric`'s own names, and that is deliberate: this Block
 * composes the Component rather than re-deriving it, so a caller who has learned
 * `Metric` has learned the row. `delta` and `hint` are optional and additive, so a
 * figure with nothing to say about its period renders three elements rather than
 * five with two of them empty.
 */
export type Hero03Proof = {
  /** What the figure measures, read under it. */
  label: string
  /** The figure itself. A node, so a caller may include its own unit. */
  value: ReactNode
  /**
   * The change against the previous reading, and it is printed as the bare
   * number, which is `Metric`'s answer rather than this Block's: Prism cannot
   * format a delta it has no unit for. A percentage is therefore passed as `12`
   * and not as `0.12`.
   */
  delta?: number
  /** The line under the label: the period it covers, or the caveat that matters. */
  hint?: ReactNode
}

/**
 * The props a Hero03 takes. Every string and every number is a prop, and the Block
 * ships none of either.
 */
export type Hero03Props = {
  /** Optional label above the headline. It has no default, and the honest state is none. */
  eyebrow?: string
  /** The headline. A node, because a caller may set the emphasised word in its own mark. */
  title: ReactNode
  /** The supporting line. A node for the same reason. */
  description?: ReactNode
  /**
   * The short list of what the product does, in the right column beside the
   * headline.
   *
   * A list and not a grid of cards, for the reason `LogoStrip01` is a `ul`: a
   * reader who is deciding whether to keep listening is told how many there are
   * before the first one. Three is the shape this Block is written for and the
   * type does not refuse a fourth, because a caller with four things to say has
   * four things to say and the row height absorbs them.
   */
  points: readonly Hero03Point[]
  /**
   * The figures below the rule, passed straight to `Metric`.
   *
   * **Why the numbers are props and the Block ships none is the whole decision on
   * this row.** See the Block's own JSDoc: a hero is the one place on a marketing
   * page where a number beside a headline is not a claim the reader has to be sold,
   * because the numbers are the claim. That is exactly why none of them can be
   * authored here. A Block that shipped three invented figures would put the three
   * most persuasive sentences on the page, in the position a reader trusts most,
   * on behalf of a product it knows nothing about.
   */
  proof: readonly Hero03Proof[]
  /** Up to two actions, under the headline. See `Hero03Action`. */
  actions?: Hero03Action[]
  /**
   * Heading level for the title and, one step below it, for each point's title.
   * Defaults to `h2` because a Block is composed, not a page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * An editorial hero: a wide headline, a short list of what the product does beside
 * it, and a row of proof figures under a full-width rule.
 *
 * **The family is three answers to how much room a claim needs, and this is the
 * third.** The two before it are both about a single claim, and this one is about
 * a set of them, so the difference is not taste and it is not about which of the
 * three reads as most important:
 *
 * | Block | The claim | What the band spends its width on |
 * | --- | --- | --- |
 * | `Hero01` | a sentence | a headline and one supporting figure, five to six |
 * | `Hero02` | a figure | four shares of copy and eight of figure, bled to the edge |
 * | `Hero03` | three figures and a sentence | a wide headline, a list beside it, and a rule with proofs under it |
 *
 * A page with one argument uses `Hero01` or `Hero02`. A page whose argument is a
 * body of evidence uses this one, and the thing that costs it and buys the row is
 * the headline's width: at seven shares the headline can hold a sentence with a
 * subordinate clause in it, which is the shape an editorial claim takes and which
 * the other two forms wrap to three lines.
 *
 * **The proof row is the decision, and it is a claim position rather than a
 * decoration.** A hero is the one place on a marketing page where a number set
 * beside a headline is not a claim the reader has to be sold, because the numbers
 * are the claim itself: there is nothing above them to frame them and nothing below
 * them to qualify them. A statistic in a body paragraph is an assertion in the
 * middle of an argument, and it is read as one. Three statistics under the fold of
 * a hero are the argument. That is also why every number here is a prop and the
 * Block ships none: the three most persuasive sentences on the page, in the
 * position a reader trusts most, are the last place in this system for a value a
 * design system invented. The earlier shape of this row, a `Stats01` tile grid,
 * would also have been wrong for the second reason that a tile puts a border and a
 * shadow around a figure and makes it one item of a set, where this row is three
 * figures about one claim.
 *
 * **The figures are `Metric` and not a hand-rolled figure.** The Component puts
 * the number first and the label under it, derives the direction from the sign of
 * the delta so no caller can put a rising mark on a falling reading, and formats
 * the delta itself rather than accepting a word for it. Re-deriving any of that
 * here would put a second answer to three questions in one package, and the
 * second answer is always the one that disagrees.
 *
 * **The rule is a border and the row is under it, in one container width.** Not a
 * second `Section`, and not a `Stats01` below: the proofs are evidence for the
 * claim above them, so they share its band, and the rule is what says so. The
 * alternative was a separate section, which would have given the row its own
 * heading and made three figures into a topic of the page rather than the bottom
 * of a sentence.
 *
 * **The points are a `ul` and their titles are headings one level below the
 * section's.** The count is announced before the first item, which is the whole
 * answer to a reader deciding whether to keep listening, and the titles are
 * derived from `headingLevel` so a hero embedded one level deeper carries its
 * outline with it instead of announcing three siblings of itself.
 *
 * **The heading is aligned left.** `SectionHeading` states the rule: `center` is
 * for a band that is only a heading, and this band has a list beside the heading
 * and a row under it. The two columns of the band are a list and a headline, and a
 * centred headline in a wide column beside a left-aligned list reads as two
 * unrelated pieces.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width
 * and no section padding of its own.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Hero03({
  eyebrow,
  title,
  description,
  points,
  proof,
  actions = [],
  headingLevel = 'h2',
  className,
}: Hero03Props) {
  // A point's title is a heading one step below the section that introduces the
  // list, derived rather than written, so a Block embedded one level deeper carries
  // its outline with it.
  const Title = childLevel(headingLevel)

  return (
    <Section data-slot="hero-03">
      <div data-slot="hero-03-band" className="grid items-start gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
        <div data-slot="hero-03-copy" className="flex flex-col items-start gap-8 text-left">
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          {actions.length ? (
            <div data-slot="hero-03-actions" className="flex flex-col gap-3 sm:flex-row">
              {actions.map((action, index) => {
                // A slot is the caller's own control, placed where it asked to be and
                // otherwise untouched. Keyed positionally for the reason `Hero01`
                // states.
                if ('slot' in action) {
                  return <Fragment key={index}>{action.slot}</Fragment>
                }

                const variant = action.variant ?? (index === 0 ? 'default' : 'outline')
                // The arrow follows the element rather than the position, for the
                // reason `Hero01` states: the row's primary destination gets the
                // mark, and every action this Block renders is one.
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
        </div>

        {/*
          The points. A `ul` so the count is announced before the first item, and
          a hairline between entries rather than a tile around each one, because a
          tile would make each of the three a separate feature and the section is
          about the three of them together.
        */}
        <ul data-slot="hero-03-points" className="flex flex-col">
          {points.map((point) => (
            <li
              key={point.title}
              data-slot="hero-03-point"
              className="border-border flex flex-col gap-1 border-t py-4 first:border-t-0 first:pt-0"
            >
              <Title className="text-base font-semibold">{point.title}</Title>
              <p className="text-muted-foreground text-pretty text-sm">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/*
        The proof row. The rule spans the container because the figures are
        evidence for the claim above rather than a section of their own, so they
        share the band and the rule is what says so. `Metric` draws each figure,
        and the four props go to it under `Metric`'s own names so the row and the
        Component cannot be read as two different things.
      */}
      <div
        data-slot="hero-03-proof"
        className="border-border mt-14 grid gap-8 border-t pt-8 sm:grid-cols-3"
      >
        {proof.map((figure) => (
          <Metric
            key={figure.label}
            value={figure.value}
            label={figure.label}
            delta={figure.delta}
            hint={figure.hint}
          />
        ))}
      </div>
    </Section>
  )
}

export default Hero03