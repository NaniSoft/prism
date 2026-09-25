import { createElement, type HTMLAttributes } from 'react';

import { cx } from '../../internal/cx.js';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: 'body' | 'secondary' | 'tertiary' | 'mono' | 'label';
}

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <span {...props} className={cx('prism-text', `prism-text--${variant}`, className)} />;
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'md' | 'lg';
}

export function Heading({ level = 2, size = 'md', className, ...props }: HeadingProps) {
  return createElement(`h${level}`, { ...props, className: cx('prism-heading', `prism-heading--${size}`, className) });
}

export interface DisplayTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  width?: 'normal' | 'refracted';
}

export function DisplayTitle({ level = 1, width = 'refracted', className, ...props }: DisplayTitleProps) {
  return createElement(`h${level}`, {
    ...props,
    className: cx('prism-display', width === 'refracted' && 'prism-display--refracted', className),
  });
}
