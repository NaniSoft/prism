import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

/** The column counts a grid may be drawn at, as authored tracks. */
export type DSGridColumns = 1 | 2 | 3 | 4

/** The gaps a grid may be drawn at, as authored spacing. */
export type DSGridGap = 'sm' | 'md' | 'lg'

const COLUMN_CLASS: Record<DSGridColumns, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/*
 * The one-column template is explicit, not the implicit track a bare `grid`
 * leaves behind. An implicit auto track sizes to its content's max-content, so
 * a tile that carries its own legible floor (a `Diagram` or a `PulseGraph` at
 * the width below which its labels stop being legible) grew the page at phone
 * width instead of scrolling inside itself, and the narrowing below read as a
 * decision while the page scrolled sideways. `grid-cols-1` is
 * `repeat(1, minmax(0, 1fr))`, which clamps the track to the container and
 * hands the overflow to the tile's own scroll container, the bargain those
 * Components document. Every count below its variant threshold lands on it.
 */
const ONE_COLUMN = 'grid-cols-1'

const GAP_CLASS: Record<DSGridGap, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

/** The props the DSGrid accepts. */
export interface DSGridProps extends ComponentProps<'div'> {
  /**
   * The number of tracks on one line from the `sm` threshold up.
   *
   * Below `sm` every grid is one column, because a two-up row of half-width
   * tiles at phone width is a set a reader cannot tell apart. The counts are
   * the tracks, not the item count: a grid of five items at three columns is
   * three, two and one around a row.
   */
  columns?: DSGridColumns
  /** The gap between the cells. @defaultValue 'md' */
  gap?: DSGridGap
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A grid whose tracks and gap are governed.
 *
 * **The tracks are a count and not a template.** A caller who can write
 * `grid-cols-[17px_1fr]` has written a layout the token source does not hold,
 * and a `minmax(19rem,1fr)` grid with no count is a grid whose column count is
 * whatever the viewport happens to fit. Four counts bound the arrangement so
 * a grid a consumer draws at three columns above `sm` and two at phone width
 * is the same decision everywhere.
 *
 * **One column below `sm` is the decision, not an omission.** The narrowing is
 * what keeps a set of tiles legible at 390px; the `Gallery01` tracks do the
 * same thing, and this is that track logic lifted to the primitive every Block
 * could have drawn by hand instead. The narrowing is an explicit
 * `grid-cols-1` template and not the implicit track a bare `grid` leaves, so a
 * tile that carries its own legible floor overflows inside itself rather than
 * sizing the track and scrolling the page.
 *
 * It is a server Component. It holds no state and reads nothing.
 */
function DSGrid({ columns = 3, gap = 'md', className, ...props }: DSGridProps) {
  return (
    <div
      data-slot="ds-grid"
      data-columns={columns}
      className={cn('grid', ONE_COLUMN, GAP_CLASS[gap], COLUMN_CLASS[columns], className)}
      {...props}
    />
  )
}

export { DSGrid }
