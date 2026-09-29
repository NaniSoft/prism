'use client'

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the AlertDialog root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 *
 * `modal` and `disablePointerDismissal` are absent on purpose, and their absence
 * is the Component rather than an oversight. Base UI hard-wires both to true for
 * an alert dialog and omits them from the root's prop type, so there is no value
 * a caller can pass that turns a must-answer decision into something a stray
 * click can wave through. A caller who wants a dismissible surface is asking for
 * a Dialog, and the type is how they are told so.
 */
export interface AlertDialogProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled alert dialog. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** The trigger and content. */
  children?: React.ReactNode
}

/** The props AlertDialogTrigger forwards to Base UI. */
export interface AlertDialogTriggerProps extends ComponentProps<'button'> {}

/**
 * The props AlertDialogContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface AlertDialogContentProps extends ComponentProps<'div'> {}

/** The props AlertDialogHeader forwards to a plain container. */
export interface AlertDialogHeaderProps extends ComponentProps<'div'> {}

/** The props AlertDialogFooter forwards to a plain container. */
export interface AlertDialogFooterProps extends ComponentProps<'div'> {}

/** The props AlertDialogTitle forwards to Base UI. */
export interface AlertDialogTitleProps extends ComponentProps<'h2'> {}

/** The props AlertDialogDescription forwards to Base UI. */
export interface AlertDialogDescriptionProps extends ComponentProps<'p'> {}

/**
 * The action, which is the one button that must exist.
 *
 * It is styled rather than left bare because a caller who forgets to style it
 * ships the one control a reader is about to press as unlabelled text, and the
 * default is `destructive` because an alert dialog whose action is not
 * destructive had no reason to interrupt in the first place. Pass
 * `variant="default"` and reconsider whether the decision needed to interrupt.
 */
export interface AlertDialogActionProps extends ComponentProps<'button'> {
  /** How the action reads against the decision it confirms. @defaultValue destructive */
  variant?: 'default' | 'destructive'
}

/** The props AlertDialogCancel forwards to Base UI. */
export interface AlertDialogCancelProps extends ComponentProps<'button'> {}

/** The action's own button treatment, because the one button that must exist is this one. */
const ACTION_VARIANTS = {
  default: 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const

/**
 * A dialog that interrupts, and will not let the reader out of it by accident.
 *
 * **The difference from a Dialog is the whole Component.** A Dialog closes on an
 * outside press, because a reader who clicks away from a task has said "not now"
 * and the task is still there when they come back. An alert dialog exists for a
 * decision that a mis-click would answer: deleting a project, discarding a draft,
 * ending a session. An outside press there is a stray gesture that silently
 * chooses for the reader, so Base UI hard-wires dismissal off and this Component
 * does not expose a prop that could turn it back on. Escape still closes it,
 * because a keyboard reader must always have a way out, and a reader who
 * presses Escape has said the same thing deliberately.
 *
 * **The two buttons are the only other way out, and the action is required.**
 * There is no dismiss control in the corner: an X on a surface whose subject is a
 * decision is a third answer to a question the reader was told has two. Give it
 * an `AlertDialogCancel` and an `AlertDialogAction`, always in that order, with
 * the action last so it is the one a keyboard reader lands on second and the
 * destructive one styled as such.
 *
 * **Always give it an `AlertDialogTitle`.** It names the dialog for every
 * reader, and it is what the surface is announced as. Use a Dialog for a short
 * task; use an AlertDialog only where the answer is not safely deferrable.
 */
function AlertDialog({ ...props }: AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props} />
}

/** The element that opens the alert dialog. */
function AlertDialogTrigger({ className, ...props }: AlertDialogTriggerProps) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      className={cn(
        'bg-background shadow-xs inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** The alert dialog panel, its backdrop and its portal. */
function AlertDialogContent({ className, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
      />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          className={cn(
            'bg-background shadow-md relative grid w-full max-w-md gap-4 rounded-xl border p-6 outline-none',
            'transition-[opacity,transform] duration-base ease-out',
            'focus-visible:ring-ring focus-visible:ring-[3px]',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  )
}

/** The alert dialog's heading area, above the body. */
function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/** The alert dialog's two buttons, side by side. */
function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

/** The alert dialog's heading. It names the dialog for assistive technology. */
function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

/**
 * The consequence, in the reader's words, before the buttons.
 *
 * This is where the answerable question goes: what happens, to what, and whether
 * it can be taken back. A description that only restates the title gives the
 * reader a decision with nothing to decide on.
 */
function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * The button that carries out the decision, and closes the dialog with it.
 *
 * It is styled rather than left bare because a caller who forgets to style it
 * ships the one control a reader is about to press as unlabelled text, and the
 * default is `destructive` because an alert dialog whose action is not
 * destructive had no reason to interrupt in the first place.
 */
function AlertDialogAction({ className, variant = 'destructive', ...props }: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      data-variant={variant}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        ACTION_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

/** The button that leaves the decision unmade, and closes the dialog. */
function AlertDialogCancel({ className, ...props }: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(
        'bg-background inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,box-shadow,background-color] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
