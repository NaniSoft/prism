import type { ComponentProps, ReactNode } from 'react'

import { Meter, type MeterTone } from './meter'
import { Status, type StatusTone } from './status'
import { cn } from '../../lib/utils'

/**
 * One category in a list of shares of one whole.
 *
 * The shape is closed and short because the unit is a share: a category has a name,
 * a measured quantity, an optional state, and an optional printed form. Nothing
 * else a caller might reach for here is in the type, and the reason each absent
 * member is absent is on the member.
 */
export type ProportionListItem = {
  /**
   * The category's own name.
   *
   * A string rather than a node, and that is the one narrowing in this file with a
   * reason behind it: the name is also the accessible name `Meter` requires for
   * its track, so a node here would force this Component to invent a word for the
   * bar or to give it the label of the figure. A category's name is a name, and it
   * is the one thing on the row that is never a composed figure.
   */
  label: string
  /**
   * The measured quantity, in the caller's own units.
   *
   * A magnitude and not a percentage, because a caller holding counts of two
   * hundred and forty has counts and not a share, and computing the share is one
   * division this Component can do without claiming anything about the data.
   */
  value: number
  /**
   * The words for the value, printed in place of the computed share.
   *
   * A node, because the printed form is often more than a percentage: "1,204
   * captures", "42% of £2.9M", "4 of 9 sites". Omitted, the share is printed as a
   * percentage to `precision` places, which is honest when the whole is the
   * denominator and is a claim about the caller's domain when it is not, which is
   * why the prop exists.
   */
  text?: ReactNode
  /**
   * The state of this category, in the contract's tones and with the caller's words.
   *
   * Required as a pair rather than two members because `Status` refuses to render
   * a tone without words: a dot with no label is a colour a screen reader cannot
   * read and a sighted reader who cannot separate the tones cannot either. Passing
   * `tone` alone would be a state with no name, so the pair is the whole of it.
   *
   * The tone also fills the bar, through the map below. See that map for what a
   * tone means to a bar and what it does not.
   */
  status?: {
    /** Which of the five tones the dot takes. */
    tone: StatusTone
    /** The words naming the state, in the product's own vocabulary. */
    label: ReactNode
  }
}

/**
 * The bar's fill, from the state the caller put beside it.
 *
 * `StatusTone` is the wider of the two closed sets, because it is the one the
 * caller is already using for a state wherever else they show one, and a list with
 * its own narrower set would make the caller translate between two vocabularies for
 * the same judgement. `MeterTone` is narrower and has no `info`, so `info` takes the
 * neutral fill, and that cost is named on `status` and on this Component rather than
 * hidden here.
 *
 * The mapping is a fact about two closed sets rather than a judgement about
 * urgency. Nothing in this file decides whether a category is alarming: the caller
 * named the tone, and a Component that graded a bar by how its own number compared
 * to a ceiling would be making a claim about a budget this file cannot see.
 */
const BAR_FILL: Record<StatusTone, MeterTone> = {
  neutral: 'neutral',
  info: 'neutral',
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
}

/** The props the ProportionList accepts. */
export interface ProportionListProps extends Omit<ComponentProps<'figure'>, 'children'> {
  /**
   * The categories, in the order they are drawn and read.
   *
   * The order is the ranking, and nothing here sorts: a share list is nearly always
   * a caller's own ordering, and a Component that sorted by value would put a list
   * of three deliberately ordered categories into a different order with nothing
   * said.
   */
  items: readonly ProportionListItem[]
  /**
   * What the shares are a share of, in the caller's own units.
   *
   * Omitted, the whole is the sum of the items, which is the ordinary case: a list
   * of every category of one thing adds up to the thing. Pass it when the list does
   * not exhaust the whole, a list of the top six of eleven categories, or one that
   * deliberately leaves out a remainder, because a bar measured against a sum that
   * is not the whole is a bar that overstates every category on the page.
   *
   * The cost of omitting it is a silent wrong denominator, and the only defence
   * would be a prop Prism has no way to fill: a Component cannot tell an exhaustive
   * list from a truncated one.
   */
  total?: number
  /**
   * How many decimal places the computed share is printed to. @defaultValue 1
   *
   * One place because a share is a rounded quantity and a reader comparing two
   * categories is comparing tenths of a percent. Pass `0` for a whole-number share,
   * which is the right answer whenever the underlying counts are small enough that
   * a tenth of a percent is noise.
   */
  precision?: number
  /**
   * The name of the figure, read before the categories.
   *
   * Required rather than defaulted, for the two reasons `ChartFrame` states and the
   * rest of the package repeats: two lists on a dashboard are two lists a reader
   * cannot tell apart, and a list with no name is neither announced nor linkable. A
   * figure named "Breakdown" is a Component shipping a sentence about a product it
   * knows nothing about.
   */
  label: string
  /**
   * The sentence under the list, which is where the whole belongs.
   *
   * The caller's words, because naming the whole is a claim about the data: "of
   * £2.9M committed", "of 9 sites", "of readings this week". This Component knows
   * the sum and not the thing summed, so it prints no total and puts no unit beside
   * the shares. That is also the cost of the arrangement, and it is a real one: a
   * reader who wants the whole has to be given the sentence, and a list with no
   * `caption` says only what the shares say.
   */
  caption?: ReactNode
  /** What a reader is told when there is nothing to show. */
  empty?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * Each labelled category's share of one whole, as a proportional bar and a number.
 *
 * **The unit is a share, and that is what the whole Component is built around.** A
 * part-to-whole with two or three parts is a `Chart` `donut`, and a series of
 * unrelated values against a shared baseline is a `Chart` `bar`; neither is this,
 * because a list of shares is neither of those things. Its bars cannot be modelled
 * as independent series, since they are constrained to sum to the whole and a
 * reader comparing two of them is comparing two slices of one pie rather than two
 * measurements against a scale. So there is no `series` prop, no `mark`, and no
 * axis: the bar is drawn from `value` against `total`, and the number printed
 * beside it is that same division, so the two cannot disagree with each other or
 * with the data.
 *
 * **The bar is decorative and the number is the reading, said plainly.** `Meter`
 * draws the track and the fill, and the row wraps it in an `aria-hidden` box on
 * purpose: a meter announces its name and its value, and the row already prints
 * both, so an announced bar beside a printed one is the same sentence twice for
 * every row on the page. `Meter` requires a name and the only name in the row is
 * the category's own, so `label` is forwarded to it rather than invented, and the
 * forwarding is invisible because the wrapper is hidden. A reader who cannot rank
 * the fills still has every number, which is the whole reason the number is printed
 * rather than left to the bar.
 *
 * **A share is drawn on one scale, so the bars are comparable down the page.** Every
 * row's fill is `value / total` of the same track, and the tracks are the same
 * width, which is what makes two categories comparable at a glance. That is the
 * reason this is a list of bars rather than a stacked bar: a stack puts the shares
 * in one figure, where the reader has to find the boundary between two categories
 * to compare them, and a list puts each one on its own common baseline.
 *
 * **`Meter` is used rather than a second bar drawn here, and the honest cost is a
 * palette of three state tones against five.** Composing it means the bar, its
 * tone vocabulary and its accessibility are one Component's rather than two, and it
 * means a share list looks like every other measurement in the product, which is
 * what a reader wants from a bar. The cost is that `StatusTone` and `MeterTone` are
 * different widths: there is no informational fill, so a category whose state is
 * `info` draws a neutral bar and its colour meaning is carried by the dot beside the
 * label. The alternative was a second set of fills authored here, and that is a
 * second source of truth for a scale the tokens already own.
 *
 * **Two inputs throw, because a share that cannot be drawn is not a quiet share.**
 * A negative quantity and a whole that is zero or less are both impossible rather
 * than unusual, and both have exactly one honest rendering, which is to stop: a
 * negative share drawn as an empty bar claims the category is zero when it is
 * below zero, and a list drawn against a total of zero divides by nothing. The
 * alternative was to clamp, which is what `Chart` does for a value past the end of
 * its axis, and the reason it does not apply here is that there is no axis to be
 * past: the whole is the denominator and it is either there or it is not.
 *
 * **The rows are a list, so a reader is told how many categories there are.**
 * `<ul>` and `<li>` rather than a table of divs, because a reader moving by list
 * item is told the count and each row is one stop, and because nothing in a
 * category list is tabular data: there is one measure and it is beside its name.
 * The rows are also not interactive, and no motion is attached to them for the same
 * reason: a hover state on a row that cannot be pressed is an affordance for
 * something the page does not do.
 *
 * **An empty list renders the caller's sentence rather than nothing.** A heading
 * with no rows says the whole is nothing, and hiding the figure leaves a reader
 * wondering whether it had been missed, which is the argument `Retention01` makes
 * for leaving a withdrawn schedule on the page.
 *
 * **It is a server Component.** There is no state, no effect and no handler, the
 * whole figure is arithmetic over props, and a dashboard of proportions costs no
 * client code at all. `Status` and `Meter` are server Components too, so composing
 * them costs nothing at this boundary either.
 */
function ProportionList({
  className,
  items,
  total,
  precision = 1,
  label,
  caption,
  empty,
  ...props
}: ProportionListProps) {
  const whole = total ?? items.reduce((sum, item) => sum + item.value, 0)

  // A nonsense `precision` is floored at zero rather than reaching `toFixed`, which
  // throws on a negative count, for the reason `CohortGrid` gives its own: a
  // rounding instruction is a reading instruction and a typo in one should not take
  // a page down.
  const places = Math.min(20, Math.max(0, Math.floor(precision)))

  /*
   * The refusals are inside the `items.length > 0` test because an empty list is a
   * state a caller reaches rather than a bug: with no categories there is no
   * category to be negative and no whole to divide by, so there is nothing to
   * refuse and the caller's own sentence renders below.
   */
  if (items.length > 0) {
    for (const item of items) {
      if (!Number.isFinite(item.value) || item.value < 0) {
        throw new Error(
          `ProportionList: the category '${item.label}' has the value ${String(item.value)}, which is not a ` +
            'quantity a share can be taken of. A negative category is a subtraction somewhere upstream, and ' +
            'a category whose value went missing is a query that did not come back; neither is something a ' +
            'bar can draw honestly, so this stops rather than showing it as nothing.',
        )
      }
    }

    if (!Number.isFinite(whole) || whole <= 0) {
      throw new Error(
        `ProportionList: the whole is ${String(whole)}, so there is nothing for a share to be a share of. ` +
          'Either no category carries a value or the total you passed is not positive. Pass a total that ' +
          'names what the categories are shares of, and a category whose value is genuinely nothing is a 0.',
      )
    }
  }

  return (
    <figure
      data-slot="proportion-list"
      data-count={items.length}
      aria-label={label}
      className={cn('flex w-full flex-col gap-3', className)}
      {...props}
    >
      {items.length === 0 ? (
        <p data-slot="proportion-list-empty" className="text-muted-foreground text-sm">
          {empty ?? null}
        </p>
      ) : (
        <ul data-slot="proportion-list-rows" className="flex flex-col gap-2">
          {items.map((item, index) => {
            const share = (item.value / whole) * 100
            // The bar is filled from the printed figure rather than from the exact
            // quotient, so the length a reader measures and the number a reader reads
            // are the same number to the last decimal. A bar at 64.2087 percent beside
            // a printed 64.2 is one fact drawn twice, and a difference of one part in a
            // thousand is not worth the two versions of it.
            const printed = share.toFixed(places)
            return (
              <li
                key={`${item.label}-${index}`}
                data-slot="proportion-list-row"
                className="flex items-center gap-3"
              >
                {item.status === undefined ? null : (
                  <Status
                    tone={item.status.tone}
                    label={item.status.label}
                    size="sm"
                    className="shrink-0"
                  />
                )}
                <span
                  data-slot="proportion-list-label"
                  className="min-w-0 flex-1 truncate text-sm font-medium"
                >
                  {item.label}
                </span>
                {/*
                  One fixed width for every track, so two categories are comparable
                  down the page. It is a layout decision rather than a visual one,
                  which is why it is on the box the row lays out and not on `Meter`,
                  whose own width is `w-full` by design. A `div` and not a `span`,
                  because `Meter` renders flow content and a phrasing element cannot
                  contain it.
                */}
                <div data-slot="proportion-list-bar" aria-hidden="true" className="w-32 shrink-0">
                  <Meter
                    value={Number(printed)}
                    label={item.label}
                    tone={item.status === undefined ? undefined : BAR_FILL[item.status.tone]}
                  />
                </div>
                <span
                  data-slot="proportion-list-value"
                  className="shrink-0 text-right text-sm tabular-nums"
                >
                  {item.text ?? `${printed}%`}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {caption === undefined ? null : (
        <p data-slot="proportion-list-caption" className="text-muted-foreground text-sm">
          {caption}
        </p>
      )}
    </figure>
  )
}

export { ProportionList }