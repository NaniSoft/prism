'use client'

import { useEffect, useMemo, useState } from 'react'

import Particles, { ParticlesProvider } from '@tsparticles/react'
import type { ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

/**
 * The landing's living medium: a connected network whose links reach out to the
 * reader's pointer. The ink is read from the page's own foreground and
 * muted-foreground tokens, re-read on theme change, and reduced motion removes it.
 */
export function TsparticlesField() {
  const [ink, setInk] = useState({ particle: '#aebccb', link: '#8b98a7' })
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement)
      const particle = styles.getPropertyValue('--foreground').trim()
      const link = styles.getPropertyValue('--muted-foreground').trim()
      if (particle) setInk({ particle, link: link || particle })
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-pack'],
    })

    let motion: MediaQueryList | null = null
    let onMotion: (() => void) | null = null
    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      motion = mql
      setReduced(mql.matches)
      onMotion = () => setReduced(mql.matches)
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onMotion)
      } else if (typeof mql.addListener === 'function') {
        mql.addListener(onMotion)
      }
    }

    return () => {
      observer.disconnect()
      if (motion && onMotion) {
        if (typeof motion.removeEventListener === 'function') {
          motion.removeEventListener('change', onMotion)
        } else if (typeof motion.removeListener === 'function') {
          motion.removeListener(onMotion)
        }
      }
    }
  }, [])

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false, zIndex: 0 },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 60, density: { enable: true, area: 900 } },
        color: { value: ink.particle },
        shape: { type: 'circle' },
        opacity: { value: 0.35 },
        size: { value: { min: 1, max: 2.5 } },
        links: { enable: true, distance: 150, color: ink.link, opacity: 0.22, width: 1 },
        move: { enable: true, speed: 0.6, direction: 'none', random: true, outModes: { default: 'bounce' } },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 180, links: { opacity: 0.55 } } },
      },
    }),
    [ink],
  )

  if (reduced) return null

  return (
    <ParticlesProvider init={(engine) => loadSlim(engine)}>
      <Particles
        id="tsparticles"
        key={ink.particle + ink.link}
        options={options}
        className="absolute inset-0 h-full w-full"
      />
    </ParticlesProvider>
  )
}
