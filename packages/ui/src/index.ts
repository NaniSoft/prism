/**
 * The curated Prism barrel.
 *
 * The most-used components, blocks and theming vocabulary in one import. It
 * carries no styles and no runtime side effects: importing this entry must not
 * pull the provider, the catalogue or a stylesheet. Consumers that want one
 * item import its own subpath instead.
 */
export { Button } from './components/ui/button'
export { Badge } from './components/ui/badge'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/ui/card'
export { Section, SectionHeading } from './components/ui/section'
export type { HeadingLevel } from './components/ui/section'
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert'
export { Separator } from './components/ui/separator'
export { Skeleton } from './components/ui/skeleton'
export { Input } from './components/ui/input'
export { Textarea } from './components/ui/textarea'
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from './components/ui/field'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './components/ui/table'
export { Heading, Text } from './components/ui/typography'
export type { HeadingElement } from './components/ui/typography'
export { Kbd } from './components/ui/kbd'
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb'
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './components/ui/pagination'

export { Hero01 } from './blocks/hero-01'
export { FeatureGrid01 } from './blocks/feature-grid-01'
export { Stats01 } from './blocks/stats-01'
export { Pricing01 } from './blocks/pricing-01'
export { Cta01 } from './blocks/cta-01'

export { PACKS, MODES, parseStoredTheme, themeAttributes } from './theming'
export type { PackId, Mode } from './theming'
