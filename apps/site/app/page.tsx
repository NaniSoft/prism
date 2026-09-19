// The Specimen landing (ticket 11's direction) as a real prism-ui page: the
// hero *is* a live themed specimen plate — antd worn loudly, not repainted —
// the taxonomy reads as three spatial progression bands (01 components → 02
// blocks → 03 pages), and light mode appears exactly once as the "docs in
// daylight" peek. Every color rides the ambient theme's cssVar tokens, so the
// page re-expresses itself with the shell switcher.

import Link from 'next/link';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Button } from '@nanisoft/prism-ui/components/button';
import { Input } from '@nanisoft/prism-ui/components/input';
import { Progress } from '@nanisoft/prism-ui/components/progress';
import { Slider } from '@nanisoft/prism-ui/components/slider';
import { Statistic } from '@nanisoft/prism-ui/components/statistic';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Table, type TableProps } from '@nanisoft/prism-ui/components/table';
import { Tag } from '@nanisoft/prism-ui/components/tag';
import { PrismProvider } from '@nanisoft/prism-ui/provider';
import { getPrismTheme } from '@nanisoft/prism-tokens';
import { DisplayTitle, SearchOutlined } from '@/components/prism-client';

function Note({ children }: { children: ReactNode }): ReactElement {
  return <span className="site-landing__note">{children}</span>;
}

function PlateSection({ note, children }: { note: string; children: ReactNode }): ReactElement {
  return (
    <div className="site-landing__plate-section">
      <Note>{note}</Note>
      {children}
    </div>
  );
}

/** The hero image — the real library, themed, annotated in mono. */
function HeroSpecimen(): ReactElement {
  type Row = { key: string; part: string; acts: string };
  const rows: Row[] = [
    { key: '1', part: 'Button', acts: 'presses a command' },
    { key: '2', part: 'Input', acts: 'takes a value' },
    { key: '3', part: 'Table', acts: 'shows many rows' },
  ];
  const columns: TableProps<Row>['columns'] = [
    { title: 'Part', dataIndex: 'part', key: 'part' },
    { title: 'Acts', dataIndex: 'acts', key: 'acts' },
  ];

  return (
    <div className="site-landing__plate">
      <PlateSection note="<Button />">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary">Get started</Button>
          <Button>Components</Button>
          <Button type="dashed">Import</Button>
          <Button type="text">Docs</Button>
        </div>
      </PlateSection>
      <PlateSection note="<Input />">
        <Input placeholder="Search components…" prefix={<SearchOutlined />} />
      </PlateSection>
      <PlateSection note="<Switch /> <Slider />">
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Switch defaultChecked />
          <div style={{ flex: 1 }}>
            <Slider defaultValue={40} />
          </div>
        </div>
      </PlateSection>
      <PlateSection note="<Tag />">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="blue">v1.0</Tag>
          <Tag color="success">beam-dark</Tag>
          <Tag>MCP</Tag>
          <Tag closable>refract</Tag>
        </div>
      </PlateSection>
      <PlateSection note={'<Table size="small" />'}>
        <Table<Row> size="small" pagination={false} dataSource={rows} columns={columns} />
      </PlateSection>
    </div>
  );
}

/** Band 1 — raw parts, loose in the plane. */
function PartsCluster(): ReactElement {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button type="primary" size="small">
        primary
      </Button>
      <Button size="small">default</Button>
      <Button size="small" type="text">
        text
      </Button>
      <Tag>size</Tag>
      <Tag>type</Tag>
      <Tag>state</Tag>
    </div>
  );
}

/** Band 2 — parts pre-composed into one reusable unit. */
function StatBlock(): ReactElement {
  return (
    <div
      style={{
        border: '1px solid var(--prism-color-border-secondary)',
        borderRadius: 4,
        background: 'var(--prism-color-bg-container)',
        padding: '14px 18px',
        width: 260,
      }}
    >
      <Note>downloads / month</Note>
      <Statistic value={128} suffix="k" styles={{ content: { fontStretch: '112%', fontWeight: 600 } }} />
      <Progress percent={72} showInfo={false} size="small" />
      <Tag color="success" style={{ marginTop: 8 } as CSSProperties}>
        +12% vs last month
      </Tag>
    </div>
  );
}

/** Band 3 — the full-page composition, drawn as a hairline wire. */
function MiniPageWire(): ReactElement {
  const line = (width: string, height = 6): CSSProperties => ({
    width,
    height,
    background: 'var(--prism-color-border-secondary)',
    borderRadius: 2,
  });
  return (
    <div
      style={{
        border: '1px solid var(--prism-color-border-secondary)',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'var(--prism-color-bg-container)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          padding: '6px 10px',
          borderBottom: '1px solid var(--prism-color-border-secondary)',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--prism-color-primary)' }} />
        <div style={line('28px')} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <div style={line('22px')} />
          <div style={line('22px')} />
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 88 }}>
        <div
          style={{
            width: 56,
            borderRight: '1px solid var(--prism-color-border-secondary)',
            padding: 8,
            display: 'grid',
            gap: 6,
            alignContent: 'start',
          }}
        >
          <div style={line('40px')} />
          <div style={line('32px')} />
          <div style={line('36px')} />
        </div>
        <div style={{ flex: 1, padding: 10, display: 'grid', gap: 8, alignContent: 'start' }}>
          <div style={line('60%', 10)} />
          <div style={line('85%')} />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div style={{ height: 22, width: 64, borderRadius: 4, background: 'var(--prism-color-primary)' }} />
            <div
              style={{
                height: 22,
                width: 52,
                borderRadius: 4,
                border: '1px solid var(--prism-color-border-secondary)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Band({
  index,
  label,
  blurb,
  href,
  children,
}: {
  index: string;
  label: string;
  blurb: string;
  href: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="site-landing__band">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="site-landing__band-index">{index}</span>
        <Link href={href} className="site-landing__band-label" style={{ color: 'inherit' }}>
          {label}
        </Link>
      </div>
      <p className="site-landing__band-blurb">{blurb}</p>
      <div>{children}</div>
    </section>
  );
}

/** The one light-mode appearance on the page — a counterpoint, not a toggle. */
function DocsDaylight(): ReactElement {
  return (
    <PrismProvider prismTheme={getPrismTheme('blue', 'light')}>
      <div className="site-landing__daylight">
        <div className="site-shell">
          <Note>docs / components / button</Note>
          <div className="site-landing__daylight-card" style={{ maxWidth: 980, marginTop: 18 }}>
            <DisplayTitle level={3} style={{ margin: 0 }}>
              Button
            </DisplayTitle>
            <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.65, maxWidth: '58ch' }}>
              Every doc page ships as a live demo plus copyable source — the same components, the same
              theme object, that your app installs from npm.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="text">Text</Button>
              <Button type="link">Link</Button>
            </div>
            <div className="site-landing__daylight-code">
              {"import { Button } from '@nanisoft/prism-ui/components';"}
            </div>
            <div>
              <Button type="primary" href="/components/button">
                Open the Button doc
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PrismProvider>
  );
}

export default function HomePage(): ReactElement {
  return (
    <div className="site-landing">
      {/* Hero — the specimen plate is the thesis. */}
      <div className="site-shell">
        <section className="site-landing__hero">
          <div>
            <Note>ONE DESIGN LANGUAGE, MANY EXPRESSIONS</Note>
            <DisplayTitle level={1} className="site-landing__title">
              The beam is neutral.
              <br />
              Refraction is the brand.
            </DisplayTitle>
            <p className="site-landing__lede">
              Prism is NaniSoft&apos;s Ant Design–based design system — tokens, components, blocks, and
              pages, shipped as npm packages with docs and an agent surface. Everything on this plate is
              the real library, themed.
            </p>
            <div className="site-landing__cta">
              <Button type="primary" size="large" href="/docs">
                Get started
              </Button>
              <Button size="large" href="/components">
                Browse components
              </Button>
            </div>
          </div>
          <HeroSpecimen />
        </section>
      </div>

      <div className="site-landing__dither" aria-hidden />

      {/* Taxonomy as spatial progression: parts → pre-composed → full page. */}
      <div className="site-shell">
        <div className="site-landing__bands">
          <Band
            index="01"
            label="Components"
            href="/components"
            blurb="The antd surface, themed by Prism tokens, typed, and re-exported — apps never import antd directly."
          >
            <PartsCluster />
          </Band>
          <Band
            index="02"
            label="Blocks"
            href="/blocks"
            blurb="Pre-composed components — a stat card, a demo plate — assembled once, delivered from npm."
          >
            <StatBlock />
          </Band>
          <Band
            index="03"
            label="Pages"
            href="/pages"
            blurb="Full-page compositions — docs shells, blog layouts — that apps compose, never copy."
          >
            <MiniPageWire />
          </Band>
        </div>
      </div>

      <div className="site-landing__dither" aria-hidden />

      <DocsDaylight />

      <div className="site-shell">
        <section className="site-landing__outro">
          <h2>Start refracting.</h2>
          <p>
            Two brand packs, two modes, one language. Install the packages, wrap your app, and pick your
            expression.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button type="primary" size="large" href="/docs">
              Read the docs
            </Button>
            <Button size="large" type="text" href="/components">
              npm i @nanisoft/prism-ui
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
