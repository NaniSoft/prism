'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nanisoft/prism-ui/components/tabs'

/** Tabs that switch between three peer views of one subject. */
export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="max-w-measure-narrow">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-muted-foreground pt-2 text-sm">
          Release 2.4 shipped three fixes and one new block, with no token
          changes.
        </p>
      </TabsContent>
      <TabsContent value="activity">
        <p className="text-muted-foreground pt-2 text-sm">
          Four deploys this week, all from the main branch.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-muted-foreground pt-2 text-sm">
          The workspace uses the Blush pack in light mode.
        </p>
      </TabsContent>
    </Tabs>
  )
}
