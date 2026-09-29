'use client'

import {
  BarChart3,
  CreditCard,
  Folder,
  Home,
  LayoutGrid,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'
import {
  Sidebar,
  SidebarFooter,
  SidebarItem,
  SidebarNav,
  SidebarToggle,
} from '@nanisoft/prism-ui/components/sidebar'

/**
 * A rail with the states a reader actually meets: the current item, an item that
 * acts rather than navigates, a count, and the collapsed rail.
 *
 * The current item is chosen from outside the rail, which is the honest shape.
 * `current` is the caller's judgement about where the reader is, and a Component
 * that watched for clicks to decide it would be a Component making a claim about
 * the caller's router. So the rail's items are links and the switch beside it says
 * which page the reader is on.
 */
const DESTINATIONS: { label: string; href: string; icon: LucideIcon; count?: string }[] = [
  { label: 'Overview', href: '/overview', icon: Home },
  { label: 'Projects', href: '/projects', icon: Folder, count: '12' },
  { label: 'Usage', href: '/usage', icon: BarChart3, count: '3' },
  { label: 'Team', href: '/team', icon: Users, count: '8' },
  { label: 'Billing', href: '/billing', icon: CreditCard },
]

export default function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false)
  const [here, setHere] = useState('/overview')
  const [created, setCreated] = useState(false)

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex overflow-hidden rounded-lg border">
        {/*
         * Controlled rather than uncontrolled, because a real product keeps this
         * across a reload: a rail that forgets it on every page load teaches a
         * reader that collapsing it was a mistake.
         */}
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
          <ProductMark id="demo" name="NaniSoft" />

          <SidebarNav label="Sections">
            {DESTINATIONS.map((destination) => {
              const Icon = destination.icon
              return (
                <SidebarItem
                  key={destination.href}
                  label={destination.label}
                  href={destination.href}
                  icon={<Icon />}
                  current={here === destination.href}
                >
                  {destination.count}
                </SidebarItem>
              )
            })}

            {/*
             * An item that acts rather than navigates, so it renders a real
             * button and the handler is a prop. An anchor with no `href` is not a
             * link, a keyboard cannot reach it, and a button with nothing
             * attached to it is a control a reader can press with no result.
             */}
            <SidebarItem
              label="New project"
              icon={<LayoutGrid />}
              onClick={() => setCreated(true)}
            />
          </SidebarNav>

          <SidebarFooter>
            <SidebarItem
              label="Settings"
              href="/settings"
              icon={<Settings />}
              current={here === '/settings'}
            />
            <SidebarToggle collapseLabel="Collapse sidebar" expandLabel="Expand sidebar" />
          </SidebarFooter>
        </Sidebar>

        <div className="min-w-0 flex-1 p-5">
          <p className="text-muted-foreground text-sm">
            The reader is on <span className="text-foreground">{here}</span>. Collapsing
            the rail changes its width and its padding, and nothing else: the hover
            surface, the focus ring, the rail down the current item and every name
            are the same at both widths.
          </p>

          {created ? (
            <p className="mt-3 text-sm">
              A new project would open here. The item above is a real button
              because it acts rather than navigates, and the button takes the
              handler rather than shipping a control that does nothing.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {DESTINATIONS.map((destination) => (
              <Button
                key={destination.href}
                size="sm"
                variant={here === destination.href ? 'default' : 'outline'}
                onClick={() => setHere(destination.href)}
              >
                {destination.label}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => setHere('/settings')}>
              Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? 'Expand the rail' : 'Collapse the rail'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
