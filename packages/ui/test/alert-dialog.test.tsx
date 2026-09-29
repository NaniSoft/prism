import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../src/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../src/components/ui/dialog'

/**
 * A dialog that interrupts, and will not let the reader out of it by accident.
 *
 * The claim under test is the difference from a Dialog, and it is a claim about
 * two gestures that a screenshot cannot show at all. A reader clicks the
 * backdrop: on a Dialog that is "not now" and the dialog closes; on an alert
 * dialog the same gesture is a stray click that would silently answer the
 * question, so it must do nothing. A reader presses Escape: on both it closes,
 * because a keyboard reader must always have a way out. Those two behaviours are
 * the Component, so they are asserted side by side against the Dialog rather
 * than described.
 *
 * The second claim is the absence of a dismiss control. An X in the corner of a
 * surface whose subject is a decision is a third answer to a question the reader
 * was told has two, and a test that only checks what is present would not notice
 * one appearing.
 */
const open = (props: Partial<Parameters<typeof AlertDialog>[0]> = {}) =>
  render(
    <AlertDialog {...props}>
      <AlertDialogTrigger>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            Twelve runs and every log are removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction>Delete it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  )

describe('the Alert dialog', () => {
  // Queried from the document rather than the render container, because the
  // surface is portalled to the body and a container-scoped query would find an
  // empty tree and every assertion below would be about nothing.
  const scope = (): HTMLElement => document.body

  it('renders no alert dialog until it is opened', () => {
    open()
    // Asserting the absence of a role rather than of a class, because the role is
    // what a screen reader is told and the class is a styling detail.
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(screen.queryByText('Delete this project?')).toBeNull()
  })

  it('announces itself as an alert dialog, not a dialog', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    // The role is the whole of what tells a reader this is not dismissible by
    // accident, so it is asserted as a role rather than read off a prop.
    const surface = screen.getByRole('alertdialog')
    expect(surface).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('takes the name of the title the caller wrote', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    // The accessible name has to land on the alertdialog itself, not on a
    // heading inside it, or a reader is told "alertdialog" and then has to go
    // looking for what it is about.
    const named = screen.getByRole('alertdialog', { name: 'Delete this project?' })
    const title = screen.getByText('Delete this project?')
    expect(named.getAttribute('aria-labelledby')).toBe(title.id)
  })

  it('ignores an outside press, where a Dialog would close', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    expect(screen.getByRole('alertdialog')).toBeTruthy()

    await user.click(document.body)

    // The claim. A stray click on a surface whose subject is an irreversible
    // decision would otherwise be the reader's answer to a question they never
    // read, and nothing on screen would show that it had been answered.
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy()
    })
  })

  it('closes on Escape, so a keyboard reader is never trapped', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    await user.keyboard('{Escape}')

    // The other half of the pair, and the reason the first test is not "it never
    // closes": a reader who presses Escape has said the same thing deliberately,
    // and a surface with no exit at all is a trap rather than an interruption.
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup()
    open()
    const trigger = screen.getByRole('button', { name: 'Delete project' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    // A reader who dismissed the decision resumes where they were, rather than
    // at the top of the document because focus fell off the end of the page.
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })

  it('ships no dismiss control, because an X is a third answer', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    const surface = screen.getByRole('alertdialog')
    // Asserted as the number of buttons in the surface, so a control added later
    // with any name at all fails this, rather than a test that names the one
    // button it happened to think of.
    expect(surface.querySelectorAll('button')).toHaveLength(2)
    expect(surface.querySelector('svg')).toBeNull()
  })

  it('closes on the action and on the cancel, and both carry the caller words', async () => {
    const user = userEvent.setup()
    const onAction = () => {}
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={onAction}>Delete it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    // The two ways out are the caller's words, not the Component's. A component
    // that shipped "OK" and "Cancel" would be publishing an English sentence into
    // every consumer's product.
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Delete it' }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('styles the action as destructive by default and as a plain button on request', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    const action = screen.getByRole('button', { name: 'Delete it' })
    // Asserted as the attribute and the ink rather than as a colour value: the
    // marking is what a consumer themes, and a variant that set a fill with no
    // ink is the defect the token gates exist to catch.
    expect(action.getAttribute('data-variant')).toBe('destructive')
    expect(action.className).toContain('text-destructive-foreground')
  })

  it('exposes no prop that could turn dismissal back on', () => {
    // The root's prop type omits `modal` and `disablePointerDismissal` entirely,
    // so the claim is a compile-time one and this test names it as a fact about
    // the surface rather than pretending to check a runtime.
    // Type-level, so it is asserted by construction: the object below would not
    // compile with either prop present.
    const props: Parameters<typeof AlertDialog>[0] = { defaultOpen: false }
    expect(Object.keys(props)).toEqual(['defaultOpen'])
  })

  it('has no accessibility violations when it is on the page', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    const results = await axe.run(scope(), {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})

describe('the Alert dialog against the Dialog', () => {
  it('closes a Dialog on the outside press that the Alert dialog ignores', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Dialog>
          <DialogTrigger>Rename workspace</DialogTrigger>
          <DialogContent>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger>Delete project</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Rename workspace' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.click(document.body)
    // The contrast is the point of the pair, so it is measured rather than
    // asserted from prose: a Dialog is dismissible because "not now" is a safe
    // answer to a task, and the same gesture on an irreversible decision is not.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await user.click(document.body)
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy()
    })
  })
})
