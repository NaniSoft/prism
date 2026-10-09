'use client'

import { useId, type ReactNode } from 'react'

import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import {
  FormWizard,
  type FormWizardStep,
} from '../../components/ui/form-wizard'
import { Label } from '../../components/ui/label'
import {
  NEEDS_HIDDEN,
  fieldText,
  renderControl,
  serialize,
  SELF_LABELLED,
  type FieldContext,
} from '../../lib/field-render'
import type { FieldKind, FieldSpecGroup } from '../../lib/spec'
import { cn } from '../../lib/utils'
import type { RecordForm01Issue } from '../record-form-01'

/**
 * The props a `RecordWizard01` accepts.
 *
 * **The step is the consumer's.** `current` is required and controlled,
 * `onStepChange` is required, and the Block draws the step it was handed and no
 * reachability at all: no completed mark beyond the one the shipped rail already
 * derives from the index, no disabled step, no skipped step and no count of what
 * has been answered. Reachability is branching, and branching is the consumer's.
 *
 * **The specification is per step, and a step is a `FieldSpecGroup`.** Nothing new
 * is declared in order to hold the steps: a step is the shared group type, with a
 * stable `id` and a `label` that is a `string` rather than a node, because the rail
 * draws the same word at the width a step gets in a six-step row, so a step's rail
 * label and its own heading are one string by construction rather than two words
 * kept in step by a caller. One specification sliced by a caller-supplied grouping
 * is refused: the specification already carries the groups, and a second list saying
 * which groups sit on which step would be free to disagree with it.
 */
export type RecordWizard01Props = {
  /**
   * The steps, in order, each a `FieldSpecGroup` with a stable `id` and a string
   * `label`.
   *
   * Each step is drawn as a heading and its fields, one step at a time. The
   * `id` is required because the caller keys its own per-step state by it, and a
   * sequence whose entries have no identity is a sequence whose saved answers have
   * nowhere to live.
   */
  steps: readonly FieldSpecGroup[]
  /**
   * The step the reader is on, counting from zero.
   *
   * Controlled and clamped by the shipped wizard, and clamped rather than optional
   * for the reason `Steps` gives: a sequence with no position is a list. An index
   * the specification does not contain draws a real step rather than nothing,
   * because a region with no route out is worse; the nearest step is the one answer
   * that is not a claim about a cause.
   */
  current: number
  /**
   * Called when the reader moves, given the step's index and which way they asked.
   *
   * Required, and the second argument is there because forward and back are not the
   * same move. A refused forward press arrives here as nothing at all, so a caller
   * who wants to know its validation ran hears it from the issue list rather than
   * from this callback.
   */
  onStepChange: (index: number, direction: 'forward' | 'back') => void
  /**
   * The values, controlled, keyed by field.
   *
   * **Entered values do not survive a step change inside this package.** Only the
   * current step's fields are in the document, and there is no draft to restore
   * from, because a Block that held the draft would be holding application state.
   * So every field on this arm is controlled and carries the consumer's value and
   * change handler, and the values are the consumer's from the first keystroke. The
   * named cost is one state object per screen instead of one form.
   */
  values: Record<string, unknown>
  /** Sets one controlled field's value, keyed by field. */
  onValueChange: (key: string, value: unknown) => void
  /**
   * The issues to draw, keyed by field, from the shape `FormDialog`, `FormWizard`
   * and the record write form already publish.
   *
   * **An issue naming a key that is not on the step being drawn is left undrawn, and
   * the reader is not moved.** There is no control on this step for the message to
   * sit under, and moving the reader is a call on `onStepChange`, which the caller
   * already holds. A cross-step rule is a message about the submission and belongs
   * to the sequence's own `validate`, in the caller's words.
   */
  issues?: readonly RecordForm01Issue[]
  /** The label of the control that goes back. */
  backLabel: ReactNode
  /** The label of the control that goes forward, on every step but the last. */
  nextLabel: ReactNode
  /** The label of the control on the last step, which submits rather than advances. */
  finishLabel: ReactNode
  /** The heading above a refusal. */
  blockedLabel: ReactNode
  /** The accessible name of the progress rail. */
  progressLabel: string
  /** The accessible name of one issue's control, given the field it belongs to. */
  issueLabel: (field: string) => string
  /** The words for the sequence's keyboard model, read once. */
  instructionsLabel: string
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * Whether a caller's step list is a form nobody can finish, checked before anything
 * is drawn so the run fails once with the name of the step rather than once per
 * field with a nameless control on the page.
 *
 * A step with no `id` is a step whose saved answers have nowhere to live, and a step
 * whose `label` is not a string is a step whose rail label and heading would have to
 * be kept in step by the caller. Both reach a developer in a console and never a
 * reader, which is what makes this a refusal rather than copy.
 */
function assertSteps(steps: readonly FieldSpecGroup[]): void {
  if (steps.length === 0) {
    throw new Error(
      'RecordWizard01: steps is empty, so the rail would be a row of nothing above a form with no route ' +
        'through it. Pass the steps the record has.',
    )
  }

  for (const [index, step] of steps.entries()) {
    if (step.id === undefined) {
      throw new Error(
        `RecordWizard01: the step at index ${index} declares no id, so the caller's own per-step state has ` +
          'nowhere to live and this Block cannot tell two steps apart. Pass a stable id.',
      )
    }
    if (typeof step.label !== 'string') {
      throw new Error(
        `RecordWizard01: the step "${step.id}" declares no string label, so the rail would draw a word this ` +
          'Block cannot read and the step heading and its rail label would be two names kept in step by the ' +
          'caller. Pass the one word both should carry.',
      )
    }
  }
}

/**
 * One step's fields, drawn under the heading the shipped wizard already drew.
 *
 * Every field is controlled, and an issue is drawn under the control that owns it
 * only while that control is on this step. A description that is a node rather than
 * a string is rendered here, because the shipped wizard takes a string for the line
 * under its heading.
 */
function StepFields({
  step,
  values,
  onValueChange,
  issues,
  prefix,
}: {
  step: FieldSpecGroup
  values: Record<string, unknown>
  onValueChange: (key: string, value: unknown) => void
  issues: readonly RecordForm01Issue[]
  prefix: string
}) {
  return (
    <FieldGroup data-slot="record-wizard-01-fields" className="flex flex-col gap-6">
      {typeof step.description === 'string' ? null : step.description}

      {step.fields.map((field, fieldIndex) => {
        const kind = field.kind.toLowerCase() as Lowercase<FieldKind>
        const id = `${prefix}-${step.id}-${fieldIndex}`
        const labelId = `${id}-label`
        const helpId = field.help === undefined ? undefined : `${id}-help`
        const fieldIssues = issues.filter((issue) => issue.field === field.key)
        const errorId = fieldIssues.length > 0 ? `${id}-error` : undefined
        const describedBy =
          helpId === undefined
            ? errorId
            : errorId === undefined
              ? helpId
              : `${helpId} ${errorId}`
        const ctx: FieldContext = {
          id,
          labelId,
          describedBy,
          invalid: fieldIssues.length > 0,
          text: fieldText(field),
          values,
          setValue: onValueChange,
          controlled: true,
        }

        return (
          <Field key={field.key} data-slot="record-wizard-01-field">
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
            {NEEDS_HIDDEN.has(kind) ? (
              <input
                type="hidden"
                name={field.key}
                value={serialize(values[field.key] ?? field.defaultValue)}
              />
            ) : null}
            {field.help === undefined ? null : (
              <FieldDescription id={helpId}>{field.help}</FieldDescription>
            )}
            {fieldIssues.length === 0 ? null : (
              <FieldError id={errorId}>
                {fieldIssues.map((issue, issueIndex) => (
                  <span key={issueIndex} data-slot="record-wizard-01-issue">
                    {issue.message}
                  </span>
                ))}
              </FieldError>
            )}
          </Field>
        )
      })}
    </FieldGroup>
  )
}

/**
 * The multi-step record write form: one group of fields at a time above the rail
 * the package already ships.
 *
 * **This is the write form's second arrangement and not a `-02`.** A wizard draws
 * one group of fields at a time, puts a rail above them, and asks a decision the
 * plain form never asks, which is whether this step may be left forwards. One Item
 * could not draw both without gaining the rail, the partition and that decision. It
 * is a property of how many fields the record has rather than one of two renderings
 * a consumer picks between on purpose, which is what a `-02` is for, so it earns
 * its own name.
 *
 * **Back, the forward control and the rail are the shipped wizard's.** This Block
 * renders none of them: it composes `FormWizard`, hands it the steps, and draws each
 * step's fields as that step's children. Every one of those controls is a call on
 * the caller's own step change, and the rail is an ordered indicator with no opinion
 * about whether a reader may move, so a caller who wants a navigable rail writes
 * call to action links carrying their own destinations beside this Block. A Block
 * that cannot make a control work should not render one, which is why this one
 * renders none of the three.
 *
 * **The stepped arm declares no submission arm of its own.** On the last step the
 * forward control is the form's submit and it reports the last index with the
 * direction `forward`, so the finish signal is a callback the caller already passes
 * and no second prop is needed to name it. An `action` arm would be an arm that
 * cannot be honoured: the shipped wizard refuses the browser's own submission
 * because its submit *is* the forward control. A caller whose answer is a URL post
 * composes the per-step form beside this Block.
 *
 * **Every field is controlled and the Block holds no value of its own across a step
 * change.** Only the current step's fields are in the document, so a step that
 * unmounts takes every uncontrolled value in it with it, and there is no draft to
 * restore from because a Block that held the draft would be holding application
 * state. The values are the consumer's from the first keystroke, and the cost is one
 * state object per screen instead of one form.
 *
 * **The step is the consumer's, and the Block draws the step it was handed and no
 * reachability at all.** It draws nothing about a step it is not showing: no
 * completed mark beyond the one the shipped rail already derives from the index, no
 * disabled step, no skipped step and no count of what has been answered. An index
 * the specification does not contain draws a real step rather than nothing, because
 * a region with no route out is worse and drawing the nearest step is the one answer
 * that is not a claim about a cause. It publishes no state for a step that does not
 * exist, because a step that does not exist, a stale link and a step this reader may
 * not see are one index and three sentences.
 *
 * **An issue naming a key off the current step is left undrawn and the reader is not
 * moved.** Validation is the consumer's, entirely: this Block evaluates no rule,
 * carries no validator and derives no fraction complete, because a fraction over a
 * sequence whose steps are gated by rules it cannot see is false the moment a
 * consumer skips one. A cross-step rule arrives as an issue and is drawn only while
 * its control is on the step being drawn.
 *
 * It is a client Component, because the shipped wizard is one and every value prop
 * here is a function the caller hands it, which is a client-to-client boundary
 * wherever it is written.
 */
export function RecordWizard01({
  steps,
  current,
  onStepChange,
  values,
  onValueChange,
  issues,
  backLabel,
  nextLabel,
  finishLabel,
  blockedLabel,
  progressLabel,
  issueLabel,
  instructionsLabel,
  className,
}: RecordWizard01Props) {
  const prefix = useId()
  assertSteps(steps)

  /*
    Every step is mapped to the shipped wizard's own step shape, and each one's
    children are that step's fields. The shipped wizard clamps the index and renders
    only the current step's children, so an index outside the specification draws the
    nearest real step rather than nothing.
  */
  const wizardSteps: FormWizardStep[] = steps.map((step) => ({
    id: step.id as string,
    label: step.label as string,
    description: typeof step.description === 'string' ? step.description : undefined,
    children: (
      <StepFields
        step={step}
        values={values}
        onValueChange={onValueChange}
        issues={issues ?? []}
        prefix={prefix}
      />
    ),
  }))

  return (
    <div
      data-slot="record-wizard-01"
      className={cn('flex w-full flex-col gap-8', className)}
    >
      <FormWizard
        steps={wizardSteps}
        current={current}
        onStepChange={onStepChange}
        backLabel={backLabel}
        nextLabel={nextLabel}
        finishLabel={finishLabel}
        blockedLabel={blockedLabel}
        progressLabel={progressLabel}
        issueLabel={issueLabel}
        instructionsLabel={instructionsLabel}
      />
    </div>
  )
}

export default RecordWizard01
