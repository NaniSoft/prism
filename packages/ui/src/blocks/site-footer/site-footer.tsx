import type { ReactNode } from 'react'

import { ProductMark, type ProductMarkProps } from '../../components/ui/product-mark'
import { type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One destination in a footer column.
 *
 * `href` is required. A footer link with no destination is a label, and a column
 * of labels in a footer reads as a broken page rather than as an omission.
 */
export type SiteFooterLink = {
  /** The text of the link. */
  label: string
  /** Where the link goes. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external, so the caller declares it.
   */
  newTab?: boolean
}

/**
 * One column of a footer's destinations: a title and the links under it.
 *
 * The title is required, because a column of links with no heading is a list
 * that gives a reader no clue what the group is, and a footer's whole job is to
 * be scannable rather than read.
 */
export type SiteFooterColumn = {
  /** The heading of the column, which names the group. */
  title: string
  /** The destinations in the group, in the order a reader should meet them. */
  links: readonly SiteFooterLink[]
}

/**
 * One link out of the site: a destination with an icon beside its label.
 *
 * The icon is a `ReactNode` rather than a component name, because the icon is
 * the consumer's: it is their brand's mark for a destination, not one of a set
 * Prism owns. The label is still required, because an icon alone is not a
 * destination a screen reader can announce.
 */
export type SiteFooterSocial = {
  /** The accessible name of the link, and the text beside the icon. */
  label: string
  /** Where the link goes. */
  href: string
  /**
   * The mark drawn beside the label. `aria-hidden` is applied to it here, so an
   * icon is a shape beside a word and never a second reading of the word.
   */
  icon?: ReactNode
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. A destination off the site is
   * declared by the caller, because Prism does not parse URLs.
   */
  newTab?: boolean
}

/**
 * The props a SiteFooter takes.
 *
 * The product is required and nothing else is. A footer with no columns, no
 * social links and no legal line is a valid footer: it is a brand lockup and
 * nothing else, and one of the four NaniSoft sites is exactly that.
 */
export type SiteFooterProps = {
  /**
   * The product this footer belongs to: the id, name and pack its `ProductMark`
   * is drawn from. The footer renders the mark rather than taking a slot,
   * because the brand lockup is the one part of a footer that is never
   * product-specific and every consumer would otherwise reimplement it.
   */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack'>
  /**
   * The groups of destinations: the sections of this site, its documentation, and
   * anywhere else the site sends a reader. Omit it for a footer that carries only
   * the brand lockup.
   */
  columns?: readonly SiteFooterColumn[]
  /**
   * The links that leave the site. A `ReactNode` icon is drawn beside each label
   * and hidden from assistive technology, so a screen reader announces the label
   * once.
   */
  social?: readonly SiteFooterSocial[]
  /**
   * A slot for the line at the foot of the footer: a copyright, a licence, a
   * version, a legal link. A slot rather than a prop, because every one of those
   * is a fact about a specific product and about the year it was published, and a
   * Block that held a year would be a Block that went stale.
   */
  legal?: ReactNode
  /**
   * Heading level for the footer's column headings. @defaultValue 'h2'
   *
   * A prop for the reason every Block's is: the surrounding document decides where
   * this lands in the outline, not the Block. Four of the five NaniSoft sites put
   * the footer at the root of their layout, where a column heading at level two is
   * the top of that part of the document; the fifth composes the same Block as the
   * last region of a settings page, where the same fixed level made every column a
   * sibling of the heading that section already had.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The footer of a product site: a brand lockup, grouped destinations, the links
 * that leave the site, and an optional slot for the legal line.
 *
 * It is a Block and not a Component because it is a region of a page: it
 * composes a `ProductMark` and two sets of links and owns the block they sit in.
 * All four NaniSoft sites compose this exact footer in their root layout, and
 * each one wrote its own column model, its own mark and its own current-page
 * treatment.
 *
 * Every string is a prop and the Block ships none. There is no site name, no
 * copyright, no year, no "built with" line and no default column: a footer that
 * hardcoded any of them would hand every consumer a claim about a product that
 * is not theirs and a year that was not this one.
 *
 * The columns are a grid that collapses to one column, and the brand lockup
 * stays above them at every width. A footer read as three columns on a phone is
 * three unreadable columns; a footer read as one column is a list a reader can
 * scan, which is the only job a footer has on a narrow viewport.
 *
 * Each column is a `nav` with its own accessible name, taken from the column's
 * title. A reader who navigates by landmark can therefore reach "Documentation"
 * rather than arriving at one anonymous list of links.
 *
 * The level of those headings is the caller's rather than fixed, for the reason
 * every Block's is. This footer is composed by four products at the root of their
 * layouts and by one inside a page, and a fixed level answers only the first of
 * those.
 *
 * The social links open in a new browsing context by default, because a link that
 * leaves the site and comes back is a reader who has lost the page they were on.
 * That default is a decision this Block makes, and `newTab={false}` on one link
 * overrides it: Prism does not decide which destinations are external, so the
 * per-link prop wins over the default rather than the other way round.
 *
 * **Every link this Block renders carries a 24 pixel target floor, and it is a
 * floor on the box rather than on the type.** A link drawn as a bare inline anchor
 * has no box at all: what a pointer aims at is the font's content area, which for
 * the shipped face at `text-sm` is 16.94 pixels tall, and a row of six to eight of
 * them is the densest target cluster on four sites. The fix is
 * `flex min-h-6 items-center`, so the anchor is a block that is at least
 * `--spacing-6` tall with the same fourteen-pixel type inside it, and the visual
 * weight of the link is untouched. It is the same arrangement `mobile-nav` uses for
 * a stacked link at the coarse-pointer floor, one step lower and at every pointer.
 * `DESIGN.md` records the rule under **The target-size floor**.
 *
 * It changes no height anywhere. A column link sat in a line box built from the
 * footer's inherited sixteen-pixel body, so each row was already twenty-four pixels
 * tall before the floor and the row is the same twenty-four after it; only the
 * seventeen pixels of target inside it grew, and a reader's eye is where it was.
 *
 * It is a server Component. It fetches nothing, it holds no state, and it
 * imports no router: a consumer renders it from a server file and the links are
 * plain anchors the consumer's own router can intercept.
 */
export function SiteFooter({
  product,
  columns,
  social,
  legal,
  headingLevel = 'h2',
  className,
}: SiteFooterProps) {
  const ColumnTitle = headingLevel
  return (
    <footer
      data-slot="site-footer"
      className={cn('border-border bg-background w-full border-t', className)}
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-10 px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <ProductMark id={product.id} name={product.name} pack={product.pack} size="lg" />
            {social && social.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-4">
                {social.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      rel={link.newTab === false ? undefined : 'noopener noreferrer'}
                      target={link.newTab === false ? undefined : '_blank'}
                      className="text-muted-foreground hover:text-foreground flex min-h-6 items-center gap-2 rounded-sm text-sm font-medium transition-colors duration-fast ease-out"
                    >
                      {link.icon ? (
                        <span aria-hidden className="inline-flex items-center">
                          {link.icon}
                        </span>
                      ) : null}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {columns && columns.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((column) => (
                <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
                  <ColumnTitle className="text-sm font-semibold">{column.title}</ColumnTitle>
                  <ul className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          rel={link.newTab ? 'noopener noreferrer' : undefined}
                          target={link.newTab ? '_blank' : undefined}
                          className="text-muted-foreground hover:text-foreground flex min-h-6 items-center rounded-sm text-sm transition-colors duration-fast ease-out"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          ) : null}
        </div>

        {legal ? <div className="text-muted-foreground text-sm">{legal}</div> : null}
      </div>
    </footer>
  )
}

export default SiteFooter
