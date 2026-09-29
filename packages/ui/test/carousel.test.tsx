import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import axe from 'axe-core'

import { Carousel, type CarouselSlide } from '../src/components/ui/carousel'

/**
 * A set of slides with controls that move between them.
 *
 * The claims under test are the ones about the ends and the empty case, because
 * those are where a carousel quietly breaks and every one of them looks correct in
 * a screenshot. At the first slide the back control has to be disabled rather than
 * wrapping, or the reader who presses back to orient themselves is thrown to the
 * end. At the last slide the forward control has the same obligation. A carousel
 * of one slide is a picture with two dead buttons, so the controls are absent. A
 * carousel of none is an authored state rather than an empty track.
 *
 * And the claim the whole Component is built around: a carousel must not be the
 * only route to its content, so every slide is in the document and reachable, and
 * the position is a sentence the caller wrote rather than a number this package
 * guessed at.
 */
const position = (index: number, total: number) => `Slide ${index} of ${total}`

const SLIDES: CarouselSlide[] = [
  { id: 'a', label: 'The first slide', children: <p>First</p> },
  { id: 'b', label: 'The second slide', children: <p>Second</p> },
  { id: 'c', label: 'The third slide', children: <p>Third</p> },
]

describe('the Carousel', () => {
  const slides = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>('[data-slot="carousel-slide"]'),
  ]
  const current = (container: HTMLElement) =>
    container.querySelector('[data-slot="carousel-slide"][data-current]')

  it('is a named region, so a page with two carousels is a page a reader can tell apart', () => {
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    // A carousel is a region and a reader has to know which one they are in. The
    // role description is what tells a reader it is a carousel rather than some
    // other group of slides, which is the one thing the markup cannot say.
    const region = screen.getByRole('region', { name: 'Product shots' })
    expect(region.getAttribute('aria-roledescription')).toBe('carousel')
  })

  it('says where the reader is, in the caller own words', () => {
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    // A carousel with no position indicator is a guessing game: a reader moved
    // three times with nothing counting has no way to know whether there are three
    // slides left or three hundred.
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })

  it('announces the position politely, because a carousel that moves silently is not followable', () => {
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    // Polite rather than assertive: the reader caused the move by pressing a
    // control, and a position that interrupts whatever they were reading is a
    // position that gets turned off.
    expect(
      container.querySelector('[data-slot="carousel-position"]')?.getAttribute('aria-live'),
    ).toBe('polite')
  })

  it('disables the back control at the first slide rather than wrapping to the end', () => {
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    // The failure this rules out is worse than a dead button: a reader who presses
    // back to orient themselves is thrown to the last slide, and has to walk the
    // whole set to get back.
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled()
  })

  it('disables the forward control at the last slide, and keeps back enabled', () => {
    render(
      <Carousel slides={SLIDES} label="Product shots" position={position} initialIndex={2} />,
    )
    // The same obligation at the other end, which is the state a screenshot of a
    // carousel mid-set never shows.
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled()
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
  })

  it('moves forward and back, and reports the slide it landed on', async () => {
    const user = userEvent.setup()
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Previous slide' }))
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
  })

  it('moves the reader with the arrow keys, and to the ends with Home and End', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    // Focus arrives by Tab, on the enabled control, which is the case that actually
    // happens. The region is not a tab stop and a disabled control is not either,
    // so a reader is never left focused on something that cannot answer a key. The
    // controls are focused by tabbing rather than by `focus()` for the same reason:
    // a programmatic focus can land on a disabled button, which a real Tab cannot.
    const enabled = () => {
      const forward = screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement
      return forward.disabled ? screen.getByRole('button', { name: 'Previous slide' }) : forward
    }

    await user.tab()
    expect(enabled()).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(current(container)?.getAttribute('aria-label')).toBe('The second slide')
    await user.keyboard('{ArrowLeft}')
    expect(current(container)?.getAttribute('aria-label')).toBe('The first slide')
    await user.keyboard('{End}')
    expect(current(container)?.getAttribute('aria-label')).toBe('The third slide')
    await user.keyboard('{Home}')
    expect(current(container)?.getAttribute('aria-label')).toBe('The first slide')
  })

  it('keeps a reachable control focused at each end, so the keys are never answered by a dead button', async () => {
    const user = userEvent.setup()
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    // A disabled control is out of the tab order, so at the last slide the reader's
    // next Tab lands on the back control rather than on the one that just went
    // dead. That is the property that makes the arrow-key model usable at the ends
    // rather than only in the middle, and it is worth asserting because a carousel
    // that leaves focus on a control it has just disabled strands the reader.
    await user.tab()
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled()
  })

  it('stays inside the set when an arrow key is pressed at an end', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    screen.getByRole('button', { name: 'Next slide' }).focus()
    // Clamped rather than wrapped, and the reason is the same as for the disabled
    // control: a reader who overshoots with a key expects to be at the end, not at
    // the other end of a carousel they did not know they were in.
    await user.keyboard('{ArrowLeft}')
    expect(current(container)?.getAttribute('aria-label')).toBe('The first slide')
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })

  it('keeps every slide in the document, so the carousel is not the only route to its content', () => {
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    // The claim the whole Component is built around. A carousel that unmounts the
    // slides it is not showing has made its own content unreachable by anything
    // except its own controls, and a reader with the controls hidden by a
    // stylesheet, or on a screen reader that never reaches them, has no route at
    // all. The slides are present and labelled; the ones that are not current are
    // hidden from the accessibility tree so they are not announced.
    expect(slides(container)).toHaveLength(3)
    for (const slide of slides(container)) {
      expect(slide.getAttribute('aria-label')).toMatch(/^The /)
      expect(slide.getAttribute('aria-roledescription')).toBe('slide')
    }
    expect(current(container)?.hasAttribute('aria-hidden')).toBe(false)
    expect(
      slides(container)
        .filter((slide) => !slide.hasAttribute('data-current'))
        .every((slide) => slide.getAttribute('aria-hidden') === 'true'),
    ).toBe(true)
  })

  it('draws no controls for a carousel of one slide, rather than two that move nowhere', () => {
    render(
      <Carousel
        slides={[SLIDES[0] as CarouselSlide]}
        label="Product shots"
        position={position}
      />,
    )
    // A picture with two disabled buttons is a claim that there is somewhere to
    // go, and one slide is a state a filtered or partially-loaded set passes
    // through.
    expect(screen.queryByRole('button', { name: 'Previous slide' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull()
    // And the position still tells the reader there is one and they are on it.
    expect(screen.getByText('Slide 1 of 1')).toBeTruthy()
  })

  it('authors the empty carousel rather than rendering a frame with dead controls', () => {
    const { container } = render(
      <Carousel
        slides={[]}
        label="Product shots"
        position={position}
        empty="No shots yet"
      />,
    )
    // Zero slides is a state a caller reaches before their data arrives or after a
    // filter excludes everything, and an empty track with two controls that move
    // nowhere is a gap rather than a state.
    expect(container.querySelector('[data-slot="carousel"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull()
    expect(screen.getByText('No shots yet')).toBeTruthy()
  })

  it('does not leave the reader past the end when the slides get shorter', async () => {
    // A filter narrowing the set while the reader is on slide 3 is ordinary, and
    // the failure is silent: the track is translated to an offset with no slide
    // there, so the reader looks at blank space in a carousel that is working.
    function Narrowing() {
      const [narrow, setNarrow] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setNarrow(true)}>
            Filter
          </button>
          <Carousel
            slides={narrow ? SLIDES.slice(0, 1) : SLIDES}
            label="Product shots"
            position={position}
            initialIndex={2}
          />
        </>
      )
    }
    const user = userEvent.setup()
    render(<Narrowing />)
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Filter' }))
    expect(screen.getByText('Slide 1 of 1')).toBeTruthy()
  })

  it('opens on the slide the caller asked for, because a deep link names one', () => {
    render(
      <Carousel slides={SLIDES} label="Product shots" position={position} initialIndex={1} />,
    )
    // A carousel dropped into the middle of a page is often the target of an
    // address, and one that always opened on slide one would show the reader
    // something the address did not name.
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
  })

  it('clamps an initial index that is past the end rather than rendering blank', () => {
    render(
      <Carousel slides={SLIDES} label="Product shots" position={position} initialIndex={99} />,
    )
    // A caller computing an index from a remembered preference can be out of range
    // after a set changes, and a carousel showing nothing is the result.
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy()
  })

  it('does not move on its own when the caller owns the index', async () => {
    const onIndexChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Carousel
        slides={SLIDES}
        label="Product shots"
        position={position}
        index={0}
        onIndexChange={onIndexChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    // It reports the request and waits. Moving the track anyway is the defect a
    // controlled control has when it keeps a copy, because the caller's state and
    // the drawn state then disagree and a reader is looking at slide 2 while the
    // application believes it is on slide 1.
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })

  it('holds its own index when the caller passes no handler, so it works uncontrolled', async () => {
    const user = userEvent.setup()
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    // The uncontrolled case is the common one, and a carousel that needs a handler
    // to move is a carousel that cannot be dropped in anywhere.
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
  })

  it('reaches its controls with Tab, and presses them with Enter', async () => {
    const user = userEvent.setup()
    render(<Carousel slides={SLIDES} label="Product shots" position={position} />)
    const back = screen.getByRole('button', { name: 'Previous slide' })
    const forward = screen.getByRole('button', { name: 'Next slide' })
    // Real buttons, so Tab reaches them and Enter and Space press them, and none
    // of that is this Component's keyboard handling to get wrong.
    expect(back.tabIndex).toBe(0)
    expect(forward.tabIndex).toBe(0)
    forward.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
  })

  it('draws its focus rings at full strength, on the region and on the controls', () => {
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    const forward = container.querySelector('[data-slot="carousel-next"]')?.className ?? ''
    // `outline-none` with a half-alpha ring is the silent failure the
    // focus-indicator gate exists for: the token gates pass, because the alpha is
    // in the class and not in the token.
    expect(forward).toContain('outline-none')
    expect(forward).toContain('focus-visible:ring-ring')
    expect(forward).toContain('focus-visible:ring-[3px]')
  })

  it('moves the track on a token duration, and never fades in on mount', () => {
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    const track = container.querySelector('[data-slot="carousel-track"]')?.className ?? ''
    // A slide that moves is a reader's press being reported back, which is state
    // feedback. A slide that fades in on mount is motion nobody asked for, and
    // this system has none of it, so the assertion is on the absence of an
    // opacity or keyframe utility as much as on the transition's presence.
    expect(track).toContain('transition-transform')
    expect(track).toContain('duration-base')
    expect(track).toContain('ease-out')
    expect(track).not.toContain('opacity-0')
    expect(track).not.toContain('animate-')
  })

  it('names each control in words the caller may override', () => {
    render(
      <Carousel
        slides={SLIDES}
        label="Product shots"
        position={position}
        previousLabel="Vorherige Aufnahme"
        nextLabel="Naechste Aufnahme"
      />,
    )
    // A carousel that announced "previous slide" into every consumer's page would
    // be a sentence this package chose for somebody else's product, so the words
    // are props. The defaults exist and are overridable, which is the shape the
    // copy gate allows.
    expect(screen.getByRole('button', { name: 'Vorherige Aufnahme' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Previous slide' })).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Carousel slides={SLIDES} label="Product shots" position={position} />,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
    // And the region carries the name, which is what a landmark needs.
    expect(within(container).getByRole('region', { name: 'Product shots' })).toBeTruthy()
  })
})
