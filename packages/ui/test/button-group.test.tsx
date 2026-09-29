import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { ButtonGroup } from '../src/components/ui/button-group'
import { Button } from '../src/components/ui/button'

/**
 * Related controls joined as one, with the focus ring drawn once around them.
 *
 * The claim that is worth testing is the ring, because it is the whole reason the
 * Component exists and it is entirely invisible in a screenshot. Three buttons in
 * a row each drawing their own ring is a reader watching three indicators march
 * across a control that reads as one thing. Here the group takes the ring and the
 * members drop theirs, and that is asserted in both directions: the group carries a
 * full-strength ring, and the members suppress their own.
 *
 * The rest are the join. A double rule between every pair of buttons and a gap at
 * both ends is the reason grouped toolbars look like buttons that happen to be near
 * each other, and the negative margin and the first/last radius are what remove it.
 */
const ALIGN = (
  <ButtonGroup label="Text alignment">
    <Button variant="outline">Left</Button>
    <Button variant="outline">Centre</Button>
    <Button variant="outline">Right</Button>
  </ButtonGroup>
)

describe('the ButtonGroup', () => {
  it('is a named group, so a reader can tell which set of controls they are in', () => {
    render(ALIGN)
    // A row of three buttons is announced as three buttons and nothing else. On a
    // page with four such rows a reader who tabs into one cannot tell which they
    // are in, and the name is the caller's word because Prism does not know what
    // the buttons are for.
    const group = screen.getByRole('group', { name: 'Text alignment' })
    expect(group.tagName).toBe('DIV')
  })

  it('is a group rather than a toolbar, because it arranges actions rather than operating on a document', () => {
    render(ALIGN)
    // A toolbar is a set of controls operating on a document, with its own
    // arrow-key model. A ButtonGroup is a set of related actions, and claiming the
    // toolbar role would promise a keyboard model this Component does not have.
    expect(screen.queryByRole('toolbar')).toBeNull()
  })

  it('draws the focus ring once around itself, at full strength', () => {
    const { container } = render(ALIGN)
    const classes = container.querySelector('[data-slot="button-group"]')?.className ?? ''
    // This is the Component. Without the ring on the group, the three buttons
    // inside draw their own and the reader sees three indicators crossing one
    // control. And the ring is at full strength because a ring at half alpha of
    // this token clears 3:1 against no surface in any pack, which is why
    // `Button` refuses the stock `ring-ring/50` in the first place.
    expect(classes).toContain('focus-within:ring-ring')
    expect(classes).toContain('focus-within:ring-[3px]')
    expect(classes).not.toContain('focus-within:ring-ring/50')
  })

  it('suppresses each member own ring, so one control never carries two indicators', () => {
    const { container } = render(ALIGN)
    const inner = container.querySelector('[data-slot="button-group-inner"]')?.className ?? ''
    // The members are the caller's buttons, which by default draw a full-strength
    // ring of their own. A group that drew its ring and left theirs in place would
    // put a second indicator on the same focus, which is a reader being told two
    // things about one thing.
    expect(inner).toContain('[&>*]:focus-visible:outline-none')
  })

  it('joins the buttons with one rule between each pair rather than two', () => {
    const { container } = render(ALIGN)
    const inner = container.querySelector('[data-slot="button-group-inner"]')?.className ?? ''
    // The negative margin collapses each button's own border onto its neighbour's.
    // A row that keeps every border has a double rule between every pair and a
    // gap at both ends, which is the failure a joined group exists to remove.
    expect(inner).toContain('[&>*+*]:-ms-px')
  })

  it('keeps the outer corners on the first and last members and squares the rest', () => {
    const { container } = render(ALIGN)
    const inner = container.querySelector('[data-slot="button-group-inner"]')?.className ?? ''
    // A group whose middle buttons are also rounded reads as three buttons with
    // their own outlines, which is the thing the group is not.
    expect(inner).toContain('[&>*:first-child]:rounded-s-md')
    expect(inner).toContain('[&>*:last-child]:rounded-e-md')
    expect(inner).toContain('[&>*]:rounded-none')
  })

  it('joins on the other axis when it is vertical, and says so', () => {
    const { container } = render(
      <ButtonGroup label="Zoom" orientation="vertical">
        <Button variant="outline">In</Button>
        <Button variant="outline">Out</Button>
      </ButtonGroup>,
    )
    const group = container.querySelector('[data-slot="button-group"]')
    const inner = container.querySelector('[data-slot="button-group-inner"]')?.className ?? ''
    // The attribute is the styling hook and the geometry has to agree with it: a
    // group that announces itself vertical and joins its members on the inline
    // axis has a double rule down the wrong side of every button.
    expect(group?.getAttribute('data-orientation')).toBe('vertical')
    expect(group?.className).toContain('flex-col')
    expect(inner).toContain('[&>*+*]:-mt-px')
    expect(inner).toContain('[&>*:first-child]:rounded-t-md')
    expect(inner).toContain('[&>*:last-child]:rounded-b-md')
    expect(inner).not.toContain('-ms-px')
  })

  it('composes the caller own buttons rather than a list of its own', async () => {
    const user = userEvent.setup()
    render(
      <ButtonGroup label="Alignment">
        <Button variant="outline">Left</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>,
    )
    // Children, not entries. The group arranges whatever the caller composed and
    // does not decide what a button says or does, which is what lets a group hold
    // Buttons, a caller's own control, or a mix.
    await user.click(screen.getByRole('button', { name: 'Right' }))
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('reaches every member by Tab, because joining them is about the frame and not the order', () => {
    render(ALIGN)
    // A joined group is not a composite widget: each member is a tab stop, in the
    // document's order. The composite model belongs to a `Toolbar` and a
    // `RadioGroup`, and borrowing it here would take a reader's ability to reach
    // the third button directly.
    const stops = screen.getAllByRole('button').map((button) => button.tabIndex)
    expect(stops).toEqual([0, 0, 0])
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(ALIGN)
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
