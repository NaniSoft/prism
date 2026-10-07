/**
 * The control a field draws, and the shell every field carries, shared by every
 * Block that takes the field specification.
 *
 * **It lives in `src/lib` because a field is one idea the screens share.** The
 * record write form, the credential form, the contact form, the account creation
 * and the provisioning run all take `FieldSpec`, and the vocabulary a consumer
 * learns on one is the vocabulary on the rest. The map below covers every member
 * of `FieldKind`, so a kind added to the union fails the compiler here until it is
 * drawn, and the shell helpers are the part that has to be right on every field:
 * a Block that drew a bespoke row per kind would have thirty places to get it
 * wrong. `scripts/check-surface.mjs` holds the internal boundary: no published
 * subpath reaches this module, so it is named in that gate's `INTERNAL` list with
 * its reason rather than exposed.
 *
 * **It is plain rendering and holds no state of its own.** The values a controlled
 * control needs are passed in and written back through `FieldContext`, so the Block
 * that owns the screen owns the state, and this module is the same whether a form
 * is uncontrolled and submits itself or holds a record across a step boundary.
 */
import type { ReactNode } from 'react'

import { Calendar, type CalendarWeekdays } from '../components/ui/calendar'
import { Checkbox } from '../components/ui/checkbox'
import { ChoiceCard } from '../components/ui/choice-card'
import { Combobox } from '../components/ui/combobox'
import { DatePicker } from '../components/ui/date-picker'
import { Dropzone } from '../components/ui/dropzone'
import { FileUpload } from '../components/ui/file-upload'
import { ImageListField } from '../components/ui/image-list-field'
import { Input } from '../components/ui/input'
import { MoneyField } from '../components/ui/money-field'
import { MultiCombobox } from '../components/ui/multi-combobox'
import { NativeSelect } from '../components/ui/native-select'
import { NumberField } from '../components/ui/number-field'
import { OneTimeCode } from '../components/ui/one-time-code'
import { PasswordField } from '../components/ui/password-field'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { RangeField } from '../components/ui/range-field'
import { RepeatableRows } from '../components/ui/repeatable-rows'
import { SearchField } from '../components/ui/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Slider } from '../components/ui/slider'
import { Switch } from '../components/ui/switch'
import { Textarea } from '../components/ui/textarea'
import { Toggle } from '../components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group'
import type { FieldKind, FieldSpec } from './spec'

/** One arm of the field specification, narrowed by its kind. */
type OfKind<K extends FieldKind> = Extract<FieldSpec, { kind: K }>

/**
 * What every drawn control is handed, whatever kind it is.
 *
 * `controlled` is the one member a Block sets rather than derives. An uncontrolled
 * form lets `Input`, `Textarea`, `NumberField` and `NativeSelect` submit
 * themselves and holds state only for the controls the platform will not submit;
 * a form that keeps a record across a step boundary or clears it on `done` drives
 * those four from `values` and `setValue` instead. The choice is the Block's, and
 * the control is drawn the same either way.
 */
export type FieldContext = {
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
  /** Whether the four native-like controls are driven from `values` rather than themselves. */
  controlled?: boolean
}

/** The label a Component that requires a `string` name can be given. */
export function fieldText(field: FieldSpec): string {
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
export function serialize(value: unknown): string {
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
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(2024, 0, 7 + index)),
  ) as unknown as CalendarWeekdays
}

const WEEKDAYS = weekdays()

/** A month caption, in the reader's own convention. */
function monthCaption(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/** A held value as a controlled string. */
function heldString(ctx: FieldContext, field: FieldSpec): string {
  return typeof ctx.values[field.key] === 'string' ? (ctx.values[field.key] as string) : ''
}

/** A held value as a controlled number, or `null`. */
function heldNumber(ctx: FieldContext, field: FieldSpec): number | null {
  return typeof ctx.values[field.key] === 'number' ? (ctx.values[field.key] as number) : null
}

/**
 * The kinds whose Component draws its own label.
 *
 * The rest have the Block's label drawn above the control, so a field has the
 * same shell whether Prism drew the control or the caller did. These carry the
 * label internally because their Component requires it, and drawing a second one
 * would name the field twice.
 */
export const SELF_LABELLED: ReadonlySet<Lowercase<FieldKind>> = new Set([
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
export const NEEDS_HIDDEN: ReadonlySet<Lowercase<FieldKind>> = new Set([
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
 * The kinds whose control is a set of choices, and therefore needs options.
 *
 * Exported so a Block that refuses a choice with no options reads the same list
 * the renderer does, rather than keeping a second one free to disagree with it.
 * A Block that spelled the member names itself would also be spelling a
 * capitalized Component name as a literal in its own source, which the copy gate
 * reads as copy; the vocabulary belongs here.
 */
export const CHOICE_KINDS: ReadonlySet<FieldKind> = new Set([
  'Select',
  'NativeSelect',
  'Combobox',
  'MultiCombobox',
  'ToggleGroup',
  'RadioGroup',
  'ChoiceCard',
])

/**
 * The kind names a Block or Page may name directly in its own source.
 *
 * A `FieldSpec` names a Component with a capitalized string, and a Block that
 * builds one from its own flat prop would otherwise spell a Component name as a
 * string literal, which the copy gate reads as copy rather than as a machine
 * value. Naming the constants here keeps the vocabulary in the module that owns
 * it and leaves the renderer's `CONTROL` map the one place a kind is drawn.
 */
export const FieldKindName = {
  input: 'Input',
  textarea: 'Textarea',
  nativeSelect: 'NativeSelect',
  numberField: 'NumberField',
  passwordField: 'PasswordField',
  slot: 'slot',
} as const

/**
 * The control drawn for one kind, keyed by the kind's lowercase name.
 *
 * The map covers every member of `FieldKind`, so a kind added to the union fails
 * the compiler here until it is drawn. The lowercase keys are machine values
 * rather than copy, which is the same reason a variant name is written in
 * lowercase everywhere else in this package.
 */
const CONTROL: Record<Lowercase<FieldKind>, (field: FieldSpec, ctx: FieldContext) => ReactNode> = {
  input: (field, ctx) => (
    <Input
      id={ctx.id}
      name={field.key}
      value={ctx.controlled ? heldString(ctx, field) : undefined}
      onChange={ctx.controlled ? (event) => ctx.setValue(field.key, event.target.value) : undefined}
      defaultValue={ctx.controlled ? undefined : inputDefault(field.defaultValue)}
      placeholder={field.placeholder}
      disabled={field.disabled}
      required={field.required}
      autoComplete={field.autoComplete}
      aria-describedby={ctx.describedBy}
      aria-invalid={ctx.invalid || undefined}
    />
  ),
  textarea: (field, ctx) => (
    <Textarea
      id={ctx.id}
      name={field.key}
      rows={(field as OfKind<'Textarea'>).rows}
      value={ctx.controlled ? heldString(ctx, field) : undefined}
      onChange={ctx.controlled ? (event) => ctx.setValue(field.key, event.target.value) : undefined}
      defaultValue={ctx.controlled ? undefined : inputDefault(field.defaultValue)}
      placeholder={field.placeholder}
      disabled={field.disabled}
      required={field.required}
      autoComplete={field.autoComplete}
      aria-describedby={ctx.describedBy}
      aria-invalid={ctx.invalid || undefined}
    />
  ),
  numberfield: (field, ctx) => (
    <NumberField
      id={ctx.id}
      name={field.key}
      aria-label={ctx.text}
      value={ctx.controlled ? heldNumber(ctx, field) : undefined}
      onValueChange={ctx.controlled ? (value) => ctx.setValue(field.key, value) : undefined}
      defaultValue={
        ctx.controlled
          ? undefined
          : typeof field.defaultValue === 'number'
            ? field.defaultValue
            : undefined
      }
      labels={{ increment: `${ctx.text} +`, decrement: `${ctx.text} -` }}
      disabled={field.disabled}
      required={field.required}
      aria-describedby={ctx.describedBy}
    />
  ),
  moneyfield: (field, ctx) => (
    <MoneyField
      value={heldNumber(ctx, field)}
      onValueChange={(value) => ctx.setValue(field.key, value)}
      locale={
        (field as OfKind<'MoneyField'>).locale ?? new Intl.NumberFormat().resolvedOptions().locale
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
      value={heldString(ctx, field)}
      onValueChange={(value) => ctx.setValue(field.key, value)}
      label={ctx.text}
      placeholder={field.placeholder}
      className="w-full"
    />
  ),
  passwordfield: (field, ctx) => (
    <PasswordField
      value={heldString(ctx, field)}
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
      value={ctx.controlled ? heldString(ctx, field) : undefined}
      onChange={ctx.controlled ? (event) => ctx.setValue(field.key, event.target.value) : undefined}
      defaultValue={ctx.controlled ? undefined : stringOf(field.defaultValue)}
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
    <RadioGroup name={field.key} defaultValue={stringOf(field.defaultValue)} aria-labelledby={ctx.labelId}>
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
      defaultChecked={typeof field.defaultValue === 'boolean' ? field.defaultValue : undefined}
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
      onRemove={(id) =>
        ctx.setValue(
          field.key,
          asArray(ctx.values[field.key]).filter((_entry, index) => String(index) !== id),
        )
      }
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
      onAdd={() => ctx.setValue(field.key, [...asArray(ctx.values[field.key]), ''])}
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
 * The control one field draws, whichever member of `FieldKind` it is.
 *
 * The kind is lowercased and looked up in the map above, so a kind the union
 * grows is a compilation error at the map rather than a control that silently
 * does not draw.
 */
export function renderControl(field: FieldSpec, ctx: FieldContext): ReactNode {
  const kind = field.kind.toLowerCase() as Lowercase<FieldKind>
  return CONTROL[kind](field, ctx)
}
