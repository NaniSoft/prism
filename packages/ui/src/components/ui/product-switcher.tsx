import type { ComponentProps } from 'react'

import { ProductMark, type ProductMarkProps, type ProductMarkSize } from './product-mark'
import { cn } from '../../lib/utils'

/**
 * One product in the set a switcher moves between.
 *
 * The three facts the mark is drawn from, and no directory. Which products exist
 * is the consumer's decision: Prism ships the mark and the switch that reads it,
 * not a list of NaniSoft's products, so a consumer composing a set of its own
 * does not have to name them here to be able to switch between them.
 */
export type SwitcherProduct = {
  /**
   * The product's key within the set. It is carried on the markup as
   * `data-product` through `ProductMark`, so a test can name one member rather
   * than the first one, and two members in one document are addressable.
   */
  id: string
  /** The product's own name, which is the second part of its mark. */
  name: string
  /**
   * The product's pack, which is the hue of its mark. Omit it, or pass `null`, for
   * the one member of a set that has no pack of its own: that member is drawn as
   * the full spectrum rather than as a colourless mark.
   */
  pack?: ProductMarkProps['pack']
  /**
   * Where the member goes. Required, because a switcher whose members do not go
   * anywhere is a list of labels.
   */
  href: string
}

/**
 * The props a ProductSwitcher takes.
 *
 * There is no `current` requirement: a switcher marks the member the reader is on
 * with `aria-current="page"`, and the caller's own router is what knows that. The
 * member is passed as `currentId` and the switcher marks it; nothing here is a
 * router and nothing here decides where a link goes.
 */
export type ProductSwitcherProps = Omit<ComponentProps<'nav'>, 'children'> & {
  /**
   * The set to move between, in the order a reader should meet it. Order is the
   * caller's because it is a claim about which product matters first.
   */
  products: readonly SwitcherProduct[]
  /**
   * The `id` of the member the reader is on. Marked `aria-current="page"`, which
   * is how a reader and a screen reader both know where they are. Omit it when
   * the switcher is rendered on a page that is not one of the members.
   */
  currentId?: string
  /**
   * The drawn size of every mark, so a set shows one size rather than a mix. See
   * `ProductMarkSize`.
   *
   * @defaultValue 'sm'
   */
  size?: ProductMarkSize
  /**
   * A heading for the set, for a switcher that is not inside a landmark the
   * reader can already name. Rendered as the navigation's accessible name and as
   * no visible text, because the marks beside it are the labels.
   */
  label?: string
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A switch between the members of a set of products.
 *
 * One job: let a reader who is in one product move to another, and say which one
 * they are in. All four NaniSoft sites need it and each one wrote it: the
 * company's own site moves between its products from a row of coloured dots, and
 * each product site names its siblings in its header. The mark is `ProductMark`,
 * so the two parts of a member's identity - the ring in the brand ink and the
 * core in its own pack fill - are the same two colours wherever the member is
 * drawn, in a switcher, in a row or on a page header.
 *
 * It is a Component rather than a Block because a switcher is not a region of a
 * page: it is a control that appears in one, it fetches nothing, and every
 * member of the set is a prop. The header that carries it is a Block, and it
 * composes this.
 *
 * **The current member is marked, not styled.** A switcher that only colours the
 * current member is a switcher a colourblind reader cannot use and a screen
 * reader cannot read at all, so the current member carries `aria-current="page"`
 * and Prism's focus ring comes from the browser's own link behaviour. There is
 * no `variant` for the current member and no way to override the marking, which
 * is the whole reason this is a Component rather than a list of anchors the
 * caller writes.
 *
 * The set is a `nav` with an accessible name rather than a bare list of links,
 * because a set of links that move between sections of one product is a
 * navigation region and a screen reader should say so. `label` names it; the
 * default name is `Products`, and a consumer whose set is not products passes
 * its own word rather than accepting a claim about what its set is.
 *
 * It is a server Component: no hook, no context, no state and no client code,
 * so a switcher in a static page costs no JavaScript at all. A consumer that
 * wants a menu rather than a row of marks composes `DropdownMenu` with the marks
 * and does not use this.
 */
function ProductSwitcher({
  products,
  currentId,
  size = 'sm',
  label = 'Products',
  className,
  ...props
}: ProductSwitcherProps) {
  if (products.length === 0) return null

  return (
    <nav
      data-slot="product-switcher"
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}
      {...props}
    >
      {products.map((product) => {
        const current = product.id === currentId
        return (
          <a
            key={product.id}
            href={product.href}
            aria-current={current ? 'page' : undefined}
            data-current={current ? 'true' : undefined}
            className="rounded-sm transition-opacity duration-fast ease-out hover:opacity-80"
          >
            <ProductMark
              id={product.id}
              name={product.name}
              pack={product.pack}
              size={size}
            />
          </a>
        )
      })}
    </nav>
  )
}

export { ProductSwitcher }
