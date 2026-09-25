'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';

import { cx, type PrismPartProps } from '../../internal/cx.js';

export interface TabsRootProps extends PrismPartProps {
  value?: string | number | null;
  defaultValue?: string | number | null;
  onValueChange?: (value: string | number | null) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function Tabs({ className, ...props }: TabsRootProps) {
  return <BaseTabs.Root {...(props as unknown as Record<string, never>)} className={cx('prism-tabs', className)} />;
}

export function TabsList({ className, ...props }: PrismPartProps) {
  return <BaseTabs.List {...(props as unknown as Record<string, never>)} className={cx('prism-tabs__list', className)} />;
}

export interface TabProps extends Omit<PrismPartProps, 'children'> {
  value: string | number;
  children: ReactNode;
}

export function Tab({ className, children, value, ...props }: TabProps) {
  return <BaseTabs.Tab value={value} {...(props as unknown as Record<string, never>)} className={cx('prism-tabs__tab', className)}>{children}</BaseTabs.Tab>;
}

export interface TabsPanelProps extends PrismPartProps {
  value: string | number;
}

export function TabsPanel({ className, value, ...props }: TabsPanelProps) {
  return <BaseTabs.Panel value={value} {...(props as unknown as Record<string, never>)} className={cx('prism-tabs__panel', className)} />;
}
