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
export { CardIndex01 } from './blocks/card-index-01'
export { RecordGrid01 } from './blocks/record-grid-01'
export { RecordForm01 } from './blocks/record-form-01'
export type { RecordForm01Props, RecordForm01Issue } from './blocks/record-form-01'
export { RecordDetail01 } from './blocks/record-detail-01'
export type {
  RecordDetail01Props,
  RecordDetail01Field,
  RecordDetail01Relation,
  RecordDetail01RelationEmpty,
} from './blocks/record-detail-01'
export { RecordWizard01 } from './blocks/record-wizard-01'
export type { RecordWizard01Props } from './blocks/record-wizard-01'
export { IndexDetail01 } from './blocks/index-detail-01'
export type { IndexDetail01Props } from './blocks/index-detail-01'
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

/* The nine Components of the 2026-09 component sweep, re-exported from the package
 * root so `@nanisoft/prism-ui` and `@nanisoft/prism-ui/components` agree on what
 * the package publishes. One list, two doors. */
export { PackSwitcher } from './components/ui/pack-switcher'
export type { PackSwitcherProps, PackSwitcherPack } from './components/ui/pack-switcher'
export { Pill } from './components/ui/pill'
export type { PillProps, PillTone } from './components/ui/pill'
export { BillingSource, BillingSources } from './components/ui/billing-source'
export type { BillingSourceProps, BillingSourcesProps, BillingSourceItem } from './components/ui/billing-source'
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription, DrawerHandle, DrawerClose } from './components/ui/drawer'
export type { DrawerProps, DrawerTriggerProps, DrawerContentProps, DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps, DrawerTitleProps, DrawerDescriptionProps, DrawerHandleProps, DrawerCloseProps, DrawerSide } from './components/ui/drawer'
export { ImageZoom } from './components/ui/image-zoom'
export type { ImageZoomProps } from './components/ui/image-zoom'
export { VideoPlayer } from './components/ui/video-player'
export type { VideoPlayerProps, VideoPlayerTrack } from './components/ui/video-player'
export { EmojiPicker } from './components/ui/emoji-picker'
export type { EmojiPickerProps, EmojiPickerItem, EmojiPickerGroup, EmojiPickerSize } from './components/ui/emoji-picker'
export { RepoStars } from './components/ui/repo-stars'
export type { RepoStarsProps, RepoStarsSize } from './components/ui/repo-stars'
export { ChoiceCard } from './components/ui/choice-card'
export type { ChoiceCardProps, ChoiceCardOption, ChoiceCardColumns } from './components/ui/choice-card'

/* The three data-figure Components, re-exported from the package root. */
export { IntensityGrid } from './components/ui/intensity-grid'
export type { IntensityGridProps, IntensityGridBand } from './components/ui/intensity-grid'
export { ProportionList } from './components/ui/proportion-list'
export type { ProportionListProps, ProportionListItem } from './components/ui/proportion-list'
export { CohortGrid } from './components/ui/cohort-grid'
export type { CohortGridProps, CohortGridRow, CohortGridColumn } from './components/ui/cohort-grid'

/* The four Components the strict audit kept, re-exported from the package root. */
export { MultiCombobox } from './components/ui/multi-combobox'
export type { MultiComboboxProps } from './components/ui/multi-combobox'
export { CreatableCombobox } from './components/ui/creatable-combobox'
export type { CreatableComboboxProps } from './components/ui/creatable-combobox'
export { RangeField } from './components/ui/range-field'
export type { RangeFieldProps, RangeValue, RangeBound } from './components/ui/range-field'
export { PlatformModifierKey } from './components/ui/platform-modifier-key'
export type { PlatformModifierKeyProps, PlatformModifierKeyName, PlatformModifier, PlatformChord } from './components/ui/platform-modifier-key'

/* The last five Components the strict audit kept, re-exported from the package root. */
export { ImageListField } from './components/ui/image-list-field'
export type { ImageListFieldProps, ImageListFieldImage } from './components/ui/image-list-field'
export { RepeatableRows } from './components/ui/repeatable-rows'
export type { RepeatableRowsProps, RepeatableRowInfo } from './components/ui/repeatable-rows'
export { TextFormatToolbar } from './components/ui/text-format-toolbar'
export type { TextFormatToolbarProps, TextFormatCommand } from './components/ui/text-format-toolbar'
export { PromptComposer } from './components/ui/prompt-composer'
export type { PromptComposerProps, PromptComposerState, PromptComposerPhase, PromptComposerAttachment } from './components/ui/prompt-composer'
export { LifecycleButton } from './components/ui/lifecycle-button'
export type { LifecycleButtonProps, LifecycleButtonState, LifecycleButtonPhase } from './components/ui/lifecycle-button'

/* The last thirteen Components the strict audit kept, re-exported from the root. */
export { ReorderableList } from './components/ui/reorderable-list'
export type { ReorderableListProps, ReorderableMove, ReorderableRowInfo } from './components/ui/reorderable-list'
export { Checklist } from './components/ui/checklist'
export type { ChecklistProps, ChecklistTask, ChecklistPriority } from './components/ui/checklist'
export { FormDialog } from './components/ui/form-dialog'
export type { FormDialogProps, FormDialogPhase, FormDialogIssue } from './components/ui/form-dialog'
export { FormWizard } from './components/ui/form-wizard'
export type { FormWizardProps, FormWizardStep, FormWizardIssue } from './components/ui/form-wizard'
export { StatefulTable } from './components/ui/stateful-table'
export type { StatefulTableProps, StatefulTableState, StatefulTableChange, StatefulTableColumnUnion, StatefulTableSortableColumn, StatefulTableColumn, StatefulTableSort, StatefulTableDirection } from './components/ui/stateful-table'
export { NestedTabs } from './components/ui/nested-tabs'
export type { NestedTabsProps, NestedTabSection, NestedTabPanel } from './components/ui/nested-tabs'
export { MegaMenu } from './components/ui/mega-menu'
export type { MegaMenuProps, MegaMenuGroup, MegaMenuPanel, MegaMenuColumn, MegaMenuLink } from './components/ui/mega-menu'
export { TaskProgress } from './components/ui/task-progress'
export type { TaskProgressProps, TaskProgressPhase } from './components/ui/task-progress'
export { SplitButton } from './components/ui/split-button'
export type { SplitButtonProps, SplitButtonAction } from './components/ui/split-button'
export { Stepper } from './components/ui/stepper'
export type { StepperProps } from './components/ui/stepper'
export { OverflowActions } from './components/ui/overflow-actions'
export type { OverflowActionsProps, OverflowAction } from './components/ui/overflow-actions'
export { SelectionToolbar } from './components/ui/selection-toolbar'
export type { SelectionToolbarProps, SelectionToolbarCommand } from './components/ui/selection-toolbar'
export { MoneyField } from './components/ui/money-field'
export type { MoneyFieldProps } from './components/ui/money-field'
