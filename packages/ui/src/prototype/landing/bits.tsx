/**
 * PROTOTYPE (map ticket 11) — small shared markup helpers for the landing
 * variants. Throwaway; real equivalents land as prism-ui blocks/pages.
 */
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { spectralPrimitives } from './theme.js';

type Primitives = ReturnType<typeof spectralPrimitives>;

/** Tiny mono annotation — the specimen-plate voice. */
export function MonoNote({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color: string;
  style?: CSSProperties;
}): ReactElement {
  return (
    <div
      style={{
        fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
        fontSize: 11,
        letterSpacing: '0.04em',
        color,
        opacity: 0.72,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ADR-0001: brand gradients are dithered in the two inks, never blended toward
 * gray. A 3px dot lattice of the ink fading out via mask — dither, not blur.
 */
export function DitherDivider({
  ink,
  from,
  height = 96,
  flip = false,
}: {
  ink: string;
  from: string;
  height?: number;
  flip?: boolean;
}): ReactElement {
  return (
    <div style={{ position: 'relative', height, background: from, overflow: 'hidden' }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${ink} 1px, transparent 1px)`,
          backgroundSize: '3px 3px',
          opacity: 0.35,
          maskImage: `linear-gradient(to ${flip ? 'top' : 'bottom'}, rgba(0,0,0,0.9), transparent)`,
          WebkitMaskImage: `linear-gradient(to ${flip ? 'top' : 'bottom'}, rgba(0,0,0,0.9), transparent)`,
        }}
      />
    </div>
  );
}

/** Mini page wireframe for the PAGES band / preview step — pure hairline divs. */
export function MiniPageWire({ p }: { p: Primitives }): ReactElement {
  const line = (w: string, h = 6): CSSProperties => ({
    width: w,
    height: h,
    background: p.hairline,
    borderRadius: 2,
  });
  return (
    <div
      style={{
        border: `1px solid ${p.hairline}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: p.surface,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          padding: '6px 10px',
          borderBottom: `1px solid ${p.hairline}`,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 2, background: p.ink }} />
        <div style={line('28px')} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <div style={line('22px')} />
          <div style={line('22px')} />
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 88 }}>
        <div style={{ width: 56, borderRight: `1px solid ${p.hairline}`, padding: 8, display: 'grid', gap: 6, alignContent: 'start' }}>
          <div style={line('40px')} />
          <div style={line('32px')} />
          <div style={line('36px')} />
        </div>
        <div style={{ flex: 1, padding: 10, display: 'grid', gap: 8, alignContent: 'start' }}>
          <div style={line('60%', 10)} />
          <div style={line('85%')} />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div style={{ height: 22, width: 64, borderRadius: 4, background: p.ink, opacity: 0.9 }} />
            <div style={{ height: 22, width: 52, borderRadius: 4, border: `1px solid ${p.hairline}` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
