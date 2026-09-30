import type { ReactNode } from 'react'

import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One milestone in a company's history: when it happened, what it was called,
 * what it changed, and optionally a figure of the time.
 *
 * `at` is a `string` and not a `Date`, and the reason is the one this repository
 * has already written down for the other half of the surface: a Block ships no
 * formatting. A `Date` carries a timezone and a calendar and renders as
 * `Wed Mar 04 2026 00:00:00 GMT+0000` unless something formats it, so a `Date`
 * prop would push the formatting decision onto every consumer and make the
 * wrong answer the easy one. As a string the Block prints what it was given,
 * which is honest whether that is `2024`, `Q3 2024` or `Winter 2024`, and the
 * honest way to render a date in a caller's own locale and script is the caller's
 * to compose: `RelativeTime` for a localised absolute reading with relative words
 * handed back, or the platform's own `Intl.DateTimeFormat` for a fixed one. A
 * Block cannot know the locale, and a Block that guessed would ship English
 * month names into every consumer's product.
 *
 * `mediaLabel` is the caption for `media`, and it is separate from `media` for the
 * same reason every other slot is separate: a figure is the consumer's and a
 * sentence describing it is the consumer's too, and a Block that required the
 * two together would make a caption impossible for a figure that needs none and
 * mandatory for one that needs a lot.
 */
export type StoryMilestone = {
  /** A stable key for the milestone. */
  id: string
  /** When it happened, already written the way the reader should see it. */
  at: string
  /** What the milestone was called at the time. */
  title: string
  /** What changed, in the reader's terms rather than the company's. */
  body: ReactNode
  /** A figure of the time, composed by the caller. */
  media?: ReactNode
  /** The caption for `media`, in the caller's words. */
  mediaLabel?: string
}

/**
 * The tracks a horizontal rail gets, once the reader has stopped being on a
 * phone.
 *
 * Two steps rather than a count, because the count is the caller's and a
 * horizontal rail of eight milestones is eight cards and no reader reads eight
 * cards. Two across at the width where the rail appears and three across at the
 * width of the container, so a five-milestone history reads as three and then
 * two, which is a shape rather than an orphan.
 */
const HORIZONTAL_TRACKS = 'md:grid-cols-2 lg:grid-cols-3'

/**
 * The props a Story01 takes.
 *
 * Every string, every date and every figure is a prop and the Block ships none:
 * no milestone, no year, no caption and no default set of dates. A rail that
 * hardcoded its milestones would hand every consumer a history that was not
 * theirs, dated in years that were not theirs, which is the worst thing a
 * company page can get wrong and the easiest thing for a component to do.
 */
export type Story01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a rail composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The milestones, in the order they happened. Order is the caller's because it
   * is a claim about what came first, and this Block would be making that claim
   * for them if it sorted.
   */
  milestones: StoryMilestone[]
  /**
   * Whether the rail runs down the page or across it.
   *
   * `horizontal` collapses to the vertical rail below `md`, and that is the part
   * worth reading twice: a five-milestone horizontal rail on a phone is five
   * columns of unreadable text, so the width at which the horizontal form turns
   * into the vertical one is a decision this Block makes once, here, rather than a
   * decision four or five marketing pages each make differently and get wrong at
   * the width below it. The cost of making it once is that the caller cannot put
   * a horizontal rail on a narrow surface, and the reason that is acceptable is
   * that there is no honest way to do so.
   *
   * @defaultValue 'vertical'
   */
  orient?: 'vertical' | 'horizontal'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A company's history as a reader walks it: a date, a title, what changed, and
 * an optional figure, along a rail with a rule down one side.
 *
 * **It is a Block and not a component, and the difference is the subject.**
 * `Timeline` draws a run's progress as it happens: it is fed events, it has four
 * states, it scales durations against the longest step in the run, and one of its
 * states moves. This arranges a sequence that has already finished, in a section
 * that has content under its heading, and none of that machinery applies to it. A
 * company history has no run state and no durations, and a reader who met a
 * `Timeline` on an about page would be told a thing about the product is live and
 * is not. So the two are different subjects, they compose as different things, and
 * this is a section of a page rather than a shape inside one.
 *
 * **The NaniSoft framing is in this JSDoc and in the Demo, and nowhere in the
 * Block.** The history these pages tell is the history of a pipeline that came to
 * run, a market that came to be captured rather than reconstructed, an estate that
 * came to be observed instead of visited, and work that came to be done by agents
 * rather than filed for a person to pick up. Those are four claims, and every one
 * of them is a `body` and a `title` at the call site. A Block that shipped them as
 * strings would install one company's history into every consumer's page, so what
 * travels is the shape: a date, a name, what changed, and a figure with a caption
 * somebody had to write.
 *
 * **One `<ol>`, and the rail is not a second list.** A history that was drawn as
 * a row per milestone group would be several lists, and a screen reader would
 * announce it as three lists rather than one sequence. The milestones are one
 * ordered list, the rail is a decorative span inside each entry, and it is marked
 * `aria-hidden` so the sequence is read from the entries and not from a rule. The
 * rule is what a sighted reader uses to see continuity; the order is what every
 * other reader uses, and it comes from the element rather than from the drawing.
 *
 * **The dot is on the rail and the rail is behind it, which is what makes the
 * vertical form read as one line rather than as a stack of rules.** The spine is
 * drawn from the dot to the bottom of its own entry, so the last entry draws no
 * spine and the line stops at the last dot instead of trailing past the end. That
 * is the detail that separates a rail from a border, and it is the same detail
 * `Timeline` states for its own spine.
 *
 * **The horizontal form is the one to watch, and the breakpoint is this Block's
 * decision.** A five-milestone horizontal rail on a phone is five columns of
 * unreadable text, so below `md` the horizontal form is the vertical form. The
 * alternative was a prop for the width at which the rail turns, and it was
 * refused: a consumer that set it too low would ship five columns of unreadable
 * text, and a consumer that set it too high would get a vertical rail on a
 * laptop. The honest answer is one breakpoint, made once, in the place that owns
 * the layout.
 *
 * **Both forms are one set of elements.** The horizontal form is not a second
 * tree rendered beside the first: it is the same `<ol>`, the same `<li>` and the
 * same spine, with the track count and the spine's axis changed by utility
 * classes at `md`. Two trees would have meant the history twice in the
 * accessibility tree and twice for a crawler, and a reader who resized the window
 * would have watched one copy of the section swap for the other. The cost of one
 * tree is that the last milestone's rule is dropped on the vertical form and kept
 * on the horizontal one, because a horizontal rail that stopped one column early
 * reads as a rail that ran out.
 *
 * A milestone's title is a heading one step below the section, derived rather
 * than written, so a Block embedded one level deeper carries its headings with
 * it. A `body` that runs past four lines stops being a milestone body, and the
 * detail belongs above the rail in `description` or in the `media` figure beside
 * it.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function Story01({
  eyebrow,
  title,
  description,
  milestones,
  orient = 'vertical',
  headingLevel = 'h2',
  className,
}: Story01Props) {
  // A milestone title is a heading one step below the section that introduces the
  // sequence, so a reader navigating by heading meets the history under the
  // section that introduces it rather than as a set of its siblings.
  const Title = childLevel(headingLevel)
  const horizontal = orient === 'horizontal'

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
        data-slot="story-01-rail"
        data-orient={orient}
        className={cn('grid gap-x-8', horizontal && HORIZONTAL_TRACKS, className)}
      >
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1

          return (
            <li
              key={milestone.id}
              data-slot="story-01-milestone"
              className={cn(
                // One set of elements for both forms. Below the breakpoint the
                // marker is a narrow first track beside the text and the spine
                // runs down it; at and above it the marker track becomes a full
                // row above the text and the spine runs across it, which is a
                // rail the reader reads left to right.
                'grid grid-cols-[auto_minmax(0,1fr)] gap-x-4',
                horizontal && 'md:grid-cols-1 md:gap-x-0 md:gap-y-3',
              )}
            >
              <div
                data-slot="story-01-track"
                aria-hidden
                className={cn(
                  'flex flex-col items-center',
                  horizontal && 'md:flex-row md:items-center md:gap-2',
                )}
              >
                <span
                  data-slot="story-01-marker"
                  className="bg-primary mt-2 size-2.5 shrink-0 rounded-full"
                />
                <span
                  data-slot="story-01-spine"
                  className={cn(
                    'bg-border w-px flex-1',
                    // The last entry has nothing under it on the vertical form, so
                    // its rule is dropped rather than trailing past the end of the
                    // history. The horizontal form keeps it, because a rail that
                    // stopped one column short reads as a rail that ran out.
                    isLast && 'md:hidden',
                    horizontal && 'md:h-px md:w-auto',
                  )}
                />
              </div>

              <div
                data-slot="story-01-body"
                className="flex min-w-0 flex-col gap-3 pb-10 last:pb-0 md:pb-0"
              >
                <span data-slot="story-01-at" className="text-muted-foreground font-mono text-xs">
                  {milestone.at}
                </span>
                <Title className="text-lg tracking-tight">{milestone.title}</Title>
                <p className="text-muted-foreground text-pretty text-sm">{milestone.body}</p>

                {milestone.media ? (
                  <figure data-slot="story-01-media" className="mt-1 flex flex-col gap-2">
                    {milestone.media}
                    {milestone.mediaLabel ? (
                      <figcaption className="text-muted-foreground text-xs">
                        {milestone.mediaLabel}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

export default Story01
