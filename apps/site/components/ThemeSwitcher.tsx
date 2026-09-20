'use client';

// The shell-level pack × mode switcher (ticket 12 §2). Five packs — one Segmented
// with each pack's own ink as its swatch dot — plus the mode (light | beam-dark)
// control, driving SiteThemeProvider.

import { Segmented } from '@nanisoft/prism-ui/components';

import { useThemeSelection } from '@/components/SiteThemeProvider';
import { MODES, MODE_LABELS, PACKS, PACK_LABELS, packSwatch } from '@/lib/theme';
import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';

export function ThemeSwitcher() {
  const { selection, setSelection } = useThemeSelection();

  return (
    <div className="site-theme-switcher">
      <Segmented<PrismPackId>
        size="small"
        value={selection.pack}
        options={PACKS.map((pack) => ({
          value: pack,
          label: (
            <span className="site-pack-option">
              <span className="site-pack-option__dot" style={{ background: packSwatch(pack) }} aria-hidden />
              <span className="site-pack-option__label">{PACK_LABELS[pack]}</span>
            </span>
          ),
        }))}
        onChange={(pack) => setSelection({ pack, mode: selection.mode })}
        aria-label="Brand pack"
      />
      <Segmented<PrismMode>
        size="small"
        value={selection.mode}
        options={MODES.map((mode) => ({ label: MODE_LABELS[mode], value: mode }))}
        onChange={(mode) => setSelection({ pack: selection.pack, mode })}
        aria-label="Mode"
      />
    </div>
  );
}
