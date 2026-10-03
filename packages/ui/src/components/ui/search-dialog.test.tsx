import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SearchDialog, type SearchDialogMessages } from './search-dialog'

/**
 * A search dialog over a static index.
 *
 * The four fields it draws a result from, and every sentence it can say.
 */
const MESSAGES: SearchDialogMessages = {
  close: 'Close search',
  loading: 'Loading the search index.',
  failed: 'The search index could not be loaded.',
  empty: 'No matches.',
  one: 'result.',
  other: 'results.',
}

const INDEX = [
  { id: '/docs', title: 'The data platform', url: '/docs', content: 'every market minute' },
  { id: '/blog', title: 'A note on feeds', url: '/blog', content: 'the option chain' },
]

/**
 * A trigger and the dialog it opens, which is how `SiteNavbar` composes it.
 *
 * The trigger and the page behind it are inside the Example rather than around it,
 * because the focus assertions need an element whose focus this test owns: a
 * reader who opens a dialog with a pointer had focus on the control they pressed,
 * and that control is where the focus has to come back to.
 */
function Example() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Search documentation
      </button>
      <a href="/elsewhere">Somewhere else</a>
      {open ? (
        <SearchDialog
          indexUrl="/api/search"
          label="Search documentation"
          messages={MESSAGES}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

/**
 * A search dialog over a static index.
 *
 * The claims under test are the ones a screenshot cannot hold. The dialog is a
 * modal, so it has to trap the keyboard, hold the page behind it inert, and give
 * the reader their place back when it closes; a modal that claims modality and
 * does not deliver it is worse than a panel that claims nothing, because the
 * claim is what a screen reader user is told before the failure happens. Every
 * exit is asserted separately, because each one is a different route through the
 * modal, and a return focus that works on Escape and not on a chosen result is a
 * return focus that works most of the time.
 */
describe('SearchDialog', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => INDEX })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /**
   * Open the dialog over the trigger and wait for the panel to arrive.
   *
   * The trigger is returned because every test that closes the dialog needs it,
   * and holding it rather than re-querying it is what lets the assertion be about
   * focus on the element the reader pressed.
   */
  const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    const trigger = screen.getByRole('button', { name: 'Search documentation' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Search documentation' })
    return trigger
  }

  it('is exposed as a named dialog and takes focus when it opens', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = await openDialog(user)

    const dialog = screen.getByRole('dialog', { name: 'Search documentation' })
    // The field is the control the reader came for, so it is the control that
    // holds focus. Focus on the panel instead would make a keyboard reader type
    // into nothing.
    expect(screen.getByRole('textbox', { name: 'Search documentation' })).toHaveFocus()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(trigger).not.toHaveFocus()
  })

  it('locks the page behind it and portals the panel out of the flow, because a modal that scrolls away is a modal that left', async () => {
    const user = userEvent.setup()
    const { container } = render(<Example />)
    await openDialog(user)

    // The scroller itself is locked, which is the only lock that works on a page
    // whose overflow propagates from `<body>`. The attribute is the lock's own
    // marker and it is removed on close, so asserting on it asserts the lock is
    // held rather than that a style happened to be set.
    await waitFor(() =>
      expect(document.body.style.overflowY || document.documentElement.style.overflowY).toBe(
        'hidden',
      ),
    )

    // The panel is a child of the document and not of the tree it was rendered
    // into, so an ancestor with `overflow`, a transform or a stacking context
    // cannot clip it or trap it behind its own surface.
    expect(container.querySelector('[data-slot="dialog-content"]')).toBeNull()
    expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() =>
      expect(document.body.style.overflowY || document.documentElement.style.overflowY).toBe(
        '',
      ),
    )
  })

  it('keeps Tab inside itself, because a modal that lets the keyboard walk out is a claim it cannot keep', async () => {
    const user = userEvent.setup()
    render(<Example />)
    // Read before the dialog opens, because a modal that really is modal takes the
    // page behind it out of the accessibility tree, and a query that only finds
    // the link while the dialog is shut is the first half of the assertion.
    const behind = screen.getByText('Somewhere else')
    await openDialog(user)
    expect(screen.queryByRole('link', { name: 'Somewhere else' })).toBeNull()

    // The trap's boundary is the modal, and a boundary drawn by a focus guard is
    // part of the modal: the guard is where focus lands for the half of the cycle
    // that wraps past the last control, and it is redirected rather than left
    // there. What must never happen is focus arriving on the page behind.
    const withinModal = () => {
      const active = document.activeElement
      return (
        screen.getByRole('dialog').contains(active) ||
        active?.hasAttribute('data-base-ui-focus-guard') === true
      )
    }

    await user.tab()
    expect(behind).not.toHaveFocus()
    expect(withinModal()).toBe(true)

    // And all the way round: the cycle closes rather than falling out of it.
    for (let step = 0; step < 8; step += 1) {
      await user.tab()
      expect(withinModal()).toBe(true)
    }
    expect(behind).not.toHaveFocus()
  })

  it('draws a focus indicator on the field, because outline-none removed the browser one', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await openDialog(user)

    const field = screen.getByRole('textbox', { name: 'Search documentation' })
    // The class and not a pixel: this gate is about the element declaring a
    // full-strength ring in place of the outline it suppresses, and the contrast
    // gate measures the `ring` token rather than the alpha a Component applies
    // to it.
    expect(field.className).toContain('outline-none')
    expect(field.className).toContain('focus-visible:ring-ring')
    expect(field.className).toContain('focus-visible:ring-[3px]')
  })

  it('gives the close control the coarse-pointer 44px floor as a step', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await openDialog(user)

    const close = screen.getByRole('button', { name: MESSAGES.close })
    // A step and not a band, which is the other half of why the field row and the
    // dialog's own corner close control are not the same shape: the row is 48px tall
    // and a 44px button grows inside it, so nothing moves and no result row under it
    // is stolen. A band here would hang off the row and over the list.
    expect(close.className).toContain('pointer-coarse:size-11')
    expect(close.className).not.toContain('pointer-coarse:before')
    expect(close.className).toContain('p-1')
  })

  it('returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = await openDialog(user)

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it('returns focus to the trigger on a backdrop press', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = await openDialog(user)

    // The scrim, not the panel: a press inside the panel is a reader choosing
    // something, and a modal that closed on it would take the reader's answer away
    // before they had given it.
    const scrim = document.querySelector('[data-slot="dialog-backdrop"]')
    expect(scrim).not.toBeNull()
    await user.click(scrim as Element)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it('returns focus to the trigger when a result is chosen', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const trigger = await openDialog(user)

    const field = screen.getByRole('textbox', { name: 'Search documentation' })
    await user.type(field, 'market')
    const result = await screen.findByRole('link', { name: /The data platform/ })
    await user.click(result)

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it('tells the caller once the dialog has gone rather than once it was asked to', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchDialog
        indexUrl="/api/search"
        label="Search documentation"
        messages={MESSAGES}
        onClose={onClose}
      />,
    )
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

    // One leave rather than one per reason the reader left, so the unmount is one
    // call and not a second state update against a component that is gone.
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('announces the count through a polite live region and lists the results', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await openDialog(user)

    const field = screen.getByRole('textbox', { name: 'Search documentation' })
    await user.type(field, 'market')

    const region = screen.getByRole('dialog').querySelector('[aria-live="polite"]')
    expect(region?.textContent).toContain('1')
    expect(region?.textContent).toContain(MESSAGES.one)

    const list = screen.getByRole('dialog').querySelector('ul')
    expect(list?.querySelectorAll('li')).toHaveLength(1)
  })

  it('sets its field at 16px below md, so a phone does not zoom the page on focus', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await openDialog(user)

    const field = screen.getByRole('textbox', { name: 'Search documentation' })
    // The pair `Input`, `Textarea`, `Combobox`, `Form` and `NumberField` all
    // carry, and the reason is iOS Safari rather than a visual one: it zooms the
    // viewport on a focused input whose computed font size is under 16 pixels and
    // does not zoom back out, so a reader who opened the dialog on a phone was
    // left on a magnified page. jsdom computes nothing, so what is asserted is
    // the pair itself.
    expect(field.className.split(' ')).toContain('text-base')
    expect(field.className.split(' ')).toContain('md:text-sm')
  })

  it('has no accessibility violations when it is open', async () => {
    const user = userEvent.setup()
    const { container } = render(<Example />)
    await openDialog(user)

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})