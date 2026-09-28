import type { PackId } from '../../theming'

import { cn } from '../../lib/utils'

/**
 * The full spectrum, as the five series tokens and nothing else.
 *
 * A product with no pack of its own is the one entry in a product set that has
 * no single hue, and the standing decision is that it wears the spectrum rather
 * than a colourless mark: a colourless dot reads as a product with no identity,
 * which is the one thing such an entry is not. This line is that decision
 * translated into the current contract.
 *
 * The stops are `chart-1` through `chart-5` because they are the only five-way
 * colour set the token contract publishes, and because `chart-1` starts at the
 * page's own pack hue, so a sweep drawn under a scoped boundary begins in that
 * pack and moves out of it. `chart-1` closes the wheel so the sweep has no seam
 * at 0 degrees.
 *
 * It is the one gradient in the shipped surface. The geometry is Tailwind's and
 * the colour stops are semantic, which is the only gradient DESIGN.md allows,
 * and the element it paints is `aria-hidden`: a gradient is never the carrier of
 * a name, and this one is not.
 */
const SPECTRUM =
  'bg-[conic-gradient(var(--chart-1),var(--chart-2),var(--chart-3),var(--chart-4),var(--chart-5),var(--chart-1))]'

/**
 * The three sizes a product mark is drawn at: the mark's diameter and the name
 * beside it, taken together so the two parts of the mark stay in proportion.
 *
 * The mark is one of a fixed set rather than something a caller sizes through
 * `className`, because `className` is layout only and a mark sized by a layout
 * class is a mark the layout owns. A product set shows its marks in a switcher,
 * in a row and on a page header, and those three are the sizes a set needs.
 */
const SIZES = {
  sm: { mark: 'size-4', name: 'text-xs' },
  md: { mark: 'size-5', name: 'text-sm' },
  lg: { mark: 'size-6', name: 'text-base' },
} as const

/**
 * The three sizes a product mark is drawn at.
 *
 * @defaultValue 'md'
 */
export type ProductMarkSize = keyof typeof SIZES

/**
 * The props a ProductMark takes.
 *
 * There is no product directory in this package. A product's identity is the
 * consumer's data, so the Component takes the three facts the mark is drawn
 * from and owns none of them: `id` for the markup, `name` for the second part,
 * and `pack` for the hue. Where the set of products is published is the
 * consumer's decision, and Prism ships the mark rather than a list of products.
 */
export type ProductMarkProps = {
  /**
   * The product's key within the set it is distinguished in. It is carried on
   * the markup as `data-product` so a test can name one mark rather than the
   * first one, and so two marks in one document are individually addressable.
   */
  id: string
  /**
   * The product's name, which is the mark's second part and the word that
   * carries the identity. The mark sets it in `brand-ink` rather than in
   * `foreground`, which is DESIGN.md's Brand Ink Rule: a name that has to read
   * as the brand reads `brand-ink`, and `foreground` is a tinted neutral with
   * almost no chroma by design.
   */
  name: string
  /**
   * The product's pack, which is the mark's hue. Omit it, or pass `null`, for
   * the one entry in a set that has no pack of its own: that entry is drawn as
   * the full spectrum rather than as a colourless mark. See `SPECTRUM` above.
   *
   * `default` is a real answer and not the same as the empty one. The base pack
   * is a pack a product can wear, and it is the absence of a `data-pack`
   * attribute, so a product whose pack is `default` carries no attribute and its
   * core resolves the base pack's `primary` from the page.
   */
  pack?: PackId | null
  /**
   * Which of the three drawn sizes to use. @defaultValue 'md'
   */
  size?: ProductMarkSize
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited, and this Component spreads no other prop,
   * so there is no second route to its ink.
   */
  className?: string
}

/**
 * A product's two-part colour mark: a hairline ring in the brand ink around a
 * core in the pack's own fill, beside the product's name in the brand ink.
 *
 * Two parts, and both colours come from tokens, which is the whole reason this
 * is promoted out of the two hand-written copies it replaces. The ring is
 * `brand-ink`, the pack's brand hue as a stroke; the core is `primary`, the
 * pack's brand value as a fill. That split is not a preference. DESIGN.md's Fill,
 * Not the Ink Rule says a pastel brand value is a fill and never text, so the
 * core may be `primary` and the name may not, and the Brand Ink Rule says the
 * name reads `brand-ink` rather than `foreground` or `primary-foreground`. A
 * hand-written copy gets one of those two wrong and nothing in the rendered
 * result says which.
 *
 * Uniqueness across the set comes from the pack: each product wears its own
 * pack's hue, and the one entry with no pack wears the spectrum, so no two marks
 * in a set resolve to the same pair of colours. The set is the consumer's data.
 * This Component draws one member of it, and it is the same member wherever it is
 * drawn from.
 *
 * The mark carries its own `data-pack` boundary on its root, so a product's hue
 * follows from the pack the caller passed rather than from whichever pack the
 * page happens to be wearing, and a boundary lands on the mark rather than on
 * whatever encloses it. The boundary is on a span carrying no radius utility,
 * which is one of the two placements DESIGN.md's pack-boundary law allows, and
 * the disc itself is fully rounded. Nothing about the mark's shape moves when a
 * pack boundary lands above it, which is the half of that law a consumer
 * implementing only the colour half gets wrong.
 *
 * It is a server Component: no hook, no mode, no context, no client code and no
 * `'use client'` line. A consumer renders it from a server file and needs
 * nothing from the provider mounted.
 *
 * The disc is `aria-hidden` and the name is not, so the mark adds a shape beside
 * the word rather than a second reading of it.
 */
function ProductMark({ id, name, pack, size = 'md', className }: ProductMarkProps) {
  const drawn = SIZES[size]
  // `default` is the absence of a pack id, spelled the way the token build
  // spells it, so a base-pack product resolves `primary` from the page rather
  // than from an attribute that matches no emitted rule.
  const boundary = pack && pack !== 'default' ? pack : undefined
  return (
    <span
      data-slot="product-mark"
      data-pack={boundary}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span
        data-slot="product-mark-disc"
        data-product={id}
        aria-hidden
        className={cn(
          'inline-block shrink-0 rounded-full border border-brand-ink',
          drawn.mark,
          pack ? 'bg-primary' : SPECTRUM,
        )}
      />
      <span data-slot="product-mark-name" className={cn('font-medium text-brand-ink', drawn.name)}>
        {name}
      </span>
    </span>
  )
}

export { ProductMark }
