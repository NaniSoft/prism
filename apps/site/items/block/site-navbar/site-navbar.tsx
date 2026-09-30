'use client'

import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar'

/**
 * The site bar with every control on it: search, the family's sites, the colour
 * chooser, the light and dark control, and the panel that carries the navigation
 * below the row's own threshold.
 *
 * The search index URL is the documentation site's own, so the control in this
 * demo is the real one rather than a picture of one.
 */
export default function SiteNavbarDemo() {
  return (
    <SiteNavbar
      product={{ id: 'prism', name: 'Prism' }}
      homeHref="#navbar"
      defaultPack="default"
      defaultMode="light"
      navLabel="Sections"
      mobileLabels={{ open: 'Open menu', close: 'Close menu' }}
      currentSiteId="prism"
      sitesLabel="The family"
      sites={[
        { id: 'www', name: 'NaniSoft', pack: 'sky', href: 'https://www.nanisoft.com' },
        { id: 'nexus', name: 'Nexus', pack: 'lavender', href: 'https://nexus.nanisoft.com' },
        { id: 'atlas', name: 'Atlas', pack: 'mint', href: 'https://atlas.nanisoft.com' },
        { id: 'alphalens', name: 'AlphaLens', pack: 'blush', href: 'https://alphalens.nanisoft.com' },
        { id: 'prism', name: 'Prism', pack: null, href: '#navbar' },
      ]}
      nav={[
        { label: 'Overview', href: '#overview' },
        { label: 'Foundation', href: '#foundation' },
        { label: 'Content', href: '#content' },
        { label: 'Components', href: '#components' },
        { label: 'Blocks', href: '#blocks', current: true },
        { label: 'Pages', href: '#pages' },
      ]}
      search={{
        indexUrl: '/api/search',
        label: 'Search documentation',
        hint: 'Type to search every Section and every Item.',
        messages: {
          close: 'Close search',
          loading: 'Loading the search index.',
          failed: 'The search index could not be loaded.',
          empty: 'No matches.',
          one: 'result.',
          other: 'results.',
        },
      }}
      theme={{ label: 'Colour theme' }}
      mode={{ lightLabel: 'Switch to dark mode', darkLabel: 'Switch to light mode' }}
    />
  )
}
