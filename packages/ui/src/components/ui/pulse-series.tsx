import type { CSSProperties } from 'react'

import { cn } from '../../lib/utils'

/**
 * One column in a PulseSeries.
 *
 * `value` is a magnitude in the caller's own units and the Component scales it
 * against the tallest column, so a caller passes the numbers it has rather than
 * percentages of a maximum it had to compute first. The reason is honesty: a
 * caller that pre-normalises has two chances to get the axis wrong, and a
 * mislabelled axis is a lie with a typeface on it.
 *
 * `emphasis` marks the column the reader is meant to land on, and it is the one
 * difference a column may carry. The emphasised column takes the brand ink and
 * takes a label; every other column takes muted ink and takes none. Two
 * emphasised columns are a caller's mistake rather than a second level, because
 * a figure with two focal points has none.
 */
export type PulseBar = {
  /** A key unique within the series. It is carried on the markup as `data-column`. */
  id: string
  /** The column's height, in the caller's own units. */
  value: number
  /**
   * The name printed under the column. Required on the emphasised column and
   * optional elsewhere, because a label under every column of a wide series is
   * the axis the caller would have drawn anyway, and this Component leaves room
   * for it rather than making the caller draw one behind it.
   */
  label?: string
  /** Marks the column the drawing is about. See the Brand Ink Rule. */
  emphasis?: boolean
}

/**
 * What both arms of `PulseSeriesProps` carry.
 *
 * The name is required unless the drawing is decorative, and it is forbidden
 * when it is. That is a union rather than `label?: string` for the reason
 * `Diagram` states: only a union lets the type system see the exception, because
 * an optional label on one arm can only be optional on both.
 */
type PulseSeriesFigure =
  | {
      /**
       * Hides the drawing from assistive technology and drops the name. Use it
       * when the surrounding sentence already says what the series shows, and
       * nothing inside the hidden tree is named either.
       */
      decorative: true
      label?: never
    }
  | {
      /** The name of the drawing, and the only thing a screen reader reads from it. */
      label: string
      decorative?: false
    }

export type PulseSeriesProps = PulseSeriesFigure & {
  /**
   * The columns drawn, left to right in the order given. At least one: a series
   * with nothing in it is a mistake in the caller's data rather than a state
   * worth an empty message.
   */
    bars: PulseBar[]
    /**
     * The line the columns rise from: the zero of the caller's units, named so a
     * reader is told what the columns are counted from rather than left to infer
     * it from a shape. Optional, and omitted rather than defaulted, because a
     * default here is a claim about the caller's units.
     */
    baseline?: string
    /**
     * A reticle crossing the series once per cycle, marking which column is being
     * read at this instant. This is the figure's only motion beyond the columns'
     * own rise, and it is the part that makes a static bar chart read as a live
     * view rather than a report.
     */
    scan?: boolean
    /** Layout only, exactly as on every Component. */
    className?: string
  }

/**
 * The canvas the series draws into, in its own user units.
 *
 * Shorter than `PulseGraph`'s and for the reason a bar chart is not a graph: a
 * series reads its height against its baseline, so a canvas with more vertical
 * room than it needs pushes the baseline up and makes every column look
 * shorter than it is.
 */
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 300

/**
 * The band left empty around the columns, in user units.
 *
 * The bottom band carries the baseline and the labels, so it is generous, and
 * the top band is small because a column that reaches the top of the canvas has
 * no headroom to breathe in and reads as clipped rather than as tall.
 */
const PADDING = 52
const PADDING_TOP = 28

/** The widest a column is drawn, in user units, before the series narrows them. */
const MAX_BAR_WIDTH = 18

/** The gap between two columns, as a fraction of a column's own width. */
const BAR_GAP = 0.45

/**
 * Type sizes, in user units rather than in `rem`, for the reason every figure in
 * this package states: a font size inside a viewBox is a coordinate.
 */
const LABEL_SIZE = 11
const BASELINE_SIZE = 10

/**
 * A series of columns, a reticle crossing them, and a baseline they rise from.
 *
 * This is the instrument the retired line drew on a canvas, rebuilt. Its
 * predecessor read open interest out of a sine hash, so the drawing was of
 * numbers that had never been collected, and a reader who screenshotted it and
 * read the axis got a fabrication set in a real typeface. That defect is not
 * repeated here and is not repeatable here: the columns are the caller's
 * numbers, the tallest one sets the scale, and a caller with no numbers passes
 * no bars.
 *
 * **A server Component with no runtime.** The rise and the scan are CSS on
 * server-rendered markup, so a live view costs zero bytes of JavaScript and
 * works in a static export. See `PulseGraph` for the full argument; the short
 * form is that the old instrument needed a client runtime, a `requestAnimationFrame`
 * loop and a colour read at mount, and this needs none of the three.
 *
 * **The columns are visible from the first frame.** The rise animation
 * interpolates from the baseline, so at 0% the column has no height and the
 * reader is looking at a baseline with labels on it. That is the one moment this
 * figure is less informative than its resting state, and it lasts one cycle
 * rather than persisting, it never hides a column permanently, and under
 * `prefers-reduced-motion` it is not run at all. The figure is not gated on a
 * script, an intersection or a scroll position, so a reader with scripting off
 * and a print stylesheet both get every column at full height.
 *
 * **The scan is the honest part.** A reticle crossing the series says a column
 * is being read at this instant, and it is drawn at a real position on the
 * scale rather than sweeping an empty field: a sweep with nothing under it is
 * atmosphere, and atmosphere was what the old heroes had too much of. Under
 * reduced motion the scan is off and the columns stand, which is the correct
 * still frame for a chart.
 *
 * **The emphasis is the caller's.** One column may be emphasised, and it is the
 * one that takes the brand ink and the label. The reticle does not choose it,
 * because the reticle is a claim about time and the emphasis is a claim about
 * importance, and a component that conflated the two would be moving the
 * reader's attention on a schedule.
 *
 * **Accessibility.** `role="img"` and the caller's `label`, the same contract
 * the rest of the drawing set holds. The labels under columns are inside a
 * `role="img"` and so are presentational; the surrounding sentence is what a
 * screen reader gets. Pass `decorative` when it already says what the drawing
 * shows.
 */
function PulseSeries({
  bars,
  baseline,
  scan = false,
  label,
  decorative = false,
  className,
}: PulseSeriesProps) {
  const roomX = CANVAS_WIDTH - PADDING * 2
  const roomY = CANVAS_HEIGHT - PADDING - PADDING_TOP
  const baselineY = PADDING + roomY

  const tallest = Math.max(...bars.map((bar) => bar.value), 0)
  const slot = bars.length ? roomX / bars.length : roomX
  const barWidth = Math.max(2, Math.min(MAX_BAR_WIDTH, slot * (1 / (1 + BAR_GAP))))

  return (
    <svg
      data-slot="pulse-series"
      data-columns={bars.length}
      data-scan={scan || undefined}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn('h-auto w-full', className)}
    >
      {/*
        The reticle, drawn first so the columns sit above it. A wash and a
        hairline rather than a solid band: a solid band at this width would hide
        the columns it is supposed to be pointing at, which is the opposite of
        what a reticle is for.
      */}
      {scan ? (
        <g data-slot="pulse-series-scan" aria-hidden>
          <g
            className="prism-ambient-scan"
            style={{ '--ambient-scan-distance': `${roomX + slot}px` } as CSSProperties}
          >
            <rect
              data-slot="pulse-series-scan-wash"
              x={PADDING - slot}
              y={PADDING_TOP - 12}
              width={slot}
              height={roomY + 12}
              className="fill-brand-ink/10"
            />
            <line
              data-slot="pulse-series-scan-line"
              x1={0}
              y1={PADDING_TOP - 12}
              x2={0}
              y2={baselineY}
              strokeWidth={1}
              className="stroke-brand-ink/60"
            />
          </g>
        </g>
      ) : null}

      {bars.map((bar, index) => {
        const centre = PADDING + slot * (index + 0.5)
        // A column of value zero is drawn as a hairline rather than as nothing,
        // because a gap in a series is a missing reading and a missing reading
        // that looks identical to a value of zero is a data claim the drawing
        // cannot support.
        const height = tallest === 0 ? 1 : Math.max(1, (bar.value / tallest) * roomY)
        return (
          <g
            data-slot="pulse-series-column"
            data-column={bar.id}
            data-emphasis={bar.emphasis || undefined}
            key={bar.id}
          >
            {/*
              The column, with its rise keyed off the same class every figure in
              this package uses. The transform origin is the baseline, so the
              column grows upward out of it rather than sliding into place, and
              `motion-safe` is not needed on the class because the reduced-motion
              block removes the animation outright rather than shortening it.
            */}
            <rect
              x={centre - barWidth / 2}
              y={baselineY - height}
              width={barWidth}
              height={height}
              rx={Math.min(2, barWidth / 2)}
              className={cn(
                'origin-bottom',
                'prism-ambient-rise',
                bar.emphasis ? 'fill-brand-ink' : 'fill-muted-foreground/35',
                `prism-ambient-delay-${(index % 3) + 1}`,
              )}
            />
            {bar.label ? (
              <text
                x={centre}
                y={baselineY + 18}
                fontSize={LABEL_SIZE}
                textAnchor="middle"
                className={cn(
                  'font-mono',
                  bar.emphasis ? 'fill-foreground' : 'fill-muted-foreground',
                )}
              >
                {bar.label}
              </text>
            ) : null}
          </g>
        )
      })}

      {/*
        The baseline. Drawn last so it sits over a column that reaches it, and
        named by the caller rather than defaulted, because "0" is a claim about
        the caller's units and this package is not entitled to make it.
      */}
      <g data-slot="pulse-series-baseline">
        <line
          x1={PADDING - 12}
          y1={baselineY}
          x2={CANVAS_WIDTH - PADDING + 12}
          y2={baselineY}
          strokeWidth={1}
          className="stroke-border"
        />
        {baseline ? (
          <text
            x={PADDING - 12}
            y={baselineY - 8}
            fontSize={BASELINE_SIZE}
            textAnchor="start"
            className="fill-muted-foreground font-mono"
          >
            {baseline}
          </text>
        ) : null}
      </g>
    </svg>
  )
}

export { PulseSeries }
