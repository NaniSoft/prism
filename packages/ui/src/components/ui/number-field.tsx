'use client'

import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

/** The props the Number field accepts. */
export interface NumberFieldProps {
  /**
   * The accessible names of the two steppers.
   *
   * Required, and required as a pair, because a stepper is an icon and an icon has
   * no name. The words are the caller's because they are sentences a reader hears,
   * and a Component that chose them would be shipping English into every consumer's
   * form and would get "increase" wrong for at least one of the two.
   */
  labels: { increment: string; decrement: string }
  /** The accessible name of the field, when no visible label is used. */
  'aria-label'?: string
  /** The current value, when the field is controlled. */
  value?: number | null
  /** The value the field starts at, for an uncontrolled field. */
  defaultValue?: number | null
  /** Called with the value, or `null` when the field is emptied. */
  onValueChange?: (value: number | null) => void
  /**
   * The smallest value the field will hold.
   *
   * A value below it is clamped, by typing, by the steppers and by a paste alike.
   * Without a minimum there is nothing to clamp against, so this and `max` are what
   * turn a number field from a text field that happens to accept digits into a
   * control that holds a range.
   */
  min?: number
  /** The largest value the field will hold. */
  max?: number
  /** The amount one press of a stepper changes the value by. @defaultValue 1 */
  step?: number
  /**
   * The unit shown after the number.
   *
   * A unit is a word in the reader's language and it is hidden from the
   * accessibility tree, because a screen reader already says the unit when the
   * caller puts it in the field's description. It is a prop because the Component
   * does not know whether the reader measures in kilograms, pounds or seconds.
   */
  unit?: string
  /** How the value is written for display: grouping, decimals, and so on. */
  format?: Intl.NumberFormatOptions
  /** Whether a value must be entered before the form submits. */
  required?: boolean
  /** Whether the field ignores interaction. */
  disabled?: boolean
  /** Whether the reader may see the value but not change it. */
  readOnly?: boolean
  /** The form field name. The value is submitted under it. */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** The field's own id, so a label elsewhere can point at it. */
  id?: string
  /** Layout only. */
  className?: string
}

/**
 * The value inside the field's own range, or nothing.
 *
 * Base UI clamps what the reader types and what the steppers reach, but it does
 * not clamp a value that was already outside the range when it arrived, so this is
 * the Component's own half of the promise. A field that accepted it would display
 * and submit a number the caller has already said is impossible, and the browser's
 * range validation answers that after the reader has typed, which is too late to
 * be a control and too late to be a form.
 */
function clamp(
  value: number | null | undefined,
  min: number | undefined,
  max: number | undefined,
): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  let out = value
  if (typeof min === 'number' && out < min) out = min
  if (typeof max === 'number' && out > max) out = max
  return out
}

/**
 * A numeric field that will not hold a value outside its own range.
 *
 * **Clamping is the Component, not the HTML.** A number field with a `max` that
 * accepts a value past it is a field that will submit a number the caller has
 * already said is impossible, and the browser's own range validation is no answer
 * to that: it reports the problem after the reader has typed and leaves them with a
 * value they cannot submit. So the value is clamped on every path that can produce
 * one, typing, the steppers, a paste and a value that arrived from outside, and
 * the field shows and submits only what is inside its range. Text that is not a
 * number never becomes a value at all: the field refuses the character as it is
 * typed, so a reader who mistypes a digit gets a shorter number rather than a
 * number the server will reject.
 *
 * **It is one Component rather than a root, a group, an input and two steppers.**
 * The range and the two ways of moving inside it are one contract, and a caller
 * who composes the parts can leave out the steppers and get a field that clamps
 * with no affordance to reach the middle of its own range. The parts Base UI owns
 * are still what draw and what enforce; what this adds is the decision not to let
 * them be rearranged into something else.
 *
 * **A value outside the range is clamped as it arrives rather than refused.** A
 * controlled field whose `value` prop is out of range displays the clamped number,
 * because the alternative is a field showing one number and submitting another.
 * `onValueChange` is the authority: a consumer whose own state holds an
 * out-of-range number has to take the clamped one back, and this Component will
 * not rewrite a state it does not own.
 *
 * **The steppers are in the tab order.** Base UI takes them out of it, on the
 * reasoning that the arrow keys already step the value and one field should be one
 * Tab stop. A control that is announced and cannot be reached is worse than a
 * second stop, so they are put back: three stops for one value, and the arrow keys
 * still work for a reader who is typing through the form.
 *
 * **Empty is a value.** The field reports `null` when it is cleared, rather than
 * zero, because zero is a number a reader may have meant and an empty field is
 * not. A consumer that treats `null` as zero has made a decision this Component
 * refuses to make for it.
 *
 * **The unit is decoration.** It is hidden from the accessibility tree and the
 * caller describes the field once, in words, where a screen reader will reach it.
 * Two announcements of the same unit is one too many, and the visible one is the
 * one that was written in the reader's language by the reader's own product.
 *
 * Reachable by Tab, moved by the arrow keys and by its two steppers, and the whole
 * field reads as one surface: one frame, one border, one focus colour.
 */
function NumberField({
  labels,
  'aria-label': ariaLabel,
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  format,
  required = false,
  disabled = false,
  readOnly = false,
  name,
  form,
  id,
  className,
}: NumberFieldProps) {
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      className={cn('w-full', className)}
      {...(value === undefined
        ? { defaultValue: clamp(defaultValue, min, max) ?? undefined }
        : { value: clamp(value, min, max) })}
      onValueChange={(next) => onValueChange?.(next)}
      // The id belongs to the root, not to the input, because Base UI's steppers
      // point their `aria-controls` at it and a dangling reference is a violation
      // that reads, in a screen reader, as a control pointing at nothing.
      id={id}
      min={min}
      max={max}
      step={step}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      {...(form === undefined ? null : { form })}
      {...(format === undefined ? null : { format })}
    >
      {/*
       * One frame for the number, its unit and its two steppers, because they are
       * one field. The frame is a `div` and is never focused, so it answers the
       * focus by turning its border to the ring token and leaves the ring to the
       * input, which is the element that actually has it.
       */}
      <div
        data-slot="number-field-group"
        className={cn(
          'border-input bg-background focus-within:border-ring flex w-full items-stretch rounded-md border shadow-xs',
          'transition-[color,box-shadow] duration-fast ease-out',
          'has-[input:disabled]:opacity-50',
        )}
      >
        <NumberFieldPrimitive.Input
          data-slot="number-field-input"
          aria-label={ariaLabel}
          className={cn(
            'placeholder:text-muted-foreground flex h-9 min-w-0 flex-1 border-0 bg-transparent px-3 py-1 text-base shadow-none outline-none md:text-sm',
            'focus-visible:border-0 focus-visible:ring-ring focus-visible:ring-[3px]',
          )}
        />

        {unit === undefined ? null : (
          <span
            data-slot="number-field-unit"
            aria-hidden="true"
            className="text-muted-foreground flex shrink-0 items-center pr-2 text-sm"
          >
            {unit}
          </span>
        )}

        <div data-slot="number-field-stepper" className="border-input flex shrink-0 flex-col border-s">
          <NumberFieldPrimitive.Increment
            data-slot="number-field-increment"
            aria-label={labels.increment}
            // Put back into the tab order on purpose; see the JSDoc.
            tabIndex={0}
            className={cn(
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-1/2 items-center justify-center border-b px-2 outline-none',
              'transition-colors duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px]',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
            )}
          >
            <ChevronUpIcon className="size-3.5" />
          </NumberFieldPrimitive.Increment>
          <NumberFieldPrimitive.Decrement
            data-slot="number-field-decrement"
            aria-label={labels.decrement}
            tabIndex={0}
            className={cn(
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-1/2 items-center justify-center px-2 outline-none',
              'transition-colors duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px]',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
            )}
          >
            <ChevronDownIcon className="size-3.5" />
          </NumberFieldPrimitive.Decrement>
        </div>
      </div>
    </NumberFieldPrimitive.Root>
  )
}

export { NumberField }
