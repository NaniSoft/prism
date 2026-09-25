import type { ReactNode } from 'react';

import { Badge } from '../../components/badge/index.js';
import { Card } from '../../components/card/index.js';
import { Text } from '../../components/typography/index.js';
import { cx } from '../../internal/cx.js';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  detail?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, trend = 'neutral', detail, footer, className }: StatCardProps) {
  return (
    <Card className={cx('prism-stat-card', className)}>
      <div className="prism-stat-card__header">
        <Text variant="tertiary">{label}</Text>
        {change ? <Badge variant={trend === 'down' ? 'destructive' : trend === 'up' ? 'success' : 'neutral'}>{change}</Badge> : null}
      </div>
      <div className="prism-stat-card__value">{value}</div>
      {detail ? <Text variant="secondary" className="prism-stat-card__detail">{detail}</Text> : null}
      {footer ? <div className="prism-stat-card__footer">{footer}</div> : null}
    </Card>
  );
}
