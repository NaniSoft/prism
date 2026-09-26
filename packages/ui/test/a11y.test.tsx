import { render } from '@testing-library/react'
import axe from 'axe-core'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../src/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '../src/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../src/components/ui/avatar'
import { Badge } from '../src/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../src/components/ui/breadcrumb'
import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card'
import { Checkbox } from '../src/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/components/ui/dropdown-menu'
import { Field, FieldDescription, FieldLabel } from '../src/components/ui/field'
import { Input } from '../src/components/ui/input'
import { Kbd } from '../src/components/ui/kbd'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '../src/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/ui/popover'
import { Progress } from '../src/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '../src/components/ui/radio-group'
import { Section, SectionHeading } from '../src/components/ui/section'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/ui/select'
import { Separator } from '../src/components/ui/separator'
import { Skeleton } from '../src/components/ui/skeleton'
import { Slider } from '../src/components/ui/slider'
import { Switch } from '../src/components/ui/switch'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../src/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs'
import { Textarea } from '../src/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '../src/components/ui/tooltip'
import { Heading, Text } from '../src/components/ui/typography'

/**
 * What this suite covers, stated so the claim is not overstated.
 *
 * axe-core in jsdom reliably catches missing accessible names, invalid ARIA,
 * broken roles, duplicate ids and missing form labels. It does NOT catch tab
 * order, keyboard traps, focus-visible visibility, screen-reader announcement
 * quality, reduced-motion handling, or the operation of a composite widget. It
 * cannot run the `color-contrast` rule at all here, because jsdom computes no
 * layout or paint; that rule runs in the report-only Playwright job in a real
 * browser. Roughly one third of real accessibility defects are in scope. The
 * keyboard and focus assertions in the component suites cover part of the rest.
 */
async function expectNoViolations(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  })
  const summary = results.violations.map(
    (violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`,
  )
  expect(summary).toEqual([])
}

const cases: Array<[string, ReactElement]> = [
  ['Button', <Button>Save changes</Button>],
  ['Badge', <Badge>New</Badge>],
  [
    'Card',
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>1,204 requests</CardContent>
    </Card>,
  ],
  [
    'Section',
    <Section>
      <SectionHeading title="Features" />
    </Section>,
  ],
  [
    'Breadcrumb',
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  ],
  [
    'Pagination',
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="/page/1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  ],
  [
    'Field',
    <Field>
      <FieldLabel htmlFor="a11y-email">Email</FieldLabel>
      <Input id="a11y-email" aria-describedby="a11y-email-help" />
      <FieldDescription id="a11y-email-help">We never share it.</FieldDescription>
    </Field>,
  ],
  ['Input', <Input aria-label="Search" />],
  ['Textarea', <Textarea aria-label="Notes" />],
  [
    'Alert',
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Your session expires soon.</AlertDescription>
    </Alert>,
  ],
  ['Skeleton', <Skeleton />],
  ['Separator', <Separator decorative={false} />],
  [
    'Table',
    <Table>
      <TableCaption>Users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  ],
  ['Typography', <Heading as="h2">Title</Heading>],
  ['Text', <Text>Supporting copy</Text>],
  ['Kbd', <Kbd>Ctrl</Kbd>],
  [
    'Select',
    <Select items={{ a: 'Apple' }}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Apple</SelectItem>
      </SelectContent>
    </Select>,
  ],
  ['Checkbox', <Checkbox aria-label="Accept terms" />],
  [
    'RadioGroup',
    <RadioGroup aria-label="Plan">
      <RadioGroupItem value="basic" aria-label="Basic" />
      <RadioGroupItem value="pro" aria-label="Pro" />
    </RadioGroup>,
  ],
  ['Switch', <Switch aria-label="Notifications" />],
  ['Slider', <Slider aria-label="Volume" />],
  ['Progress', <Progress value={40} aria-label="Upload" />],
  [
    'Tooltip',
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>,
  ],
  [
    'Accordion',
    <Accordion>
      <AccordionItem value="q1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  ],
  [
    'Dialog',
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Change your preferences.</DialogDescription>
      </DialogContent>
    </Dialog>,
  ],
  [
    'DropdownMenu',
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ],
  [
    'Popover',
    <Popover>
      <PopoverTrigger>Filters</PopoverTrigger>
      <PopoverContent>Body</PopoverContent>
    </Popover>,
  ],
  [
    'Tabs',
    <Tabs defaultValue="one">
      <TabsList aria-label="Sections">
        <TabsTrigger value="one">One</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
    </Tabs>,
  ],
  [
    'Avatar',
    <Avatar>
      <AvatarImage src="/ada.png" alt="Ada Lovelace" />
      <AvatarFallback>AD</AvatarFallback>
    </Avatar>,
  ],
]

describe('axe accessibility scan', () => {
  it.each(cases)('%s renders without axe violations', async (_name, ui) => {
    await expectNoViolations(ui)
  })
})
