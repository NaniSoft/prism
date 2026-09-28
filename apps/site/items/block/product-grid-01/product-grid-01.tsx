import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01'

/** Two members, one wearing a pack and one wearing the spectrum. */
export default function ProductGrid01Demo() {
  return (
    <ProductGrid01
      headingLevel="h3"
      eyebrow="Preview"
      title="Built on one platform"
      description="One line about the set, above the rows rather than inside one."
      caption="The company root has no pack of its own, so its mark wears the spectrum."
      products={[
        {
          id: 'nexus',
          name: 'Nexus',
          pack: 'lavender',
          tagline: 'The agent factory: an issue in, a reviewed change out.',
          href: '#nexus',
        },
        { id: 'www', name: 'NaniSoft', tagline: 'The company behind the platform.', href: '#www' },
      ]}
    />
  )
}
