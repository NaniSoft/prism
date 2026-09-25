'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ReactNode } from 'react';

import { usePrismPortalContainer } from '../../provider/index.js';
import { cx, type PrismPartProps } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export type DrawerProps = PrismPartProps;
export type DrawerCloseProps = PrismPartProps & { children?: ReactNode };

export function Drawer(props: DrawerProps) {
  return <BaseDrawer.Root {...(props as unknown as Record<string, never>)} />;
}

export function DrawerTrigger({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__trigger', className)} />;
}

export function DrawerPortal({ className, ...props }: PrismPartProps) {
  const container = usePrismPortalContainer();
  return <BaseDrawer.Portal {...(props as unknown as Record<string, never>)} container={container} className={cx('prism-drawer__portal', className)} />;
}

export function DrawerBackdrop({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Backdrop {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__backdrop', className)} />;
}

export function DrawerViewport({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Viewport {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__viewport', className)} />;
}

export function DrawerPopup({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Popup {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__popup', className)} />;
}

export function DrawerContent({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Content {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__content', className)} />;
}

export function DrawerTitle({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Title {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__title', className)} />;
}

export function DrawerDescription({ className, ...props }: PrismPartProps) {
  return <BaseDrawer.Description {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__description', className)} />;
}

export function DrawerClose({ className, children, ...props }: DrawerCloseProps) {
  return (
    <BaseDrawer.Close {...(props as unknown as Record<string, never>)} className={cx('prism-drawer__close', className)}>
      {children ?? <PrismIcon name="x" size={18} />}
    </BaseDrawer.Close>
  );
}
