'use client'

import { useEffect, useMemo, useState } from 'react'

import Particles, { ParticlesProvider } from '@tsparticles/react'
import type { Engine, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

/**
 * The provider's init callback, at module scope so its identity is stable for
 * the app lifecycle. `ParticlesProvider` keeps the first callback it receives
 * and throws when a later one differs, so an inline arrow here threw
 * `ParticlesProvider init callback must be stable across the app lifecycle`
 * on a re-render or a double mount before the engine finished loading.
 */
const initTsparticles = (engine: Engine): Promise<void> => loadSlim(engine)

/**
 * The landing's living medium: a connected network whose links reach out to the
 * reader's pointer. The ink is read from the page's own foreground and
 * muted-foreground tokens, re-read on theme change, and reduced motion removes it.
 *
 * The initial reads happen in lazy initializers rather than inside the effect:
 * the effect subscribes to change and re-reads in its callbacks, which is the
 * shape React's own rules ask for.
 */
const INK_DEFAULT = { particle: '#aebccb', link: '#8b98a7' }

function readInk() {
  if (typeof window === 'undefined') return INK_DEFAULT
  const styles = getComputedStyle(document.documentElement)
  const particle = styles.getPropertyValue('--foreground').trim()
  const link = styles.getPropertyValue('--muted-foreground').trim()
  return particle ? { particle, link: link || particle } : INK_DEFAULT
}

export function TsparticlesField() {
  const [ink, setInk] = useState(readInk)
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const observer = new MutationObserver(() => setInk(readInk()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-pack'],
    })

    let motion: MediaQueryList | null = null
    let onMotion: (() => void) | null = null
    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      motion = mql
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
    <ParticlesProvider init={initTsparticles}>
      <Particles
        id="tsparticles"
        key={ink.particle + ink.link}
        options={options}
        className="absolute inset-0 h-full w-full"
      />
    </ParticlesProvider>
  )
}
