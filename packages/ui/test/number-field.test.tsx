import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { NumberField } from '../src/components/ui/number-field'

/**
 * A numeric field that will not hold a value outside its own range.
 *
 * The claim under test is clamping, and it is tested on every path that can
 * produce a value: typing past the maximum, a stepper at the ceiling, and a value
 * that was already out of range when it arrived. The last one is the Component's
 * own half of the promise, because Base UI clamps what is typed and refuses what a
 * stepper reaches but lets an out-of-range value straight through on the way in.
 *
 * The second claim is the malformed one: text that is not a number never becomes
 * a value. `NaN` reaching a caller is a number the caller will compare, submit and
 * fail on, and a field that threw on a typo has turned a typo into a crash.
 */
const labels = { increment: 'Increase the quantity', decrement: 'Decrease the quantity' }

const renderField = (props: Partial<Parameters<typeof NumberField>[0]> = {}) =>
  render(<NumberField labels={labels} aria-label="Quantity" {...props} />)

const field = () => screen.getByRole('textbox', { name: 'Quantity' })
const increase = () => screen.getByRole('button', { name: 'Increase the quantity' })
const decrease = () => screen.getByRole('button', { name: 'Decrease the quantity' })
const reported = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.map((call) => call[0] as number | null)

describe('NumberField', () => {
  it('names the field and both steppers from the caller', () => {
    renderField()
    expect(field()).toBeTruthy()
    expect(increase()).toBeTruthy()
    expect(decrease()).toBeTruthy()
  })

  it('clamps a typed value to the maximum rather than holding it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 0, max: 100, onValueChange })

    await user.type(field(), '150')

    // Every value the field reported on the way there is inside the range. Asserting
    // only the last one would pass on a field that reported 150 on the way and
    // corrected itself afterwards, which is exactly the field that submits 150.
    const numbers = reported(onValueChange).filter((v): v is number => v !== null)
    expect(numbers.length).toBeGreaterThan(0)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(100)
  })

  it('shows the clamped value once the reader leaves the field', async () => {
    const user = userEvent.setup()
    renderField({ min: 0, max: 100 })

    await user.type(field(), '150')
    await user.tab()

    // The text a reader typed past the maximum is put right as they leave, not left
    // on screen showing a number the field has already refused.
    expect(field()).toHaveValue('100')
  })

  it('clamps a typed value to the minimum', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 10, max: 100, onValueChange })

    await user.type(field(), '4')

    const numbers = reported(onValueChange).filter((v): v is number => v !== null)
    expect(numbers.length).toBeGreaterThan(0)
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(10)
  })

  it('pulls an out-of-range value into range when it arrives', () => {
    // A value that was already past the maximum before the field mounted is the case
    // a `max` attribute cannot catch on its own: the attribute is validated on the
    // control, and the control is created from the value.
    renderField({ min: 0, max: 100, defaultValue: 900, name: 'quantity' })
    expect(field()).toHaveValue('100')
  })

  it('clamps an out-of-range value a controlled consumer passes in', () => {
    // The field shows what it will submit. The alternative is a field showing one
    // number and submitting another, and the consumer's state is theirs to fix from
    // `onValueChange`, not something this Component rewrites behind them.
    renderField({ min: 0, max: 100, value: 900, name: 'quantity' })
    expect(field()).toHaveValue('100')
  })

  it('steps by the step amount and stops at both ends', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 0, max: 2, step: 1, defaultValue: 1, onValueChange })

    await user.click(increase())
    expect(onValueChange).toHaveBeenLastCalledWith(2)

    // A third press at the ceiling must not produce 3. The field is told 2 is the
    // largest value it will hold and a stepper that goes past it is a field that
    // does not know its own range.
    await user.click(increase())
    expect(reported(onValueChange)).not.toContain(3)
    expect(field()).toHaveValue('2')

    await user.click(decrease())
    expect(onValueChange).toHaveBeenLastCalledWith(1)
    await user.click(decrease())
    await user.click(decrease())
    expect(reported(onValueChange)).not.toContain(-1)
    expect(field()).toHaveValue('0')
  })

  it('keeps both steppers in the tab order', () => {
    renderField({ min: 0, max: 100, defaultValue: 5 })
    // A stepper that is announced and cannot be reached is worse for a reader than
    // a second Tab stop, so they are put back into the tab order on purpose.
    expect(increase().getAttribute('tabindex')).toBe('0')
    expect(decrease().getAttribute('tabindex')).toBe('0')
  })

  it('clamps a pasted value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 0, max: 50, onValueChange })

    await user.click(field())
    await user.paste('9999')

    const numbers = reported(onValueChange).filter((v): v is number => v !== null)
    expect(numbers.length).toBeGreaterThan(0)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(50)
  })

  it('never turns a character outside the set into a value, and never throws on one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 0, max: 100, onValueChange })

    await user.type(field(), 'a1b2c3')

    // The letters are refused as they are typed, so the reader gets the number they
    // meant rather than a number the server will reject, and no `NaN` reaches a
    // caller who would compare it, submit it and fail on it.
    expect(field()).toHaveValue('123')
    const numbers = reported(onValueChange).filter((v): v is number => v !== null)
    expect(numbers.every((v) => Number.isFinite(v))).toBe(true)
  })

  it('reports an empty field as no value rather than as zero', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ min: 0, max: 100, defaultValue: 5, onValueChange })

    await user.clear(field())

    // Zero is a number a reader may have meant. An empty field is not, and a
    // consumer that wants zero has to say so.
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(field()).toHaveValue('')
  })

  it('renders an empty field as an empty control', () => {
    renderField({ min: 0, max: 100 })
    // A field that opened on zero would have answered a question nobody asked, and
    // submitted a quantity the reader never chose.
    expect(field()).toHaveValue('')
  })

  it('submits the value under the field name', () => {
    const { container } = renderField({ name: 'quantity', defaultValue: 3 })
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')?.value).toBe('3')
  })

  it('shows the unit the caller gave it and keeps it out of the field name', () => {
    const { container } = renderField({ unit: 'kg' })
    const unit = container.querySelector('[data-slot="number-field-unit"]')
    // A unit is a word in the reader's language and the Component does not know
    // whether the reader measures in kilograms or pounds.
    expect(unit?.textContent).toBe('kg')
    // It is decoration. The field is named once, in words, where a screen reader
    // will reach it, and two announcements of the same unit is one too many.
    expect(unit?.getAttribute('aria-hidden')).toBe('true')
    expect(field()).toHaveAccessibleName('Quantity')
  })

  it('is inert when it is disabled', () => {
    renderField({ disabled: true })
    expect(field()).toBeDisabled()
    expect(increase()).toBeDisabled()
    expect(decrease()).toBeDisabled()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = renderField({
      unit: 'kg',
      min: 0,
      max: 100,
      defaultValue: 5,
      id: 'quantity',
    })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations with no id of its own', async () => {
    // The steppers point `aria-controls` at the field's id, so a field that was
    // never given one is the case where a dangling reference can appear.
    const { container } = renderField({ min: 0, max: 100, defaultValue: 5 })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
