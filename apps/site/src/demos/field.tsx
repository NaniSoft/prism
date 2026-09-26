import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@nanisoft/prism-ui/components/field'
import { Input } from '@nanisoft/prism-ui/components/input'
import { Textarea } from '@nanisoft/prism-ui/components/textarea'

/** A group of fields: two valid controls and one showing an error. */
export default function FieldDemo() {
  return (
    <FieldGroup className="max-w-measure-narrow">
      <Field>
        <FieldLabel htmlFor="field-display-name">Display name</FieldLabel>
        <Input id="field-display-name" defaultValue="Ada Lovelace" />
        <FieldDescription>Shown on your profile and in mentions.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="field-bio">Bio</FieldLabel>
        <Textarea id="field-bio" placeholder="A sentence about yourself." />
      </Field>
      <Field>
        <FieldLabel htmlFor="field-email">Email</FieldLabel>
        <Input
          id="field-email"
          type="email"
          defaultValue="not-an-email"
          aria-invalid
          aria-describedby="field-email-error"
        />
        <FieldError id="field-email-error">
          Enter an address in the form name@example.com.
        </FieldError>
      </Field>
    </FieldGroup>
  )
}
