import { PackSwatch } from '@nanisoft/prism-ui/components/pack-swatch'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/** The six authored packs, in the order the token build declares them. */
const PACKS = [
  { id: 'default', label: 'Default' },
  { id: 'blush', label: 'Blush' },
  { id: 'mint', label: 'Mint' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'sky', label: 'Sky' },
  { id: 'peach', label: 'Peach' },
] as const

/**
 * Every pack, and the radius difference the six are drawn to show.
 *
 * The second column is the one that is easy to miss: each swatch is fully
 * rounded, and a fully rounded disc is the one place a pack's own radius is
 * visible as itself, so a row of six shows six different corner radii under the
 * same page. A swatch drawn on a `rounded-lg` would show only the colour and
 * would be a pack whose shape never moves.
 */
export default function PackSwatchDemo() {
  return (
    <div className="flex max-w-page flex-col gap-8">
      <div className="flex flex-wrap items-center gap-6">
        {PACKS.map((pack) => (
          <div key={pack.id} className="flex items-center gap-2">
            <PackSwatch pack={pack.id} label={pack.label} />
            <span className="text-sm">{pack.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <PackSwatch pack="mint" label="Mint" size="sm" />
        <PackSwatch pack="mint" label="Mint" size="md" />
        <PackSwatch pack="mint" label="Mint" size="lg" />
        <PackSwatch pack="sky" label="Sky" showModes={false} />
        <PackSwatch pack="sky" label="Sky" size="lg" showModes={false} />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {PACKS.map((pack) => (
          <div key={pack.id} className="flex flex-col items-center gap-1.5">
            <PackSwatch pack={pack.id} label={pack.label} size="lg" />
            <Badge variant="outline">{pack.id}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
