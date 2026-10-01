'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Button } from './button'
import { Steps } from './steps'
import { cn } from '../../lib/utils'

/**
 * One thing wrong with a step, in the caller's own words.
 *
 * `field` is the `id` of the control the message belongs to and it is what makes a
 * step's refusal actionable in the same way `FormDialog`'s summary is: an entry a
 * reader cannot take to the control is a sentence they have to match by eye against
 * a form they then have to read a second time.
 */
export type FormWizardIssue = {
  /** The `id` of the control this message belongs to. */
  field: string
  /** The message, in the product's own words. */
  message: string
}

/**
 * One step of a sequence a reader passes through in order.
 *
 * `id` is required because a step's record is what a caller keys their own per-step
 * state on, and because a sequence whose entries have no identity is a sequence
 * whose saved answers have nowhere to live.
 */
export type FormWizardStep = {
  /** A stable key for the step. */
  id: string
  /**
   * The step's name, in the words a reader would use about it in conversation.
   *
   * A `string` and not a node, and the reason is the rail: the same word is drawn
   * in `Steps` at a width a step gets in a six-step row, and `Steps` states that a
   * label has to survive that width. So one word serves the rail and the heading,
   * which is also the right way round, because a rail saying "Billing details" and a
   * heading saying `<strong>Billing</strong> details` is two names for one step.
   */
  label: string
  /** One line under the name saying what this step asks for, in plain words. */
  description?: string
  /** The step's own controls. */
  children?: ReactNode
  /**
   * Called when the reader tries to leave this step forwards, given the step's own
   * element.
   *
   * Optional per step rather than a rule on the whole sequence, and the reason is
   * that a step which asks for nothing has nothing to refuse. A checkout's payment
   * step validates and its review step does not, and one `validate` on the Component
   * would have the caller write a branch per step to express what the absence of one
   * already says.
   *
   * Returning issues refuses the move and nothing else. The caller is expected to
   * set the step's own error state from the same source that produced them, because
   * this Component cannot see the caller's controls and cannot mark them invalid.
   */
  validate?: (form: HTMLFormElement) => readonly FormWizardIssue[]
}

/**
 * The props a FormWizard accepts.
 *
 * Two halves, and the split is the argument. The *progress rail* is `Steps`, and it
 * is composed rather than redrawn: it is an ordered indicator of position, it
 * derives three marks from one number, and it throws when the marks disagree, which
 * is a stronger guarantee than any arrangement drawn here. The *gate* is this
 * Component's own, and it exists because a rail that shows progress and a sequence
 * that gates it are different jobs, and upstream ships the second as the first with
 * the decision left out.
 */
export interface FormWizardProps {
  /**
   * The steps, in order.
   *
   * Required, and the order is the claim: a reader told these are steps is told
   * there is a route through them, so a list passed in an order the process does not
   * have is a wrong diagram rather than a layout problem. The same constraint
   * `Steps` states, for the same reason.
   */
  steps: readonly FormWizardStep[]
  /**
   * The step the reader is on, counting from zero.
   *
   * Controlled and clamped, and clamped rather than optional for the reason
   * `Steps` gives: a sequence with no position is a list and a list is a different
   * Component. The clamp makes an off-by-one harmless, where the alternative was a
   * throw on a value that is only wrong by one.
   */
  current: number
  /**
   * Called when the reader moves, given the step's index and which way they asked.
   *
   * Required, and the second argument is there because forward and back are not the
   * same move and a caller whose rules differ by direction has to be able to tell
   * them apart without reading the index. A refused forward press arrives here as
   * nothing at all, so a caller who wants to know their validation ran hears it from
   * the refusal list rather than from this callback.
   */
  onStepChange: (index: number, direction: 'forward' | 'back') => void
  /**
   * The sequence's own rules, given the step the reader is on.
   *
   * Required and separate from each step's own `validate`, because there are two
   * questions and one of them is not about a step. A step's rules ask whether *this*
   * step is complete. This asks whether the sequence as a whole may be submitted,
   * which is a check no individual step can make: a review step has nothing to
   * validate locally and the whole sequence may still be un-submittable because the
   * terms were not accepted three steps ago.
   */
  validate?: (index: number, form: HTMLFormElement) => readonly FormWizardIssue[]
  /**
   * The label of the control that goes back.
   *
   * Required and never defaulted, and the one label on this Component that is shown
   * at every step: see the JSDoc for why back is the one direction a gate never
   * closes.
   */
  backLabel: ReactNode
  /**
   * The label of the control that goes forward, on every step but the last.
   *
   * Required, and separate from the last step's label because "Next" and "Finish"
   * are two different claims about what the press does, and a sequence whose last
   * control says "Next" has not told the reader it is the end.
   */
  nextLabel: ReactNode
  /**
   * The label of the control on the last step, which submits rather than advances.
   *
   * Required, and a separate prop rather than a computed one because both labels are
   * a product's two words and this package knows neither of them.
   */
  finishLabel: ReactNode
  /**
   * The heading above the refusal.
   *
   * Required, and a heading rather than a sentence because the refusal list is a
   * focus target and a reader who lands on it needs to know what they have landed on
   * before they read the list.
   */
  blockedLabel: ReactNode
  /**
   * The accessible name of the progress rail.
   *
   * Required, and the sequence's noun rather than this Component's: a page with a
   * checkout and an onboarding wizard on it has two rails, and a reader moving
   * between them is told nothing about which they are in.
   */
  progressLabel: string
  /**
   * The accessible name of one control in the refusal list, given the field the
   * issue belongs to.
   *
   * Required, and a function of the field rather than of the message for the reason
   * every readable string here is one. It is also what lets an entry name the
   * *control* rather than repeat the sentence beside it.
   */
  issueLabel: (field: string) => string
  /**
   * The words for this sequence's keyboard model, read once when the reader lands on
   * the step's region.
   *
   * Required, because a gated sequence is a place a reader can get stuck and the one
   * thing they need while stuck is that going back is always allowed. One sentence
   * for the whole sequence, since it is the same sentence at every step.
   */
  instructionsLabel: string
  /** The reader's own slot, for anything above or below the step's controls. */
  children?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * A sequence of steps where each one gates the way forward and none of them gates
 * the way back.
 *
 * **This is not `Steps`, and the difference is a check rather than a drawing.**
 * `Steps` is an ordered indicator of where a reader is: it derives three marks from
 * one number, it marks the current step with `aria-current`, and it throws when the
 * marks disagree, which is a stronger guarantee than any arrangement drawn here. It
 * has no opinion at all about whether a reader may move, because showing a reader
 * their position and deciding whether they may leave it are different jobs, and
 * upstream ships the second as the first with the decision left out. A caller who
 * wants a rail composes `Steps`; a caller who reaches for `Tabs` has picked the wrong
 * Component, because a tab list is peer views of one subject and a wizard's steps are
 * a route through it.
 *
 * **Back is always allowed, and that asymmetry is the whole Component.** Forward is
 * gated, and the gate is the point: a wizard exists to stop a reader submitting a
 * sequence with a hole in it, and a step's rules are how it knows there is one. Back
 * is not, for a reason that is about the reader rather than about the data. A gated
 * back control traps a reader in the very step they opened the wizard to escape:
 * they have opened step two, found it asks for something they do not have, and
 * pressing back does nothing either. No arrangement of the data makes that
 * acceptable and the fix is not a better error message, it is that going back is
 * always available. So the back control is drawn, named and operable at every step
 * including the first, where it is inert rather than absent: a control that appears
 * and disappears moves the row a reader is aiming at, and its absence on step one
 * would be a claim that there is nothing before here, which is true and not worth a
 * layout shift to say. On the first step it is `aria-disabled` rather than natively
 * `disabled`, for the reason `LifecycleButton` gives: a natively disabled control
 * leaves the tab order, so a reader tabs onto where it was, presses Enter and nothing
 * happens with no announcement to explain it.
 *
 * **A refused forward move takes focus to the refusal and announces nothing else.**
 * The same reasoning as `FormDialog`, and the two are kept consistent on purpose: a
 * refusal is announced once, by a focus target the reader lands on and can read
 * from, rather than by an alert *and* a focus move, which is one refusal heard twice
 * in two voices. The list is a list of anchors, each carrying the field's own name
 * with the message beneath it. Focus moves once per refusal rather than on every
 * render, so a reader who tabs away and comes back is not dragged onto it again, and
 * the Component holds no live region at all for the same reason: a permanently
 * mounted one would announce the refusal a second time when the move commits.
 *
 * **The gate is the caller's and the drawing is Prism's.** Each step's own
 * `validate` decides whether its step may be left forwards, and this Component
 * refuses the move and draws what came back. It never marks a control invalid and
 * never shows a message under one, because it cannot see the caller's form: the
 * caller's fields are their own `Field`s and their own `Input`s, and reaching into
 * them would be the override path this package refuses everywhere else. The cost is
 * named rather than hidden: a caller has to render each message under its control as
 * well as in the refusal list, and a caller who does only the first has a list a
 * reader can follow and controls that do not say why. That is two renderings of one
 * sentence, and it is the price of the caller owning the form.
 *
 * **Forward is gated twice over and the order matters.** The step's own rules run
 * first, because they are about the reader's answers, and the sequence's own rules
 * second, because they are about the submission. A step that fails its own rules
 * never reaches the sequence's, which is what stops a reader being told their card
 * was declined when the field they left empty was the problem.
 *
 * **The last step's control is a different prop and not a computed label.** `next`
 * and `finish` are two claims about what the press does, and a sequence whose last
 * control says "Next" has not told the reader it is the end, while one that says
 * "Finish" and then opens step four has lied about something a reader will act on.
 * Both are required and neither has a default, because this package does not know
 * whether the product's word is "Continue", "Weiter" or "Siguiente".
 *
 * **`Steps` is composed at the position the rail belongs rather than inside a
 * wrapper.** The reader sees the rail above the step, the step's own controls in the
 * middle and the two directions below, and a wizard whose rail is somewhere else is a
 * wizard whose progress is somewhere else in the reader's eye. The rail reads the
 * same index the navigation moves, so the two cannot disagree about which step is
 * current.
 *
 * **It is a client Component**, because a gate is a decision taken after the reader
 * acts and the decision has to be able to refuse, and because every one of its value
 * props is a function the caller hands it, which is a client-to-client boundary
 * wherever it is written. What that costs is the price of every client control: a
 * server Component may render one step's controls once, and what it may not do is let
 * the reader move between them.
 */
function FormWizard({
  steps,
  current,
  onStepChange,
  validate,
  backLabel,
  nextLabel,
  finishLabel,
  blockedLabel,
  progressLabel,
  issueLabel,
  instructionsLabel,
  children,
  className,
}: FormWizardProps) {
  const generated = useId()
  const instructionsId = `${generated}-instructions`
  const labelId = `${generated}-label`
  const blockedId = `${generated}-blocked`
  const formRef = useRef<HTMLFormElement>(null)
  const refusedRef = useRef<HTMLDivElement>(null)
  const [refused, setRefused] = useState<readonly FormWizardIssue[]>([])

  const total = steps.length
  const at = total === 0 ? 0 : Math.min(Math.max(Math.trunc(current), 0), total - 1)
  const step = steps[at] as FormWizardStep
  const last = at === total - 1

  const leave = (direction: 'forward' | 'back') => {
    const form = formRef.current
    if (form === null) return

    if (direction === 'back') {
      // The asymmetry, in one branch. Nothing is checked, nothing is refused, and
      // the callback fires whatever this step's rules would have said, because a
      // reader who has opened the wrong step has to be able to get out of it. The
      // refusal is cleared rather than left standing, because a message about step
      // two shown while the reader reads step one is a message about a form they
      // are no longer in.
      setRefused([])
      if (at > 0) onStepChange(at - 1, 'back')
      return
    }

    // Forward, gated twice, and the order is the argument. The step's own rules ask
    // whether this step is complete; the sequence's ask whether the whole thing may
    // be submitted. A step that fails its own rules never reaches the sequence's,
    // which is what stops a reader being told their card was declined when the
    // field they left empty was the problem.
    const own = step.validate === undefined ? [] : step.validate(form)
    if (own.length > 0) {
      setRefused(own)
      return
    }

    const whole = validate === undefined ? [] : validate(at, form)
    if (whole.length > 0) {
      setRefused(whole)
      return
    }

    setRefused([])
    onStepChange(last ? at : at + 1, 'forward')
  }

  // The focus move, once per refusal. The dependency is the length rather than the
  // array itself, because the caller builds a fresh array on every check and
  // depending on its identity would move the reader's focus on every render.
  useEffect(() => {
    if (refused.length === 0) return
    refusedRef.current?.focus()
  }, [refused.length])

  return (
    <div data-slot="form-wizard" className={cn('flex w-full flex-col gap-6', className)}>
      {/*
       * The rail, composed from `Steps` and named by the caller. It reads the same
       * index the navigation moves, so the two cannot disagree about which step is
       * current, and it is a rail rather than a tab list because a wizard's steps are
       * a route through a process while a `Tabs` panel set is a set of peer views.
       */}
      <Steps steps={steps} current={at} label={progressLabel} />

      {/*
       * The keyboard model, stated once for the whole sequence and pointed at by the
       * step's region. One sentence rather than one per step because it is the same
       * sentence at every step, and the thing it says is the one a stuck reader most
       * needs: going back is always allowed.
       */}
      <span id={instructionsId} data-slot="form-wizard-instructions" className="sr-only">
        {instructionsLabel}
      </span>

      <form
        ref={formRef}
        data-slot="form-wizard-form"
        noValidate
        role="group"
        aria-labelledby={labelId}
        aria-describedby={instructionsId}
        onSubmit={(event) => {
          event.preventDefault()
          leave('forward')
        }}
        className="flex flex-col gap-4"
      >
        {/*
         * The step's name, as a heading and as the region's accessible name by
         * `aria-labelledby`, so the name a reader hears and the name a sighted
         * reader reads are the same text by construction rather than by two strings
         * kept in step.
         */}
        <div data-slot="form-wizard-heading" className="flex flex-col gap-1">
          <h2
            id={labelId}
            data-slot="form-wizard-step-label"
            className="text-lg font-semibold tracking-tight"
          >
            {step.label}
          </h2>
          {step.description === undefined ? null : (
            <p data-slot="form-wizard-step-description" className="text-muted-foreground text-sm">
              {step.description}
            </p>
          )}
        </div>

        {/*
         * The refusal, drawn only when there is one and focused only when it appears.
         *
         * A `role="group"` named by the heading rather than a `role="alert"`, and
         * the difference is the whole announcement model: the focus move says it
         * once, in the reader's own voice, from a place they can read a list out
         * from. An alert in the same commit is the same sentence a second time.
         *
         * `tabIndex={-1}` makes it a script target and not a tab stop, because it
         * exists only after a refusal and a region that appears and disappears must
         * not leave a permanent hole in the tab order.
         */}
        {refused.length === 0 ? null : (
          <div
            ref={refusedRef}
            data-slot="form-wizard-refusal"
            role="group"
            aria-labelledby={blockedId}
            tabIndex={-1}
            className={cn(
              'border-destructive/40 bg-destructive/5 text-destructive',
              'focus-visible:ring-ring',
              'rounded-md border p-3 outline-none',
              'focus-visible:ring-[3px]',
            )}
          >
            <h3 id={blockedId} data-slot="form-wizard-refusal-label" className="text-sm font-semibold">
              {blockedLabel}
            </h3>

            {/*
             * The entries, and each is an anchor to the control that caused it with
             * the message beneath it. An anchor rather than a button, because the
             * destination is a place in this document and the browser's own fragment
             * handling is what puts focus on the control.
             */}
            <ul data-slot="form-wizard-issues" className="mt-1 flex list-none flex-col gap-2">
              {refused.map((issue) => (
                <li key={`${issue.field}:${issue.message}`} data-slot="form-wizard-issue">
                  <a
                    href={`#${issue.field}`}
                    data-slot="form-wizard-issue-link"
                    className={cn(
                      'hover:underline',
                      'focus-visible:ring-ring',
                      'rounded-sm text-sm font-medium',
                      'underline underline-offset-2 outline-none',
                      'focus-visible:ring-[3px]',
                    )}
                  >
                    {issueLabel(issue.field)}
                  </a>
                  <p data-slot="form-wizard-issue-message" className="text-sm">
                    {issue.message}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div data-slot="form-wizard-step" className="flex flex-col gap-4">
          {step.children}
        </div>

        {children}

        {/*
         * The two directions, and the back control is the one this Component refuses
         * to gate.
         *
         * Two real buttons rather than one control whose meaning changes with its
         * label, so a reader tabbing between them lands on two things with two names
         * and two ring positions. The forward control is the form's submit, so
         * `Enter` in any control inside the step moves forward, which is what a
         * reader expects from a form that shows one step at a time and is the reason
         * the handler is on the form rather than on a click.
         *
         * `ghost` on back rather than `outline`: back is the cheapest action on the
         * step and the one a reader reaches for when they are lost, and an outlined
         * button beside a filled one reads as a second option of equal weight.
         */}
        <div data-slot="form-wizard-navigation" className="flex items-center gap-2">
          <Button
            data-slot="form-wizard-back"
            type="button"
            variant="ghost"
            aria-disabled={at === 0 || undefined}
            onClick={() => {
              if (at === 0) return
              leave('back')
            }}
          >
            <ChevronLeftIcon aria-hidden="true" />
            {backLabel}
          </Button>

          <Button
            data-slot="form-wizard-forward"
            type="submit"
            variant="default"
            className="ms-auto"
          >
            {last ? finishLabel : nextLabel}
            {last ? null : <ChevronRightIcon aria-hidden="true" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { FormWizard }
