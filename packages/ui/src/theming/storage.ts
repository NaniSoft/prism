// The chrome's one storage slot (ADR-0006 §4): the shared key the mode
// provider writes and the boot script reads, so the toggle and the boot can
// never disagree. The value is the mode only — the pack is fixed per site —
// which makes a visitor's light/beam-dark choice travel across all five
// NaniSoft sites.

import type { PrismMode } from '@nanisoft/prism-tokens';

export const PRISM_THEME_MODE_STORAGE_KEY = 'prism-theme-mode';

/** Parse a stored value; anything but the two exact mode strings is garbage. */
export function parsePrismThemeMode(value: string | null | undefined): PrismMode | undefined {
  return value === 'light' || value === 'dark' ? value : undefined;
}
