'use client';

import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from '@nanisoft/prism-ui/components/popover';
import { RadioGroup, RadioItem } from '@nanisoft/prism-ui/components/radio-group';
import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';

import { useThemeSelection } from '@/components/SiteThemeProvider';
import { MODES, MODE_LABELS, PACKS, PACK_LABELS, packSwatch } from '@/lib/theme';

interface ThemeSwitcherProps {
  placement?: 'header' | 'drawer';
}

export function ThemeSwitcher({ placement = 'header' }: ThemeSwitcherProps) {
  const { selection, setSelection } = useThemeSelection();
  const selectionLabel = `${PACK_LABELS[selection.pack]} · ${MODE_LABELS[selection.mode]}`;

  return (
    <div className={`site-theme-switcher site-theme-switcher--${placement}`}>
      <span className="site-theme-switcher__current" role="status" aria-live="polite">{selectionLabel}</span>
      <Popover>
        <PopoverTrigger className="site-theme-switcher__trigger" aria-label={`Theme: ${selectionLabel}. Change brand pack and mode`}>
          <span className="site-theme-switcher__trigger-mark" style={{ background: packSwatch(selection.pack, selection.mode) }} aria-hidden />
          <span className="site-theme-switcher__trigger-copy">
            <strong>{PACK_LABELS[selection.pack]}</strong>
            <small>{MODE_LABELS[selection.mode]}</small>
          </span>
          <PrismIcon name={selection.mode === 'dark' ? 'moon' : 'sun'} size={15} />
          <PrismIcon name="chevron-down" size={14} />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner align="end">
            <PopoverPopup className="site-theme-switcher__popup">
              <PopoverTitle className="site-theme-switcher__title">Theme</PopoverTitle>
              <p className="site-theme-switcher__description">Choose one brand pack and one mode. The full site changes together.</p>

              <fieldset className="site-theme-switcher__group">
                <legend>Brand pack</legend>
                <RadioGroup
                  value={selection.pack}
                  onValueChange={(pack) => setSelection({ pack: pack as PrismPackId, mode: selection.mode })}
                  className="site-theme-switcher__options site-theme-switcher__packs"
                  aria-label="Brand pack"
                >
                  {PACKS.map((pack) => (
                    <RadioItem
                      key={pack}
                      value={pack}
                      id={`site-theme-${placement}-pack-${pack}`}
                      className="site-theme-switcher__option"
                      label={(
                        <span className="site-theme-switcher__pack-option">
                          <span className="site-theme-switcher__pack-dot" style={{ background: packSwatch(pack, selection.mode) }} aria-hidden />
                          {PACK_LABELS[pack]}
                        </span>
                      )}
                    />
                  ))}
                </RadioGroup>
              </fieldset>

              <fieldset className="site-theme-switcher__group">
                <legend>Mode</legend>
                <RadioGroup
                  value={selection.mode}
                  onValueChange={(mode) => setSelection({ pack: selection.pack, mode: mode as PrismMode })}
                  className="site-theme-switcher__options site-theme-switcher__modes"
                  aria-label="Mode"
                >
                  {MODES.map((mode) => (
                    <RadioItem
                      key={mode}
                      value={mode}
                      id={`site-theme-${placement}-mode-${mode}`}
                      className="site-theme-switcher__option"
                      label={(
                        <span className="site-theme-switcher__mode-option">
                          <PrismIcon name={mode === 'dark' ? 'moon' : 'sun'} size={14} />
                          {MODE_LABELS[mode]}
                        </span>
                      )}
                    />
                  ))}
                </RadioGroup>
              </fieldset>
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </Popover>
    </div>
  );
}
