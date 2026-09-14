import type { ReactElement } from 'react';

/**
 * Bootstrap placeholder — prism-ui's real export surface (`PrismProvider`, antd
 * re-exports generated from upstream, the components → blocks → pages taxonomy) is
 * specified by the prism-ui conventions ADR on the Prism map
 * (`.scratch/prism/map.md`, ticket 10) and implemented against it.
 */
export function PrismPlaceholder({ label }: { label: string }): ReactElement {
  return <span data-prism-placeholder="">{label}</span>;
}
