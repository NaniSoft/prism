import { Check, Minus } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Price, type PriceProps } from '../../components/ui/price'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The one control a plan's column offers.
 *
 * A link, with a required destination, for the reason `Cta01Action` gives in full:
 * a control with no handler navigates nothing, and a call to action that navigates
 * nothing is a button wearing a link's clothes. A consumer whose control is not a
 * link at all, a client router's `Link` or a form that posts, uses the Block's
 * `actions` function instead, and the two are not unioned here because the Block
 * resolves them at the same call site and a union at the Block level would make
 * every caller read both arms to find out which one is live.
 */
export type PricingCompareAction = {
  /** The control's own words. The caller's, because a plan's action is its pitch. */
  label: string
  /** Where the control goes. Rendered as a native anchor's `href`. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Declared rather than inferred, for the
   * reason `Cta01Action.newTab` states.
   */
  newTab?: boolean
  /**
   * Which weight this control draws at.
   *
   * All three are legal on this Block, and the reason is the surface. `Cta01`
   * draws a filled `bg-primary` band and a `default` control on it is the band's
   * colour against the band's colour; this Block draws a table on the page ground,
   * so `default` is the page's own emphasis and is what a matrix wants for the
   * plan a reader is being walked towards. The measurement behind the rule is in
   * `Cta01Action.variant` and in `packages/ui/scripts/check-variant-ink.mjs`.
   */
  variant?: 'default' | 'secondary' | 'outline'
}

/**
 * One plan: the column heading, the price, and whatever the reader needs beside
 * them.
 *
 * `id` is the identity, and it is separate from `name` for the reason every id in
 * this package is separate from its display text: the id is what `highlight` and
 * `actions` match on, and a name is display content that a caller may rewrite in
 * one release and not the other.
 */
export type PricingComparePlan = {
  /** Stable identity. Matched by `highlight` and passed to `actions`. */
  id: string
  /** The plan's name, as the caller writes it. */
  name: string
  /**
   * The amount, and everything about how it is formatted.
   *
   * A `PriceProps` rather than a string, so the currency, the locale, the
   * precision and the period are all the caller's and `Intl` does the rest. See
   * `Price` for why a Block composes it rather than printing a symbol.
   */
  price: PriceProps
  /**
   * The line under the price: the plan's own qualification, or a slot for a
   * control such as a `Badge` the caller composes.
   *
   * A slot rather than a `badge?: string`, and the reason is the defect this
   * Block's own copy law was written against. `pricing-01` took a `badge?: string`
   * and then rendered the word "Popular" for a featured plan that passed none, so
 * *every* consumer who highlighted a plan inherited a claim about that plan. Here
   * a plan with no note renders nothing, and a caller who wants a badge writes
   * their own word and their own component into this slot.
   */
  note?: ReactNode
  /** The plan's action, when it is a link. See `PricingCompareAction`. */
  action?: PricingCompareAction
}

/**
 * One row: a feature and what each plan does with it.
 *
 * `values` is positional and its length must equal the number of plans. There is
 * no id per value and there is no second object to merge, because a matrix cell
 * is the intersection of two things that already exist and a keyed object would
 * be a third place for a caller to get the two out of step.
 */
export type PricingCompareFeature = {
  /** Stable identity, used for the row's key. */
  id: string
  /**
   * The feature's name, as the caller writes it, and the row's header.
   *
   * A short noun phrase. A feature whose name wraps to two lines is a row whose
   * plan cells are vertically centred against two lines of prose, and a matrix
   * read down a column loses its alignment on the longest row.
   */
  label: string
  /**
   * One answer per plan, in the order the plans were given.
   *
   * The union is the whole design of the cell. A `boolean` renders Prism's own
   * two marks, a `Check` and a muted dash, each beside the caller's word from
   * `labels`; anything else is rendered exactly as the caller wrote it, because a
   * value that is not a yes and not a no is a number, a limit or a phrase and
   * Prism has no way to know which, so it prints none of them.
   *
   * An array whose length does not match `plans` is a thrown diagnostic rather
   * than a short row. See the JSDoc on the Block.
   */
  values: readonly (boolean | ReactNode)[]
  /**
   * The qualification under the feature's name: what the answer means, or what it
   * excludes.
   *
   * A string rather than a node because this is the one cell in the row that is
   * always one sentence, and a caller who needs a link in it needs the cell
   * below, not a sentence with a hole in it.
   */
  note?: string
}

/**
 * A band of features under one name.
 *
 * Groups are the caller's because grouping is a claim about how the features
 * relate, which is a fact about the product and not about the matrix. Most
 * matrices are one group, and that is a legitimate answer: pass one group with an
 * empty `title` and it is the only row of headers the table carries.
 */
export type PricingCompareGroup = {
  /** The group's name, as the caller writes it. */
  title: string
  /** The features in this group, in the order a reader should meet them. */
  features: readonly PricingCompareFeature[]
}

/**
 * The two words a matrix needs, and it needs both.
 *
 * Required, and the argument for requiring the negative one is the whole reason
 * this object exists. A `true` cell carries a word, so a screen reader announces
 * an answer. A `false` cell that carried only a muted dash would announce nothing,
 * and a cell that announces nothing in a column of forty cells that do reads as a
 * rendering fault rather than as an answer, with nothing in the document to tell
 * the two apart. So the dash is a shape and the word is the answer, and a
 * consumer whose product has no word for "not included" has to write one, which
 * is the right kind of forcing: it turns a silent omission into a decision the
 * consumer made.
 */
export type PricingCompare01Labels = {
  /** Announced beside the check in an included cell. */
  included: string
  /** Announced beside the dash in a cell that says the feature is not included. */
  excluded: string
}

/**
 * The props a PricingCompare01 takes.
 *
 * Every string is a prop and the Block ships none: no plan, no price, no feature
 * name, no feature label, no cell value, no badge word and not one of the two
 * words a cell announces. A matrix is the densest arrangement of claims a product
 * makes about itself, and it is the arrangement where one hardcoded word is
 * hardest to notice, because the reader is looking at forty cells and reading none
 * of them.
 */
export type PricingCompare01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Omit it for a matrix composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The plans, in the order a reader should meet them. Order is the caller's. */
  plans: readonly PricingComparePlan[]
  /**
   * The features, grouped. Group order is the caller's, and so is the order
   * inside each group, for the same reason.
   */
  groups: readonly PricingCompareGroup[]
  /**
   * The words the two cell answers announce. See `PricingCompare01Labels`.
   */
  labels: PricingCompare01Labels
  /**
   * The plan `id` to point at, or nothing for a matrix that points at none.
   *
   * A named id rather than a `featured?: boolean` on the plan, because a plan may
   * only be named by its own `id` and a boolean would let two plans claim it. The
   * Block reads it as a fill on that plan's column and nothing else: no badge, no
   * ordering, no change to any answer. The judgment about which plan a reader
   * should be walked towards is the consumer's, and the design system's share of
   * it is a tint.
   */
  highlight?: string
  /**
   * The control for a plan that passed no `action`, called with the plan's `id`.
   *
   * This is the slot arm, and it exists because the link arm cannot be every
   * control: a consumer whose pricing table lives behind a client router, or whose
   * plan button opens a checkout sheet, has a control with no `href` at all. The
   * per-plan `action` wins when both are given, so a caller can mix a real link on
   * one plan with a router link on another.
   */
  actions?: (id: string) => ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the matrix. Layout only; every visual property is Prism's. */
  className?: string
}

/**
 * One cell: the mark and the word, or the caller's own value as the caller wrote
 * it.
 *
 * A component in the module and not a second Item, because it has no public
 * surface and nothing to document for a consumer. It exists so the two boolean
 * arms are written once, and they are written once because the span wrapping the
 * mark and the visually hidden word is the part that is easy to get subtly wrong
 * three times in a row.
 */
function MatrixCell({
  value,
  labels,
}: {
  value: boolean | ReactNode
  labels: PricingCompare01Labels
}) {
  if (typeof value === 'boolean') {
    return value ? (
      <span
        data-slot="pricing-compare-answer"
        className="text-success inline-flex items-center gap-1.5"
      >
        <Check aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">{labels.included}</span>
      </span>
    ) : (
      <span
        data-slot="pricing-compare-answer"
        className="text-muted-foreground inline-flex items-center gap-1.5"
      >
        <Minus aria-hidden className="size-4 shrink-0" />
        <span className="sr-only">{labels.excluded}</span>
      </span>
    )
  }
  return <span data-slot="pricing-compare-value">{value}</span>
}

/**
 * A feature-by-plan matrix: the plans across the top, the features down the side,
 * and one cell per intersection saying what the plan does with the feature.
 *
 * **It is a real `<table>`, and the rejected alternative is a grid of `div`s that
 * looks the same.** A comparison matrix is the one table on a marketing page, and
 * a reader using a screen reader navigates it by header: they ask the table for a
 * column and hear the plan's name, then move down the cells and hear each answer
 * against that name, and they ask for a row and hear the feature and then its
 * answers. A grid of `div`s has no header cells to ask for, so the same reader
 * receives forty cells of unlabelled text and has to hold the column in their head
 * while reading down it, which is the single task a matrix exists to remove. The
 * cost of the table is the one every real table carries: `Table` wraps the whole
 * thing in a horizontally scrollable container, because four plans do not fit a
 * phone, and a matrix that reflowed into a stack would no longer be a matrix. The
 * scroll is the price and it is worth naming rather than hiding, because the
 * alternative is not a narrower matrix, it is a div grid.
 *
 * **A `true` is a `Check` beside the caller's own word, and never a bare icon.**
 * This is the whole of `check-block-copy.mjs` in one cell. An icon that is not
 * labelled is invisible to a screen reader, and a "yes" that is only a tick is a
 * claim the reader has to infer from a shape, which is inference dressed as
 * information. So the mark is `aria-hidden` and the caller's word sits beside it in
 * a visually hidden span: the reader hears the answer, a reader who cannot separate
 * `success` from `muted` gets the same answer, and the shape is left free to be
 * the shape. The same rule runs the other way, which is why a `false` cell is a
 * muted dash plus the caller's negative word rather than a dash marked
 * `aria-hidden` on its own: a cell that announces nothing beside forty that
 * announce something is a rendering fault, and nothing in the document tells a
 * reader which it is.
 *
 * **A `values` array that does not match `plans` throws.** This is the defect
 * this Block is most able to produce and least able to notice. Four plans and three
 * values renders perfectly: the markup is valid, the table has a price header over
 * it, the styling is correct, and a column is simply not there. A silent
 * truncation in a matrix is a claim about a plan nobody made, and a reader cannot
 * tell it from a rendering bug, so the Block refuses the props instead of
 * rendering them. The cost is a render that throws in development rather than a
 * page that lies in production, and the alternative was considered and refused: a
 * pad of empty cells would have turned a caller's mistake into a document in which
 * four plans have no answer to a feature.
 *
 * **The group is a row group, and a group's name is a table header rather than a
 * heading.** Each group is its own `<tbody>` and its name is a `th` with
 * `scope="rowgroup"`, which is what HTML offers for a header that names the rows
 * below it, so a screen reader announces the group when the reader enters it
 * rather than repeating it over every column. It is deliberately not in the page
 * outline: a group name is a band of rows and not a section of the page, and seven
 * group names in the outline would be seven entries for a reader navigating by
 * heading who expected sections.
 *
 * **A plan name is a heading, at `childLevel(headingLevel)`.** The plan is the
 * column's title, a reader who navigates by heading wants to reach the plan, and a
 * matrix embedded one level deeper than it was written for must carry its plan
 * names with it, which is what the function is for.
 *
 * **No plan name, price, feature label or badge word is the Block's.** The copy
 * law is not new here, but this is where it is hardest, and `pricing-01` shipped
 * the exact defect it exists for: a featured plan with no badge of its own
 * rendered the word "Popular", so every consumer who highlighted a plan inherited
 * a claim about a plan the consumer may not have had. A plan here carries a `note`
 * slot, a caller who wants a badge composes their own word and their own
 * component into it, and a highlighted plan with no note renders nothing at all,
 * which is the honest answer for a plan whose only distinction is that the caller
 * pointed at it. `highlight` tints that plan's column and does nothing else: it
 * adds no badge, moves no plan, and changes no answer, because the judgment about
 * which plan a reader should be walked towards is the consumer's.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * `Check` and the `Minus` are drawn as vectors, so a matrix costs no JavaScript.
 */
export function PricingCompare01({
  eyebrow,
  title,
  description,
  plans,
  groups,
  labels,
  highlight,
  actions,
  headingLevel = 'h2',
  className,
}: PricingCompare01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  if (plans.length === 0) {
    throw new Error(
      'PricingCompare01: plans is empty, so the matrix has no columns and the table would render a ' +
        'header row and nothing else. Pass the plans a reader is choosing between.',
    )
  }
  if (groups.length === 0) {
    throw new Error(
      'PricingCompare01: groups is empty, so the matrix has no rows. Pass one group, even when its title ' +
        'is empty, rather than leaving the reader with a row of prices and no features beside them.',
    )
  }
  for (const group of groups) {
    for (const feature of group.features) {
      if (feature.values.length !== plans.length) {
        throw new Error(
          `PricingCompare01: the feature '${feature.label}' has ${feature.values.length} value(s) and there ` +
            `are ${plans.length} plan(s). A short row renders a plan with no answer, which is a claim ` +
            'nobody made, so it is refused rather than padded.',
        )
      }
    }
  }

  // A plan is a column, and a column is a title inside the section that
  // introduces the set, so three plans under one `h2` are three `h3`s.
  const PlanHeading = childLevel(headingLevel)
  const columns = plans.length + 1
  const isHighlighted = (id: string) => highlight === id

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          id={headingId}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <div data-slot="pricing-compare" className={cn('flex flex-col gap-4', className)}>
        <div className="border-border overflow-hidden rounded-xl border">

          {/*
           * The table takes its name from the heading above it rather than from a
           * second copy of the same words. A `<table>` is named by a caption, an
           * `aria-label` or an `aria-labelledby`, and none of the three is inferred
           * from a heading that happens to be nearby, so a reader listing the tables
           * on a page found this one anonymous while every other element around it was
           * named. A reference rather than a caption because a caption is drawn, and a
           * visible line repeating the heading is noise; a reference because `title`
           * is the caller own words and a Block may not compose a second set. See
           * `Table`, which asks for exactly one of the three.
           */}
          <Table aria-labelledby={title ? headingId : undefined}>
            <TableHeader>
              <TableRow>
                {/*
                  The corner. Empty on purpose: the first column holds row
                  headers, so a word here would name a column of feature names,
                  which is not what the column is.
                */}
                <TableHead className="w-48 align-bottom" />
                {plans.map((plan) => (
                  <TableHead
                    key={plan.id}
                    scope="col"
                    data-plan={plan.id}
                    data-highlight={isHighlighted(plan.id) ? 'true' : undefined}
                    className={cn(
                      'w-40 whitespace-normal align-bottom',
                      isHighlighted(plan.id) && 'bg-muted/50',
                    )}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <PlanHeading className="text-base font-semibold tracking-tight text-balance">
                        {plan.name}
                      </PlanHeading>
                      <Price {...plan.price} />
                      {plan.note ? (
                        <span data-slot="pricing-compare-plan-note" className="text-sm">
                          {plan.note}
                        </span>
                      ) : null}
                      {plan.action ? (
                        <CtaLink
                          data-slot="pricing-compare-action"
                          size="sm"
                          variant={plan.action.variant ?? 'default'}
                          href={plan.action.href}
                          newTab={plan.action.newTab}
                        >
                          {plan.action.label}
                        </CtaLink>
                      ) : actions ? (
                        <span data-slot="pricing-compare-action">{actions(plan.id)}</span>
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {groups.map((group, groupIndex) => (
              // Positional: a group's title is display content and a caller may
              // legitimately split a ladder into two bands under one name.
              <TableBody key={groupIndex} data-slot="pricing-compare-group">
                <TableRow>
                  <TableHead
                    scope="rowgroup"
                    colSpan={columns}
                    className="bg-muted/50 whitespace-normal"
                  >
                    <span className="text-sm font-semibold">{group.title}</span>
                  </TableHead>
                </TableRow>
                {group.features.map((feature) => (
                  <TableRow key={feature.id} data-slot="pricing-compare-feature">
                    <TableHead
                      scope="row"
                      className="w-48 align-top whitespace-normal font-normal"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{feature.label}</span>
                        {feature.note ? (
                          <span className="text-muted-foreground text-xs font-normal">
                            {feature.note}
                          </span>
                        ) : null}
                      </span>
                    </TableHead>
                    {feature.values.map((value, index) => (
                      <TableCell
                        key={plans[index].id}
                        data-plan={plans[index].id}
                        data-highlight={isHighlighted(plans[index].id) ? 'true' : undefined}
                        className={cn(
                          isHighlighted(plans[index].id) && 'bg-muted/50',
                        )}
                      >
                        <MatrixCell value={value} labels={labels} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </div>
      </div>
    </Section>
  )
}

export default PricingCompare01
