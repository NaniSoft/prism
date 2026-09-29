'use client'

import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** The menu surface's own class string, shared by a top-level menu and a submenu. */
const POPUP =
  'bg-popover text-popover-foreground z-50 max-h-(--available-height) min-w-48 overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none transition-[opacity,transform] duration-fast ease-out focus-visible:ring-ring focus-visible:ring-[3px] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

/** One row in a menubar menu, whether it is a command or a link. */
const ROW =
  'focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4'

/**
 * The props Menubar forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface MenubarProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /**
   * The accessible name of the bar, read before its menus.
   *
   * Required rather than defaulted, because a menubar is a single Tab stop and
   * nothing on the page tells a screen reader it is there until focus lands on
   * it. A bar named "menu" beside a row of buttons named "menu" is a page where
   * a reader cannot tell which is which. The name is the caller's word, and it
   * is usually the application's own name, because that is what the bar acts on.
   */
  label: string
  /** Whether the bar is vertical rather than horizontal. @defaultValue horizontal */
  orientation?: 'horizontal' | 'vertical'
  /** Whether every menu in the bar ignores user interaction. @defaultValue false */
  disabled?: boolean
  /**
   * Whether an open menu makes the rest of the page inert.
   *
   * `true` by default, and the default is the right one for a bar: a menu that
   * leaves the page live is a menu a pointer reader can click straight through,
   * and an application menu bar is the one menu where the reader is expected to
   * be somewhere else while it is open.
   */
  modal?: boolean
  /** Whether the arrow keys wrap past the end of the bar. @defaultValue true */
  loopFocus?: boolean
}

/** The props MenubarMenu forwards to Base UI. */
export interface MenubarMenuProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled menu. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Whether this menu ignores user interaction. @defaultValue false */
  disabled?: boolean
  /** The trigger and the menu content. */
  children?: React.ReactNode
}

/** The props MenubarTrigger forwards to Base UI. */
export interface MenubarTriggerProps extends ComponentProps<'button'> {}

/**
 * The props MenubarContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface MenubarContentProps extends ComponentProps<'div'> {
  /** The distance in pixels between the trigger and the menu. @defaultValue 4 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/** The props MenubarItem forwards to Base UI. */
export interface MenubarItemProps extends ComponentProps<'div'> {
  /** Whether the item reads as a destructive action. @defaultValue default */
  variant?: 'default' | 'destructive'
  /** Whether the item ignores user interaction. */
  disabled?: boolean
}

/** The props MenubarLinkItem forwards to Base UI. */
export interface MenubarLinkItemProps extends ComponentProps<'a'> {
  /** Whether the link reads as a destructive action. @defaultValue default */
  variant?: 'default' | 'destructive'
}

/**
 * The props MenubarCheckboxItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6). An unchecked item needs this
 * group to hold its state, and without it a tick in a menu has nowhere to live.
 */
export interface MenubarCheckboxItemProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The controlled ticked state. */
  checked?: boolean
  /** The initially ticked state, for an uncontrolled item. */
  defaultChecked?: boolean
  /** Called when the ticked state changes. */
  onCheckedChange?: (checked: boolean) => void
  /** Whether the item ignores user interaction. */
  disabled?: boolean
  /** Whether the menu closes when the item is chosen. @defaultValue false */
  closeOnClick?: boolean
}

/** The props MenubarLabel forwards to Base UI. */
export interface MenubarLabelProps extends ComponentProps<'div'> {}

/** The props MenubarSeparator forwards to Base UI. */
export interface MenubarSeparatorProps extends ComponentProps<'div'> {}

/** The props MenubarGroup forwards to Base UI. */
export interface MenubarGroupProps extends ComponentProps<'div'> {}

/** The props MenubarSub forwards to Base UI. */
export interface MenubarSubProps {
  /** The controlled open state of the submenu. */
  open?: boolean
  /** The initially open state of the submenu. */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** The submenu trigger and its content. */
  children?: React.ReactNode
}

/** The props MenubarSubTrigger forwards to Base UI. */
export interface MenubarSubTriggerProps extends ComponentProps<'div'> {}

/** The props MenubarSubContent forwards to Base UI. */
export interface MenubarSubContentProps extends ComponentProps<'div'> {
  /** The distance in pixels between the submenu and the trigger. @defaultValue 0 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/**
 * The bar at the top of an application window that owns its commands.
 *
 * **A menubar is one Tab stop, and that is the whole difference from a row of
 * dropdowns.** Arrow keys move along the bar and open a menu; Tab leaves the bar
 * and enters the page. A consumer who composes the same set of menus as a row of
 * buttons gets the Tab order of the document instead, which is every button in
 * the bar and none of the arrows, and the bar becomes a keyboard trap that
 * happens to sit at the top of the page. That is why this Component ships the
 * bar as a part rather than leaving it to a wrapper: the one-Tab-stop model is
 * the reason the parts exist.
 *
 * **Every menu in a bar is modal while it is open.** A menu that leaves the page
 * live is a menu a pointer reader clicks straight through, and an application
 * menu bar is the one menu where the reader is elsewhere while it is open. Pass
 * `modal={false}` on the bar when that is not the case.
 *
 * **`label` is required.** A bar is one Tab stop and nothing announces it until
 * focus lands there, so two unnamed bars are two things a screen reader calls
 * "menu". Use the DropdownMenu for a menu attached to a control rather than to
 * the application, and the NavigationMenu for links rather than commands.
 */
function Menubar({ className, label, orientation = 'horizontal', ...props }: MenubarProps) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      aria-label={label}
      orientation={orientation}
      className={cn(
        'bg-background flex items-center gap-1 rounded-md border p-1',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

/**
 * One menu in the bar, holding its trigger and its rows.
 *
 * It is a menu root rather than a bare element because the bar needs to know
 * which menu is open, and the arrow keys only work between menus that share a
 * parent. A consumer who drops the trigger and the content inside a plain `div`
 * gets two independent dropdowns and no bar.
 */
function MenubarMenu({ ...props }: MenubarMenuProps) {
  return <MenuPrimitive.Root {...props} />
}

/**
 * The control that opens one menu in the bar.
 *
 * It is a real button and it is a menu item in the bar's own model, so Enter and
 * Arrow Down open the menu and the arrows along the bar move between triggers.
 */
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'text-foreground inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm font-medium whitespace-nowrap outline-none',
        'transition-[color,background-color,box-shadow] duration-fast ease-out',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-[3px]',
        'data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

/** The floating menu surface. */
function MenubarContent({ className, sideOffset = 4, alignOffset = 0, ...props }: MenubarContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={sideOffset} alignOffset={alignOffset}>
        <MenuPrimitive.Popup
          data-slot="menubar-content"
          className={cn(POPUP, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/** One command in the menu. It does something rather than going somewhere. */
function MenubarItem({ className, variant = 'default', ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="menubar-item"
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
 * `File > Recent` is a list of places rather than a list of things to do, and a
 * `div` styled like a link cannot be opened in a new tab or copied by address.
 * A command belongs in `MenubarItem`; a place belongs here.
 */
function MenubarLinkItem({ className, variant = 'default', ...props }: MenubarLinkItemProps) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menubar-link-item"
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
 * A menu row that toggles a setting, and leaves the menu open while it does.
 *
 * `closeOnClick` defaults to false here, and that is the decision: a setting is
 * something a reader turns on, checks, and turns off again in the same visit, so
 * a menu that closes on the tick makes the second of those impossible without a
 * round trip through the bar. A command still closes.
 */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenubarCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      checked={checked}
      className={cn(ROW, 'pr-8 pl-8', className)}
      {...props}
    >
      <MenuPrimitive.CheckboxItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

/** A non-interactive heading inside a group of rows. */
function MenubarLabel({ className, ...props }: MenubarLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menubar-label"
      className={cn('px-2 py-1.5 text-xs font-medium', className)}
      {...props}
    />
  )
}

/** A rule between groups of rows. */
function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      data-slot="menubar-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

/** A labelled set of related rows. */
function MenubarGroup({ className, ...props }: MenubarGroupProps) {
  return <MenuPrimitive.Group data-slot="menubar-group" className={cn(className)} {...props} />
}

/** A group of rows that opens into a second menu. */
function MenubarSub({ ...props }: MenubarSubProps) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

/** The row that opens a submenu. */
function MenubarSubTrigger({ className, children, ...props }: MenubarSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      className={cn(ROW, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

/** The nested menu surface. */
function MenubarSubContent({ className, sideOffset = 0, alignOffset = 0, ...props }: MenubarSubContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={sideOffset} alignOffset={alignOffset}>
        <MenuPrimitive.Popup
          data-slot="menubar-sub-content"
          className={cn(POPUP, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLinkItem,
  MenubarCheckboxItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarGroup,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
