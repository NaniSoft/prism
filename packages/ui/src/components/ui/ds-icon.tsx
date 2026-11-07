import {
  ArrowRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Ellipsis,
  GripVertical,
  ImagePlus,
  LayoutGrid,
  ListFilter,
  Menu,
  Moon,
  Paperclip,
  Plus,
  RefreshCw,
  Scan,
  Search,
  Send,
  Settings,
  Sun,
  TriangleAlert,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
  ArrowLeft,
} from 'lucide-react'
import type { ComponentProps, ElementType } from 'react'
import { cn } from '../../lib/utils'

/**
 * The registry this package publishes, as kebab-case names.
 *
 * A consumer never imports `lucide-react` and never styles an SVG file: the name
 * is the only way to reach a glyph, and the size is the only way to size it. The
 * set is curated rather than exhaustive: every chrome glyph the catalogue
 * already needs, plus `settings` (the Mission's example). A glyph a consumer
 * needs that is not here arrives upstream as a name, not as a file they import.
 */
const REGISTRY: Record<string, ElementType> = {
  'settings': Settings,
  search: Search,
  menu: Menu,
  x: X,
  check: Check,
  minus: Minus,
  plus: Plus,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevrons-up-down': ChevronsUpDown,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-up-down': ArrowUpDown,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  moon: Moon,
  sun: Sun,
  'layout-grid': LayoutGrid,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
  scan: Scan,
  eye: Eye,
  'eye-off': EyeOff,
  upload: Upload,
  'image-plus': ImagePlus,
  'grip-vertical': GripVertical,
  ellipsis: Ellipsis,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'triangle-alert': TriangleAlert,
  'circle-help': CircleHelp,
  'refresh-cw': RefreshCw,
  paperclip: Paperclip,
  send: Send,
  'list-filter': ListFilter,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
}

export type DSIconName = keyof typeof REGISTRY
export type DSIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<DSIconSize, string> = {
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
}

/** The props the DSIcon accepts. */
export interface DSIconProps extends Omit<ComponentProps<'svg'>, 'name'> {
  /** The registered glyph. Unknown names throw, because a missing glyph must not render as nothing. */
  name: DSIconName
  /**
   * The drawn size. @defaultValue 'md'
   *
   * Five steps on the spacing scale (14, 16, 20, 24, 32px). The `lg` step is 24px
   * and `xl` is 32px, so the largest UI icon the system draws is below the 48px
   * presentation ceiling the registry allows.
   */
  size?: DSIconSize
  /**
   * The name a reader hears for this glyph.
   *
   * Pass it when the glyph carries meaning a reader cannot get from the words
   * beside it; omit it for a decorative glyph beside which the words already
   * say it. A meaningful icon with no name is a picture a reader pays to decode.
   */
  label?: string
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A UI glyph from the governed registry, in the ink of its surroundings.
 *
 * **A name, not a file.** A consumer imports one name and gets one glyph: no
 * `lucide-react` import, no SVG file opened, no fill or stroke set by the
 * caller. The stroke is `currentColor` through Lucide's default, so a pack
 * boundary above it repaints it the way a token class does. The `currentColor`
 * rule is what the SVG security gate holds for UI icons; a brand logo keeps its
 * own fixed colour under a written exemption instead.
 *
 * **The name is closed.** A name outside `REGISTRY` throws from this Component
 * the way `Gallery01` throws on an `href` it refuses: a glyph that renders as
 * nothing is a control that says nothing. A new glyph is a token added upstream
 * with a file in this record, so the bundle a consumer pays for is the curated
 * set rather than Lucide's thousand.
 *
 * **Size is a step and not a number.** Five steps bound the glyph to the
 * spacing scale, so an icon a caller sizes at 21px is a size nobody authored.
 *
 * It is a server Component. It holds no state and reads nothing, so a page of
 * chrome costs no JavaScript from this module.
 */
function DSIcon({ name, size = 'md', label, className, ...props }: DSIconProps) {
  const Icon = REGISTRY[name]
  if (Icon === undefined) {
    throw new Error(
      `DSIcon: "${String(name)}" is not in the registry, so it would render as nothing. ` +
        'Request the glyph upstream as a name; do not import an SVG file of your own.',
    )
  }
  const meaningful = label !== undefined && label.trim() !== ''
  return (
    <Icon
      data-slot="ds-icon"
      data-icon={name}
      aria-hidden={meaningful ? undefined : 'true'}
      role={meaningful ? 'img' : undefined}
      aria-label={meaningful ? label : undefined}
      className={cn(SIZE_CLASS[size], 'shrink-0', className)}
      {...props}
    />
  )
}

export { DSIcon }
