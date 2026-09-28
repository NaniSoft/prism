import { render, screen } from '@testing-library/react'
import { Star } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { Cta01 } from '../src/blocks/cta-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { Button } from '../src/components/ui/button'
import { CtaLink } from '../src/components/ui/cta-link'

/**
 * A call to action with a destination is a link, and this suite says so through
 * the accessibility tree rather than through the source.
 *
 * The action type has always declared an `href` and the Block never rendered it:
 * the control was a `<button>` with no handler, so the type promised navigation
 * the markup could not perform. Every case here queries by role, which is the
 * same question a screen reader asks, so a regression to a button fails the
 * suite rather than passing a test that only reads the class string.
 */
describe('CtaLink renders a native link', () => {
  it('is announced as a link named by its content', () => {
    render(<CtaLink href="/overview/quickstart">Read the guides</CtaLink>)

    const link = screen.getByRole('link', { name: 'Read the guides' })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/overview/quickstart')
  })

  it('is not announced as a button', () => {
    render(<CtaLink href="/overview/quickstart">Read the guides</CtaLink>)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it.each([
    ['default', 'default'],
    ['default', 'sm'],
    ['default', 'lg'],
    ['outline', 'default'],
    ['outline', 'sm'],
    ['outline', 'lg'],
    ['secondary', 'default'],
    ['secondary', 'sm'],
    ['secondary', 'lg'],
    ['ghost', 'default'],
    ['ghost', 'sm'],
    ['ghost', 'lg'],
  ] as const)(
    'carries the visual weight of the %s button at size %s',
    (variant, size) => {
      // The ticket's one rendered-output claim, asserted rather than claimed: at
      // every shared variant and size the link's class string is a subset of the
      // button's, so nothing but the element and the destination can have moved.
      // A subset rather than an equality because the link drops exactly two
      // button states, `disabled:*` and `aria-invalid:*`, neither of which an
      // anchor has.
      render(
        <>
          <Button variant={variant} size={size}>
            Read the guides
          </Button>
          <CtaLink href="/overview/quickstart" variant={variant} size={size}>
            Read the guides
          </CtaLink>
        </>,
      )

      const button = screen.getByRole('button', { name: 'Read the guides' })
      const link = screen.getByRole('link', { name: 'Read the guides' })
      const buttonClasses = new Set(button.className.split(/\s+/))
      const linkClasses = link.className.split(/\s+/)

      expect(linkClasses.length).toBeGreaterThan(0)
      for (const className of linkClasses) {
        expect(buttonClasses, `${variant}/${size} carries ${className}`).toContain(className)
      }
    },
  )
})

describe('a new-tab CtaLink', () => {
  it('defaults the relationship to the safe pair', () => {
    render(
      <CtaLink href="https://nanisoft.com" newTab>
        Read the handbook
      </CtaLink>,
    )

    const link = screen.getByRole('link', { name: 'Read the handbook' })
    expect(link).toHaveAttribute('target', '_blank')
    // `noopener` severs `window.opener` so the opened document cannot navigate
    // this one; `noreferrer` withholds the referrer. Both are the default rather
    // than a value the caller has to remember.
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('lets a consumer override the relationship', () => {
    render(
      <CtaLink href="https://nanisoft.com" newTab rel="nofollow">
        Read the handbook
      </CtaLink>,
    )

    expect(screen.getByRole('link', { name: 'Read the handbook' })).toHaveAttribute(
      'rel',
      'nofollow',
    )
  })

  it('adds no target and no rel when it does not open a new tab', () => {
    render(<CtaLink href="/overview/quickstart">Read the guides</CtaLink>)

    const link = screen.getByRole('link', { name: 'Read the guides' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })
})

describe('Cta01', () => {
  it('renders its action as a link rather than a button', () => {
    render(
      <Cta01
        title="Ship it"
        action={{ label: 'Read the guides', href: '/overview/quickstart' }}
      />,
    )

    const action = screen.getByRole('link', { name: 'Read the guides' })
    expect(action).toBeInTheDocument()
    expect(action.tagName).toBe('A')
    expect(action).toHaveAttribute('href', '/overview/quickstart')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('carries the safe relationship on a new-tab action', () => {
    render(
      <Cta01
        title="Ship it"
        action={{ label: 'Read the handbook', href: 'https://nanisoft.com', newTab: true }}
      />,
    )

    const action = screen.getByRole('link', { name: 'Read the handbook' })
    expect(action).toHaveAttribute('target', '_blank')
    expect(action).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not infer a new tab from a cross-origin destination', () => {
    // The Block makes no guess about what counts as external. A destination on
    // another origin is a normal same-tab destination until the caller says
    // otherwise, so this asserts the absence of a guess rather than a policy.
    render(
      <Cta01
        title="Ship it"
        action={{ label: 'Read the handbook', href: 'https://nanisoft.com' }}
      />,
    )

    const action = screen.getByRole('link', { name: 'Read the handbook' })
    expect(action).not.toHaveAttribute('target')
    expect(action).not.toHaveAttribute('rel')
  })

  it('offers a slot for a call to action that is not a link', () => {
    render(
      <Cta01
        title="Ship it"
        actionSlot={<button type="button">Start a trial</button>}
      />,
    )

    // An action with no handler navigates nothing, so the Block renders no
    // action of its own and the caller's own control is announced as it is.
    expect(screen.getByRole('button', { name: 'Start a trial' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders the headline alone when no action and no slot are passed', () => {
    render(<Cta01 title="Ship it" />)

    expect(screen.getByRole('heading', { name: 'Ship it' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('FeatureGrid01', () => {
  const features = [
    { icon: Star, title: 'Tokens', body: 'One source for every value.' },
    { icon: Star, title: 'Motion', body: 'State feedback, shortened under reduced motion.' },
  ]

  it('renders an icon tile per feature in the icon variant', () => {
    const { container } = render(<FeatureGrid01 features={features} />)

    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(container.querySelectorAll('svg.lucide-star')).toHaveLength(2)
  })

  it('renders no tile in the bare variant, which is why it asks for no icon', () => {
    // The runtime half of the union's claim. The type half lives in
    // `feature-grid-variant.types.ts`, because a render cannot prove that a
    // missing icon fails to compile.
    const { container } = render(
      <FeatureGrid01
        variant="bare"
        features={features.map(({ title, body }) => ({ title, body }))}
      />,
    )

    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.getByText('Motion')).toBeInTheDocument()
    expect(container.querySelectorAll('svg.lucide-star')).toHaveLength(0)
  })
})
