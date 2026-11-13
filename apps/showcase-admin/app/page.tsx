import { AppChrome } from '@/components/app-chrome'
import { BAR } from '@/lib/bar'
import { CHANNEL_SERIES, ORDERS, REVENUE_MONTHS, REVENUE_SERIES } from '@/lib/store'
import { ChartCard01 } from '@nanisoft/prism-ui/blocks/chart-card-01'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card'
import { Chart, ChartLegend } from '@nanisoft/prism-ui/components/chart'
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'
import { Price } from '@nanisoft/prism-ui/components/price'
import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'
import { Status } from '@nanisoft/prism-ui/components/status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nanisoft/prism-ui/components/table'

/**
 * The morning page: the figure row, the two charts it is made of, and the orders
 * that changed since yesterday. Every surface is a published Block or Component
 * and every number opens into the ledger this page is fed from.
 */
export default function OverviewRoute() {
  const recent = ORDERS.slice(0, 6)
  return (
    <AppChrome currentPath="/" trail="Overview">
      <DSStack gap="lg">
        <PageHeader01
          headingLevel="h1"
          title="Overview"
          description="The morning page: yesterday, checked, and the orders that still need a hand."
          actions={[
            { label: BAR.shopFront.label, href: BAR.shopFront.href, variant: 'outline' },
          ]}
        />

        <Stats01
          headingLevel="h2"
          eyebrow="November so far"
          title="The four numbers"
          stats={[
            {
              key: 'revenue',
              label: 'Revenue',
              value: '$48,120',
              delta: 6,
              deltaFormat: '6 per cent more than October',
              hint: 'Month to date',
              series: REVENUE_SERIES[0].values.map((value, index) => value + REVENUE_SERIES[1].values[index]),
              seriesLabel: 'Revenue by month, the shop and the marketplaces together',
            },
            {
              key: 'orders',
              label: 'Orders',
              value: '1,204',
              delta: 4,
              deltaFormat: '4 per cent more than October',
              hint: 'Month to date',
            },
            {
              key: 'average',
              label: 'Average order',
              value: '$39.97',
              delta: 2,
              hint: 'Month to date',
            },
            {
              key: 'late',
              label: 'Late dispatches',
              value: '14',
              delta: -8,
              deltaFormat: '8 fewer than October',
              hint: 'Against the courier promise',
            },
          ]}
        />

        <DSGrid columns={2} gap="md">
          <ChartCard01
            headingLevel="h2"
            title="Revenue"
            description="By month, the shop against the marketplaces, in thousands."
            figure={
              <Chart
                variant="area"
                label="Revenue by month, the shop and the marketplaces, in thousands of dollars"
                labels={REVENUE_MONTHS}
                series={REVENUE_SERIES.map((series) => ({ ...series, values: [...series.values] }))}
                legend={false}
              />
            }
            legend={
              <ChartLegend
                series={REVENUE_SERIES.map((series) => ({ ...series, values: [...series.values] }))}
              />
            }
            footer="Twelve months to November. The marketplaces hold their share and the shop carries the season."
          />
          <ChartCard01
            headingLevel="h2"
            title="Where the orders came from"
            description="Last month, by channel."
            figure={
              <Chart
                variant="bar"
                label="Orders last month, by channel"
                labels={['The shop', 'Marketplace A', 'Marketplace B', 'The till']}
                series={CHANNEL_SERIES.map((series) => ({ ...series, values: [...series.values] }))}
                legend={false}
              />
            }
            footer="The till is the smallest channel and the one the morning page checks first, because it is the only one nobody else reconciles."
          />
        </DSGrid>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The six that changed since yesterday evening.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-end">Items</TableHead>
                  <TableHead className="text-end">Total</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Status tone={order.status.tone} label={order.status.label} />
                    </TableCell>
                    <TableCell className="text-end">{order.items}</TableCell>
                    <TableCell className="text-end">
                      <Price {...order.total} />
                    </TableCell>
                    <TableCell>
                      <RelativeTime date={order.placed} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DSStack>
    </AppChrome>
  )
}
