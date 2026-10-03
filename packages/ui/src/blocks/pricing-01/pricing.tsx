import { Fragment, type ReactNode } from 'react'

import { Check } from 'lucide-react'

import { Badge } from '../../components/ui/badge'
import { CtaLink } from '../../components/ui/cta-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'

/**
 * One plan's control, when it is a destination.
 *
 * One of the two arms of `PricingAction`, and named rather than left as an inline
 * member of the union so a caller building `plans` from its own data can say which
 * arm it is building. `href` is required and that is the whole of the arm.
 */
export type PricingLinkAction = {
  /** The words on the control. A plan's action is its pitch, so it is the caller's. */
  label: string
  /**
   * Where the control goes. Rendered as a native anchor's `href`.
   *
   * **Required, and this member did not exist.** `Plan` declared a required `cta`
   * string and the Block rendered it as a `Button`, so every plan in every consumer's
   * pricing table shipped a focusable control, announced as a button, that activated
   * to nothing, at the foot of the card that a reader was about to decide on. A price
   * is the one number on a marketing page a reader acts on, and the control beside it
   * did nothing.
   */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Declared rather than inferred, for the
   * reason `Cta01Action.newTab` states.
   */
  newTab?: boolean
  /** Forbidden, so that an action cannot be both a destination and a caller's own control. */
  slot?: never
}

/**
 * One plan's control, when it is the caller's own.
 *
 * **This is the arm that replaced a rendered button, and the reason it is a slot
 * rather than an `onClick` is that a Block cannot receive one.** This is a server
 * Component, so a handler is not a prop it can be given. A plan's control is also the
 * one place a pricing table most often needs a control Prism cannot draw: a trial
 * that opens a checkout dialog, a contact form for the top tier, a router's own
 * `Link` for a client-side transition into the plan.
 *
 * The Block places the node in the card's foot and adds nothing to it, because a
 * class it adds to a node it does not render is a style the caller cannot see and
 * cannot remove, and this package has no override path.
 */
export type PricingSlotAction = {
  /**
   * The caller's own control, placed in the card's foot.
   *
   * The whole control, including its own label, its own weight and any icon. A plan
   * with a slot action draws no `Button` of its own, so the caller's weight is the
   * weight a reader sees and there is nothing here that can contradict it.
   */
  slot: ReactNode
  /**
   * Forbidden on this arm, and for a reason rather than by tidiness: the Block
   * renders `slot` and nothing else, so a `label` beside it would be a word no
   * reader ever sees.
   */
  label?: never
  /** Forbidden: an anchor belongs on the other arm, where Prism renders it. */
  href?: never
  /** Forbidden with `href`, for the same reason. */
  newTab?: never
}

/**
 * One plan's control, as a union of the two things a control at the foot of a
 * pricing card can honestly be.
 *
 * A plan carries exactly one control, so this is not an ordered row and the slot is
 * an arm of the plan's own record rather than a sibling prop on the Block: `Plan` is
 * one entry in a list, and a sibling `actionSlot` on `Pricing01` could not say which
 * card it filled. Position and element are the same value here for the same reason
 * they are in a hero's row.
 *
 * It is declared here rather than imported from `cta-01`, following
 * `ProcessFlow01`'s note on the same point, and `scripts/check-block-controls.mjs`
 * holds the shape: a shared type would make `@nanisoft/prism-ui/blocks/cta-01` a
 * dependency of `@nanisoft/prism-ui/blocks/pricing-01`, and a consumer installing a
 * pricing table would be made to resolve a closing call-to-action band to get it.
 */
export type PricingAction = PricingLinkAction | PricingSlotAction

export type Plan = {
  /**
   * A stable key for this plan, and the only thing about it React keys on.
   *
   * **Required, and it did not exist: the cards were keyed on `name`.** `name` is
   * the word a reader reads on the card, so it is display content and not identity,
   * and a Block that keyed on it had two ways to be wrong at once. Two plans
   * sharing a name, which is a monthly and an annual row of the same tier or a
   * "Standard" and a "Standard (legacy)" line a product is migrating away from,
   * produced a duplicate key and cards the renderer had been told are ambiguous.
   * And a rename in the copy was a rename in the key, which loses a caller's saved
   * selection or expanded state over an edit to a sentence.
   *
   * The route or the product's own plan code is the usual value and needs no
   * coordination. `Careers01` and every other Block in this package key on an `id`
   * and say why in the same words; this is the last one that did not, and the reason
   * it survived is recorded in the release that introduced `action` rather than
   * here.
   */
  id: string
  /** The plan's own name, which is what the card's title reads. */
  name: string
  price: string
  /** Rendered after the price, e.g. " / month". Omit for a one-off figure. */
  period?: string
  body?: string
  features: string[]
  /**
   * The one control at the foot of this card.
   *
   * **A union of a destination and a slot, and it replaces a required `cta`
   * string.** The string compiled and rendered a `Button`, which is a control that
   * activates to nothing; a pricing card is the last thing a reader sees before they
   * choose, so that is the worst place in the package to ship one. See
   * `PricingAction`.
   */
  action: PricingAction
  /** Lifts the plan with a primary border and a filled button. */
  featured?: boolean
  /** Overrides the "Popular" badge on the featured plan. */
  badge?: string
}

export type Pricing01Props = {
  eyebrow?: string
  title?: string
  description?: string
  plans: Plan[]
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A three-up plan comparison.
 *
 * Every plan is a prop, including the price and the call to action. It previously
 * hardcoded "$0 / $24 / $68", "Talk to us", "MIT licence" and "Figma library",
 * and shipped a heading reading "Pricing" above a title already reading "Pick a
 * plan". A shared library has no plans to sell, so those strings described a
 * business that does not exist here, and every consumer who installed the block
 * inherited them.
 *
 * The section heading is aligned left, for the reason `FeatureGrid01` now records
 * in full and `test/section-heading-align.test.tsx` holds: three cards sit under
 * it, and a centred title above a left-aligned grid reads as two unrelated pieces.
 * `Pricing01` and `FeatureGrid01` were the only two Blocks that left the heading
 * centred over content, and neither had a stated reason for it, so both were
 * taking the default rather than making a decision.
 *
 * **The card's foot is a link or the caller's own control, and never a button of
 * this Block's.** `Plan` used to carry a required `cta` string and the Block
 * rendered it as a `Button`, so every pricing table in every consumer's product
 * shipped a focusable control, announced as a button, that activated to nothing,
 * on the card a reader was about to choose from. See `PricingAction`.
 */
export function Pricing01({
  eyebrow,
  title,
  description,
  plans,
  headingLevel = 'h2',
}: Pricing01Props) {
  // A plan name is a heading one step below the section that introduces the set,
  // so three plans under one `h2` are three `h3`s and not three competing sections.
  const Title = childLevel(headingLevel)
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

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={plan.featured ? 'border-primary shadow-md' : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <Title>{plan.name}</Title>
                </CardTitle>
                {plan.featured && plan.badge ? <Badge>{plan.badge}</Badge> : null}
              </div>
              {plan.body ? <CardDescription>{plan.body}</CardDescription> : null}
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {plan.price}
                {plan.period ? (
                  <span className="text-muted-foreground text-sm font-normal">
                    {plan.period}
                  </span>
                ) : null}
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {/*
                Keyed by position, not by the feature string. The string is display
                content rather than identity, and a plan is free to list the same
                line twice; keying on it logged React's duplicate-key error and let
                React drop and reorder rows. `key={index}` is correct here because
                this list is static: it is rendered once from props and never
                reordered, filtered or appended to, so there is no state to
                preserve across a reorder that a positional key could lose.
              */}
              {plan.features.map((feature, index) => (
                <p key={index} className="flex items-start gap-2 text-sm">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  {feature}
                </p>
              ))}
            </CardContent>

            <CardFooter className="mt-auto">
              {/*
                The card's one control. A link arm draws a native anchor; a slot arm
                draws the caller's own node and nothing else, so a plan whose control
                is a checkout trigger looks like the consumer's checkout trigger
                rather than like this Block's idea of one. Keyed with the card rather
                than separately: `key={plan.id}` above already identifies the card,
                and a second key on the foot would be a second identity for one
                element.
              */}
              {'slot' in plan.action ? (
                <Fragment>{plan.action.slot}</Fragment>
              ) : (
                <CtaLink
                  href={plan.action.href}
                  newTab={plan.action.newTab}
                  className="w-full"
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  {plan.action.label}
                </CtaLink>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default Pricing01
