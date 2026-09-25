// The theme gallery (ADR-0005): the pastel spectrum worn live. Each of the ten
// pack × mode expressions renders as a real themed island — the generated
// `prism-<pack>-<mode>` class and nested provider scope the complete theme —
// so nothing on this page is a mockup.
// "Wear this theme" hands an island's selection to the shell provider.
//
// FORM: extension of the established Spectral Refraction world (ADR-0001) —
// no direction roll of its own; seed provenance and the user's locked decision
// live in ticket 24 and ADR-0005.

import type { ReactElement } from 'react';

import { Button } from '@nanisoft/prism-ui/components/button';
import { PrismProvider } from '@nanisoft/prism-ui/provider';
import { getPrismTheme, prismBrandPacks, type PrismMode, type PrismPackId } from '@nanisoft/prism-tokens';

import { ThemeControls } from '@/components/ThemeControls';
import { TryThemeButton } from '@/components/TryThemeButton';
import { MODES, MODE_LABELS, PACKS, PACK_LABELS, packSwatch, themeClass } from '@/lib/theme';

/** The mode-resolved hexes one island annotates itself with. */
function islandHexes(pack: PrismPackId, mode: PrismMode): { ink: string; ground: string; text: string } {
  const brand = prismBrandPacks[pack];
  const light = mode === 'light';
  return {
    ink: light ? brand.ink.light : brand.ink.dark,
    ground: light ? brand.ground.light : brand.ground.dark,
    text: light ? brand.text.light : brand.text.dark,
  };
}

function Swatch({ label, hex }: { label: string; hex: string }): ReactElement {
  return (
    <span className="site-themes__swatch">
      <span className="site-themes__swatch-dot" style={{ background: hex }} aria-hidden />
      <span className="site-mono">
        {label} {hex}
      </span>
    </span>
  );
}

/** One live expression: real components, scoped by the pre-baked variable class. */
function ThemeIsland({ pack, mode }: { pack: PrismPackId; mode: PrismMode }): ReactElement {
  const theme = getPrismTheme(pack, mode);
  const { ink, ground, text } = islandHexes(pack, mode);

  return (
    <PrismProvider prismTheme={theme}>
      <div className={`site-themes__island ${themeClass(pack, mode)}`}>
        <div className="site-themes__island-head">
          <span className="site-themes__island-name">
            <span className="site-themes__island-dot" style={{ background: packSwatch(pack, mode) }} aria-hidden />
            {PACK_LABELS[pack]}
          </span>
          <span className="site-mono site-themes__island-mode">{MODE_LABELS[mode]}</span>
          <span className="site-themes__island-try">
            <TryThemeButton selection={{ pack, mode }} />
          </span>
        </div>

        <div className="site-themes__island-plate">
          <ThemeControls pack={pack} mode={mode} />
        </div>

        <div className="site-themes__island-hexes">
          <Swatch label="ink" hex={ink} />
          <Swatch label="ground" hex={ground} />
          <Swatch label="text" hex={text} />
        </div>
      </div>
    </PrismProvider>
  );
}

/** One pack, its two modes side by side: comparison before repetition. */
function ThemePair({ pack }: { pack: PrismPackId }): ReactElement {
  const headingId = `theme-pair-${pack}`;
  return (
    <section className="site-themes__pair" aria-labelledby={headingId}>
      <div className="site-themes__pair-head">
        <h2 id={headingId} className="site-themes__pair-name">
          <span className="site-themes__island-dot" style={{ background: packSwatch(pack) }} aria-hidden />
          {PACK_LABELS[pack]}
        </h2>
        <span className="site-mono site-themes__pair-note">light + beam-dark</span>
      </div>
      <div className="site-themes__pair-grid">
        {MODES.map((mode) => (
          <ThemeIsland key={`${pack}-${mode}`} pack={pack} mode={mode} />
        ))}
      </div>
    </section>
  );
}

/** The spectrum strip — all five inks at a glance, light and dark. */
function SpectrumStrip(): ReactElement {
  return (
    <div className="site-themes__strip">
      {PACKS.map((pack) => (
        <div key={pack} className="site-themes__strip-cell">
          <span className="site-themes__strip-dot" style={{ background: packSwatch(pack) }} aria-hidden />
          <span className="site-themes__strip-name">{PACK_LABELS[pack]}</span>
          <span className="site-mono site-themes__strip-hex">{prismBrandPacks[pack].ink.light}</span>
          <span className="site-mono site-themes__strip-hex">{prismBrandPacks[pack].ink.dark}</span>
        </div>
      ))}
    </div>
  );
}

export const metadata = {
  title: 'Themes',
  description: 'Prism’s five pastel brand packs in light and beam-dark — the whole spectrum, worn live.',
};

export default function ThemesPage(): ReactElement {
  return (
    <div className="site-themes">
      <div className="site-shell">
        <section className="site-themes__hero">
          <h1 className="site-themes__title">One beam, five refractions.</h1>
          <p className="site-themes__lede">
            Five brand packs, each in light and beam-dark — one design language expressed ten ways. Pastel
            tints carry the grounds, hairlines, and washes; every ink stays a mid-tone of its own hue and
            holds WCAG AA on its ground. <code className="site-mono">createPrismTheme()</code> switches a
            pack with one argument.
          </p>
        </section>

        <SpectrumStrip />

        <p className="site-specimen-note">
          Every island is live: try the local controls, then choose Wear this theme to hand the pack and
          mode to the whole site.
        </p>

        <div className="site-themes__grid">
          {PACKS.map((pack) => (
            <ThemePair key={pack} pack={pack} />
          ))}
        </div>

        <section className="site-themes__foot">
          <h2>Every expression is one factory call.</h2>
          <p>
            Packs are data, validated at definition time — the same AA gate that keeps every ink legible is
            the gate a new pack passes to ship. Wear one above, or take the whole spectrum into your app.
          </p>
          <div className="site-themes__foot-code">
            {
              "import { createPrismTheme } from '@nanisoft/prism-tokens';\n\nconst theme = createPrismTheme({ pack: 'lavender', mode: 'dark' });"
            }
          </div>
          <div className="site-themes__foot-cta">
            <Button variant="primary" size="lg" href="/docs">
              Read the docs
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
