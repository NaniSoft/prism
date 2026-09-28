import { ProductSwitcher } from '@nanisoft/prism-ui/components/product-switcher'

/** Three members, with the one the reader is on marked, and one wearing the spectrum. */
export default function ProductSwitcherDemo() {
  return (
    <ProductSwitcher
      currentId="nexus"
      products={[
        { id: 'nexus', name: 'Nexus', pack: 'lavender', href: '#nexus' },
        { id: 'atlas', name: 'Atlas', pack: 'mint', href: '#atlas' },
        { id: 'www', name: 'NaniSoft', href: '#www' },
      ]}
    />
  )
}
