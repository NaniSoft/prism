'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { useId, useState } from 'react'

import { cn } from '../../lib/utils'

/** The two bounds of an interval, lowest first. */
export type RangeValue = readonly [number, number]

/** Which end of an interval a value is. */
export type RangeBound = 'start' | 'end'

/** The props the Range field accepts. */
export interface RangeFieldProps {
  /**
   * The one line that names the field, drawn above it and used as its accessible
   * name.
   *
   * A `string` rather than a `ReactNode` for one reason: the root is a group
   * labelled by the very element this text is drawn in, so the name a screen
   * reader hears and the name a sighted reader reads are the same string by
   * construction and cannot drift apart.
   */
  label: string
  /**
   * The interval, when the field is controlled.
   *
   * A tuple rather than an array because the two numbers are not interchangeable:
   * the first is the lower bound and the second is the upper one, and an array
   * would let a caller pass them the wrong way round and get a field that reads
   * backwards.
   */
  value?: RangeValue
  /** The interval the field starts at, for an uncontrolled field. */
  defaultValue?: RangeValue
  /**
   * Called with the whole interval as it changes.
   *
   * The pair rather than the one bound that moved, because the span is a fact about
   * the two of them together. A caller who wanted only the bound that moved would
   * have to diff the pair on every keystroke, which is the arithmetic this
   * Component exists to have already done.
   */
  onValueChange?: (value: RangeValue) => void
  /**
   * The accessible name of one thumb, given which end of the interval it is and the
   * formatted number under it.
   *
   * Required, and a function for the reason `FileUpload`'s `removeLabel` is: the
   * words are the caller's, and a bound has a number in its name that Prism cannot
   * interpolate into a sentence it does not own. The formatted number arrives as an
   * argument rather than being left to the caller to reproduce, because the number on
   * screen and the number announced must be the same string.
   */
  boundLabel: (bound: RangeBound, formatted: string) => string
  /**
   * The sentence announced for the span between the bounds, given the width and the
   * formatted width.
   *
   * Required, and rendered into a visually hidden element the field points at. Neither
   * thumb can announce it: each reports its own value and neither knows about the
   * interval the pair describes, so without this a screen reader user learns two
   * numbers and never the distance between them, which for a price band or a
   * retention window is the number they came for.
   */
  spanLabel: (span: number, formatted: string) => string
  /** The minimum allowed value. @defaultValue 0 */
  min?: number
  /** The maximum allowed value. @defaultValue 100 */
  max?: number
  /** The granularity the bounds step by. @defaultValue 1 */
  step?: number
  /**
   * The smallest gap the two bounds may hold, in steps.
   *
   * The guard that stops the thumbs crossing and leaving an interval with a negative
   * span, which is a value no consumer can submit to a backend that validates it.
   */
  minGap?: number
  /** Options passed to `Intl.NumberFormat` when a bound is rendered. */
  format?: Intl.NumberFormatOptions
  /** The locale used when formatting the bounds and the span. */
  locale?: Intl.LocalesArgument
  /** Whether the field ignores user interaction. */
  disabled?: boolean
  /** The axis the bounds move along. @defaultValue horizontal */
  orientation?: 'horizontal' | 'vertical'
  /** The form field name each bound is submitted under. */
  name?: string
  /** Identifies the form that owns the hidden inputs. */
  form?: string
  /** Layout only. */
  className?: string
}

/**
 * The two thumbs, drawn once and shared by both bounds.
 *
 * The ring is at full strength rather than half, for the reason the Slider's own
 * thumb states in full: the alpha would be applied here rather than in the token, so
 * the contrast gate would measure a compliant ring and never see that this one has
 * to clear 3:1. This is the element a keyboard reader lands on, so it is the one
 * indicator they have.
 */
const THUMB =
  'border-primary bg-background shadow-xs ring-ring block size-4 shrink-0 rounded-full border outline-none transition-[color,box-shadow] duration-fast ease-out hover:ring-4 focus-visible:ring-4 data-[disabled]:pointer-events-none'

/**
 * Two thumbs on one track, editing the lower and the upper bound of an interval.
 *
 * **The value is a tuple, so the single-value plumbing does not apply, and that is
 * the argument for the Component rather than a prop on one that already exists.** It
 * is structural rather than cosmetic. `Slider` takes `value?: number` and
 * `onValueChange?: (value: number) => void`: one number in, one number out.
 * `NumberField` is the same shape for a scalar the reader types rather than drags.
 * An interval is two numbers whose relationship to each other is the answer, and no
 * arrangement of two `Slider`s produces it, because each would own a value, an
 * accessible name and a tab stop, and two independently focusable controls that know
 * nothing about each other are a pair that can cross. A consumer who wants a band
 * today writes that plumbing twice and writes the guard that stops the crossing
 * themselves, and the guard's absence is invisible until a form submits a negative
 * span.
 *
 * **Base UI's Slider is already a range primitive, and it is used rather than
 * reimplemented.** The check was made before the code and the answer was yes, so
 * there was no question of hand-rolling a two-thumb keyboard model. The root is
 * declared over `number | readonly number[]`, each thumb takes an `index` into that
 * array, and the root carries `minStepsBetweenValues` for the crossing guard, which
 * is what `minGap` forwards to. Composing two Prism `Slider`s was rejected on its
 * merits rather than on principle: it would carry the same internal dependency twice
 * for one control and leave the collision behaviour to whichever of the two answered
 * last. Hand-rolling would have had to earn the two focusable handles, the Home and
 * End keys and the form integration, none of which is this Component's own
 * contribution. **Those three are therefore inherited, not written here**, and the
 * reason to own the surface at all is the announcement below.
 *
 * **The announcement is the contribution.** Two range inputs side by side announce
 * two numbers. What a reader wants from a band is a sentence with a direction: which
 * end is the floor, which is the ceiling, and how wide the interval is. So each thumb
 * is named by the caller's `boundLabel`, which is handed which end it is, and the span
 * is announced once, from a visually hidden sentence the caller's `spanLabel` writes,
 * which the group points at. `spanLabel` is required rather than optional because an
 * unsaid span is not a neutral omission: it is the one figure in the control a reader
 * cannot derive, and deriving it means holding two announced values and subtracting
 * them while driving.
 *
 * **One formatter serves the visible bounds, the two thumb names and the hidden
 * sentence, and the caller's `format` changes the presentation and nothing else.**
 * `Intl` is asked for the number and, when a caller passes a currency or a unit
 * style, for that too. A caller who formatted the visible figure and the announced
 * figure by different rules would ship a field whose drawn number and spoken number
 * disagree, which is a defect no other gate in this repository can see because
 * neither of the two strings is wrong on its own.
 *
 * **The bounds are printed as bare figures and named by the caller's label.** Prism
 * draws the numbers because a number is a machine value, and it draws no word beside
 * them because the words next to a bound are the caller's. A caller who wants a unit
 * passes a `format` that carries one, which is the same route `Price` takes for its
 * currency rather than a second prop for a suffix.
 *
 * **A form receives two values, not one.** Each thumb renders its own range input, so
 * a form with a `name` on this field submits both bounds under it. That is the shape
 * the DOM already has, and it is why the value is a tuple on the wire as well as in
 * the props.
 */
function RangeField({
  label,
  value,
  defaultValue,
  onValueChange,
  boundLabel,
  spanLabel,
  min = 0,
  max = 100,
  step = 1,
  minGap,
  format,
  locale,
  disabled = false,
  orientation = 'horizontal',
  name,
  form,
  className,
}: RangeFieldProps) {
  const [ownValue, setOwnValue] = useState<RangeValue>(defaultValue ?? [min, max])
  const generated = useId()
  const labelId = `${generated}-label`
  const spanId = `${generated}-span`

  const bounds = value ?? ownValue
  const start = bounds[0]
  const end = bounds[1]
  const span = end - start

  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 4,
    ...format,
  })
  const startFormatted = formatter.format(start)
  const endFormatted = formatter.format(end)
  const spanFormatted = formatter.format(span)

  return (
    <div
      data-slot="range-field"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={spanId}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <span
        id={labelId}
        data-slot="range-field-label"
        className="text-foreground text-sm leading-none font-medium"
      >
        {label}
      </span>

      <SliderPrimitive.Root<readonly number[]>
        data-slot="range-field-slider"
        value={bounds}
        min={min}
        max={max}
        step={step}
        {...(minGap === undefined ? null : { minStepsBetweenValues: minGap })}
        {...(name === undefined ? null : { name })}
        {...(form === undefined ? null : { form })}
        disabled={disabled}
        orientation={orientation}
        locale={locale}
        onValueChange={(next) => {
          const pair: RangeValue = [next[0], next[1]]
          if (value === undefined) setOwnValue(pair)
          onValueChange?.(pair)
        }}
        className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50"
      >
        <SliderPrimitive.Control
          data-slot="range-field-control"
          className="flex w-full items-center"
        >
          <SliderPrimitive.Track
            data-slot="range-field-track"
            className="bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full"
          >
            <SliderPrimitive.Indicator
              data-slot="range-field-indicator"
              className="bg-primary absolute h-full rounded-full transition-[left,right,width] duration-fast ease-out motion-safe:transition-[left,right,width]"
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            data-slot="range-field-thumb"
            index={0}
            aria-label={boundLabel('start', startFormatted)}
            aria-valuetext={startFormatted}
            className={THUMB}
          />
          <SliderPrimitive.Thumb
            data-slot="range-field-thumb"
            index={1}
            aria-label={boundLabel('end', endFormatted)}
            aria-valuetext={endFormatted}
            className={THUMB}
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      <div
        data-slot="range-field-bounds"
        className="text-muted-foreground flex items-center justify-between text-xs tabular-nums"
      >
        <span data-slot="range-field-bound" data-bound="start">
          {startFormatted}
        </span>
        <span data-slot="range-field-bound" data-bound="end">
          {endFormatted}
        </span>
      </div>

      {/*
       * The span is not announced by either thumb, because each one reports its own
       * value and neither knows the interval the pair describes. It is drawn out of
       * sight rather than into the markup of a bound, so a caller cannot read it by
       * accident and decide it is a caption.
       */}
      <span id={spanId} data-slot="range-field-span" className="sr-only">
        {spanLabel(span, spanFormatted)}
      </span>
    </div>
  )
}

export { RangeField }
