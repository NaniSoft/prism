import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Progress } from '../../components/ui/progress'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Status } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The three states a milestone can be in.
 *
 * Three, and the set is the sequence's rather than the Block's: a milestone
 * either happened, is where the system is, or has not happened yet, and a fourth
 * such as `delayed` or `at-risk` is a claim about a plan rather than a position
 * in a sequence, which is what the three words are. A caller whose roadmap has a
 * fourth state states it in the `body`, where a reader reads a sentence about one
 * milestone, rather than here, where a fourth mark would be a colour the reader
 * has to learn and a maintainer has to keep true.
 */
export type MilestoneState = 'complete' | 'current' | 'upcoming'

/**
 * The mark each of the three states draws.
 *
 * The three differ by fill before they differ by colour, for the reason
 * `steps.tsx` states in full: a filled mint disc and a mint outline are the same
 * picture narrowed to one channel, and a reader who cannot separate them is being
 * told the same thing about two different milestones. `current` is the only one
 * that carries words, and that is what makes a state column of three shapes
 * honest rather than colour-coded.
 */
const MARK: Record<MilestoneState, string> = {
  complete: 'bg-primary border-primary',
  current: 'bg-background border-brand-ink',
  upcoming: 'bg-muted border-border',
}

/**
 * One thing a system reached, when it reached it, and how far along it was.
 */
export type Milestone = {
  /** A stable key for the milestone. */
  id: string
  /**
   * When it was reached, already written the way the reader should see it.
   *
   * A string and not a `Date`, for the reason this repository has already written
   * down for the sibling that takes the same field: a `Date` carries a timezone
   * and a calendar and renders as `Wed Mar 04 2026 00:00:00 GMT+0000` unless
   * something formats it, so a `Date` prop would push the formatting decision
   * onto every consumer and make the wrong answer the easy one. As a string the
   * Block prints what it was given, which is honest whether that is `2024`,
   * `Q3 2024` or `Winter 2024`. A caller who needs a localised absolute reading
   * composes `RelativeTime` themselves, which hands back the platform's own
   * formatting for the moment and the caller's own words for the distance from
   * now, and a caller who wants a fixed date uses the platform's
   * `Intl.DateTimeFormat` directly. Neither is available to this Block, which
   * knows no locale and would ship English month names into every consumer's
   * product.
   */
  at: string
  /** What the milestone is called, in the caller's own words. */
  title: string
  /** What the milestone changed, for a reader who has arrived at it. */
  body?: ReactNode
  /**
   * How far along this milestone was, as a percentage, or nothing.
   *
   * Omit it for a milestone that is a moment rather than a piece of work, and the
   * row draws no bar at all rather than a bar at zero, because a bar at zero is a
   * claim that nothing happened and a milestone is by definition something that
   * did.
   */
  progress?: number
  /**
   * Where the milestone stands. Omit it and the row draws a bare tick on the
   * rail rather than one of the three state marks, because the alternative is
   * this Block drawing a state the caller did not say.
   */
  state?: MilestoneState
  /** Where the milestone goes. Rendered as a native anchor. */
  href?: string
  /** The words on that link. Required whenever `href` is set. */
  hrefLabel?: string
}

/**
 * The props a MilestoneTimeline01 takes.
 *
 * Every string and every number is a prop and the Block ships none. There is no
 * default sequence, no default date, no default state and no default wording for
 * the current milestone, and the absence of the sequence is the sharpest version
 * of the rule: what a system has reached is a claim about a system, and a Block
 * that shipped one would be publishing a roadmap on every consumer's behalf.
 */
export type MilestoneTimeline01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a sequence with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The milestones, in the order they were reached. Order is the caller's,
   * because it is a claim about what came first.
   */
  milestones: readonly Milestone[]
  /**
   * The words for the milestone that is current, and the only state on the rail
   * that carries any. Required whenever a milestone is `current`.
   */
  nowLabel?: string
  /**
   * The words for a milestone's progress, given the number.
   *
   * Required whenever any milestone carries `progress`. See the Component JSDoc
   * for why the bar's own value is not enough to announce.
   */
  progressLabel?: (value: number) => string
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A dated sequence of what a system reached: when, what, and how far along it
 * was, on a rail with a rule down one side and a fill per milestone.
 *
 * **What this is not, and it has to be sharp because two sibling items exist and
 * a reader will meet all three.** The three differ by tense and by whether the
 * sequence is still running, and nothing else, so the differences are worth
 * stating as exactly that. `timeline.tsx` is a Component, not a Block, and it
 * shows where a **run** has got to **as it happens**: it is fed events, it has
 * four run states of its own (`pending`, `running`, `done`, `failed`), it scales
 * each step's duration against the longest step in the run, and one of its states
 * moves. It is a `live` concern, and a reader who met one of those on a page
 * would be told something about the product is running right now. `story-01` is
 * a Block, and it arranges a company's **past** in the **past tense**: a history,
 * dated, in the order it happened, with a figure beside some of the entries and
 * no state on any of them, because a history has nothing to be current about.
 * This Block is a Block too, and it shows a system's **reached and not yet** state
 * with a **fill per milestone**, and that is the middle case: it has a future, so
 * it has an `upcoming`, and it has a position, so exactly one of its milestones
 * may be `current` and that one is named. A consumer who has a run wants
 * `Timeline`, a consumer who has a company wants `story-01`, and a consumer who
 * has a system that has got to where it is now, and has not got to the rest of
 * it, wants this.
 *
 * **The fill is `Progress`, and a filled bar drawn here would be a second
 * implementation of a Component whose accessibility was already worked out.**
 * Three states in a row is what `steps.tsx` already owns, and a Block that
 * re-drew the rule would be a second implementation of a Component whose
 * accessibility was already worked out. The same argument settles the bar: a
 * hand-drawn filled bar is a div with a width on it, and a div with a width is a
 * picture of a value that no screen reader, no crawler and no print stylesheet can
 * read, which is the exact failure `Progress` exists to close, because it exposes
 * the value, the minimum and the maximum through ARIA and takes the words for it
 * through `valueText`. The cost of composing it rather than drawing is real
 * and is named here: `Progress` is a client Component over Base UI, so a
 * milestone that carries a `progress` is a client island, and a consumer with
 * eight milestones all carrying one is paying for eight. The answer is to leave
 * `progress` off the milestones that are moments, which is what the prop's own
 * documentation says.
 *
 * **The words travel as a string and not as a function, and that is the server
 * boundary rather than a preference.** This Block is a server Component and
 * `Progress` is a client one, so a callback prop handed down from here is a build
 * error: the two halves do not share a runtime, and a function cannot be
 * serialised across the seam. It called `getAriaValueText={(v) => progressLabel(v)}`
 * first, and the whole roster failed to prerender on the first milestone that
 * carried a bar. `Progress` therefore publishes `valueText` for exactly this case
 * and throws when a caller gives it both forms, so the ambiguity is reported
 * rather than resolved by whichever prop the framework happened to read last.
 *
 * **`progressLabel` is required whenever a milestone carries a `progress`, and
 * the reason is that the number is not a sentence and does not know its unit.**
 * A milestone's bar is a percentage of something this Block cannot see, and
 * sixty per cent of a migration is not the same fact as sixty per cent of a
 * rollout of a policy, so the bar alone announces a bare figure that means
 * whatever the reader assumes. The label is the caller's because the thing being
 * measured is the caller's, and the same argument as `RelativeTime` applies to the
 * rest of this surface: a sentence about a caller's own quantity cannot be
 * authored here, because Prism does not know the unit, the period, or what the
 * bar is a bar of.
 *
 * **`nowLabel` is required whenever a milestone is `current`, and the reason is
 * the one this package keeps arriving at from three directions.** A mark is a
 * shape, and a reader who cannot separate the emphasis ink from the border colour
 * has learned nothing from it; a `current` milestone is the one row a reader may
 * act on, and an unnamed current row is a row a reader has to guess the
 * importance of. `StatusLedger01` requires its words for the same reason,
 * `InstrumentPanel01` throws on a state with no label beside it, and the copy gate
 * holds the close button of a dialog for it. The Block throws rather than
 * shipping a state a reader can only see.
 *
 * **A milestone with no state draws a tick and not one of the three marks.**
 * That is a small decision with a large one behind it. The three state marks all
 * say something: this one is reached, this one is where the system is, this one
 * has not happened. A caller who passes no `state` has said none of those, and the
 * Block cannot pick one on their behalf, because the two available guesses are
 * both wrong in a way a reader would act on. Drawing it as `complete` claims the
 * system got there, and a milestone the team is still working on would then read
 * as done. Drawing it as `upcoming` claims it has not, and a milestone that
 * finished last year would then read as pending. So the row draws a bare hairline
 * on the rail, which reads as a mark that has nothing to say, and the sequence is
 * still complete and legible without it.
 *
 * **`at` is a string rather than a `Date`, so the caller keeps its own locale.**
 * See the field's own documentation above. A `Date` prop would carry a timezone
 * and a calendar into a Block that formats nothing, and the honest way to render
 * a moment in a caller's language is the caller's to compose: `RelativeTime` for
 * a localised absolute reading with the relative words handed back, or the
 * platform's `Intl.DateTimeFormat` for a fixed one.
 *
 * **One `<ol>`, and the rail is not a second list.** A sequence drawn as a row
 * per group would be several lists, and a screen reader would announce it as
 * several. The milestones are one ordered list, the spine is a decorative span
 * inside each entry and is `aria-hidden`, so the sequence is read from the
 * entries and not from a rule. The spine runs from the mark to the bottom of its
 * own entry and the last entry draws none, which is the detail that separates a
 * rail from a border.
 *
 * A milestone title is a heading one step below the section, derived rather than
 * written, so a Block embedded one level deeper carries its headings with it. A
 * body of more than about four lines stops being a milestone body, and the detail
 * belongs above the rail in `description` or in the caller's own figure.
 *
 * It is a server Component: no hook, no state, no client code of its own and no
 * router. The only client code it can pull in is one `Progress` island per
 * milestone that asks for a fill.
 */
export function MilestoneTimeline01({
  eyebrow,
  title,
  description,
  milestones,
  nowLabel,
  progressLabel,
  headingLevel = 'h2',
  className,
}: MilestoneTimeline01Props) {
  /*
   * The announced sentence for a bar, bound once after the guard below.
   *
   * The guard throws for a milestone that carries a `progress` with no
   * `progressLabel`, so by the time anything renders the pair is complete. The
   * type cannot see that, because the guard is a loop over the array above the
   * return rather than a narrowing statement on the value being used, so a
   * closure is bound here and the render reads one name. `labelProgress` never
   * returns an empty string: the guard has already refused that case, and a
   * second refusal inside the render would be the same diagnostic twice.
   */
  const labelProgress = (value: number): string => {
    if (progressLabel === undefined) {
      throw new Error(
        'MilestoneTimeline01: reached the bar with no progressLabel, which the guard above should have ' +
          'refused. The two are separate so that the diagnostic names the prop rather than the render.',
      )
    }
    return progressLabel(value)
  }

  for (const milestone of milestones) {
    if (milestone.state === 'current' && !nowLabel) {
      throw new Error(
        'MilestoneTimeline01: a milestone is the current state and no nowLabel was passed, so the one ' +
          'row a reader might act on would be a ring they can only see. Pass the words your readers use ' +
          'for where the system is now, or drop the current state.',
      )
    }
    if (milestone.progress !== undefined && !progressLabel) {
      throw new Error(
        'MilestoneTimeline01: a milestone carries a progress and no progressLabel was passed, so the ' +
          'bar would announce a bare number that means whatever the reader assumes it is a percentage of. ' +
          'Pass the words for the value, or drop the progress.',
      )
    }
    if (milestone.href !== undefined && !milestone.hrefLabel) {
      throw new Error(
        'MilestoneTimeline01: a milestone carries an href with no hrefLabel, so the link would be ' +
          'announced by its destination alone. A milestone name is a name, and the sentence saying that ' +
          'following the link is a thing you can do belongs to the caller.',
      )
    }
  }

  if (milestones.length === 0) return null

  const Title = childLevel(headingLevel)

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <ol data-slot="milestone-timeline" className={cn('flex flex-col', className)}>
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1

          return (
            <li
              key={milestone.id}
              data-slot="milestone"
              data-state={milestone.state ?? 'unstated'}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4"
            >
              <div data-slot="milestone-track" aria-hidden className="flex flex-col items-center">
                {milestone.state === undefined ? (
                  <span data-slot="milestone-tick" className="bg-border mt-3 h-px w-3 shrink-0" />
                ) : (
                  <span
                    data-slot="milestone-marker"
                    className={cn(
                      'mt-2 size-2.5 shrink-0 rounded-full border-2',
                      MARK[milestone.state],
                    )}
                  />
                )}
                <span
                  data-slot="milestone-spine"
                  className={cn('bg-border w-px flex-1', isLast && 'hidden')}
                />
              </div>

              <div
                data-slot="milestone-body"
                className={cn('flex min-w-0 flex-col gap-2', isLast ? 'pb-0' : 'pb-10')}
              >
                <div data-slot="milestone-when" className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span data-slot="milestone-at" className="text-muted-foreground font-mono text-xs">
                    {milestone.at}
                  </span>
                  {milestone.state === 'current' ? (
                    <Status size="sm" tone="info" label={nowLabel} />
                  ) : null}
                </div>

                <Title className="text-lg tracking-tight">{milestone.title}</Title>

                {milestone.body === undefined ? null : (
                  <p data-slot="milestone-copy" className="text-muted-foreground text-pretty text-sm">
                    {milestone.body}
                  </p>
                )}

                {milestone.progress === undefined ? null : (
                  <div data-slot="milestone-progress" className="max-w-measure pt-1">
                    <Progress
                      value={milestone.progress}
                      valueText={labelProgress(milestone.progress)}
                    />
                  </div>
                )}

                {milestone.href === undefined ? null : (
                  <div data-slot="milestone-action" className="pt-1">
                    <CtaLink href={milestone.href} size="sm" variant="ghost">
                      {milestone.hrefLabel}
                    </CtaLink>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

export default MilestoneTimeline01
