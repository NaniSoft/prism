/**
 * The destinations and sentences a reader can act on. Data and copy only.
 */
import { SITE_PRODUCT, PRODUCTS } from './site'

export const BAR = {
  currentSiteId: SITE_PRODUCT.id,
  sitesLabel: 'NaniSoft sites',
  navLabel: 'Reference navigation',
  nav: [
    { label: 'Home', href: '/', current: true },
    { label: 'Dashboard', href: '/dashboard', current: false },
    { label: 'Assets', href: '/assets', current: false },
  ],
  search: {
    indexUrl: '/search-index.json',
    label: 'Search the reference',
    hint: 'Try a component name',
    messages: {
      open: 'Open search',
      placeholder: 'Search the reference…',
      empty: 'No results.',
      close: 'Close search',
    },
  },
  themeLabel: 'Colour',
  modeLabels: { lightLabel: 'Light', darkLabel: 'Dark' },
  about: 'The reference consumer: one stylesheet, approved components, no custom CSS.',
  legalLine: '© 2026 NaniSoft. Reference consumer, not a product site.',
  communityLabel: 'Community',
  sites: PRODUCTS,
}
