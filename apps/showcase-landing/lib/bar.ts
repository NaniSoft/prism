/**
 * The destinations and sentences a reader can act on. Data and copy only.
 */
import { SITE_PRODUCT, PRODUCTS } from './site'

export const BAR = {
  currentSiteId: SITE_PRODUCT.id,
  sitesLabel: 'Meridian surfaces',
  navLabel: 'Meridian navigation',
  nav: [
    { label: 'Home', href: '/', current: true },
    { label: 'Pricing', href: '/pricing', current: false },
    { label: 'About', href: '/about', current: false },
    { label: 'Contact', href: '/contact', current: false },
  ],
  themeLabel: 'Colour',
  /*
   * The two names of the mode control, keyed to the mode they are shown in and
   * naming the mode they send a reader to, which is the contract the control
   * draws by. "Light" and "Dark" named the states rather than the destinations,
   * so a reader in dark mode was offered a button that said "Dark" and did the
   * opposite.
   */
  modeLabels: { lightLabel: 'Switch to dark mode', darkLabel: 'Switch to light mode' },
  about: 'Meridian is a fictional store operations product, composed entirely from Prism as the landing showcase.',
  legalLine: '© 2026 NaniSoft. Meridian is fictional, and every surface of it is the Prism design system.',
  communityLabel: 'Community',
  sites: PRODUCTS,
}
