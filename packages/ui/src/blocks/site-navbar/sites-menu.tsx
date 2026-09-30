'use client'

import { LayoutGrid } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { ProductMark } from '../../components/ui/product-mark'
import type { SwitcherProduct } from '../../components/ui/product-switcher'

/** The props the sites menu takes. */
export type SitesMenuProps = {
  /** The set to move between, in the order a reader should meet it. */
  sites: readonly SwitcherProduct[]
  /** The `id` of the site the reader is on. Marked `aria-current="page"`. */
  currentId?: string
  /** The accessible name of the menu and of its trigger. A word a reader hears. */
  label: string
}

/**
 * The set of sites, as a menu.
 *
 * Prism's own site had no way to reach its four siblings and each of the four had
 * written its own way to reach the other four, so a reader on one site had to know
 * that four other hosts existed before they could be found. This is the one control
 * that states the set, and every site that composes it states the same five.
 *
 * **The trigger is an icon rather than a word, for the same reason Prism's search
 * trigger is.** The bar carries the brand, the site's own destinations and a row of
 * controls, and at the width the row is authored to fit, a fourth labelled control
 * is the difference between fitting and folding the brand onto two lines. A control
 * that is not a destination is the right place to spend that width, because a
 * reader who does not recognise the icon is losing a word rather than a route.
 *
 * **The items are links, not commands, and the current one is marked rather than
 * styled.** A menu item that navigated was a command wearing a link's clothes, and
 * the cost of that is a reader with a middle-click expecting a new tab and getting
 * nothing. `aria-current="page"` on the member the reader is on is the state a
 * screen reader announces, and it is why the set is a list of anchors inside a menu
 * rather than a `ProductSwitcher` row: the switcher renders every mark at once and
 * this renders them on demand, which is what makes room for the icon-only trigger.
 *
 * Each item carries the site's own `ProductMark`, so a reader recognises a
 * destination by its colour before they read its name, and the mark is where a
 * pack boundary is safe: it is a fully rounded disc, so repointing the pack's corner
 * radius beneath it moves nothing about its shape.
 */
export function SitesMenu({ sites, currentId, label }: SitesMenuProps) {
  if (sites.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="site-navbar-sites-trigger"
        aria-label={label}
        className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground size-11 shrink-0 rounded-full border"
      >
        <LayoutGrid aria-hidden className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        {/*
          The label and the items are inside one `DropdownMenuGroup` because Base
          UI's group label is a part of the group rather than of the menu: rendered
          directly in the menu it throws, because it has no group to name. A heading
          that only works inside a group is a heading every caller has to remember
          to wrap, and this Block ships the heading.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {sites.map((site) => {
            const current = site.id === currentId
            return (
              <DropdownMenuItem
                key={site.id}
                /*
                 * Rendered AS the link rather than wrapping one. A focusable menu
                 * item with an anchor inside it is two tab stops for one row, and a
                 * reader who middle-clicks a row that only looks like a link gets no
                 * new tab and no way to tell that the row was a link at all.
                 */
                render={
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-current={current ? 'page' : undefined}
                    data-current={current ? 'true' : undefined}
                  />
                }
              >
                <ProductMark id={site.id} name={site.name} pack={site.pack} size="sm" />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
