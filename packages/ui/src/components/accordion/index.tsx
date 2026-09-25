'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ReactNode } from 'react';

import { cx, type PrismPartProps } from '../../internal/cx.js';
import { PrismIcon } from '../icon/index.js';

export type AccordionPartProps = PrismPartProps;

export function Accordion({ className, ...props }: AccordionPartProps) {
  return <BaseAccordion.Root {...(props as unknown as Record<string, never>)} className={cx('prism-accordion', className)} />;
}

export function AccordionItem({ className, ...props }: AccordionPartProps) {
  return <BaseAccordion.Item {...(props as unknown as Record<string, never>)} className={cx('prism-accordion__item', className)} />;
}

export function AccordionTrigger({ className, children, ...props }: AccordionPartProps & { children?: ReactNode }) {
  return (
    <BaseAccordion.Trigger {...(props as unknown as Record<string, never>)} className={cx('prism-accordion__trigger', className)}>
      <span>{children}</span>
      <PrismIcon name="chevron-down" className="prism-accordion__chevron" />
    </BaseAccordion.Trigger>
  );
}

export function AccordionHeader({ className, ...props }: AccordionPartProps) {
  return <BaseAccordion.Header {...(props as unknown as Record<string, never>)} className={cx('prism-accordion__header', className)} />;
}

export function AccordionPanel({ className, ...props }: AccordionPartProps) {
  return <BaseAccordion.Panel {...(props as unknown as Record<string, never>)} className={cx('prism-accordion__panel', className)} />;
}
