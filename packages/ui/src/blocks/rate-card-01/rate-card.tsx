import { useId, type ReactNode } from 'react'

import { Price, type PriceProps } from '../../components/ui/price'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
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
 * One row: a tier, what it costs, and what comes with it.
 *
 * `tier` is the caller's word and never one Prism invents, for the reason
 * `StatusLedger01` gives for its four tiers: between four products the same
 * ladder is called eight different things, and the vocabulary belongs in the row
 * rather than in the type. A type here would be a ladder Prism chose and a
 * consumer had to argue with, and a consumer with a pricing model that is not a
 * ladder at all, a flat rate with a floor, a per-market price, has nowhere to put
 * it.
 */
export type RateCard01Rate = {
  /** Stable identity, used for the row's key. */
  id: string
  /**
   * The name of this band of usage, as the caller writes it: a volume band, a
   * word, a market.
   *
   * A short noun phrase. The column is scanned down its left edge and a tier that
   * wraps to two lines is a row whose amount sits below its neighbours'.
   */
  tier: string
  /**
   * What the tier costs, and everything about how that amount is written.
   *
   * A `PriceProps` rather than a number and a symbol, and the argument for that is
   * the Block's own JSDoc below.
   */
  amount: PriceProps
  /**
   * What the tier includes before the overage applies, in the caller's own words
   * and units: an allowance, a count, a ceiling.
   *
   * A string and not a number because a rate card's allowance is rarely a bare
   * figure. "Ten thousand rows", "the first five gigabytes" and "10" are three
   * products' decisions, and a `number` prop would make two of them impossible.
   */
  included?: string
  /** What it costs past `included`, with its own period. See `amount`. */
  overage?: PriceProps
}

/**
 * The column names a rate card needs, and it needs all of them.
 *
 * Three words, all required, and none of them is Prism's. The reason they are
 * required rather than optional is the one `PricingCompare01Labels` is built on: a
 * column whose heading is missing is a column a reader identifies by counting from
 * the left, and a table with three columns where two are named and one is not
 * reads as a table with a mistake in it. A caller with no allowances passes words
 * for two columns they will not render, which is a small price for the rule that
 * no column in a rate card is identified by its position.
 *
 * The rate column's heading is not here. It is the `unit` prop, because the
 * column of amounts is headed by the noun those amounts count, and a heading that
 * said "Rate" beside a period that already says "a month" would be the same fact
 * twice.
 */
export type RateCard01Labels = {
  /** The heading of the column that names each band of usage. */
  tier: string
  /** The heading of the allowance column. */
  included: string
  /** The heading of the past-the-allowance column. */
  overage: string
}

/**
 * The props a RateCard01 takes.
 *
 * Every string is a prop and the Block ships none: no unit, no tier, no amount, no
 * allowance, no overage rate and no column name. A rate card is a price list, and
 * a price list is the densest claim a product makes about itself per square inch,
 * so a single hardcoded currency symbol on this Block would be a sentence in four
 * consumer products at once.
 */
export type RateCard01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Omit it for a rate card composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The noun the numbers count, in the caller's own words and grammar: an agent
   * run, a gigabyte captured, a tracked node, a thousand API calls.
   *
   * Required, and it is the heading of the rate column rather than a decoration,
   * for the reason a price without a unit is not a price: a reader who cannot see
   * what they are buying is being asked to guess, and the guess is the whole cost
   * of the number. It is a string rather than a node because a column heading is
   * one phrase, and a caller who needs a footnote on the unit has `description`
   * and `footnote` for it.
   */
  unit: string
  /** The rates, in the order a reader should meet them. */
  rates: readonly RateCard01Rate[]
  /** The column names. See `RateCard01Labels`. */
  labels: RateCard01Labels
  /**
   * The line under the card: the rounding rule, the billing granularity, the
   * sentence that qualifies every number on the page.
   *
   * A node rather than a string, because three of the four products that would
   * install this carry a link inside it, pointing at the tax treatment or the
   * full tariff.
   */
  footnote?: ReactNode
  /**
   * The control under the card, for the link to the full document.
   *
   * A slot rather than a `documentLabel` and a `documentHref` pair, because the
   * control is usually a call to action the caller already has, and re-declaring
   * it here would give a product two buttons that say the same thing in two
   * weights.
   */
  actions?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the card. Layout only; every visual property is Prism's. */
  className?: string
}

/**
 * A price list per unit: what something costs, measured by a unit the caller
 * names, with the period, the allowance, the overage and a slot for the full
 * document.
 *
 * **It composes `Price` rather than printing a currency, and the argument is that
 * a rate card is the one Block where a hardcoded symbol would be a legal claim
 * about a market.** It would also still be the wrong answer. A symbol is the least
 * of what a price needs: a symbol says the currency and nothing else, while a rate
 * card also has a currency code, a precision, a period and a locale, and `Intl`
 * already knows all four. A rate card is the place where those four matter most,
 * because the numbers are small and the reader is checking them, so a rate card
 * that printed a dollar sign and two decimal places would be wrong in most of the
 * world and wrong for a unit price everywhere, and a design system that hardcoded
 * it would be making that call for every consumer. `Price` composes the platform's
 * formatter, which is already localised and already in every runtime a browser
 * has. The cost is worth naming: `Intl` is a constructor rather than a template, so
 * a server Component builds one per request rather than one at build, and a page
 * that prints a hundred rates builds a hundred formatters. A consumer whose rates
 * are on a hot path caches the formatter itself, which is a better home for that
 * knowledge than a design system. See `Price` for the rest of the argument.
 *
 * **The `tier` is the caller's word, and there is no ladder in the type.** See
 * `RateCard01Rate.tier`. The rejected alternative was a `RateTier` union of four or
 * five names, which would have been a pricing model: a flat rate with a floor, a
 * per-market price and a per-seat price are all real rate cards and none of them
 * fits a ladder, and a consumer with one would have had to put it in `tier` as a
 * string anyway, with none of the type's help.
 *
 * **A rate card with no tiers is a rate card with one row, and one row renders
 * correctly.** This is stated because the alternative was quietly assumed. A
 * layout that only reads correctly with two rows is a layout with a minimum, and
 * a minimum is a claim about how many bands a price has; the header row, the
 * single data row and the column widths are all the same with one as with six, and
 * nothing here is padded, centred or measured against a second row. The cost is
 * that a one-row card looks sparse, and the honest answer to that is a title that
 * says what the single rate is rather than a heading for a ladder that is not
 * there.
 *
 * **The allowance and overage columns render when the data has them, not when the
 * caller asks for them.** A column that exists for some rows and not others is a
 * column a reader has to check, and a card that shows a "what is included" column
 * of empty cells because one tier happens to have no allowance is a card making a
 * claim about that tier. So each of the two is drawn when at least one rate carries
 * it, and a rate that does not gets an empty cell rather than a placeholder: see
 * `Price`'s JSDoc for why a Component that prints a placeholder where it has no
 * data has chosen a sentence, and the same argument applies to an empty cell in an
 * allowance column.
 *
 * **It is a real table, for the same reason the comparison matrix is one.** A
 * rate card is read down the tier column and across the amount columns, and a
 * reader using a screen reader navigates it by heading in both directions. The
 * cost is the horizontal scroll on a narrow viewport, which `Table` provides and
 * which is cheaper than losing the headers.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * formatting is arithmetic over props that happens to go through the platform.
 */
export function RateCard01({
  eyebrow,
  title,
  description,
  unit,
  rates,
  labels,
  footnote,
  actions,
  headingLevel = 'h2',
  className,
}: RateCard01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  if (rates.length === 0) {
    throw new Error(
      'RateCard01: rates is empty, so the card is a row of column headings over no rows. Pass at least ' +
        'one rate, which is the ordinary case for a flat price.',
    )
  }

  // Read from the data rather than declared, because whether a card has an
  // allowance column is a fact about the pricing and not a prop a caller has to
  // keep in step with the rates.
  const hasIncluded = rates.some((rate) => rate.included !== undefined)
  const hasOverage = rates.some((rate) => rate.overage !== undefined)

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

      <div data-slot="rate-card" className={cn('flex flex-col gap-4', className)}>
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
                <TableHead scope="col" className="w-48">
                  {labels.tier}
                </TableHead>
                <TableHead scope="col">{unit}</TableHead>
                {hasIncluded ? (
                  <TableHead scope="col" className="whitespace-normal">
                    {labels.included}
                  </TableHead>
                ) : null}
                {hasOverage ? (
                  <TableHead scope="col" className="whitespace-normal">
                    {labels.overage}
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id} data-slot="rate-card-rate">
                  <TableHead
                    scope="row"
                    className="w-48 align-top whitespace-normal font-normal"
                  >
                    <span className="text-sm font-medium">{rate.tier}</span>
                  </TableHead>
                  <TableCell>
                    <Price {...rate.amount} size="md" />
                  </TableCell>
                  {hasIncluded ? (
                    <TableCell className="align-top whitespace-normal">
                      {rate.included ? (
                        <span className="text-sm text-pretty">{rate.included}</span>
                      ) : null}
                    </TableCell>
                  ) : null}
                  {hasOverage ? (
                    <TableCell>
                      {rate.overage ? <Price {...rate.overage} size="sm" /> : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {footnote ? (
          <p data-slot="rate-card-footnote" className="text-muted-foreground text-pretty text-sm">
            {footnote}
          </p>
        ) : null}

        {actions ? (
          <div data-slot="rate-card-actions" className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export default RateCard01
