import type { ReactNode, SVGProps } from 'react';

import { cx } from '../../internal/cx.js';

export type PrismIconName =
  | 'alert-triangle'
  | 'arrow-right'
  | 'check'
  | 'chevron-down'
  | 'circle-alert'
  | 'circle-check'
  | 'command'
  | 'copy'
  | 'external-link'
  | 'info'
  | 'menu'
  | 'moon'
  | 'more-horizontal'
  | 'panel-left'
  | 'search'
  | 'sun'
  | 'x';

const paths: Record<PrismIconName, ReactNode> = {
  'alert-triangle': <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  'arrow-right': <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  'chevron-down': <path d="m6 9 6 6 6-6"/>,
  'circle-alert': <><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></>,
  'circle-check': <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/></>,
  command: <><path d="M18 9a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3Z"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  'external-link': <><path d="M15 4h5v5"/><path d="m10 14 10-10"/><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>,
  'more-horizontal': <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>,
  'panel-left': <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.42 1.42"/><path d="m17.65 17.65 1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.42-1.42"/><path d="m17.65 6.35 1.42-1.42"/></>,
  x: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
};

export interface PrismIconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {
  name: PrismIconName;
  size?: number;
  title?: string;
}

export function PrismIcon({ name, size = 16, title, className, ...props }: PrismIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('prism-icon', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
