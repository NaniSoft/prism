'use client'

import { useEffect, useRef } from 'react'

import { cn } from '../../lib/utils'

/**
 * How many points the living field carries, how far a link reaches, and whether
 * the reader's pointer is one of the forces.
 *
 * A field is atmosphere, exactly as on `SignalField`, so the numbers are
 * suggestions rather than data: the count is clamped, and a density no canvas
 * can carry is refused before it is drawn.
 */
export type ParticleFieldProps = {
  /**
   * How many points the field drifts. Read as a suggestion and clamped, because
   * a field behind a hero wants dozens and a field behind a panel wants a
   * handful, and a count outside that range is either a haze or a chart.
   */
  count?: number
  /**
   * How far apart two points may sit and still be linked, in CSS pixels. The
   * links are what make a field read as a medium rather than as dust, and the
   * distance is a prop because a wide band carries longer lines than a panel.
   */
  linkDistance?: number
  /**
   * Whether the reader's pointer pushes the field. On by default, because a
   * medium that answers the hand is the claim this figure makes; a caller
   * placing the field under text a reader is selecting turns it off, because a
   * surface that moves while a reader drags across it is a surface fighting
   * the selection.
   */
  interactive?: boolean
  /** The name of the figure, or `decorative`. See `SignalFieldProps`. */
  label?: string
  decorative?: boolean
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The floor the page paints before any script runs, in its own user units. It
 * is the drawing the field falls back to, and it is placed by the same
 * golden-angle walk `SignalField` uses so the two fields are reproducible
 * without a seed and never look hand-scattered.
 */
const FLOOR_WIDTH = 1400
const FLOOR_HEIGHT = 800

/**
 * The static floor: a scatter of small marks with a few larger halos in the
 * pack's primary. Deliberately sparser than the living field it stands in for,
 * because the floor is the figure at rest and a figure at rest needs less
 * density to read as the same medium.
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
 * One point of the living field. The velocity is stored as the drift the point
 * returns to, so a push from the reader's pointer decays back into the field's
 * own tempo rather than being clamped, and a field that was disturbed settles
 * rather than stopping.
 */
type Particle = {
  x: number
  y: number
  homeVx: number
  homeVy: number
  vx: number
  vy: number
  radius: number
}

/**
 * Arm the canvas: begin the loop, or decline to.
 *
 * Returns the disarm function, which every path out of the effect must call.
 * Every listener and observer created here is closed over the same
 * `AbortController` and disconnected together, so a field that unmounts while
 * off screen leaves nothing scheduled.
 */
function armField(
  canvas: HTMLCanvasElement,
  count: number,
  linkDistance: number,
  interactive: boolean,
): () => void {
  const context = canvas.getContext('2d')
  if (!context || typeof window.matchMedia !== 'function') return () => {}

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

  /*
   * The palette and the tempo are read from the page the canvas sits in, so
   * the field is inked by the same tokens that ink everything around it. They
   * are re-read when the document's own pack or mode changes, which is the
   * objection the retired canvas line could not answer: a canvas paints pixels
   * it has already resolved, so a repaint the rest of the page gets for free
   * is a repaint this figure has to be told about.
   */
  let ink = 'transparent'
  let wash = 'transparent'
  let link = 'transparent'
  let cycleLength = 18000
  const readPage = () => {
    const styles = getComputedStyle(canvas)
    ink = styles.getPropertyValue('--foreground').trim() || ink
    wash = styles.getPropertyValue('--primary').trim() || wash
    link = styles.getPropertyValue('--muted-foreground').trim() || link
    const drift = styles.getPropertyValue('--ambient-drift').trim()
    if (drift.endsWith('ms')) {
      const parsed = Number.parseFloat(drift)
      if (Number.isFinite(parsed) && parsed > 0) cycleLength = parsed
    }
  }
  readPage()

  const pageObserver = new MutationObserver(readPage)
  pageObserver.observe(document.documentElement, {
    attributeFilter: ['class', 'data-pack'],
    attributes: true,
  })

  /*
   * The particles, placed on the same deterministic walk as the floor and
   * carrying the drift's own speed: a point crosses a bounded distance in one
   * turn of the ambient drift cycle, whatever the token says that turn is. The
   * direction is drawn from the index rather than at random so the field is
   * the same field on every arm, and the speed varies per point so the medium
   * never moves as one sheet.
   */
  let width = 0
  let height = 0
  let particles: Particle[] = []

  const CROSS_DISTANCE = 240
  const place = () => {
    const golden = 2.399963229728653
    particles = Array.from({ length: count }, (_, index) => {
      const angle = (index * golden) % (Math.PI * 2)
      const speed = ((CROSS_DISTANCE / cycleLength) * (0.6 + ((index * 13) % 9) / 10)) || 0.01
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      return {
        x: (((index * golden) % 1) * width),
        y: (((index * 7919) % 1) * height),
        homeVx: vx,
        homeVy: vy,
        vx,
        vy,
        radius: 1.1 + ((index * 17) % 5) / 5,
      }
    })
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (particles.length === 0 && width > 0 && height > 0) place()
  }
  resize()

  /*
   * The pointer is one of the forces, held in the canvas's own coordinates and
   * read once per movement rather than once per frame, so the loop never pays
   * for a layout the reader has not caused. A pointer that leaves the window
   * stops being a force at all.
   */
  let pointerX = Number.NaN
  let pointerY = Number.NaN
  const controller = new AbortController()
  if (interactive) {
    window.addEventListener(
      'pointermove',
      (event) => {
        const box = canvas.getBoundingClientRect()
        pointerX = event.clientX - box.left
        pointerY = event.clientY - box.top
      },
      { passive: true, signal: controller.signal },
    )
    window.addEventListener(
      'pointerdown',
      (event) => {
        const box = canvas.getBoundingClientRect()
        pointerX = event.clientX - box.left
        pointerY = event.clientY - box.top
      },
      { passive: true, signal: controller.signal },
    )
    document.documentElement.addEventListener(
      'pointerleave',
      () => {
        pointerX = Number.NaN
        pointerY = Number.NaN
      },
      { signal: controller.signal },
    )
  }

  const POINTER_RADIUS = 130
  let frame = 0
  let last = 0

  const draw = (now: number) => {
    /*
     * The step is the elapsed time between frames, clamped so a tab that slept
     * does not hand the field one enormous stride on waking. The displacement
     * is a fraction of the drift cycle, which is the token's answer to "how
     * fast does a medium move", and no literal frame budget is named anywhere.
     */
    const step = Math.min(now - last, 100) / cycleLength
    last = now

    context.clearRect(0, 0, width, height)

    for (const particle of particles) {
      if (Number.isFinite(pointerX)) {
        const dx = particle.x - pointerX
        const dy = particle.y - pointerY
        const distance = Math.hypot(dx, dy)
        if (distance < POINTER_RADIUS && distance > 0.5) {
          const push = ((POINTER_RADIUS - distance) / POINTER_RADIUS) * 0.9
          particle.vx += (dx / distance) * push
          particle.vy += (dy / distance) * push
        }
      }
      particle.vx += (particle.homeVx - particle.vx) * 0.03
      particle.vy += (particle.homeVy - particle.vy) * 0.03
      particle.x += particle.vx * CROSS_DISTANCE * step
      particle.y += particle.vy * CROSS_DISTANCE * step

      if (particle.x < -20) particle.x += width + 40
      if (particle.x > width + 20) particle.x -= width + 40
      if (particle.y < -20) particle.y += height + 40
      if (particle.y > height + 20) particle.y -= height + 40
    }

    const square = linkDistance * linkDistance
    context.lineWidth = 1
    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i]
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const squareDistance = dx * dx + dy * dy
        if (squareDistance < square) {
          const nearness = 1 - Math.sqrt(squareDistance) / linkDistance
          context.globalAlpha = nearness * 0.4
          context.strokeStyle = link
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }
    }

    context.globalAlpha = 0.5
    context.fillStyle = ink
    for (const particle of particles) {
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      context.fill()
    }
    context.globalAlpha = 0.35
    context.fillStyle = wash
    for (const particle of particles) {
      if (particle.radius > 1.8) {
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius * 2.4, 0, Math.PI * 2)
        context.fill()
      }
    }
    context.globalAlpha = 1

    frame = window.requestAnimationFrame(draw)
  }

  const start = () => {
    if (frame === 0) {
      last = performance.now()
      frame = window.requestAnimationFrame(draw)
    }
  }
  const stop = () => {
    if (frame !== 0) {
      window.cancelAnimationFrame(frame)
      frame = 0
    }
  }

  /*
   * The loop runs while the field is on screen and the reader has not asked
   * the platform for less motion. Reduced motion disarms rather than pauses:
   * a field a reader asked to be still is the static floor, not a canvas
   * waiting to be argued back into motion.
   */
  const onReducedChange = () => {
    if (reduced.matches) {
      stop()
    } else {
      start()
    }
  }
  reduced.addEventListener('change', onReducedChange)

  const visibility = new IntersectionObserver((entries) => {
    if (reduced.matches) return
    if (entries.some((entry) => entry.isIntersecting)) {
      start()
    } else {
      stop()
    }
  })
  visibility.observe(canvas)

  const sizing = new ResizeObserver(() => {
    resize()
    place()
  })
  sizing.observe(canvas)

  if (!reduced.matches) start()

  return () => {
    stop()
    controller.abort()
    reduced.removeEventListener('change', onReducedChange)
    visibility.disconnect()
    sizing.disconnect()
    pageObserver.disconnect()
  }
}

/**
 * A living field: points drifting on linked paths, the atmosphere a page's
 * largest statements stand in front of.
 *
 * **It is the one script-driven figure in the system, and the floor is the
 * contract.** The retired line drew this on a canvas and nothing else, so the
 * figure was the script: a reader with scripting off, a crawler, or a print
 * stylesheet met an empty rectangle where a medium should be. This Component
 * renders the complete figure, a scattered field of marks, on the server, and
 * the script only ever adds the motion. Stop the loop, disarm the canvas, print
 * the page: the figure is still true, which is the test every ambient figure
 * in this system has to pass.
 *
 * **The field is inked by the page, not by a prop.** The points, the links and
 * the halos read the foreground, the border and the primary the surrounding
 * page resolves, and they are re-read when the document's pack or mode
 * changes, so a field under the theme chooser repaints with the page rather
 * than keeping the colours it was born with. A pack boundary drawn inside the
 * page around the field is not observed; the field reads the ground it was
 * mounted on, which is the ground a caller placing it composes.
 *
 * **Reduced motion disarms it, and the loop is bounded by the reader's
 * attention.** A reader who asked the platform for less motion gets the static
 * floor, still and complete, and the canvas never arms; the loop stops when
 * the field leaves the viewport; the whole field is `aria-hidden` unless a
 * caller names it, because a medium is not information.
 *
 * **It is a client Component, and the only one in this figure's tree.** The
 * floor is server-rendered markup and hydrates without a mismatch, because
 * the placement is a function of the count rather than of the clock: no random
 * draw runs during render, and the living points are placed at arm time from
 * the same deterministic walk.
 */
function ParticleField({
  count = 64,
  linkDistance = 120,
  interactive = true,
  label,
  decorative = true,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const placed = floorMarks(Math.max(12, Math.min(140, Math.round(count))))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return armField(
      canvas,
      Math.max(12, Math.min(140, Math.round(count))),
      Math.max(48, Math.min(220, Math.round(linkDistance))),
      interactive,
    )
  }, [count, linkDistance, interactive])

  return (
    <div
      data-slot="particle-field"
      data-marks={placed.length}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn('pointer-events-none relative h-full w-full', className)}
    >
      {/*
       * The floor. Absolute behind the canvas, sized by the same slice the
       * living field uses, so a reader who never gets the loop sees the field
       * the loop would have drawn, at rest.
       */}
      <svg
        data-slot="particle-field-floor"
        viewBox={`0 0 ${FLOOR_WIDTH} ${FLOOR_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {placed.map((mark, index) => (
          <circle
            key={index}
            data-slot="particle-field-mark"
            cx={mark.x}
            cy={mark.y}
            r={mark.r}
            strokeWidth={0}
            className={mark.halo ? 'fill-primary/30' : 'fill-foreground/12'}
          />
        ))}
      </svg>
      <canvas
        ref={canvasRef}
        data-slot="particle-field-canvas"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}

export { ParticleField }
