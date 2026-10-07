'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Calendar, type CalendarWeekdays } from '../../components/ui/calendar'
import { Checkbox } from '../../components/ui/checkbox'
import { ChoiceCard } from '../../components/ui/choice-card'
import { Combobox } from '../../components/ui/combobox'
import { DatePicker } from '../../components/ui/date-picker'
import { Dropzone } from '../../components/ui/dropzone'
import { Field, FieldDescription, FieldError, FieldGroup } from '../../components/ui/field'
import { FileUpload } from '../../components/ui/file-upload'
import { ImageListField } from '../../components/ui/image-list-field'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { MoneyField } from '../../components/ui/money-field'
import { MultiCombobox } from '../../components/ui/multi-combobox'
import { NativeSelect } from '../../components/ui/native-select'
import { NumberField } from '../../components/ui/number-field'
import { OneTimeCode } from '../../components/ui/one-time-code'
import { PasswordField } from '../../components/ui/password-field'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { RangeField } from '../../components/ui/range-field'
import { RepeatableRows } from '../../components/ui/repeatable-rows'
import { SearchField } from '../../components/ui/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { childLevel, headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { Slider } from '../../components/ui/slider'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'
import { Toggle } from '../../components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group'
import type { FieldKind, FieldSpec, FieldSpecGroup } from '../../lib/spec'
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

/** One arm of the field specification, narrowed by its kind. */
type OfKind<K extends FieldKind> = Extract<FieldSpec, { kind: K }>

/** What every drawn control is handed, whatever kind it is. */
type FieldContext = {
  /** The control's own id, and the target of the drawn label's `htmlFor`. */
  id: string
  /** The id of the drawn label, for a control that names itself by reference. */
  labelId: string
  /** The ids the control should describe, or `undefined`. */
  describedBy: string | undefined
  /** Whether the field has an issue drawn under it. */
  invalid: boolean
  /** The field's label when it is a string, else its key, for a required string name. */
  text: string
  /** The in-progress values, held for the controls the platform will not submit. */
  values: Record<string, unknown>
  /** Sets one held value. */
  setValue: (key: string, value: unknown) => void
}

/** The label a Component that requires a `string` name can be given. */
function textOf(field: FieldSpec): string {
  return typeof field.label === 'string' ? field.label : field.key
}

/** The options on a choice-bearing arm, read without naming the shared shape. */
function optionsOf(field: FieldSpec): readonly { value: string; label: ReactNode }[] {
  const withOptions = field as unknown as {
    options?: readonly { value: string; label: ReactNode }[]
  }
  return withOptions.options ?? []
}

/** The options a `Select` draws, as the record it displays values from. */
function selectItems(field: FieldSpec): Record<string, ReactNode> {
  return Object.fromEntries(optionsOf(field).map((option) => [option.value, option.label]))
}

/** The options a `Combobox` and `MultiCombobox` draw, whose label is a string. */
function comboboxItems(field: FieldSpec): { value: string; label: string }[] {
  return optionsOf(field).map((option) => ({
    value: option.value,
    label: typeof option.label === 'string' ? option.label : option.value,
  }))
}

/** The shape of a field's starting value. */
type FieldDefault = string | number | boolean | undefined

/** A `string | number | boolean` default, when a native control can take one. */
function inputDefault(value: FieldDefault): string | number | undefined {
  return typeof value === 'boolean' ? undefined : value
}

/** The same default as a string, for the components that only take one. */
function stringOf(value: FieldDefault): string | undefined {
  return value === undefined ? undefined : String(value)
}

/** A `Date` from a spec default, or `null`. */
function dateOf(value: FieldDefault): Date | null {
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return null
}

/** A string list from a held value, for the controls that hold a set. */
function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : []
}

/** A held value as an array, whatever it is. */
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/** A held value as file rows, for `FileUpload`. */
function fileRows(value: unknown): { id: string; name: string; size: number }[] {
  return asArray(value).map((entry, index) => {
    if (typeof File !== 'undefined' && entry instanceof File) {
      return { id: `${entry.name}-${index}`, name: entry.name, size: entry.size }
    }
    return { id: String(index), name: String(entry), size: 0 }
  })
}

/** A held value as image rows, for `ImageListField`. */
function imageRows(value: unknown): { id: string; name: string }[] {
  return asArray(value).map((entry, index) => ({ id: String(index), name: String(entry) }))
}

/** A held value as the text a form submits. */
function serialize(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof File !== 'undefined' && value instanceof File) return value.name
  if (Array.isArray(value)) return value.map((entry) => serialize(entry)).join(',')
  if (typeof value === 'object') return JSON.stringify(value) ?? ''
  return String(value)
}

/** The seven weekday headings, from the platform rather than a table of words. */
function weekdays(): CalendarWeekdays {
  const format = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  const sunday = new Date(2024, 0, 7)
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(2024, 0, 7 + index)),
  ) as unknown as CalendarWeekdays
}

const WEEKDAYS = weekdays()

/** A month caption, in the reader's own convention. */
function monthCaption(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/**
 * The kinds whose Component draws its own label.
 *
 * The rest have the Block's label drawn above the control, so a field has the
 * same shell whether Prism drew the control or the caller did. These carry the
 * label internally because their Component requires it, and drawing a second one
 * would name the field twice.
 */
const SELF_LABELLED: ReadonlySet<Lowercase<FieldKind>> = new Set([
  'searchfield',
  'passwordfield',
  'moneyfield',
  'combobox',
  'multicombobox',
  'togglegroup',
  'choicecard',
  'calendar',
  'datepicker',
  'rangefield',
  'slider',
  'toggle',
  'dropzone',
  'fileupload',
  'imagelistfield',
  'repeatablerows',
])

/**
 * The kinds whose value is not submitted by the control itself.
 *
 * A hidden input carries the held value under the field's key so the form still
 * submits one complete payload. A control that renders its own hidden input from
 * `name` is absent: a second input would submit the key twice.
 */
const NEEDS_HIDDEN: ReadonlySet<Lowercase<FieldKind>> = new Set([
  'searchfield',
  'passwordfield',
  'moneyfield',
  'togglegroup',
  'toggle',
  'dropzone',
  'fileupload',
  'imagelistfield',
  'repeatablerows',
])

/**
 * The control drawn for one kind, keyed by the kind's lowercase name.
 *
 * The map covers every member of `FieldKind`, so a kind added to the union fails
 * the compiler here until it is drawn. The lowercase keys are machine values
 * rather than copy, which is the same reason a variant name is written in
 * lowercase everywhere else in this package.
 */
const CONTROL: Record<Lowercase<FieldKind>, (field: FieldSpec, ctx: FieldContext) => ReactNode> =
  {
    input: (field, ctx) => (
      <Input
        id={ctx.id}
        name={field.key}
        defaultValue={inputDefault(field.defaultValue)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={ctx.describedBy}
        aria-invalid={ctx.invalid || undefined}
      />
    ),
    textarea: (field, ctx) => (
      <Textarea
        id={ctx.id}
        name={field.key}
        rows={(field as OfKind<'Textarea'>).rows}
        defaultValue={inputDefault(field.defaultValue)}
        placeholder={field.placeholder}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={ctx.describedBy}
        aria-invalid={ctx.invalid || undefined}
      />
    ),
    numberfield: (field, ctx) => (
      <NumberField
        id={ctx.id}
        name={field.key}
        aria-label={ctx.text}
        defaultValue={typeof field.defaultValue === 'number' ? field.defaultValue : undefined}
        labels={{ increment: `${ctx.text} +`, decrement: `${ctx.text} -` }}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={ctx.describedBy}
      />
    ),
    moneyfield: (field, ctx) => (
      <MoneyField
        value={typeof ctx.values[field.key] === 'number' ? (ctx.values[field.key] as number) : null}
        onValueChange={(value) => ctx.setValue(field.key, value)}
        locale={
          (field as OfKind<'MoneyField'>).locale ??
          new Intl.NumberFormat().resolvedOptions().locale
        }
        currency={(field as OfKind<'MoneyField'>).currency}
        id={ctx.id}
        aria-label={ctx.text}
        disabled={field.disabled}
        describedBy={ctx.describedBy}
      />
    ),
    searchfield: (field, ctx) => (
      <SearchField
        value={typeof ctx.values[field.key] === 'string' ? (ctx.values[field.key] as string) : ''}
        onValueChange={(value) => ctx.setValue(field.key, value)}
        label={ctx.text}
        placeholder={field.placeholder}
        className="w-full"
      />
    ),
    passwordfield: (field, ctx) => (
      <PasswordField
        value={typeof ctx.values[field.key] === 'string' ? (ctx.values[field.key] as string) : ''}
        onValueChange={(value) => ctx.setValue(field.key, value)}
        label={ctx.text}
        revealLabel={`${ctx.text} +`}
        hideLabel={`${ctx.text} -`}
      />
    ),
    onetimecode: (field, ctx) => (
      <OneTimeCode
        label={ctx.text}
        length={(field as OfKind<'OneTimeCode'>).length ?? 6}
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        disabled={field.disabled}
        required={field.required}
      />
    ),
    select: (field, ctx) => (
      <Select
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        items={selectItems(field)}
        disabled={field.disabled}
        required={field.required}
      >
        <SelectTrigger id={ctx.id} className="w-full" aria-describedby={ctx.describedBy}>
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionsOf(field).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    nativeselect: (field, ctx) => (
      <NativeSelect
        id={ctx.id}
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={ctx.describedBy}
        aria-invalid={ctx.invalid || undefined}
      >
        {optionsOf(field).map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === 'string' ? option.label : option.value}
          </option>
        ))}
      </NativeSelect>
    ),
    combobox: (field, ctx) => (
      <Combobox
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        items={comboboxItems(field)}
        label={ctx.text}
        empty={{ message: (query: string) => query }}
        disabled={field.disabled}
        required={field.required}
      />
    ),
    multicombobox: (field, ctx) => (
      <MultiCombobox
        name={field.key}
        items={comboboxItems(field)}
        label={ctx.text}
        removeLabel={(label: string) => label}
        empty={{ message: (query: string) => query }}
        disabled={field.disabled}
        required={field.required}
      />
    ),
    togglegroup: (field, ctx) => (
      <ToggleGroup
        selectionMode="multiple"
        aria-label={ctx.text}
        value={asStringArray(ctx.values[field.key])}
        onValueChange={(value) => ctx.setValue(field.key, [...value])}
        disabled={field.disabled}
        className="flex-wrap"
      >
        {optionsOf(field).map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ),
    radiogroup: (field, ctx) => (
      <RadioGroup
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        aria-labelledby={ctx.labelId}
      >
        {optionsOf(field).map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <RadioGroupItem value={option.value} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    ),
    choicecard: (field, ctx) => (
      <ChoiceCard
        label={field.label}
        options={optionsOf(field).map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        name={field.key}
        defaultValue={stringOf(field.defaultValue)}
        disabled={field.disabled}
      />
    ),
    calendar: (field, ctx) => {
      const held = ctx.values[field.key]
      const month = ctx.values[`${field.key}-month`]
      const shown = month instanceof Date ? month : new Date()
      return (
        <Calendar
          label={ctx.text}
          monthLabel={monthCaption(shown)}
          weekdayLabels={WEEKDAYS}
          previousLabel={`${ctx.text} -`}
          nextLabel={`${ctx.text} +`}
          month={shown}
          onMonthChange={(next) => ctx.setValue(`${field.key}-month`, next)}
          value={held instanceof Date ? held : null}
          onValueChange={(date) => ctx.setValue(field.key, date)}
          dayLabel={(date) => date.toLocaleDateString()}
          name={field.key}
          disabled={field.disabled}
        />
      )
    },
    datepicker: (field, ctx) => (
      <DatePicker
        name={field.key}
        defaultValue={dateOf(field.defaultValue)}
        label={ctx.text}
        format={(date) => date.toLocaleDateString()}
        monthLabel={monthCaption}
        weekdayLabels={WEEKDAYS}
        previousLabel={`${ctx.text} -`}
        nextLabel={`${ctx.text} +`}
        placeholder={field.placeholder}
        disabled={field.disabled}
        required={field.required}
      />
    ),
    slider: (field, ctx) => (
      <Slider
        name={field.key}
        aria-label={ctx.text}
        defaultValue={typeof field.defaultValue === 'number' ? field.defaultValue : undefined}
        disabled={field.disabled}
        className="w-full"
      />
    ),
    rangefield: (field, ctx) => (
      <RangeField
        label={ctx.text}
        name={field.key}
        boundLabel={(_bound, formatted) => formatted}
        spanLabel={(_span, formatted) => formatted}
        disabled={field.disabled}
      />
    ),
    switch: (field, ctx) => (
      <Switch
        name={field.key}
        checked={Boolean(ctx.values[field.key] ?? field.defaultValue)}
        onCheckedChange={(checked) => ctx.setValue(field.key, checked)}
        disabled={field.disabled}
      />
    ),
    checkbox: (field, ctx) => (
      <Checkbox
        name={field.key}
        aria-label={ctx.text}
        defaultChecked={
          typeof field.defaultValue === 'boolean' ? field.defaultValue : undefined
        }
        disabled={field.disabled}
      />
    ),
    toggle: (field, ctx) => (
      <Toggle
        aria-label={ctx.text}
        pressed={Boolean(ctx.values[field.key] ?? false)}
        onPressedChange={(pressed) => ctx.setValue(field.key, pressed)}
        disabled={field.disabled}
      >
        {field.label}
      </Toggle>
    ),
    dropzone: (field, ctx) => (
      <Dropzone
        label={field.label}
        accept={(field as OfKind<'Dropzone'>).accept?.join(',')}
        multiple={(field as OfKind<'Dropzone'>).multiple}
        disabled={field.disabled}
        onFiles={(files) => ctx.setValue(field.key, files)}
      />
    ),
    fileupload: (field, ctx) => (
      <FileUpload
        files={fileRows(ctx.values[field.key])}
        label={field.label}
        removeLabel={(name: string) => name}
        onRemove={(id) => ctx.setValue(
          field.key,
          asArray(ctx.values[field.key]).filter((_entry, index) => String(index) !== id),
        )}
      />
    ),
    imagelistfield: (field, ctx) => (
      <ImageListField
        images={imageRows(ctx.values[field.key])}
        cap={Number.MAX_SAFE_INTEGER}
        addLabel={field.label}
        empty={null}
        label={field.label}
        removeLabel={(name: string) => name}
        onAdd={() =>
          ctx.setValue(field.key, [...asArray(ctx.values[field.key]), ''])
        }
        onRemove={(id) =>
          ctx.setValue(
            field.key,
            asArray(ctx.values[field.key]).filter((_entry, index) => String(index) !== id),
          )
        }
      />
    ),
    repeatablerows: (field, ctx) => (
      <RepeatableRows
        rows={asArray(ctx.values[field.key]) as object[]}
        label={field.label}
        addLabel={field.label}
        onAdd={() => ctx.setValue(field.key, [...asArray(ctx.values[field.key]), {}])}
        onRemove={(row) =>
          ctx.setValue(
            field.key,
            asArray(ctx.values[field.key]).filter((entry) => entry !== row),
          )
        }
        removeLabel={(index: number) => String(index + 1)}
        rowLabel={(index: number) => String(index + 1)}
      >
        {() => (field as OfKind<'RepeatableRows'>).emptyRow ?? null}
      </RepeatableRows>
    ),
    slot: (field) => (field as OfKind<'slot'>).control,
  }

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
                  text: textOf(field),
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
                    {CONTROL[kind](field, ctx)}
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
