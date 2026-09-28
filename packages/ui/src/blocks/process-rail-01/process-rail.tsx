import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One step of a process, as the rail draws it.
 *
 * `name` is the step's own name and `description` is one line about what happens
 * there. Both are required: a rail is a sequence, and a step with no name is a
 * divider and a step with no description is a label.
 */
export type ProcessStep = {
  /** The name of the step, as a reader would name it in conversation. */
  name: string
  /** One line about what happens at this step. */
  description: string
}

/**
 * The number of steps a ProcessRail01 admits, as a type rather than as a runtime
 * check.
 *
 * Four, and the refusal of five is the type's own work: `steps` is declared as a
 * tuple, so a five-element array is not assignable to any arm of the union below
 * and a four-element array is. There is no length check at render and no list
 * that silently truncates, because a rail that quietly dropped its fifth step
 * would be a process diagram that lied about the process.
 *
 * Four is the measured number, not a round one. Every NaniSoft site states a
 * process as a rail, and every one of them states four stages: the collection
 * line, the lakehouse path, the agent loop and the research path are four steps
 * each, and each site drew its rail from a list of four. A fifth step is a
 * different shape of thing and would be a second Block, taken to the open with
 * the same evidence rather than smuggled in as a wider tuple.
 */
export type ProcessRail01Steps =
  | readonly [ProcessStep, ProcessStep]
  | readonly [ProcessStep, ProcessStep, ProcessStep]
  | readonly [ProcessStep, ProcessStep, ProcessStep, ProcessStep]

/**
 * The grid tracks each admissible length gets, keyed on the tuple's own length.
 *
 * Written as Tailwind classes rather than as an inline `gridTemplateColumns`,
 * because an inline template is a layout value in the markup where every other
 * layout value in this package is a class, and because a class is compiled into
 * the stylesheet while an inline style is recomputed per render. Each length is
 * spelled out, so a two-step rail has two tracks and a four-step rail has four,
 * and neither has an empty track at the end of the row.
 */
const TRACKS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

/**
 * The props a ProcessRail01 takes.
 *
 * Every string and every number is a prop. The Block ships no step, no ordinal
 * and no label for the end of the rail: a process rail that hardcoded a stage
 * name would hand every consumer a diagram of somebody else's process.
 */
export type ProcessRail01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a rail that is composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The label on the last step, for a rail that ends in a state worth naming:
   * "serving", "merged", "verified". Omit it when the last step needs no label,
   * which is the honest state for a rail that has not finished.
   */
  finalLabel?: string
  /**
   * The steps, in the order the process runs. Two, three or four; a fifth is a
   * type error. See `ProcessRail01Steps`.
   */
  steps: ProcessRail01Steps
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A process drawn as a rail: the steps of a pipeline, in order, on one line.
 *
 * All four NaniSoft sites compose this section, and each one drew it by hand
 * with the same three parts: an ordinal per step, a name, and one caption per
 * step, separated by hairlines with a label on the last one. This is that
 * section, once, with the ordinal and the separation owned here rather than by
 * four sets of site CSS.
 *
 * **The rail admits four steps and refuses five, in the type.** `steps` is a
 * tuple union rather than an array, so a fifth element is a compile error and
 * not a fifth column. The reason is that a rail is a claim about a sequence, and
 * a rail that quietly dropped a step to fit a width would be a diagram of a
 * process that is not the process. Four is the number every one of the four
 * sites actually states; a longer process is a different shape and earns its own
 * Block.
 *
 * The ordinal is rendered here from the step's position, zero-padded to two
 * digits, because a sequence is the one thing the Block knows that the caller
 * cannot be asked to state twice. Nothing else is derived: a step's name and
 * caption are the caller's words, and `finalLabel` is the caller's word for where
 * the rail ends.
 *
 * The rail is a `Section` with the system container and padding, so a page built
 * from this Block keeps the rhythm of the Blocks around it. The steps sit on one
 * `grid-cols-N` row whose template is written from the tuple's own length, so a
 * three-step rail has three tracks rather than four tracks with one empty, and
 * the hairline between two steps sits on the track boundary rather than being
 * drawn by each step.
 *
 * A caption of more than about twelve words wraps under a step and the row stops
 * reading as a line, so the caption is a line and the detail belongs above the
 * rail in `description`.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function ProcessRail01({
  eyebrow,
  title,
  description,
  finalLabel,
  steps,
  headingLevel = 'h2',
}: ProcessRail01Props) {
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
        data-slot="process-rail"
        className={cn('grid gap-6 sm:gap-px', TRACKS[steps.length])}
      >
        {steps.map((step, index) => (
          <li
            key={step.name}
            data-slot="process-step"
            className="border-border flex flex-col gap-2 border-t pt-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground font-mono text-xs">
                {String(index + 1).padStart(2, '0')}
              </span>
              {finalLabel && index === steps.length - 1 ? (
                <span className="text-muted-foreground font-mono text-xs">{finalLabel}</span>
              ) : null}
            </div>
            <span className="text-sm font-semibold">{step.name}</span>
            <span className="text-muted-foreground text-pretty text-sm">{step.description}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export default ProcessRail01
