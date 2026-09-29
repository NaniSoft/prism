import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** The props the Label accepts. */
export interface LabelProps extends ComponentProps<'label'> {
  /**
   * Whether the control this label names has to be filled in.
   *
   * It draws a mark and it says nothing to a screen reader, because the control's
   * own `required` is what is announced. A mark that were read out would reach a
   * reader as the field's name followed by a glyph, which is a name with a
   * decoration on the end of it, and it is the wrong place for a requirement: the
   * requirement is enforced by the control and reported by it.
   *
   * Put `required` on the control as well as here. This prop is what the reader
   * can see; that one is what the form enforces.
   */
  required?: boolean
  /**
   * The mark that shows a required field.
   *
   * A default rather than a fixed character, because the convention is the
   * reader's: an asterisk, a word, a dagger, nothing at all and a note in the
   * legend instead. A Component that chose one would ship one locale's convention
   * into every consumer's product.
   */
  requiredText?: string
  /**
   * Whether the control this label names is unavailable.
   *
   * The label dims with the control rather than staying at full strength, because
   * a label at full strength over a greyed field reads as a field that has merely
   * been styled. It is a statement about the field the reader is looking at, and
   * the two states should not disagree.
   */
  disabled?: boolean
}

/**
 * The accessible name of a control, on its own.
 *
 * **`FieldLabel` is this, inside a field.** A label is needed wherever a control
 * is, and a form binding is one place: a dialog's single input, a table's filter
 * row, a settings line that has no group around it because there is nothing to
 * group. `FieldLabel` draws the same thing and is the right choice beside a
 * `Field`; this is the right choice when there is no field, and taking the field
 * apart to get at its label would be rearranging a layout to reach one element of
 * it.
 *
 * **It is a native `<label>` and the association is programmatic.** Pass the
 * control's `id` as `htmlFor` so the name is attached rather than merely adjacent,
 * because adjacent text is not a name: it is read by nobody when the reader tabs
 * to the control, and a visible label with no `for` is a caption.
 *
 * **It is a server Component.** It reads props and renders, so a form built from
 * it costs no client JavaScript for its labels, and that is most of what a form
 * is.
 */
function Label({
  className,
  required = false,
  requiredText = '*',
  disabled = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      data-slot="label"
      data-required={required || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        'text-foreground text-sm leading-none font-medium',
        // No fill of its own, so there is no ink of its own to state: the label
        // inherits whatever the surface it sits on already uses.
        disabled && 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span data-slot="label-required" aria-hidden="true" className="text-destructive ms-1">
          {requiredText}
        </span>
      ) : null}
    </label>
  )
}

export { Label }
