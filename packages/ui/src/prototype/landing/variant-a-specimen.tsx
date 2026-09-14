/**
 * PROTOTYPE (map ticket 11) — Variant A: "Specimen".
 * Stance: dark-first, antd foundation worn loudly — a live themed specimen
 * plate IS the hero image. Taxonomy told as three spatial progression bands.
 */
import { SearchOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Input, Progress, Slider, Statistic, Switch, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { CSSProperties, ReactElement } from 'react';

import { DitherDivider, MiniPageWire, MonoNote } from './bits.js';
import { spectralAntdTheme, spectralPrimitives } from './theme.js';

const NOTE = 'rgba(147, 178, 255, 0.66)';

function plateSection(note: string, children: ReactElement): ReactElement {
  return (
    <div>
      <MonoNote color={NOTE} style={{ marginBottom: 8 }}>
        {note}
      </MonoNote>
      {children}
    </div>
  );
}

function HeroSpecimen(): ReactElement {
  const p = spectralPrimitives('blue', 'beam-dark');

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
    <div
      style={{
        border: `1px solid ${p.hairline}`,
        borderRadius: 6,
        background: p.surface,
        boxShadow: p.floatingShadow,
        padding: '20px 22px',
        display: 'grid',
        gap: 16,
      }}
    >
      {plateSection(
        '<Button />',
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary">Get started</Button>
          <Button>Components</Button>
          <Button type="dashed">Import</Button>
          <Button type="text">Docs</Button>
        </div>,
      )}
      {plateSection('<Input />', <Input placeholder="Search components…" prefix={<SearchOutlined />} />)}
      {plateSection(
        '<Switch /> <Slider />',
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Switch defaultChecked />
          <div style={{ flex: 1 }}>
            <Slider defaultValue={40} />
          </div>
        </div>,
      )}
      {plateSection(
        '<Tag />',
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="blue">v1.0</Tag>
          <Tag color="success">beam-dark</Tag>
          <Tag>MCP</Tag>
          <Tag closable>refract</Tag>
        </div>,
      )}
      {plateSection(
        '<Table size="small" />',
        <Table<Row> size="small" pagination={false} dataSource={rows} columns={columns} />,
      )}
    </div>
  );
}

/** Band 1 of the strip — raw parts, loose in the plane. */
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
  const p = spectralPrimitives('blue', 'beam-dark');
  const card: CSSProperties = {
    border: `1px solid ${p.hairline}`,
    borderRadius: 6,
    background: p.surface,
    padding: '14px 18px',
    width: 260,
  };
  return (
    <div style={card}>
      <MonoNote color={NOTE} style={{ marginBottom: 4 }}>
        downloads / month
      </MonoNote>
      <Statistic value={128} suffix="k" styles={{ content: { fontStretch: '112%', fontWeight: 600 } }} />
      <Progress percent={72} showInfo={false} size="small" />
      <Tag color="success" style={{ marginTop: 8 }}>
        +12% vs last month
      </Tag>
    </div>
  );
}

function Band({
  index,
  label,
  blurb,
  children,
}: {
  index: string;
  label: string;
  blurb: string;
  children: ReactElement;
}): ReactElement {
  const p = spectralPrimitives('blue', 'beam-dark');
  return (
    <div style={{ flex: 1, minWidth: 260, display: 'grid', gap: 14, alignContent: 'start' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
            fontSize: 12,
            color: p.ink,
          }}
        >
          {index}
        </span>
        <span style={{ fontStretch: '118%', fontWeight: 600, fontSize: 18 }}>{label}</span>
      </div>
      <p style={{ margin: 0, color: p.text, opacity: 0.78, fontSize: 13, lineHeight: 1.6 }}>{blurb}</p>
      <div>{children}</div>
    </div>
  );
}

/** The light-mode peek — nested ConfigProvider flips to blue light. */
function DocsDaylight(): ReactElement {
  const lp = spectralPrimitives('blue', 'light');
  return (
    <ConfigProvider theme={spectralAntdTheme('blue', 'light')}>
      <div style={{ background: lp.ground, padding: '72px 6vw' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 18 }}>
          <MonoNote color="rgba(37, 99, 235, 0.75)">docs / components / button</MonoNote>
          <div
            style={{
              border: `1px solid ${lp.hairline}`,
              borderRadius: 6,
              background: lp.surface,
              boxShadow: lp.floatingShadow,
              padding: '28px 32px',
              display: 'grid',
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0, fontStretch: '114%', fontWeight: 600, fontSize: 26 }}>Button</h3>
            <p style={{ margin: 0, color: lp.text, opacity: 0.8, lineHeight: 1.65, maxWidth: '58ch' }}>
              Every doc page ships as a live demo plus copyable source — the same components, the
              same theme object, that your app installs from npm.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="text">Text</Button>
              <Button type="link">Link</Button>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
                fontSize: 12,
                color: lp.text,
                background: lp.ground,
                border: `1px solid ${lp.hairline}`,
                borderRadius: 4,
                padding: '10px 14px',
              }}
            >
              {'import { Button } from \'@nanisoft/prism-ui/components\';'}
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export function VariantASpecimen(): ReactElement {
  const p = spectralPrimitives('blue', 'beam-dark');
  const shell = (max = 1180): CSSProperties => ({ maxWidth: max, margin: '0 auto', padding: '0 6vw' });

  return (
    <ConfigProvider theme={spectralAntdTheme('blue', 'beam-dark')}>
      <div style={{ minHeight: '100vh', background: p.ground, color: p.text }}>
        <header style={{ borderBottom: `1px solid ${p.hairline}` }}>
          <div style={{ ...shell(), display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
            <span style={{ fontStretch: '125%', fontWeight: 700, fontSize: 18 }}>Prism</span>
            <MonoNote color={NOTE}>NANISOFT · DESIGN SYSTEM</MonoNote>
            <nav style={{ marginLeft: 'auto', display: 'flex', gap: 20, fontSize: 13, opacity: 0.85 }}>
              <a style={{ color: p.text }}>Docs</a>
              <a style={{ color: p.text }}>Components</a>
              <a style={{ color: p.text }}>Blog</a>
            </nav>
          </div>
        </header>

        {/* Hero — the specimen plate is the thesis: real antd, themed, annotated. */}
        <section style={{ ...shell(), display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56, alignItems: 'center', padding: '88px 6vw 96px' }}>
          <div style={{ display: 'grid', gap: 22 }}>
            <MonoNote color={NOTE}>ONE DESIGN LANGUAGE, MANY EXPRESSIONS</MonoNote>
            <h1 style={{ margin: 0, fontSize: 52, lineHeight: 1.06, fontStretch: '122%', fontWeight: 600, letterSpacing: '-0.015em' }}>
              The beam is neutral.
              <br />
              <span style={{ color: p.ink }}>Refraction</span> is the brand.
            </h1>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, opacity: 0.82, maxWidth: '46ch' }}>
              Prism is NaniSoft&apos;s Ant Design–based design system — tokens, components, blocks,
              and pages, shipped as npm packages with docs and an agent surface. Everything you see
              on this plate is the real library, themed.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <Button type="primary" size="large">
                Get started
              </Button>
              <Button size="large">Browse components</Button>
            </div>
          </div>
          <HeroSpecimen />
        </section>

        <DitherDivider ink={p.ink} from={p.ground} />

        {/* Taxonomy as spatial progression: parts → pre-composed → full page. */}
        <section style={{ ...shell(), padding: '64px 6vw 88px', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <Band
            index="01"
            label="Components"
            blurb="The antd surface, themed by Prism tokens, typed, and re-exported — apps never import antd directly."
          >
            <PartsCluster />
          </Band>
          <Band
            index="02"
            label="Blocks"
            blurb="Pre-composed components — a stat card, a filter bar — assembled once, delivered from npm."
          >
            <StatBlock />
          </Band>
          <Band
            index="03"
            label="Pages"
            blurb="Full-page compositions — docs shells, blog layouts — that apps compose, never copy."
          >
            <MiniPageWire p={p} />
          </Band>
        </section>

        <DitherDivider ink={p.ink} from={p.ground} height={110} />

        <DocsDaylight />

        <section style={{ background: p.ground, padding: '88px 6vw', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 36, fontStretch: '118%', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Start refracting.
          </h2>
          <p style={{ margin: '14px auto 28px', opacity: 0.75, maxWidth: '44ch', lineHeight: 1.7 }}>
            Two brand packs, two modes, one language. Install the packages, wrap your app, and pick
            your expression.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button type="primary" size="large">
              Read the docs
            </Button>
            <Button size="large" type="text">
              npm i @nanisoft/prism-ui
            </Button>
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${p.hairline}` }}>
          <div style={{ ...shell(), display: 'flex', gap: 16, alignItems: 'center', height: 64, fontSize: 12 }}>
            <MonoNote color={NOTE} style={{ opacity: 1 }}>© 2026 NaniSoft · MIT</MonoNote>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-jetbrains), ui-monospace, monospace', fontSize: 12, opacity: 0.8 }}>
              prism.nanisoft.com
            </span>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
