import Link from 'next/link';
import type { ReactElement } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Table, type TableColumn } from '@nanisoft/prism-ui/components/table';
import { DisplayTitle } from '@nanisoft/prism-ui/components/typography';
import type { ApplicationNavGroup } from '@nanisoft/prism-ui/blocks/application-shell';
import type { SettingsSection } from '@nanisoft/prism-ui/blocks/settings-panel';
import { DashboardPage } from '@nanisoft/prism-ui/pages/dashboard-page';
import { DocsShell, type DocsNavEntry } from '@nanisoft/prism-ui/pages/docs-shell';
import { SettingsPage } from '@nanisoft/prism-ui/pages/settings-page';
import { prismBrandPacks } from '@nanisoft/prism-tokens';

import { CatalogSearch, ProductWindowWall } from '@/components/LandingSpecimen';
import { catalogGroups, type CatalogItem } from '@/lib/section-catalog';
import { PACKS, PACK_LABELS } from '@/lib/theme';

const APP_NAV: readonly ApplicationNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/pages/dashboard-page', icon: <PrismIcon name="command" size={14} /> },
      { label: 'Catalog', href: '/components', icon: <PrismIcon name="panel-left" size={14} /> },
      { label: 'Settings', href: '/pages/settings-page', icon: <PrismIcon name="info" size={14} /> },
      { label: 'Documentation', href: '/pages/docs-shell', icon: <PrismIcon name="external-link" size={14} /> },
    ],
  },
];

const WORKSTREAMS = [
  { id: 'components', workstream: 'Component demos', owner: 'Interface', state: 'Ready for review' },
  { id: 'agent-corpus', workstream: 'Agent corpus', owner: 'Developer tools', state: 'Ready for review' },
  { id: 'themes', workstream: 'Theme matrix', owner: 'Brand systems', state: 'Ready for review' },
] as const;

type WorkstreamRow = (typeof WORKSTREAMS)[number];
const WORKSTREAM_COLUMNS: readonly TableColumn<WorkstreamRow>[] = [
  { key: 'workstream', header: 'Workstream' },
  { key: 'owner', header: 'Owner' },
  { key: 'state', header: 'Status' },
];

const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Synthetic settings for this landing demonstration.',
    content: (
      <div className="site-wall-demo__settings-fields">
        <Field>
          <FieldLabel>Workspace name</FieldLabel>
          <Input name="workspace-name" defaultValue="Northstar demo" />
          <FieldDescription>Application-owned content passed into the shipped page.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Support note</FieldLabel>
          <Input name="support-note" defaultValue="Synthetic preview" />
        </Field>
      </div>
    ),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Illustrative preference controls, not account data.',
    content: (
      <div className="site-wall-demo__settings-fields">
        <Switch label="Catalog change notices" description="Synthetic preference shown inside SettingsPage." defaultChecked />
        <Switch label="Weekly digest" description="A second illustrative setting." />
      </div>
    ),
  },
  {
    id: 'access',
    title: 'Access',
    description: 'A truthful page structure with sample access copy.',
    content: (
      <div className="site-wall-demo__settings-fields">
        <Field>
          <FieldLabel>Team URL</FieldLabel>
          <Input name="team-url" defaultValue="https://example.test/nanisoft" />
          <FieldDescription>The reserved .test domain makes the demonstration link synthetic.</FieldDescription>
        </Field>
      </div>
    ),
  },
];

const DOCS_NAV: DocsNavEntry[] = [
  {
    id: 'preview',
    title: 'This preview',
    url: '',
    children: [
      { id: 'install', title: 'Install', url: '#install' },
      { id: 'compose', title: 'Compose', url: '#compose' },
      { id: 'source', title: 'Source of truth', url: '#source' },
    ],
  },
];

const DOCS_TOC: DocsNavEntry[] = [
  { id: 'install', title: 'Install', url: '#install' },
  { id: 'compose', title: 'Compose', url: '#compose' },
  { id: 'source', title: 'Source of truth', url: '#source' },
];

function SyntheticActivity(): ReactElement {
  return (
    <div className="site-wall-demo__activity">
      <p><strong>Catalog checked</strong><span>All public exports remain grouped components → blocks → pages.</span></p>
      <p><strong>Theme pass</strong><span>Five brand packs and two modes share one token vocabulary.</span></p>
      <p className="site-wall-demo__activity-note">Synthetic activity feed for this preview.</p>
    </div>
  );
}

function DashboardDemo(): ReactElement {
  return (
    <DashboardPage
      title="Catalog operations"
      description="Synthetic workspace data showing a complete NaniSoft product page."
      nav={APP_NAV}
      activeUrl="/pages/dashboard-page"
      landmark="region"
      metrics={[]}
      activityTitle="Recent activity"
      headerActions={<Button href="#release-queue" variant="primary" size="sm">Open release queue</Button>}
      activity={<SyntheticActivity />}
    >
      <Table
        data={WORKSTREAMS}
        columns={WORKSTREAM_COLUMNS}
        getRowKey={(row) => row.id}
        caption="Synthetic project data for the landing demonstration."
      />
    </DashboardPage>
  );
}

function SettingsDemo(): ReactElement {
  return (
    <SettingsPage
      title="Workspace settings"
      description="Synthetic application-owned settings inside the shipped SettingsPage."
      nav={APP_NAV}
      activeUrl="/pages/settings-page"
      landmark="region"
      sections={SETTINGS_SECTIONS}
      initialSectionId="workspace"
    />
  );
}

function DocsDemo(): ReactElement {
  return (
    <DocsShell
      title="Build from owned source"
      description="A synthetic documentation excerpt rendered by the shipped DocsShell."
      nav={DOCS_NAV}
      toc={DOCS_TOC}
      neighbours={{
        previous: { title: 'DashboardPage', url: '/pages/dashboard-page' },
        next: { title: 'SettingsPage', url: '/pages/settings-page' },
      }}
      header={(
        <div className="site-wall-demo__docs-header">
          <span><PrismIcon name="command" size={14} />NaniSoft developer docs</span>
          <span>Synthetic excerpt</span>
        </div>
      )}
    >
      <div className="site-wall-demo__docs-prose">
        <h2 id="install">Install Prism</h2>
        <p>Add the one public package beside React. The application keeps its own data and routes.</p>
        <pre><code>npm install @nanisoft/prism-ui</code></pre>
        <h2 id="compose">Compose the smallest layer</h2>
        <p>Use a component for one responsibility, a block for repeated product structure, and a page when the whole composition owns the job.</p>
        <h2 id="source">Read the same source agents use</h2>
        <p>The rendered docs, generated corpus, and read-only MCP project this checked catalog rather than a second hand-maintained list.</p>
      </div>
    </DocsShell>
  );
}

function SpectrumBand(): ReactElement {
  return (
    <section className="site-landing__spectrum" aria-labelledby="spectrum-title">
      <div className="site-landing__spectrum-head">
        <h2 id="spectrum-title">Five packs. Two modes. One grammar.</h2>
        <p>Pastel atmosphere changes the ground and hairlines; readable ink keeps interaction and meaning stable. The header trigger changes every pack and mode expression together.</p>
      </div>
      <div className="site-landing__spectrum-strip">
        {PACKS.map((pack) => (
          <Link key={pack} href="/themes" className="site-landing__spectrum-cell" style={{ background: prismBrandPacks[pack].ground.light }}>
            <span className="site-landing__spectrum-dot" style={{ background: prismBrandPacks[pack].ink.light }} aria-hidden />
            <span className="site-landing__spectrum-name" style={{ color: prismBrandPacks[pack].ink.light }}>{PACK_LABELS[pack]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface SourceDoor {
  title: string;
  description: string;
  href: string;
  code: string;
  external?: boolean;
}

const SOURCE_DOORS: readonly SourceDoor[] = [
  { title: 'Rendered site', description: 'Live examples and copyable public usage for people.', href: '/docs/quickstart', code: 'this page' },
  { title: 'npm package', description: 'The same components, blocks, pages, provider, and tokens ship to applications.', href: 'https://www.npmjs.com/package/@nanisoft/prism-ui', code: '@nanisoft/prism-ui', external: true },
  { title: 'Agent corpus', description: 'llms.txt and Markdown mirrors project the checked docs source.', href: '/llms.txt', code: 'llms.txt' },
  { title: 'Read-only MCP', description: 'Agents query the owned catalog without adopting another UI runtime.', href: '/docs/quickstart#for-agents', code: 'prism /mcp' },
];

function SourceDoors(): ReactElement {
  return (
    <section className="site-landing__source" aria-labelledby="source-title">
      <div className="site-landing__section-copy">
        <h2 id="source-title">One checked source. Four useful doors.</h2>
        <p>The rendered product, npm package, generated corpus, and MCP are projections of the same catalog. There is no second list for agents to reverse-engineer.</p>
        <code className="site-landing__install">npm install @nanisoft/prism-ui</code>
      </div>
      <div className="site-landing__source-list">
        {SOURCE_DOORS.map((door) => {
          const content = (
            <>
              <span className="site-landing__source-heading"><strong>{door.title}</strong><code>{door.code}</code></span>
              <span className="site-landing__source-description">{door.description}</span>
              <PrismIcon name="arrow-right" size={15} />
            </>
          );
          return door.external ? (
            <a key={door.title} href={door.href} className="site-landing__source-door" rel="noreferrer">{content}</a>
          ) : (
            <Link key={door.title} href={door.href} className="site-landing__source-door">{content}</Link>
          );
        })}
      </div>
    </section>
  );
}

function ClosingStatement(): ReactElement {
  return (
    <section className="site-landing__close" aria-labelledby="close-title">
      <code className="site-landing__install">npm install @nanisoft/prism-ui</code>
      <h2 id="close-title">Build the product, not around it.</h2>
      <p>Prism gives people and agents the same owned vocabulary: accessible behavior, coherent recipes, complete compositions, and source that can be inspected.</p>
      <div className="site-landing__close-actions">
        <Button variant="primary" size="lg" href="/docs/quickstart">Start building</Button>
        <Button size="lg" href="/components">Browse the catalog</Button>
      </div>
    </section>
  );
}

function catalogWithLayers(): readonly (CatalogItem & { layer: 'components' | 'blocks' | 'pages' })[] {
  return (['components', 'blocks', 'pages'] as const).flatMap((layer) => (
    catalogGroups(layer).flatMap((group) => group.items).map((item) => ({ ...item, layer }))
  ));
}

function countLayer(catalog: readonly (CatalogItem & { layer: 'components' | 'blocks' | 'pages' })[], layer: 'components' | 'blocks' | 'pages'): number {
  return catalog.filter((item) => item.layer === layer).length;
}

export default function HomePage(): ReactElement {
  const catalog = catalogWithLayers();
  const componentCount = countLayer(catalog, 'components');
  const blockCount = countLayer(catalog, 'blocks');
  const pageCount = countLayer(catalog, 'pages');

  return (
    <div className="site-landing">
      <div className="site-shell">
        <section className="site-landing__hero" aria-labelledby="landing-title">
          <div className="site-landing__hero-copy">
            <DisplayTitle level={1} className="site-landing__title" id="landing-title">
              Components to finished pages.
            </DisplayTitle>
            <p className="site-landing__lede">NaniSoft&apos;s React design system turns accessible components into product blocks and complete pages, then gives people and agents the same inspectable source.</p>
            <div className="site-landing__cta">
              <Button variant="primary" size="lg" href="/docs/quickstart">Start building</Button>
              <Button size="lg" href="#catalog">Explore {catalog.length} items</Button>
            </div>
            <p className="site-landing__catalog-counts">{componentCount} components · {blockCount} blocks · {pageCount} pages</p>
          </div>
          <ProductWindowWall dashboard={<DashboardDemo />} settings={<SettingsDemo />} docs={<DocsDemo />} />
        </section>
      </div>

      <div className="site-shell">
        <section className="site-landing__catalog" id="catalog" aria-labelledby="catalog-title">
          <div className="site-landing__section-copy">
            <h2 id="catalog-title">Search all {catalog.length} checked items.</h2>
            <p>Every checked export is here, labeled by the layer it belongs to. Search components, blocks, and pages from the same 43-item source used by navigation, docs, the corpus, and MCP.</p>
          </div>
          <CatalogSearch catalog={catalog} />
        </section>
      </div>

      <div className="site-landing__seam" aria-hidden />
      <div className="site-shell"><SourceDoors /></div>
      <div className="site-shell"><SpectrumBand /></div>
      <div className="site-shell"><ClosingStatement /></div>
    </div>
  );
}
