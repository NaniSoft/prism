/**
 * The editorial figure for the Prism landing: a prism, a beam and a spectrum.
 *
 * It is a composition rather than a photograph, and that is the honest
 * placeholder: this repository has no brand photography yet, and an abstract
 * figure drawn from the same tokens the system publishes is more truthful than a
 * stock image that says nothing about the product. The one place a spectrum is
 * allowed is here, because Prism owns every hue the products wear, and the mark
 * it draws with is the spectrum itself.
 *
 * It is decorative: the band's title and description carry the meaning, and the
 * figure is `aria-hidden` so a screen reader is not read a set of lines.
 */
export function EditorialPrism() {
  return (
    <svg
      viewBox="0 0 1200 675"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="prism-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="prism-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <rect width="1200" height="675" className="fill-muted" />

      <g className="text-foreground/25" stroke="currentColor" strokeWidth="1.5" fill="none">
        <circle cx="600" cy="338" r="270" />
        <circle cx="600" cy="338" r="204" strokeDasharray="6 10" />
        <circle cx="600" cy="338" r="132" strokeDasharray="3 8" />
        <path d="M 60 338 H 1140" strokeDasharray="2 14" />
      </g>

      <path
        d="M 250 470 L 560 130 L 850 500 Z"
        fill="url(#prism-body)"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M 400 355 L 560 190 L 720 390 Z"
        className="fill-none text-foreground/30"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      <path
        d="M 50 338 L 452 338"
        stroke="url(#prism-beam)"
        strokeWidth="3"
        className="text-foreground"
      />

      <g strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M 610 300 L 1160 100" style={{ stroke: 'var(--chart-1)' }} />
        <path d="M 622 318 L 1160 210" style={{ stroke: 'var(--chart-2)' }} />
        <path d="M 630 338 L 1160 338" style={{ stroke: 'var(--chart-3)' }} />
        <path d="M 622 358 L 1160 466" style={{ stroke: 'var(--chart-4)' }} />
        <path d="M 610 376 L 1160 576" style={{ stroke: 'var(--chart-5)' }} />
      </g>

      <g className="fill-foreground" fill="currentColor">
        <circle cx="610" cy="338" r="6" />
        <circle cx="250" cy="470" r="3" />
        <circle cx="850" cy="500" r="3" />
        <circle cx="560" cy="130" r="3" />
      </g>

      <g className="text-foreground/20" fill="currentColor">
        {[
          [170, 180],
          [980, 110],
          [1040, 540],
          [180, 540],
          [360, 250],
          [760, 560],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />
        ))}
      </g>
    </svg>
  )
}
