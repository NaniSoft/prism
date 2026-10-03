'use client'

import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu'
import { ChevronDownIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the NavigationMenu root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface NavigationMenuProps extends Omit<ComponentProps<'nav'>, 'defaultValue'> {
  /**
   * The accessible name of this region of links.
   *
   * Required rather than defaulted, because the root renders a `<nav>`, and a
   * `<nav>` with no name is a landmark a screen reader announces only as
   * "navigation". A site header's primary links and a footer link list are both
   * `<nav>`, and a reader moving between them is told nothing about which is
   * which. The name is the caller's word and it is usually the region: primary,
   * product, footer.
   */
  label: string
  /** The controlled value of the open group. */
  value?: string | null
  /** The group open initially, for an uncontrolled menu. */
  defaultValue?: string | null
  /** Called when the open group changes. */
  onValueChange?: (value: string | null) => void
  /** Whether the groups stack. @defaultValue horizontal */
  orientation?: 'horizontal' | 'vertical'
  /**
   * How long the pointer must rest on a trigger before the group opens, in
   * milliseconds.
   *
   * The default is short because this is a menu of links rather than of
   * previews: the reader is about to take one of these addresses, and a rest
   * followed by a long wait is a rest they will conclude did nothing.
   *
   * @defaultValue 50
   */
  delay?: number
  /** How long the group stays open after the pointer leaves it, in milliseconds. @defaultValue 50 */
  closeDelay?: number
}

/** The props NavigationMenuList forwards to Base UI. */
export interface NavigationMenuListProps extends ComponentProps<'ul'> {}

/**
 * The props NavigationMenuItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface NavigationMenuItemProps extends ComponentProps<'li'> {
  /** The value this item contributes to the root, and the value its trigger opens. */
  value: string
}

/** The props NavigationMenuTrigger forwards to Base UI. */
export interface NavigationMenuTriggerProps extends ComponentProps<'button'> {}

/** The props NavigationMenuContent forwards to Base UI. */
export interface NavigationMenuContentProps extends ComponentProps<'div'> {
  /**
   * Whether the closed group stays in the DOM.
   *
   * A navigation menu is the one overlay here a crawler reads. Every other
   * popup is unmounted when closed, and that is right for them, but a closed
   * navigation group holding the links of a site header is the only place a
   * reader, a crawler and a reader with JavaScript off all see the same set of
   * addresses, so a consumer who needs the header to read the same either way
   * turns this on and owns the layout shift that follows.
   *
   * @defaultValue false
   */
  keepMounted?: boolean
}

/**
 * The props NavigationMenuLink forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface NavigationMenuLinkProps extends ComponentProps<'a'> {
  /**
   * Whether this link is the page the reader is on.
   *
   * Required, and required for a reason a colour cannot express: a navigation
   * menu that does not say where the reader is has made them guess. It is
   * rendered as `aria-current="page"` rather than as a fill, so a reader who
   * cannot distinguish the active colour still knows they are in the right
   * place, and so the marking survives a theme change.
   */
  active?: boolean
  /** Whether taking the link closes the group. @defaultValue false */
  closeOnClick?: boolean
}

/** The props NavigationMenuIcon forwards to Base UI. */
export interface NavigationMenuIconProps extends ComponentProps<'span'> {}

/**
 * The props NavigationMenuPortal forward to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface NavigationMenuPortalProps extends ComponentProps<'div'> {}

/** The props NavigationMenuPositioner forwards to Base UI. */
export interface NavigationMenuPositionerProps extends ComponentProps<'div'> {
  /** The distance in pixels between the trigger and the group. @defaultValue 8 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/** The props NavigationMenuPopup forwards to Base UI. */
export interface NavigationMenuPopupProps extends ComponentProps<'nav'> {}

/** The props NavigationMenuViewport forwards to Base UI. */
export interface NavigationMenuViewportProps extends ComponentProps<'div'> {}

/** The props NavigationMenuBackdrop forwards to Base UI. */
export interface NavigationMenuBackdropProps extends ComponentProps<'div'> {}

/**
 * A list of links with groups that expand and collapse.
 *
 * **It knows it holds links, and that is what every part is for.** A link can be
 * opened in a new tab, copied by address, middle-clicked and crawled; a command
 * cannot do any of those, and a menu that renders a command where a reader
 * expected a destination gives them a middle-click that does nothing. So
 * `NavigationMenuLink` is the only interactive leaf here and it is a native
 * anchor, there is no command part to reach for by mistake, and a caller who
 * wants commands in a header is using a Menubar or a DropdownMenu instead.
 * `active` is a required prop on the link because a navigation menu that does
 * not say where the reader is has made them guess.
 *
 * **A closed group shows nothing, and that is deliberate.** The list is a
 * `<ul>` of triggers, and the links live in a group that is only in the document
 * while it is open. A reader with JavaScript off, and a crawler, therefore see
 * the triggers and nothing else, which is why `NavigationMenuContent` takes
 * `keepMounted` for the consumer who needs the header to read the same either
 * way and owns the layout shift that follows. Do not put a destination only in
 * a closed group.
 *
 * The bar is one Tab stop: Tab moves through the triggers and into the open
 * group, Escape closes the group and returns focus to the trigger that opened
 * it. Use a Menubar for an application window's commands and a DropdownMenu for
 * a menu attached to one control.
 */
function NavigationMenu({ className, label, orientation = 'horizontal', ...props }: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      aria-label={label}
      orientation={orientation}
      className={cn(
        'relative flex max-w-max flex-1 items-center justify-center',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

/** The row of group triggers. */
function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'flex flex-1 list-none items-center gap-1',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

/** One group: a trigger and the links it opens. */
function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  )
}

/**
 * The control that opens a group, and the only Tab stop for it.
 *
 * It is a real button and it owns the expanded state, so a reader knows the
 * group is open before they enter it. The chevron rotates on the open state
 * rather than on a timer, which is the only motion here: something happened and
 * the reader can see that it did.
 *
 * `pointer-coarse:h-11` is the coarse-pointer floor, as a step. The groups sit beside
 * each other along the list with a `gap-1`, so a band on one trigger is a press aimed
 * at its neighbour, which is condition 1 of the three in `DESIGN.md` failing. The cost
 * is that the bar is 44 tall on touch rather than 36, and a navigation bar that a
 * finger has to hit is the last thing that should still be 36. See The coarse-pointer
 * floor.
 */
function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        'text-foreground group inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,background-color,box-shadow] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[popup-open]:bg-accent/60 data-[popup-open]:text-accent-foreground',
        'pointer-coarse:h-11',
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuIcon>
        <ChevronDownIcon className="size-4 transition-transform duration-base ease-out group-data-[popup-open]:rotate-180" />
      </NavigationMenuIcon>
    </NavigationMenuPrimitive.Trigger>
  )
}

/** The group of links a trigger opens. */
function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn('p-2', className)}
      {...props}
    />
  )
}

/**
 * One destination, rendered as a native anchor.
 *
 * This is the only interactive leaf the Component ships, and the reason is the
 * difference between a link and a command: a link carries an address, so the
 * browser can open it in a new tab, copy it, and a crawler can follow it. A
 * command has none of those, and a header that renders commands where a reader
 * expected destinations is a header whose links cannot be shared.
 */
function NavigationMenuLink({ className, active, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      active={active}
      className={cn(
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-[3px] block rounded-md px-3 py-2 text-sm outline-none',
        'transition-[color,background-color,box-shadow] duration-fast ease-out',
        'data-[active]:bg-accent data-[active]:text-accent-foreground data-[active]:font-medium',
        className,
      )}
      {...props}
    />
  )
}

/** The chevron slot, so a caller can put their own mark beside a trigger's words. */
function NavigationMenuIcon({ className, ...props }: NavigationMenuIconProps) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-icon"
      className={cn('flex size-4 items-center justify-center', className)}
      {...props}
    />
  )
}

/** The portal the open group is rendered into. */
function NavigationMenuPortal({ ...props }: NavigationMenuPortalProps) {
  return <NavigationMenuPrimitive.Portal {...props} />
}

/** The positioned wrapper around the open group. */
function NavigationMenuPositioner({
  className,
  sideOffset = 8,
  alignOffset = 0,
  ...props
}: NavigationMenuPositionerProps) {
  return (
    <NavigationMenuPrimitive.Positioner
      data-slot="navigation-menu-positioner"
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={cn('z-50', className)}
      {...props}
    />
  )
}

/** The surface the open group sits on. */
function NavigationMenuPopup({ className, ...props }: NavigationMenuPopupProps) {
  return (
    <NavigationMenuPrimitive.Popup
      data-slot="navigation-menu-popup"
      className={cn(
        'bg-popover text-popover-foreground origin-(--transform-origin) rounded-lg border p-2 shadow-md outline-none',
        'transition-[opacity,transform] duration-base ease-out',
        'focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
        'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

/** The area one group's content is measured and animated in. */
function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-viewport"
      className={cn('relative h-full w-full overflow-hidden', className)}
      {...props}
    />
  )
}

/** The scrim behind an open group, so the page behind does not read as live. */
function NavigationMenuBackdrop({ className, ...props }: NavigationMenuBackdropProps) {
  return (
    <NavigationMenuPrimitive.Backdrop
      data-slot="navigation-menu-backdrop"
      className={cn('fixed inset-0 z-40 bg-background/40 transition-opacity duration-base ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0', className)}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIcon,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuPopup,
  NavigationMenuViewport,
  NavigationMenuBackdrop,
}
