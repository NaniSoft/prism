'use client';

// PrismThemeModeProvider (ADR-0006 §4): the chrome's one context. Static
// identity travels as props (the pack is fixed per site — the chrome flips
// mode only); mode is the one stateful thing in the chrome, so it is the one
// context. It wraps PrismProvider with the theme for the current mode, swaps
// the pre-baked variable class on <html> (the same class the boot script set
// pre-paint, so toggle and boot can never disagree), and persists to the one
// shared storage key.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getPrismTheme, prismCssVarKey, type PrismMode, type PrismPackId } from '@nanisoft/prism-tokens';

import { PRISM_THEME_MODE_STORAGE_KEY, parsePrismThemeMode } from '../theming/storage.js';
import { PrismProvider } from './PrismProvider.js';

export interface PrismThemeModeValue {
  readonly mode: PrismMode;
  readonly setMode: (mode: PrismMode) => void;
  readonly toggleMode: () => void;
}

const PrismThemeModeContext = createContext<PrismThemeModeValue | undefined>(undefined);

/** Swap the pre-baked variable class on <html> — colors come from the class, so the swap is the whole repaint. */
function applyModeClass(pack: PrismPackId, mode: PrismMode): void {
  const el = document.documentElement;
  for (const className of Array.from(el.classList)) {
    if (className.startsWith('prism-')) el.classList.remove(className);
  }
  el.classList.add(prismCssVarKey(pack, mode));
}

export interface PrismThemeModeProviderProps {
  /** The site's fixed pack — identity is static and known at build time. */
  pack: PrismPackId;
  /** The mode when nothing (valid) is stored. Defaults to beam-dark — the standing site default. */
  defaultMode?: PrismMode;
  children: ReactNode;
}

export function PrismThemeModeProvider({
  pack,
  defaultMode = 'dark',
  children,
}: PrismThemeModeProviderProps): ReactNode {
  const [mode, setModeState] = useState<PrismMode>(defaultMode);

  // SSR renders the default; the boot script may have restored a stored mode
  // before paint — sync React onto it after mount (no visual impact: colors
  // come from the class, not from React).
  useEffect(() => {
    try {
      const stored = parsePrismThemeMode(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY));
      if (stored) setModeState(stored);
    } catch {
      // Blocked storage — keep the default.
    }
  }, []);

  const setMode = useCallback(
    (next: PrismMode) => {
      applyModeClass(pack, next);
      try {
        localStorage.setItem(PRISM_THEME_MODE_STORAGE_KEY, next);
      } catch {
        // Private mode / storage disabled — the session keeps the in-memory choice.
      }
      setModeState(next);
    },
    [pack],
  );

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo<PrismThemeModeValue>(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

  return (
    <PrismThemeModeContext.Provider value={value}>
      <PrismProvider prismTheme={getPrismTheme(pack, mode)}>{children}</PrismProvider>
    </PrismThemeModeContext.Provider>
  );
}

export function usePrismThemeMode(): PrismThemeModeValue {
  const value = useContext(PrismThemeModeContext);
  if (!value) throw new Error('usePrismThemeMode must be used inside <PrismThemeModeProvider>');
  return value;
}
