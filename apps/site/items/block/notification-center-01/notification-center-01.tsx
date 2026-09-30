'use client'

import { useState } from 'react'

import { Bell, ShieldAlert, UserRound } from 'lucide-react'
import {
  NotificationCenter01,
  type NotificationCenter01Notification,
} from '@nanisoft/prism-ui/blocks/notification-center-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { ListPanel } from '@nanisoft/prism-ui/components/list-panel'

/**
 * The set, with the three cases that make the Block's rules visible.
 *
 * The first is unread with an icon, a tone and a link, so the leading marks, the
 * urgency and the destination are all on one row. The second is read, so the heavier
 * title and the missing dot are visible side by side with the unread case rather than
 * described. The third has no body, which is a notification drawn with two lines of
 * annotation and is the case the optional field rule exists for.
 */
const INITIAL: NotificationCenter01Notification[] = [
  {
    id: 'key',
    title: 'A key was rotated',
    body: 'The production key was replaced, and the old one stops working at the end of the week.',
    at: '2026-09-30T08:14:00.000Z',
    icon: ShieldAlert,
    tone: 'warning',
    href: '/overview',
    hrefLabel: 'Review the key',
  },
  {
    id: 'invite',
    title: 'Cleo joined the workspace',
    at: '2026-09-29T16:02:00.000Z',
    icon: UserRound,
    read: true,
  },
  { id: 'sync', title: 'Nightly sync finished', at: '2026-09-30T04:02:00.000Z', icon: Bell },
]

/** The count, in the reader's own words. Three sentences are three different counts. */
function countLabel(count: number): string {
  if (count === 0) return 'Nothing unread'
  return `${count} unread`
}

export default function NotificationCenter01Demo() {
  const [items, setItems] = useState(INITIAL)
  const unread = items.filter((item) => item.read !== true).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          A page section. Activating a title marks that notification read, and the
          mark-all control does the whole set. The count is computed from the items and
          the words for it are passed in, so a product that said new instead of unread
          would say new.
        </p>
        <NotificationCenter01
          headingLevel="h3"
          title="Section heading"
          notifications={items}
          unreadLabel="Unread"
          countLabel={countLabel}
          onMarkRead={(id) =>
            setItems((all) => all.map((item) => (item.id === id ? { ...item, read: true } : item)))
          }
          onMarkAllRead={() => setItems((all) => all.map((item) => ({ ...item, read: true })))}
          markAllLabel="Mark all as read"
          empty="You are all caught up."
        />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          The same notifications in the panel shape, which is a bounded, scrollable
          `list-panel` with the count in its own count slot and no `Section` around it.
          A scrolling region is a tab stop, so it carries the caller&apos;s name.
        </p>
        <div className="w-96">
          <ListPanel scroll label="Notification centre demo" title="In a shell">
            <NotificationCenter01
              variant="panel"
              listLabel="Notifications"
              maxHeight={220}
              notifications={items}
              unreadLabel="Unread"
              countLabel={countLabel}
              empty="You are all caught up."
            />
          </ListPanel>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setItems(INITIAL)}
        >
          Put the unread ones back ({unread} unread)
        </Button>
      </div>
    </div>
  )
}
