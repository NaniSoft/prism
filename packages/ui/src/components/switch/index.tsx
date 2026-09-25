'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useId, type ReactNode } from 'react';

import { cx, type PrismControlProps } from '../../internal/cx.js';

export function SwitchRoot({ className, ...props }: PrismControlProps<HTMLButtonElement>) {
  return (
    <BaseSwitch.Root {...(props as unknown as Record<string, never>)} className={cx('prism-switch', className)}>
      <BaseSwitch.Thumb className="prism-switch__thumb" />
    </BaseSwitch.Root>
  );
}

export interface SwitchProps extends Omit<PrismControlProps<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
}

export function Switch({ label, description, id, className, ...props }: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? (typeof props.name === 'string' ? `prism-switch-${props.name}` : generatedId);
  return (
    <div className={cx('prism-switch-field', className)}>
      <SwitchRoot {...props} id={controlId} />
      <div className="prism-switch-field__copy">
        <label htmlFor={controlId} className="prism-switch-field__label">{label}</label>
        {description ? <div className="prism-switch-field__description">{description}</div> : null}
      </div>
    </div>
  );
}
