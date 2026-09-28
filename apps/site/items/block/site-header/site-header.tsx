import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header'

/** The site chrome: a brand lockup, the product set, the site nav and a slot. */
export default function SiteHeaderDemo() {
  return (
    <SiteHeader
      product={{ id: 'nexus', name: 'Nexus', pack: 'lavender' }}
      navLabel="Site"
      productsLabel="Products"
      products={[
        { id: 'nexus', name: 'Nexus', pack: 'lavender', href: '#nexus' },
        { id: 'atlas', name: 'Atlas', pack: 'mint', href: '#atlas' },
        { id: 'alphalens', name: 'AlphaLens', pack: 'blush', href: '#alphalens' },
      ]}
      nav={[
        { label: 'Docs', href: '#docs' },
        { label: 'Blog', href: '#blog' },
        { label: 'About', href: '#about', current: true },
      ]}
      actions={<span className="text-muted-foreground text-xs">A control you own</span>}
    />
  )
}
