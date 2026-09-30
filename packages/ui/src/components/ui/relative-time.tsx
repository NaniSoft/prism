import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props the RelativeTime accepts. */
export interface RelativeTimeProps extends Omit<ComponentProps<'span'>, 'children'> {
  /**
   * The moment, in whichever of the three forms the caller already has it.
   *
   * A `Date`, epoch milliseconds, or a string the platform parses. A bare number
   * is milliseconds and nothing else: a consumer who passes seconds gets 1970 and
   * blames the library, which is a mistake Prism cannot detect from the value
   * because 1,700,000,000 is a perfectly valid millisecond timestamp, so the
   * answer is stated here rather than guessed at. A string is handed to the
   * platform untouched, so an ISO 8601 date-time, a date-only key and a locale's
   * own written date all work, and none of them is interpreted by this Component.
   *
   * Required, and unparseable values throw rather than render: a reading that
   * says "Invalid Date" is a claim, and a claim a reader cannot check is the one
   * kind this system refuses to make on a caller's behalf.
   */
  date: Date | number | string
  /**
   * The locale the platform formats for. Omit it for the runtime's default.
   *
   * A relative phrase is the reason this prop exists rather than an
   * afterthought, and the JSDoc on the Component is the reason: the whole point
   * of this Item is that the sentence is the consumer's, so the absolute reading
   * beside it has to be the platform's, in whatever language the reader has.
   */
  locale?: Intl.LocalesArgument
  /**
   * How much of the date to show. @defaultValue 'medium'
   *
   * A default rather than a requirement, because a reading with no date at all
   * is not a time, and `medium` is the step that names the month and the day
   * without the weekday, which is the granularity a "last seen" line wants.
   */
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  /**
   * How much of the clock to show, and nothing by default.
   *
   * Absent rather than defaulted, on purpose: a default here could not be turned
   * off. A caller whose reading is a calendar date would have to pass something
   * to get rid of the time, and a prop whose only way to be removed is a magic
   * value is a prop every consumer pays to work around. Pass `timeStyle` to ask
   * for the clock; leave it and the reading is a date.
   */
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  /**
   * The caller's own relative wording, as a node.
   *
   * A slot rather than a string, because the sentence is the consumer's and a
   * consumer who has one in three languages already has a component for it. See
   * the Component JSDoc for why Prism does not ship the sentence itself.
   */
  relative?: ReactNode
  /**
   * The caller's own relative wording, computed from the moment.
   *
   * Takes the normalised `Date` rather than the raw prop, so a caller that was
   * handed a string does not have to parse it a second time. Preferred over
   * `relative` when both are passed, and the reason is that a function is a
   * request to compute and a node is a request to render: a caller who passed
   * both has said both, and the computed one is the half that can follow the
   * date when it changes.
   */
  renderRelative?: (date: Date) => ReactNode
}

/**
 * A moment in time, its absolute reading, and the caller's sentence beside it.
 *
 * **The whole Item exists because a relative phrase is a sentence, and a
 * sentence has to be localised.** "2 hours ago" is not a format and it is not a
 * number with a suffix. It is English, it has a plural, it changes shape past a
 * day, and every language in the world words it differently, including the
 * languages that put the number first and the ones with six plural forms. A
 * design system that shipped one of those phrases in English would have put a
 * sentence into every consumer's product that the consumer could not translate,
 * could not inflect, and could not reorder, because the string would be inside a
 * package rather than inside their own code. So Prism formats what `Intl` already
 * localises, which is the absolute reading, and hands the sentence back.
 *
 * The rejected alternatives are both real. A `relative` string prop is the
 * obvious one, and it is a prop whose value every consumer writes in their own
 * language while the Component hardcodes the shape around it, which is the
 * `HeroAction` defect in a smaller costume. Shipping the phrase itself is worse,
 * because it looks like help and it is a claim: a product in Japanese gets an
 * English line it cannot delete, and the fix is a fork rather than a prop.
 *
 * **The absolute reading is the visible text, and the `<time>` is not the
 * root.** A `dateTime` attribute describes the element it is on, so a root that
 * also held the relative wording would date the sentence as well as the reading,
 * and a crawler or a reader that reads the machine value would take the caller's
 * English words for a timestamp. The `<time>` wraps the reading and nothing else,
 * and the root is a plain `<span>` around both.
 *
 * **A bare number is milliseconds.** A consumer who passes seconds gets January
 * 1970 and concludes the library is broken, which is the most likely wrong
 * reading of this prop and the reason the rule is in the JSDoc rather than being
 * sniffed from the magnitude. Guessing was the alternative and it is worse than
 * the cost: a value below a billion is far more likely to be seconds than a
 * millisecond timestamp, but a library that silently multiplies a caller's number
 * is a library that has made a claim about a caller's clock.
 *
 * **An unreadable value throws, and names the prop.** The diagnostic reaches a
 * developer in a console and never a reader, which is the opposite of copy: it
 * is the Component refusing to make a claim on the caller's behalf. A rendering
 * that shows nothing would be quieter and worse, because a reading that has
 * silently disappeared is a reading nobody knows to look for.
 *
 * It is a server Component. The moment is normalised once, on the server, and
 * the clock never moves, so a relative phrase from a consumer that computes
 * against the current time is the consumer's own render, not a ticking timer in
 * a design system.
 */
function RelativeTime({
  className,
  date,
  locale,
  dateStyle,
  timeStyle,
  relative,
  renderRelative,
  ...props
}: RelativeTimeProps) {
  const at = new Date(date)
  if (!Number.isFinite(at.getTime())) {
    throw new Error(
      'RelativeTime: the date prop is not a date the platform can read, so there is no absolute ' +
        'reading to show and no value to put in the time element. Pass a Date, epoch ' +
        'milliseconds, or a string the platform parses.',
    )
  }

  const absolute = new Intl.DateTimeFormat(locale, {
    dateStyle: dateStyle ?? 'medium',
    // Spread rather than a bare `undefined`, because the platform treats an
    // explicit `undefined` as present in some engines and a date-only reading
    // would grow a clock the caller never asked for.
    ...(timeStyle === undefined ? null : { timeStyle }),
  }).format(at)

  const when = renderRelative === undefined ? relative : renderRelative(at)

  return (
    <span
      data-slot="relative-time"
      className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}
      {...props}
    >
      <time data-slot="relative-time-absolute" dateTime={at.toISOString()}>
        {absolute}
      </time>
      {when === undefined || when === null ? null : (
        <span data-slot="relative-time-relative" className="text-muted-foreground">
          {when}
        </span>
      )}
    </span>
  )
}

export { RelativeTime }
