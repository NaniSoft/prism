'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactElement } from 'react';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Progress } from '@nanisoft/prism-ui/components/progress';
import { Slider } from '@nanisoft/prism-ui/components/slider';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Table, type TableColumn } from '@nanisoft/prism-ui/components/table';

import type { CatalogItem } from '@/lib/section-catalog';

interface LandingSpecimenProps {
  catalog: readonly CatalogItem[];
}

type SpecimenRow = { id: string; layer: string; role: string };

const COLUMNS: TableColumn<SpecimenRow>[] = [
  { key: 'layer', header: 'Layer' },
  { key: 'role', header: 'What it owns' },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function LandingSpecimen({ catalog }: LandingSpecimenProps): ReactElement {
  const [query, setQuery] = useState('');
  const [live, setLive] = useState(true);
  const [coverage, setCoverage] = useState(72);

  const results = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized) return [];
    return catalog
      .filter((item) => normalize(`${item.title} ${item.description ?? ''}`).includes(normalized))
      .slice(0, 6);
  }, [catalog, query]);

  const rows: SpecimenRow[] = [
    { id: '1', layer: 'Components', role: 'Accessible behavior + Prism recipes' },
    { id: '2', layer: 'Blocks', role: 'Repeated product patterns' },
    { id: '3', layer: 'Pages', role: 'Complete structural compositions' },
  ];

  return (
    <div className="site-landing__plate">
      <div className="site-landing__plate-section">
        <div className="site-landing__specimen-actions">
          <Button variant="primary" href="/docs/quickstart">Install Prism</Button>
          <Button href="/components">Browse components</Button>
          <Button variant="ghost" href="/docs/quickstart#for-agents">For agents</Button>
        </div>
      </div>

      <div className="site-landing__plate-section">
        <label className="site-landing__search-label" htmlFor="prism-catalog-search">Search the owned catalog</label>
        <Input
          id="prism-catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “dialog”, “table”, or “settings”…"
          startAdornment={<PrismIcon name="search" />}
          endAdornment={query ? <button type="button" className="site-landing__search-clear" onClick={() => setQuery('')} aria-label="Clear catalog search"><PrismIcon name="x" size={14} /></button> : undefined}
        />
        {query.trim() ? (
          <div className="site-landing__search-results" role="region" aria-label="Catalog search results" aria-live="polite">
            {results.length > 0 ? results.map((item) => (
              <Link key={item.url} href={item.url} className="site-landing__search-result">
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
                <PrismIcon name="arrow-right" size={14} />
              </Link>
            )) : <div className="site-landing__search-empty">No item matches “{query.trim()}”. Try a shorter name.</div>}
          </div>
        ) : null}
      </div>

      <div className="site-landing__plate-section site-landing__live-controls">
        <Switch label="Live behavior" checked={live} onCheckedChange={setLive} />
        <div className="site-landing__specimen-slider">
          <Slider label="Catalog coverage" value={coverage} onValueChange={setCoverage} showValue />
          <Progress value={coverage} label="Published surface" showValue />
        </div>
      </div>

      <div className="site-landing__plate-section">
        <div className="site-landing__specimen-tags"><Badge variant="success">owned</Badge><Badge>{catalog.length} documented items</Badge><Badge variant="info">Base UI internal</Badge></div>
        <Table data={rows} columns={COLUMNS} getRowKey={(row) => row.id} />
      </div>

      <p className="site-specimen-note" role="status">
        {live ? 'Live' : 'Resting'} specimen · {results.length} search {results.length === 1 ? 'result' : 'results'} · {coverage}% coverage. Every control is the shipped package.
      </p>
    </div>
  );
}
