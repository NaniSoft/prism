/**
 * The curated Prism barrel.
 *
 * The most-used components, blocks and theming vocabulary in one import. It
 * carries no styles and no runtime side effects: importing this entry must not
 * pull the provider, the catalogue or a stylesheet. Consumers that want one
 * item import its own subpath instead.
 */
export { Button } from './components/ui/button'
export { CtaLink } from './components/ui/cta-link'
export type { CtaLinkProps } from './components/ui/cta-link'
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

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './components/ui/select'
export { Checkbox } from './components/ui/checkbox'
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
export { Switch } from './components/ui/switch'
export { Slider } from './components/ui/slider'
export { Progress } from './components/ui/progress'
export { Tooltip, TooltipTrigger, TooltipContent } from './components/ui/tooltip'
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/ui/accordion'
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './components/ui/dialog'
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
} from './components/ui/dropdown-menu'
export { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'
export { Diagram } from './components/ui/diagram'
export type { DiagramProps, DiagramNode, DiagramRelation } from './components/ui/diagram'
export { ProductMark } from './components/ui/product-mark'
export type { ProductMarkProps, ProductMarkSize } from './components/ui/product-mark'
export { Prose } from './components/ui/prose'
export type { ProseProps, ProseSize } from './components/ui/prose'
export { FactList } from './components/ui/fact-list'
export type { FactListProps, Fact } from './components/ui/fact-list'
export { ProductSwitcher } from './components/ui/product-switcher'
export type { ProductSwitcherProps, SwitcherProduct } from './components/ui/product-switcher'

/*
 * The roster expansion of 2026-09. The twenty-two here are every new Component
 * except `ModeToggle`, and the one exclusion is this file's own header rather
 * than a judgement: importing this entry must not pull the provider, and a
 * theme toggle is the one Component that writes the theme rather than reading
 * it. A consumer on the declarative path uses `PrismThemeScript` and their own
 * button; a consumer that wants this one imports it from
 * `@nanisoft/prism-ui/components/mode-toggle`.
 */
export { Metric } from './components/ui/metric'
export type { MetricProps, MetricDelta } from './components/ui/metric'
export { Status } from './components/ui/status'
export type { StatusTone } from './components/ui/status'
export { Price } from './components/ui/price'
export type { PriceProps } from './components/ui/price'
export { RelativeTime } from './components/ui/relative-time'
export type { RelativeTimeProps } from './components/ui/relative-time'
export { Sparkline } from './components/ui/sparkline'
export type { SparklineProps } from './components/ui/sparkline'
export { ContributionGraph } from './components/ui/contribution-graph'
export type { ContributionGraphProps, ContributionLevel } from './components/ui/contribution-graph'
export { Chart, ChartLegend } from './components/ui/chart'
export type { ChartProps, ChartData, ChartForm } from './components/ui/chart'
export { CodeBlock, Code } from './components/ui/code-block'
export type { CodeBlockProps } from './components/ui/code-block'
export { Lightbox } from './components/ui/lightbox'
export type { LightboxProps } from './components/ui/lightbox'
export { Steps } from './components/ui/steps'
export type { StepsProps, Step } from './components/ui/steps'
export { SearchField } from './components/ui/search-field'
export type { SearchFieldProps } from './components/ui/search-field'
export { PasswordField } from './components/ui/password-field'
export type { PasswordFieldProps } from './components/ui/password-field'
export { TagGroup, Tag } from './components/ui/tag-group'
export type { TagGroupProps, TagProps, TagGroupTag } from './components/ui/tag-group'
export { Dropzone } from './components/ui/dropzone'
export type { DropzoneProps } from './components/ui/dropzone'
export { FileUpload } from './components/ui/file-upload'
export type { FileUploadProps, FileUploadFile } from './components/ui/file-upload'
export { MiniCalendar } from './components/ui/mini-calendar'
export type { MiniCalendarProps } from './components/ui/mini-calendar'
export { ListPanel, ListPanelHeader, ListPanelBody, ListPanelFooter } from './components/ui/list-panel'
export type {
  ListPanelProps,
  ListPanelHeaderProps,
  ListPanelBodyProps,
  ListPanelFooterProps,
} from './components/ui/list-panel'
export { DataToolbar, DataToolbarGroup } from './components/ui/data-toolbar'
export type { DataToolbarProps, DataToolbarGroupProps } from './components/ui/data-toolbar'
export { FilterPanel, FilterPanelHeader, FilterPanelFooter } from './components/ui/filter-panel'
export type {
  FilterPanelProps,
  FilterPanelHeaderProps,
  FilterPanelFooterProps,
} from './components/ui/filter-panel'
export { AvatarGroup } from './components/ui/avatar-group'
export type { AvatarGroupProps } from './components/ui/avatar-group'
export { PackSwatch } from './components/ui/pack-swatch'
export type { PackSwatchProps } from './components/ui/pack-swatch'
export { Announcement } from './components/ui/announcement'
export type { AnnouncementProps, AnnouncementTone } from './components/ui/announcement'

export { Hero01 } from './blocks/hero-01'
export { FeatureGrid01 } from './blocks/feature-grid-01'
export { Stats01 } from './blocks/stats-01'
export { Pricing01 } from './blocks/pricing-01'
export { Cta01 } from './blocks/cta-01'
export { PageHeader01 } from './blocks/page-header-01'
export { DataTable01 } from './blocks/data-table-01'
export { SettingsPanel01 } from './blocks/settings-panel-01'
export { AuthForm01 } from './blocks/auth-form-01'
export { AppShell01 } from './blocks/app-shell-01'
export { ProcessRail01 } from './blocks/process-rail-01'
export { StatusLedger01, STATUS_TIERS } from './blocks/status-ledger-01'
export type { StatusTier } from './blocks/status-ledger-01'
export { RunConsole01 } from './blocks/run-console-01'
export type { RunConsole01Props, RunConsole01Copy } from './blocks/run-console-01'
export { ProductGrid01 } from './blocks/product-grid-01'
export { StackGrid01 } from './blocks/stack-grid-01'
export { LogoStrip01 } from './blocks/logo-strip-01'
export { NoteGrid01 } from './blocks/note-grid-01'
export { InstrumentPanel01 } from './blocks/instrument-panel-01'
export { SiteHeader } from './blocks/site-header'
export { SiteFooter } from './blocks/site-footer'

export { MarketingPage } from './pages/marketing-page'
export { DashboardPage } from './pages/dashboard-page'
export { SettingsPage } from './pages/settings-page'
export { AuthPage } from './pages/auth-page'
export { NotFoundPage } from './pages/not-found-page'
export { BlogPostPage } from './pages/blog-post-page'

export { PACKS, MODES, parseStoredTheme, themeAttributes } from './theming'
export type { PackId, Mode } from './theming'
