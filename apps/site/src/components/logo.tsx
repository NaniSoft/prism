import type { ReactElement } from 'react';

/**
 * The mark of the design system itself: a beam entering a prism and leaving
 * refracted through the chart colours, which is the system's whole claim in one
 * drawing - one input, a spectrum out.
 *
 * The incoming beam is `currentColor`, so the mark follows the ink it sits
 * beside, and the refraction reads the chart tokens as cascade variables rather
 * than resolved values, so the spectrum follows the pack like every other fill
 * on the page. A logo that named a hex would be the one element a theme could
 * not reach.
 */
export function PrismLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Prism"
      className={className}
    >
      <g strokeLinecap="round">
        <path d="M4 16 L13 16" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 14 L28 8" style={{ stroke: 'var(--chart-1)' }} strokeWidth="2.5" />
        <path d="M15 16 L28 16" style={{ stroke: 'var(--chart-2)' }} strokeWidth="2.5" />
        <path d="M15 18 L28 24" style={{ stroke: 'var(--chart-3)' }} strokeWidth="2.5" />
        <path d="M13 12 L15 20 L13 20 Z" style={{ fill: 'var(--brand-ink)' }} stroke="none" />
      </g>
    </svg>
  );
}
