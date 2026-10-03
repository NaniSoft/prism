import { act, fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Toast } from '../src/components/ui/toast'

/**
 * A transient notification for something the reader did not have to be told.
 *
 * The claims under test are the ones a screenshot cannot hold. Every one of them
 * is about something a live region gets wrong easily: a toast that announces
 * itself twice, a toast that announces a countdown, a toast that moves focus, a
 * toast whose clock restarts instead of resuming, and a toast whose exit hands
 * over twice. Those are silent in a screenshot and audible in a screen reader.
 *
 * The clock is fake because the clock is the behaviour, and the pointer and
 * focus pauses are the part most likely to be quietly wrong: a pause that
 * restarts the clock looks identical to a pause that holds it, and the
 * difference is the difference between "read this for as long as you like" and
 * "you get four more seconds every time you move the pointer over it".
 *
 * The fakes are installed before `render`, not after. The enter transition asks
 * for a frame on mount, and a clock installed afterwards does not own a frame
 * that was already asked for, so the toast would sit in `entering` for the rest
 * of the test and every phase assertion would read the wrong value.
 */
describe('the Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    // `useRealTimers` rather than `restoreAllMocks`, because a fake clock left
    // installed would leave every later suite in this process timing out.
    vi.useRealTimers()
  })

  /**
   * Move the clock forward.
   *
   * The first call is also the frame the enter transition needs, so a toast is
   * off `entering` and on its clock before the first assertion that depends on
   * either. The clock is tied to `leaving` rather than to `open`, so this is
   * tidiness and not a precondition; the phase is asserted directly instead.
   */
  const elapsed = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms)
    })
  }

  const phaseOf = (container: HTMLElement) =>
    container.querySelector('[data-slot="toast"]')?.getAttribute('data-phase')

  /**
   * A `pointerover`/`pointerout` pair, which is what a browser sends when the
   * pointer arrives at an element and leaves it again.
   *
   * Not `pointerenter`/`pointerleave`: React synthesises the enter and leave
   * pair from the over and out events and from `relatedTarget`, so a directly
   * dispatched `pointerenter` reaches no handler. `relatedTarget` is a node
   * outside the toast because it has to be: a pointer that never left the toast
   * is not a pause and is not the case being tested.
   */
  const pointer = (root: Element, kind: 'enter' | 'leave') => {
    act(() => {
      root.dispatchEvent(
        new PointerEvent(kind === 'enter' ? 'pointerover' : 'pointerout', {
          bubbles: true,
          relatedTarget: document.body,
        }),
      )
    })
  }

  /**
   * The end of a CSS transition.
   *
   * Built by hand rather than through `fireEvent.transitionEnd`, because the
   * Component's listener reads `propertyName` and jsdom does not carry an init
   * property onto a constructed `Event`. Bubbled so the child case reaches the
   * root's listener and is filtered there, which is what the filter is for.
   */
  const transitionEnd = (target: Element, propertyName: string) => {
    const event = new Event('transitionend', { bubbles: true })
    Object.defineProperty(event, 'propertyName', { value: propertyName })
    act(() => {
      target.dispatchEvent(event)
    })
  }

  /**
   * What the browser reports as running on an element.
   *
   * jsdom has no Web Animations API, and the Component asks the browser what is
   * running on its root rather than waiting for a `transitionend` that a killed
   * transition never sends. So the answers a real browser gives have to be written
   * down here to be testable at all: an empty list is what `transition: none` looks
   * like from inside, and a list holding one `CSSTransition` is what `duration-slow`
   * looks like. `undefined` is left alone deliberately, because that is what a
   * browser without the API gives and the Component has to keep working there too.
   *
   * A `finished` promise that never settles is the backgrounded tab: the leave is
   * real, the fade is running, and the reader is not there to see either.
   */
  const browserReports = (
    transitions: { property: string; finished: Promise<unknown> }[] | undefined,
  ) => {
    const proto = Element.prototype as unknown as Record<string, unknown>
    if (transitions === undefined) {
      delete proto.getAnimations
      return
    }
    Object.defineProperty(proto, 'getAnimations', {
      configurable: true,
      writable: true,
      value: () =>
        transitions.map((transition) => ({
          transitionProperty: transition.property,
          finished: transition.finished,
        })),
    })
  }

  /** One running transition whose end this test decides. */
  const runningFade = () => {
    let settle!: () => void
    return {
      settled: () => settle(),
      finished: new Promise<void>((resolve) => {
        settle = () => resolve()
      }),
    }
  }

  afterEach(() => {
    browserReports(undefined)
  })

  it('is announced politely and whole, because a title and a sentence are one notification', () => {
    const { container } = render(
      <Toast title="Invoice sent" description="Acme Ltd can see it now." closeLabel="Dismiss" />,
    )

    const root = container.querySelector('[data-slot="toast"]')
    expect(root?.getAttribute('role')).toBe('status')
    // Politeness written out rather than left as an implication of the role, and
    // atomic so a reader hears the pair once instead of the title then the
    // sentence as two unrelated announcements.
    expect(root?.getAttribute('aria-live')).toBe('polite')
    expect(root?.getAttribute('aria-atomic')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Invoice sentAcme Ltd can see it now.')
  })

  it('never takes focus, because a surface that moves focus has interrupted the reader', () => {
    const before = document.activeElement

    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={() => {}} />,
    )
    elapsed(32)

    // Mount is the moment a toast that stole focus would steal it, so the
    // assertion is that `document.activeElement` is the element it was before
    // the toast existed rather than anything inside it.
    expect(document.activeElement).toBe(before)

    // And the clock running out is the moment a Component is most tempted to
    // call `focus()` on its own dismiss control, so that path is checked too.
    elapsed(4000)
    expect(phaseOf(container)).toBe('leaving')
    expect(document.activeElement).toBe(before)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy()
  })

  it('changes nothing inside the region while it is up, so it is announced once', () => {
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={() => {}} />,
    )
    elapsed(32)

    const before = container.querySelector('[data-slot="toast"]')?.outerHTML

    // A live region is announced on mutation, so the clock is the danger: a
    // visible countdown, a `data-remaining` attribute, or any other attribute
    // written four times a second would be read out four times a second. The
    // whole toast must be identical across the life of the clock except for the
    // one attribute it is allowed to change.
    elapsed(4000)
    const after = container.querySelector('[data-slot="toast"]')?.outerHTML
    expect(phaseOf(container)).toBe('leaving')
    expect(after?.replace(' data-phase="leaving"', ' data-phase="open"')).toBe(
      before?.replace(' data-phase="entering"', ' data-phase="open"'),
    )
  })

  it('names the dismiss control in the caller words, because a toast arrived on its own', () => {
    render(
      <Toast title="Saved" closeLabel="Dismiss notification" onDismiss={() => {}} />,
    )

    // `closeLabel` is required with no default, so this assertion is about the
    // name that reaches the accessible name computation and nothing else. The
    // icon is hidden, which is what leaves the label as the whole name.
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('takes a hover as a pause that holds the time left rather than restarting it', () => {
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" duration={4000} onDismiss={() => {}} />,
    )
    const root = container.querySelector('[data-slot="toast"]')
    elapsed(32)

    // Ten seconds with the pointer on it is longer than the toast's whole life.
    // A restarting pause would have dismissed it by now.
    pointer(root as Element, 'enter')
    elapsed(10000)
    expect(phaseOf(container)).toBe('open')

    // And on the way out the reader gets the four seconds that were left, not
    // four more. This is the assertion that fails for a restarting pause.
    pointer(root as Element, 'leave')
    elapsed(3900)
    expect(phaseOf(container)).toBe('open')

    elapsed(200)
    expect(phaseOf(container)).toBe('leaving')
  })

  it('takes a tab into it as the same pause, because a reader who has tabbed in is about to press something', () => {
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" duration={4000} onDismiss={() => {}} />,
    )
    const close = screen.getByRole('button', { name: 'Dismiss' }) as HTMLButtonElement
    elapsed(32)

    // A real `.focus()`, because React listens for the focusin and focusout that
    // a browser sends rather than for the focus event testing-library can
    // dispatch directly.
    act(() => {
      close.focus()
    })
    elapsed(10000)
    expect(phaseOf(container)).toBe('open')

    act(() => {
      close.blur()
    })
    elapsed(3900)
    expect(phaseOf(container)).toBe('open')
  })

  it('stays up forever at duration zero, because that toast is the one the reader must act on', () => {
    const { container } = render(
      <Toast
        title="Session expired"
        closeLabel="Dismiss"
        duration={0}
        onDismiss={() => {}}
      />,
    )
    elapsed(32)

    elapsed(600000)
    expect(phaseOf(container)).toBe('open')

    // The reader can still get rid of it, which is what separates this from a
    // dialog: a toast is not a trap, it just does not expire.
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(phaseOf(container)).toBe('leaving')
  })

  it('dismisses on Escape only from inside itself, so it cannot swallow the key a reader is typing in', () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <>
        <input aria-label="Message" />
        <Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />
      </>,
    )
    elapsed(32)

    // From outside, the toast does not even move. A document-level Escape
    // handler on a transient surface is the classic way a floating layer steals
    // a key from whatever the reader is actually doing.
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Escape' })
    expect(phaseOf(container)).toBe('open')
    expect(onDismiss).not.toHaveBeenCalled()

    // From inside, it does.
    fireEvent.keyDown(screen.getByRole('button', { name: 'Dismiss' }), { key: 'Escape' })
    expect(phaseOf(container)).toBe('leaving')
  })

  it('hands over at the end of its own fade and not on a child transition', () => {
    const onDismiss = vi.fn()
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />,
    )
    elapsed(32)

    // Pressing the dismiss control asks the toast to go; it does not take the
    // toast off the page itself, because then there would be nothing left to
    // animate out.
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(phaseOf(container)).toBe('leaving')
    expect(onDismiss).not.toHaveBeenCalled()

    // The button's own colour transition ending is the ordinary case, and a
    // listener that took any `transitionend` would unmount the toast before its
    // own opacity had moved.
    transitionEnd(screen.getByRole('button', { name: 'Dismiss' }), 'opacity')
    expect(onDismiss).not.toHaveBeenCalled()

    // The root's own opacity, and a property it did not declare.
    transitionEnd(container.querySelector('[data-slot="toast"]') as Element, 'color')
    expect(onDismiss).not.toHaveBeenCalled()

    transitionEnd(container.querySelector('[data-slot="toast"]') as Element, 'opacity')
    expect(onDismiss).toHaveBeenCalledTimes(1)

    // And exactly once. A second event, a second listener or a re-render would
    // show up here, and each of them is a caller's unmount running twice.
    transitionEnd(container.querySelector('[data-slot="toast"]') as Element, 'opacity')
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('hands over exactly once when the fade never runs, because no event will ever end it', () => {
    const onDismiss = vi.fn()
    // A browser with nothing running on the toast, which is what a consumer's
    // own `transition: none` looks like from inside. This is the regression: the
    // leave used to wait on `transitionend` alone, so this toast stayed in
    // `leaving` for good, visible, undismissable and still announcing.
    browserReports([])
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />,
    )
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)

    // And once, not once per signal: the clock can run out on a toast whose fade
    // never started, and the reader can press the control as well.
    elapsed(60000)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(phaseOf(container)).toBe('leaving')
  })

  it('hands over when the fade runs, on the animation rather than only on the event', async () => {
    const onDismiss = vi.fn()
    const fade = runningFade()
    browserReports([{ property: 'opacity', finished: fade.finished }])
    const { container } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />,
    )
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    // A leave with a fade in it is a leave that is still running, so the caller
    // is not told yet: telling it early is what unmounts a toast half way out.
    expect(onDismiss).not.toHaveBeenCalled()

    await act(async () => {
      fade.settled()
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(phaseOf(container)).toBe('leaving')
  })

  it('waits for its own fade and not for the movement, because the movement can finish first', async () => {
    const onDismiss = vi.fn()
    // The root transitions `opacity` and `transform` together, and the transform
    // is the travel that `motion-safe:` guards. Waiting on either would let the
    // caller unmount the toast the instant the rise landed with the fade still
    // running, and waiting on both would let a cancelled fade strand it.
    const movement = runningFade()
    const fade = runningFade()
    browserReports([
      { property: 'transform', finished: movement.finished },
      { property: 'opacity', finished: fade.finished },
    ])
    render(<Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />)
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await act(async () => {
      movement.settled()
    })
    expect(onDismiss).not.toHaveBeenCalled()

    await act(async () => {
      fade.settled()
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('hands over rather than waiting on a movement that is all that is running', () => {
    const onDismiss = vi.fn()
    // No opacity transition means no fade to watch, so the leave is over. Waiting
    // for a fade that was never created is how a toast gets stranded.
    const movement = runningFade()
    browserReports([{ property: 'transform', finished: movement.finished }])
    render(<Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />)
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('hands over when the fade is cancelled, because a cancelled animation will not end', async () => {
    const onDismiss = vi.fn()
    const cancelled = Promise.reject(new Error('cancelled'))
    // Handled in the same tick it is created, so the rejection is never
    // unhandled. It is the same shape as a browser replacing a transition with a
    // new one: the old animation is cancelled rather than finished.
    cancelled.catch(() => undefined)
    browserReports([{ property: 'opacity', finished: cancelled }])
    render(<Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />)
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await act(async () => {})
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('hands over once even when the leave re-renders under it', async () => {
    const onDismiss = vi.fn()
    browserReports([])
    const { container, rerender } = render(
      <Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />,
    )
    elapsed(32)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)

    // A caller writing `onDismiss={() => setToast(null)}` hands the effect a new
    // `onDismiss` on every render, and the leave re-runs against it. A guard that
    // lived inside the effect would be a fresh `false` each time and the second
    // run would be a second unmount.
    for (let pass = 0; pass < 3; pass += 1) {
      await act(async () => {
        rerender(<Toast title="Saved" closeLabel="Dismiss" onDismiss={onDismiss} />)
      })
    }
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(phaseOf(container)).toBe('leaving')
  })

  it('leaves no timer behind it, because a clock outliving its toast fires at nothing', () => {
    const clear = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = render(
      <Toast title="Saved" closeLabel="Dismiss" duration={4000} onDismiss={() => {}} />,
    )
    elapsed(32)

    clear.mockClear()
    unmount()
    expect(clear).toHaveBeenCalled()
  })

  it('stays forever when there is nobody to hand over to, rather than fading to nothing', () => {
    const { container } = render(<Toast title="Saved" closeLabel="Dismiss" />)
    elapsed(32)

    // Every way out of this Component hands over to the caller, so a toast with
    // no `onDismiss` has no clock to run and no control to render. The failure
    // this prevents is a toast that faded to `opacity-0` and was never removed:
    // invisible, still in the live region, still taking the pointer, and gone in
    // every way except the ones that matter.
    elapsed(600000)
    expect(phaseOf(container)).toBe('open')
    expect(screen.queryByRole('button')).toBeNull()

    // And Escape inside it does nothing, for the same reason.
    fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' })
    expect(phaseOf(container)).toBe('open')
  })

  it('gives every tone its own ink, because a toast is the one coloured surface with body text on it', () => {
    const tones = ['default', 'success', 'warning', 'destructive'] as const

    for (const variant of tones) {
      const { container, unmount } = render(
        <Toast title="Saved" closeLabel="Dismiss" variant={variant} onDismiss={() => {}} />,
      )
      const className = container.querySelector('[data-slot="toast"]')?.className ?? ''

      // The `check-variant-ink` law stated as a test, because a tone that sets
      // only a fill inherits whatever is behind the viewport and was measured at
      // 1.01:1 on a filled band in `Cta01`.
      expect(className).toMatch(/bg-/)
      expect(className).toMatch(/\stext-/)
      unmount()
    }
  })

  it('has no accessibility violations when it is on the page', async () => {
    // Real timers for the scan: axe waits on timers of its own, and a fake clock
    // would leave it waiting for a tick that never arrives.
    vi.useRealTimers()

    const { container } = render(
      <>
        <button type="button">Save</button>
        <Toast
          title="Invoice sent"
          description="Acme Ltd can see it now."
          closeLabel="Dismiss notification"
          action={<button type="button">Undo</button>}
          variant="success"
          onDismiss={() => {}}
        />
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
