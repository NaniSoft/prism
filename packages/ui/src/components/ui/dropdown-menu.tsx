'use client'

import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * The props the DropdownMenu root forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuProps {
  /** The controlled open state. */
  open?: boolean
  /** The initially open state, for an uncontrolled menu. */
  defaultOpen?: boolean
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the menu ignores user interaction. */
  disabled?: boolean
  /** The trigger and the menu content. */
  children?: React.ReactNode
}

/** The props DropdownMenuTrigger forwards to Base UI. */
export interface DropdownMenuTriggerProps extends ComponentProps<'button'> {}

/**
 * The props DropdownMenuContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the menu is placed on. @defaultValue bottom */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the menu aligns against the trigger. @defaultValue start */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the menu. @defaultValue 4 */
  sideOffset?: number
  /** The offset in pixels along the alignment axis. @defaultValue 0 */
  alignOffset?: number
}

/**
 * The props DropdownMenuItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuItemProps extends ComponentProps<'div'> {
  /** Whether the item aligns with the labels above it. @defaultValue false */
  inset?: boolean
  /** Whether the item reads as a destructive action. @defaultValue default */
  variant?: 'default' | 'destructive'
  /** Whether the item ignores user interaction. */
  disabled?: boolean
  /** Whether the menu closes when the item is chosen. @defaultValue true */
  closeOnClick?: boolean
}

/**
 * The props DropdownMenuCheckboxItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuCheckboxItemProps extends Omit<ComponentProps<'div'>, 'onChange'> {
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

/**
 * The props DropdownMenuRadioItem forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuRadioItemProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The value this item contributes to its radio group. */
  value: string
  /** Whether the item ignores user interaction. */
  disabled?: boolean
  /** Whether the menu closes when the item is chosen. @defaultValue false */
  closeOnClick?: boolean
}

/** The props DropdownMenuLabel forwards to Base UI. */
export interface DropdownMenuLabelProps extends ComponentProps<'div'> {
  /** Whether the label aligns with items that carry an indicator. @defaultValue false */
  inset?: boolean
}

/** The props DropdownMenuSeparator forwards to Base UI. */
export interface DropdownMenuSeparatorProps extends ComponentProps<'div'> {}

/** The props DropdownMenuGroup forwards to Base UI. */
export interface DropdownMenuGroupProps extends ComponentProps<'div'> {}

/** The props DropdownMenuSub forwards to Base UI. */
export interface DropdownMenuSubProps {
  /** The controlled open state of the submenu. */
  open?: boolean
  /** The initially open state of the submenu. */
  defaultOpen?: boolean
  /** Called when the submenu opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Whether the submenu ignores user interaction. */
  disabled?: boolean
  /** The submenu trigger and its content. */
  children?: React.ReactNode
}

/**
 * The props DropdownMenuSubTrigger forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuSubTriggerProps extends ComponentProps<'div'> {
  /** Whether the trigger aligns with the labels above it. @defaultValue false */
  inset?: boolean
  /** Whether the trigger ignores user interaction. */
  disabled?: boolean
}

/**
 * The props DropdownMenuSubContent forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface DropdownMenuSubContentProps extends ComponentProps<'div'> {
  /** Which side of the trigger the submenu is placed on. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** How the submenu aligns against the trigger. @defaultValue start */
  align?: 'start' | 'center' | 'end'
  /** The distance in pixels between the trigger and the submenu. @defaultValue 0 */
  sideOffset?: number
}

const POPUP =
  'bg-popover text-popover-foreground z-50 max-h-(--available-height) min-w-36 overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none transition-[opacity,transform] duration-fast ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const ITEM =
  'focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4'

/**
 * A menu of actions opened from a trigger.
 *
 * Use a DropdownMenu for a short list of commands attached to one control,
 * such as a row's actions or an account menu. It supports arrow-key and
 * typeahead navigation, and Escape closes it. Keep a command that is the
 * primary action on the surface visible instead of hiding it here.
 */
function DropdownMenu({ ...props }: DropdownMenuProps) {
  return <MenuPrimitive.Root {...props} />
}

/** The element that opens the menu. */
function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
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

/** The floating menu surface. */
function DropdownMenuContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(POPUP, className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/** One command in the menu. */
function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        ITEM,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:bg-destructive/10',
        inset && 'pl-8',
        className,
      )}
      data-variant={variant}
      {...props}
    />
  )
}

/** A menu item that toggles a setting on or off. */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(ITEM, 'pr-8 pl-8', className)}
      {...props}
    >
      <MenuPrimitive.CheckboxItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

/** A menu item that selects one value from an implicit radio group. */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(ITEM, 'pr-8 pl-8', className)}
      {...props}
    >
      <MenuPrimitive.RadioItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
        <CircleIcon className="size-2 fill-current" />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

/** A non-interactive heading inside a menu group. */
function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn('px-2 py-1.5 text-xs font-medium', inset && 'pl-8', className)}
      {...props}
    />
  )
}

/** A rule between groups of commands. */
function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

/** A labelled set of related commands. */
function DropdownMenuGroup({ className, ...props }: DropdownMenuGroupProps) {
  return (
    <MenuPrimitive.Group data-slot="dropdown-menu-group" className={cn(className)} {...props} />
  )
}

/** An item that opens a nested menu. */
function DropdownMenuSub({ ...props }: DropdownMenuSubProps) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

/** The item that opens a submenu. */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(ITEM, inset && 'pl-8', className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

/** The nested menu surface. */
function DropdownMenuSubContent({
  className,
  align = 'start',
  sideOffset = 0,
  children,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(POPUP, className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
