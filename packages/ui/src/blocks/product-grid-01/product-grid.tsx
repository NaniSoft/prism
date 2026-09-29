import { ProductMark, type ProductMarkProps } from '../../components/ui/product-mark'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'

/**
 * One product in the grid, as the row draws it.
 *
 * The three facts the mark is drawn from, the one line under the name, and where
 * the row goes. The mark is `ProductMark`, so a product's two-part identity is
 * the same two colours here as it is in a switcher and on a page header.
 */
export type ProductGrid01Product = {
  /**
   * The product's key within the set. Carried on the markup as `data-product`
   * through `ProductMark`, so a test can name one product rather than the first
   * one, and two products in one document are individually addressable.
   */
  id: string
  /**
   * The product's own name, which is the second part of its mark. It is the
   * anchor of the row and the first thing a reader reads.
   */
  name: string
  /**
   * The product's pack, which is the hue of the mark's core. Omit it, or pass
   * `null`, for the one member of a set that has no pack of its own: that member
   * wears the full spectrum rather than a colourless mark.
   */
  pack?: ProductMarkProps['pack']
  /** One line about what the product is. */
  tagline: string
  /**
   * A second line, about **this product** rather than about the set.
   *
   * `tagline` and this are different claims and only one of them belongs on the
   * row. A tagline is the shortest true thing about a member, and it reads the
   * same in every row of a set. This is a sentence that is true of *this* product
   * and would be false or vacuous beside its neighbours, which is the test for
   * whether it belongs here. The company site's five products each carried one
   * ("Autonomous software creation, supervised by you."), and folding them into the
   * tagline would have been a copy edit rather than a fix, so they were dropped and
   * reported instead.
   *
   * Rendered only when passed, so a row without one draws exactly what it drew
   * before the field existed. See `ProductGrid01`'s JSDoc for which of the two
   * levels a sentence belongs at, because the answer is a fact about the sentence
   * and not a preference.
   */
  detail?: string
  /**
   * Where the row goes. Rendered as a native anchor's `href`, so the row is a
   * link with the browser's own affordances rather than a click handler.
   */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external, so the caller declares it.
   */
  newTab?: boolean
}

/**
 * The props a ProductGrid01 takes.
 *
 * Every string is a prop and the Block ships none. There is no product list in
 * this package, no default tagline and no "built on" heading: the set of products
 * a page lists is the page's own fact, and Prism ships the row rather than the
 * roster.
 */
export type ProductGrid01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a grid composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The products, in the order a reader should meet them. Order is the caller's
   * because it is a claim about which product matters first.
   */
  products: readonly ProductGrid01Product[]
  /**
   * The line under the grid, for the sentence that qualifies it: what the set
   * does not include, or where to read more.
   */
  caption?: string
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A set of products as a stack of hairline rows: a two-part mark, a name, one
 * tagline and a destination per row.
 *
 * All four NaniSoft sites publish this section, and each one drew it by hand with
 * the same three parts in the same order: a colour mark for the product, the
 * product's name, and one line about what it is, on a hairline row with the whole
 * row a link. Each site also resolved the mark's ink in JavaScript from the live
 * mode, which is the part that is a second source of truth: four copies of the
 * rule that a pastel is a fill and the name is an ink, and four copies of the
 * arithmetic that a filled dot fails contrast on a light card.
 *
 * **The mark is two parts, and it is `ProductMark`.** The ring is `brand-ink` and
 * the core is the product's own `primary`, with the name in the brand ink beside
 * it. That split is the contested shape this Block ships, and it is settled by a
 * measurement rather than by taste: a pastel brand value is a fill and never text,
 * so the core may be `primary` and the name may not, and a *filled* mark on a
 * light card measures under the threshold a mark has to clear, so the mark is a
 * hairline ring around the fill rather than a disc of it. A product row that drew
 * a single filled dot with the name in the same value would be wrong in both
 * directions at once, and nothing in the rendered result would say which.
 *
 * The pack is carried through `ProductMark` rather than set here, so the mark's
 * own `data-pack` boundary lands on the mark and the product's hue follows from
 * the pack the caller passed rather than from whichever pack the page is wearing.
 * That is the half of the pack-boundary law a hand-written mark gets wrong: it
 * resolves a colour once, at mount, from one element's computed style, and it
 * keeps showing the old pack's values when a boundary lands above it.
 *
 * The row is a link, not a click handler. The whole row is an `a` with the
 * product's `href`, so a status bar shows the destination, a context menu copies
 * it, and middle-click opens it in a new tab. The mark is `aria-hidden` inside
 * it, so the link is announced once, by name, rather than as a shape and a word.
 *
 * **Which level a sentence belongs at is a fact about the sentence, and this
 * settles it.** There are two levels and both are right, for different claims:
 *
 * - `description` is about **the set**. "Five products, one platform." or "Every
 *   one of these runs on the same runtime." A sentence that would be equally true
 *   if you deleted any one row belongs here, and nowhere else.
 * - `Product.detail` is about **this member**. "Quantitative trading research for
 *   the Indian market, the factory's newest build." A sentence that is false, or
 *   vacuous, beside its neighbours belongs on the row.
 *
 * The test is whether the sentence survives its neighbours. A tagline reads the
 * same in every row, so it is a tagline; the company site's five products each
 * carried a sentence true of one and not of the four beside it, and the earlier
 * version of this note told a caller to fold those into `description`, where they
 * would have claimed to be about all five at once. That advice lost three
 * published sentences in a migration rather than stating the choice, so both levels
 * exist and the question above is the one to ask.
 *
 * It is a server Component: no hook, no state, no client code and no mode. The
 * mark resolves its colour through the cascade, so a page that renders this in a
 * server file needs nothing from the provider mounted.
 */
export function ProductGrid01({
  eyebrow,
  title,
  description,
  products,
  caption,
  headingLevel = 'h2',
}: ProductGrid01Props) {
  if (products.length === 0) return null

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <ul data-slot="product-grid" className="flex flex-col">
        {products.map((product) => (
          <li key={product.id} data-slot="product-grid-row" className="border-b first:border-t">
            <a
              href={product.href}
              rel={product.newTab ? 'noopener noreferrer' : undefined}
              target={product.newTab ? '_blank' : undefined}
              className="hover:bg-accent/50 focus-visible:ring-ring flex flex-col gap-1 px-2 py-4 transition-colors duration-fast ease-out sm:flex-row sm:items-baseline sm:gap-6 focus-visible:ring-[3px] focus-visible:outline-none"
            >
              <span className="flex shrink-0 items-center sm:w-64">
                <ProductMark id={product.id} name={product.name} pack={product.pack} size="md" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-muted-foreground text-pretty text-sm">{product.tagline}</span>
                {/* A second line, per row, drawn only when there is one. A row that
                    reserved the space for absent content would push every row below
                    it down by one line, and this is a stack of full-width rules
                    where a ragged left edge is the most visible thing on the page. */}
                {product.detail ? (
                  <span className="text-pretty text-sm">{product.detail}</span>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {caption ? <p className="text-muted-foreground mt-6 text-pretty text-sm">{caption}</p> : null}
    </Section>
  )
}

export default ProductGrid01
