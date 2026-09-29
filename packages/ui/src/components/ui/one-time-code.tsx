'use client'

import { OTPField as OTPFieldPrimitive } from '@base-ui/react/otp-field'
import { Fragment, useId } from 'react'

import { cn } from '../../lib/utils'

/** How the code is drawn in groups, for a code the reader sees written in groups. */
export interface OneTimeCodeGrouping {
  /** The zero-based indices of the segments a separator is drawn after. */
  readonly after: readonly number[]
  /** What the separator is. The caller's, because it is read by a person. */
  readonly separator: React.ReactNode
}

/** The props the One time code accepts. */
export interface OneTimeCodeProps {
  /**
   * The accessible name of the code.
   *
   * Required. A row of six single-character fields with no name is six anonymous
   * fields, and a reader cannot say out loud which one they are in.
   */
  label: string
  /** How many characters the code has. */
  length: number
  /**
   * The characters the code may contain.
   *
   * The caller's decision because it is theirs: a numeric code, an alphabet-only
   * recovery code and an alphanumeric one-time token are three different things
   * and a verification service decides which. A character outside the set is
   * refused as it is typed or pasted rather than accepted and refused later, so
   * the field never holds a value the server will reject.
   */
  characters?: 'numeric' | 'alpha' | 'alphanumeric' | 'none'
  /**
   * A normaliser, run after the character set has been applied.
   *
   * For the rules the closed set cannot express: folding a pasted code to lower
   * case, stripping a leading country code. It must be idempotent, because the
   * field normalises again on every edit and again on the way out of one.
   */
  normalize?: (value: string) => string
  /**
   * The accessible name of one segment, receiving its zero-based index.
   *
   * Without it every segment is named by the field's own label, which is enough to
   * satisfy the form but not to tell a reader which of the six they are in. This
   * Component does not know the reader's words for a position, so it asks.
   */
  segmentLabel?: (index: number) => string
  /** How the code is drawn in groups, when it is read in groups. */
  grouping?: OneTimeCodeGrouping
  /** The code, when the field is controlled. */
  value?: string
  /** The code the field starts with, for an uncontrolled field. */
  defaultValue?: string
  /** Called with the code as it changes. */
  onValueChange?: (value: string) => void
  /** Called once every segment is filled, including by a paste that fills them all. */
  onComplete?: (value: string) => void
  /**
   * Called with the text the reader attempted when part of it was refused.
   *
   * The attempted text, not a verdict. Whether a refused character deserves a word
   * to the reader is the caller's decision, and this Component ships no sentence
   * into a consumer's product.
   */
  onInvalid?: (attempted: string) => void
  /** Whether the field submits its form as soon as the code is complete. */
  autoSubmit?: boolean
  /** Whether the characters are hidden as they are typed. */
  mask?: boolean
  /** Whether the field ignores interaction. */
  disabled?: boolean
  /** Whether a code must be entered before the form submits. */
  required?: boolean
  /** Whether the reader may see the code but not change it. */
  readOnly?: boolean
  /** The form field name. The code is submitted under it. */
  name?: string
  /** Identifies the form that owns the hidden input. */
  form?: string
  /** The first segment's id. The rest derive from it. */
  id?: string
  /** Layout only. */
  className?: string
}

/**
 * A verification code entered one segment at a time.
 *
 * **A paste of the whole code lands in every segment.** A reader who has the code
 * on their clipboard has already done the hard part, and a field that accepted one
 * character per paste would make them retype it one box at a time, which is what
 * they are on their phone to avoid. So a paste into the first segment is
 * distributed across the ones after it and `onComplete` fires once, from the paste,
 * rather than after six keystrokes.
 *
 * **A refused character is refused, not stored.** Whitespace is dropped and
 * anything outside `characters` is refused, whether it was typed or pasted, so
 * "123 456" pastes as `123456` and `12345a6` pastes as `123456`. The alternative,
 * accepting the text and rejecting it at the server, gives the reader a field
 * that looks right and a form that does not submit.
 *
 * **The code is one value, not six.** The segments are six views of one string of
 * `length` characters, so Backspace removes a character from the string and the
 * characters after it close up: on `123456`, Backspace in the third segment leaves
 * `12456`. Six boxes that each had to be emptied by hand would need a rule for
 * what Backspace on an empty box means, and every version of that rule is wrong
 * for somebody. The rule that does nothing traps a reader who is correcting a
 * digit; the rule that clears the box before deletes a character they did not ask
 * to delete.
 *
 * **The character set, the normaliser and the words are all the caller's.** Which
 * characters a code may contain is decided by the service that issued it, folding
 * case is a rule only the caller knows, and every segment's accessible name is a
 * phrase. Nothing here is a table of words or a regular expression.
 *
 * **The first segment is named by a real `<label>`, and it is hidden.** Base UI
 * strips `aria-label` from that one segment on purpose: it is the segment the
 * platform autofills, and the label element is what names the autofill prompt as
 * well as the field. This Component renders that label visually hidden, because a
 * label above a row of six boxes is the caller's to place. Pass `id` and put your
 * own `Label` on the first segment, and this one steps aside.
 *
 * **One Tab stop for the whole code.** A reader reaches the first segment and the
 * rest follow as they type, so the code is one stop in a form rather than six, and
 * the segments are a named group rather than six fields in a row. It is built on
 * Base UI's OTP field, which owns the segmentation, the clamping to `length` and
 * the autofill hint the platform needs for a one-time code.
 */
function OneTimeCode({
  label,
  length,
  characters = 'numeric',
  normalize,
  segmentLabel,
  grouping,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  onInvalid,
  autoSubmit = false,
  mask = false,
  disabled = false,
  required = false,
  readOnly = false,
  name,
  form,
  id,
  className,
}: OneTimeCodeProps) {
  const generated = useId()
  const firstId = id ?? generated
  const boundary = (index: number) => grouping?.after.includes(index) === true

  return (
    <OTPFieldPrimitive.Root
      data-slot="one-time-code"
      className={cn('flex items-center justify-center gap-2', className)}
      length={length}
      validationType={characters}
      {...(normalize === undefined ? null : { normalizeValue: normalize })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onValueChange={(next) => onValueChange?.(next)}
      onValueComplete={(next) => onComplete?.(next)}
      onValueInvalid={(attempted) => onInvalid?.(attempted)}
      autoSubmit={autoSubmit}
      mask={mask}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      name={name}
      {...(form === undefined ? null : { form })}
      id={firstId}
      aria-label={label}
    >
      {/*
       * Visually hidden, and only while the caller has not taken the name over with
       * an `id` of their own. Two `<label for>` elements on one segment make its
       * name the two of them run together, which is worse than either.
       */}
      {id === undefined ? (
        <label htmlFor={firstId} className="sr-only">
          {label}
        </label>
      ) : null}

      {Array.from({ length }, (_, index) => (
        <Fragment key={index}>
          <OTPFieldPrimitive.Input
            data-slot="one-time-code-input"
            // Every segment after the first is named, because a row of six
            // single-character fields with no name is six anonymous fields. The
            // first takes its name from the label element above.
            {...(index === 0
              ? null
              : { 'aria-label': segmentLabel === undefined ? label : segmentLabel(index) })}
            className={cn(
              'border-input bg-background text-foreground h-11 w-9 rounded-md border text-center text-base tabular-nums outline-none',
              'transition-[color,box-shadow] duration-fast ease-out',
              'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              'pointer-coarse:size-11',
            )}
          />
          {/*
           * The separator sits after the segment the caller named, not on a fixed
           * rhythm of every third box: where a code is grouped is the reader's
           * convention and this package has no opinion about six digits or eight.
           */}
          {boundary(index) ? (
            <span
              data-slot="one-time-code-separator"
              aria-hidden="true"
              className="text-muted-foreground shrink-0 text-base"
            >
              {grouping?.separator}
            </span>
          ) : null}
        </Fragment>
      ))}
    </OTPFieldPrimitive.Root>
  )
}

export { OneTimeCode }
