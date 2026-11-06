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
  /** Marks the link as the page the reader is on. */
  current?: boolean
}

/**
 * A group of destinations in the mobile panel, as a label above its links.
 *
 * The row renders a group as a menu because a row is short of room and a group
 * is one control there; this panel is not short of room, so the same group is a
 * named run of the list rather than a second thing to open. A reader below the
 * row's threshold therefore meets every destination flat: no route is behind
 * two disclosures, and the group's name still tells them which destinations
 * belong together.
 */
export type MobileNavGroup = {
  /** The group's own name, which is a label and not a link. */
  label: string
  /** The destinations under the label, in the order a reader should meet them. */
  children: readonly MobileNavLink[]
}

/** One entry in the mobile panel: a link, or a group of them. */
export type MobileNavEntry = MobileNavLink | MobileNavGroup

/** The props the mobile navigation takes. */
export type MobileNavProps = {
  /** The product this navigation belongs to, drawn as the mark above the list. */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack' | 'mark'>
  /** Every destination, in the order a reader should meet them. */
  links: readonly MobileNavEntry[]
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
 * floor in the design system asks for exactly that. A group's label is a
 * `role="group"` named by the label, so a reader who navigates the panel by
 * landmark or by list is told which links belong together rather than meeting a
 * longer list with a break in it.
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
            <ProductMark
              id={product.id}
              name={product.name}
              pack={product.pack}
              mark={product.mark}
              size="md"
            />
          </div>
          {links.map((entry) =>
            'children' in entry ? (
              <div
                key={entry.label}
                role="group"
                aria-label={entry.label}
                className="mt-5 flex flex-col gap-1"
              >
                {/*
                  The label rhymes with the sidebar's own group labels, because
                  the two are the same thing said on two surfaces: a `text-sm
                  font-semibold tracking-tight` muted label, with no hover and no
                  route, since a label that behaved like a link would be a
                  destination pretending it had no children. Its padding below
                  is the sidebar's own rhythm: more room after a heading than
                  between two links, so the group reads as held by the label
                  rather than as a link that happens to be bold.
                */}
                <span className="text-muted-foreground px-3 pb-2 text-sm font-semibold tracking-tight">
                  {entry.label}
                </span>
                {entry.children.map((link) => (
                  <PanelLink key={link.href} link={link} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            ) : (
              <PanelLink key={entry.href} link={entry} onNavigate={() => setOpen(false)} />
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

/** One link in the panel, extracted because the group and the root render the same one. */
function PanelLink({ link, onNavigate }: { link: MobileNavLink; onNavigate: () => void }) {
  return (
    <a
      href={link.href}
      aria-current={link.current ? 'page' : undefined}
      onClick={onNavigate}
      className={
        link.current
          ? 'bg-accent text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
      }
    >
      {link.label}
    </a>
  )
}
