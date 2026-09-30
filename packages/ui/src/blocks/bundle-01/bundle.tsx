'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { NumberField } from '../../components/ui/number-field'
import { Price, type PriceProps } from '../../components/ui/price'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One thing a reader has put aside: what it is, how many of it, what one costs,
 * and what to do about either.
 *
 * **A cart is the storefront's word for a selection, and a selection is what this
 * Block draws, so the translation is a change of subject rather than a change of
 * shape.** A cart holds products a reader is about to buy; this row holds a set
 * of nodes an operator is about to provision onto an estate. The pattern
 * underneath is the same one in both: a line per chosen thing, a quantity the
 * reader can move, a price per unit, a line total, and a control that takes the
 * line out again. Everything the storefront version implies about money and
 * about products is a prop here, and the name, the description, the mark and the
 * note are the caller's own words, because a shared library has no catalogue to
 * describe.
 *
 * `quantity` is the datum and the stepper is a control over it, so `quantity` is
 * required rather than defaulted: a row that opened at one because this Block
 * chose one would be a claim about how much of something a reader wants.
 */
export type BundleItem = {
  /** A stable key for the row, and what `onQuantityChange` and `onRemove` report. */
  id: string
  /**
   * The name of the thing, as the caller writes it: a node, a role, a licence, a
   * region.
   *
   * A short noun phrase. It is the anchor of the row, and a name that wraps to two
   * lines is a row whose figures sit below their neighbours'.
   */
  name: string
  /**
   * The line under the name, for whatever the caller wants said about this thing
   * specifically: what it does, what it needs, what it costs more of.
   *
   * A node rather than a string, because three of the four consumer sites put a
   * link in it, pointing at the catalogue entry or at the pricing note, and a
   * `string` would force a flattening that loses whichever of those it could not
   * hold.
   */
  detail?: ReactNode
  /**
   * The mark beside the name, clipped to a fixed square so a row's height is the
   * same whichever mark a caller passes.
   *
   * A node and not a `src`, because a mark on a bundle row is not always a
   * picture: it is a monogram, a region code, a product's own glyph. Rendered as
   * given, so whether it is announced is the caller's decision.
   */
  mark?: ReactNode
  /**
   * How many of it the reader has asked for.
   *
   * A number rather than a node, for the reason `Leaderboard01Entry.value` gives:
   * a quantity is computed, so a caller whose quantities arrive as pre-formatted
   * strings cannot clamp them, compare them or add them up. The reading is the
   * number as it stands, and the words beside it are the caller's.
   */
  quantity: number
  /**
   * The smallest quantity the row will hold, clamped by the field on every path
   * that can produce a value.
   *
   * A number and not a sentence, for the reason `NumberField`'s own JSDoc gives:
   * without a bound a number field is a text field that happens to accept digits,
   * and a bundle whose second node is not provisioned in singles is a bundle
   * whose control lets the reader ask for something that cannot be.
   */
  min?: number
  /** The largest quantity the row will hold. See `min`. */
  max?: number
  /**
   * What one of them costs, with everything about how that amount is written.
   *
   * A `PriceProps` rather than a number and a symbol, and the argument is
   * `RateCard01`'s in full: a symbol says the currency and nothing else, while a
   * price also has a currency code, a precision, a period and a locale, and
   * `Intl` already knows all four. A bundle is a second surface where a
   * hardcoded symbol would be a legal claim about a market, because the figure at
   * the bottom of it is the number a reader is about to be charged.
   */
  unit?: PriceProps
  /** Where the thing is described in full. Rendered as a real link. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link announced by its address is punctuation rather than a name, which is
   * the same defect `Retention01` throws on. The sentence saying what following
   * it does belongs to the caller, because the destination is theirs.
   */
  hrefLabel?: string
  /**
   * The note under the row's figures, for the one thing about this line the
   * figures do not say: that it is prorated, that it is billed yearly, that the
   * second one is free.
   */
  note?: ReactNode
}

/**
 * The three names a stepper and its field need, and Prism cannot write any of
 * them.
 *
 * **A stepper is two icons and an icon has no name, so the names are the
 * caller's, and this is not a preference.** `NumberField` requires them for the
 * reason its own JSDoc states: a stepper is announced by whatever it is given, and
 * "increase" is wrong for at least one of every product's two languages. So the
 * pair is required rather than defaulted, and a caller that has not written them
 * yet gets a diagnostic rather than an English verb inside their product.
 *
 * `field` is the accessible name of the quantity field itself, and it is a
 * function rather than a string for the reason every figure in this package takes
 * a function: the name has to carry the row it belongs to, and "Quantity" on
 * three rows is the one name every field in this section shares, which is how two
 * fields in one form become indistinguishable to a screen reader.
 */
export type Bundle01QuantityLabels = {
  /** The accessible name of the control that adds one. */
  increment: string
  /** The accessible name of the control that takes one away. */
  decrement: string
  /** The accessible name of a row's quantity field, given the row. */
  field: (item: { id: string; name: string; quantity: number }) => string
}

/**
 * One line of the breakdown that sits above the total: what it is for, and what
 * it comes to.
 *
 * **The breakdown is required and the total is a prop, and the two decisions are
 * one decision.** A selection with a total and no breakdown is a total the reader
 * cannot check: they can see the figure and they cannot see the arithmetic that
 * produced it, and a number nobody can check is a number a reader has to take on
 * trust. So the caller states the lines, in their own order, and this Block draws
 * them beside the total rather than in a band a reader has to hold in their head
 * alongside it.
 *
 * The rejected alternative was a Block that added the rows up, and it is refused
 * for a reason that has nothing to do with arithmetic being difficult. A caller's
 * catalogue has rules this Block cannot see: a discount that applies over a
 * threshold, a credit already on the account, a tax that depends on where the
 * reader is, a floor under the whole run, a rounding rule applied once at the end
 * rather than per line. A Block that summed the rows would be choosing between
 * those rules without knowing any of them, and the figure it printed would be
 * wrong by exactly the amount a reader cared about. So the total is a prop, which
 * is the same relationship a real invoice has with the thing that issued it.
 */
export type BundleSummary = {
  /** A stable key for the line, because a breakdown may repeat a label. */
  id: string
  /** What this line is for, in the caller's words. */
  label: ReactNode
  /** What it comes to, already formatted by the caller. */
  value: ReactNode
  /**
   * Whether this is the line the eye should land on.
   *
   * A weight and a step rather than a fill or a rule, for the reason emphasis on
   * a figure is emphasis on a number: a surface behind a number is a surface a
   * reader has to read through.
   */
  emphasis?: boolean
}

/**
 * The props a Bundle01 takes, and the one conditional pair among them.
 *
 * Every string and every number is a prop and the Block ships none: no item, no
 * quantity, no price, no breakdown line, and not one word of the sentence that
 * says what a row's number counts. The stepper's two names and the remove
 * control's name are the sharpest version of that rule, because a Block that
 * hardcoded them would put an English verb and an English noun into every
 * consumer's product, in sentences the consumer cannot translate and this
 * package cannot see the context of.
 */
export type Bundle01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The heading. Required, because a selection with no heading is a fragment. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The things that have been put aside, in the order the reader chose them.
   *
   * Order is the caller's because it is a claim about what was chosen first, and a
   * Block that sorted a selection would be reordering a reader's decisions.
   */
  items: readonly BundleItem[]
  /**
   * Called with a row's `id` and the quantity the reader asked for.
   *
   * Optional, and its absence is a decision rather than a gap: a selection that
   * has been finalised somewhere else is drawn as a list of figures with no
   * control, because a control that changes nothing is a control that lies about
   * what is on the page. When it is absent no stepper is drawn at all.
   */
  onQuantityChange?: (id: string, quantity: number) => void
  /**
   * The names the two steppers and the quantity field are announced by.
   *
   * Optional in the type and required in practice whenever `onQuantityChange` is
   * set, and the run throws without it. The same arrangement `AuditLog01` uses
   * for `diffLabels` and `Project01` uses for `progressLabel`: a selection with
   * no handler on it should not have to invent two words for a control that Block
   * is not drawing, and a selection that has one cannot be shipped without them.
   * Two steppers with no names are announced as "button" twice, and a quantity
   * field with no name is announced as "spin button", which is the one name every
   * other field in this section shares.
   */
  quantityLabels?: Bundle01QuantityLabels
  /**
   * The name of the control that takes a row out of the selection, given the
   * row.
   *
   * A function for the reason `quantityLabels.field` is one: "Remove" on four
   * rows is one name for four different things, and a reader who hears it cannot
   * tell which node is about to leave the estate. It is in a union with
   * `onRemove` below, and that union is what makes the pairing enforceable rather
   * than a convention.
   */
  removeLabel?: (item: { id: string; name: string }) => string
  /**
   * The breakdown above the total, in the caller's own order.
   *
   * **Required, and the argument is on `BundleSummary`.** A selection with a
   * total and no breakdown is a total the reader cannot check, and a Block that
   * derived the total would be doing arithmetic on a catalogue whose rules it
   * cannot see: a threshold discount, a credit, a tax that depends on the reader,
   * a floor, a rounding applied once at the end. The caller states the lines and
   * the figure they come to, and this Block draws both.
   */
  summary: readonly BundleSummary[]
  /**
   * What the whole selection comes to.
   *
   * A `PriceProps` and never a number this Block derived, and the cost of that
   * refusal is named rather than hidden: a caller with a flat catalogue writes the
   * sum as well as the lines, and a caller whose rules change changes one place
   * rather than none. That is the cheaper mistake. A total this Block chose would
   * be a number a reader is about to be charged, chosen by a component that was
   * installed to draw a list.
   */
  total?: PriceProps
  /**
   * The controls under the total: the control that commits the selection, and the
   * route to the thing that explains it.
   *
   * A slot rather than a pair of named buttons, because which controls a
   * selection has is the caller's fact. An estate that provisions from a
   * selection and a shop that charges for one share this frame and nothing else,
   * and a Block that drew its own commit control would hand every consumer a
   * permission its product may not grant.
   */
  actions?: ReactNode
  /**
   * What the Block renders in place of the rows when there are none.
   *
   * Required, and a slot rather than a string, because a selection with nothing
   * in it is either a reader who has not chosen anything yet or a reader whose
   * whole selection has just been provisioned and removed, and those are opposite
   * claims. A Block that wrote either one would be wrong in half the products that
   * installed it.
   */
  empty: ReactNode
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
} & (
  | {
      /**
       * Called with a row's `id` when the reader takes it out.
       *
       * Required on this arm and forbidden on the other, for the reason the
       * authoring contract states: a prop that is required in one shape and
       * forbidden in another cannot be an optional beside an optional. A caller
       * who wrote `onRemove` and forgot `removeLabel` should not compile.
       */
      onRemove: (id: string) => void
      /**
       * The name of the control that takes this row out.
       *
       * Required on this arm, and a function for the reason `removeLabel`'s own
       * entry gives.
       */
      removeLabel: (item: { id: string; name: string }) => string
    }
  | {
      /** No control, so no name for one. */
      onRemove?: never
      removeLabel?: never
    }
)

/**
 * A selection of things with quantities, the figures each row carries, the
 * breakdown of what they come to, and the controls that commit them.
 *
 * **The quantity stepper is `NumberField` and the remove control is a `Button`,
 * and the rejected alternative for both is a `div` with a handler on it.** That
 * alternative is the reason this file is a client Component at all, and it is
 * worth saying what it costs in full. A `div` with `onClick` is not focusable, so
 * a keyboard reader cannot reach the control; it carries no role, so a screen
 * reader announces nothing at all where the control is; it has no disabled state,
 * so there is nothing to announce while a request is in flight; and it has no
 * activation semantics, so a reader pressing Space scrolls the page rather than
 * pressing the control. A stepper is worse than a remove control, because a
 * stepper that cannot be reached is a quantity a keyboard reader cannot change at
 * all, and a selection whose quantities cannot be changed is a selection whose
 * reader has to go somewhere else to do it. `NumberField` already answers all
 * four: it renders a real input, it names both steppers from a prop, and it
 * clamps a value that arrives from outside the row's own range rather than
 * displaying one number and submitting another. The `Button` is the same argument
 * in one control: a real `<button>` is in the tab order, announces as a button,
 * takes Space and Enter, and carries the focus ring at full strength.
 *
 * **The line total is the one piece of arithmetic in this file, and it is
 * `quantity` multiplied by the caller's own `unit.amount`, formatted by the
 * caller's own formatter.** The alternative was refusing to draw it, which would
 * have left a row with a per-unit price and no line figure, and that is a cart a
 * reader has to multiply in their head, which is the one thing a cart exists to
 * stop them doing. The multiplication is safe for a reason the total is not: both
 * factors are on this row, in this row's own props, and the reader can see them
 * either side of the result, so nothing here is a claim about a rule they cannot
 * check. A caller whose line total is not a multiple of its unit price has no
 * seam here, and the cost is named: that caller composes their own line figure
 * into `note`, and a selection with a per-line discount drawn as a note is less
 * legible than one where the discount is drawn as the figure it is.
 *
 * **`summary` is required and the total is a prop, and both are the same
 * decision.** A selection with a total and no breakdown is a total the reader
 * cannot check, and a Block that derived the total would be doing arithmetic on
 * a caller's catalogue: a discount that applies over a threshold, a credit
 * already on the account, a tax that depends on where the reader is, a floor
 * under the whole run, a rounding rule applied once at the end rather than per
 * line. A Block that summed the rows would be choosing between those rules
 * without knowing any of them, and the figure it printed would be wrong by
 * exactly the amount a reader cared about. So a derived total is a number the
 * Block chose, this Block never chooses one, and the caller states both the lines
 * and the figure they come to.
 *
 * **The stepper appears only where there is a handler, and that is a decision
 * about controls rather than about layout.** A quantity field with no
 * `onQuantityChange` is drawn as a figure in the mono face, and no control is
 * drawn at all. The alternative was to draw the field read-only, which looks
 * identical to the editable one and differs only in whether the reader can do
 * anything, and a control that looks live and is not is worse than no control: a
 * reader presses it, nothing happens, and they learn that the rest of the page
 * does not respond either. The same argument is why `onRemove` and `removeLabel`
 * are a union rather than two optionals.
 *
 * **The row is a list, not a table, and the reason is that a row's figures are
 * not comparable across rows.** A table is the right answer when a reader's
 * question is a comparison: is this row cheaper than that, does this one come
 * before that. Here the question is a decision about one thing, and a row is read
 * as a unit with its figures at the end of it. A screen reader navigating a table
 * here would hear four column headings per row for a set of values that is not a
 * grid, and a caller who genuinely has a grid of them wants `Summary01`, which is
 * the Block for a set of lines and their total.
 *
 * **An empty selection draws the caller's sentence and nothing else, and the cost
 * is that a heading can survive on a page whose selection has just been
 * committed.** The alternative was to draw the breakdown and the total over no
 * rows, which is a receipt for a purchase that has not happened, and this Block
 * will not print one.
 *
 * It is a client Component, and the reason is the handlers rather than any state
 * of its own. `onQuantityChange` and `onRemove` are functions, a function is a
 * piece of state, and state is a client module: a server Component cannot hand an
 * event handler down to a `<button>`, so a caller rendering this from a server
 * page gets a selection whose controls do nothing. The cost is stated rather than
 * hidden, and it is the cost every form Block in this package pays: a selection
 * with no handler on it is still a client Component, because the directive is a
 * property of the module rather than of a call, and the alternative was a Block
 * whose `onRemove` silently did nothing in a server render, which is worse than
 * a client boundary nobody asked for.
 */
export function Bundle01({
  eyebrow,
  title,
  description,
  items,
  onQuantityChange,
  quantityLabels,
  onRemove,
  removeLabel,
  summary,
  total,
  actions,
  empty,
  headingLevel = 'h2',
  className,
}: Bundle01Props) {
  for (const item of items) {
    if ((item.href === undefined) !== (item.hrefLabel === undefined)) {
      throw new Error(
        `Bundle01: the row "${item.name}" declares one of href and hrefLabel without the other, so the ` +
          'row would carry a link with no words on it, or a name with no link beside it. Pass the words ' +
          'that say what following it does, or drop the href.',
      )
    }
  }

  if (onQuantityChange !== undefined && quantityLabels === undefined) {
    throw new Error(
      'Bundle01: onQuantityChange is set and quantityLabels is not, so every stepper on this selection ' +
        'would be two icons with no accessible name, and every quantity field would be announced as a ' +
        'spin button, which is the one name all of them share. Pass the two names your readers use for ' +
        'the steppers and the function that names a row field.',
    )
  }

  if (items.length === 0) {
    return (
      <Section data-slot="bundle-01" data-empty="true" className={cn(className)}>
        <div data-slot="bundle-01-body" className="flex flex-col gap-8">
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <div data-slot="bundle-01-empty" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section data-slot="bundle-01" className={cn(className)}>
      <div data-slot="bundle-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          One `<ul>`, and a row is an `<li>`. A selection that wrapped into a grid
          would be several lists, and a screen reader would announce it as several,
          which is precisely the set-where-a-list-was that this Block exists to
          avoid. The figures sit at the trailing edge in their own group, so a
          reader scanning for the total finds every row's figures in one place
          rather than in three.
        */}
        <ul data-slot="bundle-01-items" className="flex flex-col">
          {items.map((item) => (
            <li
              key={item.id}
              data-slot="bundle-01-item"
              data-item={item.id}
              className="border-border flex flex-col gap-4 border-b py-5 first:border-t sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {item.mark === undefined ? null : (
                  /*
                    The mark, clipped to a fixed square, so a row's height is the
                    same whichever mark a caller passes. Left in the accessibility
                    tree because a monogram and a region code both carry something
                    a row's name does not, and a caller whose mark really is
                    decoration hides it themselves.
                  */
                  <span
                    data-slot="bundle-01-mark"
                    className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-xs font-semibold"
                  >
                    {item.mark}
                  </span>
                )}

                <div data-slot="bundle-01-text" className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold">
                    {item.href === undefined || item.hrefLabel === undefined ? (
                      item.name
                    ) : (
                      /*
                        A `CtaLink` at the ghost weight, so the link carries the
                        focus ring, the announced role of a link and a destination
                        the reader can see before following it. The words are the
                        caller's, and the pair `href` and `hrefLabel` is checked
                        above rather than being allowed to resolve to a link with
                        no accessible name.
                      */
                      <CtaLink
                        data-slot="bundle-01-link"
                        href={item.href}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                      >
                        {item.hrefLabel}
                      </CtaLink>
                    )}
                  </span>

                  {item.detail === undefined ? null : (
                    <span
                      data-slot="bundle-01-detail"
                      className="text-muted-foreground text-pretty text-sm"
                    >
                      {item.detail}
                    </span>
                  )}
                </div>
              </div>

              <div
                data-slot="bundle-01-figures"
                className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3"
              >
                {onQuantityChange === undefined ? (
                  /*
                    No handler, so no control. The figure is in the mono face
                    because a quantity is a machine-readable reading and this is the
                    mono stack annotating one, and it is not the stepper: a control
                    that looks live and is not teaches a reader that the rest of the
                    page does not respond either.
                  */
                  <span data-slot="bundle-01-quantity" className="font-mono text-sm tabular-nums">
                    {item.quantity}
                  </span>
                ) : (
                  <NumberField
                    data-slot="bundle-01-quantity"
                    labels={quantityLabels as Bundle01QuantityLabels}
                    aria-label={quantityLabels?.field({
                      id: item.id,
                      name: item.name,
                      quantity: item.quantity,
                    })}
                    value={item.quantity}
                    onValueChange={(next) => {
                      if (next === null) return
                      onQuantityChange(item.id, next)
                    }}
                    min={item.min}
                    max={item.max}
                    className="w-24"
                  />
                )}

                {item.unit === undefined ? null : (
                  <span data-slot="bundle-01-unit" className="text-muted-foreground text-sm">
                    <Price {...item.unit} size="sm" />
                  </span>
                )}

                {item.unit === undefined || item.unit.amount === undefined ? null : (
                  /*
                    The line total, and the one multiplication in this file. See the
                    JSDoc above: both factors are on this row and the caller's own
                    `PriceProps` does the formatting, so the reader can see the
                    arithmetic either side of the result. It is drawn a step above
                    the unit price, because it is the figure the row is for and the
                    unit price is the qualifier beside it.
                  */
                  <Price
                    data-slot="bundle-01-line"
                    {...item.unit}
                    amount={item.unit.amount * item.quantity}
                    size="md"
                    className="font-semibold"
                  />
                )}

                {onRemove === undefined || removeLabel === undefined ? null : (
                  <Button
                    data-slot="bundle-01-remove"
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                  >
                    {removeLabel({ id: item.id, name: item.name })}
                  </Button>
                )}
              </div>

              {item.note === undefined ? null : (
                <span
                  data-slot="bundle-01-note"
                  className="text-muted-foreground shrink-0 text-pretty text-xs sm:max-w-64"
                >
                  {item.note}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div data-slot="bundle-01-summary" className="flex flex-col gap-4">
          {total === undefined ? null : (
            <Price data-slot="bundle-01-total" {...total} size="xl" />
          )}

          {/*
            A definition list, because a breakdown is a set of names and their
            figures and nothing else. The order is the caller's, and a breakdown
            reordered would be a statement about which part of the price matters
            most, which is the caller's to make.
          */}
          <dl className="flex flex-col gap-2">
            {summary.map((line) => (
              <div
                key={line.id}
                data-slot="bundle-01-summary-line"
                data-emphasis={line.emphasis ? 'true' : undefined}
                className="flex items-baseline justify-between gap-6"
              >
                <dt
                  className={cn(
                    'text-muted-foreground text-sm',
                    line.emphasis ? 'text-foreground font-medium' : null,
                  )}
                >
                  {line.label}
                </dt>
                <dd
                  className={cn(
                    'text-right text-sm tabular-nums',
                    line.emphasis ? 'text-base font-semibold' : null,
                  )}
                >
                  {line.value}
                </dd>
              </div>
            ))}
          </dl>

          {actions === undefined ? null : (
            <div data-slot="bundle-01-actions" className="flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

export default Bundle01
