import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The calendar day a moment falls on, as a `YYYY-MM-DD` key.
 *
 * **This is here rather than in three Blocks because three Blocks needed it and
 * the fourth would have been the argument.** `activity-feed-01`, `audit-log-01`
 * and `calendar-01` each grew their own copy while the roster was being authored,
 * each with its own three-line JSDoc saying the duplication was a decision and
 * naming this file as the right home. Three copies of a five-line function that
 * computes a date are three places a bug would be fixed once and stay broken
 * twice, so this module holds the one and the three Blocks import it.
 *
 * `lib/utils.ts` is the file every registry item already ships beside itself, so
 * the shared implementation needs no new path in the generated registry and no
 * new entry for a consumer to resolve. That is why the helper is here and not in
 * a second `lib` module.
 *
 * **The day is the runtime's, not the reader's**, and the JSDoc on each of the
 * three Blocks says what to do about that: a consumer whose records are grouped
 * by a named zone groups them itself and passes one entry per group with grouping
 * off. Prism ships no calendar, and a Block cannot pick the reader's zone without
 * a prop that would be a guess dressed as a setting. A caller who needs a
 * particular zone composes `Intl.DateTimeFormat` with one and passes the key.
 *
 * Accepts the same three shapes the Blocks pass: epoch milliseconds, a `Date`,
 * and a date string. A string that is not parseable returns an empty key rather
 * than throwing, because the Blocks treat an absent key as a moment with no group
 * and a throw would take a whole record list down over one bad row.
 */
export function dayKey(at: number | string | Date): string {
  const date = at instanceof Date ? at : new Date(at)
  if (Number.isNaN(date.getTime())) return ''
  const two = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`
}
