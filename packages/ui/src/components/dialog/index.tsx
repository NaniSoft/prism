'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';

import { usePrismPortalContainer } from '../../provider/index.js';
import { cx, type PrismPartProps } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export type DialogProps = PrismPartProps;
export type DialogCloseProps = PrismPartProps & { children?: ReactNode };

export function Dialog(props: DialogProps) {
  return <BaseDialog.Root {...(props as unknown as Record<string, never>)} />;
}

export function DialogTrigger({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__trigger', className)} />;
}

export function DialogPortal({ className, ...props }: PrismPartProps) {
  const container = usePrismPortalContainer();
  return <BaseDialog.Portal {...(props as unknown as Record<string, never>)} container={container} className={cx('prism-dialog__portal', className)} />;
}

export function DialogBackdrop({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Backdrop {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__backdrop', className)} />;
}

export function DialogViewport({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Viewport {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__viewport', className)} />;
}

export function DialogPopup({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Popup {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__popup', className)} />;
}

export function DialogTitle({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Title {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__title', className)} />;
}

export function DialogDescription({ className, ...props }: PrismPartProps) {
  return <BaseDialog.Description {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__description', className)} />;
}

export function DialogClose({ className, children, ...props }: DialogCloseProps) {
  return (
    <BaseDialog.Close {...(props as unknown as Record<string, never>)} className={cx('prism-dialog__close', className)}>
      {children ?? <PrismIcon name="x" size={16} />}
      {children ? <span className="prism-visually-hidden">Close</span> : null}
    </BaseDialog.Close>
  );
}
