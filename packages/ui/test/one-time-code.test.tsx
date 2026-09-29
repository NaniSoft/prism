import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { OneTimeCode } from '../src/components/ui/one-time-code'

/**
 * A verification code entered one segment at a time.
 *
 * The three decisions under test are the three a naive segmented field gets
 * wrong. A paste of the whole code must land in every segment, because a reader
 * who has the code on their clipboard has already done the hard part. A character
 * outside the caller's set must be refused rather than stored, because a field
 * that holds a value the server will reject looks correct and is not. And
 * Backspace on an empty segment must step backwards and clear the one before it,
 * because a reader correcting the fifth of six digits is holding Backspace rather
 * than reading.
 */
const slots = () => [...document.querySelectorAll<HTMLInputElement>('[data-slot="one-time-code-input"]')]

const values = () => slots().map((slot) => slot.value)

const renderCode = (props: Partial<Parameters<typeof OneTimeCode>[0]> = {}) =>
  render(<OneTimeCode label="Verification code" length={6} {...props} />)

describe('OneTimeCode', () => {
  it('renders one segment per character and names the group and the first segment', () => {
    renderCode()
    expect(slots()).toHaveLength(6)
    // A row of six single-character fields with no name is six anonymous fields.
    expect(screen.getByRole('group', { name: 'Verification code' })).toBeTruthy()
    // The first segment takes its name from a real `<label>`, which is what names
    // the platform's autofill prompt for the code as well as the field.
    expect(slots()[0]).toHaveAccessibleName('Verification code')
  })

  it('lets the caller name each segment so a reader knows which one they are in', () => {
    renderCode({ segmentLabel: (index) => `Digit ${index + 1} of 6` })
    // An ordinal is a phrase in the reader's language, so the Component asks for it
    // rather than composing one.
    expect(screen.getByRole('textbox', { name: 'Digit 3 of 6' })).toBeTruthy()
  })

  it('distributes a paste of the whole code across every segment', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderCode({ onComplete })

    await user.click(slots()[0] as HTMLInputElement)
    await user.paste('123456')

    // A field that accepted one character per paste makes a reader with a code on
    // their clipboard retype it one box at a time, which is what they are on their
    // phone to avoid.
    expect(values()).toEqual(['1', '2', '3', '4', '5', '6'])
    // And it completes once, from the paste, rather than after six keystrokes.
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('strips whitespace from a paste rather than refusing the whole of it', async () => {
    const user = userEvent.setup()
    renderCode()
    await user.click(slots()[0] as HTMLInputElement)
    await user.paste('123 456')

    // The code a reader copies out of an email is full of spaces. A field that
    // refused the paste because of them would read as broken.
    expect(values()).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('refuses a character outside the set without refusing the characters around it', async () => {
    const user = userEvent.setup()
    const onInvalid = vi.fn()
    renderCode({ onInvalid })

    await user.click(slots()[0] as HTMLInputElement)
    await user.paste('12345a6')

    // A field that accepted the text and rejected it at the server looks right and
    // does not submit. The refused character is reported so the caller can decide
    // whether it deserves a word to the reader.
    expect(values()).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(onInvalid).toHaveBeenCalledWith('12345a6')
  })

  it('refuses a typed character outside the set and keeps the digits around it', async () => {
    const user = userEvent.setup()
    const onInvalid = vi.fn()
    renderCode({ onInvalid })

    await user.click(slots()[0] as HTMLInputElement)
    await user.type(slots()[0] as HTMLInputElement, '1a2b3')

    expect(values().filter(Boolean)).toEqual(['1', '2', '3'])
    expect(onInvalid).toHaveBeenCalled()
  })

  it('takes the character set the caller chose', async () => {
    const user = userEvent.setup()
    renderCode({ length: 8, characters: 'alphanumeric' })

    await user.click(slots()[0] as HTMLInputElement)
    await user.type(slots()[0] as HTMLInputElement, 'a1B2c3')

    // A numeric code, an alphabet-only recovery code and an alphanumeric token are
    // three different things and the service that issued the code decides which.
    expect(values().filter(Boolean)).toEqual(['a', '1', 'B', '2', 'c', '3'])
  })

  it('runs the caller normaliser after the character set', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderCode({ characters: 'alpha', onValueChange, normalize: (v) => v.toLowerCase() })

    await user.click(slots()[0] as HTMLInputElement)
    await user.type(slots()[0] as HTMLInputElement, 'ABCDEF')

    // Folding case is a rule the closed set cannot express, and only the caller knows
    // whether their service compares codes case-sensitively.
    expect(onValueChange).toHaveBeenLastCalledWith('abcdef')
    expect(values().filter(Boolean)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  it('removes one character of the code on Backspace, and the rest close up', async () => {
    const user = userEvent.setup()
    renderCode({ defaultValue: '123456' })

    await user.click(slots()[2] as HTMLInputElement)
    await user.keyboard('{Backspace}')

    // The code is one string of six characters split across six boxes, so Backspace
    // removes a character rather than a box. Six independent boxes would each need a
    // rule for what Backspace on an empty one means, and every version of that rule
    // is wrong for somebody.
    expect(values()).toEqual(['1', '2', '4', '5', '6', ''])
  })

  it('keeps removing characters as Backspace is held, across the boundary', async () => {
    const user = userEvent.setup()
    renderCode({ defaultValue: '123456' })

    await user.click(slots()[3] as HTMLInputElement)
    await user.keyboard('{Backspace}{Backspace}')

    // A reader correcting a digit reaches it by holding Backspace rather than by
    // reading which box they are in, and the field follows them leftwards.
    expect(values()).toEqual(['1', '2', '5', '6', '', ''])
  })

  it('is one Tab stop for the whole code', () => {
    renderCode()
    // The code is one stop in a form rather than six, and the segments are a named
    // group rather than six fields in a row.
    expect(slots().filter((slot) => slot.getAttribute('tabindex') !== '-1')).toHaveLength(1)
  })

  it('renders an empty field as empty segments and submits nothing', () => {
    const { container } = renderCode({ name: 'code' })
    // A field that opened on a code nobody sent would submit a credential nobody
    // has, which is a way of getting into an account.
    expect(values()).toEqual(['', '', '', '', '', ''])
    expect(container.querySelector<HTMLInputElement>('input[name="code"]')?.value).toBe('')
  })

  it('submits the code the reader entered under the field name', async () => {
    const user = userEvent.setup()
    const { container } = renderCode({ name: 'code' })

    await user.click(slots()[0] as HTMLInputElement)
    await user.paste('246810')

    expect(container.querySelector<HTMLInputElement>('input[name="code"]')?.value).toBe('246810')
  })

  it('clamps a value longer than the field is', () => {
    renderCode({ defaultValue: '1234567890' })
    // A code with more characters than segments has nowhere to go, and a field that
    // held all of it would submit a code the service cannot match.
    expect(values()).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('draws the separator where the caller said to, and nowhere else', () => {
    const { container } = renderCode({ grouping: { after: [2], separator: '-' } })
    const separators = [...container.querySelectorAll('[data-slot="one-time-code-separator"]')]
    expect(separators).toHaveLength(1)
    expect(separators[0].textContent).toBe('-')
    // Where a code is grouped is the reader's convention, so the Component takes the
    // positions and the glyph rather than assuming six digits or a rhythm of three.
    expect(separators[0].getAttribute('aria-hidden')).toBe('true')
  })

  it('is inert when it is disabled', () => {
    renderCode({ disabled: true })
    expect(slots()[0]).toBeDisabled()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = renderCode({
      defaultValue: '123',
      name: 'code',
      grouping: { after: [2], separator: '-' },
      segmentLabel: (index) => `Digit ${index + 1} of 6`,
    })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
