import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { DocsShell } from '@nanisoft/prism-ui/pages/docs-shell';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card';
import { Text } from '@nanisoft/prism-ui/components/typography';

const NAV = [
  {
    id: 'components',
    title: 'Components',
    url: '',
    children: [
      { id: 'button', title: 'Button', url: '#button' },
      { id: 'input', title: 'Input', url: '#input' },
      { id: 'table', title: 'Table', url: '#table' },
    ],
  },
  {
    id: 'blocks',
    title: 'Blocks',
    url: '',
    children: [
      { id: 'application-shell', title: 'ApplicationShell', url: '#application-shell' },
      { id: 'data-table', title: 'DataTable', url: '#data-table' },
    ],
  },
  {
    id: 'pages',
    title: 'Pages',
    url: '',
    children: [
      { id: 'dashboard-page', title: 'DashboardPage', url: '#dashboard-page' },
      { id: 'docs-shell', title: 'DocsShell', url: '#docs-shell' },
    ],
  },
];

const TOC = [
  { id: 'purpose', title: 'Purpose', url: '#purpose' },
  { id: 'composition', title: 'Composition path', url: '#composition' },
  { id: 'source', title: 'Source contract', url: '#source' },
];

export default function DocsShellDemo() {
  return (
    <DocsShell
      title="Compose an application page"
      description="Build a finished NaniSoft interface by composing Prism components into blocks, then blocks into a page."
      header={(
        <SiteHeader
          site="prism"
          nav={[{ label: 'Catalog', url: '#catalog' }, { label: 'Guides', url: '#guides' }]}
          cta={<Button href="#composition" variant="primary" size="sm">Read composition</Button>}
          modeSwitch={false}
        />
      )}
      footer={(
        <SiteFooter
          site="prism"
          columns={[{ title: 'Prism', links: [{ label: 'Catalog', url: '#catalog' }, { label: 'Theme reference', url: '#themes' }] }]}
          legal={<span>Synthetic documentation preview · © NaniSoft</span>}
        />
      )}
      nav={NAV}
      toc={TOC}
      neighbours={{ previous: { title: 'Blocks', url: '#blocks' }, next: { title: 'Pages', url: '#pages' } }}
    >
      <Badge variant="info">Synthetic navigation and content preview</Badge>
      <h2 id="purpose">Start with the smallest layer that owns the job</h2>
      <p>Components own one interaction or visual responsibility. Blocks assemble repeated product structure. Pages complete the application frame while the consuming app continues to own data, routing, and business language.</p>
      <h2 id="composition">Composition path</h2>
      <Card>
        <CardHeader><CardTitle level={2}>From control to product surface</CardTitle></CardHeader>
        <CardContent>
          <ol>
            <li><strong>Component:</strong> compose accessible controls and feedback.</li>
            <li><strong>Block:</strong> arrange controls into a reusable product pattern.</li>
            <li><strong>Page:</strong> combine blocks into a complete, routed surface.</li>
          </ol>
        </CardContent>
      </Card>
      <h2 id="source">Keep the source contract visible</h2>
      <Text variant="secondary">The exported source remains application-owned data. This preview does not fetch, publish, or modify the Prism package.</Text>
      <Button href="#source-api" variant="secondary">Continue to source API</Button>
    </DocsShell>
  );
}
