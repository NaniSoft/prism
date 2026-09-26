import { Field, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Input } from '@nanisoft/prism-ui/components/input'

/** Input types at rest, disabled, and marked invalid. */
export default function InputDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="input-email">Email</FieldLabel>
        <Input id="input-email" type="email" placeholder="name@example.com" />
      </Field>
      <Field>
        <FieldLabel htmlFor="input-workspace">Workspace</FieldLabel>
        <Input id="input-workspace" defaultValue="Locked workspace" disabled />
      </Field>
      <Field>
        <FieldLabel htmlFor="input-handle">Handle</FieldLabel>
        <Input id="input-handle" defaultValue="with spaces" aria-invalid />
      </Field>
    </div>
  )
}
