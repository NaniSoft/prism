'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { RadioGroup, RadioItem } from '@nanisoft/prism-ui/components/radio-group';

export type LandingCatalogLayer = 'components' | 'blocks' | 'pages';

export interface LandingCatalogItem {
  title: string;
  url: string;
  description?: string;
  layer: LandingCatalogLayer;
}

type WallPageId = 'dashboard' | 'settings' | 'docs';

interface WallPageDefinition {
  id: WallPageId;
  component: string;
  short: string;
  summary: string;
  source: string;
}

export interface ProductWindowWallProps {
  dashboard: ReactNode;
  settings: ReactNode;
  docs: ReactNode;
}

const WALL_PAGES: readonly WallPageDefinition[] = [
  { id: 'dashboard', component: 'DashboardPage', short: 'Dashboard', summary: 'Product overview', source: '/pages/dashboard-page' },
  { id: 'settings', component: 'SettingsPage', short: 'Settings', summary: 'Workspace controls', source: '/pages/settings-page' },
  { id: 'docs', component: 'DocsShell', short: 'Docs', summary: 'Knowledge surface', source: '/pages/docs-shell' },
] as const;

const LAYER_LABELS: Readonly<Record<LandingCatalogLayer, string>> = {
  components: 'Component',
  blocks: 'Block',
  pages: 'Page',
};

const SUGGESTED_SEARCHES = ['dialog', 'table', 'settings'] as const;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function WallSwitcher({ activePage, onPageChange }: { activePage: WallPageId; onPageChange: (page: WallPageId) => void }) {
  return (
    <RadioGroup
      value={activePage}
      onValueChange={(page) => onPageChange(page as WallPageId)}
      className="site-product-wall__switcher"
      aria-label="Choose the large product window"
    >
      {WALL_PAGES.map((page) => (
        <RadioItem
          key={page.id}
          value={page.id}
          label={(
            <>
              <span aria-hidden="true">{page.short}</span>
              <span className="prism-visually-hidden">{page.component}</span>
            </>
          )}
          description={page.summary}
          className={`site-product-wall__switch${activePage === page.id ? ' site-product-wall__switch--active' : ''}`}
        />
      ))}
    </RadioGroup>
  );
}

export function ProductWindowWall({ dashboard, settings, docs }: ProductWindowWallProps): ReactElement {
  const [activePage, setActivePage] = useState<WallPageId>('dashboard');
  const pageContent: Readonly<Record<WallPageId, ReactNode>> = { dashboard, settings, docs };
  const inactivePages = WALL_PAGES.filter((page) => page.id !== activePage);

  return (
    <section className="site-product-wall" aria-label="Live Prism page compositions">
      <div className="site-product-wall__controls">
        <div className="site-product-wall__control-copy">
          <span>Page</span>
          <small>Live package exports with synthetic application content.</small>
        </div>
        <WallSwitcher activePage={activePage} onPageChange={setActivePage} />
      </div>

      <div className="site-product-wall__grid">
        {WALL_PAGES.map((page) => {
          const isActive = page.id === activePage;
          const inactiveIndex = inactivePages.findIndex((entry) => entry.id === page.id);
          return (
            <article
              key={page.id}
              id={`wall-${page.id}`}
              className={`site-product-window${isActive ? ' site-product-window--active' : ' site-product-window--support'}`}
              data-active={isActive}
              data-inactive-index={isActive ? undefined : inactiveIndex}
              aria-label={`${page.component} composition`}
            >
              <header className="site-product-window__chrome">
                <div className="site-product-window__identity">
                  <PrismIcon name={isActive ? 'panel-left' : 'command'} size={14} />
                  <strong>{page.component}</strong>
                  <span>{page.summary}</span>
                </div>
                <Link href={page.source} className="site-product-window__source" aria-label={`Open ${page.component} source`}>
                  Source
                  <PrismIcon name="external-link" size={12} />
                </Link>
              </header>
              <div
                className="site-product-window__canvas"
                aria-hidden={isActive ? undefined : true}
                inert={isActive ? undefined : true}
              >
                {pageContent[page.id]}
              </div>
            </article>
          );
        })}
      </div>

      <p className="site-product-wall__status" role="status" aria-live="polite">
        {WALL_PAGES.find((page) => page.id === activePage)?.component} is the large window. Choose another page to move the emphasis.
      </p>
    </section>
  );
}

export function CatalogSearch({ catalog }: { catalog: readonly LandingCatalogItem[] }): ReactElement {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalize(query);
  const results = useMemo(
    () => {
      const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
      return catalog.filter((item) => {
        if (queryTerms.length === 0) return true;
        const searchable = normalize(`${item.title} ${item.description ?? ''} ${LAYER_LABELS[item.layer]}`);
        return queryTerms.every((term) => searchable.includes(term));
      });
    },
    [catalog, normalizedQuery],
  );

  return (
    <div className="site-catalog-search">
      <div className="site-catalog-search__form">
        <label className="site-catalog-search__label" htmlFor="prism-catalog-search">Search all {catalog.length} checked items</label>
        <Input
          id="prism-catalog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try dialog, table, settings, or a page name"
          startAdornment={<PrismIcon name="search" />}
          endAdornment={query ? (
            <button type="button" className="site-catalog-search__clear" onClick={() => setQuery('')} aria-label="Clear catalog search">
              <PrismIcon name="x" size={14} />
            </button>
          ) : undefined}
        />
        <div className="site-catalog-search__suggestions" aria-label="Suggested catalog searches">
          <span>Suggested</span>
          {SUGGESTED_SEARCHES.map((suggestion) => (
            <Button key={suggestion} type="button" variant="ghost" size="sm" onClick={() => setQuery(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      <div className="site-catalog-search__results" role="region" aria-label="Catalog search results">
        <div className="site-catalog-search__result-head" role="status" aria-live="polite" aria-atomic="true">
          <span>{results.length} of {catalog.length} items</span>
          <span>{normalizedQuery ? `Matching “${query.trim()}”` : 'Complete checked catalog'}</span>
        </div>
        {results.length > 0 ? (
          <ul className="site-catalog-search__list">
            {results.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="site-catalog-search__result">
                  <span className="site-catalog-search__result-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description ?? 'Prism-owned public catalog item.'}</small>
                  </span>
                  <span className="site-catalog-search__layer">{LAYER_LABELS[item.layer]}</span>
                  <PrismIcon name="arrow-right" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="site-catalog-search__empty">No checked item matches “{query.trim()}”. Try a shorter name or one of the suggested searches.</p>
        )}
      </div>
    </div>
  );
}
