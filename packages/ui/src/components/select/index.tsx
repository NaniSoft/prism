'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import type { ReactNode } from 'react';

import { usePrismPortalContainer } from '../../provider/index.js';
import { cx, type PrismPartProps } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export interface SelectProps<Value> extends PrismPartProps {
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  items?: ReadonlyArray<{ value: Value; label: ReactNode }>;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode;
}

export function SelectRoot<Value>({ children, onValueChange, ...props }: SelectProps<Value>) {
  return (
    <BaseSelect.Root<Value>
      {...(props as unknown as Record<string, never>)}
      onValueChange={(value) => onValueChange?.(value as Value | null)}
    >
      {children}
    </BaseSelect.Root>
  );
}

export function SelectTrigger({ className, children, ...props }: PrismPartProps) {
  return (
    <BaseSelect.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-select__trigger', className)}>
      {children ?? <SelectValue />}
      <SelectIcon />
    </BaseSelect.Trigger>
  );
}

export function SelectValue({ className, ...props }: PrismPartProps) {
  return <BaseSelect.Value {...(props as unknown as Record<string, never>)} className={cx('prism-select__value', className)} />;
}

export function SelectIcon({ className }: { className?: string }) {
  return (
    <BaseSelect.Icon className={cx('prism-select__icon', className)}>
      <PrismIcon name="chevron-down" size={15} />
    </BaseSelect.Icon>
  );
}

export function SelectPortal({ className, ...props }: PrismPartProps) {
  const container = usePrismPortalContainer();
  return <BaseSelect.Portal {...(props as unknown as Record<string, never>)} container={container} className={cx('prism-select__portal', className)} />;
}

export function SelectPositioner({ className, ...props }: PrismPartProps) {
  return <BaseSelect.Positioner {...(props as unknown as Record<string, never>)} alignItemWithTrigger={false} sideOffset={4} className={cx('prism-select__positioner', className)} />;
}

export function SelectPopup({ className, ...props }: PrismPartProps) {
  return <BaseSelect.Popup {...(props as unknown as Record<string, never>)} className={cx('prism-select__popup', className)} />;
}

export function SelectList({ className, ...props }: PrismPartProps) {
  return <BaseSelect.List {...(props as unknown as Record<string, never>)} className={cx('prism-select__list', className)} />;
}

export interface SelectItemProps extends Omit<PrismPartProps, 'children'> {
  value: string | number;
  children: ReactNode;
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item {...(props as unknown as Record<string, never>)} className={cx('prism-select__item', className)}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="prism-select__item-indicator">
        <PrismIcon name="check" size={14} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export function SelectSeparator({ className, ...props }: PrismPartProps) {
  return <BaseSelect.Separator {...(props as unknown as Record<string, never>)} className={cx('prism-select__separator', className)} />;
}

export const Select = SelectRoot;
