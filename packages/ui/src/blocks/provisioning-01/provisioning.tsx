'use client'

import type { ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Field, FieldDescription } from '../../components/ui/field'
import { Label } from '../../components/ui/label'
import { LiveRegion } from '../../components/ui/live-region'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Steps, type Step } from '../../components/ui/steps'
import {
  CHOICE_KINDS,
  fieldText,
  renderControl,
  serialize,
  SELF_LABELLED,
  type FieldContext,
} from '../../lib/field-render'
import type { FieldKind, FieldSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * One step of a run: what it is called, what happens there, and what the reader is
 * asked for while they are on it.
 *
 * `fields` may be empty, and that is a real shape rather than a gap. The last step
 * of a checkout has no fields on it: it is the review, and what it carries is the
 * caller's own confirmation under `description` plus the control that commits. An
 * empty list is that step, so this Block draws a step with a name, a description
 * and a control rather than an empty form, which is a form a reader cannot fill
 * and a page that looks broken.
 */
export type ProvisioningStep = {
  /** A stable key for the step, and what `onNext` and `onBack` report. */
  id: string
  /** What the step is called, in the caller's own words. */
  name: string
  /**
   * The line under the step's name, for whatever the caller wants said about it.
   *
   * A node, because the honest line on a review step is the summary of everything
   * the reader just entered, with a link in it, and a `string` would force a
   * flattening that loses whichever of those it could not hold.
   */
  description?: ReactNode
  /**
   * What the reader is asked for on this step, in the order they should meet it.
   *
   * The shared `FieldSpec`, so a step's fields use the vocabulary a record write
   * form uses: a stable `key`, a required `label` and a required `kind` drawn from
   * Prism's own controls, with the options a choice carries under that kind and a
   * `slot` arm for a control this package does not ship. A list and not a fixed
   * set, for the reason `Contact01` states in full: a provisioning run with a
   * fixed set of fields is a run that decides what a reader may be asked, and the
   * decision is invisible in a review because the rendered form looks complete.
   */
  fields: readonly FieldSpec[]
}

/**
 * Everything the reader typed, keyed by the caller's own field ids.
 *
 * A record and not a fixed shape, and the reason is that the keys are facts about
 * the caller's run rather than about what a provisioning form is made of. The
 * value type is `string` because the five control types here all submit strings,
 * and a run that collects a file or a set of nodes is a different surface, which
 * is what `Bundle01` is for.
 */
export type ProvisioningValue = Record<string, string>

/**
 * The outcome of the caller's own request, as the Block draws it.
 *
 * A prop and never a state this Block writes, for the reason every form Block in
 * this package states: a success sentence this package wrote would be inherited
 * verbatim by every consumer, and a provisioning run has more outcomes than any
 * other form here, from a run that is queued to a run that is refused because the
 * estate is full, a run that failed on one node of forty, and a run that is still
 * rolling out an hour later.
 */
export type Provisioning01Status = {
  /** Which of the four the run is in. Read by the Block for three things only. */
  state: 'idle' | 'working' | 'done' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/** The props a Provisioning01 takes. Every string in this Block is one of them. */
export type Provisioning01Props = {
  /** The short line above the title, usually what the product is. */
  eyebrow?: ReactNode
  /** The heading. Required, because a run with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The steps of the run, in the order they happen.
   *
   * Order is the caller's and it is a claim: this is a route through a run, and a
   * list in an order the run does not have is a wrong diagram rather than a layout
   * problem. The rail above the form says "steps" to every reader and to every
   * crawler, so the order is the strongest claim this Block makes.
   */
  steps: readonly ProvisioningStep[]
  /**
   * Which step the reader opens on, zero based.
   *
   * Optional and clamped, and both halves of that matter. Clamped because a caller
   * whose run is resumed at step two after a reload passes a number that can be off
   * by one when the run grew a step, and a form that renders nothing at all because
   * the index is past the end is a form the reader cannot get out of. Optional
   * because a run that has not started opens on its first step, and the first step
   * is the only answer a Block can give without knowing the run.
   *
   * It is read once, on mount. A later change to `initial` does not move the
   * reader, and that is stated rather than hidden: a multi-step form that follows a
   * changing prop is a form that moves under a reader who is typing in it, and the
   * caller who wants to move the reader has the back and next controls for it.
   */
  initial?: number
  /**
   * Called with the step being left and the step being entered, when the reader
   * presses next.
   *
   * Optional, and a notification rather than a gate. The reader advances whatever
   * this function says, because a run whose next control can be refused by a
   * handler is a run whose step list is not the route: the caller validates, and
   * the honest response to a field the caller will not accept is the caller's own
   * `status`, which puts a sentence under the control the reader can act on.
   */
  onNext?: (from: string, to: string) => void
  /**
   * Called with the step being left and the step being entered, when the reader
   * presses back.
   *
   * Optional, and optional for a different reason than `onNext`: going back is
   * always allowed, so a caller rarely has anything to say about it. A caller whose
   * product discards a step's answers on the way back passes a handler here that
   * does its own clearing, and the values it clears are the Block's own state.
   */
  onBack?: (from: string, to: string) => void
  /** The words on the control that returns to the previous step. */
  backLabel: string
  /**
   * The words on the control that moves to the next step.
   *
   * Required, and a `string` because it is one name a reader sees once per step
   * rather than a sentence about the step. "Continue", "Next" and "Review order"
   * are three products' decisions and the cell has room for whichever one is yours.
   */
  nextLabel: string
  /**
   * The words on the control that commits the run, drawn on the last step.
   *
   * Required rather than derived from `nextLabel`, because the last step is not a
   * continuation: it is the one press that starts something irreversible on a
   * reader's estate. A reader who sees "Continue" on the control that provisions
   * four nodes has been told the wrong thing about the only button on the page
   * that matters, so the words are the caller's and they are required.
   */
  confirmLabel: string
  /**
   * Called with everything the reader typed, when they commit.
   *
   * **Required, and the requirement is the design.** `onConfirm` is the only thing
   * this Block does with what it collected, and there is no arm of this component
   * in which a run is filled in and then nowhere to go. The obvious alternative is
   * an optional handler with a form that renders and does nothing, which is a
   * component that gathers a reader's configuration for four consumers and then
   * discards it without telling anyone. This Block also sends nothing: what the run
   * does with the record is the caller's product, and a consumer who already has a
   * transport passes it straight in.
   */
  onConfirm: (value: ProvisioningValue) => void
  /**
   * What the reader is told happens to what they typed.
   *
   * Optional here, and the difference from `Waitlist01` is the fact rather than an
   * inconsistency. A waitlist holds an address, and a jurisdiction may require the
   * disclosure to be there; a provisioning run holds a configuration that becomes
   * infrastructure, so what the caller usually needs to say is narrower and
   * specific: what will be created, that it bills, and that it can be removed. That
   * sentence belongs on the last step, beside the control that commits, which is
   * where `terms` is drawn. A caller whose counsel asks for one passes it.
   */
  terms?: ReactNode
  /**
   * The outcome of the caller's own request, drawn in a live region and announced.
   *
   * A prop and never an internal state Prism writes, and it is also where a caller
   * puts the sentence that says a step will not be accepted, which is the honest
   * answer to a `onNext` that has decided the reader may not move on.
   */
  status?: Provisioning01Status
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * Whether a caller-supplied string never arrived, arrived empty, or arrived as
 * nothing but space.
 *
 * Read as `string | undefined` rather than as the declared `string`, because the
 * check is about the value that turned up rather than about what the type
 * promised. A JavaScript caller and a value out of a database both arrive with the
 * type's guarantee already gone, and the diagnostic below is the last place that
 * can still say what was wrong.
 */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * Whether a caller passed a list that is not there, or is there and empty.
 *
 * The same argument as `blank` above, and the reason a select with no options is
 * caught rather than drawn: a control with nothing in it is a question no reader
 * can answer, and a question that looks answered because the control is there and
 * focusable is worse than one that is visibly missing.
 */
function blankList(value: readonly unknown[] | undefined): boolean {
  return value === undefined || value.length === 0
}

/**
 * The two ways a caller's field declaration can be a form nobody can fill, and
 * the two ways a caller's step list can be a run nobody can finish, checked before
 * anything is drawn so the run fails once with the name of the field rather than
 * once per field with a nameless control on the page.
 *
 * A nameless control is announced as "text field", which is the one name every
 * other field on the run shares. A select with nothing in it is a question with no
 * answer. A run with no steps is a frame with no route, which is the one this
 * package refuses to draw rather than answering: a reader who arrives at a
 * provisioning form with no steps has been shown a promise with no content behind
 * it. Each message reaches a developer in a console and never a reader, which is
 * what makes it a refusal rather than copy.
 */
function assertRun(
  steps: readonly ProvisioningStep[],
  backLabel: string,
  nextLabel: string,
  confirmLabel: string,
): void {
  if (steps.length === 0) {
    throw new Error(
      'Provisioning01: steps is empty, so the rail would be a row of nothing above a form with no route ' +
        'through it, and the control at the bottom would commit a run of no steps. Pass the steps the run ' +
        'actually has.',
    )
  }

  for (const step of steps) {
    for (const field of step.fields) {
      if (blank(typeof field.label === 'string' ? field.label : undefined)) {
        throw new Error(
          `Provisioning01: the field "${field.key}" on the step "${step.id}" declares no label, so the ` +
            'control would be announced with no name and two fields on this run would be announced ' +
            'identically. Every control this Block draws is named by its label, so there is no fallback.',
        )
      }

      if (
        CHOICE_KINDS.has(field.kind) &&
        blankList((field as { options?: readonly unknown[] }).options)
      ) {
        throw new Error(
          `Provisioning01: the field "${field.key}" on the step "${step.id}" is a choice and passes no ` +
            'options, so it would render a control with nothing in it, which is a question no reader can ' +
            'answer. Pass the choices, or declare the field as a text field and check the answer in your ' +
            'own handler.',
        )
      }
    }
  }

  if (blank(backLabel) || blank(nextLabel) || blank(confirmLabel)) {
    throw new Error(
      'Provisioning01: one of backLabel, nextLabel and confirmLabel is empty, so a control on this run ' +
        'would be drawn with no words on it, and a button with no name is announced as "button" whatever ' +
        'it does. Pass the words your readers use for all three.',
    )
  }
}

/**
 * The step the rail is on, and the reason the derivation is a clamp rather than a
 * lookup.
 *
 * There is exactly one current step in a run, and it is the one the reader is on,
 * so the index is the whole of the position. `Steps` clamps as well, and the clamp
 * is here as well, and the duplication is deliberate: `Steps` throws when the
 * resolved states are not exactly one current, and it can only be reached through
 * an index this Block has already resolved, so a run that opened on step five of
 * three is corrected before the rail is asked to draw rather than throwing a
 * diagnostic about a value the caller never passed.
 */
function stepAt(steps: readonly ProvisioningStep[], wanted: number): number {
  if (steps.length === 0) return 0
  if (!Number.isFinite(wanted)) return 0
  return Math.min(Math.max(Math.trunc(wanted), 0), steps.length - 1)
}

/**
 * A multi-step run that commits something: a rail, the current step's fields, a
 * back and a next control, and a confirmation the caller supplies.
 *
 * **This is a checkout, and the pattern is identical, so the translation is
 * stated rather than implied.** A checkout is a sequence of steps, each with its
 * own fields, a back, a next, and a commit at the end. A provisioning run is that
 * same sequence with the same controls, and the only thing that changes is what is
 * committed at the end: a checkout commits a payment, and this commits a
 * configuration onto an estate. A storefront catalogue sells parcels and this one
 * does not, so nothing on this page is a parcel, a basket or a shopper, and the
 * four consumer products that install this Block each have their own nouns for
 * what is being set up. The frame is the storefront's because the frame is right:
 * a sequence of steps with a commit at the end is the shape of both, and the
 * alternative, a Block that invented its own arrangement, would be a worse
 * version of a form a reader already knows how to use.
 *
 * **The step state is derived from the current index, and `onSelect` is not a
 * prop, and that is the one decision a checkout Block has to get right.** A
 * multi-step form whose reader can jump to step four is a form that can submit an
 * unvalidated step: the reader lands on the commit step with three required fields
 * behind them they never saw, and the run is committed with three values this
 * Block never asked for. Every stage of that failure is invisible in a review,
 * because the form renders correctly in every state; it is visible only in use, on
 * the screen where a reader has pressed the control that provisions four nodes and
 * a required field they were never shown is blank. The obvious fix is a rail the
 * reader can click, and it is refused here for the reason `Steps` states at
 * length: a rail that is also a control is a control containing the state that
 * says where the reader is, and a caller who wants to reach a step the reader has
 * not earned passes `initial`, which is a number and not an affordance. The
 * rejected alternative of letting a caller override a step's state is refused for
 * the same reason, and `onSelect` is the better of the two refusals because it is
 * the one that cannot be reintroduced by a prop.
 *
 * **`initial` is a number and it is clamped, and both halves are load-bearing.**
 * A number rather than a step id, because a run is a sequence and a sequence is
 * indexed, and a caller whose step ids change between deployments would otherwise
 * arrive with a string this Block cannot place. Clamped, because a caller who
 * resumes a run at step two after a reload holds a number that can be off by one
 * when the run grew a step, and a form that renders nothing because the index is
 * past the end is a form the reader cannot get out of. It is read once on mount, and
 * that is stated rather than hidden: a multi-step form that follows a changing prop
 * moves under a reader who is typing in it.
 *
 * **A step with no fields renders a confirmation and a control, not an empty
 * form.** The last step of a checkout has no fields on it: it is the review, and
 * what it carries is the caller's own `description` plus the control that commits.
 * A fieldless step that drew an empty form would be a form a reader cannot fill and
 * a page that looks broken, and the reader who sees it concludes the product is
 * broken rather than that the step is a review. So the fields area is omitted
 * entirely, the step's `description` is the body of the step, and `terms` is drawn
 * beside the control that commits, which is the one place a reader is about to
 * make something irreversible and the one place a disclosure belongs.
 *
 * **Every field goes through `Field`, so its label, its description and the
 * control that announces them are Prism's wiring rather than a caller's.** That is
 * the second reason the field list is data: the wiring has to be right on every
 * field, and a Block that drew a bespoke row per type would have five places to get
 * it wrong. What `field.tsx` offers and this Block does not draw is `FieldError`,
 * and the omission is a decision: the sentence saying what is wrong with a value is
 * the one sentence a native control already gets right in the reader's own
 * language, because the browser writes it, so the `required` and `type` attributes
 * this Block forwards are the error path, and a caller with validation rules of
 * its own validates in `onConfirm` and puts the message in `status`, which is one
 * sentence about the run rather than one per field.
 *
 * **Nothing here validates anything.** There is no address format check, no
 * minimum count, no cross-field rule, and no refusal to advance. Each of those is
 * a decision about the caller's product, and a Block that guessed one would refuse
 * a reader on the caller's behalf. What Prism does with `status` is refuse a second
 * press: while the state reads `working` both controls are disabled, because a
 * second press while the first run is in flight is a second set of nodes on an
 * estate that may already have the first. That is the whole of Prism's reading of
 * the state, and it is stated because the alternative is a Block that has begun to
 * have opinions about the run.
 *
 * It is a client Component, and there are two reasons rather than one, and both
 * are load-bearing. The handlers are the first: `onConfirm`, `onNext` and
 * `onBack` are functions, a function is a piece of state, and state is a client
 * module, so a server Component cannot hand an event handler down to a `<form>`. The
 * second is the values themselves: a run holds what the reader typed across steps
 * that are not all mounted at once, so the record that arrives at `onConfirm` has
 * to survive a step boundary, and a server render has nowhere to keep it. That
 * second reason is the one that decides the shape, because it is why the values
 * live here and not in the caller's state: the caller gets the whole record at the
 * commit and is not asked to thread a controlled value through five fields it does
 * not own.
 */
export function Provisioning01({
  eyebrow,
  title,
  description,
  steps,
  initial = 0,
  onNext,
  onBack,
  backLabel,
  nextLabel,
  confirmLabel,
  onConfirm,
  terms,
  status,
  headingLevel = 'h2',
  className,
}: Provisioning01Props) {
  const generated = useId()
  const [at, setAt] = useState(() => stepAt(steps, initial))
  const [values, setValues] = useState<Record<string, unknown>>({})
  const setValue = (key: string, value: unknown) => setValues((held) => ({ ...held, [key]: value }))

  assertRun(steps, backLabel, nextLabel, confirmLabel)

  // Read once, on mount, so a caller whose steps change mid-run is not moved under
  // a reader who is typing. See `initial` for the argument.
  const index = stepAt(steps, at)
  const step = steps[index]
  const last = index === steps.length - 1
  const working = status?.state === 'working'
  const done = status?.state === 'done'

  const move = (next: number, from: string, to: string, notify?: (f: string, t: string) => void) => {
    setAt(stepAt(steps, next))
    notify?.(from, to)
  }

  const rail: Step[] = steps.map((one) => ({ label: one.name }))

  /*
    The step's own heading, and the level is derived rather than chosen. A step is
    a part of this section and not a section of its own, so it nests one level
    below the heading that introduces the run, and a run composed under an `h3` on
    a page whose sections are `h3` carries its step headings to `h4` with it. A
    literal `h3` would be right exactly once, at the nesting depth it was written
    for, and every Block that draws a titled part of itself has the same property.
  */
  const StepHeading = childLevel(headingLevel)

  return (
    <Section data-slot="provisioning-01" className={cn(className)}>
      <div data-slot="provisioning-01-body" className="flex flex-col gap-8">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/*
          The rail, and it is `Steps` with the current index passed in and no
          per-step state passed at all. See the JSDoc above for why that is the one
          decision this Block has to get right: the states are a consequence of the
          index, so they cannot disagree with it, and there is no prop a caller
          could use to draw a step as done that the reader has not done.
        */}
        <div data-slot="provisioning-01-rail" className="border-border border-b pb-8">
          <Steps steps={rail} current={index} />
        </div>

        <form
          data-slot="provisioning-01-form"
          className="flex w-full max-w-measure flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            onConfirm(
              Object.fromEntries(
                Object.entries(values).map(([key, value]) => [key, serialize(value)]),
              ) as ProvisioningValue,
            )
          }}
        >
          {/*
            The step's own heading, so a reader arriving by heading navigation finds
            the step rather than a form with no name. It is the level below the
            section rather than the section's own level, because a step is a part of
            this section and not a section of its own.
          */}
          <StepHeading data-slot="provisioning-01-step" className="text-lg font-semibold tracking-tight">
            {step.name}
          </StepHeading>

          {step.description === undefined ? null : (
            <div
              data-slot="provisioning-01-step-description"
              className="text-muted-foreground text-pretty text-sm"
            >
              {step.description}
            </div>
          )}

          {step.fields.length === 0 ? null : (
            <div data-slot="provisioning-01-fields" className="flex flex-col gap-4">
              {step.fields.map((field, fieldIndex) => {
                const id = `${generated}-${index}-${fieldIndex}`
                const labelId = `${id}-label`
                const helpId = field.help === undefined ? undefined : `${id}-help`
                const kind = field.kind.toLowerCase() as Lowercase<FieldKind>
                const ctx: FieldContext = {
                  id,
                  labelId,
                  describedBy: helpId,
                  invalid: false,
                  text: fieldText(field),
                  values,
                  setValue,
                  controlled: true,
                }

                return (
                  <Field key={field.key} data-slot="provisioning-01-field" data-field={field.kind}>
                    {SELF_LABELLED.has(kind) ? null : (
                      <Label
                        id={labelId}
                        htmlFor={id}
                        required={field.required}
                        disabled={field.disabled}
                      >
                        {field.label}
                      </Label>
                    )}
                    {renderControl(field, ctx)}
                    {field.help === undefined ? null : (
                      <FieldDescription id={helpId}>{field.help}</FieldDescription>
                    )}
                  </Field>
                )
              })}
            </div>
          )}

          {/*
            The disclosure, drawn on the last step and only there, because that is
            the one press that starts something irreversible on a reader's estate
            and the one moment a reader can still read something before they do.
            `terms` is the caller's because what a run creates, what it bills and
            what it can be removed are three facts about the caller's product.
          */}
          {terms === undefined || !last ? null : (
            <p
              data-slot="provisioning-01-terms"
              className="text-muted-foreground text-pretty text-sm"
            >
              {terms}
            </p>
          )}

          <div
            data-slot="provisioning-01-controls"
            className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-start"
          >
            {last ? (
              <Button
                data-slot="provisioning-01-confirm"
                type="submit"
                disabled={working || done}
                className="sm:order-2"
              >
                {confirmLabel}
              </Button>
            ) : (
              <Button
                data-slot="provisioning-01-next"
                type="button"
                disabled={working}
                className="sm:order-2"
                onClick={() => {
                  const to = steps[index + 1]
                  if (to === undefined) return
                  move(index + 1, step.id, to.id, onNext)
                }}
              >
                {nextLabel}
              </Button>
            )}

            {/*
              Back is drawn from the second step onwards and not on the first, and
              the reason is that a control on the first step has nothing to do. It
              is not rendered disabled, because a disabled control is announced,
              occupies a stop in the tab order, and gives a reader on the first step
              one more thing to work out for no outcome.
            */}
            {index === 0 ? null : (
              <Button
                data-slot="provisioning-01-back"
                type="button"
                variant="outline"
                disabled={working}
                className="sm:order-1"
                onClick={() => {
                  const to = steps[index - 1]
                  if (to === undefined) return
                  move(index - 1, step.id, to.id, onBack)
                }}
              >
                {backLabel}
              </Button>
            )}
          </div>

          {/*
            The outcome, and it renders nothing while there is no message, which is
            the correct shape for a region rather than an empty div that announces
            every unrelated change of its ancestors. `assertive` only for a refusal,
            because that is the one state where the reader is waiting for an answer
            and nothing else follows it. A run in its resting state carries no live
            region at all.
          */}
          <LiveRegion
            politeness={status?.state === 'error' ? 'assertive' : 'polite'}
            busy={working}
            className="text-sm"
          >
            {status?.message}
          </LiveRegion>
        </form>
      </div>
    </Section>
  )
}

export default Provisioning01
