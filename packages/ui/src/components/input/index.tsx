'use client';

import { Input as BaseInput } from '@base-ui/react/input';
import type { ReactNode } from 'react';

import { cx, type PrismInputProps } from '../../internal/cx.js';

export interface InputProps extends PrismInputProps {
  size?: 'sm' | 'md' | 'lg';
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export function Input({ className, size = 'md', startAdornment, endAdornment, ...props }: InputProps) {
  const input = <BaseInput {...(props as unknown as Record<string, never>)} className={cx('prism-input', `prism-input--${size}`, className)} />;
  if (!startAdornment && !endAdornment) return input;
  return (
    <span className={cx('prism-input-group', `prism-input-group--${size}`)}>
      {startAdornment ? <span className="prism-input-group__adornment">{startAdornment}</span> : null}
      {input}
      {endAdornment ? <span className="prism-input-group__adornment prism-input-group__adornment--end">{endAdornment}</span> : null}
    </span>
  );
}
