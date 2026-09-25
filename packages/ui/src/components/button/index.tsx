'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import type { ReactNode } from 'react';

import { usePrismLink } from '../../provider/index.js';
import { cx, type PrismButtonProps } from '../../internal/cx.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends PrismButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  href,
  loading = false,
  iconStart,
  iconEnd,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const Link = usePrismLink();
  const classes = cx('prism-button', `prism-button--${variant}`, `prism-button--${size}`, loading && 'prism-button--loading', className);
  const content = (
    <>
      {loading ? <span className="prism-button__spinner" aria-hidden /> : iconStart ? <span className="prism-button__icon">{iconStart}</span> : null}
      {children != null ? <span className="prism-button__label">{children}</span> : null}
      {iconEnd ? <span className="prism-button__icon">{iconEnd}</span> : null}
    </>
  );

  return (
    <BaseButton
      {...(props as unknown as Record<string, never>)}
      className={classes}
      nativeButton={!href}
      role={href ? 'link' : undefined}
      render={href ? <Link href={href} /> : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {content}
    </BaseButton>
  );
}
