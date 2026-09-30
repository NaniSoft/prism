'use client'

import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Steps, type Step } from '../../components/ui/steps'
import { cn } from '../../lib/utils'

/**
 * The four states a setup step can be in.
 *
 * Four, and the fourth is the one this Block is most particular about. `done`,
 * `current` and `upcoming` are the three a sequence has, and they are the three
 * `steps.tsx` already draws. `blocked` is not a position in a sequence: it is a
 * fact about this run, and it is here because a checklist that can only say done
 * and not done and next will read as broken to a reader who is genuinely stuck. A
 * reader who thinks a product is broken stops trusting the product, and they are
 * right to, so a Block that cannot say "you are blocked here" is a Block that
 * answers that reader with a lie by omission.
 */
export type OnboardingState = 'done' | 'current' | 'upcoming' | 'blocked'

/**
 * The mark each of the four states draws, and the shape before the colour.
 *
 * The four differ by shape before they differ by hue, for the reason `steps.tsx`
 * states in full: a filled mint disc and a mint ring are the same picture narrowed
 * to one channel, and a reader who cannot separate them is being told the same
 * thing about two different steps. So `blocked` is the one mark that is not a disc
 * at all, and a square in the alarm ink is findable in a column of circles by a
 * reader who sees no colour whatsoever. The words beside the mark are the caller's
 * and they are what actually carry the state; the mark is a faster read of the same
 * fact, never the fact itself.
 */
const MARK: Record<OnboardingState, string> = {
  done: 'bg-primary border-primary',
  current: 'bg-background border-brand-ink',
  upcoming: 'bg-muted border-border',
  blocked: 'rounded-sm bg-background border-destructive',
}

/**
 * The state a step's mark is drawn from on the rail.
 *
 * Three values for four states, and `done` becomes `complete` because that is the
 * word `Steps` uses for a step behind the reader. `blocked` carries the value the
 * guard has already refused to reach rather than being absent, so the table is
 * total over the four states and the lookup below needs no assertion to say that a
 * blocked step is not on this rail: it is not, and if one arrives the run stopped
 * before this table was read.
 */
const RAIL_STATE: Record<OnboardingState, 'complete' | 'current' | 'upcoming'> = {
  done: 'complete',
  current: 'current',
  upcoming: 'upcoming',
  blocked: 'current',
}

/**
 * One thing the reader has to do, or has done, or will do.
 *
 * `state` is required because a step nobody has placed in the sequence is a
 * reminder, and a reminder is a different surface. `stateLabel` is optional in the
 * type and required in practice, and the run throws without it, for the reason
 * every mark in this package is paired with words: a shape is not a sentence, and
 * "Connected your warehouse" and "Waiting on your warehouse" are two different
 * things to be done at the same step.
 */
export type OnboardingStep = {
  /** A stable key for the step, and what `onSelect` reports. */
  id: string
  /** What the step is, in the words a reader would use in conversation. */
  name: string
  /**
   * A line or two about what this step involves, for a reader who has arrived at
   * it.
   *
   * A node and not a string, because the honest line is sometimes a link to the
   * thing being asked about, a code sample, or a sentence with the caller's own
   * product name in it, and a `string` would force a flattening that loses whichever
   * of those it could not hold.
   */
  description?: ReactNode
  /**
   * Where the step stands.
   *
   * `blocked` is a first-class state here and the JSDoc on `OnboardingState` says
   * why in full: a checklist that cannot say a reader is stuck will read as broken
   * to a reader who is, and a reader who thinks a product is broken stops trusting
   * it.
   */
  state: OnboardingState
  /** The words for that state, in the product's own voice. */
  stateLabel?: string
  /**
   * The control that acts on this step, beside it.
   *
   * A slot and not a named button, because what a step offers is the caller's fact:
   * a connect control, a documentation link, a "skip for now", a retry. Refused
   * outright when `onSelect` is set, because a row cannot be a control and contain
   * one, and the run says so rather than drawing a link inside a button.
   */
  action?: ReactNode
  /** Where the step goes. Rendered as a native anchor, so the destination is real. */
  href?: string
  /** The words on that link. Required whenever `href` is set. */
  hrefLabel?: string
}

/**
 * The props an Onboarding01 takes.
 *
 * Every string and every number is a prop and the Block ships none: no step, no
 * state, no sentence, no count and not the sentence that says how far along the
 * reader is. The progress figure is the sharpest version of the rule, because a
 * checklist that shipped "3 of 6 complete" would put an English sentence and a
 * plural rule into every consumer's product, and the reader's locale owns both.
 */
export type Onboarding01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a checklist with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The steps, in the order the reader should do them.
   *
   * Order is the caller's and it is a claim: this is a route through a setup, and a
   * list in an order the setup does not have is a wrong diagram rather than a layout
   * problem.
   */
  steps: OnboardingStep[]
  /**
   * Called with a step's `id` when the reader picks one.
   *
   * Omit it and the checklist is a list of what is outstanding rather than a set of
   * controls, which is a legitimate state and the right one for a checklist whose
   * steps are done elsewhere.
   */
  onSelect?: (id: string) => void
  /**
   * The sentence the progress figure is named by, given the counts.
   *
   * Required, and a function rather than a template string for the reason
   * `RelativeTime` gives about a relative phrase: it has a plural, it changes shape
   * past one, and every language words it differently. A Block that composed it
   * would compose the English one and ship it into every consumer's product, where a
   * reader in any other language would be shown a count they have to translate in
   * their head.
   */
  progressLabel: (done: number, total: number) => string
  /**
   * The note under the figure, for whatever the caller wants said about it: what
   * happens when the last step is done, what a blocked step needs, where to read
   * more. Omit it and the figure is the whole of the state, which is honest and
   * thin.
   */
  completion?: ReactNode
  /**
   * Whether the steps are a checklist of what is outstanding or a rail of the order.
   *
   * `checklist` is the default, and the reason is who is reading. A reader who has
   * been here once is looking for the one thing left, and a rail of numbered steps
   * answers a question they are not asking: it shows the whole route, which is a
   * document about the order rather than a list of what is outstanding. `steps` is
   * for the first run, when the order is the point and a reader who has never seen
   * the setup needs to know what comes after what.
   */
  variant?: 'checklist' | 'steps'
  /**
   * What the Block renders in place of the steps when there are none.
   *
   * Required, and a slot rather than a string, because a setup with no steps is
   * either a product that has nothing to set up or a caller whose query returned
   * nothing, and those are opposite claims.
   */
  empty: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. */
  className?: string
}

/**
 * The step the rail is on, and the reason this Block picks it rather than asking.
 *
 * `Steps` requires exactly one current step and throws without one, and a setup is a
 * place where that is genuinely absent: a setup the reader finished yesterday has no
 * current step and a setup nobody has started has one that nobody declared. So the
 * position is derived when the caller has not declared it: the first step that has
 * not been done, and the last step when everything is done, which is the only
 * position a finished rail can hold. The caller who has declared one gets it.
 */
function railCurrent(steps: readonly OnboardingStep[]): number {
  const declared = steps.findIndex((step) => step.state === 'current')
  if (declared !== -1) return declared
  const firstOpen = steps.findIndex((step) => step.state === 'upcoming')
  return firstOpen === -1 ? steps.length - 1 : firstOpen
}

/**
 * A setup checklist: the steps that are done, the one the reader is on, the one they
 * are stuck on, and a figure that says how much is left.
 *
 * **A reader here is either on a first run or on a return visit, and the default
 * form is the one for the return visit.** That is the whole argument for
 * `checklist` being the default rather than the alternative: a reader who has been
 * here once is looking for the one thing left, and a rail of numbered steps answers
 * a question they are not asking. It shows the whole route, marks each step and
 * draws a rule between them, which is a document about the order, and a document
 * about the order is what a reader needs on a first run and is one screen too much
 * on the second. So the default is a list of what is outstanding, where the one
 * outstanding thing is findable in a glance, and `steps` is the rail for the first
 * run.
 *
 * **`blocked` is a first-class state, and it is the decision this Block is most
 * particular about.** A checklist that can only say done, and not done and next, is
 * a checklist that will read as broken to a reader who is genuinely stuck: the step
 * they are on looks exactly like the step they have not reached, and the honest
 * reading of a setup that has not moved in a week is a broken product rather than a
 * missing permission, a missing key or a colleague who has not got to it. A reader
 * who believes the product is broken stops trusting the product, and they are not
 * wrong to, so a Block that cannot say "you are blocked here" is answering that
 * reader with a lie by omission. The mark is the one shape on this surface that is
 * not a disc, so a reader who sees no colour at all still finds it, and the words
 * beside it are the caller's because what a reader is waiting for is the
 * product's own sentence about it.
 *
 * **The rail is `steps.tsx` for the `steps` form, because the rail is a Component
 * and its three marks are already right.** A hand-drawn set of discs would be a
 * second implementation of three things `Steps` has settled: that the states differ
 * by shape before they differ by colour, that exactly one step carries
 * `aria-current`, and that the rule between the steps carries how far along the
 * reader is rather than a bar per step restating "done" once per step. The cost is
 * the rail's own limitation rather than this Block's, and the run refuses it rather
 * than dropping it: a rail has no room for a description, a control, a moment or a
 * fourth state, so a step carrying any of those is a step the caller wants in the
 * checklist, and the diagnostic says so.
 *
 * **The progress figure is `Metric`, and the sentence under it is the caller's.**
 * `Metric` owns the arrangement a headline figure is read in, which puts the figure
 * first and the name under it, and it owns the fact that a string figure is set in
 * the mono face while a composed one is not. What it cannot do is name the figure,
 * and the honest answer is that the name is `progressLabel`: "steps complete" is a
 * claim about what a step is, and a checklist in a consumer's product may well be a
 * checklist of deployments, of regions, or of approvals. So the figure is the count
 * of what is done and the words under it are the caller's sentence, which is the
 * same split `Waitlist01` makes about a position and for the same reason.
 *
 * **It is a client Component, and the reason is `onSelect` rather than any state of
 * its own.** A handler is a function, a function is a piece of state, and state is a
 * client module, so the directive is here. The cost is stated rather than hidden: a
 * checklist that takes no `onSelect` is still a client Component, because the
 * directive is a property of the module rather than of a call, and the alternative
 * was a Block whose `onSelect` silently did nothing in a server render, which is
 * worse than a client boundary nobody asked for.
 */
export function Onboarding01({
  eyebrow,
  title,
  description,
  steps,
  onSelect,
  progressLabel,
  completion,
  variant = 'checklist',
  empty,
  headingLevel = 'h2',
  className,
}: Onboarding01Props) {
  for (const step of steps) {
    if (!step.stateLabel) {
      throw new Error(
        `Onboarding01: the step "${step.id}" declares a state and no stateLabel, so the mark beside ` +
          'it would be a shape with no sentence, and a shape a reader can only see is a state nobody can ' +
          'act on. Pass the words your readers use for that state.',
      )
    }
    if (step.href !== undefined && !step.hrefLabel) {
      throw new Error(
        `Onboarding01: the step "${step.id}" carries an href with no hrefLabel, so the link would be ` +
          'announced by its address, which is punctuation rather than a name. Pass the words that say ' +
          'where it goes, or drop the href.',
      )
    }

    if (variant === 'steps') {
      if (step.state === 'blocked' || step.description !== undefined || step.action !== undefined || step.href !== undefined) {
        throw new Error(
          `Onboarding01: the step "${step.id}" cannot be drawn on the rail, because a rail has no room ` +
            'for a description, a control or a destination, and because a step that is blocked is a fact ' +
            'about this run rather than a position in the order. Use the checklist form, which is the ' +
            'default and the one a reader on a return visit wants.',
        )
      }
    } else if (onSelect !== undefined && (step.action !== undefined || step.href !== undefined)) {
      throw new Error(
        `Onboarding01: the step "${step.id}" carries an action or a destination and onSelect is set, so ` +
          'the row would be a control with another control inside it. Put the action in the row you draw ' +
          'yourself, or drop onSelect and let the steps be a list of what is outstanding.',
      )
    }
  }

  if (variant === 'steps') {
    const currents = steps.filter((step) => step.state === 'current').length
    if (currents > 1) {
      throw new Error(
        `Onboarding01: the steps declare ${currents} current steps, and a rail has one position. Two ` +
          'current steps is a reader told they are in two places at once. Declare one.',
      )
    }
  }

  const done = steps.filter((step) => step.state === 'done').length

  const heading = (
    <SectionHeading
      as={headingLevel}
      align="left"
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  )

  const progress = (
    <div data-slot="onboarding-progress" className="flex flex-col gap-2">
      <Metric
        data-slot="onboarding-figure"
        value={done}
        label={progressLabel(done, steps.length)}
      />
      {completion === undefined ? null : (
        <p data-slot="onboarding-completion" className="text-muted-foreground text-pretty text-sm">
          {completion}
        </p>
      )}
    </div>
  )

  if (steps.length === 0) {
    return (
      <Section data-slot="onboarding-01" data-variant={variant} data-empty="true" className={cn(className)}>
        <div className="flex flex-col gap-8">
          {heading}
          <div data-slot="onboarding-empty" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        </div>
      </Section>
    )
  }

  /*
    The rail's steps, and their states are the caller's whenever the caller
    declared a position. A setup that reached a step out of band is real: a
    connection approved in another tab, a region enabled by a colleague, a step
    completed by hand last night. A rail derived from the order would draw a claim
    the data contradicts, and the override is per step rather than a mode, so a
    caller who has declared nothing still gets the derivation that cannot disagree
    with itself.
  */
  const rail: Step[] = steps.map((step) => ({
    label: step.name,
    ...(variant === 'steps' && steps.some((one) => one.state === 'current')
      ? { state: RAIL_STATE[step.state] }
      : null),
  }))

  return (
    <Section data-slot="onboarding-01" data-variant={variant} className={cn(className)}>
      <div className="flex flex-col gap-10">
        {heading}

        {progress}

        {variant === 'steps' ? (
          <div data-slot="onboarding-rail">
            <Steps steps={rail} current={railCurrent(steps)} />
          </div>
        ) : (
          <ol data-slot="onboarding-steps" className="flex flex-col">
            {steps.map((step) => {
              /*
                One row's content, built once and wrapped by whichever of the two
                arrangements the caller asked for. A row is either a control or a
                container and never both, and the guard above has already refused the
                shape that would have to be both, so these two branches can never
                disagree about what the row contains.
              */
              const content = (
                <>
                  <span
                    data-slot="onboarding-mark"
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 inline-block size-4 shrink-0 rounded-full border-2',
                      MARK[step.state],
                    )}
                  />

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      data-slot="onboarding-name"
                      className={cn(
                        'text-sm font-medium',
                        step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {step.name}
                    </span>

                    {step.description === undefined ? null : (
                      <span
                        data-slot="onboarding-description"
                        className="text-muted-foreground text-pretty text-sm"
                      >
                        {step.description}
                      </span>
                    )}

                    {/*
                      The words for the state, and they are the fact rather than the
                      mark. The mark is the same four shapes `steps.tsx` draws, one of
                      which is not a disc, and the sentence beside it is the caller's:
                      "Connected" and "Waiting on your key" are the same position in
                      a setup and different things for a reader to do about it.
                    */}
                    <span
                      data-slot="onboarding-state"
                      className="text-muted-foreground text-xs"
                    >
                      {step.stateLabel}
                    </span>
                  </span>
                </>
              )

              return (
                <li
                  key={step.id}
                  data-slot="onboarding-step"
                  data-state={step.state}
                  data-step={step.id}
                  className="border-border border-b py-4 first:border-t"
                >
                  {onSelect === undefined ? (
                    <div
                      data-slot="onboarding-step-row"
                      className="flex w-full items-start gap-x-4 gap-y-2"
                    >
                      {content}

                      {step.action === undefined ? null : (
                        <div
                          data-slot="onboarding-step-action"
                          className="flex shrink-0 items-center gap-2"
                        >
                          {step.action}
                        </div>
                      )}

                      {step.href === undefined || step.hrefLabel === undefined ? null : (
                        <CtaLink
                          data-slot="onboarding-step-link"
                          href={step.href}
                          size="sm"
                          variant="ghost"
                          className="shrink-0 self-center"
                        >
                          {step.hrefLabel}
                        </CtaLink>
                      )}
                    </div>
                  ) : (
                    <button
                      data-slot="onboarding-step-button"
                      type="button"
                      // The one position statement on the surface, and it is on the
                      // step it is about. The words beside the mark are the state and
                      // the mark is the same state twice, so neither of them says
                      // where the reader is and this does.
                      aria-current={step.state === 'current' ? 'step' : undefined}
                      onClick={() => onSelect(step.id)}
                      className="focus-visible:ring-ring flex w-full items-start gap-x-4 rounded-sm text-left outline-none transition-colors duration-fast ease-out hover:bg-accent/50 focus-visible:ring-[3px]"
                    >
                      {content}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </Section>
  )
}

export default Onboarding01
