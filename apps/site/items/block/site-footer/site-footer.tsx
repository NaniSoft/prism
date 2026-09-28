import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer'

/** The site chrome: a brand lockup, grouped destinations, a social link and a legal slot. */
export default function SiteFooterDemo() {
  return (
    <SiteFooter
      product={{ id: 'nexus', name: 'Nexus', pack: 'lavender' }}
      columns={[
        {
          title: 'Site',
          links: [
            { label: 'Landing', href: '#landing' },
            { label: 'Docs', href: '#docs' },
            { label: 'Blog', href: '#blog' },
          ],
        },
        {
          title: 'Elsewhere',
          links: [
            { label: 'GitHub', href: '#github' },
            { label: 'nanisoft.com', href: '#company', newTab: true },
          ],
        },
      ]}
      social={[{ label: 'GitHub', href: '#github' }]}
      legal={<span>2026 NaniSoft. One design language, five sites.</span>}
    />
  )
}
