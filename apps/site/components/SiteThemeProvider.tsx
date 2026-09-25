'use client';

import Link from 'next/link';
import { useCallback, createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { PrismLinkContextProvider, PrismProvider } from '@nanisoft/prism-ui/provider';
import { getPrismTheme, type PrismMode, type PrismPackId } from '@nanisoft/prism-tokens';

import {
  DEFAULT_MODE,
  DEFAULT_PACK,
  THEME_STORAGE_KEY,
  parseThemeId,
  themeClass,
  themeId,
  type PrismThemeSelection,
} from '@/lib/theme';

interface ThemeState {
  selection: PrismThemeSelection;
  setSelection: (next: PrismThemeSelection) => void;
}

const ThemeStateContext = createContext<ThemeState | undefined>(undefined);
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function applyThemeClass(selection: PrismThemeSelection): void {
  const element = document.documentElement;
  for (const className of Array.from(element.classList)) {
    if (className.startsWith('prism-')) element.classList.remove(className);
  }
  element.classList.add(themeClass(selection.pack, selection.mode));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId(selection.pack, selection.mode));
  } catch {
    // The session keeps its in-memory choice when storage is unavailable.
  }
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<PrismThemeSelection>({ pack: DEFAULT_PACK, mode: DEFAULT_MODE });
  const [themeReady, setThemeReady] = useState(false);

  // The document class is set before paint; mirror that stored choice into the
  // provider before the first client paint as well, so nested variables cannot
  // briefly render the default scope over a restored theme.
  useIsomorphicLayoutEffect(() => {
    try {
      const parsed = parseThemeId(localStorage.getItem(THEME_STORAGE_KEY));
      if (parsed) {
        applyThemeClass(parsed);
        setSelectionState(parsed);
      }
    } catch {
      // The blocking script already selected the available theme.
    } finally {
      setThemeReady(true);
    }
  }, []);

  const setSelection = useCallback((next: PrismThemeSelection) => {
    applyThemeClass(next);
    setSelectionState(next);
  }, []);

  return (
    <ThemeStateContext.Provider value={{ selection, setSelection }}>
      <PrismLinkContextProvider link={Link}>
        <PrismProvider prismTheme={getPrismTheme(selection.pack, selection.mode)} deferInitialTheme={!themeReady}>
          {children}
        </PrismProvider>
      </PrismLinkContextProvider>
    </ThemeStateContext.Provider>
  );
}

export function useThemeSelection(): ThemeState {
  const state = useContext(ThemeStateContext);
  if (!state) throw new Error('useThemeSelection must be used inside <SiteThemeProvider>');
  return state;
}

export type { PrismMode, PrismPackId };
