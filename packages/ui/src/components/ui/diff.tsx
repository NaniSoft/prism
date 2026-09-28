import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** What happened to one line. */
export type DiffLineKind = 'context' | 'added' | 'removed'

/** One line of a change. */
export type DiffLine = {
  /** What happened to it. @defaultValue 'context' */
  kind?: DiffLineKind
  /**
   * The number this line had before the change.
   *
   * A removed line has one and no new number, an added line the reverse, and a
   * context line both. That asymmetry is the structural signal that says which
   * side a line is on, and it is why the line numbers are the first thing in the
   * markup rather than decoration beside the content.
   */
  oldNumber?: number
  /** The number this line has after the change. */
  newNumber?: number
  /** The line's text, exactly as it is in the file. */
  content: string
  /**
   * The character ranges within `content` that actually changed.
   *
   * Optional, and a line with none is drawn whole. This is what separates a diff
   * that shows a line changed from one that shows what changed inside it, and it
   * is the difference between reading a change and scanning for it.
   */
  changed?: readonly (readonly [number, number])[]
}

/** The words a reader is told for each kind, because the Component ships none. */
export type DiffLabels = {
  /** Read for a line that was added. */
  added: string
  /** Read for a line that was removed. */
  removed: string
  /** Read for a line that did not change. */
  context: string
}

/** The props the Diff accepts. */
export interface DiffProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The lines, in file order. */
  lines: readonly DiffLine[]
  /**
   * The accessible name of the change, read before its lines.
   *
   * Required rather than defaulted, because a page with two diffs is a page where
   * a reader cannot tell which change they are in, and the name is the caller's
   * word.
   */
  label: string
  /**
   * The words for each kind of line.
   *
   * Required, and the reason is the same one that makes a Dialog's close label a
   * prop: a diff that announced "added" and "removed" in English would be a diff
   * every consumer inherits in a language they did not choose. A shared library
   * cannot know whether the word for this is "added" or "ajoute" or "hinzugefugt".
   */
  labels: DiffLabels
  /** The name of the thing that changed, shown above the lines. */
  file?: string
  /**
   * A summary of the change, shown beside the file name.
   *
   * The caller's words, because a diff that computed "3 additions, 1 deletion"
   * would be shipping a sentence. What it counts is left to the caller for the
   * same reason, and because a diff of a rename has no additions at all.
   */
  summary?: ReactNode
  /** Layout only. */
  className?: string
  /** What a reader is told when there is nothing to show. */
  empty?: ReactNode
}

/** The bar and the text tint for each kind, from the existing semantic roles. */
const KIND_BAR: Record<DiffLineKind, string> = {
  // A context line has no bar at all rather than an empty one: a zero-width mark
  // beside an unchanged line reads as "this changed a little", which is a claim
  // about a line the diff is saying did not change.
  context: 'bg-transparent',
  added: 'bg-brand-ink',
  removed: 'bg-destructive',
}

const KIND_TEXT: Record<DiffLineKind, string> = {
  context: 'text-muted-foreground',
  added: 'text-foreground',
  removed: 'text-foreground',
}

/** How much of a line changed, as a fraction, clamped to the line it is on. */
function density(line: DiffLine): number {
  if (line.changed === undefined || line.content.length === 0) return 0
  const covered = line.changed.reduce((total, [start, end]) => {
    const from = Math.max(0, Math.min(start, line.content.length))
    const to = Math.max(0, Math.min(end, line.content.length))
    return total + Math.max(0, to - from)
  }, 0)
  // Clamped, because two ranges that overlap would otherwise report more than the
  // whole line changed and a bar past the end of its own gutter says nothing.
  return Math.min(covered / line.content.length, 1)
}

/**
 * The line's text with its changed runs emphasised, and the rest left alone.
 *
 * The emphasis is weight, not colour. A diff that tinted its changed words green
 * and red would be leaning on the two hues a reader is most likely to be unable to
 * distinguish, and the tint would also fight the line's own state colour. A bolder
 * weight inside a line that is already marked as added or removed says what
 * changed without adding a second colour channel, and it survives greyscale,
 * which is the condition any encoding here has to survive eventually.
 */
function emphasised(line: DiffLine) {
  const ranges = (line.changed ?? [])
    .map(([start, end]) => [Math.max(0, start), Math.min(end, line.content.length)] as const)
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0])

  if (ranges.length === 0) return line.content

  const parts: ReactNode[] = []
  let at = 0
  ranges.forEach(([start, end], index) => {
    if (start > at) parts.push(line.content.slice(at, start))
    parts.push(
      <strong key={`${start}-${end}-${index}`} className="font-semibold">
        {line.content.slice(start, end)}
      </strong>,
    )
    at = end
  })
  if (at < line.content.length) parts.push(line.content.slice(at))
  return parts
}

/**
 * A change, as lines with the numbers they had and the numbers they have.
 *
 * **The bar is change density, not a side marker.** A diff conventionally marks
 * each line with a coloured wash and a rail, which tells a reader that a line
 * changed and nothing about how much. Rewriting one identifier in a long line
 * leaves the same mark as replacing the whole line, so the reader's eye, which is
 * fast at finding saturated bands, is drawn to the least interesting change in the
 * file. Here the bar's width is the fraction of the line that actually changed, so
 * the eye goes to the line that was rewritten rather than the line that was
 * touched, and the marks that used to be a wash become a measurement.
 *
 * **The line numbers carry the side, not the colour.** An added line has a new
 * number and no old one; a removed line the reverse. That asymmetry is structural,
 * it is how every diff reader a developer has ever used distinguishes the two, and
 * it does not depend on distinguishing red from green. The colour is redundant on
 * top of it, which is the right way round: the shape carries the meaning and the
 * colour reinforces it.
 *
 * **It is a table, because a diff is two columns of numbers beside a column of
 * text.** Row and column navigation, the count of lines, and the association
 * between a line and its number all come from the semantics rather than from a
 * grid of divs, and a reader moving by row hears the file the way they read it.
 *
 * **The changed words are emphasised by weight.** See the note on the helper: a
 * diff that tinted them would spend the two hues a reader is most likely to be
 * unable to tell apart, and weight survives greyscale.
 */
function Diff({ lines, label, labels, file, summary, className, empty, ...props }: DiffProps) {
  if (lines.length === 0) {
    // A diff with nothing in it is a state a caller reaches, and an empty grid
    // with no words in it is a gap rather than a state.
    return (
      <div data-slot="diff-empty" className={cn('text-muted-foreground text-sm', className)}>
        {empty ?? null}
      </div>
    )
  }

  const added = lines.filter((line) => (line.kind ?? 'context') === 'added').length
  const removed = lines.filter((line) => line.kind === 'removed').length

  return (
    <div
      data-slot="diff"
      className={cn('border-border flex flex-col overflow-hidden rounded-md border', className)}
      {...props}
    >
      <div
        data-slot="diff-header"
        className="border-border bg-muted/40 flex items-baseline justify-between gap-3 border-b px-3 py-2"
      >
        {/*
         * The file name is a heading and not a label, so a reader can navigate to
         * it. It is the caller's word and it is the one thing on this surface that
         * says which change is being looked at.
         */}
        <span data-slot="diff-file" className="text-foreground min-w-0 truncate text-sm font-medium">
          {file ?? null}
        </span>
        {/*
         * The counts are computed here and the words are the caller's, because a
         * sentence is not this package's to ship. A diff of a rename has no
         * additions and no deletions and still is a change, which is the case a
         * computed summary gets wrong and a caller's does not.
         */}
        {summary === undefined ? (
          <span
            data-slot="diff-summary"
            className="text-muted-foreground shrink-0 text-xs tabular-nums"
            data-added={added}
            data-removed={removed}
          />
        ) : (
          <span data-slot="diff-summary" className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {summary}
          </span>
        )}
      </div>

      <table data-slot="diff-table" aria-label={label} className="w-full table-fixed border-collapse">
        <tbody>
          {lines.map((line, index) => {
            const kind = line.kind ?? 'context'
            const share = density(line)
            return (
              <tr key={`${kind}-${line.oldNumber ?? 'x'}-${line.newNumber ?? 'x'}-${index}`} data-kind={kind}>
                {/*
                 * The two number columns are real cells rather than a gutter
                 * drawn beside the text, so a reader moving by cell hears the old
                 * number, the new number and then the line, in that order. The
                 * empty cell is the signal: a removed line has an old number and
                 * no new one, and that absence is the whole side indicator.
                 */}
                <td
                  data-slot="diff-old-number"
                  className="text-muted-foreground w-10 border-r border-transparent px-2 text-right align-top text-xs tabular-nums select-none"
                >
                  {line.oldNumber ?? null}
                </td>
                <td
                  data-slot="diff-new-number"
                  className="text-muted-foreground w-10 border-r border-transparent px-2 text-right align-top text-xs tabular-nums select-none"
                >
                  {line.newNumber ?? null}
                </td>
                <td
                  data-slot="diff-gutter"
                  className="w-1.5 border-r border-transparent p-0 align-stretch"
                >
                  {/*
                   * The bar grows from the left edge of a fixed gutter, so the
                   * widths are comparable down the file. A context line gets no bar
                   * at all rather than a zero-width one, because a zero-width mark
                   * beside an unchanged line reads as a line that changed a little.
                   */}
                  {kind === 'context' ? null : (
                    <span
                      data-slot="diff-bar"
                      aria-hidden="true"
                      className={cn('block h-full min-h-5 w-full', KIND_BAR[kind])}
                      /*
                       * The floor applies only when the density is unknown, which is
                       * a changed line the caller gave no ranges for. It does not
                       * apply to a measured density, because a floor on a real
                       * measurement overstates it: a one-character change in a long
                       * line is half a percent, and drawing it at twelve percent
                       * would have the bar claim something the data does not say,
                       * which is the one thing a measurement is not allowed to do.
                       * The floor exists to keep a line with no reported ranges
                       * findable, and that is the only case it serves.
                       */
                      style={{ width: `${(share > 0 ? share : 0.12) * 100}%` }}
                    />
                  )}
                </td>
                <td
                  data-slot="diff-content"
                  // The state is named in words on the row, so a reader who cannot
                  // see the bar is still told what happened to the line. It is the
                  // caller's word for that too.
                  aria-label={labels[kind]}
                  className={cn('px-3 py-0.5 text-left font-mono text-xs leading-relaxed', KIND_TEXT[kind])}
                >
                  {emphasised(line)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export { Diff }
