import type { ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Price, type PriceProps } from '../../components/ui/price'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The one control a plan offers, and it is a link with a destination.
 *
 * A label and an `href` and nothing else, and the rejected alternative is a
 * `variant` the caller sets: the whole point of `featured` is that one plan is the
 * one a reader should be walked towards, so the weight of the control follows the
 * highlight rather than being a second thing to keep in step with it. Two plans
 * with two filled buttons is a row with no recommendation in it.
 *
 * There is no arm here for a control that is not a link, which is the cost of
 * keeping this Page a server Component: a consumer whose plan button opens a
 * checkout sheet or is a client router's `Link` composes the plan row itself out
 * of `Card`, `Price` and `CtaLink`, which is four lines, rather than a Page that
 * becomes a client module because one control wanted a handler.
 */
export type PricingPageAction = {
  /** The words on the control. The plan's own pitch, so they are the caller's. */
  label: string
  /** Where the control goes, rendered as a native anchor's `href`. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Almost never right on a plan: a reader
   * who has read a price and followed the control expects to arrive somewhere they
   * can come back from.
   */
  newTab?: boolean
}

/**
 * Every field of a plan except whether it is the one to choose.
 *
 * Not exported, because the two arms below are what a caller writes and this is
 * only the half they share. The two arms exist so that `featuredLabel` is required
 * wherever `featured` is set and forbidden where it is not, and a flat pair of
 * optional props could not say that: `featured?: boolean` beside
 * `featuredLabel?: string` typechecks a highlighted plan with no word for it, and
 * the run-time refusal below would then be the only thing standing between a
 * consumer and a card that is lifted, outlined and unexplained.
 */
type PricingPagePlanFacts = {
  /**
   * A stable key, carried on the markup as `data-plan` so a test and a consumer's
   * own script can name one card. Separate from `name` for the reason every id in
   * this package is: a rename in the copy is not a rename in a key.
   */
  id: string
  /** The plan's name, as the caller writes it. A card title, so it stays short. */
  name: string
  /** The line under the name: what this plan is for, in one sentence. */
  summary?: ReactNode
  /**
   * The amount, and everything about how it is formatted.
   *
   * A `PriceProps` and not a string, so the currency, the locale, the precision,
   * the period and what it replaced are all the caller's and `Intl` does the rest.
   */
  price: PriceProps
  /**
   * The line under the price, as a slot: the plan's own qualification, or a badge
   * the caller composes. `Pricing01` took a `badge?: string` and then rendered
   * the word "Popular" for a featured plan that passed none, so every consumer who
   * highlighted a plan inherited a claim about a plan they may not have had.
   */
  note?: ReactNode
  /**
   * The plan's action, when it has one. A plan whose control is "you already have
   * this" or "call us" may pass one; a plan with no control passes none and the
   * card ends under its price.
   */
  action?: PricingPageAction
}

/**
 * One plan in the row: the facts above, and either the highlight with its word or
 * no highlight at all.
 *
 * **`featuredLabel` is required wherever `featured` is set, and the run throws
 * without it.** A plan marked as the one to choose is a claim about the caller's
 * product, and a highlight with no word for it is a card that is lifted, outlined
 * and given a filled button while saying nothing about why it is the one. "Most
 * chosen", "Best value" and "Recommended" are three products' sentences, and the
 * only one of them that is true is the one the consumer wrote.
 */
export type PricingPagePlan = PricingPagePlanFacts &
  (
    | {
        /** Marks the one plan a reader should be walked towards. At most one. */
        featured: true
        /** The words naming why. Required here, and forbidden on the other arm. */
        featuredLabel: string
      }
    | {
        /** No highlight on this plan. */
        featured?: false
        /** No word is needed, because there is no highlight to name. */
        featuredLabel?: never
      }
  )

/**
 * The props a PricingPage takes.
 *
 * Every string, every amount and every destination is a prop and the Page ships
 * none of them. A pricing screen is the one screen where a hardcoded number is a
 * legal claim about somebody else's revenue, and it is the screen a consumer is
 * most tempted to fill in with their competitor's prices for comparison, so the
 * copy gate's rule is the same here as on every other item and matters more.
 */
export type PricingPageProps = {
  /** Optional label above the page's own heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The page's heading, and this Page's own `h1`.
   *
   * Required, and drawn by the Page rather than handed to a band. See the Page's
   * JSDoc for the two reasons and for what the rejected alternative was.
   */
  title: ReactNode
  /** One or two sentences under the heading, for what the plans have in common. */
  description?: ReactNode
  /**
   * The plans, in the order a reader should meet them.
   *
   * `readonly` because the normal way a consumer writes a plan list is an `as
   * const` fixture, and a prop typed as a mutable array rejects that fixture at the
   * moment it is most useful.
   *
   * The Page draws the row rather than composing `Pricing01`. That Block takes a
   * formatted `price: string`, an optional `badge` and its own section heading, so
   * a Page that wanted `Intl` formatting and a required word for a highlighted plan
   * would have to re-declare all three, and the price is the one number on the
   * screen that must be the consumer's currency in the consumer's locale.
   */
  plans: readonly PricingPagePlan[]
  /**
   * The notice that the prices moved, drawn between the heading and the plans.
   *
   * A band rather than a paragraph because a reader who has seen last month's
   * price and is looking at this month's one needs to be told the difference is
   * deliberate before they read the number, and a change notice below the plans is
   * a change notice read too late. The link is the caller's destination, which is
   * their changelog, their pricing history or their announcement.
   */
  changeNote?: {
    /** The headline of the notice: what moved. */
    title: ReactNode
    /** One or two sentences: when, and what else moved with it. */
    description?: ReactNode
    /** Where the full change goes, so a reader can check the claim. */
    href: string
    /** The words on that link. Required, because an address is punctuation. */
    hrefLabel: string
  }
  /**
   * The heading for the comparison band, for the caller who composes a
   * `PricingCompare01` into `matrix`.
   *
   * The Page owns the band, so it owns this heading, and the table is the
   * caller's. That split is the reason `matrix` is a node: the matrix is the most
   * consumer-specific thing on a pricing screen, down to how many plans and which
   * features, and a Page that owned it would own the plan list twice.
   */
  comparison?: {
    /** The band's heading. */
    title: ReactNode
    /** One or two sentences under it: what the matrix answers that the row did not. */
    description?: ReactNode
  }
  /**
   * The way to the caller's own exhaustive matrix, for the reader this Page's
   * summary is not enough for.
   *
   * Drawn above the matrix rather than beside the heading, because a reader who
   * wants every feature is looking down the page and the control belongs where
   * their eye already is.
   */
  compareLink?: {
    /** The words on the link. */
    label: string
    /** Where it goes. */
    href: string
  }
  /**
   * The feature matrix, which the caller composes.
   *
   * A node and not `ComponentProps<typeof PricingCompare01>` because the matrix is
   * a Block: a consumer who wants it swaps it for their own matrix, and a consumer
   * whose plans are not comparable writes no matrix at all.
   */
  matrix?: ReactNode
  /**
   * The bands under the comparison, in the order a reader should meet them: the
   * questions, then the closing offer.
   *
   * A `readonly ReactNode[]` and not a set of named slots, because those bands are
   * the caller's choice, in the caller's order, and a Page that named them would be
   * a Page that decided which questions a reader of this product asks. A `Faq01`
   * and a closing `Offer01` are the two this Page is shaped around, and a consumer
   * who wants them in another order passes them in another order.
   */
  bands?: readonly ReactNode[]
  /**
   * The level of the page's own heading, and one step below it for the plan names.
   *
   * Defaults to `h1`, because a Page owns the top of the document outline. A
   * consumer embedding this screen under a heading it already owns passes one
   * level deeper and the whole outline follows.
   */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Item. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The three checks a pricing row is most able to fail and least able to notice.
 *
 * Every one of them is about the highlight or about the row being a row at all,
 * and every one is a refusal rather than a repair. A row with no plan is a page
 * that says "pricing" over nothing; two highlighted plans are a row where the
 * highlight is on every card and therefore on none; a highlighted plan with no word
 * for it is a card that is lifted and unexplained, which is the exact defect
 * `pricing-01` shipped when it rendered the word "Popular" for a plan the consumer
 * never described.
 *
 * The messages name the plan's `id` rather than its index, because a caller with
 * five plans needs to know which one.
 */
function assertPlans(plans: readonly PricingPagePlan[]): void {
  if (plans.length === 0) {
    throw new Error(
      'PricingPage: plans is empty, so the screen renders a heading and nothing to read under it, which is a ' +
        'page that claims to sell something and names none of it. Pass the plans a reader is choosing between, ' +
        'or compose the heading and the bands yourself.',
    )
  }

  const highlighted = plans.filter((plan) => plan.featured === true)
  if (highlighted.length > 1) {
    throw new Error(
      `PricingPage: ${highlighted.length} plans are marked featured, and a plan row has one plan to walk a reader ` +
        'towards. Two highlighted plans is a row where the highlight is on every card and so on none of them. ' +
        'Mark one, or mark none and let the reader compare.',
    )
  }

  for (const plan of plans) {
    /*
      Both values are read before anything is compared, because comparing
      `plan.featured` narrows the union and the narrowed arm declares
      `featuredLabel?: never`, which would make every later read of the plan itself
      an error rather than a value.
    */
    const id = plan.id
    const label = plan.featuredLabel
    if (label !== undefined && plan.featured !== true) {
      throw new Error(
        `PricingPage: the plan "${id}" passes a featuredLabel with no featured, so the card would carry a ` +
          'word naming a highlight that is not there. Mark the plan featured as well, or drop the label.',
      )
    }
    if (plan.featured === true && !label) {
      throw new Error(
        `PricingPage: the plan "${id}" is marked featured with no featuredLabel, so the card would be lifted ` +
          'and given a filled control while saying nothing about why it is the one to choose. Pass the words your ' +
          'readers use for it.',
      )
    }
  }
}

/**
 * A complete pricing screen: what a reader must decide, what the choice costs, and
 * what to do when the summary has not answered them.
 *
 * **This is the third of the three Pages that `DESIGN.md` records under Known Open
 * Items as deferred to v1.1**, so it discharges that row rather than adding to the
 * tail. The other two are `OnboardingPage` and `ErrorPage`, and the three were
 * deferred together because a Page is the one unit that cannot be added later
 * without a consumer editing the file that already imported its neighbours.
 *
 * **The decision this Page makes is the order, and the order is a claim about how
 * a reader decides.** Four places, in this sequence: the heading, the change note
 * if there is one, the row of plans, and then the comparison. That sequence is an
 * argument: a reader who has not yet chosen wants the shape of the choice before
 * the detail of it, and a reader who has been choosing for a week wants the detail
 * and can already see the shape. Which decision happens in which place is the whole
 * of the Page's opinion, so it is worth naming each one.
 *
 * The first is the heading's, and the heading is the Page's own rather than a
 * band's. The plans band has no heading of its own, so a title drawn above it is
 * not competing with anything, and the rejected alternative was handing `title` to
 * a Block: `Pricing01` draws a section heading of its own, and a Page whose page
 * name is a band heading reads to a screen reader as a section called "pricing"
 * rather than as a page whose subject is pricing. Drawing it here also lets the
 * change note sit between the heading and the plans, which is the one place a
 * reader who has seen last month's price needs to be told something.
 *
 * The second is the row's, and the row is drawn here rather than delegated. The
 * page needs `Price` so the amount is the consumer's currency in the consumer's
 * locale, and it needs `featuredLabel` to be required rather than optional, and
 * `Pricing01` takes a formatted string and an optional badge. A Page that composed
 * it anyway would have had to re-declare both, so the row is four components and a
 * grid, and the one thing taken from `Pricing01` is its answer about alignment.
 *
 * The third is the comparison band's, and the split there is deliberate. The band,
 * its heading and its link are the Page's, because a band without a name is a table
 * in a page; the matrix is the caller's, because the matrix is the most
 * consumer-specific thing on a pricing screen. A caller who wants it elsewhere, or
 * twice, or not at all, passes it in `matrix` or does not.
 *
 * The fourth is the bands', and the Page has none of its own. Everything under the
 * comparison arrives in `bands`, in the caller's order, which is what keeps the
 * Page from deciding which questions a reader of this product should be asked.
 *
 * **The order costs something, and the cost is the point of stating it.** A
 * consumer whose objections belong above the plans, which is the honest answer for
 * a product whose objections are about trust rather than about price, cannot reorder
 * this screen. The correct price of an opinionated order is that they compose two
 * Pages and put the seam where the objection was, which is two page rhythms where
 * the author wanted one. The rejected alternatives were an `order` prop and a slots
 * array, and either would have moved the decision from this file to every call site,
 * which is to say it would have stopped being a Page and become a container for
 * three Blocks whose arrangement every consumer gets wrong differently.
 *
 * **`featured` marks one plan and the run throws otherwise, in three places: no
 * plans, two featured, and a featured plan with no word.** A pricing screen's
 * highlight is a claim about the caller's own pricing, and it is the claim a reader
 * is most likely to believe, so Prism will not make it for them. It will also not
 * let them make half of it, which is why the row is refused rather than drawn with
 * two lifted cards.
 *
 * **The plan row has no column count, and that is the shape the data gets.** The
 * row is a flex line whose cards divide the container at the medium breakpoint, so
 * one plan fills it, three are thirds and five are fifths. A fixed three-column grid
 * was rejected for the reason `DESIGN.md` states about Pages in general: it makes
 * the Page a component for the plan count its author happened to have, and a fourth
 * plan in a three-column grid wraps to a row of one and one, which reads as a
 * layout fault rather than as a fourth plan.
 *
 * It is a server Component. It fetches nothing, it imports no router and it takes
 * no function prop, so a consumer renders it from whichever route their framework
 * names for pricing, and the whole screen costs no client JavaScript until a Block
 * inside one of the bands needs it.
 */
export function PricingPage({
  eyebrow,
  title,
  description,
  plans,
  changeNote,
  comparison,
  compareLink,
  matrix,
  bands,
  headingLevel = 'h1',
  className,
}: PricingPageProps) {
  assertPlans(plans)

  /*
    A plan name is a card title, so it is a heading one step below the heading that
    introduces the row, which is the Page's own. Three plans under one `h1` are
    three `h2`s, and a hardcoded `h2` would be right exactly once.
  */
  const PlanHeading = childLevel(headingLevel)
  const BandHeading = childLevel(headingLevel)

  return (
    <div data-slot="pricing-page" className={cn(className)}>
      <Section data-slot="pricing-page-plans">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {changeNote === undefined ? null : (
          <div
            data-slot="pricing-page-change-note"
            className="border-border mt-10 flex flex-col items-start gap-4 border-t pt-6"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">{changeNote.title}</p>
              {changeNote.description === undefined ? null : (
                <p className="text-muted-foreground text-pretty text-sm">
                  {changeNote.description}
                </p>
              )}
            </div>
            <CtaLink href={changeNote.href} variant="outline" size="sm">
              {changeNote.hrefLabel}
            </CtaLink>
          </div>
        )}

        <div
          data-slot="pricing-page-plan-row"
          className="mt-12 flex flex-col gap-6 md:flex-row"
        >
          {plans.map((plan) => (
            <Card
              key={plan.id}
              data-slot="pricing-page-plan"
              data-plan={plan.id}
              data-featured={plan.featured === true ? 'true' : undefined}
              className={cn('md:flex-1 md:basis-0', plan.featured === true && 'border-primary shadow-md')}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle as={PlanHeading}>{plan.name}</CardTitle>
                  {plan.featured === true ? (
                    <Badge data-slot="pricing-page-featured">{plan.featuredLabel}</Badge>
                  ) : null}
                </div>
                {plan.summary === undefined ? null : (
                  <CardDescription>{plan.summary}</CardDescription>
                )}
                <Price {...plan.price} />
                {plan.note === undefined ? null : (
                  <p
                    data-slot="pricing-page-plan-note"
                    className="text-muted-foreground text-pretty text-sm"
                  >
                    {plan.note}
                  </p>
                )}
              </CardHeader>

              {plan.action === undefined ? null : (
                <CardFooter className="mt-auto">
                  {/*
                    The weight of the control follows the highlight rather than the
                    caller's word, which is the whole argument for `featured` being
                    the only thing that decides emphasis on this screen.
                  */}
                  <CtaLink
                    href={plan.action.href}
                    newTab={plan.action.newTab}
                    variant={plan.featured === true ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {plan.action.label}
                  </CtaLink>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </Section>

      {comparison === undefined && compareLink === undefined && matrix === undefined ? null : (
        <Section data-slot="pricing-page-comparison">
          {comparison === undefined ? null : (
            <SectionHeading
              as={BandHeading}
              align="left"
              title={comparison.title}
              description={comparison.description}
              className="mb-8"
            />
          )}

          {compareLink === undefined ? null : (
            <CtaLink
              data-slot="pricing-page-compare-link"
              href={compareLink.href}
              variant="outline"
              size="sm"
              className="mb-6"
            >
              {compareLink.label}
            </CtaLink>
          )}

          {matrix === undefined ? null : (
            <div data-slot="pricing-page-matrix">{matrix}</div>
          )}
        </Section>
      )}

      {/*
        The caller's bands, drawn as they arrive. Keyed by position on purpose: a
        band is a whole Block the caller composed and there is no state to preserve
        across a reorder, and a band is a ReactNode with no identity of its own to
        key on that would survive one.
      */}
      {bands?.map((band, index) => (
        <div key={index} data-slot="pricing-page-band" data-band={index}>
          {band}
        </div>
      ))}
    </div>
  )
}

export default PricingPage
