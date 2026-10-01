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
export { CtaLink } from './ui/cta-link'
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
export { LiveRegion } from './ui/live-region'
export type { LiveRegionProps, LivePoliteness } from './ui/live-region'
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
export { Timeline } from './ui/timeline'
export type { TimelineProps, TimelineEntry, TimelineState } from './ui/timeline'
export { Diff } from './ui/diff'
export type { DiffProps, DiffLine, DiffLineKind, DiffLabels } from './ui/diff'
export { Heading, Text } from './ui/typography'
export type { HeadingElement } from './ui/typography'
export { Kbd } from './ui/kbd'
export { Mark } from './ui/mark'
export type { MatchProps, MatchRange } from './ui/mark'
export { Tree } from './ui/tree'
export type { TreeProps, TreeNode, TreeNodePage, TreeNodeGroup, TreeNodeDivider } from './ui/tree'
export { Diagram } from './ui/diagram'
export type { DiagramProps, DiagramNode, DiagramRelation } from './ui/diagram'
export { PulseGraph } from './ui/pulse-graph'
export type { PulseGraphProps, PulseNode, PulseRelation } from './ui/pulse-graph'
export { PulseSeries } from './ui/pulse-series'
export type { PulseSeriesProps, PulseBar } from './ui/pulse-series'
export { SignalField } from './ui/signal-field'
export type { SignalFieldProps } from './ui/signal-field'
export { ProductMark } from './ui/product-mark'
export type { ProductMarkProps, ProductMarkSize } from './ui/product-mark'
export { Prose } from './ui/prose'
export type { ProseProps, ProseSize } from './ui/prose'
export { FactList } from './ui/fact-list'
export type { FactListProps, Fact } from './ui/fact-list'
export { ProductSwitcher } from './ui/product-switcher'
export type { ProductSwitcherProps, SwitcherProduct } from './ui/product-switcher'

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
export { Meter } from './ui/meter'
export type { MeterProps, MeterTone, MeterThreshold } from './ui/meter'
export { CommandPalette } from './ui/command-palette'
export type { CommandPaletteProps, CommandGroup, CommandItem } from './ui/command-palette'
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog'
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible'
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from './ui/context-menu'
export { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card'
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLinkItem,
  MenubarCheckboxItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarGroup,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './ui/menubar'
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIcon,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuPopup,
  NavigationMenuViewport,
  NavigationMenuBackdrop,
} from './ui/navigation-menu'
export { Resizable, ResizablePanel, ResizableHandle } from './ui/resizable'
export { Item } from './ui/item'
export { ChartFrame } from './ui/chart-frame'
export {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
} from './ui/sidebar'
export { ScrollArea } from './ui/scroll-area'
export { AspectRatio } from './ui/aspect-ratio'
export { Carousel } from './ui/carousel'
export { Toggle } from './ui/toggle'
export { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
export { Command } from './ui/command'
export { Spinner } from './ui/spinner'
export { Toast } from './ui/toast'
export { Combobox } from './ui/combobox'
export { Calendar } from './ui/calendar'
export { DatePicker } from './ui/date-picker'
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group'
export { NumberField } from './ui/number-field'
export { OneTimeCode } from './ui/one-time-code'
export { Label } from './ui/label'
export {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormLabel,
} from './ui/form'
export { NativeSelect } from './ui/native-select'
export { ButtonGroup } from './ui/button-group'
export { TableSort } from './ui/table-sort'
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './ui/sheet'
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

/*
 * The roster expansion of 2026-09. Twenty-three Components, and the reason each
 * is here is the one `docs/history/roster-expansion.md` records: each answers a
 * role no existing Component held, rather than a role an existing Component
 * already answered in a different spelling.
 *
 * `ModeToggle` is the only one that does not also reach the curated root barrel,
 * and the reason is that barrel's own header: importing it must not pull the
 * provider. A theme toggle is the one Component that writes the theme rather
 * than reading it, so it is the one that needs the provider, and a consumer who
 * wants the declarative path takes `PrismThemeScript` and their own button
 * instead.
 */
export { Metric } from './ui/metric'
export type { MetricProps, MetricDelta } from './ui/metric'
export { Status } from './ui/status'
export type { StatusTone } from './ui/status'
export { Price } from './ui/price'
export type { PriceProps } from './ui/price'
export { RelativeTime } from './ui/relative-time'
export type { RelativeTimeProps } from './ui/relative-time'
export { Sparkline } from './ui/sparkline'
export type { SparklineProps } from './ui/sparkline'
export { ContributionGraph } from './ui/contribution-graph'
export type { ContributionGraphProps, ContributionLevel } from './ui/contribution-graph'
export { Chart, ChartLegend } from './ui/chart'
export type { ChartProps, ChartData, ChartForm } from './ui/chart'
export { CodeBlock, Code } from './ui/code-block'
export type { CodeBlockProps } from './ui/code-block'
export { Lightbox } from './ui/lightbox'
export type { LightboxProps } from './ui/lightbox'
export { Steps } from './ui/steps'
export type { StepsProps, Step } from './ui/steps'
export { SearchField } from './ui/search-field'
export type { SearchFieldProps } from './ui/search-field'
export { PasswordField } from './ui/password-field'
export type { PasswordFieldProps } from './ui/password-field'
export { TagGroup, Tag } from './ui/tag-group'
export type { TagGroupProps, TagProps, TagGroupTag } from './ui/tag-group'
export { Dropzone } from './ui/dropzone'
export type { DropzoneProps } from './ui/dropzone'
export { FileUpload } from './ui/file-upload'
export type { FileUploadProps, FileUploadFile } from './ui/file-upload'
export { MiniCalendar } from './ui/mini-calendar'
export type { MiniCalendarProps } from './ui/mini-calendar'
export { ListPanel, ListPanelHeader, ListPanelBody, ListPanelFooter } from './ui/list-panel'
export type {
  ListPanelProps,
  ListPanelHeaderProps,
  ListPanelBodyProps,
  ListPanelFooterProps,
} from './ui/list-panel'
export { DataToolbar, DataToolbarGroup } from './ui/data-toolbar'
export type { DataToolbarProps, DataToolbarGroupProps } from './ui/data-toolbar'
export { FilterPanel, FilterPanelHeader, FilterPanelFooter } from './ui/filter-panel'
export type {
  FilterPanelProps,
  FilterPanelHeaderProps,
  FilterPanelFooterProps,
} from './ui/filter-panel'
export { AvatarGroup } from './ui/avatar-group'
export type { AvatarGroupProps } from './ui/avatar-group'
export { PackSwatch } from './ui/pack-swatch'
export type { PackSwatchProps } from './ui/pack-swatch'
export { Announcement } from './ui/announcement'
export type { AnnouncementProps, AnnouncementTone } from './ui/announcement'
export { ModeToggle } from './ui/mode-toggle'
export type { ModeToggleProps } from './ui/mode-toggle'

/*
 * The nine Components the 2026-09 component sweep added, grouped here by the job
 * rather than appended in the order they were written.
 *
 * Three of them are server Components that take a function prop, which is legal
 * and is argued in each module: `Metric` and `SearchField` set the precedent. Five
 * are client, and the directive on each is unconditional because each either holds
 * state or forwards a handler. `VideoPlayer` is a server Component that ships no
 * JavaScript at all, which is the reason it is worth reading before any consumer
 * reaches for a player engine.
 */
export { PackSwitcher } from './ui/pack-switcher'
export type { PackSwitcherProps, PackSwitcherPack } from './ui/pack-switcher'
export { Pill } from './ui/pill'
export type { PillProps, PillTone } from './ui/pill'
export { BillingSource, BillingSources } from './ui/billing-source'
export type { BillingSourceProps, BillingSourcesProps, BillingSourceItem } from './ui/billing-source'
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription, DrawerHandle, DrawerClose } from './ui/drawer'
export type { DrawerProps, DrawerTriggerProps, DrawerContentProps, DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps, DrawerTitleProps, DrawerDescriptionProps, DrawerHandleProps, DrawerCloseProps, DrawerSide } from './ui/drawer'
export { ImageZoom } from './ui/image-zoom'
export type { ImageZoomProps } from './ui/image-zoom'
export { VideoPlayer } from './ui/video-player'
export type { VideoPlayerProps, VideoPlayerTrack } from './ui/video-player'
export { EmojiPicker } from './ui/emoji-picker'
export type { EmojiPickerProps, EmojiPickerItem, EmojiPickerGroup, EmojiPickerSize } from './ui/emoji-picker'
export { RepoStars } from './ui/repo-stars'
export type { RepoStarsProps, RepoStarsSize } from './ui/repo-stars'
export { ChoiceCard } from './ui/choice-card'
export type { ChoiceCardProps, ChoiceCardOption, ChoiceCardColumns } from './ui/choice-card'

/* The three data-figure Components of the 2026-09 audit: a cell grid graded by a scale
 * the caller supplies, a share of one whole drawn as a bar, and a retention matrix read
 * as a table. All three are server Components, so a dashboard full of them costs no
 * client code, and all three refuse to draw a number a reader cannot read. */
export { IntensityGrid } from './ui/intensity-grid'
export type { IntensityGridProps, IntensityGridBand } from './ui/intensity-grid'
export { ProportionList } from './ui/proportion-list'
export type { ProportionListProps, ProportionListItem } from './ui/proportion-list'
export { CohortGrid } from './ui/cohort-grid'
export type { CohortGridProps, CohortGridRow, CohortGridColumn } from './ui/cohort-grid'

/*
 * The four Components the strict audit of 2026-09 kept, and the argument each one
 * survives on, which is the argument a later reader will otherwise optimise away.
 *
 * `multi-combobox` and `creatable-combobox` are two different state machines
 * around a list, not two configurations of one combobox: the first keeps the list
 * open because a set grows after every commit, the second adds an editable control
 * inside the popover whose row must stay out of the listbox. `range-field`
 * carries a TUPLE, so no single-value prop can express it. And
 * `platform-modifier-key` is the only one that resolves anything at runtime, which
 * is why it holds no glyph and no word of its own.
 */
export { MultiCombobox } from './ui/multi-combobox'
export type { MultiComboboxProps } from './ui/multi-combobox'
export { CreatableCombobox } from './ui/creatable-combobox'
export type { CreatableComboboxProps } from './ui/creatable-combobox'
export { RangeField } from './ui/range-field'
export type { RangeFieldProps, RangeValue, RangeBound } from './ui/range-field'
export { PlatformModifierKey } from './ui/platform-modifier-key'
export type { PlatformModifierKeyProps, PlatformModifierKeyName, PlatformModifier, PlatformChord } from './ui/platform-modifier-key'

/*
 * The last five Components the strict audit of 2026-09 kept, and the one thing
 * each is really about.
 *
 * Three of them are about focus after a change: `image-list-field` moves it to a
 * neighbouring remove button, `repeatable-rows` moves it into a new row and renumbers
 * the ones below, and `text-format-toolbar` takes it from an editor and gives it
 * back. A control that unmounts or rearranges without answering that question is
 * the defect all three exist to prevent, and it is invisible in a screenshot.
 *
 * `prompt-composer` and `lifecycle-button` are the two lifecycles. Both take their
 * state as a union the CALLER owns, so Prism draws a position on a line and never
 * infers one, and both refuse to own the work: there is no model client here and no
 * request, only the control surface over a state machine somebody else drives.
 */
export { ImageListField } from './ui/image-list-field'
export type { ImageListFieldProps, ImageListFieldImage } from './ui/image-list-field'
export { RepeatableRows } from './ui/repeatable-rows'
export type { RepeatableRowsProps, RepeatableRowInfo } from './ui/repeatable-rows'
export { TextFormatToolbar } from './ui/text-format-toolbar'
export type { TextFormatToolbarProps, TextFormatCommand } from './ui/text-format-toolbar'
export { PromptComposer } from './ui/prompt-composer'
export type { PromptComposerProps, PromptComposerState, PromptComposerPhase, PromptComposerAttachment } from './ui/prompt-composer'
export { LifecycleButton } from './ui/lifecycle-button'
export type { LifecycleButtonProps, LifecycleButtonState, LifecycleButtonPhase } from './ui/lifecycle-button'

/*
 * The last thirteen Components the strict audit of 2026-09 kept.
 *
 * Five of them exist because two Components DISAGREE and the disagreement is the
 * defect: `split-button` joins a trigger and a menu trigger into one shape, `stepper`
 * clamps two controls at one bound, `overflow-actions` moves actions into a menu when
 * the row runs out, `selection-toolbar` and `text-format-toolbar` take opposite
 * positions on whether focus may move, and `nested-tabs` orders two tab axes that look
 * identical. In each case a single-value prop cannot express the conflict, and the
 * honest fix is a Component that owns both halves rather than a boolean.
 *
 * Three are about where focus goes after something changes: `reorderable-list`,
 * `form-dialog` and `form-wizard`. Each answers a question a screenshot cannot show,
 * and each JSDoc says which destination it chose and what a reader loses because of
 * it.
 *
 * `stateful-table` is the one Component here that decides something about the
 * caller's data, and it is bounded to the order and only where the caller supplied
 * an accessor. `money-field` is the one that holds two kinds of value at once, a
 * number for the caller and a locale-formatted string for the reader, and the round
 * trip between them is the Component.
 */
export { ReorderableList } from './ui/reorderable-list'
export type { ReorderableListProps, ReorderableMove, ReorderableRowInfo } from './ui/reorderable-list'
export { Checklist } from './ui/checklist'
export type { ChecklistProps, ChecklistTask, ChecklistPriority } from './ui/checklist'
export { FormDialog } from './ui/form-dialog'
export type { FormDialogProps, FormDialogPhase, FormDialogIssue } from './ui/form-dialog'
export { FormWizard } from './ui/form-wizard'
export type { FormWizardProps, FormWizardStep, FormWizardIssue } from './ui/form-wizard'
export { StatefulTable } from './ui/stateful-table'
export type { StatefulTableProps, StatefulTableState, StatefulTableChange, StatefulTableColumnUnion, StatefulTableSortableColumn, StatefulTableColumn, StatefulTableSort, StatefulTableDirection } from './ui/stateful-table'
export { NestedTabs } from './ui/nested-tabs'
export type { NestedTabsProps, NestedTabSection, NestedTabPanel } from './ui/nested-tabs'
export { MegaMenu } from './ui/mega-menu'
export type { MegaMenuProps, MegaMenuGroup, MegaMenuPanel, MegaMenuColumn, MegaMenuLink } from './ui/mega-menu'
export { TaskProgress } from './ui/task-progress'
export type { TaskProgressProps, TaskProgressPhase } from './ui/task-progress'
export { SplitButton } from './ui/split-button'
export type { SplitButtonProps, SplitButtonAction } from './ui/split-button'
export { Stepper } from './ui/stepper'
export type { StepperProps } from './ui/stepper'
export { OverflowActions } from './ui/overflow-actions'
export type { OverflowActionsProps, OverflowAction } from './ui/overflow-actions'
export { SelectionToolbar } from './ui/selection-toolbar'
export type { SelectionToolbarProps, SelectionToolbarCommand } from './ui/selection-toolbar'
export { MoneyField } from './ui/money-field'
export type { MoneyFieldProps } from './ui/money-field'
