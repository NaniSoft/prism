/**
 * Every action a Block renders is something a reader can act on.
 *
 * **The defect this was written for, in five Blocks and two shapes.** A Block ships
 * no behaviour, so a `<Button>` it renders cannot be given a handler: this is a
 * server Component unless it says `'use client'`, and a server Component cannot
 * receive an `onClick` at all. A `Button` with nothing attached is therefore
 * focusable, announced as a button, and activating it does nothing. Five Blocks
 * shipped one, every one of them at the place a reader looks first:
 *
 * - `About01` and `Showcase01` declared an action union whose `href`-less arm
 *   rendered a `Button`, and each JSDoc called it "inert by design" and defended
 *   that as a Block shipping no behaviour, which is true and is not an answer.
 * - `PageHeader01` declared `actions` with no `href` member at all, so every value
 *   the type could express produced a dead button, at the top of a screen.
 * - `Pricing01` declared a required `cta` string per plan and rendered it as a
 *   `Button`, on the card a reader was about to decide on.
 * - `Waitlist01` declared the accessible name and the state of a copy control and
 *   rendered a `Button` with no handler beside the code it was labelled as copying.
 *
 * **The type now has a destination arm and a slot arm on every one of them**, and
 * this file holds the rendering half. The half a render cannot see, which is that
 * the mistakes no longer compile, is in `block-action.types.ts`.
 *
 * **Why this file covers five Blocks rather than one.** The five spell the shape
 * again rather than sharing it, and each says why: a shared type would make
 * `blocks/hero-01` a dependency of `blocks/pricing-01`, so a consumer installing a
 * pricing table would be made to resolve a marketing hero to get it. Spelled five
 * times it can drift five times, so all five are asserted here and
 * `scripts/check-block-controls.mjs` is what stops the sixth from shipping the dead
 * arm at all.
 *
 * **What jsdom cannot answer, said once.** There is no CSS engine and no
 * accessibility tree in this lane, so the class-string assertions below hold that a
 * weight was applied rather than that a reader can see it. The role and name queries
 * are the part of the accessibility claim jsdom can hold, and
 * `apps/site/e2e/display.spec.ts` over a real browser is where the rest is checked.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { About01 } from '../src/blocks/about-01'
import { PageHeader01 } from '../src/blocks/page-header-01'
import { Pricing01, type Plan, type PricingAction } from '../src/blocks/pricing-01'
import { Showcase01 } from '../src/blocks/showcase-01'
import { Waitlist01 } from '../src/blocks/waitlist-01'

/**
 * The five render surfaces, named so one assertion body can hold all of them.
 *
 * A factory rather than a shared fixture because the five take different required
 * props, and a fixture carrying five optional ones would read as though the five
 * Blocks took the same shape.
 */
const surfaces = [
  {
    name: 'About01',
    action: (action: { label: string; href: string; newTab?: boolean }) => (
      <About01
        title="What this is"
        statement="One sentence a reader can repeat."
        principles={[{ id: 'one', title: 'One principle', body: 'A sentence about it.' }]}
        actions={[action]}
      />
    ),
  },
  {
    name: 'PageHeader01',
    action: (action: { label: string; href: string; newTab?: boolean }) => (
      <PageHeader01 title="Overview" actions={[action]} />
    ),
  },
  {
    name: 'Showcase01',
    action: (action: { label: string; href: string; newTab?: boolean }) => (
      <Showcase01
        name="Market capture"
        facts={[{ label: 'One figure', value: 'A sentence about it.' }]}
        actions={[action]}
      />
    ),
  },
] as const

const link = { label: 'Read the architecture', href: '/architecture' }

describe.each(surfaces)('$name actions are the element the caller asked for', ({ action }) => {
  it('an action with a destination renders an anchor that carries it', () => {
    render(action(link))
    expect(screen.getByRole('link', { name: /Read the architecture/ })).toHaveAttribute(
      'href',
      '/architecture',
    )
  })

  it('renders no button of its own, because a Block cannot wire one to anything', () => {
    render(action(link))
    // The negative half, and it is the half that matters: a test asserting only the
    // control it expected would pass on the defect this file is about.
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('honours newTab on the link arm, with the matching rel', () => {
    render(action({ label: 'Handbook', href: 'https://nanisoft.com', newTab: true }))
    const cta = screen.getByRole('link', { name: /Handbook/ })
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('a caller control renders as itself, on every Block that takes one', () => {
  /**
   * The row each Block draws its actions in, so the slot assertions can hold that the
   * node landed in the Block's own arrangement rather than somewhere the Block forgot.
   */
  const slots = [
    {
      name: 'About01',
      slot: (
        <About01
          title="What this is"
          statement="One sentence a reader can repeat."
          principles={[{ id: 'one', title: 'One principle', body: 'A sentence about it.' }]}
          actions={[{ slot: <button type="button">Resume</button> }]}
        />
      ),
      row: '[data-slot="about-01-actions"]',
    },
    {
      name: 'PageHeader01',
      slot: (
        <PageHeader01
          title="Overview"
          actions={[{ slot: <button type="button">Resume</button> }]}
        />
      ),
      // The action row is not given a `data-slot` of its own, so it is found as the
      // header's flex row. Asserting the nearest landmark is the honest version of
      // "it landed in the header".
      row: 'header',
    },
    {
      name: 'Showcase01',
      slot: (
        <Showcase01
          name="Market capture"
          facts={[{ label: 'One figure', value: 'A sentence about it.' }]}
          actions={[{ slot: <button type="button">Resume</button> }]}
        />
      ),
      row: '[data-slot="showcase-01-actions"]',
    },
  ] as const

  it.each(slots)('$name announces the caller control by its own words and enables it', ({ slot }) => {
    render(slot)
    // The Block places the node and adds nothing to it, so what the caller passed is
    // what a reader reaches, named and enabled by the caller's own words.
    expect(screen.getByRole('button', { name: 'Resume' })).toBeEnabled()
  })

  it.each(slots)('$name adds no class to a caller control, because this package has no override path', ({ slot, row }) => {
    render(slot)
    const control = screen.getByRole('button', { name: 'Resume' })
    // A class the Block adds to a node it does not render is a style the caller cannot
    // see and cannot remove. The class list is empty because the Block added nothing.
    expect(control.className).toBe('')
    expect(control.closest(row)).not.toBeNull()
  })
})

describe('Pricing01', () => {
  /**
   * One plan, named and keyed by the caller.
   *
   * `Pricing01` keys its cards on `plan.id`, so a fixture that reused one `id` across
   * three plans would draw React's duplicate-key warning and the assertions below
   * would be reading a list the renderer had already been told is ambiguous. The
   * helper derives the id from the name so a caller cannot pass a name without one.
   *
   * The action is typed as `PricingAction` rather than `unknown`, because a fixture
   * that typed its own argument as `unknown` would prove nothing about the union: it
   * would compile whatever the Block declared, which is the mistake this file exists
   * to catch.
   */
  const plan = (name: string, action: PricingAction): Plan => ({
    id: name.toLowerCase(),
    name,
    price: '$24',
    period: ' / month',
    features: ['Unlimited projects'],
    action,
  })

  it('a plan control with a destination renders an anchor that carries it', () => {
    render(
      <Pricing01 plans={[plan('Team', { label: 'Choose Team', href: '/signup?plan=team' })]} />,
    )
    expect(screen.getByRole('link', { name: /Choose Team/ })).toHaveAttribute(
      'href',
      '/signup?plan=team',
    )
  })

  it('renders no button of its own on any plan', () => {
    // Three plans, and the featured one is the one that used to draw a filled Button,
    // so all three are asserted rather than only the featured card.
    render(
      <Pricing01
        plans={[
          plan('Starter', { label: 'Start', href: '/signup' }),
          { ...plan('Team', { label: 'Choose Team', href: '/signup?plan=team' }), featured: true },
          plan('Business', { label: 'Contact sales', href: '/contact' }),
        ]}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps the featured plan filled and the rest outlined, so the recommendation still reads', () => {
    const { container } = render(
      <Pricing01
        plans={[
          plan('Starter', { label: 'Start', href: '/signup' }),
          { ...plan('Team', { label: 'Choose Team', href: '/signup?plan=team' }), featured: true },
        ]}
      />,
    )
    const ctas = container.querySelectorAll('a')
    expect(ctas[0]?.className).not.toContain('bg-primary')
    expect(ctas[1]?.className).toContain('bg-primary')
  })

  it('draws the caller control on a slot plan and no control of its own beside it', () => {
    render(
      <Pricing01
        plans={[
          plan('Starter', { label: 'Start', href: '/signup' }),
          { ...plan('Team', { slot: <button type="button">Open checkout</button> }), featured: true },
        ]}
      />,
    )
    // The one button a reader reaches is the caller's, and it is named by the caller's
    // words. The plan beside it is still a link, so the row is not all-or-nothing.
    const control = screen.getByRole('button', { name: 'Open checkout' })
    expect(control).toBeEnabled()
    expect(control.className).toBe('')
    expect(screen.getByRole('link', { name: /Start/ })).toBeInTheDocument()
  })
})

describe('Waitlist01', () => {
  const base = {
    title: 'Join the queue',
    label: 'Email address',
    consent: 'One line saying what happens to the address.',
    submitLabel: 'Take a place',
    onSubmit: async () => ({ ok: true, position: 1205 }),
  }

  it('draws the caller control beside the code and no button of its own', () => {
    render(
      <Waitlist01
        {...base}
        referral={{
          value: 'NEXUS-4KD2-1190',
          label: 'Your referral code',
          copyControl: <button type="button">Copy code</button>,
        }}
      />,
    )
    // The one button beside the field is the caller's. Before the repair this Block
    // rendered its own `<Button>` labelled from a prop and with no handler, so the
    // control a reader reached beside the code did nothing at all.
    const control = screen.getByRole('button', { name: 'Copy code' })
    expect(control).toBeEnabled()
    expect(control.className).toBe('')
    expect(screen.getByLabelText('Your referral code')).toHaveValue('NEXUS-4KD2-1190')
  })

  it('and the submit control is the form submission, which is a behaviour of its own', () => {
    render(<Waitlist01 {...base} />)
    expect(screen.getByRole('button', { name: 'Take a place' })).toHaveAttribute('type', 'submit')
    // With no `referral` there is no second control, which is the honest state for a
    // closed list rather than a copy button for a code that does not exist.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
