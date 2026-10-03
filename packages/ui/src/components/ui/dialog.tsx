'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import type { ComponentProps, RefObject } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the Dialog root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DialogProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled dialog. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Called after the open state change has finished animating, in both
   * directions.
   *
   * Named because "the state changed" and "the panel has finished coming and
   * going" are different moments, and a caller that unmounts on the first one
   * takes the exit transition with it. It fires once the animations the panel
   * declared have ended, and it fires immediately when there were none: a
   * consumer whose own stylesheet removes transitions still gets told.
   */
  onOpenChangeComplete?: (open: boolean) => void
  /** Whether the dialog is modal. @defaultValue true */
  modal?: boolean | 'trap-focus'
  /** The trigger and content. */
  children?: React.ReactNode
}

/** The props DialogTrigger forwards to Base UI. */
export interface DialogTriggerProps extends ComponentProps<'button'> {}

/**
 * The props DialogContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DialogContentProps extends ComponentProps<'div'> {
  /**
   * Where the dialog is anchored.
   *
   * `center` is a modal card; `top`, `bottom`, `left` and `right` anchor the
   * panel to an edge as a sheet, which is the old drawer re-expressed.
   * @defaultValue center
   */
  side?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  /** Whether the built-in close control is rendered. @defaultValue true */
  showCloseButton?: boolean
  /**
   * The accessible name of the built-in close control, when it is rendered.
   *
   * A prop and not a fixed word, because a consumer that localises its dialog
   * cannot otherwise localise the one control that dismisses it, and a dialog
   * that announces "Close" in a product that never uses that word is a control
   * the consumer cannot fix.
   *
   * @defaultValue 'Close'
   */
  closeLabel?: string
  /**
   * The element that takes focus when the dialog opens.
   *
   * Left out, the panel focuses its first tabbable element, which is right for
   * a dialog whose first control is the one the reader came for. It is named
   * here for the dialog whose first tabbable element is not that control: a
   * search field, where the reader opened the dialog to type and where the
   * dialog wants the field rather than whatever the panel happens to draw
   * first. A ref and not an element because the panel does not exist until the
   * portal commits.
   */
  initialFocus?: RefObject<HTMLElement | null>
}

/** The props DialogHeader forwards to a plain container. */
export interface DialogHeaderProps extends ComponentProps<'div'> {}

/** The props DialogFooter forwards to a plain container. */
export interface DialogFooterProps extends ComponentProps<'div'> {}

/** The props DialogTitle forwards to Base UI. */
export interface DialogTitleProps extends ComponentProps<'h2'> {}

/** The props DialogDescription forwards to Base UI. */
export interface DialogDescriptionProps extends ComponentProps<'p'> {}

/** The props DialogClose forwards to Base UI. */
export interface DialogCloseProps extends ComponentProps<'button'> {}

const VIEWPORT: Record<NonNullable<DialogContentProps['side']>, string> = {
  center: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  top: 'fixed inset-x-0 top-0 z-50 flex justify-center',
  bottom: 'fixed inset-x-0 bottom-0 z-50 flex justify-center',
  left: 'fixed inset-y-0 left-0 z-50 flex',
  right: 'fixed inset-y-0 right-0 z-50 flex',
}

/**
 * The panel a dialog draws at each side.
 *
 * The two widths are authored container tokens rather than steps of a size scale,
 * because an overlay's width is a property of the kind of surface it is and not of
 * the page grid underneath it. `overlay-panel` is the side sheet, which is a panel
 * beside the work; `overlay-dialog` is the centred card, which is a decision or a
 * short task. Both used to be spelled with Tailwind's own container steps, which
 * ship at the same values, so nothing rendered differently and a retune of the
 * authored token would have moved one spelling and not the other.
 */
const POPUP: Record<NonNullable<DialogContentProps['side']>, string> = {
  center:
    'w-full max-w-overlay-dialog rounded-xl border data-[starting-style]:scale-95 data-[ending-style]:scale-95',
  top: 'w-full rounded-b-xl border-x border-b data-[starting-style]:-translate-y-4 data-[ending-style]:-translate-y-4',
  bottom:
    'w-full rounded-t-xl border-x border-t data-[starting-style]:translate-y-4 data-[ending-style]:translate-y-4',
  left: 'h-full w-3/4 max-w-overlay-panel rounded-r-xl border-y border-r data-[starting-style]:-translate-x-4 data-[ending-style]:-translate-x-4',
  right:
    'h-full w-3/4 max-w-overlay-panel rounded-l-xl border-y border-l data-[starting-style]:translate-x-4 data-[ending-style]:translate-x-4',
}

/**
 * A modal surface that interrupts the page.
 *
 * The dialog traps focus while it is open, locks page scroll, closes on
 * Escape and on an outside press, and returns focus to its trigger when it
 * closes. Always give it a `DialogTitle`, which names the dialog for every
 * reader. Use a Dialog for a decision or a short task; for content that is
 * not a task, use a Popover or navigate to a page.
 *
 * The built-in close control is 16px for a mouse and a trackpad and takes the
 * 44px coarse-pointer floor on touch input, without moving on screen: it stays in
 * the panel's top-right corner and the panel's own padding stays what it is. Pass
 * `showCloseButton={false}` and draw your own control when a dialog's header runs
 * the full width of its panel, which is what `search-dialog.tsx` does.
 */
function Dialog({ ...props }: DialogProps) {
  return <DialogPrimitive.Root {...props} />
}

/** The element that opens the dialog. */
function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      className={cn(
        'bg-background shadow-xs inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none',
        // The same step `Button`'s `default` size takes, and this string is that
        // size's string: the trigger here was written as a copy of it and the copy
        // did not bring the coarse-pointer floor with it, which left a dialog's
        // own trigger below both the 44px standard and its own trigger on desktop.
        'pointer-coarse:h-11 pointer-coarse:min-w-11',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** The dialog panel, its backdrop and its portal. */
function DialogContent({
  className,
  side = 'center',
  showCloseButton = true,
  closeLabel = 'Close',
  initialFocus,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
      />
      <DialogPrimitive.Viewport data-slot="dialog-viewport" className={VIEWPORT[side]}>
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          initialFocus={initialFocus}
          className={cn(
            'bg-background shadow-md relative grid gap-4 p-6 outline-none',
            'transition-[opacity,transform] duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
            POPUP[side],
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label={closeLabel}
              className={cn(
                'ring-offset-background focus-visible:ring-ring absolute top-4 right-4 flex items-center justify-center rounded-sm opacity-70 outline-none',
                // The floor, as a coarse-pointer step. A dialog is the one surface where
                // growing a control is more constrained than it looks, because the
                // close button is absolutely positioned in the panel's top-right corner
                // and a 44px box at a 16px inset overhangs the panel's own 24px padding
                // into the header. What it reaches there is the empty right-hand end of
                // the title row, and the answer for a dialog whose header does reach
                // there is `showCloseButton={false}` and a close control of the caller's
                // own, which `search-dialog.tsx` draws in its field row. A band was the
                // other option and it is worse: at a 16px corner inset any 44px band
                // hangs off the panel, and on a phone the panel is the viewport minus
                // its own gutter, so the overhang is clipped by the screen.
                'transition-opacity duration-fast ease-out hover:opacity-100 focus-visible:ring-[3px]',
                'pointer-coarse:size-11',
                'disabled:pointer-events-none',
              )}
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

/** The dialog's heading area, above the body. */
function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/** The dialog's action area, below the body. */
function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

/** The dialog's heading. It names the dialog for assistive technology. */
function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

/** A supporting line under the title. */
function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/** A control that closes the dialog from inside its content. */
function DialogClose({ className, ...props }: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
