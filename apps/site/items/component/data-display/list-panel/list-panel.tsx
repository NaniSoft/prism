import { ListPanel } from '@nanisoft/prism-ui/components/list-panel'
import { Item, type ItemEntry } from '@nanisoft/prism-ui/components/item'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/**
 * A long enough list to overflow the panel, which is the only way to see what the
 * panel is for.
 *
 * The rows are the caller's own `ul` and the caller's own `Item`s, so what this
 * Demo shows is a composition rather than a prop: the panel draws the frame, the
 * title and the scroll, and the list is written here because the shape of the
 * list is a fact about the data.
 */
const COLLECTORS: ItemEntry[] = Array.from({ length: 14 }, (_, index) => ({
  id: `collector-${index + 1}`,
  media: <span className="text-xs font-medium">{String(index + 1).padStart(2, '0')}</span>,
  title: `Collector ${String(index + 1).padStart(2, '0')}`,
  description: ['alpha', 'bravo', 'charlie', 'delta'][index % 4],
  meta: `${index * 3 + 4}s`,
  href: `/collectors/${index + 1}`,
}))

/** A short list, which is the case that does not need the panel to scroll. */
const REGIONS: ItemEntry[] = (
  ['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-south-1'] as const
).map((region, index) => ({
  id: region,
  title: region,
  description: `${index + 1} collectors reporting`,
  meta: index === 0 ? 'healthy' : 'idle',
}))

/** The bounded panel, and the one whose list fits. */
export default function ListPanelDemo() {
  return (
    <div className="flex max-w-page flex-col gap-8">
      <ListPanel
        title="Collectors"
        description="Every collector this account can see"
        count={`${COLLECTORS.length} of 40`}
        label="Collectors"
        maxHeight={288}
        actions={
          <Button size="sm" variant="outline">
            Add
          </Button>
        }
        footer={
          <>
            <Button size="sm" variant="ghost">
              Show all 40
            </Button>
            <span className="text-muted-foreground ms-auto text-xs">Updated a minute ago</span>
          </>
        }
      >
        <ul aria-label="Collectors" className="divide-border divide-y">
          {COLLECTORS.map((entry) => (
            <li key={entry.id}>
              <Item entry={entry} />
            </li>
          ))}
        </ul>
      </ListPanel>

      <ListPanel
        title="Regions"
        scroll={false}
        label="Regions"
        count={<Badge variant="secondary">4</Badge>}
      >
        <ul aria-label="Regions" className="divide-border divide-y">
          {REGIONS.map((entry) => (
            <li key={entry.id}>
              <Item entry={entry} />
            </li>
          ))}
        </ul>
      </ListPanel>
    </div>
  )
}
