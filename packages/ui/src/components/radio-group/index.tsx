'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { useId, type ReactNode } from 'react';

import { cx, type PrismControlProps, type PrismPartProps } from '../../internal/cx.js';

export type RadioGroupProps<Value = string> = PrismPartProps & {
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
};

export function RadioGroup<Value = string>({ className, ...props }: RadioGroupProps<Value>) {
  return <BaseRadioGroup<Value> {...(props as unknown as Record<string, never>)} className={cx('prism-radio-group', className)} />;
}

export interface RadioItemProps extends Omit<PrismControlProps<HTMLButtonElement>, 'children'> {
  value: string | number;
  label: ReactNode;
  description?: ReactNode;
}

export function RadioItem({ label, description, id, className, value, ...props }: RadioItemProps) {
  const generatedId = useId();
  const controlId = id ?? (typeof value === 'string' ? `prism-radio-${value}` : generatedId);
  return (
    <div className={cx('prism-radio', className)}>
      <Radio.Root value={value} {...(props as unknown as Record<string, never>)} id={controlId} className="prism-radio__control">
        <Radio.Indicator className="prism-radio__indicator" />
      </Radio.Root>
      <div className="prism-radio__copy">
        <label htmlFor={controlId} className="prism-radio__label">{label}</label>
        {description ? <div className="prism-radio__description">{description}</div> : null}
      </div>
    </div>
  );
}
