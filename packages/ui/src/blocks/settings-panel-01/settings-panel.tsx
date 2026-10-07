'use client'

import { useId, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import { Label } from '../../components/ui/label'
import { childLevel, type HeadingLevel } from '../../components/ui/section'
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
import type { RecordForm01Issue } from '../record-form-01'

/** The members every arm of the save union shares. */
type SettingsPanel01Base = {
  /**
   * The panel's own heading, drawn as the card title.
   *
   * Required, because a settings region with no name is a card a reader has to
   * identify from its fields. The groups inside take their level from this one, so
   * moving the panel in a document moves every heading in it together.
   */
  title: ReactNode
  /** One line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The settings groups, as the shared field specification.
   *
   * Each group is a `FieldSpecGroup` from `@nanisoft/prism-ui/spec`: an optional
   * heading, an optional description and an ordered list of `FieldSpec`. A field
   * carries a stable `key`, a required `label`, a required `kind` drawn from
   * Prism's own input vocabulary, and optional help, hint, placeholder, disabled
   * flag and starting value. A control this package does not ship is the `slot`
   * arm, and the Block still draws the label, the help and the error around the
   * caller's node, so a field has the same shell whether Prism drew the control or
   * the caller did. Order is the array's order, and the Block never reorders, hides
   * or drops a field.
   */
  groups: readonly FieldSpecGroup[]
  /**
   * The values, controlled, keyed by field.
   *
   * **The values are the caller's, and the change handler is where a setting leaves.**
   * A region that applies on change passes an `onValueChange` that applies the
   * mutation; a region that saves explicitly passes one that updates its own state and
   * a save arm below. The Block holds no value of its own and owns no storage, so it
   * cannot see whether the setting is the organisation's, the project's or the
   * reader's, and it cannot revert a value it never kept.
   */
  values: Record<string, unknown>
  /** Sets one field's value, keyed by field, on every change. */
  onValueChange: (key: string, value: unknown) => void
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
  /**
   * The issues to draw, keyed by field.
   *
   * The shape `FormDialog`, `FormWizard` and the record write form already publish:
   * an entry names a field's `key` and a message in the product's own words, and
   * the message is drawn under the control that owns it. A caller who wants a rule
   * before a mutation runs it itself and passes the result here.
   */
  issues?: readonly RecordForm01Issue[]
  /**
   * A message about the submission rather than about a control.
   *
   * It names no field and marks at most one, which is the arrangement `AuthForm01`
   * argues for.
   */
  submitError?: ReactNode
  /**
   * The caller's own node placed beside the save, such as a cancel link.
   *
   * **A node and not a declared secondary action.** The former `secondaryAction`
   * prop took a label and an optional handler and rendered a button, so a caller who
   * passed a label and no function got a focusable control, announced as a button,
   * that activated to nothing. What replaces it is a node the caller wrote, placed
   * without styling: a `CtaLink` with its required `href`, or a control the caller
   * wired.
   */
  footerStart?: ReactNode
  /**
   * Heading level for the card's title. See `HeadingLevel`.
   *
   * The groups inside take their level from this one, so moving the panel in a
   * document moves every heading in it together.
   *
   * @defaultValue 'h2'
   */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The props a `SettingsPanel01` accepts.
 *
 * **A discriminated union over when the value leaves, and one arm is the absence of
 * a save.** `action` posts the form to a URL the caller names; `onSubmit` hands the
 * form's own element to a function and makes the Block a client Component; `submit`
 * is a slot holding the caller's own control, placed unstyled in the footer. The
 * first arm carries none of the three, and it is the on-change setting: a region
 * that applies each change through the field's own handler has no moment at which
 * the value is refused and draws no footer at all. Each arm forbids the others, so
 * the compiler holds the rule rather than this paragraph.
 */
export type SettingsPanel01Props =
  | (SettingsPanel01Base & {
      action?: never
      onSubmit?: never
      submit?: never
      submitLabel?: never
    })
  | (SettingsPanel01Base & {
      /** The URL the form posts to, the browser's own activation. */
      action: string
      /** The label of the save control. */
      submitLabel: ReactNode
      onSubmit?: never
      submit?: never
    })
  | (SettingsPanel01Base & {
      /** Called with the form element when the reader submits. */
      onSubmit: (form: HTMLFormElement) => void
      /** The label of the save control. */
      submitLabel: ReactNode
      action?: never
      submit?: never
    })
  | (SettingsPanel01Base & {
      /** The caller's own control, placed unstyled in the footer. */
      submit: ReactNode
      action?: never
      onSubmit?: never
      submitLabel?: never
    })

/**
 * A settings region: the shared field specification in a card, measured against the
 * record write form Block.
 *
 * **The archetype is answered by the record write form Block and earns no Item of
 * its own.** A setting changes behaviour and is often no record at all, but that
 * difference is a fact about what sits behind the surface rather than about the
 * surface, which is fields in groups with labels and help. So this Block takes the
 * same `FieldSpec`, `FieldSpecGroup` and `FieldKind` the write form takes, which
 * brings the `slot` arm with it and means the vocabulary a consumer learns on a
 * record write form is the vocabulary here. Its own former field declaration, a
 * union of text, textarea, switch and select, is gone from the published interface.
 *
 * **The one thing that differs is when the value leaves, and that is a caller's
 * callback rather than a shape Prism can draw.** A setting may apply on change, on
 * blur or at a save. A field whose change handler applies its mutation is a field
 * that applies on change, and a region that saves explicitly passes `action` or
 * `onSubmit` exactly as the write form does. Nothing in the surface tells the two
 * apart to a reader, and Prism does not choose. A region that applies on change
 * passes none of the three save arms and draws no footer.
 *
 * **It renders no revert control, no reset to defaults control and no storage of any
 * kind.** A setting that applies on change has no moment at which the value is
 * refused, so the caller's honest answers are to keep the previous value itself, or
 * to accept the change and report the failure in its own `Alert`, `Toast` or
 * `LiveRegion`. A revert control is refused twice over: a Block ships no behaviour
 * and so cannot wire one, and it holds no previous value and so has nothing to
 * revert to.
 *
 * **It draws no tab strip and no rail.** Which regions exist, what they are called
 * and whether one of them is a destination are the consumer's information
 * architecture. A tabbed settings screen is a composition of the shell, the page
 * header, the tabs and this Block, which `SettingsPage` already ships, and a rail is
 * the shell's own or the consumer's own links beside the regions. The Block also
 * owns no persistence, no dirty tracking, no unsaved-changes guard, no reset, no
 * navigation, no scope and no aggregate: it does not know whether a setting is the
 * organisation's, the project's or the reader's, which is the whole difference
 * between an organisation's default and a personal preference, and the words for
 * that are the caller's.
 *
 * **The save control is `type="submit"` inside a `<form>` the Block renders, and the
 * Block never wires a save to a handler of its own.** A field whose control this
 * package does not ship carries the `slot` arm, and the Block draws the label, the
 * help and the error around the caller's node. It is a client Component for the same
 * reason the write form is: an `onSubmit` is a function, and a function is state.
 */
export function SettingsPanel01(props: SettingsPanel01Props) {
  const {
    title,
    description,
    groups,
    values,
    onValueChange,
    columns = 1,
    issues,
    submitError,
    footerStart,
    headingLevel = 'h2',
    className,
  } = props

  const prefix = useId()
  const hasSubmit = 'submit' in props
  const onSubmit = props.onSubmit
  const hasHandler = typeof onSubmit === 'function'
  const hasAction = typeof props.action === 'string'
  const hasSave = hasSubmit || hasHandler || hasAction
  const hasFooter = hasSave || footerStart !== undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!hasHandler) return
    event.preventDefault()
    onSubmit(event.currentTarget)
  }

  const GroupHeading = childLevel(headingLevel)
  const grid = columns === 2 ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : 'flex flex-col gap-6'

  return (
    <form
      data-slot="settings-panel-01-form"
      {...(hasAction ? { action: props.action, method: 'post' } : null)}
      onSubmit={hasHandler ? handleSubmit : undefined}
      className={cn('w-full', className)}
    >
      <Card>
        <CardHeader>
          <CardTitle as={headingLevel} className="text-lg tracking-tight">
            {title}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>

        <CardContent className="flex flex-col">
          {submitError ? (
            <FieldError data-slot="settings-panel-01-submit-error">{submitError}</FieldError>
          ) : null}

          {groups.map((group, groupIndex) => {
            const groupHeadingId = `${prefix}-g${groupIndex}`
            return (
              <section
                key={group.id ?? groupIndex}
                data-slot="settings-panel-01-group"
                aria-labelledby={group.label ? groupHeadingId : undefined}
                className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 [&+&]:border-t"
              >
                {group.label ? (
                  <GroupHeading
                    id={groupHeadingId}
                    className="font-semibold tracking-tight text-balance"
                  >
                    {group.label}
                  </GroupHeading>
                ) : null}
                {group.description ? (
                  <p className="text-muted-foreground text-sm">{group.description}</p>
                ) : null}
                <FieldGroup data-slot="settings-panel-01-fields" className={grid}>
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
                      setValue: onValueChange,
                      controlled: true,
                    }
                    return (
                      <Field key={field.key} data-slot="settings-panel-01-field">
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
                              <span key={issueIndex} data-slot="settings-panel-01-issue">
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
        </CardContent>

        {hasFooter ? (
          <CardFooter className="justify-end gap-2">
            {footerStart}
            {hasSubmit ? (
              props.submit
            ) : hasSave ? (
              <Button data-slot="settings-panel-01-save" type="submit">
                {props.submitLabel}
              </Button>
            ) : null}
          </CardFooter>
        ) : null}
      </Card>
    </form>
  )
}

export default SettingsPanel01
