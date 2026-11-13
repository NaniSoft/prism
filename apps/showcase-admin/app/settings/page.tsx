import { AppChrome } from '@/components/app-chrome'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'
import { Input } from '@nanisoft/prism-ui/components/input'
import { Label } from '@nanisoft/prism-ui/components/label'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'
import { Switch } from '@nanisoft/prism-ui/components/switch'

/**
 * The settings route: three regions composed from the field Components rather
 * than the settings Block, because the panel is a controlled surface whose
 * change handler is a function and this application has no script to hold one.
 * The fields are the same Components the specification drives, laid out by the
 * governed grid and stack, and every one of them holds its own state.
 */
export default function SettingsRoute() {
  return (
    <AppChrome currentPath="/settings" trail="Settings">
      <PageHeader01
        headingLevel="h1"
        title="Settings"
        description="The shop, the morning page and what reaches the operator."
      />
      <DSStack gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>The shop</CardTitle>
            <CardDescription>What a customer sees on the front door and the receipts.</CardDescription>
          </CardHeader>
          <CardContent>
            <DSGrid columns={2} gap="md">
              <DSStack gap="sm">
                <Label htmlFor="shop-name">Shop name</Label>
                <Input id="shop-name" defaultValue="Bloom and Barrel" />
              </DSStack>
              <DSStack gap="sm">
                <Label htmlFor="shop-support">Support email</Label>
                <Input
                  id="shop-support"
                  defaultValue="hello@bloomandbarrel.example"
                  aria-describedby="shop-support-help"
                />
                <p id="shop-support-help" className="text-muted-foreground text-sm">
                  Printed on every receipt and every dispatch note.
                </p>
              </DSStack>
              <DSStack gap="sm">
                <Label htmlFor="shop-region">Selling region</Label>
                <NativeSelect id="shop-region" defaultValue="uk">
                  <option value="uk">United Kingdom</option>
                  <option value="eu">Europe</option>
                  <option value="us">United States</option>
                </NativeSelect>
              </DSStack>
            </DSGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>The morning page</CardTitle>
            <CardDescription>What the overview carries, and what it leaves for the routes behind it.</CardDescription>
          </CardHeader>
          <CardContent>
            <DSStack gap="md">
              <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                <DSStack gap="xs">
                  <span>Exceptions first</span>
                  <span className="text-muted-foreground font-normal">
                    Held orders, lost parcels and low stock above the figures.
                  </span>
                </DSStack>
                <Switch defaultChecked />
              </Label>
              <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                Marketplace figures
                <Switch defaultChecked />
              </Label>
              <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                Courier performance
                <Switch />
              </Label>
              <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                Returns opened overnight
                <Switch defaultChecked />
              </Label>
            </DSStack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>What reaches the operator outside the console.</CardDescription>
          </CardHeader>
          <CardContent>
            <DSGrid columns={2} gap="md">
              <DSStack gap="sm">
                <Label htmlFor="digest-time">Digest time</Label>
                <NativeSelect id="digest-time" defaultValue="19">
                  <option value="17">Five in the afternoon</option>
                  <option value="19">Seven in the evening</option>
                  <option value="21">Nine in the evening</option>
                </NativeSelect>
              </DSStack>
              <DSStack gap="md">
                <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                  <DSStack gap="xs">
                    <span>The evening digest</span>
                    <span className="text-muted-foreground font-normal">The day in one email, at closing time.</span>
                  </DSStack>
                  <Switch defaultChecked />
                </Label>
                <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                  <DSStack gap="xs">
                    <span>Low stock alerts</span>
                    <span className="text-muted-foreground font-normal">
                      A line is at its floor when two days of sales would empty it.
                    </span>
                  </DSStack>
                  <Switch defaultChecked />
                </Label>
              </DSStack>
            </DSGrid>
          </CardContent>
        </Card>
      </DSStack>
    </AppChrome>
  )
}
