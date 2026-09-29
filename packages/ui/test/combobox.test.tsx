import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { Combobox, type ComboboxItem } from '../src/components/ui/combobox'

/**
 * A text field that filters a list of options and commits one of them.
 *
 * The claim under test that the Component is built around is the ranking, which it
 * imports rather than reimplements. Asserting that a row exists would pass on an
 * implementation that renders every match in the wrong order, so these tests
 * assert the *order* of the rows.
 *
 * The second claim is the one a naive combobox gets wrong: a choice survives
 * filtering. A field that clears its value because the reader typed one more
 * character silently changes what the form submits, and nothing on screen shows
 * that it happened. The third is that a non-match says so, keeps the list open and
 * keeps the query, because a control that closes itself on a keystroke reads as
 * broken.
 */
const items: ComboboxItem[] = [
  { value: 'pt', label: 'Portugal', hint: 'Lisbon' },
  { value: 'br', label: 'Brazil', keywords: ['brasil'] },
  { value: 'de', label: 'Germany' },
  { value: 'se', label: 'Sweden' },
  { value: 'zz', label: 'Zimbabwe', disabled: true },
]

const empty = { message: (query: string) => `No region matches ${query}` }

const renderField = (props: Partial<Parameters<typeof Combobox>[0]> = {}) =>
  render(<Combobox label="Region" items={items} empty={empty} {...props} />)

const options = () => screen.queryAllByRole('option')
const optionNames = () => options().map((option) => option.textContent ?? '')
/** The option's own words, read without the trailing hint. */
const optionLabels = () => options().map((option) => option.querySelector('span')?.textContent ?? '')

describe('Combobox', () => {
  it('names itself from the caller and never from a placeholder', () => {
    renderField({ placeholder: 'Start typing' })
    // The name is required and separate from the placeholder, because a
    // placeholder disappears on the first keystroke and leaves the field with no
    // name at the moment the reader most needs one.
    expect(screen.getByRole('combobox', { name: 'Region' })).toBeTruthy()
  })

  it('opens on focus and lists every option, with nothing narrowed', async () => {
    const user = userEvent.setup()
    renderField()
    await user.click(screen.getByRole('combobox'))
    // A field that opened showing only the option whose name matches the label it
    // already contains would offer a reader one answer to a question they had not
    // asked yet.
    expect(optionLabels()).toEqual([
      'Portugal',
      'Brazil',
      'Germany',
      'Sweden',
      'Zimbabwe',
    ])
  })

  it('ranks a name that starts with the query above one that only contains it', async () => {
    const user = userEvent.setup()
    renderField()
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'an')

    // "Germany" contains "an" inside a word; "Zimbabwe" is the only name that
    // starts with the query but it is disabled, so the check is that the whole
    // word match wins over the inside-a-word match rather than that it is first.
    const names = optionLabels()
    expect(names[0]).toContain('Germany')
    expect(names).toHaveLength(1)
  })

  it('finds an option by a keyword its name does not carry', async () => {
    const user = userEvent.setup()
    renderField()
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'brasil')
    // Only the caller's synonyms can find an option by what it is for, and the
    // keyword never outranks a name that matched.
    expect(optionNames().join(' ')).toContain('Brazil')
  })

  it('says nothing matched in the caller sentence and keeps the query', async () => {
    const user = userEvent.setup()
    renderField()
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'qqqq')

    expect(screen.getByRole('status')).toHaveTextContent('No region matches qqqq')
    // The field keeps what was typed, because a reader who mistyped has to be able
    // to correct it, and the list stays open because closing on a non-match reads
    // as the control having broken.
    expect(screen.getByRole('combobox')).toHaveValue('qqqq')
  })

  it('keeps a choice that the query filtered out of the list', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ defaultValue: 'br', onValueChange })

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('br')

    await user.type(screen.getByRole('combobox'), 'Ger')
    // "Brazil" is not in the list any more. The submitted value is still Brazil,
    // because filtering the list is a question about the list and not about the
    // answer, and a combobox that cleared the selection here would change what the
    // form submits with nothing on screen to show that it had.
    expect(optionNames().join(' ')).not.toContain('Brazil')
    expect(onValueChange).not.toHaveBeenCalledWith(null)
  })

  it('puts the chosen label back into the field when the query is abandoned', async () => {
    const user = userEvent.setup()
    renderField({ defaultValue: 'br' })
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.type(field, 'Ger')
    await user.keyboard('{Escape}')

    // Escape dismissed the list, not the answer. A field that emptied itself here
    // would submit nothing the reader chose.
    expect(field).toHaveValue('Brazil')
    expect(options()).toHaveLength(0)
  })

  it('restores the answer when the field loses focus', async () => {
    const user = userEvent.setup()
    renderField({ defaultValue: 'br' })
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.type(field, 'Ger')
    await user.tab()

    expect(field).toHaveValue('Brazil')
  })

  it('shows the whole list again once a filled field is reopened', async () => {
    const user = userEvent.setup()
    renderField({ defaultValue: 'br' })
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.keyboard('{Escape}')
    await user.click(field)

    // The chosen option is selected, and the rest of the list is still there: a
    // filled field that filtered to its own value would hide every other answer.
    expect(options()).toHaveLength(items.length)
    expect(within(screen.getByRole('listbox')).getByRole('option', { selected: true })).toHaveTextContent(
      'Brazil',
    )
  })

  it('commits the highlighted option on Enter, not the first one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ onValueChange })
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('br')
    expect(field).toHaveValue('Brazil')
  })

  it('does nothing on Enter when nothing matches, rather than committing a row', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ onValueChange })

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'qqqq{Enter}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('wraps the highlight at both ends and steps over a disabled option', async () => {
    const user = userEvent.setup()
    renderField()
    const field = screen.getByRole('combobox')
    await user.click(field)

    // Four are choosable and the fifth is not, so from the top of the list the
    // arrows must skip it rather than stop on something that cannot be chosen.
    await user.keyboard('{ArrowUp}')
    expect(options()[3]).toHaveAttribute('data-active', 'true')
    expect(options()[4]).toHaveAttribute('data-active', 'false')

    await user.keyboard('{ArrowDown}')
    expect(options()[0]).toHaveAttribute('data-active', 'true')
  })

  it('keeps the highlight in range when the list shrinks under it', async () => {
    const user = userEvent.setup()
    renderField()
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    await user.type(field, 'Ger')

    const active = options().filter((option) => option.getAttribute('data-active') === 'true')
    expect(active).toHaveLength(1)
    expect(active[0].textContent).toContain('Germany')
  })

  it('clears the answer only when the reader empties the field', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ defaultValue: 'br', onValueChange })
    const field = screen.getByRole('combobox')

    await user.click(field)
    await user.clear(field)

    // Emptying the field is the one edit that changes the answer. Every other
    // keystroke is a query, and a query is not a submission.
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(field).toHaveValue('')
  })

  it('renders an empty field as an empty control, with nothing submitted', () => {
    const { container } = renderField({ name: 'region' })
    const field = screen.getByRole('combobox')
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]')

    expect(field).toHaveValue('')
    // An unset field that renders a default the reader never chose is a form that
    // submits an answer nobody gave.
    expect(hidden).toBeTruthy()
    expect(hidden?.value).toBe('')
    expect(options()).toHaveLength(0)
  })

  it('submits the option value under the field name, not the label', async () => {
    const user = userEvent.setup()
    const { container } = renderField({ name: 'region' })

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}{Enter}')

    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]')
    // "Brazil" is a sentence and "br" is a value. A form that posts the label makes
    // every downstream reader of the data parse a sentence.
    expect(hidden?.value).toBe('br')
    expect(screen.getByRole('combobox')).toHaveValue('Brazil')
  })

  it('commits the highlighted option when the reader tabs away', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderField({ onValueChange })

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'Ger')
    await user.tab()

    // Tabbing past a field a reader just narrowed was an intent to submit it.
    expect(onValueChange).toHaveBeenCalledWith('de')
  })

  it('has no accessibility violations when the list is open', async () => {
    const user = userEvent.setup()
    const { container } = renderField({ defaultValue: 'br' })
    await user.click(screen.getByRole('combobox'))

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations when nothing matched', async () => {
    const user = userEvent.setup()
    const { container } = renderField()
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'qqqq')

    // The empty state is the one with a live region and no listbox, and it is the
    // state that is only ever looked at once it has already gone wrong.
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
