'use client'

import { useEffect } from 'react'

/**
 * The bar's transparency, as a scroll state. It flips `data-header` on the
 * document (so the stylesheet knows this page has a transparent bar) and
 * `data-scrolled` on the bar once the reader is past the top.
 */
export function HeaderTransparency() {
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
