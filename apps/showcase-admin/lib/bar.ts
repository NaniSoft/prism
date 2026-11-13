/**
 * The console's navigation and its two ways out. Data and copy only.
 *
 * The theme words sit beside the navigation because they are the bar's third and
 * fourth controls rather than settings-page copy: a reader who repaints the
 * console does it from the bar, on the page they are working at, and the words
 * they hear are Meridian's.
 */
export const BAR = {
  navLabel: 'Console navigation',
  nav: [
    { label: 'Overview', href: '/' },
    { label: 'Orders', href: '/orders' },
    { label: 'Products', href: '/products' },
    { label: 'Customers', href: '/customers' },
    { label: 'Settings', href: '/settings' },
  ],
  themeLabel: 'Colour',
  modeLabels: { lightLabel: 'Switch to dark mode', darkLabel: 'Switch to light mode' },
  shopFront: { label: 'The shop front', href: 'https://prism.nanisoft.com/showcase/landing' },
  prism: { label: 'Built with Prism', href: 'https://prism.nanisoft.com' },
  operator: { initials: 'AL', name: 'Ama Liu' },
}
