'use client';

import { Tab, Tabs, TabsList } from '@nanisoft/prism-ui/components/tabs';
import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';

import { useThemeSelection } from '@/components/SiteThemeProvider';
import { MODES, MODE_LABELS, PACKS, PACK_LABELS, packSwatch } from '@/lib/theme';

export function ThemeSwitcher() {
  const { selection, setSelection } = useThemeSelection();

  return (
    <div className="site-theme-switcher">
      <span className="site-theme-switcher__current" role="status" aria-live="polite">
        {PACK_LABELS[selection.pack]} · {MODE_LABELS[selection.mode]}
      </span>

      <Tabs value={selection.pack} onValueChange={(pack) => setSelection({ pack: pack as PrismPackId, mode: selection.mode })}>
        <TabsList className="site-theme-switcher__packs" aria-label="Brand pack">
          {PACKS.map((pack) => (
            <Tab key={pack} value={pack} className="site-theme-switcher__pack">
              <span className="site-pack-option">
                <span className="site-pack-option__dot" style={{ background: packSwatch(pack, selection.mode) }} aria-hidden />
                <span className="site-pack-option__label">{PACK_LABELS[pack]}</span>
              </span>
            </Tab>
          ))}
        </TabsList>
      </Tabs>

      <Tabs value={selection.mode} onValueChange={(mode) => setSelection({ pack: selection.pack, mode: mode as PrismMode })}>
        <TabsList className="site-theme-switcher__modes" aria-label="Mode">
          {MODES.map((mode) => <Tab key={mode} value={mode} className="site-theme-switcher__mode">{MODE_LABELS[mode]}</Tab>)}
        </TabsList>
      </Tabs>
    </div>
  );
}
