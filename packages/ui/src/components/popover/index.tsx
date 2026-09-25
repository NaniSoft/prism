'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { usePrismPortalContainer } from '../../provider/index.js';
import { cx, type PrismPartProps } from '../../internal/cx.js';

export type PopoverProps = PrismPartProps;

export function Popover(props: PopoverProps) {
  return <BasePopover.Root {...(props as unknown as Record<string, never>)} />;
}

export function PopoverTrigger({ className, ...props }: PrismPartProps) {
  return <BasePopover.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-popover__trigger', className)} />;
}

export function PopoverPortal({ className, ...props }: PrismPartProps) {
  const container = usePrismPortalContainer();
  return <BasePopover.Portal {...(props as unknown as Record<string, never>)} container={container} className={cx('prism-popover__portal', className)} />;
}

export function PopoverPositioner({ className, ...props }: PrismPartProps) {
  return <BasePopover.Positioner {...(props as unknown as Record<string, never>)} sideOffset={6} className={cx('prism-popover__positioner', className)} />;
}

export function PopoverPopup({ className, ...props }: PrismPartProps) {
  return <BasePopover.Popup {...(props as unknown as Record<string, never>)} className={cx('prism-popover__popup', className)} />;
}

export function PopoverTitle({ className, ...props }: PrismPartProps) {
  return <BasePopover.Title {...(props as unknown as Record<string, never>)} className={cx('prism-popover__title', className)} />;
}

export function PopoverDescription({ className, ...props }: PrismPartProps) {
  return <BasePopover.Description {...(props as unknown as Record<string, never>)} className={cx('prism-popover__description', className)} />;
}

export function PopoverClose({ className, ...props }: PrismPartProps) {
  return <BasePopover.Close {...(props as unknown as Record<string, never>)} className={cx('prism-popover__close', className)} />;
}
