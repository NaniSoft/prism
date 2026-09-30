import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'

/** One reading for the whole demo, so every row is measured against the same now. */
const NOW = Date.now()

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * The caller's own relative sentence, localised by the caller's own formatter.
 *
 * This is the whole of what `RelativeTime` refuses to do for them. A phrase is a
 * sentence, and a sentence has to be translated, inflected and reordered, so the
 * Component takes the absolute reading from the platform and the sentence from
 * whoever owns the product. Six products would write this once each, in their own
 * language, and the design system would not be in that sentence at all.
 */
function agoFor(locale: string) {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return (at: Date): string => {
    const seconds = Math.round((at.getTime() - NOW) / 1000)
    const steps: [Intl.RelativeTimeFormatUnit, number][] = [
      ['day', DAY],
      ['hour', HOUR],
      ['minute', MINUTE],
    ]
    for (const [unit, size] of steps) {
      if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
    }
    return relative.format(Math.round(seconds), 'second')
  }
}

const EN = agoFor('en-GB')
const DE = agoFor('de-DE')

/** Moments at the scales a product actually reports at, and how each one is worded. */
const MOMENTS: { id: string; at: number; wording: 'computed' | 'node' | 'none' }[] = [
  { id: 'minute', at: NOW - 4 * MINUTE, wording: 'computed' },
  { id: 'hours', at: NOW - 9 * HOUR, wording: 'computed' },
  { id: 'days', at: NOW - 3 * DAY, wording: 'node' },
  { id: 'month', at: NOW - 41 * DAY, wording: 'computed' },
  { id: 'bare', at: NOW - 2 * DAY, wording: 'none' },
]

/** One row of the fixture, named so the shape below can be keyed on it. */
type Moment = (typeof MOMENTS)[number]

/** The only sentence a Demo is allowed to write, because a Demo is the site own content. */
const SHAPE: Record<Moment['wording'], string> = {
  computed: 'renderRelative, from a localised formatter',
  node: 'relative, a node from the caller',
  none: 'absolute only, no sentence at all',
}

export default function RelativeTimeDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <ul className="divide-y">
        {MOMENTS.map((moment) => (
          <li key={moment.id} className="flex items-baseline justify-between gap-4 py-2 text-sm">
            <span className="text-muted-foreground text-xs">{SHAPE[moment.wording]}</span>
            <RelativeTime
              date={moment.at}
              locale="en-GB"
              timeStyle="short"
              {...(moment.wording === 'computed'
                ? { renderRelative: EN }
                : moment.wording === 'node'
                  ? { relative: 'three days ago' }
                  : {})}
            />
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground border-border text-xs border-t pt-4">
        The same moment, in another locale. The absolute reading is the
        platform&apos;s and follows the locale, and the sentence beside it is the
        caller&apos;s and follows theirs. That division is the only one that leaves
        both of them translatable.
      </p>
      <RelativeTime date={NOW - 9 * HOUR} locale="de-DE" timeStyle="short" renderRelative={DE} />
    </div>
  )
}
