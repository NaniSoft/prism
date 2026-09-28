import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { Button } from '@nanisoft/prism-ui/components/button'

/** A card with a header, a body and a footer action. */
export default function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Release 2.4</CardTitle>
        <CardDescription>Shipped to production on 12 August.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Three fixes and one new block, with no token changes.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          View changelog
        </Button>
      </CardFooter>
    </Card>
  )
}
