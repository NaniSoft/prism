'use client'

import { Fragment, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'

export type SettingsPanelOption = { label: string; value: string }

type SettingsPanelFieldBase = {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

export type SettingsPanelField =
  | (SettingsPanelFieldBase & {
      kind: 'text'
      type?: 'text' | 'email' | 'url'
      placeholder?: string
      value?: string
      defaultValue?: string
      onChange?: (value: string) => void
    })
  | (SettingsPanelFieldBase & {
      kind: 'textarea'
      placeholder?: string
      rows?: number
      value?: string
      defaultValue?: string
      onChange?: (value: string) => void
    })
  | (SettingsPanelFieldBase & {
      kind: 'switch'
      checked?: boolean
      defaultChecked?: boolean
      onCheckedChange?: (checked: boolean) => void
    })
  | (SettingsPanelFieldBase & {
      kind: 'select'
      placeholder?: string
      options: SettingsPanelOption[]
      value?: string
      defaultValue?: string
      onValueChange?: (value: string) => void
    })

export type SettingsPanelSection = {
  id: string
  title: string
  description?: string
  fields: SettingsPanelField[]
}

export type SettingsPanel01Props = {
  title: string
  description?: string
  /** The settings groups, each rendered with a heading and its own fields. */
  sections: SettingsPanelSection[]
  /** The submit button label. Omit to render no footer. */
  submitLabel?: string
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  /** A secondary control, such as Cancel. */
  secondaryAction?: { label: string; onClick?: () => void }
  /** Extra content in the footer, e.g. a status note. */
  footer?: ReactNode
}

function SettingsField({ field }: { field: SettingsPanelField }) {
  if (field.kind === 'switch') {
    return (
      <Field className="flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
        </div>
        <Switch
          id={field.id}
          checked={field.checked}
          defaultChecked={field.defaultChecked}
          onCheckedChange={field.onCheckedChange}
          disabled={field.disabled}
        />
      </Field>
    )
  }

  if (field.kind === 'select') {
    return (
      <Field>
        <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
        <Select
          value={field.value}
          defaultValue={field.defaultValue}
          onValueChange={
            field.onValueChange
              ? (value) => field.onValueChange?.(value ?? '')
              : undefined
          }
          disabled={field.disabled}
          items={Object.fromEntries(field.options.map((option) => [option.value, option.label]))}
        >
          <SelectTrigger id={field.id} className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
      </Field>
    )
  }

  if (field.kind === 'textarea') {
    return (
      <Field>
        <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
        <Textarea
          id={field.id}
          rows={field.rows}
          placeholder={field.placeholder}
          value={field.value}
          defaultValue={field.defaultValue}
          onChange={field.onChange ? (event) => field.onChange?.(event.target.value) : undefined}
          disabled={field.disabled}
        />
        {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
      <Input
        id={field.id}
        type={field.type ?? 'text'}
        placeholder={field.placeholder}
        value={field.value}
        defaultValue={field.defaultValue}
        onChange={field.onChange ? (event) => field.onChange?.(event.target.value) : undefined}
        disabled={field.disabled}
      />
      {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
    </Field>
  )
}

/**
 * A settings form grouped into sections.
 *
 * A field is a small object describing one control: a text input, a textarea,
 * a select or a switch, with its label, description and value handlers. The
 * block renders the card, the groups and the footer; it owns no values and no
 * copy, so a consumer wires it to whatever form state or mutation they use.
 */
export function SettingsPanel01({
  title,
  description,
  sections,
  submitLabel,
  onSubmit,
  secondaryAction,
  footer,
}: SettingsPanel01Props) {
  const hasFooter = Boolean(submitLabel || secondaryAction || footer)

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>

        <CardContent className="flex flex-col">
          {sections.map((section, index) => (
            <Fragment key={section.id}>
              {index > 0 ? <Separator className="my-6" /> : null}
              <section className="flex flex-col gap-4" aria-labelledby={`${section.id}-heading`}>
                <div className="flex flex-col gap-1">
                  <h3
                    id={`${section.id}-heading`}
                    className="text-lg font-semibold tracking-tight"
                  >
                    {section.title}
                  </h3>
                  {section.description ? (
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  ) : null}
                </div>
                <FieldGroup>
                  {section.fields.map((field) => (
                    <SettingsField key={field.id} field={field} />
                  ))}
                </FieldGroup>
              </section>
            </Fragment>
          ))}
        </CardContent>

        {hasFooter ? (
          <CardFooter className="justify-end gap-2">
            {footer}
            {secondaryAction ? (
              <Button type="button" variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
            {submitLabel ? <Button type="submit">{submitLabel}</Button> : null}
          </CardFooter>
        ) : null}
      </Card>
    </form>
  )
}

export default SettingsPanel01
