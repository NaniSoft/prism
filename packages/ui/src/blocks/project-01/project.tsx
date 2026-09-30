import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Progress } from '../../components/ui/progress'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Steps, type Step } from '../../components/ui/steps'
import { cn } from '../../lib/utils'

/**
 * The five states a project can be in.
 *
 * Five, and the words for them are the caller's rather than the type's, so this
 * list is a set of positions rather than a vocabulary. That is the whole reason
 * `stateLabel` exists and why it is required: four NaniSoft products each track
 * this differently, and between them they use eleven words for these five
 * positions, where "In progress" and "Active" and "Running" are one position and
 * "Shipped" and "Done" and "Delivered" are another.
 *
 * A sixth state would be the one that splits a position that does not need
 * splitting: `at-risk` over `blocked`, or a `live` that is not `complete`. Each
 * one is a colour a reader has to learn and a word a maintainer has to keep true,
 * and a ladder with more rungs than positions is how a status column stops being
 * readable. What the caller wants to say about a project is `summary` and the
 * caller's own `stateLabel`; the five below are the positions a project is in.
 */
export type ProjectState = 'planning' | 'active' | 'blocked' | 'complete' | 'archived'

/**
 * The tone each state is drawn in, from the semantic contract and no other.
 *
 * Two of the five share a role and the sharing is deliberate rather than lazy.
 * `active` and `complete` are both `success`, because a project that is running
 * and a project that finished are the two states a reader is glad to see, and the
 * words beside the dot are what tell them apart, which is the arrangement the
 * whole tier rests on: colour is never the only channel. `planning` is `info`,
 * the contract's cool role that means not an alarm, because work being shaped is
 * not a fault. `archived` is `neutral`, because a project nobody is working on is
 * not in dispute and must not be drawn as though it were.
 *
 * `blocked` is `warning` and not `destructive`, for the reason `FieldMap01` gives
 * for an unmapped field: an unmapped field is a thing to do rather than a
 * breakage, and a table of thirty projects where four are amber is a table with
 * four tasks in it, while the same four in red reads as four incidents and sends
 * a reader looking for a failure that is not happening. The cost is named here
 * because it is real: a blocked project is a genuine problem, and this tone says
 * "attend to it" rather than "something is broken". A caller whose product treats
 * a block as a failure has no seam here, and the answer is `summary`.
 */
const STATE_TONE: Record<ProjectState, StatusTone> = {
  planning: 'info',
  active: 'success',
  blocked: 'warning',
  complete: 'success',
  archived: 'neutral',
}

/**
 * One person: the name, the portrait where there is one, and a destination where
 * the consumer publishes one.
 *
 * The same shape `Team01` takes for a person, repeated rather than imported for
 * the reason that file gives: a Block that is not a card grid is not a place a
 * person's identity belongs, and a caller drawing a person in a project header and
 * the same person on a team page is better served by one field name than by a type
 * exported from whichever Block they found first.
 */
export type Project01Owner = {
  /** The person's own name, as they publish it. */
  name: string
  /**
   * The portrait, with the name the initials come from.
   *
   * A name rather than a string, because an `Avatar` with no fallback is an empty
   * circle for exactly as long as the image takes to arrive and forever if it
   * never does.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
  /** Where the person goes. Rendered as a native anchor, so the destination is real. */
  href?: string
  /**
   * The words on that link, and required whenever `href` is set.
   *
   * A link whose only words are a person's name tells a reader nothing about what
   * activating it will do, which is the same defect `Contact01` refuses. The
   * sentence saying that following the link is a thing you can do belongs to the
   * caller, because the destination is theirs.
   */
  hrefLabel?: string
}

/**
 * One figure about the project: what it measures, what it reads, and the change
 * against the last reading.
 *
 * `value` is a node and not a number, for the reason `MetricProps.value` gives: a
 * caller's figure is very often a value it formatted itself, with its own grouped
 * thousands, its own currency and its own unit, and a `number` here would push
 * that formatting onto every call site twice.
 */
export type Project01Figure = {
  /** What the figure measures, read under it. */
  label: string
  /** The figure itself, already formatted by the caller. */
  value: ReactNode
  /**
   * The change against the previous reading, as a number whose sign is the
   * direction. See `MetricDelta` on the Component.
   */
  delta?: number
}

/**
 * One stage of the project: what it is called, when it happened or is due, and
 * where it stands.
 *
 * `name` is the anchor and it is what the rail is scanned for, so it is kept to
 * the words a reader would use in conversation. The moment and the state are
 * separate fields because they are separate facts, and a stage that has a date and
 * no state is a real one.
 */
export type Project01Stage = {
  /** A stable key for the stage. */
  id: string
  /** What the stage is called, in the caller's own words. */
  name: string
  /**
   * When the stage happened, or is due.
   *
   * Epoch milliseconds, a `Date`, or a string the platform parses, and Prism
   * hands it to `RelativeTime` untouched, so the reading a reader sees is the
   * platform's in their own locale. See the Block JSDoc for why this Block
   * formats nothing and takes the sentence from the caller instead.
   */
  at?: number | string
  /**
   * Where the stage stands.
   *
   * `done` is behind the reader, `current` is where they are, and `upcoming` is
   * ahead. A stage's state is a position in a sequence rather than a judgement
   * about the project, which is why this list is three and `ProjectState` is five:
   * a project can be blocked, and a stage in a sequence cannot, because a blocked
   * stage is a fact about the project and belongs in its state.
   */
  state: 'done' | 'current' | 'upcoming'
  /**
   * The words for that state, in the product's own vocabulary.
   *
   * Required whenever a stage carries a state, and every stage does, so the run
   * throws without it. The mark `Steps` draws is a shape, and a shape is not a
   * sentence a reader can act on: "Shipped", "In review", "Signed off" and
   * "Delivered" are the same position in four products' words.
   */
  stateLabel?: string
}

/**
 * The state a stage's mark is drawn from.
 *
 * Three entries for three positions. `done` becomes `complete` because that is
 * the word `Steps` uses for a stage behind the reader, and the two vocabularies
 * differ only there. A map rather than a lookup at the call site because the
 * translation is a fact about the Component and not about the data, and a Block
 * that spelled `complete` in five places would be five chances to spell it once
 * wrong.
 */
const RAIL_STATE = {
  done: 'complete',
  current: 'current',
  upcoming: 'upcoming',
} as const

/**
 * The props a Project01 takes, and the one conditional pair among them.
 *
 * Every string and every number is a prop and the Block ships none: no project, no
 * state, no stage, no figure, no date and not one word of the sentence that says
 * where a project is. The absence of the project itself is the sharpest version
 * of the rule, because a project header drawn with a name in it is the single
 * easiest thing in this package to write by accident and the single most likely
 * to be somebody else's project.
 *
 * `progress` and `progressLabel` are a union rather than two optionals, and the
 * reason is the one the authoring contract states: a prop that is required in one
 * shape and forbidden in another cannot be an optional. The bar's own value is a
 * number and a number is not a sentence, so the words beside it are the caller's,
 * and a caller who has a fill and no words for it has a bar that announces a bare
 * figure meaning whatever the reader assumes it is a percentage of.
 */
export type Project01Props = {
  /**
   * The project's own name.
   *
   * Required, and it is the section heading rather than a field inside the
   * surface, because a project detail whose name is a line of body text has
   * already lost the outline: a reader navigating by heading would meet the
   * section and then nothing until the fields.
   */
  name: string
  /** One or two sentences about what this project is, under the name. */
  summary?: ReactNode
  /** Where the project stands. See `ProjectState`. */
  state: ProjectState
  /**
   * The words for that state, in the product's own vocabulary.
   *
   * Required and not derived from `state`, for the reason `ProjectState` gives:
   * the state is a colour and the words are a claim, and four products use eleven
   * words for five positions between them.
   */
  stateLabel: (state: ProjectState) => string
  /** Who owns it. Omit it for a project nobody owns, which is a real state. */
  owner?: Project01Owner
  /** When the project opened. Handed to `RelativeTime` untouched. */
  startsAt?: number | string
  /** When it is due to close. Handed to `RelativeTime` untouched. */
  endsAt?: number | string
  /**
   * The sentence for a moment in the span, given the moment.
   *
   * Optional, and its absence is a legitimate state rather than a gap: a project
   * with a start and no end is an open project, and a project whose reader wants
   * no relative words at all is a printed report. When it is given, it is the
   * caller's words beside the platform's absolute reading, which is the one
   * arrangement in this package where a date is neither formatted nor left bare.
   */
  dateLabel?: (value: number | string) => string
  /** The figures, in the order a reader should meet them. */
  figures?: Project01Figure[]
  /**
   * The stages, in the order the project runs them.
   *
   * Order is the caller's because it is a claim about a sequence, and the rail
   * this Block composes says "steps" to every reader and to every crawler, so a
   * list in an order the project does not have is a wrong diagram rather than a
   * layout problem.
   */
  stages?: Project01Stage[]
  /**
   * The controls that act on the project as a whole: pause, archive, cancel, open
   * it somewhere.
   *
   * A slot and not a set of named buttons, because which controls a project has is
   * the caller's fact: an estate that can archive a project and a pipeline that
   * can cancel one share a header and nothing else. A Block that drew a pause
   * control would hand every consumer a permission its product may not grant.
   */
  actions?: ReactNode
  /**
   * Whether the facts sit in an aside beside the body or above it.
   *
   * `stacked` is the default because a project detail is read top to bottom, and
   * the facts above the fold are the two a reader checks first. `split` puts the
   * state, the owner, the span and the controls in a narrow column at the leading
   * edge and gives the figures and the stages the width, which is right on a wide
   * page where the reader is comparing this project against another one in the same
   * session, and wrong on a phone where the main column would be at half the
   * reading measure.
   *
   * The two facts and the controls are in one place in both arrangements, so a
   * caller who switches `layout` does not move a single control: what changes is
   * the column they sit in and nothing else.
   *
   * There is no third arrangement that changes Prism's drawing rather than this
   * Block's spacing, because `className` is layout only.
   */
  layout?: 'stacked' | 'split'
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited. */
  className?: string
} & (
  | {
      /**
       * How far along the project is, on `Progress`'s own scale of 0 to 100.
       *
       * Omit it for a project that is not measured, and the Block draws no bar
       * rather than a bar at zero, because a bar at zero is a claim that nothing
       * has happened and a planning project is a thing that has not started.
       */
      progress: number
      /**
       * The sentence the bar announces, given the value and the project's name.
       *
       * Required, and a function rather than a template for the reason
       * `RelativeTime` gives in full: a bar is a percentage of something this
       * Block cannot see, and forty per cent of a migration is not the same fact
       * as forty per cent of a rollout. The name is in the argument because a
       * project with two bars on one page is a page a reader has to be told which
       * bar is which, and this is the cheap half of the answer: the caller has
       * both names and this one has been passed.
       */
      progressLabel: (value: number, project: string) => string
    }
  | {
      /** No fill, so no sentence is owed and none is accepted. */
      progress?: never
      progressLabel?: never
    }
)

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup` and `Team01` apply and it is
 * repeated here for the reason `Team01` states in full: that helper is private to
 * its module and exporting it would make a private derivation part of the
 * published surface of a Component in order to save six lines in a Block. The cost
 * of the repetition is named rather than hidden, because three modules now carry
 * this rule and a change to it is a change in three. A caller who needs a case it
 * does not cover passes their own node through the `avatar` slot's `name` and a
 * monogram of their own choosing.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * The stage the rail is on, and the reason this Block picks it rather than asking.
 *
 * `Steps` requires exactly one current step and throws without one, and a
 * project's stage list is a place where that is genuinely absent: a project whose
 * stages are all done has no current stage, and a project nobody has started has
 * one that is not declared. So the rail's position is derived when the caller has
 * not declared it: the first stage that has not been done, and the last stage
 * when everything is done, which is the only position a finished rail can hold.
 *
 * The caller who has declared one gets it, and the caller who has declared two is
 * a caller whose data contradicts itself, which the guard above refuses rather
 * than a position this Block guesses at.
 */
function railCurrent(stages: readonly Project01Stage[]): number {
  const declared = stages.findIndex((stage) => stage.state === 'current')
  if (declared !== -1) return declared
  const firstOpen = stages.findIndex((stage) => stage.state === 'upcoming')
  return firstOpen === -1 ? stages.length - 1 : firstOpen
}

/**
 * A project in full: its name, where it stands, who owns it, when it runs, how far
 * along it is, what it reads, and the stages it is on.
 *
 * **The reader here is looking for one project, so everything in this Block is
 * scannable and the two things a reader reaches for are a state and an owner.**
 * That is the fact the whole arrangement is built on, and it is why the state and
 * the owner sit on the first line under the name rather than in a field list at
 * the bottom: a reader who has opened a project to find out whether it is stuck
 * has two questions, and neither of them is a figure. Scanability and keyboard
 * reach outrank expression at this tier, and a state nobody can find in a glance
 * is a state this Block has failed to ship whatever else it got right.
 *
 * **The state is `Status` and the figures are `Metric`, and neither was redrawn.**
 * `Status` is a dot in one of five tones beside the caller's own words, and it
 * owns the arrangement that matters here: the dot is `aria-hidden` and the words
 * carry the state, so a reader who cannot separate `warning` from `destructive`
 * still reads which is which, and a state is never colour alone. A hand-drawn dot
 * beside a word in this Block would be a second implementation of that Component
 * and the second one is the one that gets the `aria-hidden` wrong. `Metric` owns
 * the arrangement a headline figure is read in, which puts the figure first and
 * the name under it, and it owns the fact that a string figure is set in the mono
 * face while a composed one is not. The one thing it cannot do is print a delta it
 * has no unit for, and the cost of that is stated on `Project01Figure`.
 *
 * **The fill is `Progress` with `valueText`, and the reason is the seam rather
 * than the bar.** A hand-drawn filled bar is a div with a width on it, and a div
 * with a width is a picture of a value that no screen reader, no crawler and no
 * print stylesheet can read, which is the exact failure `Progress` exists to close
 * because it exposes the value, the minimum and the maximum through ARIA. The
 * second half is why the words travel as a string: this Block is a server
 * Component and `Progress` is a client one, so a callback handed down from here is
 * a build error rather than a warning, and `Progress` therefore publishes
 * `valueText` for exactly this case. The cost of composing it is real and is named
 * here: `Progress` is a client Component, so a project with a fill is a client
 * island and a caller with forty projects on one page is paying for forty. The
 * answer is to leave `progress` off the projects that are not measured.
 *
 * **The stage list is `Steps`, because the rail is a Component and the three
 * marks are already right.** The alternative was a hand-drawn list of discs and
 * rules, and it is a second implementation of three things `Steps` has already
 * settled: that the states differ by shape before they differ by colour, so a
 * reader who cannot separate a filled disc from a ring is not being told two
 * different things about two different stages; that exactly one step carries
 * `aria-current`, because two current steps is a rail with two answers to where
 * the reader is; and that the rule between the steps carries how far along they
 * are, rather than a bar per step restating "done" once per stage and leaving the
 * arithmetic to the reader. The cost is stated rather than hidden, and it is the
 * rail's own limitation rather than this Block's: `Steps`'s qualifier is a string,
 * and a stage's moment is a node, so the rail cannot hold a date. The moments are
 * drawn beneath it as the definition list they are, and a caller whose stages are
 * mostly dates wants `MilestoneTimeline01`, which is the Block built for a dated
 * sequence.
 *
 * **The dates are the caller's and the sentence is the caller's, and this is the
 * same rule the rest of this roster keeps arriving at from three directions.** The
 * moments are passed to `RelativeTime` untouched, so the absolute reading a reader
 * sees is the platform's own in the language they have, and `dateLabel` supplies
 * the sentence beside it, which is the one string in the pair that is English by
 * nature: it has a plural, it changes shape past a day, and every language words
 * it differently. A Block that formatted the moment instead would ship one
 * locale's format into every consumer's project, and a Block that wrote the
 * sentence would ship English. The honest cost is a small one and it is named
 * here: `dateLabel` is given the moment and not the role, so it cannot say whether
 * a reading is the start of the span or the end of it, and the order is what
 * carries that. A caller whose product names its two ends differently composes the
 * two readings themselves, which is the same amount of work and one more prop.
 *
 * **It is a server Component.** No hook, no state, no client code of its own and
 * no router. The only client code it can pull in is one `Progress` island on the
 * project that asks for a fill, and the portrait is `Avatar`, whose only client
 * work is measuring whether an image has loaded.
 */
export function Project01({
  name,
  summary,
  state,
  stateLabel,
  owner,
  startsAt,
  endsAt,
  dateLabel,
  figures,
  stages,
  actions,
  progress,
  progressLabel,
  layout = 'stacked',
  headingLevel = 'h2',
  className,
}: Project01Props) {
  /*
   * The announced sentence for the bar, bound once after the guard below.
   *
   * The union above is what makes the pair complete, so by the time anything
   * renders the function is there. The type cannot see that, because the check is
   * on one arm of a union and the use is inside a ternary over `progress`, so a
   * closure is bound here and the render reads one name. `labelProgress` never
   * returns an empty string: the guard has already refused that case, and a second
   * refusal inside the render would be the same diagnostic twice.
   */
  const labelProgress = (value: number): string => {
    if (progressLabel === undefined) {
      throw new Error(
        'Project01: reached the bar with no progressLabel, which the union above should have made ' +
          'impossible. The two are separate so that the diagnostic names the prop rather than the render.',
      )
    }
    return progressLabel(value, name)
  }

  if (owner !== undefined && owner.href !== undefined && !owner.hrefLabel) {
    throw new Error(
      `Project01: the owner of "${name}" declares an href with no hrefLabel, so the link would be ` +
        'announced by its destination alone. A person\'s name is a name, and the sentence saying that ' +
        'following the link is a thing you can do belongs to the caller.',
    )
  }

  const currents = stages?.filter((stage) => stage.state === 'current').length ?? 0
  if (currents > 1) {
    throw new Error(
      `Project01: the stages of "${name}" declare ${currents} current stages, and a rail has one ` +
        'position. Two current stages is a reader told they are in two places at once. Declare one, or ' +
        'leave the state to the order.',
    )
  }

  for (const stage of stages ?? []) {
    if (!stage.stateLabel) {
      throw new Error(
        `Project01: the stage "${stage.id}" declares a state and no stateLabel, so the mark beside it ` +
          'would be a shape with no sentence, and a shape a reader can only see is a state nobody can act ' +
          'on. Pass the words your readers use for that position.',
      )
    }
  }

  const rail: Step[] = (stages ?? []).map((stage) => ({
    label: stage.name,
    description: stage.stateLabel,
    // The states are the caller's rather than the rail's whenever the caller
    // declared a position, because a project that reached a stage out of band is
    // real and a rail derived from the order would draw a claim the data
    // contradicts. With no declared position the rail derives every mark, which is
    // the arrangement that cannot disagree with itself.
    ...(currents === 1 ? { state: RAIL_STATE[stage.state] } : null),
  }))

  const dated = (stages ?? []).filter(
    (stage): stage is Project01Stage & { at: number | string } => stage.at !== undefined,
  )
  const hasSpan = startsAt !== undefined || endsAt !== undefined
  const aside = (
    <div data-slot="project-01-aside" className="flex min-w-0 flex-col gap-6">
      <div data-slot="project-01-facts" className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Status tone={STATE_TONE[state]} label={stateLabel(state)} />

        {owner === undefined ? null : (
          <span data-slot="project-01-owner" className="flex min-w-0 items-center gap-2">
            {owner.avatar === undefined ? null : (
              <Avatar className="size-6">
                {owner.avatar.src === undefined ? null : (
                  <AvatarImage src={owner.avatar.src} alt="" />
                )}
                <AvatarFallback className="text-mono">{initialsOf(owner.avatar.name)}</AvatarFallback>
              </Avatar>
            )}
            {owner.href === undefined || owner.hrefLabel === undefined ? (
              <span data-slot="project-01-owner-name" className="text-sm">
                {owner.name}
              </span>
            ) : (
              <CtaLink href={owner.href} size="sm" variant="ghost">
                {owner.hrefLabel}
              </CtaLink>
            )}
          </span>
        )}

        {hasSpan ? (
          /*
            The two ends of the span, in the order the span runs, with no separator
            between them. The gap is the separator and it is deliberate: a dash, a
            comma or a "to" would be a word or a piece of punctuation this Block
            chose, and the caller's `dateLabel` is the only thing on this line
            allowed to say anything. `data-slot` names each end so a test and a
            caller can find one of them, which is what a reader cannot do.
          */
          <span
            data-slot="project-01-span"
            className="text-muted-foreground flex flex-wrap items-baseline gap-x-3 text-sm"
          >
            {startsAt === undefined ? null : (
              <RelativeTime
                data-slot="project-01-start"
                date={startsAt}
                relative={dateLabel?.(startsAt)}
              />
            )}
            {endsAt === undefined ? null : (
              <RelativeTime
                data-slot="project-01-end"
                date={endsAt}
                relative={dateLabel?.(endsAt)}
              />
            )}
          </span>
        ) : null}
      </div>

      {actions === undefined ? null : (
        <div data-slot="project-01-actions" className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )

  const body = (
    <>
      {progress === undefined ? null : (
        <div data-slot="project-01-progress" className="flex flex-col gap-2">
          <Progress value={progress} valueText={labelProgress(progress)} />
        </div>
      )}

      {figures === undefined || figures.length === 0 ? null : (
        <div
          data-slot="project-01-figures"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {figures.map((figure) => (
            <Metric
              key={figure.label}
              data-slot="project-01-figure"
              value={figure.value}
              label={figure.label}
              delta={figure.delta}
            />
          ))}
        </div>
      )}

      {stages === undefined || stages.length === 0 ? null : (
        <div data-slot="project-01-stages" className="flex flex-col gap-6">
          <Steps steps={rail} current={railCurrent(stages)} />

          {dated.length === 0 ? null : (
            /*
              The moments, which the rail has no room for. See the JSDoc above: a
              `Step`'s qualifier is a string, and a date is a node, so the two ends
              of the same fact cannot both go in the rail. A definition list is the
              honest shape for a set of names and their moments, and it is drawn
              only when there is a moment to draw, because a list of nothing is a
              gap the reader looks through.
            */
            <dl data-slot="project-01-dates" className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {dated.map((stage) => (
                <div key={stage.id} data-slot="project-01-date" className="flex items-baseline gap-3">
                  <dt className="text-sm font-medium">{stage.name}</dt>
                  <dd className="text-muted-foreground text-sm">
                    <RelativeTime date={stage.at} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </>
  )

  return (
    <Section data-slot="project-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        title={name}
        description={summary}
        className="mb-10"
      />

      <div
        data-slot="project-01-body"
        data-layout={layout}
        className={cn(
          // The two layouts get one display each rather than a base and an
          // override, because `flex` and `grid` are the same property and which
          // one wins is a question about the order of the generated stylesheet
          // rather than about the order of the class names here.
          layout === 'split'
            ? 'grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14'
            : 'flex flex-col gap-10',
        )}
      >
        {layout === 'split' ? (
          <>
            <div data-slot="project-01-main" className="flex min-w-0 flex-col gap-10">
              {body}
            </div>
            {aside}
          </>
        ) : (
          <>
            {aside}
            {body}
          </>
        )}
      </div>
    </Section>
  )
}

export default Project01
