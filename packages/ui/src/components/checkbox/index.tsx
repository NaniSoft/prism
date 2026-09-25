'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, type ReactNode } from 'react';

import { cx, type PrismControlProps } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export function CheckboxRoot({ className, ...props }: PrismControlProps<HTMLButtonElement>) {
  return (
    <BaseCheckbox.Root {...(props as unknown as Record<string, never>)} className={cx('prism-checkbox', className)}>
      <BaseCheckbox.Indicator className="prism-checkbox__indicator">
        <PrismIcon name="check" size={13} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

export interface CheckboxProps extends Omit<PrismControlProps<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
}

export function Checkbox({ label, description, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? (typeof props.name === 'string' ? `prism-checkbox-${props.name}` : generatedId);
  return (
    <div className="prism-checkbox-field">
      <CheckboxRoot {...props} id={controlId} aria-describedby={description && controlId ? `${controlId}-description` : undefined} />
      <div className="prism-checkbox-field__copy">
        <label className="prism-checkbox-field__label" htmlFor={controlId}>{label}</label>
        {description ? <div id={controlId ? `${controlId}-description` : undefined} className="prism-checkbox-field__description">{description}</div> : null}
      </div>
    </div>
  );
}
