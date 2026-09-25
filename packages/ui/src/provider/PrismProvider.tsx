'use client';

// PrismProvider owns one serializable theme scope. It writes the resolved CSS
// custom properties, exposes the theme and a local portal container to client
// components, and keeps framework routing and browser storage out of the core.

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react';
import { getPrismTheme, type PrismTheme } from '@nanisoft/prism-tokens';

const PrismThemeContext = createContext<PrismTheme | undefined>(undefined);
const PrismPortalContainerContext = createContext<HTMLElement | null>(null);

export interface PrismProviderProps {
  /** Defaults to the blue pack in light mode. */
  prismTheme?: PrismTheme;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  dir?: 'ltr' | 'rtl';
  /** @internal Allows a pre-paint document scope to own the initial CSS variables. */
  deferInitialTheme?: boolean;
}

export function PrismProvider({
  children,
  prismTheme = getPrismTheme('blue', 'light'),
  className,
  style,
  dir,
  deferInitialTheme = false,
}: PrismProviderProps): ReactNode {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const variables = prismTheme.cssVariables as CSSProperties;
  const themeClass = deferInitialTheme ? '' : prismTheme.cssVarKey;
  const initialVariables = deferInitialTheme ? {} : variables;

  return (
    <PrismThemeContext.Provider value={prismTheme}>
      <PrismPortalContainerContext.Provider value={portalContainer}>
        <div
          ref={setPortalContainer}
          className={['prism-root', themeClass, className].filter(Boolean).join(' ')}
          style={{ ...initialVariables, ...style }}
          dir={dir}
          data-prism="provider"
          data-prism-theme={`${prismTheme.pack}-${prismTheme.mode}`}
        >
          {children}
        </div>
      </PrismPortalContainerContext.Provider>
    </PrismThemeContext.Provider>
  );
}

export function usePrismTheme(): PrismTheme {
  const theme = useContext(PrismThemeContext);
  if (!theme) throw new Error('usePrismTheme must be used inside <PrismProvider>');
  return theme;
}

/** Portal target that keeps overlays inside the nearest nested theme scope. */
export function usePrismPortalContainer(): HTMLElement | null {
  return useContext(PrismPortalContainerContext);
}

/** Stable empty object for memoization by component consumers. */
export const EMPTY_PRISM_THEME_OVERRIDES = Object.freeze({});
