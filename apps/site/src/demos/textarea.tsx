import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@nanisoft/prism-ui/components/field'
import { Textarea } from '@nanisoft/prism-ui/components/textarea'

/** A textarea with a label and helper line, plus a disabled one. */
export default function TextareaDemo() {
  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="textarea-note">Release note</FieldLabel>
        <Textarea
          id="textarea-note"
          rows={4}
          placeholder="What changed, and who it affects."
        />
        <FieldDescription>Plain text. Markdown is added later.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="textarea-summary">Generated summary</FieldLabel>
        <Textarea
          id="textarea-summary"
          defaultValue="Written by the pipeline."
          disabled
        />
      </Field>
    </div>
  )
}
