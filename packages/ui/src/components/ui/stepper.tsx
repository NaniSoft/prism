'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

import { Button } from './button'
import { ButtonGroup } from './button-group'

/**
 * The props the Stepper accepts.
 *
 * A declared interface rather than a forwarded native one. There is no element
 * here to forward to, because the Component draws a group of two controls and
 * owns the bounds both of them read, and a forwarded `onChange` would be a second
 * way to say what a press does.
 */
export interface StepperProps {
  /**
   * The value both controls move.
   *
   * Required, and a number rather than `number | null`. An empty value is a value
   * `NumberField` reports, because a typed scalar has to be able to say "nothing
   * yet". A pair of controls has nothing to step from: pressing a control on an
   * empty field would have to invent the first value, and a Component that
   * invents one is a Component that has guessed the caller's unit. A caller whose
   * quantity starts empty holds nothing, and reaches for `NumberField`.
   */
  value: number
  /**
   * Called with the value a press produced.
   *
   * Required, and controlled: the Component holds no value of its own, because a
   * value held inside a control and a value held by the caller are two numbers
   * that disagree the moment a second control reads the same one. The pair here
   * and the `NumberField` beside it are the ordinary case of exactly that.
   */
  onValueChange: (value: number) => void
  /**
   * The accessible name of the joined pair.
   *
   * Required, and it names the pair rather than either half: a screen reader
   * announces the group first, so "Quantity" is what tells the reader which of the
   * two controls they are in before either of them speaks.
   */
  label: string
  /**
   * The accessible names of the two controls.
   *
   * Required as a pair, and the words are the caller's because a stepper's
   * controls are icons and an icon has no name. "Increase the number of seats",
   * "Decrease the monthly budget". Prism would get "increase" right for a
   * quantity and wrong for at least one of every four products that install it.
   */
  labels: { increment: string; decrement: string }
  /**
   * The smallest value the pair will hold.
   *
   * A press below it is refused and the decrement draws itself unavailable, which
   * are two answers to one question: the value never leaves the range, and the
   * reader is told where the range is rather than discovering it by pressing.
   * Without a minimum there is no boundary for the pair to report, so this and
   * `max` are what turn two buttons into a control over a range.
   */
  min?: number
  /** The largest value the pair will hold. The same contract as `min`. */
  max?: number
  /**
   * The amount one press changes the value by. @defaultValue 1
   *
   * A step of zero is refused by being a no-op rather than by a diagnostic,
   * because a zero step is a caller's arithmetic mistake rather than a claim this
   * Component would be making on the caller's behalf, and a control that does
   * nothing is already the answer to it.
   */
  step?: number
  /**
   * Whether the pair ignores interaction.
   *
   * Set natively on both controls, and the reason is the frame rather than a
   * preference. `ButtonGroup` draws the joined shape by suppressing each child's
   * own ring and squaring each child's corners, which leaves no place between the
   * group and the control to put a wrapper that could draw an unavailable state
   * without breaking the join. So the state is the native one, and the cost of
   * that choice is stated on the Component.
   */
  disabled?: boolean
  /**
   * Whether the value may be read but not moved.
   *
   * Refuses both controls rather than one, because a half-stepper over a value
   * nobody may change is a control with a live half and a dead half, and the
   * reader has no way to tell which half is the wrong one.
   */
  readOnly?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * An increment and a decrement joined as one control, both of them holding the
 * same range.
 *
 * **Two controls that must agree, and the agreement is the Component.** A caller
 * who composes two `Button`s gets two controls that know nothing about each other:
 * one clamps and one does not, or both clamp against different bounds, or the
 * increment is drawn as available one render after the value reaches the maximum.
 * The bounds here are two props read once by both controls and by the handler
 * that computes the next value, so the two halves cannot drift: there is no
 * second place for a bound to be written.
 *
 * **At a boundary the control draws itself unavailable rather than doing nothing
 * silently, and that is the difference between a stepper and two buttons.** A
 * press that quietly fails is the worst outcome available to a control: the
 * reader has pressed something, the page has not changed, and nothing has said
 * why. So the half that has reached its bound is visibly dimmed and is no longer
 * in the tab order, and the reader learns the range from the shape of the control
 * rather than from an error. **The cost is stated rather than smoothed over: a
 * natively disabled control leaves the tab order**, so a stepper sitting at its
 * maximum is one tab stop rather than two. Here that is the right trade and not a
 * compromise, because the only way the value moves is the other half or the
 * caller's own field, so a tab stop on the spent half could tell a reader
 * something and could not let them do anything with it.
 *
 * **The wrapper that would let the pair draw an unavailable state does not exist,
 * and the reason is the composition.** `TextFormatToolbar` dims a command by
 * putting the surface on a wrapper span it owns, because that Component draws its
 * own frame and has room for one. `ButtonGroup` draws this frame instead, and it
 * draws it by suppressing each child's own ring and squaring each child's corners,
 * so anything placed between the group and a control would either lose the join or
 * clip the corners Prism just squared. That is why `disabled` goes to the native
 * attribute here and the JSDoc on `disabled` says so: the state had to be the
 * native one or the shape would have gone.
 *
 * **The pair clamps and does not snap to the step grid, and that is a decision
 * about whose number it is.** A value that is already off the grid, `7` against a
 * `min` of `0` and a `step` of `5`, moves to `10` and not to `5`. Snapping would
 * mean the first press rewrites a number the reader did not touch, which is the
 * same defect `NumberField` avoids by moving from wherever the value is. The cost
 * is that a value can sit off the grid indefinitely, and a caller who needs the
 * grid enforced validates it in their own submit handler.
 *
 * **It is `number-field`'s pair and not `number-field`, and the difference is
 * where the value is typed.** `NumberField` is a typed scalar: it holds the
 * value in an input, the reader can write it, and its two steppers are a
 * secondary route to a number they are not the only way to reach. This is the
 * paired affordance on its own, for a value the caller displays in its own terms:
 * a quantity in a cart line, a count in a table cell, an amount whose unit only
 * the caller knows. The honest cost of that split is that this Component cannot
 * show the value it is changing, because a number without a unit is a guess, so a
 * caller who wants the figure beside the pair draws it themselves. A caller who
 * wants one control to hold the figure and the pair composes `NumberField`, whose
 * steppers are already inside its own frame.
 *
 * **It is a client Component** because both controls call back and the clamps run
 * in the press. What that costs is the price of every interactive control: a
 * static page cannot render a stepper at all, which is correct, because a stepper
 * is a control and a control that cannot be pressed is a picture of one.
 */
function Stepper({
  value,
  onValueChange,
  label,
  labels,
  min,
  max,
  step = 1,
  disabled = false,
  readOnly = false,
  className,
}: StepperProps) {
  const atMin = typeof min === 'number' && value <= min
  const atMax = typeof max === 'number' && value >= max

  // One clamp, read by both halves. A pair with two clamps is a pair with two
  // answers, and which of them ran is invisible to the reader and to the caller.
  const move = (direction: 1 | -1) => {
    const next = value + step * direction
    let out = next
    if (typeof min === 'number' && out < min) out = min
    if (typeof max === 'number' && out > max) out = max
    onValueChange(out)
  }

  const unavailable = disabled || readOnly

  return (
    <ButtonGroup className={className} label={label}>
      <Button
        data-slot="stepper-decrement"
        type="button"
        variant="outline"
        size="icon"
        disabled={unavailable || atMin}
        onClick={() => move(-1)}
        aria-label={labels.decrement}
      >
        <MinusIcon aria-hidden="true" />
      </Button>

      <Button
        data-slot="stepper-increment"
        type="button"
        variant="outline"
        size="icon"
        disabled={unavailable || atMax}
        onClick={() => move(1)}
        aria-label={labels.increment}
      >
        <PlusIcon aria-hidden="true" />
      </Button>
    </ButtonGroup>
  )
}

export { Stepper }