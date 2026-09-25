import { BlogLayout } from '@nanisoft/prism-ui/pages/blog-layout';
import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card';
import { Heading, Text } from '@nanisoft/prism-ui/components/typography';
import { Separator } from '@nanisoft/prism-ui/components/separator';

const NAV = [
  { label: 'Catalog', url: '#catalog' },
  { label: 'Guides', url: '#guides' },
];

export default function BlogLayoutDemo() {
  return (
    <div role="group" aria-label="Synthetic NaniSoft editorial release page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <Badge variant="info">Synthetic NaniSoft editorial preview</Badge>
        <Text variant="tertiary">Application-owned content; this article is not published.</Text>
      </div>
      <BlogLayout
        frontmatter={{
          title: 'A release handoff agents can inspect',
          description: 'A small NaniSoft release note that keeps the checked catalog, its source, and the next handoff in one readable surface.',
          date: '2026-09-18',
          tags: ['Prism', 'Release planning'],
        }}
        header={<SiteHeader site="prism" nav={NAV} cta={<Button href="#catalog" variant="primary" size="sm">View catalog</Button>} modeSwitch={false} sticky={false} />}
        footer={(
          <SiteFooter
            site="prism"
            columns={[{ title: 'Prism', links: [{ label: 'Catalog', url: '#catalog' }, { label: 'Theme reference', url: '#themes' }] }]}
            legal={<span>Synthetic article preview | NaniSoft</span>}
          />
        )}
      >
        <div style={{ display: 'grid', gap: 24 }}>
          <Text variant="tertiary">Synthetic release note</Text>
          <Text>Prism gives a product team a shared vocabulary for the work between a component decision and a complete page. This example keeps the article structure owned by the application while the page supplies the reading frame.</Text>
          <Card>
            <CardHeader>
              <CardTitle level={2}>The handoff has a visible source</CardTitle>
              <CardDescription>Every layer can be inspected without treating documentation as a second product surface.</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <Text>Components describe one responsibility. Blocks arrange a repeated product pattern. Pages complete the application frame.</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Badge>Components</Badge>
                  <Badge>Blocks</Badge>
                  <Badge>Pages</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Heading level={2} size="md">Keep the handoff inspectable</Heading>
          <Text variant="secondary">Use the release language that belongs to your product, then let Prism provide the structural and visual grammar. The result can travel from a human review to an agent reading the same owned source.</Text>
          <Separator />
          <Heading level={2} size="md">A small release checklist</Heading>
          <ul style={{ display: 'grid', gap: 8, margin: 0, paddingLeft: 20 }}>
            <li>Name the workstream and the person or team that owns the next decision.</li>
            <li>Link the public export that makes the decision usable.</li>
            <li>Record the state of the handoff without turning preview data into a claim.</li>
          </ul>
          <div>
            <Button href="#release-notes" variant="secondary">Open release notes</Button>
          </div>
        </div>
      </BlogLayout>
    </div>
  );
}
