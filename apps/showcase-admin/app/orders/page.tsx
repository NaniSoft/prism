import { AppChrome } from '@/components/app-chrome'
import { ORDERS } from '@/lib/store'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card'
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
 * The ledger: every order this month, in one table. The table is the semantic
 * Table suite with the reading Components in its cells, which is the whole of a
 * driven index when the driving is the platform's and not this app's.
 */
export default function OrdersRoute() {
  return (
    <AppChrome currentPath="/orders" trail="Orders">
      <PageHeader01
        headingLevel="h1"
        title="Orders"
        description={`The month so far: ${ORDERS.length} in the working set, every figure below one of them.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>The ledger</CardTitle>
          <CardDescription>Newest first. A status a courier or a till set, not a word this app chose.</CardDescription>
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
              {ORDERS.map((order) => (
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
    </AppChrome>
  )
}
