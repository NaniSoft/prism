import type { HTMLAttributes, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return <div {...props} className={cx('prism-card', className)} data-prism="card" />;
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div {...props} className={cx('prism-card__header', className)} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 2 | 3 | 4;
}

export function CardTitle({ className, level = 3, ...props }: CardTitleProps) {
  const titleProps = { ...props, className: cx('prism-card__title', className) };
  if (level === 2) return <h2 {...titleProps} />;
  if (level === 4) return <h4 {...titleProps} />;
  return <h3 {...titleProps} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx('prism-card__description', className)} />;
}

export function CardAction({ className, ...props }: DivProps) {
  return <div {...props} className={cx('prism-card__action', className)} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div {...props} className={cx('prism-card__content', className)} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div {...props} className={cx('prism-card__footer', className)} />;
}

export function CardText({ children }: { children: ReactNode }) {
  return <div className="prism-card__text">{children}</div>;
}
