'use client';

// The gallery's signature interaction: wearing a theme. One click applies the
// island's pack × mode to the whole shell through the same provider the header
// switcher uses — the pre-baked variable class makes the repaint flash-free.

import { Button } from '@nanisoft/prism-ui/components/button';

import { useThemeSelection } from '@/components/SiteThemeProvider';
import { MODE_LABELS, PACK_LABELS, type PrismThemeSelection } from '@/lib/theme';

export function TryThemeButton({ selection }: { selection: PrismThemeSelection }) {
  const { selection: current, setSelection } = useThemeSelection();
  const isCurrent = current.pack === selection.pack && current.mode === selection.mode;
  const label = `${PACK_LABELS[selection.pack]} ${MODE_LABELS[selection.mode]}`;

  return (
    <Button
      size="sm"
      onClick={() => setSelection(selection)}
      disabled={isCurrent}
      aria-label={isCurrent ? `${label} theme is active` : `Wear ${label} theme`}
    >
      {isCurrent ? 'Wearing this theme' : 'Wear this theme'}
    </Button>
  );
}
