import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from '../src/components/ui/resizable'

/**
 * Two panes with a divider between them that both a pointer and a keyboard move.
 *
 * The claim under test is the divider's own model, because the divider is the
 * Component. Three things could be quietly wrong and every one of them looks
 * right in a screenshot: the divider is not focusable, so the split cannot be
 * operated without a pointer at all; the divider is focusable but does not report
 * where it is, so a reader can move it and cannot find out whether they did; and
 * the divider moves past the ends, so a reader who holds ArrowRight long enough
 * pushes a pane to nothing and cannot get it back.
 *
 * The second claim is the one the brief turns on, and it is an absence: **the
 * Component remembers nothing across a reload.** Storage is asserted empty after
 * a move, because a design system that wrote to a reader's storage unasked would
 * be making a claim about a product it does not know, and the failure a caller
 * has to be able to see is a sidebar that quietly persisted itself.
 */
const split = (props: Partial<Parameters<typeof Resizable>[0]> = {}) =>
  render(
    <Resizable label="Runs and details" {...props}>
      <ResizablePanel size={40}>
        <p>Run list</p>
      </ResizablePanel>
      <ResizableHandle label="Resize the run list" />
      <ResizablePanel size={60}>
        <p>Run detail</p>
      </ResizablePanel>
    </Resizable>,
  )

/** The divider's reported position, which is what a reader is told. */
const value = () => screen.getByRole('separator', { name: 'Resize the run list' }).getAttribute('aria-valuenow')

/**
 * A box for a jsdom that draws none, and a count of the reads made against it.
 *
 * The drag turns a distance the pointer travelled into a share of the group's travel,
 * so it cannot be exercised at all without a group that reports a travel, and jsdom
 * reports zero for every one of them. So the group is given one here: a thousand
 * pixels along its axis, which makes one percent of the group ten pixels and lets a
 * test say what a drag did in numbers a reader would recognise.
 *
 * **Two claims are kept apart on purpose.** The reads are counted for one test only,
 * and that test says it is counting reads. Every other test here asserts where the
 * divider ended up, which is the claim that survives a reader with a browser.
 */
function groupBox(read: () => { width: number; height: number }) {
  const reads: Element[] = []
  let proto: object | null = Object.getPrototypeOf(document.createElement('div'))
  while (proto !== null && Object.getOwnPropertyDescriptor(proto, 'getBoundingClientRect') === undefined) {
    proto = Object.getPrototypeOf(proto)
  }
  if (proto === null) throw new Error('jsdom owns no getBoundingClientRect, so there is no drag to test.')
  const owner = proto
  const original = Object.getOwnPropertyDescriptor(owner, 'getBoundingClientRect')
  Object.defineProperty(owner, 'getBoundingClientRect', {
    configurable: true,
    value(this: Element) {
      reads.push(this)
      const box = read()
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: box.width,
        bottom: box.height,
        width: box.width,
        height: box.height,
        toJSON: () => ({}),
      }
    },
  })
  return {
    /** Reads of one element's own box, which is what a pointer drag is measured against. */
    readsOf: (element: Element) => reads.filter((seen) => seen === element).length,
    restore() {
      if (original === undefined) delete (owner as Record<string, unknown>).getBoundingClientRect
      else Object.defineProperty(owner, 'getBoundingClientRect', original)
    },
  }
}

const boxes: (() => void)[] = []

afterEach(() => {
  for (const restore of boxes.splice(0)) restore()
})

describe('the Resizable', () => {
  it('is a named group, so two unnamed panes on a page tell themselves apart', () => {
    split()
    const group = screen.getByRole('group', { name: 'Runs and details' })
    // A resizable is announced as two panes with a divider between them, and two
    // unnamed panes side by side are a page where a reader is told "region" twice.
    expect(group.getAttribute('aria-label')).toBe('Runs and details')
  })

  it('gives the divider a name, because a divider with none is a line', () => {
    split()
    // A separator with no name is announced as "separator", and a page with three
    // of them is a page where a screen reader user cannot tell which one they
    // are about to move. There is no default, because a default would be the
    // same word on every divider on every page and true of none of them.
    expect(screen.getByRole('separator', { name: 'Resize the run list' })).toBeTruthy()
  })

  it('makes the divider a focus stop, so the split works without a pointer', () => {
    split()
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    expect(handle.getAttribute('tabindex')).toBe('0')
    handle.focus()
    expect(document.activeElement).toBe(handle)
  })

  it('tells a reader where the divider is, rather than only letting them feel it', () => {
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    // The claim. A focusable divider that reports no value is operable and
    // uninformative: the reader moves it and has no way to know whether they
    // landed where they meant to.
    expect(handle.getAttribute('aria-valuenow')).toBe('40')
    expect(handle.getAttribute('aria-valuemin')).toBe('10')
    expect(handle.getAttribute('aria-valuemax')).toBe('90')
  })

  it('tells a reader which axis the arrows move along', () => {
    split({ orientation: 'vertical' })
    // The axis is what tells a reader whether the left and right arrows or the up
    // and down ones are the ones to press, and getting it wrong makes a vertical
    // split unusable rather than merely awkward.
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    expect(handle.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('moves along the horizontal axis with the left and right arrows', async () => {
    const user = userEvent.setup()
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    await user.keyboard('{ArrowRight}')
    expect(value()).toBe('45')
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe('50')
    await user.keyboard('{ArrowLeft}')
    expect(value()).toBe('45')
  })

  it('moves along the vertical axis with the up and down arrows, and not the others', async () => {
    const user = userEvent.setup()
    split({ orientation: 'vertical', defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    await user.keyboard('{ArrowDown}')
    expect(value()).toBe('45')

    // The other pair does nothing, because a divider that answers both is a
    // divider whose axis the reader has to guess at.
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe('45')
  })

  it('steps far enough to be usable and little enough to be placed', async () => {
    const user = userEvent.setup()
    split({ defaultPosition: 50 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    // Six presses of five percent, so every press is counted. A divider that read
    // a stale position on each key event would report the same number for the
    // presses that arrive before React has re-rendered, and a reader holding the
    // key would travel one step where they meant six. The failure is invisible in
    // a screenshot and fatal to the one use the arrows exist for.
    for (let press = 0; press < 6; press += 1) await user.keyboard('{ArrowRight}')
    expect(value()).toBe('80')

    for (let press = 0; press < 12; press += 1) await user.keyboard('{ArrowLeft}')
    expect(value()).toBe('20')
  })

  it('stops at its minimum and its maximum rather than running past them', async () => {
    const user = userEvent.setup()
    split({ defaultPosition: 50 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    // The claim. A divider that runs past its end pushes a pane to nothing, and
    // the reader who holds the key has then collapsed a pane they wanted to keep.
    for (let press = 0; press < 20; press += 1) await user.keyboard('{ArrowLeft}')
    expect(value()).toBe('10')

    for (let press = 0; press < 20; press += 1) await user.keyboard('{ArrowRight}')
    expect(value()).toBe('90')
  })

  it('goes to either end with Home and End', async () => {
    const user = userEvent.setup()
    split({ defaultPosition: 50 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    await user.keyboard('{End}')
    expect(value()).toBe('90')
    await user.keyboard('{Home}')
    expect(value()).toBe('10')
  })

  it('leaves keys it does not use to the reader', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    render(
      <Resizable label="Runs and details" defaultPosition={50}>
        <ResizablePanel size={50}>Run list</ResizablePanel>
        <ResizableHandle label="Resize the run list" onKeyDown={onKeyDown} />
        <ResizablePanel size={50}>Run detail</ResizablePanel>
      </Resizable>,
    )
    screen.getByRole('separator', { name: 'Resize the run list' }).focus()

    await user.keyboard('{Escape}')
    // Only the four keys the divider owns are handled, so a consumer who binds
    // something else to it still gets it, and only those four are prevented.
    expect(onKeyDown).toHaveBeenCalled()
    expect(value()).toBe('50')

    await user.keyboard('{ArrowRight}')
    expect(value()).toBe('55')
  })

  it('reports every move to the caller rather than keeping the split to itself', async () => {
    const user = userEvent.setup()
    const onPositionChange = vi.fn()
    split({ onPositionChange })
    screen.getByRole('separator', { name: 'Resize the run list' }).focus()

    await user.keyboard('{ArrowRight}{ArrowRight}')
    // The claim. A split is worth remembering, and this Component will not
    // remember it for the caller, so the caller has to be told the number in order
    // to store it. A callback that fired once at the end would be a callback a
    // caller cannot write a drag preview with.
    expect(onPositionChange).toHaveBeenCalledTimes(2)
    expect(onPositionChange).toHaveBeenLastCalledWith(60)
  })

  it('is controlled when the caller owns the position, and the caller can refuse it', async () => {
    const user = userEvent.setup()
    render(
      <Resizable label="Runs and details" position={40} onPositionChange={() => {}}>
        <ResizablePanel size={40}>Run list</ResizablePanel>
        <ResizableHandle label="Resize the run list" />
        <ResizablePanel size={60}>Run detail</ResizablePanel>
      </Resizable>,
    )
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    await user.keyboard('{ArrowRight}{ArrowRight}')
    // The caller said no, so the divider did not move. A component that moved
    // anyway would make the controlled mode a decoration, and every consumer who
    // counts on it to hold a layout still would be wrong.
    expect(value()).toBe('40')
  })

  it('starts where the caller put it and does not move on its own', () => {
    split({ defaultPosition: 35 })
    // Uncontrolled with no interaction at all: the divider is where the caller
    // said, which is the only value a reader can be shown before they touch it.
    expect(value()).toBe('35')
  })

  it('remembers nothing across a reload, because persistence is the caller decision', async () => {
    const user = userEvent.setup()
    window.localStorage.clear()
    split({ defaultPosition: 40 })
    screen.getByRole('separator', { name: 'Resize the run list' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')

    expect(value()).toBe('55')
    // The claim, as an absence. A design system that wrote to a reader's storage
    // unasked would be making a claim about a product it does not know: which
    // pane this is, whether a second reader of the same account wants the same
    // number, and whether this reader wants it remembered at all.
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
  })

  it('reopens at the position the caller passes, which is how a caller persists a split', () => {
    const { unmount } = render(
      <Resizable label="Runs and details" defaultPosition={40}>
        <ResizablePanel size={40}>Run list</ResizablePanel>
        <ResizableHandle label="Resize the run list" />
        <ResizablePanel size={60}>Run detail</ResizablePanel>
      </Resizable>,
    )
    expect(value()).toBe('40')
    unmount()

    // A caller who stored 55 and passes it back gets 55. The Component offers
    // the seam and says nothing about where the number lives, because that is a
    // fact about the product and not about a divider.
    render(
      <Resizable label="Runs and details" defaultPosition={55}>
        <ResizablePanel size={55}>Run list</ResizablePanel>
        <ResizableHandle label="Resize the run list" />
        <ResizablePanel size={45}>Run detail</ResizablePanel>
      </Resizable>,
    )
    expect(value()).toBe('55')
  })

  it('stops the divider when the group is disabled, and says so', async () => {
    const user = userEvent.setup()
    split({ disabled: true, defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    expect(handle.getAttribute('aria-disabled')).toBe('true')
    // Out of the Tab order, because a disabled control a reader can land on is a
    // control they have to discover does nothing.
    expect(handle.getAttribute('tabindex')).toBe('-1')

    handle.focus()
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe('40')
  })

  it('refuses a pane or a divider that was rendered outside the group', () => {
    // A divider knows nothing on its own, so a caller who drops one outside the
    // group gets a thrown diagnostic rather than a divider that silently does
    // nothing at the reader's expense.
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ResizableHandle label="Resize" />)).toThrow(/inside a Resizable/)
    quiet.mockRestore()
  })

  it('keeps the caller own ref, so forwarding one does not silently break the drag', () => {
    const seen: (HTMLDivElement | null)[] = []
    const callerRef = (element: HTMLDivElement | null) => {
      seen.push(element)
    }
    render(
      <Resizable label="Runs and details" defaultPosition={40} ref={callerRef}>
        <ResizablePanel size={40}>Run list</ResizablePanel>
        <ResizableHandle label="Resize the run list" />
        <ResizablePanel size={60}>Run detail</ResizablePanel>
      </Resizable>,
    )

    // The drag measures the pointer against this element's box, so a Component
    // that let a forwarded ref replace its own would ship a divider the keyboard
    // moves and the pointer does not: a split that only half works, and a defect
    // that looks like a working drag in every screenshot.
    expect(seen.at(-1)).toBe(screen.getByRole('group', { name: 'Runs and details' }))
  })

  it('follows the pointer through a drag, from wherever the reader took hold', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    // The divider is a pixel wide and a reader takes hold of it wherever their
    // pointer landed, so the press is a hundred pixels to the right of the position
    // the divider reports: four hundred pixels into a group of a thousand. **A drag
    // measures from the press and not from the divider**, so the press itself moves
    // nothing, and the first move of fifty pixels moves the divider by exactly the
    // five percent those fifty pixels are. A divider that snapped to the pointer
    // would be at fifty after the press, which is a divider that jumps out from
    // under the finger holding it.
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 500, clientY: 0 })
    expect(value()).toBe('40')

    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 550, clientY: 0 })
    expect(value()).toBe('45')

    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 600, clientY: 0 })
    expect(value()).toBe('50')
  })

  it('follows the pointer along the vertical axis for a stacked split', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ orientation: 'vertical', defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    // The same model on the other axis, and the axis is the caller's word rather
    // than the Component's: a vertical split follows the y and a horizontal one the
    // x, so a caller who passes the wrong one cannot get a divider that tracks the
    // wrong coordinate.
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 0, clientY: 200 })
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 0, clientY: 240 })

    expect(value()).toBe('50')
  })

  it('stops at its ends when a drag runs past them', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ defaultPosition: 50 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    // A drag past the end is a drag past the end, and not a way to push a pane to
    // nothing: the pointer carries on and the divider stops where the reader would
    // expect the divider to stop.
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 500, clientY: 0 })
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 5000, clientY: 0 })
    expect(value()).toBe('90')

    fireEvent.pointerMove(handle, { pointerId: 1, clientX: -5000, clientY: 0 })
    expect(value()).toBe('10')
  })

  it('stays put once the reader has let go', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 500, clientY: 0 })
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 550, clientY: 0 })
    fireEvent.pointerUp(handle, { pointerId: 1 })
    expect(value()).toBe('45')

    // A pointer that keeps travelling after the release is a pointer that is no
    // longer holding the divider, so the divider does not go with it.
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 900, clientY: 0 })
    expect(value()).toBe('45')
  })

  it('ignores a press that is not the divider being grabbed', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    // A right-click is not a drag, so it neither moves the divider nor starts one
    // that a later pointer event could carry on with.
    fireEvent.pointerDown(handle, { pointerId: 1, button: 2, clientX: 500, clientY: 0 })
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 700, clientY: 0 })
    expect(value()).toBe('40')
  })

  it('reads the group box once for a whole drag, rather than once for every frame', () => {
    const box = groupBox(() => ({ width: 1000, height: 400 }))
    boxes.push(box.restore)
    split({ defaultPosition: 40 })
    const group = screen.getByRole('group', { name: 'Runs and details' })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 500, clientY: 0 })
    for (let frame = 0; frame < 8; frame += 1) {
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 550 + frame * 50, clientY: 0 })
    }
    expect(value()).toBe('80')

    // **This assertion is a count of reads and not a behaviour**, and it is here
    // because jsdom does no layout, so what a read costs cannot be seen from here.
    // What can be seen is how many there are. A drag needs the group's travel once,
    // at the press, and the box cannot change while the drag runs: the panes are
    // given a percentage of the group and the group is not given a percentage of the
    // panes. Reading it again on every frame would be reading it immediately after
    // the frame before wrote the new position and therefore wrote new styles, which
    // is one forced synchronous layout per frame of every drag on the page.
    expect(box.readsOf(group)).toBe(1)
  })

  it('keeps dragging against the box the press found, when the group changes size under it', () => {
    const group = { width: 1000, height: 400 }
    const box = groupBox(() => group)
    boxes.push(box.restore)
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 500, clientY: 0 })
    // The window under the reader's hand is twice as wide as it was when they took
    // hold of the divider, and the box it reports now says so.
    group.width = 2000
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 550, clientY: 0 })

    // Fifty pixels of a group of a thousand is five percent, and the drag was
    // measured against the box it started with rather than a box it never read. The
    // trade is deliberate and it is written down at the ref: a reader mid-gesture is
    // given the answer they can use, and a caller who resizes the group under a
    // pointer has to end that drag and start it again. Pinned here so that changing
    // it is a decision somebody takes rather than an accident.
    expect(value()).toBe('45')
  })

  it('moves by a step with the keyboard on a group that reports no box at all', async () => {
    const user = userEvent.setup()
    split({ defaultPosition: 40 })
    const handle = screen.getByRole('separator', { name: 'Resize the run list' })
    handle.focus()

    // **The claim is that the keyboard never needs the cached box.** jsdom reports a
    // zero width and a zero height for everything, which is the exact reading a drag
    // cannot use and a key press does not consult: a key moves the divider by a
    // share of its position, so a Component that had put the drag's measurement on
    // the keyboard's path would report a divider that had got a fifth narrower.
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(value()).toBe('50')
    await user.keyboard('{ArrowLeft}')
    expect(value()).toBe('45')
    await user.keyboard('{End}')
    expect(value()).toBe('90')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    split()
    screen.getByRole('separator', { name: 'Resize the run list' }).focus()
    await user.keyboard('{ArrowRight}')

    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
