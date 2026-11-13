import { AppChrome } from '@/components/app-chrome'
import { PRODUCTS } from '@/lib/store'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card'
import { Price } from '@nanisoft/prism-ui/components/price'
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
 * The shelf: every product, its price, its stock and its state. The Low and Out
 * states are what the morning page pulls to the top, and this is the list they
 * are pulled from.
 */
export default function ProductsRoute() {
  return (
    <AppChrome currentPath="/products" trail="Products">
      <PageHeader01
        headingLevel="h1"
        title="Products"
        description="The shelf, honestly: what is sold, what is held and what is on its way."
      />
      <Card>
        <CardHeader>
          <CardTitle>The shelf</CardTitle>
          <CardDescription>Two lines are below their floor and one is out, which is the morning's work.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-end">Price</TableHead>
                <TableHead className="text-end">Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRODUCTS.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Price {...product.price} />
                  </TableCell>
                  <TableCell className="text-end">{product.stock}</TableCell>
                  <TableCell>
                    <Status tone={product.status.tone} label={product.status.label} />
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
