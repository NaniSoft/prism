import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'
import {
  AlphaLensMark,
  AtlasMark,
  NaniSoftMark,
  NexusMark,
  PrismMark,
} from '@nanisoft/prism-ui/components/product-marks'

/**
 * The family as `ProductMark` draws it: each member's own logo beside its name,
 * each under its own pack's boundary.
 */
export default function ProductMarksDemo() {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-10">
      <ProductMark id="www" name="NaniSoft" pack="sky" mark={<NaniSoftMark className="block size-full" />} />
      <ProductMark id="nexus" name="Nexus" pack="cyan" mark={<NexusMark className="block size-full" />} />
      <ProductMark id="atlas" name="Atlas" pack="mint" mark={<AtlasMark className="block size-full" />} />
      <ProductMark id="alphalens" name="AlphaLens" pack="gold" mark={<AlphaLensMark className="block size-full" />} />
      <ProductMark id="prism" name="Prism" pack={null} mark={<PrismMark className="block size-full" />} />
    </div>
  )
}
