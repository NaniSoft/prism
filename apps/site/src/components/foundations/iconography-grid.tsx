import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Copy,
  Info,
  Menu,
  Moon,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  TriangleAlert,
  User,
  X,
  Zap,
} from 'lucide-react'

/**
 * The Iconography reader.
 *
 * Prism ships no icon set; interface icons come from Lucide. This grid renders
 * a representative set at the tile size, so the stroke weight and the optical
 * size are visible rather than described.
 */
const ICONS = [
  ['ArrowRight', ArrowRight],
  ['ChevronDown', ChevronDown],
  ['Check', Check],
  ['X', X],
  ['Plus', Plus],
  ['Trash2', Trash2],
  ['Search', Search],
  ['Settings', Settings],
  ['Menu', Menu],
  ['Bell', Bell],
  ['Info', Info],
  ['TriangleAlert', TriangleAlert],
  ['Copy', Copy],
  ['Palette', Palette],
  ['ShieldCheck', ShieldCheck],
  ['Zap', Zap],
  ['User', User],
  ['Sun', Sun],
  ['Moon', Moon],
] as const

export function IconographyGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ICONS.map(([name, Icon]) => (
        <div
          key={name}
          className="border-border bg-card flex items-center gap-3 rounded-lg border p-3"
        >
          <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </span>
          <code className="text-muted-foreground font-mono text-xs">{name}</code>
        </div>
      ))}
    </div>
  )
}
