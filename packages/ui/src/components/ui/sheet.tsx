'use client'

import type { ComponentProps } from 'react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog'

/** The props the Sheet root forwards to the Dialog. */
export interface SheetProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled sheet. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** The trigger and the panel. */
  children?: React.ReactNode
}

/** The props SheetTrigger forwards to the Dialog trigger. */
export interface SheetTriggerProps extends ComponentProps<'button'> {}

/**
 * The props SheetContent forwards to the Dialog.
 *
 * `side` is not defaulted here even though the Dialog defaults it to `center`,
 * because a sheet with no declared edge is a centred dialog wearing a different
 * name. The four edges are the whole of what separates a sheet from a modal
 * card, and making the caller name one is what stops the Component from quietly
 * rendering a centred card in a product that believes it shipped a panel.
 */
export interface SheetContentProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Which edge of the viewport the panel is anchored to. */
  side: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Whether the built-in close control is rendered. @defaultValue true
   *
   * A sheet is expected to be dismissible, so the control is on by default and
   * turning it off is a decision the caller has to make rather than inherit.
   */
  showCloseButton?: boolean
  /**
   * The accessible name of the built-in close control, when it is rendered.
   *
   * A prop for the same reason the Dialog's is: a consumer that localises its
   * product cannot otherwise localise the one control that dismisses the panel,
   * and a panel that announces an English word in a product that never uses that
   * word is a control the consumer cannot fix.
   *
   * @defaultValue 'Close'
   */
  closeLabel?: string
  /** The panel's own contents. */
  children?: React.ReactNode
}

/** The props SheetHeader forwards to a plain container. */
export interface SheetHeaderProps extends ComponentProps<'div'> {}

/** The props SheetFooter forwards to a plain container. */
export interface SheetFooterProps extends ComponentProps<'div'> {}

/** The props SheetTitle forwards to the Dialog. */
export interface SheetTitleProps extends ComponentProps<'h2'> {}

/** The props SheetDescription forwards to the Dialog. */
export interface SheetDescriptionProps extends ComponentProps<'p'> {}

/** The props SheetClose forwards to the Dialog. */
export interface SheetCloseProps extends ComponentProps<'button'> {}

/**
 * A panel anchored to an edge of the viewport.
 *
 * **It is the Dialog with an edge, and it inherits the Dialog's behaviour rather
 * than reimplementing it.** Focus trapping, Escape, the portal, the scroll lock,
 * the backdrop and the return of focus to the trigger are six behaviours that are
 * already correct in the Dialog, and a panel that rolled its own overlay would
 * be a second answer to all six questions, with the second answer being the one
 * that ships the bug. What the sheet adds is the decision a consumer would
 * otherwise get wrong: a panel has a side, and the side is named here rather
 * than defaulted, so a drawer cannot arrive as a centred card with a different
 * name on it.
 *
 * **A sheet dismisses on an outside press, and that is the difference from an
 * alert dialog.** A sheet holds navigation, filters, a detail view: a reader who
 * clicks away from it has said "not now", and the content behind is still there
 * when they come back. If the answer to the sheet cannot safely be deferred, use
 * an AlertDialog, which will not dismiss on a stray press.
 *
 * Always give it a `SheetTitle`, which names the panel for every reader. Use a
 * Dialog for a short task that belongs in the middle of the page, and a Menubar
 * or a NavigationMenu for the top of an application.
 */
function Sheet({ ...props }: SheetProps) {
  return <Dialog {...props} />
}

/** The element that opens the sheet. */
function SheetTrigger({ className, ...props }: SheetTriggerProps) {
  return <DialogTrigger data-slot="sheet-trigger" className={className} {...props} />
}

/** The anchored panel, its backdrop and its portal, over the Dialog's overlay. */
function SheetContent({
  className,
  side,
  showCloseButton = true,
  closeLabel = 'Close',
  ...props
}: SheetContentProps) {
  return (
    <DialogContent
      data-slot="sheet-content"
      side={side}
      showCloseButton={showCloseButton}
      closeLabel={closeLabel}
      className={className}
      {...props}
    />
  )
}

/** The sheet's heading area, above the body. */
function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return <div data-slot="sheet-header" className={className} {...props} />
}

/** The sheet's action area, below the body. */
function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <div data-slot="sheet-footer" className={className} {...props} />
}

/** The sheet's heading. It names the panel for assistive technology. */
function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <DialogTitle data-slot="sheet-title" className={className} {...props} />
}

/** A supporting line under the title. */
function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <DialogDescription data-slot="sheet-description" className={className} {...props} />
}

/** A control that closes the sheet from inside its content. */
function SheetClose({ className, ...props }: SheetCloseProps) {
  return <DialogClose data-slot="sheet-close" className={className} {...props} />
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
}
