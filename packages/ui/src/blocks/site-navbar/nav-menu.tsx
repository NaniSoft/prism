'use client'

import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import type { SiteNavLink } from './site-navbar'

/** One destination inside the menu, with the current flag already resolved. */
export type NavMenuLink = SiteNavLink & {
  /** Marks this destination as the page the reader is on. */
  current: boolean
}

/** The props the navigation menu takes. */
export type NavMenuProps = {
  /** The word on the trigger, which is the group's own name. */
  label: string
  /** The group's destinations, in the order a reader should meet them. */
  links: readonly NavMenuLink[]
  /**
   * Marks the group as holding the page the reader is on, which the bar
   * resolves against its own `currentPath` before it crosses the client
   * boundary. The trigger is filled rather than merely tinted, so a reader who
   * cannot distinguish the fill still finds the page named inside the menu.
   */
  current: boolean
}

/**
 * One group of the site's own destinations, as a menu.
 *
 * A bar whose navigation is a row of links clubs into groups the moment a site
 * outgrows the row: five destinations that are all "the parts of the library"
 * beside four that are each a body of knowledge is a row a reader scans
 * word by word rather than recognises at a glance. This is the second half of
 * that row, and it is the one control in the row, because a group is not a
 * destination: it is a place other destinations live behind.
 *
 * **The items are links, not commands, for the reason the sites menu states.**
 * A menu item that navigated would be a command wearing a link's clothes, and
 * a reader who middle-clicks a row that only looks like a link gets no new tab.
 * Each item is rendered as the anchor itself rather than wrapping one, so the
 * row is one tab stop and one target.
 *
 * **The menu is a closed group, and a closed group shows nothing.** A reader
 * with scripting off sees the trigger and cannot open it, which is why the bar
 * renders a group as a menu only on the row above the panel threshold: below
 * it, the sheet lists every destination flat, and the bar's caller keeps
 * whatever routes it cannot afford to hide out of a group. The trigger is
 * filled when the reader is inside the group, so the place they are is on the
 * row even with the menu shut.
 *
 * **The chevron rotates on the open state and on nothing else.** Something
 * happened and the reader can see that it did, at the authored duration, and
 * the rotation is the only motion here.
 */
export function NavMenu({ label, links, current }: NavMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="site-navbar-nav-trigger"
        data-current={current ? 'true' : undefined}
        className={
          current
            ? 'group data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground bg-accent text-accent-foreground focus-visible:border-ring focus-visible:ring-ring gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
            : 'group data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
        }
      >
        {label}
        <ChevronDown
          aria-hidden
          className="group-data-[popup-open]:rotate-180 size-4 transition-transform duration-base ease-out"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="min-w-44">
        {links.map((link) => (
          <DropdownMenuItem
            key={link.href}
            /*
             * Rendered AS the link rather than wrapping one. A focusable menu
             * item with an anchor inside it is two tab stops for one row, and a
             * reader who middle-clicks a row that only looks like a link gets no
             * new tab and no way to tell that the row was a link at all.
             */
            render={
              <a
                href={link.href}
                target={link.newTab ? '_blank' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                aria-current={link.current ? 'page' : undefined}
                data-current={link.current ? 'true' : undefined}
              />
            }
            className="data-[current]:bg-accent data-[current]:text-accent-foreground data-[current]:font-medium"
          >
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
