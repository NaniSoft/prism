'use client';

// PrismProvider (ADR-0003): a transparent wrapper over antd's ConfigProvider.
// Owns the default theme (blue pack, light mode), the consumer-last theme
// merge, and antd's App mount. It owns nothing else — locale and direction are
// forwarded, SSR extraction and <html> class management are app-level.
//
// 'use client': a server component may render this provider directly (e.g. the
// site's DocsDaylight). Without the directive the provider lands in the server
// graph and the merged theme's algorithm function serializes to undefined
// across the RSC boundary — silent light-token derivation. `prismTheme` is
// plain frozen data (prism-tokens carries no functions), so the props
// serialize and the algorithm attach happens client-side.

import { App, ConfigProvider, type ConfigProviderProps } from 'antd';
import type { ReactNode } from 'react';
import { getPrismTheme, type PrismTheme } from '@nanisoft/prism-tokens';

import { mergePrismTheme } from './mergePrismTheme.js';

export interface PrismProviderProps extends ConfigProviderProps {
  /** Pack × mode selection. Defaults to the blue pack in light mode (ADR-0003). No pack/mode sugar props. */
  prismTheme?: PrismTheme;
}

export function PrismProvider({ children, theme, prismTheme, ...props }: PrismProviderProps): ReactNode {
  const merged = mergePrismTheme(prismTheme ?? getPrismTheme('blue', 'light'), theme);

  return (
    <ConfigProvider {...props} theme={merged}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
