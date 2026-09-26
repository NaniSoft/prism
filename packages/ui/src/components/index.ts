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

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './ui/select'
export type { SelectProps, SelectTriggerProps, SelectValueProps } from './ui/select'
export { Checkbox } from './ui/checkbox'
export type { CheckboxProps } from './ui/checkbox'
export { RadioGroup, RadioGroupItem } from './ui/radio-group'
export type { RadioGroupProps, RadioGroupItemProps } from './ui/radio-group'
export { Switch } from './ui/switch'
export type { SwitchProps } from './ui/switch'
export { Slider } from './ui/slider'
export type { SliderProps } from './ui/slider'
export { Progress } from './ui/progress'
export type { ProgressProps } from './ui/progress'
export { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps } from './ui/tooltip'
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion'
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './ui/accordion'
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog'
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
} from './ui/dialog'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu'
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorProps,
  DropdownMenuGroupProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
} from './ui/dropdown-menu'
export { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
export type { PopoverProps, PopoverTriggerProps, PopoverContentProps } from './ui/popover'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './ui/tabs'
export { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './ui/avatar'
