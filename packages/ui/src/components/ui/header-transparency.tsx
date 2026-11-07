'use client'

import { useEffect } from 'react'

/**
 * The bar's transparency, as a scroll state rather than a client render.
 *
 * `SiteNavbar` renders on the server with an opaque `bg-background`. On a page
 * whose hero fills the first screen, the bar should be invisible there and appear
 * only once the reader starts to scroll, which is a fact about the scroll position
 * and therefore a reader's state: it cannot be a server render.
 *
 * This boundary writes nothing visible itself. It flips one attribute on the
 * document (`data-header`) so the package stylesheet knows the page has a
 * transparent bar, and one on the bar (`data-scrolled`) once the reader is past
 * the top. The layer that actually turns translucent, and the hairline it carries
 * once it does, are CSS rules in this package's stylesheet keyed on those two
 * attributes, so the reveal is a transition rather than a repaint.
 *
 * **Reduced motion does not change its contract.** The transparency is a state
 * change rather than a movement, so it is kept under `prefers-reduced-motion`;
 * the package's universal rule disables transitions, which makes it an instant
 * state change rather than an animated one.
 */
function HeaderTransparency() {
  useEffect(() => {
    document.documentElement.setAttribute('data-header', 'transparent')

    const header = document.querySelector('[data-slot="site-navbar"]')
    const onScroll = () => {
      const scrolled = window.scrollY > 12
      if (scrolled !== header?.hasAttribute('data-scrolled')) {
        header?.toggleAttribute('data-scrolled', scrolled)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.documentElement.removeAttribute('data-header')
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}

export { HeaderTransparency }
