import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import axe from 'axe-core'

import { ToggleGroup, ToggleGroupItem } from '../src/components/ui/toggle-group'

/**
 * A set of toggles that behave as one control.
 *
 * The claims under test are the two modes, because the modes are not two looks. A
 * single-selection group is a radiogroup whose members are radios: the choices are
 * mutually exclusive and `aria-checked` is the only attribute that says so. A
 * multiple-selection group is a toolbar of pressed buttons whose arrow keys move
 * focus without choosing. Every one of those is invisible in a screenshot, and a
 * group assembled from standalone Toggles gets all of them wrong, which is why
 * both modes are asserted here rather than described in prose.
 *
 * The silent failures worth naming are the tab stop and the empty group. A
 * radiogroup whose Tab lands on the first option when a different one is checked
 * reports the wrong current value through the tab order alone, and a roving
 * tabindex with nobody owning the pointer position leaves a group a keyboard
 * cannot enter at all.
 */
const SINGLE = (
  <ToggleGroup defaultValue={['week']} aria-label="Range">
    <ToggleGroupItem value="day">Day</ToggleGroupItem>
    <ToggleGroupItem value="week">Week</ToggleGroupItem>
    <ToggleGroupItem value="month">Month</ToggleGroupItem>
  </ToggleGroup>
)

const MULTIPLE = (
  <ToggleGroup selectionMode="multiple" defaultValue={['grid']} aria-label="Overlays">
    <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
    <ToggleGroupItem value="axes">Axes</ToggleGroupItem>
    <ToggleGroupItem value="labels">Labels</ToggleGroupItem>
  </ToggleGroup>
)

describe('the ToggleGroup', () => {
  const tabs = (container: HTMLElement) =>
    [...container.querySelectorAll('[data-slot="toggle-group-item"]')].map(
      (item) => (item as HTMLElement).tabIndex,
    )

  it('is a radiogroup in single mode, because one answer is one question', () => {
    render(SINGLE)
    // Three independent toggles say three things can be on at once, which is not
    // true of a range, and leaves the reader to infer the constraint. The
    // radiogroup is the role that states the constraint, and it is set by the
    // Component rather than inherited from whatever the primitive defaults to.
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeTruthy()
  })

  it('makes its members radios carrying aria-checked in single mode', () => {
    render(SINGLE)
    // `aria-pressed` on a button inside a set of mutually exclusive choices says
    // each choice is independent, which is the claim single mode is denying. The
    // state attribute is the whole difference and it is asserted in both
    // directions so a swap cannot pass.
    const week = screen.getByRole('radio', { name: 'Week' })
    const day = screen.getByRole('radio', { name: 'Day' })
    expect(week).toHaveAttribute('aria-checked', 'true')
    expect(day).toHaveAttribute('aria-checked', 'false')
    expect(day).not.toHaveAttribute('aria-pressed')
    expect(week).not.toHaveAttribute('aria-pressed')
  })

  it('is a toolbar of pressed buttons in multiple mode, not a second radiogroup', () => {
    render(MULTIPLE)
    // A toolbar is the role that says "a set of controls operated with the arrow
    // keys" and it is the role that carries an orientation, which a bare `group`
    // does not. A radiogroup here would assert that at most one may be on, which
    // is precisely the claim the caller denied by choosing this mode.
    expect(screen.getByRole('toolbar', { name: 'Overlays' })).toBeTruthy()
    expect(screen.queryByRole('radiogroup', { name: 'Overlays' })).toBeNull()
  })

  it('keeps the pressed state in aria-pressed in multiple mode, because the attribute is the fact', async () => {
    const user = userEvent.setup()
    render(MULTIPLE)
    const grid = screen.getByRole('button', { name: 'Grid' })
    const axes = screen.getByRole('button', { name: 'Axes' })
    expect(grid).toHaveAttribute('aria-pressed', 'true')
    await user.click(axes)
    // Both on at once, which is the claim multiple mode makes and single mode
    // refuses. Asserted through the attribute rather than through the surface, so
    // it survives a reader who cannot see the tint.
    expect(axes).toHaveAttribute('aria-pressed', 'true')
    expect(grid).toHaveAttribute('aria-pressed', 'true')
  })

  it('presses one member at a time in single mode', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup defaultValue={['week']} aria-label="Range" onValueChange={onValueChange}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Range' })
    await user.click(within(group).getByRole('radio', { name: 'Month' }))
    // The whole set comes back rather than a difference, so a caller restoring
    // state does not have to know which member it was holding.
    expect(onValueChange).toHaveBeenLastCalledWith(['month'])
    expect(within(group).getByRole('radio', { name: 'Day' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(within(group).getByRole('radio', { name: 'Week' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('empties a single-mode group when the answer is pressed again', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup defaultValue={['week']} aria-label="Range" onValueChange={onValueChange}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    )
    await user.click(screen.getByRole('radio', { name: 'Week' }))
    // "No answer" is a real state of a question that has an optional one, and it
    // has to be reachable. A radiogroup that refuses to be emptied is a group
    // where the reader is stuck with the first answer they were ever given.
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('does not move when the caller owns the pressed set', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup value={['day']} aria-label="Range" onValueChange={onValueChange}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    )
    const week = screen.getByRole('radio', { name: 'Week' })
    await user.click(week)
    // A controlled group reports the request and waits. Moving its own attributes
    // anyway is the defect a controlled control has when it keeps a copy, because
    // the caller's state and the rendered state then disagree.
    expect(onValueChange).toHaveBeenCalledWith(['week'])
    expect(week).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true')
  })

  it('lands Tab on the member that is already pressed, so a reader arrives at the answer', () => {
    const { container } = render(SINGLE)
    // The pressed member owns the tab stop, not the first member. A reader who
    // tabs into a range of seven days and lands on "Day" when the range is a month
    // has been told the wrong current value by the tab order alone.
    expect(tabs(container)).toEqual([-1, 0, -1])
  })

  it('lands Tab on the first member when nothing is pressed, rather than on no member', () => {
    const { container } = render(
      <ToggleGroup defaultValue={[]} aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    )
    // A group whose every member is out of the tab order is a group a keyboard
    // cannot enter at all, which is the failure a roving tabindex has when nobody
    // owns the pointer position. The tab stop is resolved during the first render
    // rather than from the DOM, because a query of the root ref returns nothing on
    // that render and the group would have no tab stop on its first paint.
    expect(tabs(container)).toEqual([0, -1])
  })

  it('is one Tab stop, so Tab leaves the group rather than walking its members', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Before</button>
        {SINGLE}
        <button type="button">After</button>
      </>,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus()
    await user.tab()
    // Into the group, on the pressed member.
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveFocus()
    await user.tab()
    // And out of it in one step, which is the whole point of the composite model.
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('moves the tab stop with the reader once they have moved it', async () => {
    const user = userEvent.setup()
    const { container } = render(SINGLE)
    screen.getByRole('radio', { name: 'Week' }).focus()
    await user.keyboard('{ArrowRight}')
    // A reader who arrows across the group expects to leave where they are, and a
    // stop recomputed from the pressed value on every render is a stop that
    // follows the pressed value instead of the reader. Nothing was pressed by
    // arrowing, so the pressed member is still "week".
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveFocus()
    expect(tabs(container)).toEqual([-1, -1, 0])
  })

  it('does not press a member when the arrow keys pass over it in multiple mode', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ToggleGroup
        selectionMode="multiple"
        defaultValue={['grid']}
        aria-label="Overlays"
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="axes">Axes</ToggleGroupItem>
      </ToggleGroup>,
    )
    screen.getByRole('button', { name: 'Grid' }).focus()
    await user.keyboard('{ArrowRight}')
    // Arrowing past a member in a toolbar of independent toggles must not turn it
    // on. The single-mode case selects as it moves, which is the difference
    // between the two modes that a screenshot cannot show.
    expect(screen.getByRole('button', { name: 'Axes' })).toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('wraps at the end of the group rather than stopping', async () => {
    const user = userEvent.setup()
    render(SINGLE)
    screen.getByRole('radio', { name: 'Month' }).focus()
    await user.keyboard('{ArrowRight}')
    // A group that stops at the end makes a reader who overshot press Left to come
    // back, which is one extra keystroke every time they do.
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveFocus()
  })

  it('skips a disabled member when the arrows move', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup defaultValue={['day']} aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week" disabled>
          Week
        </ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>,
    )
    screen.getByRole('radio', { name: 'Day' }).focus()
    await user.keyboard('{ArrowRight}')
    // A member that ignores interaction is skipped rather than focused and doing
    // nothing, which is the same rule `Tree` follows for a label that is not a
    // destination.
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveFocus()
  })

  it('uses the vertical arrows in a vertical group, and says so', () => {
    const { container } = render(
      <ToggleGroup orientation="vertical" defaultValue={['day']} aria-label="Zoom">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    )
    // The orientation is what tells a screen reader which arrow keys move inside
    // the group, and it is stated rather than left to the layout: a horizontal
    // group announced as vertical moves the wrong way under the arrow keys.
    expect(screen.getByRole('radiogroup', { name: 'Zoom' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.className).toContain('flex-col')
  })

  it('moves with Up and Down in a vertical group, and not with Left and Right', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup orientation="vertical" defaultValue={['day']} aria-label="Zoom">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    )
    screen.getByRole('radio', { name: 'Day' }).focus()
    await user.keyboard('{ArrowLeft}')
    // Left and Right are not this group's model, so they do nothing rather than
    // moving sideways through a column.
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveFocus()
  })

  it('records the selection mode on the element, so a caller can target its own styles', () => {
    const { container } = render(
      <>
        {SINGLE}
        {MULTIPLE}
      </>,
    )
    const modes = [...container.querySelectorAll('[data-slot="toggle-group"]')].map((group) =>
      group.getAttribute('data-selection-mode'),
    )
    // The role is the semantic and this is the styling hook beside it. Two groups
    // that differ in role and look the same are otherwise impossible to tell apart
    // in a stylesheet.
    expect(modes).toEqual(['single', 'multiple'])
  })

  it('names the group, because a group with no name is a group a reader cannot place', () => {
    render(SINGLE)
    // The name is a prop, and it is required, for the same reason every region's
    // name is a prop in this package: a screen reader cannot tell two toolbars
    // apart and Prism does not know what either is called.
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeTruthy()
  })

  it('draws each member focus ring at full strength', () => {
    const { container } = render(SINGLE)
    const classes = container.querySelector('[data-slot="toggle-group-item"]')?.className ?? ''
    // `outline-none` with a half-alpha ring is the silent failure the
    // focus-indicator gate exists for: every token gate still passes, because the
    // alpha is in the class and not in the token.
    expect(classes).toContain('outline-none')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('focus-visible:ring-[3px]')
    expect(classes).not.toContain('focus-visible:ring-ring/50')
  })

  it('marks the pressed member with an attribute as well as a surface', async () => {
    const user = userEvent.setup()
    const { container } = render(MULTIPLE)
    await user.click(screen.getByRole('button', { name: 'Axes' }))
    // The attribute is the fact and the tint is the reminder, which is the order
    // the whole package keeps. Asserted on the member rather than on the group,
    // because a `data-pressed` on the group would say the group is pressed.
    const pressed = [...container.querySelectorAll('[data-slot="toggle-group-item"][data-pressed]')]
    expect(pressed).toHaveLength(2)
  })

  it('has no accessibility violations in either mode', async () => {
    const { container } = render(
      <>
        {SINGLE}
        {MULTIPLE}
      </>,
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
