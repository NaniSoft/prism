import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import axe from 'axe-core'

import { ScrollArea } from '../src/components/ui/scroll-area'

/**
 * A scrollable region whose scrollbar belongs to this design system.
 *
 * The claim that matters most is the one a screenshot cannot check at all: the
 * region is still a real scroll container in the document, so the browser scrolls
 * it and the keyboard reaches it. A custom scrollbar built on a transformed div
 * looks identical in a screenshot and has no scroll position, which means no
 * keyboard, no scroll-into-view and nothing for a screen reader to announce.
 *
 * The rest are the states nobody draws on purpose. A region with nothing to scroll
 * must draw no bar, because a bar beside content that does not move is a claim
 * that there is something past the edge. A region with two axes must be able to
 * say it only scrolls on one. And every ink on the bar has to be a token, because
 * a scrollbar coloured with a value belongs to one surface and is invisible on
 * the next.
 */
const FILLER = (
  <div className="flex flex-col">
    {Array.from({ length: 40 }, (_, index) => (
      <div key={index}>Row {index + 1}</div>
    ))}
  </div>
)

/**
 * jsdom has no layout, so every element reports zero for both its box and its
 * content, and the primitive concludes that nothing overflows. That conclusion
 * is correct for what jsdom knows and useless for a test about overflow, so the
 * two measurements are stubbed for the duration of the run. Restored afterwards,
 * because a stub left installed is a measurement every later test inherits.
 */
const layout = (overflows: boolean) => {
  const box = 200
  const content = overflows ? 800 : 100
  const define = (name: string, value: number) => {
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get: () => value,
    })
  }
  define('clientHeight', box)
  define('clientWidth', box)
  define('scrollHeight', content)
  define('scrollWidth', content)
}

/**
 * jsdom implements no Web Animations API, and the primitive asks the viewport for
 * its animations so it can re-measure once a transition has settled. An empty
 * list is the honest answer for an environment with no animations at all, and it
 * is the one the primitive's own code already handles.
 */
if (typeof Element.prototype.getAnimations !== 'function') {
  Element.prototype.getAnimations = function getAnimations() {
    return [] as unknown as Animation[]
  }
}

afterEach(() => {
  for (const name of ['clientHeight', 'clientWidth', 'scrollHeight', 'scrollWidth']) {
    Reflect.deleteProperty(HTMLElement.prototype, name)
  }
})

describe('the ScrollArea', () => {
  const viewport = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
  const bars = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>('[data-slot="scroll-area-scrollbar"]'),
  ]
  const thumbs = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>('[data-slot="scroll-area-thumb"]'),
  ]

  it('is a real scroll container, so the browser scrolls it and the keyboard reaches it', async () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Run output" className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    // The overflow is measured after mount rather than read from the first render,
    // because a server render has no box to measure and the tab stop is a
    // consequence of the measurement rather than a prop.
    await waitFor(() => expect(viewport(container)?.getAttribute('tabindex')).toBe('0'))
    const region = viewport(container)
    // A transform-on-a-div scroll area has no scrollTop and no tab stop, and both
    // are what a keyboard reader and a scroll-into-view need. The native
    // `overflow: scroll` is what keeps the arrow keys, Page Up, Page Down, Home
    // and End working, because the region is a scroll container and not a picture
    // of one.
    expect(region?.style.overflow).toBe('scroll')
  })

  it('takes the tab stop back when there is nothing to scroll', () => {
    layout(false)
    const { container } = render(
      <ScrollArea label="Run output" className="h-32">
        <p>Short</p>
      </ScrollArea>,
    )
    // A scrollable region is supposed to be reachable by Tab, and this one is only
    // reachable while it can actually be scrolled. A permanently focusable region
    // is a Tab stop that does nothing when the reader presses an arrow key in it.
    expect(viewport(container)?.getAttribute('tabindex')).toBe('-1')
  })

  it('names the scrollable region, so tabbing into it says what is in it', () => {
    layout(true)
    render(
      <ScrollArea label="Run output" className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    // The name is on the scrollable region rather than on the bar, because the bar
    // is a control over the region: a name there would name the control and leave
    // the content anonymous.
    expect(screen.getByRole('group', { name: 'Run output' })).toBeTruthy()
  })

  it('draws no scrollbar at all for a region with nothing to scroll', () => {
    layout(false)
    const { container } = render(
      <ScrollArea label="Run output" className="h-32">
        <p>Short</p>
      </ScrollArea>,
    )
    // The default is absence rather than a disabled bar or a faint one. A bar
    // beside a region that does not move is a claim that there is something past
    // the edge, and a reader told that twice stops believing the third bar.
    expect(bars(container)).toEqual([])
  })

  it('keeps the bar mounted on request, for a region that has not filled yet', () => {
    layout(false)
    const { container } = render(
      <ScrollArea label="Run output" keepMounted className="h-32">
        <p>Short</p>
      </ScrollArea>,
    )
    // The one case where a bar with nothing past it is honest: a region that is
    // about to receive content and should show the affordance before it arrives.
    expect(bars(container)).toHaveLength(2)
    expect(thumbs(container)).toHaveLength(2)
  })

  it('draws a bar for each axis it is asked for, and omits the one it is not', () => {
    layout(true)
    const vertical = render(
      <ScrollArea label="Output" orientation="vertical" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    const horizontal = render(
      <ScrollArea label="Output" orientation="horizontal" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    expect(bars(vertical.container).map((bar) => bar.getAttribute('data-orientation'))).toEqual([
      'vertical',
    ])
    expect(bars(horizontal.container).map((bar) => bar.getAttribute('data-orientation'))).toEqual([
      'horizontal',
    ])
  })

  it('draws both bars by default, because an unasked-for axis is still an axis', () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Output" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    expect(bars(container).map((bar) => bar.getAttribute('data-orientation'))).toEqual([
      'vertical',
      'horizontal',
    ])
  })

  it('gives every bar a thumb, because a track a reader cannot drag is a decoration', () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Output" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    expect(thumbs(container)).toHaveLength(2)
  })

  it('colours the bar and the thumb from tokens, so a pack boundary moves both', () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Output" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    const thumb = thumbs(container)[0]
    // A thumb painted with a resolved value belongs to one surface and is
    // invisible on the next. `bg-border` at rest and the full muted ink on hover
    // and during a scroll is two contract roles and no third value, and it is why
    // the bar reads on a light card and on a dark one from the same string.
    expect(thumb?.className).toContain('bg-border')
    expect(thumb?.className).toContain('data-[hovering]:bg-muted-foreground')
    expect(thumb?.className).toContain('data-[scrolling]:bg-muted-foreground')
    expect(thumb?.className).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    expect(thumb?.className).not.toMatch(/bg-(?:slate|gray|zinc|neutral|stone)-/)
  })

  it('reveals the vertical bar on its own overflow state and the horizontal on its own', () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Output" keepMounted className="h-32">
        {FILLER}
      </ScrollArea>,
    )
    const [vertical, horizontal] = bars(container)
    // Each bar answers to its own axis rather than to a shared one, so a region
    // that overflows vertically does not show a horizontal bar for an axis with
    // nothing on it.
    expect(vertical?.className).toContain('data-[has-overflow-y]:opacity-100')
    expect(vertical?.className).not.toContain('data-[has-overflow-x]')
    expect(horizontal?.className).toContain('data-[has-overflow-x]:opacity-100')
    expect(horizontal?.className).not.toContain('data-[has-overflow-y]')
  })

  it('has no accessibility violations when it is on the page', async () => {
    layout(true)
    const { container } = render(
      <ScrollArea label="Run output" className="h-32">
        {FILLER}
      </ScrollArea>,
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
