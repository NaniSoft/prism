import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../src/components/ui/hover-card'

/**
 * A preview of a destination, shown when the reader rests on a link.
 *
 * The claim under test is the one the Component is built around: **the card can
 * never be the only route to what it shows.** That is what makes the delay safe.
 * If the card is a preview of a place the trigger is already a link to, then a
 * delay that is wrong for this reader costs them a preview and nothing else, so
 * there is no reason to set the delay to zero to avoid hurting anyone. The
 * assertions are the trigger's own tag and href, because that is the fact a
 * consumer would break by turning the trigger into a `span`, and a screenshot
 * would look identical afterwards.
 *
 * The second claim is that the delay is a decision and both halves of it are
 * props. A card with no open delay opens as the pointer crosses a line of text,
 * and a card with no close delay vanishes in the gap between the trigger and the
 * card, so the reader who did everything right is the one who gets nothing. Both
 * are tested by driving the trigger with a real pointer and a real keyboard.
 */
const card = (props: { delay?: number; closeDelay?: number } = {}) =>
  render(
    <p className="max-w-measure-narrow text-sm">
      The principles of good{' '}
      <HoverCard>
        <HoverCardTrigger href="/foundation/typography" {...props}>
          typography
        </HoverCardTrigger>
        <HoverCardContent>
          <p>A system of arranging type so that written language stays clear.</p>
        </HoverCardContent>
      </HoverCard>{' '}
      are older than the screen.
    </p>,
  )

/** The one sentence the card previews, and the one the destination carries. */
const PREVIEW = 'A system of arranging type so that written language stays clear.'

describe('the Hover card', () => {
  // Queried from the document, because the card is portalled to the body.
  const scope = (): HTMLElement => document.body

  it('renders no card until the reader has shown intent', () => {
    card()
    // The claim, and the reason the delay is allowed to be long: a reader who
    // never triggers the card still has the trigger, so nothing is lost.
    expect(screen.queryByText(PREVIEW)).toBeNull()
    expect(screen.getByRole('link', { name: 'typography' })).toBeTruthy()
  })

  it('is anchored to a link, so the destination is reachable without the card', () => {
    card()
    const trigger = screen.getByRole('link', { name: 'typography' })

    // The claim, asserted as the element itself rather than as a role. A `span`
    // with `role="link"` would pass a role assertion and fail this one, and the
    // reader who middle-clicks it gets nothing.
    expect(trigger.tagName).toBe('A')
    expect(trigger.getAttribute('href')).toBe('/foundation/typography')
  })

  it('opens once the pointer has rested past the delay, and not before', async () => {
    const user = userEvent.setup()
    // A delay long enough that a test which did not wait would see nothing, so
    // the assertion is that the card is absent early and present after.
    card({ delay: 40 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.hover(trigger)
    // The pointer crossing a line of text is not intent. A card that opened here
    // would make a page of links a page of flashes.
    expect(screen.queryByText(PREVIEW)).toBeNull()

    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })
  })

  it('takes a delay of zero as an answer, rather than insisting on its own', async () => {
    const user = userEvent.setup()
    card({ delay: 0 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.hover(trigger)
    // The delay is a decision about what counts as intent, and a reader whose
    // hardware reports a rest as a hover has a different answer. A Component that
    // would not take zero is a Component that has decided for them.
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })
  })

  it('opens on focus as well as on hover, so a keyboard reader is not a second class', async () => {
    const user = userEvent.setup()
    card({ delay: 0 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.tab()
    expect(document.activeElement).toBe(trigger)

    // A reader with a pointer and a reader with a keyboard are both readers. A
    // card that only answers hover is a card half its audience cannot see, and
    // half is worse than none because the other half believes they have seen it.
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })
  })

  it('keeps the card open across the gap, so the reader who meant it gets it', async () => {
    const user = userEvent.setup()
    card({ delay: 0, closeDelay: 400 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })

    // Leaving the trigger is the first half of moving toward the card, and the
    // gap between the two is where a zero close delay closes it. The reader who
    // did everything right is the one a zero close delay punishes.
    await user.unhover(trigger)
    expect(screen.queryByText(PREVIEW)).toBeTruthy()
  })

  it('closes on Escape, because a card a reader cannot dismiss is a card they cannot refuse', async () => {
    const user = userEvent.setup()
    card({ delay: 0 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText(PREVIEW)).toBeNull()
    })
  })

  it('names nothing the reader has to read twice, and leaves the link navigable', async () => {
    const user = userEvent.setup()
    card({ delay: 0 })
    const trigger = screen.getByRole('link', { name: 'typography' })

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })

    // The card is not a dialog and takes no focus, because a screen reader is
    // already moving through the link text and a surface that interrupted that
    // to read a summary of it would be a worse version of the same information.
    // The link is still the thing the reader is on, and still a link.
    expect(document.activeElement).not.toBe(trigger)
    expect(screen.getByRole('link', { name: 'typography' })).toBe(trigger)
    expect(trigger.getAttribute('href')).toBe('/foundation/typography')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    card({ delay: 0 })
    await user.hover(screen.getByRole('link', { name: 'typography' }))
    await waitFor(() => {
      expect(screen.getByText(PREVIEW)).toBeTruthy()
    })

    const results = await axe.run(scope(), {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
