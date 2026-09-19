'use client';

// Shell-level theme state (ticket 12 §2): one pack × mode selection for the
// whole site, defaulting to beam-dark blue. The bootstrap script in layout.tsx
// has already applied the right class before first paint — this provider only
// syncs React onto it and drives the switcher, swapping both the class and the
// PrismProvider theme when the choice changes (ticket 02's class-swap recipe).

import { useCallback, createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PrismProvider } from '@nanisoft/prism-ui/provider';
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

/** Apply a selection to the document: swap the pre-baked variable class, persist, re-render. */
export function applyThemeClass(selection: PrismThemeSelection): void {
  const el = document.documentElement;
  for (const className of Array.from(el.classList)) {
    if (className.startsWith('prism-')) el.classList.remove(className);
  }
  el.classList.add(themeClass(selection.pack, selection.mode));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId(selection.pack, selection.mode));
  } catch {
    // Private mode / storage disabled — the session keeps the in-memory choice.
  }
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<PrismThemeSelection>({ pack: DEFAULT_PACK, mode: DEFAULT_MODE });

  // SSR renders the default; the bootstrap script may have restored a stored
  // theme before paint — sync React onto it after mount (no visual impact:
  // colors come from the class, not from React).
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return;
    }
    const parsed = parseThemeId(stored);
    if (parsed) setSelectionState(parsed);
  }, []);

  const setSelection = useCallback((next: PrismThemeSelection) => {
    applyThemeClass(next);
    setSelectionState(next);
  }, []);

  return (
    <ThemeStateContext.Provider value={{ selection, setSelection }}>
      <PrismProvider prismTheme={getPrismTheme(selection.pack, selection.mode)}>{children}</PrismProvider>
    </ThemeStateContext.Provider>
  );
}

export function useThemeSelection(): ThemeState {
  const state = useContext(ThemeStateContext);
  if (!state) throw new Error('useThemeSelection must be used inside <SiteThemeProvider>');
  return state;
}

export type { PrismMode, PrismPackId };
