// The landing page proves Prism's mechanism in the first viewport: one owned
// import, live behavior, and the components → blocks → pages composition model.

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { DisplayTitle } from '@nanisoft/prism-ui/components/typography';
import { StatCard } from '@nanisoft/prism-ui/blocks/stat-card';
import { prismBrandPacks } from '@nanisoft/prism-tokens';

import { DocsDaylight } from '@/components/DocsDaylight';
import { LandingSpecimen } from '@/components/LandingSpecimen';
import { catalogGroups } from '@/lib/section-catalog';
import { PACKS, PACK_LABELS } from '@/lib/theme';

function PartsCluster(): ReactElement {
  return (
    <div className="site-landing__parts" aria-label="Prism component examples">
      <Button variant="primary" size="sm" href="/components/button">Primary</Button>
      <Button size="sm" href="/components/input">Default</Button>
      <Button variant="ghost" size="sm" href="/components/dialog">Overlay</Button>
      <Badge>owned source</Badge>
    </div>
  );
}

function MiniPageWire(): ReactElement {
  const line = (width: string, height = 6): ReactElement => (
    <span
      aria-hidden
      style={{ width, height, background: 'var(--prism-border)', borderRadius: 2 }}
    />
  );
  return (
    <div className="site-landing__page-wire" aria-label="Page composition diagram">
      <div className="site-landing__page-wire-top"><span className="site-landing__page-mark" />{line('84px')}<span className="site-landing__page-actions">{line('42px')}{line('42px')}</span></div>
      <div className="site-landing__page-wire-body">
        <div className="site-landing__page-wire-nav">{line('72%')}{line('84%')}{line('64%')}{line('78%')}</div>
        <div className="site-landing__page-wire-content">{line('46%', 12)}{line('92%')}{line('76%')}<div>{line('92px', 28)}{line('92px', 28)}</div></div>
      </div>
    </div>
  );
}

function LayerSection({ title, description, href, children }: { title: string; description: string; href: string; children: ReactNode }) {
  return (
    <section className="site-landing__layer">
      <div className="site-landing__layer-copy"><Link href={href}>{title}</Link><p>{description}</p></div>
      <div className="site-landing__layer-proof">{children}</div>
    </section>
  );
}

function SpectrumBand(): ReactElement {
  return (
    <section className="site-landing__spectrum">
      <div className="site-landing__spectrum-head">
        <h2>Five pastels. Two modes. One language.</h2>
        <p>Every pack is a complete atmosphere: tinted grounds and hairlines with AA-safe mid-tone ink. Pick one in the header and feel the whole system re-express itself.</p>
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

function StartHere(): ReactElement {
  return (
    <section className="site-landing__start" aria-labelledby="start-here-title">
      <div className="site-landing__start-copy">
        <h2 id="start-here-title">One import for people and agents.</h2>
        <p>Install Prism, wrap the app once, and compose from the same public catalog that powers this site. The agent corpus and MCP are generated from that source.</p>
        <code className="site-landing__install">npm install @nanisoft/prism-ui</code>
      </div>
      <div className="site-landing__start-paths">
        <div><h3>Build an app</h3><p>Follow the quickstart, then open a live component and copy its source.</p><Button variant="primary" href="/docs/quickstart">Read the quickstart</Button></div>
        <div><h3>Give it to an agent</h3><p>Start with the complete corpus, then query the read-only Prism MCP.</p><div className="site-landing__agent-links"><Button href="/llms.txt">Read llms.txt</Button><Button href="/docs/quickstart#for-agents">MCP setup</Button></div></div>
      </div>
    </section>
  );
}

export default function HomePage(): ReactElement {
  const components = catalogGroups('components').flatMap((group) => group.items);
  const blockCount = catalogGroups('blocks').flatMap((group) => group.items).length;
  const pageCount = catalogGroups('pages').flatMap((group) => group.items).length;

  return (
    <div className="site-landing">
      <div className="site-shell">
        <section className="site-landing__hero">
          <div className="site-landing__hero-copy">
            <DisplayTitle level={1} className="site-landing__title">The interface is owned source.</DisplayTitle>
            <p className="site-landing__lede">Prism turns accessible Base UI behavior into a NaniSoft system you can read, compose, and ship from one package—without adopting somebody else&apos;s design language.</p>
            <div className="site-landing__cta"><Button variant="primary" size="lg" href="/docs/quickstart">Start building</Button><Button size="lg" href="/components">Explore the catalog</Button></div>
          </div>
          <LandingSpecimen catalog={components} />
        </section>
      </div>

      <div className="site-landing__dither" aria-hidden />

      <div className="site-shell">
        <div className="site-landing__layers">
          <LayerSection title={`Components · ${components.length}`} description="Prism-owned accessible controls and recipes. Behavior is complete; the public vocabulary stays small." href="/components"><PartsCluster /></LayerSection>
          <LayerSection title={`Blocks · ${blockCount}`} description="Repeated product patterns assembled once—from data tables and settings to application chrome." href="/blocks"><StatCard label="Catalog coverage" value="72%" change="+4 this release" trend="up" detail="Measured across the published component, block, and page surface." /></LayerSection>
          <LayerSection title={`Pages · ${pageCount}`} description="Complete structural compositions for docs, dashboards, settings, auth, and editorial work." href="/pages"><MiniPageWire /></LayerSection>
        </div>
      </div>

      <div className="site-shell"><StartHere /></div>
      <div className="site-landing__dither" aria-hidden />
      <div className="site-shell"><SpectrumBand /></div>
      <DocsDaylight />

      <div className="site-shell">
        <section className="site-landing__outro">
          <h2>Build the brand, not around it.</h2>
          <p>Prism gives agents and developers the same source of truth: accessible behavior, owned recipes, live examples, and a complete composition vocabulary.</p>
          <div><Button variant="primary" size="lg" href="/docs/quickstart">Install Prism</Button><Button size="lg" href="/themes">See all ten expressions</Button></div>
        </section>
      </div>
    </div>
  );
}
