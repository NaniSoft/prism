'use client';

import { Field as BaseField } from '@base-ui/react/field';

import { cx, type PrismPartProps } from '../../internal/cx.js';

export interface FieldProps extends PrismPartProps {
  match?: (value: string) => boolean;
}

export interface FieldPartProps extends PrismPartProps {
  match?: string;
}

export function Field({ className, ...props }: FieldProps) {
  return <BaseField.Root {...(props as unknown as Record<string, never>)} className={cx('prism-field', className)} data-prism="field" />;
}

export function FieldLabel({ className, ...props }: FieldPartProps) {
  return <BaseField.Label {...(props as unknown as Record<string, never>)} className={cx('prism-field__label', className)} />;
}

export function FieldDescription({ className, ...props }: FieldPartProps) {
  return <BaseField.Description {...(props as unknown as Record<string, never>)} className={cx('prism-field__description', className)} />;
}

export function FieldError({ className, ...props }: FieldPartProps) {
  return <BaseField.Error {...(props as unknown as Record<string, never>)} className={cx('prism-field__error', className)} />;
}

export function FieldControl({ className, ...props }: FieldPartProps) {
  return <BaseField.Control {...(props as unknown as Record<string, never>)} className={cx('prism-field__control', className)} />;
}
