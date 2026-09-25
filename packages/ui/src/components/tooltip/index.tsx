'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactNode } from 'react';

import { usePrismPortalContainer } from '../../provider/index.js';
import { cx, type PrismPartProps } from '../../internal/cx.js';

export type TooltipProps = PrismPartProps & {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delay?: number;
};

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider>{children}</BaseTooltip.Provider>;
}

export function Tooltip({ children, ...props }: TooltipProps) {
  return (
    <TooltipProvider>
      <BaseTooltip.Root {...(props as unknown as Record<string, never>)}>{children}</BaseTooltip.Root>
    </TooltipProvider>
  );
}

export function TooltipTrigger({ className, ...props }: PrismPartProps) {
  return <BaseTooltip.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-tooltip__trigger', className)} />;
}

export function TooltipPortal({ className, ...props }: PrismPartProps) {
  const container = usePrismPortalContainer();
  return <BaseTooltip.Portal {...(props as unknown as Record<string, never>)} container={container} className={cx('prism-tooltip__portal', className)} />;
}

export function TooltipPositioner({ className, ...props }: PrismPartProps) {
  return <BaseTooltip.Positioner {...(props as unknown as Record<string, never>)} sideOffset={6} className={cx('prism-tooltip__positioner', className)} />;
}

export function TooltipPopup({ className, ...props }: PrismPartProps) {
  return <BaseTooltip.Popup {...(props as unknown as Record<string, never>)} className={cx('prism-tooltip__popup', className)} />;
}
