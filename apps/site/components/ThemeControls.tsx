'use client';

import { useState, type ReactElement } from 'react';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button, type ButtonVariant } from '@nanisoft/prism-ui/components/button';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Progress } from '@nanisoft/prism-ui/components/progress';
import { Slider } from '@nanisoft/prism-ui/components/slider';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';

interface ThemeControlsProps { pack: PrismPackId; mode: PrismMode; }

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'destructive', 'link'];

export function ThemeControls({ pack, mode }: ThemeControlsProps): ReactElement {
  const [query, setQuery] = useState('');
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [live, setLive] = useState(mode === 'dark');
  const [progress, setProgress] = useState(64);
  const normalized = query.trim().toLowerCase();
  const matches = normalized ? variants.filter((state) => state.includes(normalized)) : [];

  return (
    <div className="site-themes__controls">
      <div className="site-themes__button-row" role="group" aria-label="Preview button variants">
        {variants.map((entry) => <Button key={entry} variant={entry} aria-pressed={variant === entry} onClick={() => setVariant(entry)}>{entry}</Button>)}
      </div>

      <label className="site-themes__field">
        <span>Search local states</span>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter variants…" startAdornment={<PrismIcon name="search" />} aria-label={`Filter the ${pack} ${mode} theme specimen`} />
      </label>

      <div className="site-themes__state-row">
        <div className="site-themes__state-controls">
          <Badge variant="success">success</Badge><Badge variant="warning">warning</Badge><Badge variant="destructive">error</Badge><Badge variant="info">info</Badge>
          <Switch label="Live state" checked={live} onCheckedChange={setLive} />
        </div>
        <div className="site-themes__meter">
          <Slider label="Progress" value={progress} onValueChange={setProgress} showValue />
          <Progress value={progress} label="Published surface" />
        </div>
      </div>

      <p className="site-themes__status" role="status" aria-label="Theme specimen status" aria-live="polite">
        {normalized ? (matches.length ? `Matches: ${matches.join(', ')}` : `No local state matches “${query.trim()}”`) : 'Local specimen'} · {variant} button · {live ? 'live' : 'resting'} · {progress}%
      </p>
    </div>
  );
}
