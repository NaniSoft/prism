import { DSMediaCard } from '@nanisoft/prism-ui/components/ds-media-card'

const src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%23E5E7EB'/></svg>"

/** The governed picture over the caller's words. */
export default function DsMediaCardDemo() {
  return (
    <DSMediaCard
      image={{ src, alt: 'Release capsule in light' }}
      title="Release capsule"
      description="A governed medium over the caller's own words."
    />
  )
}
