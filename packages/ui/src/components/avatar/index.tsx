'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';

import { cx, type PrismPartProps } from '../../internal/cx.js';

export interface AvatarProps extends PrismPartProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({ src, alt, name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <BaseAvatar.Root {...(props as unknown as Record<string, never>)} className={cx('prism-avatar', `prism-avatar--${size}`, className)}>
      {src ? <BaseAvatar.Image src={src} alt={alt} className="prism-avatar__image" /> : null}
      <BaseAvatar.Fallback className="prism-avatar__fallback" delay={src ? 120 : 0}>{initials(name)}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
