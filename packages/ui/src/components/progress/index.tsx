'use client';

import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ReactNode } from 'react';

import { cx, type PrismPartProps } from '../../internal/cx.js';

export interface ProgressProps extends Omit<PrismPartProps, 'children'> {
  label?: string;
  showValue?: boolean;
  value?: number | null;
  min?: number;
  max?: number;
}

export function Progress({ label, showValue = false, value = null, className, ...props }: ProgressProps) {
  return (
    <div className={cx('prism-progress-field', className)}>
      <BaseProgress.Root {...(props as unknown as Record<string, never>)} value={value} className="prism-progress" aria-label={label}>
        {label || showValue ? (
          <div className="prism-progress-field__header">
            {label ? <span>{label}</span> : <span />}
            {showValue ? <BaseProgress.Value className="prism-progress__value" /> : null}
          </div>
        ) : null}
        <BaseProgress.Track className="prism-progress__track">
          <BaseProgress.Indicator className="prism-progress__indicator" />
        </BaseProgress.Track>
      </BaseProgress.Root>
    </div>
  );
}

export type ProgressPartProps = { children?: ReactNode; className?: string };
