import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OverflowActions, type OverflowAction } from './overflow-actions'

/**
 * A row of actions that measures itself, and a claim about how often.
 *
 * The Component exists because a width cannot be passed to it, so the only thing it
 * can do about a width is read one, and every read it makes is a read the browser
 * answers by settling layout first. **That is the whole of what these tests are
 * about: how many times the row reads, and on which frames.** What it draws is
 * covered too, because a cheaper measurement that draws the wrong row is not cheaper.
 *
 * The limit is stated once, here, and it is a real one. jsdom has no layout, so every
 * number a pass reads comes from the shim below rather than from a browser, and so a
 * test in this file can count reads but cannot see a pixel. What it can do is count
 * exactly, and the count is the claim: a pass that no observer asked for and no
 * change invited is a forced synchronous layout spent on a decision that had already
 * been made, on a row that a page draws one of per table line.
 */

/** The row a caller would draw: four actions, the last of them the destructive one. */
const actions: readonly OverflowAction[] = [
  { id: 'open', label: 'Open' },
  { id: 'share', label: 'Share' },
  { id: 'archive', label: 'Archive' },
  { id: 'trash', label: 'Delete', tone: 'danger' },
]

/** Every drawn action, by the name a reader meets it under. */
const drawn = () =>
  screen
    .queryAllByRole('button')
    .map((button) => button.textContent ?? '')
    .filter((name) => name !== '')

/**
 * The cap, which is out of the accessibility tree while the row is whole, so it is
 * found by its slot rather than by its role. Which is the point of it being found
 * this way: the row keeps the trigger in the document precisely so that a row that
 * has not collapsed still has a cap width to read.
 */
const cap = () =>
  document.querySelector<HTMLElement>('[data-slot="overflow-actions-cap"]') as HTMLElement

/**
 * The layout jsdom does not have, and a count of the reads made against it.
 *
 * The numbers are stand-ins for what a browser would report and nothing is claimed
 * about them beyond the arithmetic they take part in. What the shim has to get right
 * is that the row's `clientWidth` is not zero: `measure` reads a row that measures
 * nothing as a row that is not laid out yet and returns before reading anything else,
 * so a shim reporting zero would turn every pass in this file into a no-op and every
 * count below into a count of nothing.
 *
 * One read of the cap's own width is one pass. The cap is read once per pass, at the
 * top of the arithmetic, and nowhere else in the file, so counting its reads counts
 * the passes. Every use of the count below is a count of reads and not a count of
 * renders, and each one says so where it is used.
 */
type Layout = { row: number; action: number; cap: number }

/**
 * The prototype that owns a property, found by walking up from an element rather than
 * named.
 *
 * The walk is here because the two properties this Component reads do not live on the
 * same prototype: `clientWidth` is an `Element` property and `offsetWidth` is an
 * `HTMLElement` one. A getter left on the wrong prototype is a getter nothing reads,
 * and the failure it produces is a Component that measures zero and collapses nothing,
 * which looks exactly like a Component that has nothing to collapse.
 */
function ownerOf(property: string): Record<string, PropertyDescriptor> {
  let proto: object | null = Object.getPrototypeOf(document.createElement('span'))
  while (proto !== null) {
    if (Object.getOwnPropertyDescriptor(proto, property) !== undefined) {
      return proto as Record<string, PropertyDescriptor>
    }
    proto = Object.getPrototypeOf(proto)
  }
  throw new Error(`jsdom owns no ${property}, so this file has nothing to stand in for it.`)
}

/**
 * What each property was before this file replaced it, so the prototype it was taken
 * from can be given back rather than left holding a getter that outlives the test.
 */
const READS: Record<string, PropertyDescriptor | undefined> = {}

function harness(read: () => Layout) {
  const reads: string[] = []
  for (const property of ['clientWidth', 'offsetWidth']) {
    const owner = ownerOf(property)
    READS[property] = Object.getOwnPropertyDescriptor(owner, property)
    Object.defineProperty(owner, property, {
      configurable: true,
      get(this: Element) {
        const slot = this.getAttribute('data-slot') ?? ''
        reads.push(slot)
        const layout = read()
        if (slot === 'overflow-actions') return layout.row
        if (slot === 'overflow-actions-action') return layout.action
        if (slot === 'overflow-actions-cap') return layout.cap
        return 0
      },
    })
  }
  return {
    /** Measurement passes, counted by the one read of the cap's width each one makes. */
    passes: () => reads.filter((slot) => slot === 'overflow-actions-cap').length,
  }
}

/**
 * The observer the row holds, held here so a test can deliver what a browser would.
 *
 * jsdom never fires a `ResizeObserver` and never lays anything out, so the delivery is
 * the test's to make. What is asserted about the subscription is that the row watches
 * the row itself, which is the element whose box is the answer, rather than each
 * action, which would be a subscription per action on a page of rows.
 */
function watchTheRow() {
  const observed: Element[] = []
  let deliver: (() => void) | null = null
  class CapturedResizeObserver {
    constructor(callback: () => void) {
      deliver = callback
    }
    observe(element: Element) {
      observed.push(element)
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', CapturedResizeObserver)
  return {
    observed: () => observed,
    /** What the browser delivers when the observed box changed. */
    boxChanged() {
      act(() => {
        deliver?.()
      })
    },
  }
}

/** A page whose face is still loading, and a way to say that it landed. */
function pageFonts() {
  let landed: () => void = () => {}
  const ready = new Promise<void>((resolve) => {
    landed = resolve
  })
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } })
  return {
    async land() {
      await act(async () => {
        landed()
      })
    },
  }
}

afterEach(() => {
  for (const [property, descriptor] of Object.entries(READS)) {
    const owner = ownerOf(property)
    if (descriptor === undefined) delete owner[property]
    else Object.defineProperty(owner, property, descriptor)
    delete READS[property]
  }
  delete (document as unknown as Record<string, unknown>).fonts
  vi.unstubAllGlobals()
})

describe('the OverflowActions row', () => {
  it('measures once when it mounts, because the width is the whole Component', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // The claim, as a count of reads. One pass on mount: the correction is made in a
    // layout effect so the reader never sees the row the caller described and then
    // the row the Component would have guessed at.
    expect(widths.passes()).toBe(1)
  })

  it('costs nothing for a render that changed nothing a width depends on', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const { rerender } = render(
      <OverflowActions actions={actions} overflowLabel="More actions for this row" />,
    )

    // The claim, and it is the one that separates this from a row that measures
    // whenever React renders it. A caller who maps a list into a fresh array on every
    // render has handed over the same ids and the same words, so the answer is the
    // answer, and a page of such rows is a page that forced a synchronous layout per
    // row for a number it already had.
    rerender(<OverflowActions actions={[...actions]} overflowLabel="More actions for this row" />)
    rerender(<OverflowActions actions={[...actions]} overflowLabel="More actions for this row" />)

    // Counts reads, not renders: three renders have happened and one pass was made.
    expect(widths.passes()).toBe(1)
  })

  it('measures again when a label changes, because a button sizes to its own words', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const { rerender } = render(
      <OverflowActions actions={actions} overflowLabel="More actions for this row" />,
    )

    // The words are the width, so the words are the signal: one more pass, and one
    // only, because the caller changed a label and nothing else.
    rerender(
      <OverflowActions
        actions={[
          actions[0] as OverflowAction,
          { id: 'share', label: 'Share with' },
          ...actions.slice(2),
        ]}
        overflowLabel="More actions for this row"
      />,
    )

    expect(widths.passes()).toBe(2)
  })

  it('measures again when the actions themselves change, because the row counts them', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const { rerender } = render(
      <OverflowActions actions={actions} overflowLabel="More actions for this row" />,
    )

    rerender(
      <OverflowActions
        actions={[...actions, { id: 'restore', label: 'Restore' }]}
        overflowLabel="More actions for this row"
      />,
    )

    expect(widths.passes()).toBe(2)
  })

  it('measures again when className changes the gap, because a gap is one of the reads', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const { rerender } = render(
      <OverflowActions
        actions={actions}
        overflowLabel="More actions for this row"
        className="w-72"
      />,
    )

    // A wider gap changes the arithmetic and leaves the row's own box exactly where
    // it was, so nothing an observer watches reports it and the prop is the only
    // signal there is.
    rerender(
      <OverflowActions
        actions={actions}
        overflowLabel="More actions for this row"
        className="w-72 gap-4"
      />,
    )

    expect(widths.passes()).toBe(2)
  })

  it('measures when its own box changes, and watches the row rather than each action', () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const observer = watchTheRow()
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // The row's width is not a prop and not a render, so the observer is the only
    // report it can get, and the element it watches is the element whose box is the
    // answer.
    expect(observer.observed()).toEqual([
      document.querySelector('[data-slot="overflow-actions"]'),
    ])

    observer.boxChanged()
    expect(widths.passes()).toBe(2)
  })

  it('measures once when the page face lands, because the fallback widths were not true', async () => {
    const widths = harness(() => ({ row: 2000, action: 100, cap: 40 }))
    const fonts = pageFonts()
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)
    expect(widths.passes()).toBe(1)

    await fonts.land()

    // A self-hosted face swaps in after the first paint and changes every drawn
    // action's width without changing the row's, so the observer above never fires
    // for it. Counts reads: the landing asks for one pass and one pass is made.
    expect(widths.passes()).toBe(2)
  })

  it('does not measure a row again after it has changed what that row holds', () => {
    const widths = harness(() => ({ row: 250, action: 100, cap: 40 }))
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // The claim, and it is the other half of the first one. Writing membership
    // renders the row, and a row that measured on every render would read the boxes
    // it had just written, which is the forced layout and the write in the same frame.
    // So one pass is made here: the one that found the answer.
    expect(widths.passes()).toBe(1)
    expect(drawn()).toEqual(['Open', 'Share'])
  })

  it('keeps the actions a wide row already fits and moves the ones it cannot', () => {
    harness(() => ({ row: 250, action: 100, cap: 40 }))
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // The claim as an outcome, because a cheaper pass that draws the wrong row is not
    // a cheaper pass. Two hundred and fifty pixels hold two hundred of action and
    // forty of cap, and the row keeps the actions a reader reached for first.
    expect(drawn()).toEqual(['Open', 'Share'])
    expect(screen.queryByRole('button', { name: 'Archive' })).toBeNull()
  })

  it('puts the actions back when the row is given its room again', () => {
    let row = 250
    const widths = harness(() => ({ row, action: 100, cap: 40 }))
    const observer = watchTheRow()
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)
    expect(drawn()).toEqual(['Open', 'Share'])

    row = 2000
    observer.boxChanged()

    expect(drawn()).toEqual(['Open', 'Share', 'Archive', 'Delete'])
    expect(widths.passes()).toBe(2)
  })

  it('keeps the cap out of the tab order and off the page while the row is whole', () => {
    harness(() => ({ row: 2000, action: 100, cap: 40 }))
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // The cap is in the document and out of the reader's way: it is the width the
    // first decision has to account for and not a control that opens nothing.
    expect(cap().getAttribute('aria-hidden')).toBe('true')
    expect(cap().getAttribute('tabindex')).toBe('-1')
    expect(cap().className).toContain('invisible')
  })

  it('names the cap, and puts it back on the page once something has moved into it', () => {
    harness(() => ({ row: 250, action: 100, cap: 40 }))
    render(<OverflowActions actions={actions} overflowLabel="More actions for this row" />)

    // Three dots are not a word, and a control the reader reaches towards has to say
    // what it opens before they press it. Then it is a control again: out of the
    // `aria-hidden` and into the Tab order, because it opens something now.
    expect(screen.getByRole('button', { name: 'More actions for this row' })).toBe(cap())
    expect(cap().getAttribute('aria-hidden')).toBeNull()
    expect(cap().getAttribute('tabindex')).toBeNull()
    expect(cap().className).not.toContain('invisible')
  })

  it('tells the caller what moved, and never on the first render', () => {
    const onOverflowChange = vi.fn()
    harness(() => ({ row: 250, action: 100, cap: 40 }))
    render(
      <OverflowActions
        actions={actions}
        overflowLabel="More actions for this row"
        onOverflowChange={onOverflowChange}
      />,
    )

    // A caller told an empty list it already knew was empty would be hearing about
    // itself rather than about the row, and a caller whose row means something
    // different once actions are hidden cannot act on that.
    expect(onOverflowChange).toHaveBeenCalledTimes(1)
    expect(onOverflowChange).toHaveBeenCalledWith(['archive', 'trash'])
  })
})