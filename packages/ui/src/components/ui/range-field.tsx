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
 *
 * The coarse-pointer floor is a band and not a `size-11` step, for the reason
 * `slider.tsx` argues at length: Base UI positions the thumb with `left:
 * <percent>%` and reads the press offset from the thumb's own box, so a band gives
 * a 44px target around an unchanged 16px dot and a step would put a 44px ball on a
 * six pixel rail.
 *
 * The cost is stated because it is specific to two thumbs. Two 44px bands around
 * two 16px dots overlap once the bounds are closer together than the band is wide,
 * and the later thumb paints above the earlier one, so on a coarse pointer a pair
 * of bounds inside about forty pixels of each other are dragged by the bound that
 * was last used until the Tab key moves to the other. That is a wider dead zone
 * than the desktop sixteen pixels, it is the price of the floor rather than a
 * defect in it, and the answer is `minGap`: a caller who needs two bounds a reader
 * can pinch apart on a phone needs a gap wide enough to pinch.
 */
const THUMB =
  'border-primary bg-background shadow-xs ring-ring block size-4 shrink-0 rounded-full border outline-none transition-[color,box-shadow] duration-fast ease-out hover:ring-4 focus-visible:ring-4 data-[disabled]:pointer-events-none pointer-coarse:before:absolute pointer-coarse:before:left-1/2 pointer-coarse:before:top-1/2 pointer-coarse:before:h-11 pointer-coarse:before:w-11 pointer-coarse:before:-translate-x-1/2 pointer-coarse:before:-translate-y-1/2 pointer-coarse:before:content-[""]'

/**
 * The fraction of the whole track the band between two bounds covers, from 0 to 1.
 *
 * **This is Base UI's arithmetic restated, and the restatement is the point.**
 * `SliderIndicator` writes `inset-inline-start: <percent>%` and `width:
 * <percent>%` as inline styles, and the second of those is `(end - min) / (max -
 * min)` expressed as a percentage of the track. A transform needs a unitless factor
 * rather than a percentage of a box, so the factor has to exist somewhere
 * JavaScript can put it, and there are exactly two ways to get one: restate the
 * line, or parse the percentage back out of Base UI's own inline style string. The
 * restatement is the honest one, and `range-field.test.tsx` holds it against what
 * the two thumbs announce rather than against a second copy of these two lines.
 *
 * **Only the WIDTH is restated. The position is Base UI's, and that is the whole
 * of why this Component does not have to think about direction.** It writes
 * `inset-inline-start` as a logical property, so the left edge of the band lands
 * on the lower bound under a left-to-right `dir` and on its mirror under a
 * right-to-left one, and a transform only has to scale it about whichever edge
 * that is. `Progress` could take the position back as well because its fill
 * always starts at the inline start; a range's does not, and a band computed here
 * as one number translated into place would have had to flip its sign under
 * `dir="rtl"`, which is the bug this arrangement exists to not have.
 *
 * `max === min` is a division by zero rather than an interval, and the band on it
 * is a band at zero rather than a band at `NaN`; the infinities a reversed range
 * produces need no case of their own, because the same clamp resolves them to the
 * nearer bound.
 */
function bandOf(start: number, end: number, min: number, max: number): number {
  const span = (end - start) / (max - min)
  if (Number.isNaN(span)) return 0
  return Math.min(1, Math.max(0, span))
}

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
 * **The band between the bounds is a transform, and the transform is its whole
 * geometry.** It is the same decision `Progress` states for the same reason, and
 * on a range it matters more rather than less, because a range is the one control
 * here whose value changes on every pointer move rather than on every commit: a
 * band that animated `left` and `width` settled layout on every frame of a drag,
 * on the page the consumer composed it into, for as long as their finger was down.
 * The indicator is as wide as the track at every value and is scaled about the
 * inline start, so advancing a bound is a compositor animation. **A consumer who
 * styled the indicator's width has to move with it**, exactly as with `Progress`:
 * the honest replacement is a rule on its `transform`.
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
  const vertical = orientation === 'vertical'
  const band = bandOf(start, end, min, max)

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
              /*
               * `scaleX` rather than a width, for the reason `Progress` gives at
               * length. The class named three layout properties and exactly one of
               * them ever changed: Base UI writes `inset-inline-start` and `width`
               * onto this element as inline declarations, so `left` and `right` were
               * properties the browser checked on every frame in order to discover
               * they had not moved, and `width` was a layout-and-paint animation on
               * every frame of every drag. The style below is merged over Base UI's
               * rather than beside it, which is the only way to reach an inline
               * declaration, and it takes the width back and leaves the position
               * alone.
               *
               * The origin is the inline start in both directions, and it takes an
               * `rtl:` variant to say so rather than a logical property, because CSS
               * has no logical keyword for `transform-origin` and Tailwind 4.3's
               * `origin` utility ships the nine physical positions and nothing else.
               * `origin-left` is the inline start under a left-to-right `dir` and
               * `rtl:origin-right` is the inline start under a right-to-left one,
               * which is the edge Base UI's own logical `inset-inline-start` has
               * already anchored the band to.
               *
               * The element stays as wide as the track and overflows it, and the
               * track's `overflow-hidden` is what turns that into a band between two
               * bounds rather than a band at the wrong end of the rail. The band is a
               * vertical orientation's `scaleY` about the bottom edge, chosen by the
               * prop the Component already forwards, so a vertical field gets the
               * same compositor animation rather than the horizontal one applied to a
               * vertical box.
               *
               * NO `rounded-full` ON THE BAND, AND THAT IS THE ONE PLACE THIS
               * DIFFERS FROM `Progress`. A `scaleX` scales the shape it is applied
               * to, including its own corners, so a rounded end on a band at 40%
               * draws a 3px cap squashed to 1.2px on the horizontal axis and left at
               * 3px on the vertical one, which reads as a lens rather than as an end.
               * `Progress` can afford to keep its radius because a bar's trailing end
               * is the figure and its radius is part of the figure; here the ends of
               * the band are the two thumbs, which are circles drawn on top of it, so
               * a radius on the band is a second, smaller circle under a larger one
               * and squashing it lands on exactly the edge the reader is looking at.
               * The track carries `rounded-full` with `overflow-hidden`, so a band at
               * full span still has both of its ends rounded, and a partial one has a
               * straight edge at the bound, which is what a bound looks like.
               *
               * `absolute` is not written here because it does nothing: Base UI sets
               * `position` inline for this element, and an inline declaration beats a
               * class on every document.
               */
              className={cn(
                'bg-primary h-full w-full transition-transform duration-fast ease-out',
                vertical ? 'origin-bottom' : 'origin-left rtl:origin-right',
              )}
              style={vertical ? { height: '100%', transform: `scaleY(${band})` } : { width: '100%', transform: `scaleX(${band})` }}
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
