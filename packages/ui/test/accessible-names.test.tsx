import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Breadcrumb } from '../src/components/ui/breadcrumb'
import { Dialog, DialogContent, DialogTitle } from '../src/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../src/components/ui/pagination'

/**
 * The accessible names a control ships are the consumer's words.
 *
 * Four controls had one: two pagination step labels whose visible text was already
 * a prop while the announced name was not, the same control's region name, the
 * dialog's close button, and the breadcrumb's region name. The defect they share is
 * not English, it is asymmetry: a caller can localise what a reader sees and not
 * what a screen reader announces, which leaves a control that looks localised and
 * is half of it.
 *
 * So the claims under test are that each name is a prop, that a caller replacing
 * the visible text replaces the announced name with it, and that a name Prism
 * still owns ships as the word Prism would have used rather than as nothing. A
 * missing name and a wrong name are different defects and the last claim is what
 * separates them.
 */
describe('the accessible names a control ships', () => {
  it('names the breadcrumb region from a prop, and defaults it rather than omitting it', () => {
    const { rerender } = render(<Breadcrumb />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()

    rerender(<Breadcrumb label="Trail" />)
    expect(screen.getByRole('navigation', { name: 'Trail' })).toBeTruthy()
  })

  it('names the pagination region from a prop, and defaults it', () => {
    const { rerender } = render(
      <Pagination>
        <PaginationContent />
      </Pagination>,
    )
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy()

    rerender(
      <Pagination label="Result pages">
        <PaginationContent />
      </Pagination>,
    )
    expect(screen.getByRole('navigation', { name: 'Result pages' })).toBeTruthy()
  })

  it('moves the pagination step text and the step name together', () => {
    // Queried by the attribute rather than by a role, because the step renders a
    // bare `<a>` with no `href` and therefore has no `link` role. That is the
    // Component's own state and it is worth naming here rather than working around
    // silently: a step is expected to be given an `href` by its caller, and a
    // caller who does not gets an element that is announced by its name and
    // activates by nothing.
    const byName = (name: string) => document.querySelector(`[aria-label="${name}"]`)

    const { rerender } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(byName('Go to the previous page')?.textContent).toContain('Previous')
    expect(byName('Go to the next page')?.textContent).toContain('Next')

    rerender(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious text="Zurück" label="Zur vorherigen Seite" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext text="Weiter" label="Zur nächsten Seite" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(byName('Zur vorherigen Seite')?.textContent).toContain('Zurück')
    // And the English is gone from both places, which is the half of the old state
    // that a test asserting only the new name would not catch.
    expect(byName('Go to the previous page')).toBeNull()
    expect(screen.queryByText('Previous')).toBeNull()
    expect(byName('Zur nächsten Seite')?.textContent).toContain('Weiter')
    expect(byName('Go to the next page')).toBeNull()
  })

  it('names the dialog close control from a prop, and defaults it', () => {
    const renderDialog = (closeLabel?: string) => (
      <Dialog open>
        <DialogContent closeLabel={closeLabel}>
          <DialogTitle>A title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const first = render(renderDialog())
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
    first.unmount()

    render(renderDialog('Dismiss'))
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy()
    // A localised dialog whose only dismiss control still announces English is
    // the defect, so the default must not survive alongside the caller's word.
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('lets a caller omit a close control entirely, so the word is not the only way out', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>A title</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })
})
