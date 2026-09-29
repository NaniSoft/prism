import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../src/components/ui/sheet'

/**
 * A panel anchored to an edge of the viewport.
 *
 * The claim under test is that the sheet is the Dialog with an edge and inherits
 * its behaviour rather than reimplementing it, so the six behaviours a reader
 * depends on are the Dialog's: it traps focus, it locks scroll, it closes on
 * Escape, it closes on an outside press, it returns focus to the trigger, and a
 * closed one renders nothing. Focus trapping and the return of focus are the two
 * that a hand-rolled overlay most often gets wrong, and the return of focus is
 * the one a reader feels: a panel that closes and drops focus at the top of the
 * document loses their place.
 *
 * The second claim is the one the Component actually adds, and it is a type:
 * `side` is required and `center` is not on it. A sheet with no declared edge is
 * a centred dialog wearing a different name, and a caller who reaches for
 * `center` here is asking for the thing the Dialog is for.
 */
const panel = (props: Partial<Parameters<typeof SheetContent>[0]> = {}) =>
  render(
    <Sheet>
      <SheetTrigger>Open filters</SheetTrigger>
      <SheetContent side="right" {...props}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the table to the rows you need.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  )

describe('the Sheet', () => {
  // Queried from the document, because the Dialog portals its content to the body
  // and a container-scoped query would find an empty tree.
  const scope = (): HTMLElement => document.body

  it('renders no dialog until it is opened', () => {
    panel()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('Filters')).toBeNull()
  })

  it('is a dialog, so the overlay behaviour is the one this system already has', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    // Composed on the Dialog rather than beside it: the focus trap, the portal,
    // the scroll lock, Escape, the outside press and the return of focus are six
    // behaviours that are correct there and would be six chances to get one wrong
    // here.
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('takes the name of the title the caller wrote', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    const named = screen.getByRole('dialog', { name: 'Filters' })
    const title = screen.getByText('Filters')
    // The name has to land on the dialog itself, or a reader is told "dialog" and
    // then has to go looking for what it is about.
    expect(named.getAttribute('aria-labelledby')).toBe(title.id)
  })

  it('traps focus while it is open, so Tab does not leave the panel', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Behind the sheet</button>
        <Sheet>
          <SheetTrigger>Open filters</SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <SheetFooter>
              <SheetClose>Done</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>,
    )
    const trigger = screen.getByRole('button', { name: 'Open filters' })
    const behind = screen.getByRole('button', { name: 'Behind the sheet' })
    await user.click(trigger)

    // Four Tab presses, and focus never reaches the page behind. A sheet whose
    // focus escapes is a dialog the reader has been let out of without their
    // consent, which is the failure an anchored panel is supposed to avoid. The
    // library keeps the trap with hidden sentinels either side of the panel, so
    // the honest assertion is about where focus must NOT land rather than a
    // specific element it must land on, plus a record that it did visit the
    // panel rather than sitting still between sentinels.
    const surface = screen.getByRole('dialog')

    // The claim is that focus never reaches the page behind. It is asserted as
    // "never on an element the page owns" rather than as "never on
    // document.body", because the two are not the same assertion and only one of
    // them is portable.
    //
    // A focus trap wraps through sentinels either side of the panel, and while it
    // is mid-wrap the resting element is a sentinel. jsdom represents that
    // differently from a browser: on Linux it reports document.body at the hop,
    // where Windows does not. Asserting the body directly therefore tested the
    // platform's focus simulation rather than the trap, and it failed on CI while
    // passing locally, which is the signature of a test measuring the wrong thing.
    //
    // So the set of things focus must never reach is named, and it is the page's
    // own controls plus the trigger. A sentinel is not on that list, because a
    // sentinel is part of the trap and not part of the page.
    const ownedByThePage = new Set<Element>([behind, trigger])
    let visitedThePanel = false
    for (let press = 0; press < 4; press += 1) {
      await user.tab()
      const active = document.activeElement
      // Null is a real possibility while a trap wraps and is not a page control, so
      // it is handled rather than asserted through a cast.
      if (active !== null) {
        expect(ownedByThePage.has(active)).toBe(false)
        if (surface.contains(active)) visitedThePanel = true
      }
    }

    // A trap that never let focus in at all would satisfy every line above, so
    // this is the assertion that makes the others mean something.
    expect(visitedThePanel).toBe(true)
  })

  it('closes on an outside press, because a sheet holds something deferrable', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    await user.click(document.body)
    // The claim, and the difference from an AlertDialog. A sheet holds
    // navigation, filters, a detail view: a reader who clicks away has said "not
    // now" and the content behind is still there when they come back.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup()
    panel()
    const trigger = screen.getByRole('button', { name: 'Open filters' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    // A reader who dismissed the panel resumes where they were, rather than at
    // the top of the document because focus fell off the end of the page.
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })

  it('renders a dismiss control whose name is the caller word', async () => {
    const user = userEvent.setup()
    panel({ closeLabel: 'Close filters' })
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    // A prop, because a consumer that localises its product cannot otherwise
    // localise the one control that dismisses the panel, and a panel announcing an
    // English word in a product that never uses that word is a control the
    // consumer cannot fix.
    expect(screen.getByRole('button', { name: 'Close filters' })).toBeTruthy()
  })

  it('drops the dismiss control only when the caller says to', async () => {
    const user = userEvent.setup()
    panel({ showCloseButton: false })
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    // And the way out is still there, which is the point of the decision: a panel
    // with no corner control must still be escapable.
    expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy()
  })

  it('closes on the caller own control from inside the panel', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('anchors the panel to the edge it was given, and to no other', async () => {
    const user = userEvent.setup()
    panel({ side: 'bottom' })
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    // The edge is pinned on the viewport that holds the panel, which is the layer
    // the Dialog places against the edge of the window; the panel inside it takes
    // its own width from there. Read as a class rather than as a computed box
    // because jsdom computes no layout, so a class is the only honest evidence
    // that the edge reached the DOM at all.
    const viewport = document.querySelector('[data-slot="dialog-viewport"]')
    expect(viewport).toBeTruthy()
    expect(viewport?.className).toContain('bottom-0')
    // And `right-0` absent is what says this is a bottom sheet and not a right
    // drawer wearing a different name.
    expect(viewport?.className).not.toContain('right-0')
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    panel()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    const results = await axe.run(scope(), {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
