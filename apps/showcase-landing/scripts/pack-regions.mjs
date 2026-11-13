/**
 * Which region of this page a pack boundary belongs to.
 */
export function regionOf(element) {
  // The chooser comes first, because it lives inside the bar the brand also
  // lives in: its swatch is the pack the page is wearing rather than the mark of
  // a product, and a map that counted it as brand would be a map that moved
  // whenever a reader chose.
  if (element.closest('[data-slot="site-navbar-theme-trigger"]')) return 'header.theme'
  if (element.closest('header') || element.closest('[data-slot="site-navbar"]')) return 'header.brand'
  if (element.closest('footer') || element.closest('[data-slot="site-footer"]')) return 'footer.brand'
  return null
}
