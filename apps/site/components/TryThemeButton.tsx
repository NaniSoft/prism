'use client';

// The gallery's signature interaction: wearing a theme. One click applies the
// island's pack × mode to the whole shell through the same provider the header
// switcher uses — the pre-baked variable class makes the repaint flash-free.

import { Button } from '@nanisoft/prism-ui/components/button';

import { useThemeSelection } from '@/components/SiteThemeProvider';
import type { PrismThemeSelection } from '@/lib/theme';

export function TryThemeButton({ selection }: { selection: PrismThemeSelection }) {
  const { setSelection } = useThemeSelection();
  return (
    <Button size="small" onClick={() => setSelection(selection)}>
      Wear this theme
    </Button>
  );
}
