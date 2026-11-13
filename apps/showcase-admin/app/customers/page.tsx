import { AppChrome } from '@/components/app-chrome'
import { CUSTOMERS } from '@/lib/store'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Avatar, AvatarFallback } from '@nanisoft/prism-ui/components/avatar'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card'
import { Price } from '@nanisoft/prism-ui/components/price'
import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nanisoft/prism-ui/components/table'

/**
 * The people the shop sells to: spend, orders and how long they have been one of
 * the shop's own. The initials avatars are the same Component the console's top
 * bar uses, which is the point of a system: one drawing of a person.
 */
export default function CustomersRoute() {
  return (
    <AppChrome currentPath="/customers" trail="Customers">
      <PageHeader01
        headingLevel="h1"
        title="Customers"
        description="Everyone who has ordered this year, with the tier their year earned."
      />
      <Card>
        <CardHeader>
          <CardTitle>The book</CardTitle>
          <CardDescription>Spend to date, orders to date, and the day the first one arrived.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-end">Orders</TableHead>
                <TableHead className="text-end">Spend</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CUSTOMERS.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <Avatar className="size-8" aria-hidden>
                        <AvatarFallback>{customer.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </span>
                  </TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-end">{customer.orders}</TableCell>
                  <TableCell className="text-end">
                    <Price {...customer.spend} />
                  </TableCell>
                  <TableCell>
                    <RelativeTime date={customer.since} />
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
