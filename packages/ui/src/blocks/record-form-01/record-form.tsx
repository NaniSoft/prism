'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import { Label } from '../../components/ui/label'
import { childLevel, headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import {
  fieldText,
  NEEDS_HIDDEN,
  renderControl,
  serialize,
  SELF_LABELLED,
  type FieldContext,
} from '../../lib/field-render'
import type { FieldKind, FieldSpecGroup } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * One thing wrong with the form, in the caller's own words.
 *
 * `field` is the `key` of the field the message belongs to, and the key rather
 * than the label because it is what the caller's values and the form's own
 * `FormData` are keyed by: a message matched by a label's words breaks the moment
 * the label is translated. The shape is the one `FormDialog` and `FormWizard`
 * already publish, so this Block mints no third spelling of an issue.
 */
export type RecordForm01Issue = {
  /** The `key` of the field this message belongs to. */
  field: string
  /** The message, in the product's own words. */
  message: string
}

/** The members every arm of the save union shares. */
type RecordForm01Base = {
  /** The form's own heading, absent for a form that needs none. */
  title?: ReactNode
  /** One line under the heading saying what submitting this will do. */
  description?: ReactNode
  /**
   * The fields, grouped and ordered.
   *
   * Every field belongs to a group, and a form with no headings is one group with
   * no label. The array's order is the order they are drawn in.
   */
  groups: readonly FieldSpecGroup[]
  /**
   * How many columns the fields sit in.
   *
   * One at every width by default, and one column again at the narrow breakpoint
   * when two are asked for. There is no per-field layout prop and no slot per
   * region.
   *
   * @defaultValue 1
   */
  columns?: 1 | 2
  /** The issues to draw, keyed by field. Drawn under the control that owns them. */
  issues?: readonly RecordForm01Issue[]
  /**
   * A message about the submission rather than about a control.
   *
   * It names no field and marks at most one, which is the arrangement `AuthForm01`
   * argues for: telling a reader that two correctly filled fields are wrong is how
   * they learn to stop trusting the rest of the form.
   */
  submitError?: ReactNode
  /**
   * Heading level for the form's own heading. See `HeadingLevel`.
   *
   * @defaultValue 'h2'
   */
  headingLevel?: HeadingLevel
  /** A secondary control beside the save, such as a cancel link. */
  footerStart?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The props a `RecordForm01` accepts.
 *
 * **A discriminated union with three arms, at least one required, and each
 * forbidding the other two.** The compiler holds that rule rather than a JSDoc
 * block, so a caller cannot reach a save that activates to nothing and cannot
 * pass a handler beside a form that posts to a URL. `action` posts the form to a
 * URL the caller names; `onSubmit` hands the form's own element to a function and
 * makes the Block a client Component; `submit` is a slot holding the caller's own
 * control, placed unstyled in the footer.
 */
export type RecordForm01Props =
  | (RecordForm01Base & {
      /** The URL the form posts to, the browser's own activation. */
      action: string
      /** The label of the save control. */
      submitLabel: ReactNode
      onSubmit?: never
      submit?: never
    })
  | (RecordForm01Base & {
      /** Called with the form element when the reader submits. */
      onSubmit: (form: HTMLFormElement) => void
      /** The label of the save control. */
      submitLabel: ReactNode
      action?: never
      submit?: never
    })
  | (RecordForm01Base & {
      /** The caller's own control, placed unstyled in the footer. */
      submit: ReactNode
      action?: never
      onSubmit?: never
      submitLabel?: never
    })

/**
 * The record write form: a typed field specification, rendered whole.
 *
 * **It takes a field specification and draws the whole form.** `groups` is an
 * ordered list of `FieldSpecGroup`, each an optional heading, an optional
 * description and an ordered list of `FieldSpec`; every field carries a stable
 * `key`, a required `label`, a required `kind` drawn from Prism's own input
 * vocabulary, and optional help, hint, placeholder, disabled flag and starting
 * value. A field whose control this package does not ship carries the `slot` arm,
 * and the Block still draws the label, the help and the error around it, so a
 * field has the same shell either way. Order is the array's order, and the Block
 * never reorders, hides or drops a field.
 *
 * **Prism owns the shape and the vocabulary; the consumer owns the values, the
 * errors and the fetch.** The specification carries no validator, no constraint
 * object, no schema and no pattern, because evaluating a rule is behaviour and a
 * Block ships none. Requiredness is not validation: it is a rendering fact and an
 * HTML fact, so the Block draws the mark and sets the attribute and never checks a
 * value against it.
 *
 * **The error state arrives as an issue list keyed by field.** An entry is a
 * `field` naming a key and a `message` in the product's own words, the shape
 * `FormDialog` and `FormWizard` already take, and a control's issue is drawn
 * under that control. A message about the submission rather than about a control
 * is `submitError`: it names no field and marks at most one.
 *
 * **Where the submission goes is a union with three arms, at least one
 * required.** `action` posts the form to a URL the caller names. `onSubmit` hands
 * the form's own element to a function and makes the Block a client Component.
 * `submit` is a slot holding the caller's own control, placed unstyled in the
 * footer. Each arm forbids the other two, so the compiler holds the rule rather
 * than this paragraph. The save control is `type="submit"` inside a `<form>` the
 * Block renders, and the Block never wires a save to a handler of its own.
 *
 * **Layout is derived, and the only knob is how many columns the fields sit
 * in.** `columns` is `1 | 2` at the form level; two is the only multi-column form
 * layout in which a label stays above its control, and a two-column form fills
 * across rows rather than down columns, because column-wise filling breaks the
 * reading order a screen reader and a keyboard follow. At the narrow breakpoint a
 * two-column form is one column again. There is no per-field layout prop and no
 * slot per region.
 *
 * **A field whose value is absent renders empty rather than absent**, because a
 * form that changes shape while the reader is halfway through it is a form the
 * reader has to read twice. The plain form is uncontrolled where a Prism control
 * can be, so the caller reads the values out of the form element at submit: the
 * `onSubmit` arm passes that element, and `action` lets the browser post it. The
 * handful of Prism controls the platform will not submit on their own hold their
 * value and carry a hidden input under the field's key, so the payload is
 * complete either way.
 */
export function RecordForm01(props: RecordForm01Props) {
  const {
    title,
    description,
    groups,
    columns = 1,
    issues,
    submitError,
    headingLevel = 'h2',
    footerStart,
    className,
  } = props

  const headingId = useId()
  const prefix = useId()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const setValue = (key: string, value: unknown) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  const hasSubmit = 'submit' in props
  const onSubmit = props.onSubmit
  const hasHandler = typeof onSubmit === 'function'
  const hasAction = typeof props.action === 'string'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!hasHandler) return
    event.preventDefault()
    onSubmit(event.currentTarget)
  }

  const Heading = headingLevel
  const GroupHeading = title ? childLevel(headingLevel) : headingLevel
  const grid =
    columns === 2 ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : 'flex flex-col gap-6'

  return (
    <form
      data-slot="record-form-01-form"
      {...(hasAction ? { action: props.action, method: 'post' } : null)}
      onSubmit={hasHandler ? handleSubmit : undefined}
      className={cn('flex w-full flex-col gap-8', className)}
    >
      {title || description ? (
        <div data-slot="record-form-01-header" className="flex flex-col gap-1">
          {title ? (
            <Heading
              id={headingId}
              className={cn('font-semibold tracking-tight text-balance', headingSizeClass(Heading))}
            >
              {title}
            </Heading>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      ) : null}

      {submitError ? (
        <FieldError data-slot="record-form-01-submit-error">{submitError}</FieldError>
      ) : null}

      {groups.map((group, groupIndex) => {
        const groupHeadingId = `${prefix}-g${groupIndex}`
        return (
          <section
            key={group.id ?? groupIndex}
            data-slot="record-form-01-group"
            aria-labelledby={group.label ? groupHeadingId : undefined}
            className="flex flex-col gap-4"
          >
            {group.label ? (
              <GroupHeading
                id={groupHeadingId}
                className={cn(
                  'font-semibold tracking-tight text-balance',
                  headingSizeClass(GroupHeading),
                )}
              >
                {group.label}
              </GroupHeading>
            ) : null}
            {group.description ? (
              <p className="text-muted-foreground text-sm">{group.description}</p>
            ) : null}
            <FieldGroup data-slot="record-form-01-fields" className={grid}>
              {group.fields.map((field, fieldIndex) => {
                const kind = field.kind.toLowerCase() as Lowercase<FieldKind>
                const id = `${prefix}-f${fieldIndex}`
                const labelId = `${prefix}-l${fieldIndex}`
                const helpId = field.help === undefined ? undefined : `${prefix}-h${fieldIndex}`
                const fieldIssues = (issues ?? []).filter((issue) => issue.field === field.key)
                const errorId = fieldIssues.length > 0 ? `${prefix}-e${fieldIndex}` : undefined
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
                  setValue,
                }
                return (
                  <Field key={field.key} data-slot="record-form-01-field">
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
                        value={serialize(ctx.values[field.key] ?? field.defaultValue)}
                      />
                    ) : null}
                    {field.help === undefined ? null : (
                      <FieldDescription id={helpId}>{field.help}</FieldDescription>
                    )}
                    {fieldIssues.length === 0 ? null : (
                      <FieldError id={errorId}>
                        {fieldIssues.map((issue, issueIndex) => (
                          <span key={issueIndex} data-slot="record-form-01-issue">
                            {issue.message}
                          </span>
                        ))}
                      </FieldError>
                    )}
                  </Field>
                )
              })}
            </FieldGroup>
          </section>
        )
      })}

      <div
        data-slot="record-form-01-footer"
        className="flex flex-wrap items-center justify-end gap-2"
      >
        {footerStart}
        {hasSubmit ? (
          props.submit
        ) : (
          <Button data-slot="record-form-01-save" type="submit">
            {props.submitLabel}
          </Button>
        )}
      </div>
    </form>
  )
}

export default RecordForm01
