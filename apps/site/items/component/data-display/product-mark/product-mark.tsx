import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'

/**
 * The mark at each size, including one with no pack.
 *
 * The last row is the case that matters: a product with no pack of its own wears
 * the full spectrum rather than a colourless mark, because a colourless mark
 * would take the reading page's accent and change per site.
 */
export default function ProductMarkDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-3">
        <ProductMark id="nexus" name="Nexus" pack="lavender" size="lg" />
        <ProductMark id="atlas" name="Atlas" pack="mint" size="md" />
        <ProductMark id="alphalens" name="AlphaLens" pack="blush" size="sm" />
      </div>
      <ProductMark id="www" name="NaniSoft" size="md" />
    </div>
  )
}
