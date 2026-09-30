'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../../components/ui/sheet'
import { ProductMark } from '../../components/ui/product-mark'
import type { ProductMarkProps } from '../../components/ui/product-mark'

/** One destination in the mobile panel, which is the site's own navigation. */
export type MobileNavLink = {
  /** The text of the link. */
  label: string
  /** Where the link goes. */
  href: string
  /** Marks this link as the page the reader is on. */
  current?: boolean
}

/** The props the mobile navigation takes. */
export type MobileNavProps = {
  /** The product this navigation belongs to, drawn as the mark above the list. */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack'>
  /** Every destination, in the order a reader should meet them. */
  links: readonly MobileNavLink[]
  /** The accessible name of the panel, which is also the trigger's name. */
  label: string
  /** The word on the trigger while the panel is closed. */
  openLabel: string
  /** The word on the trigger while the panel is open. */
  closeLabel: string
}

/**
 * The navigation for viewports below the row's own threshold.
 *
 * **It carries every destination, not a subset.** From the narrowest phone up to
 * the width the horizontal row is authored for, this panel is the only way to reach
 * a section of the site, so a link the row shows at `lg` and the panel omits at
 * 640 is a route a reader on a small laptop cannot find at all. Both render the one
 * array, so a destination added to one is in the other by construction rather than
 * by remembering twice.
 *
 * **It is a Sheet rather than a disclosure panel of the navbar's own, and the
 * difference is the overlay.** A panel that is a child of the bar sits over the
 * page with the bar still visible and nothing above the rest of the document, so
 * scrolling the page behind it moves content the reader thought was dismissed. A
 * sheet owns a modal surface: the rest of the page is not reachable, Escape closes
 * it, and focus is held inside it and handed back to the trigger on the way out.
 * That is the behaviour a full-width menu over a long page needs, and it is the
 * behaviour Prism's own navigation had to hand-write.
 *
 * The links are full width with a 44 pixel minimum height, because below the row's
 * threshold this is a touch target and not a line of text, and the coarse-pointer
 * floor in the design system asks for exactly that.
 */
export function MobileNav({
  product,
  links,
  label,
  openLabel,
  closeLabel,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        data-slot="site-navbar-mobile-trigger"
        aria-label={open ? closeLabel : openLabel}
        className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none lg:hidden"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetTitle className="sr-only">{label}</SheetTitle>
        <nav aria-label={label} className="flex flex-col gap-1">
          <div className="mb-4 flex items-center">
            <ProductMark id={product.id} name={product.name} pack={product.pack} size="md" />
          </div>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.current ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={
                link.current
                  ? 'bg-accent text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
              }
            >
              {link.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
