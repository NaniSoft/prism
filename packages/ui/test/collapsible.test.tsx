import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../src/components/ui/collapsible'

/**
 * A section that shows and hides, in place.
 *
 * The claim under test is that the trigger and the region are wired to each other
 * by the Component rather than by the caller, because the failure is invisible
 * until a reader meets it: a button that says "collapsed" while the panel is
 * open, or a panel no button controls, and both look correct in a screenshot.
 * So the assertions are the wiring itself, read as what a reader is told: the
 * trigger's expanded state, and the trigger's `aria-controls` naming the element
 * the panel actually rendered.
 *
 * The second claim is the one the brief turns on: **a reader who collapses
 * something must be able to find it again.** The trigger is always in the
 * document and always carries its own words, so the way back never depends on the
 * panel that was just closed. And a collapsed panel unmounts by default, because
 * a panel that stayed in the document would put the reader's own find-in-page and
 * a screen reader's rotor in a different world from the one they can see.
 */
const section = (props: Partial<Parameters<typeof Collapsible>[0]> = {}) =>
  render(
    <Collapsible id="billing" {...props}>
      <CollapsibleTrigger>Advanced billing</CollapsibleTrigger>
      <CollapsibleContent>
        <p>Usage is billed per seat, at the end of the month.</p>
      </CollapsibleContent>
    </Collapsible>,
  )

const BODY = 'Usage is billed per seat, at the end of the month.'

describe('the Collapsible', () => {
  it('renders the trigger and nothing of the panel while it is closed', () => {
    section()
    expect(screen.getByRole('button', { name: 'Advanced billing' })).toBeTruthy()
    // The claim, as absence. A closed panel that stayed in the document would
    // give a reader find-in-page and a screen reader's rotor text they cannot
    // see, which is the same world as one where the text does not exist.
    expect(screen.queryByText(BODY)).toBeNull()
  })

  it('reports itself collapsed, from the trigger rather than from a class', () => {
    section()
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })
    // The state a reader is told, not a chevron's rotation. A trigger that turns
    // without the state changing is the defect.
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('points the trigger at the region it controls, from both ends', async () => {
    const user = userEvent.setup()
    section()
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })
    await user.click(trigger)

    // The wiring, read from both ends: the trigger names a control, and the
    // element it names is the one the Component actually rendered. An
    // `aria-controls` pointing at an id nothing carries is the half of this
    // failure that a screenshot cannot show, and it is why the caller writes no
    // ARIA at all.
    const controls = trigger.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(document.getElementById(controls ?? '')?.getAttribute('data-slot')).toBe(
      'collapsible-content',
    )
  })

  it('carries the caller own id onto the group, so a consumer can target it', () => {
    // The claim that `id` is a prop and not a generated one: a section a caller
    // cannot name from their own stylesheet or their own test is a section they
    // have to reach into the DOM to find.
    section()
    expect(document.getElementById('billing')?.getAttribute('data-slot')).toBe('collapsible')
  })

  it('opens and closes on a click, and shows the panel either way', async () => {
    const user = userEvent.setup()
    section()
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })

    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(BODY)).toBeTruthy()

    await user.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText(BODY)).toBeNull()
  })

  it('opens and closes from the keyboard, because the trigger is a real button', async () => {
    const user = userEvent.setup()
    section()
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })

    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    await user.keyboard('{Enter}')
    // A reader who collapsed a section with the keyboard and cannot reopen it
    // with the keyboard has lost the section, which is the exact loss this
    // Component exists to prevent.
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    await user.keyboard(' ')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('leaves the way back in place after the section is collapsed', async () => {
    const user = userEvent.setup()
    section()
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })

    await user.click(trigger)
    expect(screen.getByText(BODY)).toBeTruthy()
    await user.click(trigger)

    // The claim. The trigger keeps its own words and stays in the document and
    // stays focusable, so a reader who closed the section can find it again
    // without their hands and without scrolling to look for it. A design where
    // the header disappears with the panel is a section that cannot be reopened.
    expect(screen.getByRole('button', { name: 'Advanced billing' })).toBe(trigger)
    expect(trigger.textContent).toContain('Advanced billing')
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps several sections open at once, which is what an accordion forbids', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Collapsible id="one">
          <CollapsibleTrigger>Billing</CollapsibleTrigger>
          <CollapsibleContent>
            <p>Per seat, monthly.</p>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible id="two">
          <CollapsibleTrigger>Limits</CollapsibleTrigger>
          <CollapsibleContent>
            <p>Ten thousand runs.</p>
          </CollapsibleContent>
        </Collapsible>
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Billing' }))
    await user.click(screen.getByRole('button', { name: 'Limits' }))

    // The difference between a Collapsible and an Accordion, and the reason a
    // settings page wants this one: a reader comparing two sections cannot do it
    // if opening one closes the other.
    expect(screen.getByText('Per seat, monthly.')).toBeTruthy()
    expect(screen.getByText('Ten thousand runs.')).toBeTruthy()
  })

  it('opens on mount when the caller says so, and reports it as open', () => {
    section({ defaultOpen: true })
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(BODY)).toBeTruthy()
  })

  it('stays shut when the section is disabled, rather than opening and saying it did not', async () => {
    const user = userEvent.setup()
    section({ disabled: true })
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })

    await user.click(trigger)
    // A section that opens while announcing that it is disabled is a control that
    // contradicts itself, and the reader is the one who has to decide which
    // statement to believe.
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText(BODY)).toBeNull()
  })

  it('is controlled when the caller owns the state, and the caller can refuse it', async () => {
    const user = userEvent.setup()
    render(
      <Collapsible open={false} onOpenChange={() => {}}>
        <CollapsibleTrigger>Advanced billing</CollapsibleTrigger>
        <CollapsibleContent>
          <p>{BODY}</p>
        </CollapsibleContent>
      </Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Advanced billing' })

    await user.click(trigger)
    // The caller said no, so nothing opened. A component that opened anyway would
    // make the controlled mode a decoration, and every consumer who counts on it
    // for an unsaved-form guard would be wrong.
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText(BODY)).toBeNull()
  })

  it('keeps a closed panel findable by the browser search when the caller asks', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Advanced billing</CollapsibleTrigger>
        <CollapsibleContent hiddenUntilFound>
          <p>{BODY}</p>
        </CollapsibleContent>
      </Collapsible>,
    )
    // The case a consumer otherwise gets wrong in the direction that loses
    // content: a panel that unmounts cannot be found by the reader's own
    // find-in-page, and the reader who searched for a word in a closed section
    // is told the word is not on the page.
    const content = document.querySelector('[data-slot="collapsible-content"]')
    expect(content).toBeTruthy()
    expect(content?.getAttribute('hidden')).toBe('until-found')
    expect(screen.queryByText(BODY)).toBeTruthy()
  })

  it('has no accessibility violations whether it is open or closed', async () => {
    const user = userEvent.setup()
    section()
    const closed = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(closed.violations).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Advanced billing' }))
    const open = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(open.violations).toEqual([])
  })
})
