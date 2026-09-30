import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/*
 * **This is filed under Data display and not Typography, and the reason is that a
 * price is a figure rather than a piece of running text.** It was authored under
 * Typography, and the site build refused the tree, which is the disagreement
 * `DESIGN.md` says the Category folder is supposed to catch: a Component filed
 * under a folder that is not its Category still publishes its route and still
 * leaves the sidebar, so the taxonomy catches it rather than a reader finding an
 * item filed in the wrong place. `Typography` in this package is the family that
 * styles running text: `Prose`, `Mark`, `Kbd` and the type scale itself. A price
 * is a number with a currency, a period and a comparison, which is the same shape
 * as `Metric` and belongs beside it. The two are the pair a reader meets in one
 * place on a pricing page, and a design system that filed them in different
 * categories would be telling a reader they are different kinds of thing.
 */

/** The authored type-scale steps a Price amount is set at, and nothing else. */
const AMOUNT_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

/**
 * The step the period and the comparison are set at: one below the amount.
 *
 * The comparison has to be subordinate in three ways at once, and the size is one
 * of them. A fixed `text-sm` would leave the amount and its comparison the same
 * size at `size="sm"`, so the map steps down rather than pinning, and a
 * comparison that is the same size as the price beside it stops reading as a
 * comparison.
 */
const SECONDARY_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
  xl: 'text-lg',
}

/**
 * The props the Price accepts.
 *
 * The first half is a union rather than a set of optional props, and it is a
 * union for the reason `HeroAction` is one: a caller who supplies `format` has
 * said the platform is not formatting this price, and with `currency` merely
 * optional the type system cannot see that `locale`, `currency` and
 * `maximumFractionDigits` are all dead on that arm. Only a union lets the
 * exception be seen. A caller whose currency has no `Intl` data, or whose price
 * is really a range or a phrase, passes `format` and is not also made to invent a
 * currency code for a formatter that will never read it.
 *
 * The second half is the presentation, and it is shared by both arms because a
 * formatter changes what the words are and not how they are set.
 */
export type PriceProps = Omit<ComponentProps<'div'>, 'children'> &
  (
    | {
        /**
         * The amount, in the currency's own minor units. Omit it and the Price
         * renders nothing at all; see the JSDoc on the Component.
         */
        amount?: number
        /**
         * The ISO 4217 code of the currency, such as `USD`, `EUR` or `JPY`.
         *
         * Required on this arm because it is the one prop that says what the
         * number means, and a currency code is a machine value a platform
         * recognises rather than a sentence anyone has to translate.
         */
        currency: string
        /**
         * The locale the platform formats for. Omit it for the runtime's own
         * default, which is the right answer on a server and the wrong one on a
         * page that serves several languages, so a multilingual consumer should
         * pass it.
         */
        locale?: Intl.LocalesArgument
        /**
         * How many fraction digits the amount is shown with.
         *
         * Omit it and the currency's own rule applies, which is two for a
         * dollar and zero for a yen. That default is the reason this prop exists
         * at all: a price the consumer has decided has no meaningful cents gets
         * `0` here rather than a trailing `.00` on every line of a table.
         */
        maximumFractionDigits?: number
        /** Replace the platform's formatter entirely. On this arm it is not passed. */
        format?: never
      }
    | {
        /** The amount, in whatever unit `format` reads. */
        amount?: number
        /**
         * The words for an amount, replacing `Intl` completely.
         *
         * The escape hatch, and the reason it replaces rather than adjusts: a
         * currency with no data in the runtime's tables, an amount that is a
         * range or a phrase, a price in a unit no `style` names, and a consumer
         * whose accounting renders in a currency and reads in another. All four
         * are one function away.
         */
        format: (amount: number) => string
        locale?: never
        currency?: never
        maximumFractionDigits?: never
      }
  ) & {
    /**
     * The amount this one replaced, shown struck through beside it.
     *
     * A number in the same unit as `amount`, and formatted by whatever formats
     * `amount`, so the two are never rendered by two different rules.
     */
    compareAt?: number
    /**
     * What the amount is per, set after the amount it belongs to.
     *
     * The caller's words and the caller's punctuation, because "per month" and
     * "/mo" and "a month" are three products' decisions. A Price that shipped
     * one of them would be shipping a pricing model.
     */
    period?: ReactNode
    /**
     * The type-scale step the amount is set at. @defaultValue 'lg'
     *
     * Four steps and no arbitrary value, so a price is always at a size the type
     * scale authored. The default is `lg` because a price is usually the largest
     * thing in a narrow component and the surrounding layout decides the rest;
     * `xl` is a step up for a price that is the page's subject, and the step
     * above that is out of reach on purpose, because a price set larger than the
     * title beside it stops reading as a price and starts reading as a headline.
     */
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }

/**
 * A monetary amount with its currency, and optionally what it replaced.
 *
 * **The formatter is `Intl`, and the argument is that Prism is not entitled to
 * a currency.** A library that hardcoded a dollar sign and two decimal places
 * makes two claims about every consumer that installs it: that the consumer's
 * market is the one that writes dollars, and that the consumer's prices have two
 * decimal places of meaning. The first is wrong in most of the world and the
 * second is wrong for a unit price, a seat, a token and a whole number of
 * licences. `Intl` is the platform's own answer to both questions, it is already
 * localised, and it is already in every runtime a browser has, so a Price that
 * wrote its own would be a second formatter in every consumer's bundle. The cost
 * is worth naming: `Intl` is a constructor rather than a template, so a server
 * Component constructs one per request rather than one at build, and a page that
 * prints a thousand prices constructs a thousand formatters. A consumer whose
 * prices are on a hot path caches the formatter itself, which is a better place
 * for that knowledge than a design system.
 *
 * **The comparison is a strikethrough, and the rejected alternative is a
 * Badge.** A strikethrough is the convention, so a reader who has seen a
 * comparison price in a shop, a search result and a receipt recognises it
 * without being taught. A Badge would put a filled surface and a colour on a
 * claim about a price, and the claim is the consumer's: whether the amount it
 * replaced was ever charged is a fact about the consumer's billing, not a state
 * this Component can colour. A comparison struck through in the muted foreground
 * is subordinate in three ways at once, by the line through it, by the step down
 * from the amount, and by the ink, and it is the amount that is read.
 *
 * **No amount renders nothing, and that is the honest answer rather than a
 * zero.** A Price with no `amount` is a price a product has not computed yet: a
 * first load, a currency that has not been resolved, a plan whose region has no
 * price. An empty fragment says "there is no price here", which is true. A dash,
 * a question mark or a zero says "the price is zero", which is a claim about a
 * consumer's revenue that this Component has no standing to make and a reader
 * has no way to disprove. This is the same decision `FactList` makes for an empty
 * list, and the reason it is worth copying rather than inventing: a Component
 * that renders a placeholder where it has no data is a Component that has chosen
 * a sentence, and a design system's job is not to choose one on a consumer's
 * behalf. The cost is a layout that closes up and reopens as the amount arrives,
 * which is the same cost every empty state in this system carries.
 *
 * **The period belongs to the amount, so it sits with the amount and before the
 * comparison.** A comparison rendered between them would read as another
 * per-period figure, and a struck-through price per month next to a monthly
 * price is a comparison nobody intended.
 *
 * It is a server Component: no hook, no state, and the formatting is arithmetic
 * over props that happens to go through the platform.
 */
function Price({
  className,
  amount,
  format,
  locale,
  currency,
  maximumFractionDigits,
  compareAt,
  period,
  size = 'lg',
  ...props
}: PriceProps) {
  // No amount is no price, and an empty fragment is the whole answer. See the
  // JSDoc above for why this is not a placeholder.
  if (amount === undefined) return null

  // Built only on the arm that has no formatter of its own, which is the arm
  // whose union member required a currency, so the platform never sees
  // `style: 'currency'` without one.
  const read =
    format ??
    ((value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        // Undefined rather than omitted, which the platform reads as "the
        // currency's own rule", so a price with no `maximumFractionDigits` prop
        // gets a yen's zero and a dollar's two without this Component choosing.
        maximumFractionDigits,
      }).format(value))

  return (
    <div
      data-slot="price"
      className={cn('flex flex-wrap items-baseline gap-x-2', className)}
      {...props}
    >
      <span
        data-slot="price-amount"
        className={cn('font-semibold tracking-tight tabular-nums', AMOUNT_SIZE[size])}
      >
        {read(amount)}
      </span>

      {period === undefined ? null : (
        <span
          data-slot="price-period"
          className={cn('text-muted-foreground', SECONDARY_SIZE[size])}
        >
          {period}
        </span>
      )}

      {compareAt === undefined ? null : (
        <s
          data-slot="price-compare"
          className={cn('text-muted-foreground tabular-nums', SECONDARY_SIZE[size])}
        >
          {read(compareAt)}
        </s>
      )}
    </div>
  )
}

export { Price }
