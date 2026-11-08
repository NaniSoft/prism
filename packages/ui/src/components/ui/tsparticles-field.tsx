'use client'

import { useEffect, useMemo, useState } from 'react'

import Particles, { ParticlesProvider } from '@tsparticles/react'
import type { Engine, ISourceOptions } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

import { cn } from '../../lib/utils'

/**
 * The props a `TsparticlesField` takes.
 */
export type TsparticlesFieldProps = {
  /**
   * How many points the field carries. Read as a suggestion and clamped, because
   * a field behind a hero wants dozens and a field behind a panel wants a
   * handful.
   */
  count?: number
  /**
   * How far apart two points may sit and still be linked, in CSS pixels. The links
   * are what make a field read as a medium rather than as dust.
   */
  linkDistance?: number
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The provider's init callback, at module scope so its identity is stable for
 * the app lifecycle. `ParticlesProvider` keeps the first callback it receives
 * and throws when a later one differs, so an inline arrow here threw
 * `ParticlesProvider init callback must be stable across the app lifecycle`
 * on a re-render or a double mount before the engine finished loading.
 */
const initTsparticles = (engine: Engine): Promise<void> => loadSlim(engine)

/**
 * The floor the page paints before any script runs, in its own user units: the
 * static field the living field stands in for, so the figure is complete with
 * scripting off and still true with the animation stopped.
 */
const FLOOR_WIDTH = 1400
const FLOOR_HEIGHT = 800

/**
 * The static floor: a scatter of small marks with a few larger halos in the
 * pack's primary, placed by the same golden-angle walk `SignalField` uses so it
 * is reproducible without a seed and never looks hand-scattered.
 */
function floorMarks(count: number): Array<{ x: number; y: number; r: number; halo: boolean }> {
  const golden = 2.399963229728653
  return Array.from({ length: count }, (_, index) => ({
    x: ((index * golden) % 1) * FLOOR_WIDTH,
    y: ((index + 0.5) / count) * FLOOR_HEIGHT,
    r: index % 11 === 0 ? 4.5 : 1.6,
    halo: index % 11 === 0,
  }))
}

/**
 * A living field whose links reach out to the reader's pointer: a connected
 * network drawn by tsParticles, for a page that wants the medium to answer the
 * cursor rather than merely drift under it.
 *
 * **The floor is the contract, and the engine only ever adds the motion.** Like
 * Prism's own `ParticleField`, this Component renders the complete figure, a
 * scattered field of marks, on the server, and the script only ever arms the
 * engine over it. A reader with scripting off, a crawler, a print stylesheet, or
 * a reader who asked the platform for less motion meets the static floor, still
 * and complete, rather than an empty rectangle.
 *
 * **The ink is read from the page, not written here.** The particle and link
 * colours are the document's own foreground and muted-foreground tokens, re-read
 * when the pack or mode changes, so the field repaints with the theme like every
 * other element on the page. A canvas paints pixels it has already resolved, and
 * this one is told to repaint rather than being left holding the colours it was
 * born with.
 *
 * **It is a client Component, and the only one in this figure's tree.** The floor
 * is server-rendered markup; the engine is armed by the package and disarmed
 * under `prefers-reduced-motion`, and the whole field is `aria-hidden`, because
 * a medium is not information.
 */
function TsparticlesField({ count = 60, linkDistance = 150, className }: TsparticlesFieldProps) {
  const [ink, setInk] = useState({ particle: '#aebccb', link: '#8b98a7' })
  const [reduced, setReduced] = useState(false)
  const marks = Math.max(12, Math.min(140, Math.round(count)))

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

    // `matchMedia` is not present in every environment this component mounts in,
    // and the reduced-motion stop is a courtesy rather than a requirement for the
    // medium to draw. Where the platform cannot answer the question, the field
    // simply stays in motion.
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
        number: { value: marks, density: { enable: true, area: 900 } },
        color: { value: ink.particle },
        shape: { type: 'circle' },
        opacity: { value: 0.35 },
        size: { value: { min: 1, max: 2.5 } },
        links: { enable: true, distance: Math.min(220, Math.max(48, linkDistance)), color: ink.link, opacity: 0.22, width: 1 },
        move: { enable: true, speed: 0.6, direction: 'none', random: true, outModes: { default: 'bounce' } },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 180, links: { opacity: 0.55 } } },
      },
    }),
    [ink, marks, linkDistance],
  )

  return (
    <div
      data-slot="tsparticles-field"
      data-marks={marks}
      aria-hidden
      className={cn('pointer-events-none relative h-full w-full', className)}
    >
      {/*
        The floor. Absolute behind the engine's canvas, so a reader who never gets
        the engine sees the field the engine would have drawn, at rest.
      */}
      <svg
        data-slot="tsparticles-field-floor"
        viewBox={`0 0 ${FLOOR_WIDTH} ${FLOOR_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {floorMarks(marks).map((mark, index) => (
          <circle
            key={index}
            data-slot="tsparticles-field-mark"
            cx={mark.x}
            cy={mark.y}
            r={mark.r}
            strokeWidth={0}
            className={mark.halo ? 'fill-primary/30' : 'fill-foreground/12'}
          />
        ))}
      </svg>
      {reduced ? null : (
        <ParticlesProvider init={initTsparticles}>
          <Particles
            id="tsparticles"
            key={ink.particle + ink.link}
            options={options}
            className="absolute inset-0 h-full w-full"
          />
        </ParticlesProvider>
      )}
    </div>
  )
}

export { TsparticlesField }
