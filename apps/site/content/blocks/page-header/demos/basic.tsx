import { PageHeader } from '@nanisoft/prism-ui/blocks/page-header';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Breadcrumb, BreadcrumbCurrent, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@nanisoft/prism-ui/components/breadcrumb';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function PageHeaderDemo() {
  return (
    <div role="group" aria-label="Synthetic NaniSoft release page header" style={{ display: 'grid', gap: 12 }}>
      <Badge variant="info">Synthetic NaniSoft release header</Badge>
      <PageHeader
        title="Catalog release"
        description="Coordinate the checked Prism catalog from the first workstream to the final handoff."
        level={1}
        breadcrumb={(
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbCurrent>Catalog release</BreadcrumbCurrent></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        actions={(
          <>
            <Button href="#release-queue" variant="primary">Review queue</Button>
            <Button href="#release-notes" variant="secondary">Open notes</Button>
          </>
        )}
      />
      <Text variant="tertiary">Synthetic release context; navigation and actions are application-owned.</Text>
    </div>
  );
}
