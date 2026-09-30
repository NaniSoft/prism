import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'
import {
  ResourceList01,
  type ResourceList01Resource,
  type ResourceListColumn,
} from '@nanisoft/prism-ui/blocks/resource-list-01'

/** A fixed moment, so the preview reads the same on every visit. */
const UPDATED = '2026-08-14T09:00:00.000Z'

/** Five documents over three kinds, with and without a link and without a detail. */
const RESOURCES: ResourceList01Resource[] = [
  {
    id: 'token-contract',
    name: 'The emitted token contract',
    kind: 'CSS',
    detail: (
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-xs">41 KB</span>
        <RelativeTime date={UPDATED} dateStyle="medium" />
      </span>
    ),
    href: '/downloads/tokens.css',
    hrefLabel: 'Download the contract',
  },
  {
    id: 'pack-guide',
    name: 'Writing a pack',
    kind: 'Guide',
    detail: (
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-xs">18 pages</span>
        <RelativeTime date={UPDATED} dateStyle="medium" />
      </span>
    ),
    href: '/downloads/pack-guide.pdf',
    hrefLabel: 'Download the guide',
  },
  {
    id: 'contrast-report',
    name: 'The contrast report',
    kind: 'Guide',
    detail: (
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-xs">12 pages</span>
        <RelativeTime date={UPDATED} dateStyle="medium" />
      </span>
    ),
  },
  {
    id: 'fixtures',
    name: 'The token fixtures',
    kind: 'JSON',
    href: '/downloads/fixtures.json',
    hrefLabel: 'Download the fixtures',
  },
  {
    id: 'changelog',
    name: 'The full changelog',
    kind: 'Markdown',
  },
]

/** The four columns every instance shares, so the two readings differ only by grouping. */
const COLUMNS: ResourceListColumn[] = [
  { id: 'name', header: 'Document', className: 'w-2/5' },
  { id: 'kind', header: 'Format' },
  { id: 'detail', header: 'Size and last changed' },
  { id: 'href', header: 'Open' },
]

/** Both groupings of one set, so the row-group header is visible next to a flat body. */
export default function ResourceList01Demo() {
  return (
    <>
      <ResourceList01
        headingLevel="h3"
        eyebrow="Preview"
        title="Documents and downloads"
        description="Five documents over three kinds. Three of them carry a size and a last-changed reading, one has no reading at all, and two have no link."
        groupBy="kind"
        columns={COLUMNS}
        resources={RESOURCES}
      />

      <ResourceList01
        headingLevel="h3"
        title="The same set as one body"
        columns={COLUMNS}
        resources={RESOURCES}
      />
    </>
  )
}
