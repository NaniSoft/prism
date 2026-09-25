'use client';

import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ReactNode } from 'react';

import { cx, type PrismPartProps } from '../../internal/cx.js';

export interface SliderRootProps extends PrismPartProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
}

export function SliderRoot({ className, ...props }: SliderRootProps) {
  return <BaseSlider.Root<number> {...(props as unknown as Record<string, never>)} className={cx('prism-slider', className)} />;
}

export function SliderControl({ className, ...props }: PrismPartProps) {
  return <BaseSlider.Control {...(props as unknown as Record<string, never>)} className={cx('prism-slider__control', className)} />;
}

export function SliderTrack({ className, ...props }: PrismPartProps) {
  return <BaseSlider.Track {...(props as unknown as Record<string, never>)} className={cx('prism-slider__track', className)} />;
}

export function SliderIndicator({ className, ...props }: PrismPartProps) {
  return <BaseSlider.Indicator {...(props as unknown as Record<string, never>)} className={cx('prism-slider__indicator', className)} />;
}

export function SliderThumb({ className, ...props }: PrismPartProps) {
  return <BaseSlider.Thumb {...(props as unknown as Record<string, never>)} className={cx('prism-slider__thumb', className)} />;
}

export function SliderValue({ className, ...props }: PrismPartProps) {
  return <BaseSlider.Value {...(props as unknown as Record<string, never>)} className={cx('prism-slider__value', className)} />;
}

export interface SliderProps extends Omit<SliderRootProps, 'children'> {
  label?: ReactNode;
  showValue?: boolean;
}

export function Slider({ label, showValue = false, min = 0, max = 100, value, defaultValue, className, ...props }: SliderProps) {
  return (
    <div className={cx('prism-slider-field', className)}>
      <SliderRoot {...props} value={value} defaultValue={defaultValue} min={min} max={max}>
        {label || showValue ? (
          <div className="prism-slider-field__header">
            {label ? <span className="prism-slider-field__label">{label}</span> : <span />}
            {showValue ? <SliderValue /> : null}
          </div>
        ) : null}
        <SliderControl>
          <SliderTrack><SliderIndicator /></SliderTrack>
          <SliderThumb aria-label={typeof label === 'string' ? label : 'Value'} />
        </SliderControl>
      </SliderRoot>
    </div>
  );
}
