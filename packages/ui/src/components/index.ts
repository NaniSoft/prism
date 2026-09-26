/**
 * Every Prism component, one export list.
 *
 * Consumers who want a single item import `@nanisoft/prism-ui/components/<name>`;
 * this barrel is the convenience entry for an app that uses most of the set.
 * Compound parts stay inside their parent module (ticket 07): `Card` ships its
 * header, title, description, content and footer here, and there is no
 * `components/card-header` subpath.
 */
export { Button } from './ui/button'
export { Badge } from './ui/badge'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card'
export { Section, SectionHeading } from './ui/section'
export type { HeadingLevel } from './ui/section'

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './ui/pagination'
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from './ui/field'
export { Input } from './ui/input'
export { Textarea } from './ui/textarea'
export { Alert, AlertTitle, AlertDescription } from './ui/alert'
export { Skeleton } from './ui/skeleton'
export { Separator } from './ui/separator'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './ui/table'
export { Heading, Text } from './ui/typography'
export type { HeadingElement } from './ui/typography'
export { Kbd } from './ui/kbd'
