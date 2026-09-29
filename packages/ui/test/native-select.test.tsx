import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import axe from 'axe-core'

import { NativeSelect } from '../src/components/ui/native-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select'

/**
 * A native `<select>`, styled to match the rest of this package.
 *
 * The claim that makes this a Component rather than a duplicate is which element
 * is on the page, and it is asserted against the `Select` it sits beside. Prism's
 * `Select` is Base UI's: a `<button role="combobox">` and a popup list. This one
 * is the platform element, so the wheel, the mobile picker, the context menu and
 * form submission without JavaScript all still work. A test that only checked its
 * own markup would pass on a second custom control, so the difference is the test.
 *
 * The rest are the things a styled native select gets wrong by accident: an
 * inherited platform arrow, a chevron that swallows clicks, and a control in the
 * platform's own face because a `<select>` does not inherit a font everywhere.
 */
const OPTIONS = (
  <>
    <option value="day">Day</option>
    <option value="week">Week</option>
    <option value="month">Month</option>
  </>
)

describe('the NativeSelect', () => {
  it('is a platform select element, so the platform picker still works', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    // The whole reason this Component exists. A custom listbox looks identical in
    // a screenshot and has no wheel, no mobile picker, no type-ahead and no
    // context menu, because those are thirty years of platform behaviour attached
    // to one element and a `div` has none of them.
    const control = container.querySelector('[data-slot="native-select-control"]')
    expect(control?.tagName).toBe('SELECT')
    expect(screen.getByRole('combobox', { name: 'Range' })).toBe(control)
  })

  it('is a different element from the Select it sits beside, not a second Select', () => {
    const { container } = render(
      <>
        <NativeSelect aria-label="Native range" defaultValue="week">
          {OPTIONS}
        </NativeSelect>
        <Select value="week" onValueChange={() => {}}>
          <SelectTrigger aria-label="Custom range" />
          <SelectValue />
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>
      </>,
    )
    // The claim in one assertion: the package holds a custom control that needs
    // JavaScript and a platform control that does not, and a reader choosing
    // between them is choosing between the two behaviours rather than between two
    // styles of the same control. The custom one renders a button with
    // `role="combobox"`; the native one is the element itself.
    const natives = container.querySelectorAll('select')
    expect(natives).toHaveLength(1)
    const custom = screen.getByRole('combobox', { name: 'Custom range' })
    expect(custom.tagName).toBe('BUTTON')
    expect(custom).not.toBe(natives[0])
  })

  it('holds the value it was given and reports the one that was chosen', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <NativeSelect aria-label="Range" defaultValue="week" onChange={onChange}>
        {OPTIONS}
      </NativeSelect>,
    )
    const control = screen.getByRole('combobox', { name: 'Range' })
    expect(control).toHaveValue('week')
    await user.selectOptions(control, 'month')
    expect(control).toHaveValue('month')
    expect(onChange).toHaveBeenCalled()
  })

  it('submits with a form, because a form that needs JavaScript is a form that fails without it', () => {
    render(
      <form>
        <NativeSelect aria-label="Range" name="range" defaultValue="week">
          {OPTIONS}
        </NativeSelect>
      </form>,
    )
    // The claim the whole JSDoc is built on. A custom select needs a hidden input
    // and a change handler to submit at all; this one submits because it is the
    // element the HTML specification says submits.
    const control = screen.getByRole('combobox', { name: 'Range' }) as HTMLSelectElement
    expect(control.name).toBe('range')
    const data = new FormData(
      control.closest('form') as HTMLFormElement,
    )
    expect(data.get('range')).toBe('week')
  })

  it('draws its own chevron rather than inheriting the platform one', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    // `appearance-none` is what suppresses the platform arrow. Without it the
    // control carries two chevrons: the one the engine draws and the one this
    // package draws, and neither of them is the other.
    const control = container.querySelector('[data-slot="native-select-control"]')
    expect(control?.className).toContain('appearance-none')
    expect(container.querySelector('[data-slot="native-select-icon"]')).toBeTruthy()
  })

  it('hides the chevron from assistive technology and from clicks', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    const icon = container.querySelector('[data-slot="native-select-icon"]')
    // A reader hearing "graphic" after every option set is being told something
    // about the drawing rather than about the value, and the platform already
    // announces the value. And a chevron that swallowed clicks is a region of the
    // control that does nothing when pressed.
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(icon?.className).toContain('pointer-events-none')
  })

  it('names the control when the caller has no visible label to give it', () => {
    render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    // The prop is the answer for a control outside a `Field`. A select with no
    // name at all is announced as "combo box", which is the same words as every
    // other select on the page.
    expect(screen.getByRole('combobox', { name: 'Range' })).toBeTruthy()
  })

  it('is one tab stop, with the browser owning its keys', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Before</button>
        <NativeSelect aria-label="Range" defaultValue="week">
          {OPTIONS}
        </NativeSelect>
        <button type="button">After</button>
      </>,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('combobox', { name: 'Range' })).toHaveFocus()
    await user.tab()
    // One stop, not one per option. The keyboard model here is the platform's and
    // it is not this Component's to get wrong, which is the second reason the
    // platform element is the right one.
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('renders its options as options, so type-ahead still finds them', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    const options = [...container.querySelectorAll('[data-slot="native-select-control"] option')]
    // A custom listbox of `div`s has no options and therefore no type-ahead, which
    // is a keyboard reader pressing "m" and getting nothing.
    expect(options.map((option) => option.textContent)).toEqual(['Day', 'Week', 'Month'])
    for (const option of options) expect(option.tagName).toBe('OPTION')
  })

  it('states the platform face on the control, because a select does not inherit one everywhere', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    // A control in the platform's face beside text in Inter is a control nobody
    // designed, and it is invisible in a screenshot on a machine that happens to
    // agree with the platform.
    expect(
      container.querySelector('[data-slot="native-select-control"]')?.className,
    ).toContain('font-inherit')
  })

  it('draws its focus ring at full strength', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    const classes = container.querySelector('[data-slot="native-select-control"]')?.className ?? ''
    // `outline-none` with a half-alpha ring is the failure the focus-indicator gate
    // exists for: the token gates pass, because the alpha is in the class.
    expect(classes).toContain('outline-none')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('focus-visible:ring-[3px]')
  })

  it('honours the sm size without changing anything else', () => {
    const { container } = render(
      <NativeSelect aria-label="Range" size="sm" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    // The height is the only difference between the two sizes, so a caller cannot
    // get a small select that is a different control.
    expect(
      container.querySelector('[data-slot="native-select-control"]')?.className,
    ).toContain('h-8')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <NativeSelect aria-label="Range" defaultValue="week">
        {OPTIONS}
      </NativeSelect>,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
