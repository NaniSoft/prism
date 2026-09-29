import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One stage of a pipeline, as the flow draws it.
 *
 * The same shape as a `ProcessStep`, declared separately rather than imported: a
 * flow and a rail are different claims and a consumer composing one has no reason
 * to take the other's type, and sharing the declaration would invite a caller to
 * widen a rail by reaching for a flow's step.
 */
export type ProcessStage = {
  /** The stage's own name, as a reader would name it in conversation. */
  name: string
  /** One line about what happens at this stage. */
  description: string
}

/**
 * How many stages a flow puts on one line.
 *
 * The grid tracks, not the stage count. A flow is a sequence that has to wrap, so
 * the number of stages is the caller's and the number on a line is this Block's:
 * those are different questions, and a caller that had to state both would state
 * them in step by hand, which is the thing a Block should not ask.
 *
 * Three is the default because three divides the two lengths the sites actually
 * state, six and nine, and a row of three is the widest that still leaves an ordinal
 * and a name beside each other without one of them wrapping.
 */
export type FlowColumns = 2 | 3 | 4

/**
 * The grid tracks each column count gets.
 *
 * Spelled out per length, so a flow has exactly as many tracks as it declared and
 * not one empty at the end of a row. The `sm:` step is a narrowing rather than a
 * widening: on a narrow screen a flow becomes one column per line, because a
 * three-up row of stage names at phone width is three columns of two words each.
 */
const TRACKS: Record<FlowColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * The props a ProcessFlow01 takes.
 *
 * Every string is a prop. The Block ships no stage, no ordinal and no label for the
 * end of the flow: a pipeline that hardcoded a stage name would hand every consumer
 * a diagram of somebody else's pipeline.
 */
export type ProcessFlow01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a flow composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The label on the last stage, for a flow that ends in a state worth naming:
   * "merged", "shipping", "verified". Omit it when the last stage needs no label,
   * which is the honest state for a pipeline that has not finished.
   */
  finalLabel?: string
  /**
   * The stages, in the order the pipeline runs.
   *
   * An array rather than the tuple `ProcessRail01` uses, and the difference is the
   * whole of what this Block is for. A rail holds one line, so its length is a
   * layout claim the type can make and a wider rail would break; a flow wraps, so
   * its length is content and the type has nothing to say about it. Six stages are
   * six stages, and the grid carries them.
   */
  stages: ProcessStage[]
  /**
   * How many stages sit on one line. Defaults to 3.
   *
   * A prop because a five-stage pipeline and a nine-stage one do not read alike at
   * the same width, and a caller who knows their own length knows their own line.
   */
  columns?: FlowColumns
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  className?: string
}

/**
 * A pipeline drawn as a flow: the stages in order, wrapping across lines.
 *
 * **The rail's refusal of a fifth stage is left standing.** `ProcessRail01` holds
 * two, three or four stages and a five-element array is a compile error, and that is
 * the same decision this Block is built beside rather than against: a rail is a
 * claim about a sequence on one line, and a rail that quietly dropped a stage to fit
 * a width would be a diagram of a process that is not the process. A company site
 * states six stages, and it was drawing them as a grid of short points, where the
 * six ordinals and the terminal label were lost and a sequence read as a set. That
 * gap is a gap in the roster, and the honest repair is a second shape rather than a
 * wider tuple: raising the rail's ceiling to six would make the fourth column
 * unrepresentable as a type error, which is the property that made the original
 * decision good.
 *
 * **It is one `<ol>`, and that is the part the layout is built around.** A flow that
 * wrapped into a row per group would be several lists, and a screen reader would
 * announce it as three lists of two, which is precisely the set-where-a-sequence-was
 * that this Block exists to avoid. So the stages are one ordered list and the
 * wrapping is done by the grid, which means the Block never gets to know where a
 * line broke, and therefore cannot draw something that is only right on the widest
 * screen.
 *
 * **The ordinal is the continuity mechanism, and it is treated as one.** It runs
 * `01` through to the last stage with no restart, in the mono face, at a size a
 * reader can scan down a column rather than read one at a time. That is what makes a
 * wrapped flow legible: a reader who lands on stage four sees `04` and knows it
 * continues stage three, whatever the column count happens to be at the width they
 * are using. Nothing else in this Block is load-bearing for the sequence, and
 * anything that needed to know where the line broke would be.
 *
 * **The thread is a line through the stages, not a box around each one.** Each
 * stage draws a top border and the grid separates them by a single pixel, so a run
 * of stages on one line reads as one line broken by hairline gaps, and the gap
 * between two lines is wider. That is the same technique the rail uses, and it is
 * chosen here for a specific reason: it holds at any column count, including the
 * one-column layout a phone gets, without the Block knowing anything about it. A
 * connector drawn between a stage and its successor would need the column count to
 * be right, and would be wrong at every width the type does not describe.
 *
 * A caption of more than about twelve words wraps under a stage and the line stops
 * reading as a line, so the caption is a line and the detail belongs above the flow
 * in `description`.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function ProcessFlow01({
  eyebrow,
  title,
  description,
  finalLabel,
  stages,
  columns = 3,
  headingLevel = 'h2',
  className,
}: ProcessFlow01Props) {
  if (stages.length < 2) {
    throw new Error(
      'ProcessFlow01: a flow of fewer than two stages is a label, not a sequence, and ' +
        'the Block would be drawing a line through nothing. ComposeProcessRail01 for a ' +
        'two-stage rail, or pass the stages the pipeline actually has.',
    )
  }

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <ol
        data-slot="process-flow"
        className={cn('grid gap-y-8 sm:gap-x-px sm:gap-y-10', TRACKS[columns], className)}
      >
        {stages.map((stage, index) => (
          <li
            key={stage.name}
            data-slot="process-stage"
            data-ordinal={String(index + 1).padStart(2, '0')}
            className="border-border flex flex-col gap-2 border-t pt-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              {finalLabel && index === stages.length - 1 ? (
                <span className="text-muted-foreground font-mono text-xs">{finalLabel}</span>
              ) : null}
            </div>
            <span className="text-sm font-semibold">{stage.name}</span>
            <span className="text-muted-foreground text-pretty text-sm">{stage.description}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export default ProcessFlow01
