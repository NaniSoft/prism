import type { ReactNode } from 'react'

import {
  ProductSwitcher,
  type SwitcherProduct,
} from '../../components/ui/product-switcher'
import { ProductMark, type ProductMarkProps } from '../../components/ui/product-mark'
import { cn } from '../../lib/utils'

/**
 * One destination in the header's own navigation.
 *
 * `href` is required and `current` is opt-in. The header marks the current page
 * with `aria-current="page"` rather than with a colour, so a link's state is
 * carried by the attribute every assistive technology already reads and a reader
 * who cannot see the colour still knows where they are.
 */
export type SiteHeaderLink = {
  /** The text of the link. */
  label: string
  /** Where the link goes. */
  href: string
  /**
   * Marks this link as the page the reader is on. Set it on the one link whose
   * destination is the current route; leave it off every other link.
   */
  current?: boolean
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external: a cross-origin destination is not by itself a reason to open a tab.
   */
  newTab?: boolean
}

/**
 * The props a SiteHeader takes.
 *
 * There is no product directory in this package, so the product the header is on
 * is passed as the three facts its mark is drawn from rather than as an id this
 * package would have to resolve. That is the same answer `ProductMark` gives,
 * and for the same reason: a consumer that composes a set of its own products
 * composes the header too.
 *
 * The product is the only required field but one. A header with no navigation, no
 * switcher and no actions is a valid header: it is a brand lockup and nothing
 * else, and one of the four NaniSoft sites is exactly that.
 */
export type SiteHeaderProps = {
  /**
   * The product this header belongs to: the id, name and pack its `ProductMark`
   * is drawn from. The header renders the mark itself rather than a slot, because
   * a header whose brand lockup is a slot is a header every consumer has to
   * reimplement, and that is the one part of a site header that is never
   * product-specific.
   */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack'>
  /**
   * The set of products to move between, rendered as a `ProductSwitcher` between
   * the mark and the navigation. Omit it on a site that is the only product, and
   * pass it on a site that is one of several. A set of one renders one mark, so
   * pass nothing rather than a switcher with a single member.
   */
  products?: readonly SwitcherProduct[]
  /**
   * The header's own destinations: the sections of this site. Omit it for a
   * header that carries only the brand lockup.
   */
  nav?: readonly SiteHeaderLink[]
  /**
   * The accessible name of the site navigation, which is also the visible word a
   * screen reader announces before the list.
   *
   * It is required rather than defaulted because it is a word a reader hears, and
   * a Block that ships no copy ships no reader-facing copy either. A header that
   * defaulted this would put its own name on every consumer's site navigation, and
   * "Site" is right for a company site and wrong for a product that has a docs
   * section it wants called something else.
   */
  navLabel: string
  /**
   * The accessible name of the product switcher. Required whenever `products` is
   * passed, for the same reason `navLabel` is: it is a word a reader hears, and a
   * Block that ships no copy ships none of those either. Omit it and the switcher
   * takes the site navigation's name, which is right when the two are the same set
   * of places and wrong when they are not.
   */
  productsLabel?: string
  /**
   * A slot for the controls a product owns on the right: an account menu, a sign
   * in link, a mode toggle, a theme picker. A slot rather than a prop, because
   * every one of those is application state and none of them is a fact a header
   * can be told.
   */
  actions?: ReactNode
  /**
   * Keeps the header at the top of the viewport as the page scrolls. Off by
   * default, because a sticky header is a decision about a page rather than about
   * a header, and a header that is sticky on a page with no scroll costs the
   * reader a strip of their viewport.
   */
  sticky?: boolean
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The header of a product site: a brand lockup, an optional product switcher, the
 * site's own navigation and an optional slot for application controls.
 *
 * It is a Block and not a Component because it is a region of a page rather than
 * a control: it composes a `ProductMark`, a `ProductSwitcher` and a set of
 * links, and it owns the bar they sit in. All four NaniSoft sites compose this
 * exact bar in their root layout, and each one wrote its own: the mark in one
 * place, the switcher in a popover in another, the navigation in a third, and
 * each wrote the focus and current-page wiring separately.
 *
 * Every string is a prop and the Block ships none. There is no site name, no
 * default navigation, no "sign in" and no product list: a header that hardcoded
 * any of them would hand every consumer a claim about a product that is not
 * theirs, which is the defect this Block exists to remove.
 *
 * The bar is one flex row that wraps. The brand lockup and the actions hold
 * their ends, the switcher and the navigation sit in the middle and wrap onto a
 * second line rather than overflowing, so a narrow viewport gets a taller header
 * and never a clipped one. The brand lockup is the one element that never
 * wraps: a wordmark broken across two lines is not a wordmark.
 *
 * The navigation is a `nav` with an accessible name and the switcher is a second
 * `nav`, because a reader who navigates by landmark needs two regions rather than
 * one region with two lists in it. The actions slot is not a region at all: it is
 * whatever the consumer composed, and wrapping it in a landmark would be a claim
 * about content this Block does not own.
 *
 * The bottom hairline is `border-border`, so the bar separates from the page by
 * a line rather than by a fill change, which is how every surface in this system
 * is separated: in the base pack `background` and `card` resolve to the same
 * value, so a fill is not available as a separator.
 *
 * It is a server Component. It fetches nothing, it holds no state, and a page
 * that renders it in a server file needs nothing from the provider mounted: the
 * pack it wears is the pack of whatever boundary is above it, which is the
 * mechanism the whole system uses.
 */
export function SiteHeader({
  product,
  products,
  nav,
  navLabel,
  productsLabel,
  actions,
  sticky = false,
  className,
}: SiteHeaderProps) {
  return (
    <header
      data-slot="site-header"
      className={cn(
        'border-border bg-background w-full border-b',
        sticky && 'sticky top-0 z-30',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3 lg:px-8">
        <a href="/" className="flex shrink-0 items-center rounded-sm">
          <ProductMark id={product.id} name={product.name} pack={product.pack} size="md" />
        </a>

        {products && products.length > 0 ? (
          <ProductSwitcher
            products={products}
            currentId={product.id}
            size="sm"
            label={productsLabel ?? navLabel}
          />
        ) : null}

        {nav && nav.length > 0 ? (
          <nav aria-label={navLabel} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.current ? 'page' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                target={link.newTab ? '_blank' : undefined}
                className="text-muted-foreground hover:text-foreground rounded-sm text-sm font-medium transition-colors duration-fast ease-out"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        {actions ? (
          <div className="ms-auto flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}

export default SiteHeader
