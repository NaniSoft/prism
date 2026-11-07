import { DSImage } from '@nanisoft/prism-ui/components/ds-image'

const src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='225'><rect width='400' height='225' fill='%23E5E7EB'/></svg>"

/** A card at the governed 4/3 and a hero at 16/9. */
export default function DsImageDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-4">
      <DSImage src={src} alt="Shipped product surface" variant="hero" />
      <DSImage src={src} alt="Release capsule in light" variant="card" />
    </div>
  )
}
