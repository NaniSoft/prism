/**
 * Which region of this page a pack boundary belongs to.
 */
export function regionOf(element) {
  if (element.closest('header') || element.closest('[data-slot="site-navbar"]')) return 'header.brand'
  if (element.closest('footer') || element.closest('[data-slot="site-footer"]')) return 'footer.brand'
  const pack = element.getAttribute('data-pack')
  if (pack) return `assets.${pack}`
  return null
}
