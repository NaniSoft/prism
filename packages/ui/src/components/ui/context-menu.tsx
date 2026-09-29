'use client'

import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu'
import { ChevronRightIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The menu surface's own class string, shared by the top level and a submenu.
 *
 * The panel takes focus when the menu opens, so it is a focusable element and it
 * draws the focus ring at full strength rather than suppressing the outline and
 * inheriting nothing. A menu item carries `role="menuitem"` and Base UI moves a
 * highlighted state through the list instead of a DOM focus ring, so the ring
 * belongs here and nowhere else in the surface.
 */
const POPUP =
  'bg-popover text-popover-foreground z-50 max-h-(--available-height) min-w-40 overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none transition-[opacity,transform] duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

/** One row in a context menu, whether it is a command or a link. */
const ROW =
  'focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4'

/**
 * The props the ContextMenu root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface ContextMenuProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled context menu. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** The area the menu belongs to, and the menu itself. */
  children?: React.ReactNode
}

/**
 * The props ContextMenuTrigger forwards to Base UI.
 *
 * The trigger is an area, not a control. It renders a `<div>` and carries no
 * role of its own, because there is no gesture a keyboard reader can be taught
 * to perform here that is not already a shortcut, and an element that pretends
 * to be a button and is not one is a lie the Tab order then repeats.
 */
export interface ContextMenuTriggerProps extends ComponentProps<'div'> {}

/**
 * The props ContextMenuContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface ContextMenuContentProps extends ComponentProps<'div'> {
  /**
   * The accessible name of this menu, read before its rows.
   *
   * Required rather than defaulted, because a context menu is opened by a
   * gesture on a region rather than by a control the reader chose, so nothing
   * on the page has already named it. Three menus in one table, each announced
   * as "menu", is a page where a screen reader user cannot tell which surface
   * they are in. The name says what the menu acts on, and it is the caller's
   * word because only the caller knows what the region is.
   */
  label: string
  /** The distance in pixels between the pointer and the menu. @defaultValue 0 */
  sideOffset?: number
  /** The distance in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/** The props ContextMenuItem forwards to Base UI. */
export interface ContextMenuItemProps extends ComponentProps<'div'> {
  /** Whether the item reads as a destructive action. @defaultValue default */
  variant?: 'default' | 'destructive'
  /** Whether the item ignores user interaction. */
  disabled?: boolean
}

/** The props ContextMenuLinkItem forwards to Base UI. */
export interface ContextMenuLinkItemProps extends ComponentProps<'a'> {
  /** Whether the link reads as a destructive action. @defaultValue default */
  variant?: 'default' | 'destructive'
}

/** The props ContextMenuLabel forwards to Base UI. */
export interface ContextMenuLabelProps extends ComponentProps<'div'> {}

/** The props ContextMenuSeparator forwards to Base UI. */
export interface ContextMenuSeparatorProps extends ComponentProps<'div'> {}

/** The props ContextMenuGroup forwards to Base UI. */
export interface ContextMenuGroupProps extends ComponentProps<'div'> {}

/** The props ContextMenuSub forwards to Base UI. */
export interface ContextMenuSubProps {
  /** The controlled open state of the submenu. */
  open?: boolean
  /** The initially open state of the submenu. */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** The submenu trigger and its content. */
  children?: React.ReactNode
}

/** The props ContextMenuSubTrigger forwards to Base UI. */
export interface ContextMenuSubTriggerProps extends ComponentProps<'div'> {}

/** The props ContextMenuSubContent forwards to Base UI. */
export interface ContextMenuSubContentProps extends ComponentProps<'div'> {
  /** The distance in pixels between the submenu and the trigger. @defaultValue 0 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/**
 * A menu of commands opened by the secondary pointer gesture over a region.
 *
 * **It knows whether each row is a command or a destination, and so should the
 * caller.** `ContextMenuItem` is a command: a `<div>` with `role="menuitem"`,
 * operated by click or Enter, doing something. `ContextMenuLinkItem` is a
 * destination: a real `<a href>`, so it can be opened in a new tab, copied by
 * address, and crawled. A context menu holding "Copy link" beside "Open in new
 * tab" is the case that gets a consumer's product wrong, because the second is
 * the one a reader expects to middle-click. Splitting the two into two parts is
 * what makes that decision visible at the call site rather than at the review.
 *
 * **Nothing here is the only route to a command.** The gesture is secondary: it
 * is unreachable by a keyboard and undiscoverable by a touch reader, so every
 * row here must be reachable somewhere else on the page. The trigger is a plain
 * `<div>` with no role for the same reason: an element that looks like a button
 * and is not one teaches a reader a gesture that then does nothing.
 *
 * The menu is navigable with the arrow keys and with typeahead, and Escape or an
 * outside press closes it. A menu is a list of commands, so a command belonging
 * on the surface belongs on the surface, not behind a right-click.
 */
function ContextMenu({ ...props }: ContextMenuProps) {
  return <ContextMenuPrimitive.Root {...props} />
}

/**
 * The region the menu belongs to. A secondary press inside it opens the menu.
 *
 * It renders a `<div>` and nothing more, because it is a region rather than a
 * control. Base UI also treats a long press as the open gesture, which is what
 * makes the menu reachable at all on a touch screen, and it is the reason a
 * context menu is an addition to a surface rather than a substitute for one.
 */
function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn(className)}
      {...props}
    />
  )
}

/** The floating menu surface, opened at the pointer. */
function ContextMenuContent({
  className,
  label,
  sideOffset = 0,
  alignOffset = 0,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner sideOffset={sideOffset} alignOffset={alignOffset}>
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          aria-label={label}
          className={cn(POPUP, className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

/** One command in the menu. It does something rather than going somewhere. */
function ContextMenuItem({ className, variant = 'default', ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-variant={variant}
      className={cn(
        ROW,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10',
        className,
      )}
      {...props}
    />
  )
}

/**
 * One destination in the menu, rendered as a native anchor.
 *
 * A link is a `<a href>` and nothing else, so the browser's own affordances
 * apply: middle-click opens it in a new tab, and "copy link address" copies a
 * real address. A command styled as a link has neither, and a reader who
 * middle-clicks a `div` gets nothing at all.
 */
function ContextMenuLinkItem({ className, variant = 'default', ...props }: ContextMenuLinkItemProps) {
  return (
    <ContextMenuPrimitive.LinkItem
      data-slot="context-menu-link-item"
      data-variant={variant}
      className={cn(
        ROW,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10',
        className,
      )}
      {...props}
    />
  )
}

/** A non-interactive heading inside a group of rows. */
function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      className={cn('px-2 py-1.5 text-xs font-medium', className)}
      {...props}
    />
  )
}

/** A rule between groups of rows. */
function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

/** A labelled set of related rows. */
function ContextMenuGroup({ className, ...props }: ContextMenuGroupProps) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" className={cn(className)} {...props} />
  )
}

/** A group of rows that opens into a second menu. */
function ContextMenuSub({ ...props }: ContextMenuSubProps) {
  return <ContextMenuPrimitive.SubmenuRoot {...props} />
}

/** The row that opens a submenu. */
function ContextMenuSubTrigger({ className, children, ...props }: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      className={cn(ROW, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

/** The nested menu surface. */
function ContextMenuSubContent({ className, sideOffset = 0, alignOffset = 0, ...props }: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner sideOffset={sideOffset} alignOffset={alignOffset}>
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-sub-content"
          className={cn(POPUP, className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
}
