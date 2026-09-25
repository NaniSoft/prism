'use client';

// One small context for the common chrome case: a fixed pack, a switchable
// light/beam-dark mode, and one persistent storage key.

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

function applyModeClass(pack: PrismPackId, mode: PrismMode): void {
  const element = document.documentElement;
  for (const className of Array.from(element.classList)) {
    if (className.startsWith('prism-')) element.classList.remove(className);
  }
  element.classList.add(prismCssVarKey(pack, mode));
}

export interface PrismThemeModeProviderProps {
  pack: PrismPackId;
  defaultMode?: PrismMode;
  children: ReactNode;
}

export function PrismThemeModeProvider({
  pack,
  defaultMode = 'dark',
  children,
}: PrismThemeModeProviderProps): ReactNode {
  const [mode, setModeState] = useState<PrismMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = parsePrismThemeMode(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY));
      if (stored) setModeState(stored);
    } catch {
      // Blocked storage: keep the server default.
    }
  }, []);

  const setMode = useCallback(
    (next: PrismMode) => {
      applyModeClass(pack, next);
      try {
        localStorage.setItem(PRISM_THEME_MODE_STORAGE_KEY, next);
      } catch {
        // Blocked storage: the in-memory selection still works.
      }
      setModeState(next);
    },
    [pack],
  );

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

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
