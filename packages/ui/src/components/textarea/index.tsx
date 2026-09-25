import type { TextareaHTMLAttributes } from 'react';

import { cx } from '../../internal/cx.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Textarea({ className, size = 'md', ...props }: TextareaProps) {
  return <textarea {...props} className={cx('prism-textarea', `prism-textarea--${size}`, className)} />;
}
