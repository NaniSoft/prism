/**
 * Which region of this surface a pack boundary belongs to.
 */
export function regionOf(element) {
  // The chooser's swatch, which lives in the top bar the shell composes. It is
  // named before the rail because naming it second would leave it unnamable: it
  // is in no aside and no footer, and a boundary this resolver cannot name is a
  // finding, not a pass.
  if (element.closest('[data-slot="site-navbar-theme-trigger"]')) return 'header.theme'
  if (element.closest('aside')) return 'rail.brand'
  return null
}
