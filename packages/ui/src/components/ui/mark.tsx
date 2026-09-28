import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One continuous run of text, which is what a search matches on.
 *
 * A caller passes the string and the ranges inside it that matched, rather than
 * passing pre-split nodes, because a caller that assembled the nodes had to
 * compute the ranges and this Component has the string. A range that is out of
 * order, overlapping or past the end of the string is not a defect: a search
 * backend that reports two overlapping hits is normal, so the ranges are sorted
 * and merged rather than rejected.
 */
export type MatchRange = {
  /** The index the matched run starts at, inclusive. */
  start: number
  /** The index the matched run ends at, exclusive. */
  end: number
}

/** The props the Mark treatment accepts. */
export interface MatchProps extends Omit<ComponentProps<'mark'>, 'children'> {
  /** The text, which the ranges index into. */
  text: string
  /** The runs that matched, in any order and possibly overlapping. */
  ranges: readonly MatchRange[]
}

/**
 * The ranges as merged runs, with anything malformed dropped.
 *
 * Three things are handled rather than refused, and each is a thing a search
 * backend does: ranges that arrive out of order, ranges that overlap because two
 * matches share a character, and a range that runs past the end of the string
 * because the index is of a normalised form rather than this one. A Component
 * that threw on any of them would be a Component a consumer wraps in a try, which
 * is a worse failure than a slightly short highlight.
 */
function mergedRanges(ranges: readonly MatchRange[], length: number): MatchRange[] {
  const valid = ranges
    .filter((range) => Number.isInteger(range.start) && Number.isInteger(range.end))
    .map((range) => ({
      start: Math.max(0, Math.min(range.start, length)),
      end: Math.max(0, Math.min(range.end, length)),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start)

  const merged: MatchRange[] = []
  for (const range of valid) {
    const last = merged.at(-1)
    if (last !== undefined && range.start <= last.end) {
      last.end = Math.max(last.end, range.end)
      continue
    }
    merged.push({ ...range })
  }
  return merged
}

/**
 * A run of text with its matches visibly marked.
 *
 * A command palette and a search result list both need to show why a result
 * matched, and until this existed the only way to do that inside Prism was to drop
 * a span with hand-written styling into a consumer's own markup, which the
 * authoring contract does not permit.
 *
 * **It adds no semantics, and that is the decision.** A consumer marking a search
 * hit wants a visual difference, not a screen reader that announces the word
 * "highlighted" between every character of a result. So this styles a `mark` and
 * puts nothing else on it: no role, no `aria-label`, no live region. A consumer
 * who wants the announcement writes it, because a Component that announced every
 * match would make a result list unreadable rather than clearer, and the failure
 * would be invisible to review because nothing looks different on screen.
 */
function Mark({ className, text, ranges, ...props }: MatchProps) {
  const runs = mergedRanges(ranges, text.length)

  if (runs.length === 0) {
    // Unmatched text is still text, and returning the bare string rather than an
    // element keeps a result row that has no match from carrying a `mark` that
    // marks nothing.
    return <>{text}</>
  }

  const parts: ReactNode[] = []
  let at = 0
  runs.forEach((run, index) => {
    if (run.start > at) parts.push(text.slice(at, run.start))
    parts.push(
      <mark
        key={`${run.start}-${run.end}-${index}`}
        data-slot="match"
        // The one treatment this Component authors, and it is a surface rather than
        // a colour: a mark sits behind the text it marks, so it needs a ground and
        // the foreground that reads on that ground. `warning` is the pair for that
        // already, and it is used here rather than a new role because a search hit
        // is emphasis and not a caution, which is a distinction worth keeping by
        // spending the existing token rather than by adding one that means
        // "highlighted" and will be re-pointed at something else within a year.
        // The contrast gate measures this pair against every surface it can land
        // on, in every pack and both modes.
        className={cn('bg-warning text-warning-foreground rounded-sm px-0.5', className)}
        {...props}
      >
        {text.slice(run.start, run.end)}
      </mark>,
    )
    at = run.end
  })
  if (at < text.length) parts.push(text.slice(at))

  return <>{parts}</>
}

export { Mark }
export type { MatchProps as MarkProps }
