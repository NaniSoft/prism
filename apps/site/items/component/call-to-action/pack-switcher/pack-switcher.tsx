'use client'

import { useState } from 'react'

import {
  PackSwitcher,
  type PackSwitcherPack,
} from '@nanisoft/prism-ui/components/pack-switcher'
import { PrismProvider, usePrismTheme } from '@nanisoft/prism-ui/provider'

/**
 * The six packs Prism ships, in the words this page uses for them.
 *
 * They are the Demo's own list and not a default the Component carries, which is
 * the point the documentation is making: a pack id has no display name in the
 * token source, so the words beside it are a consumer's decision. The descriptions
 * make the options tall enough to show the difference between choosing and
 * confirming; a header that only confirms the current pack passes none of them.
 */
const PACKS = [
  { id: 'default', name: 'Standard', description: 'Neutral, as shipped.' },
  { id: 'blush', name: 'Blush', description: 'Soft rose, generously rounded.' },
  { id: 'mint', name: 'Mint', description: 'Soft green, the calmest hue.' },
  { id: 'lavender', name: 'Lavender', description: 'Soft violet, the most saturated.' },
  { id: 'sky', name: 'Sky', description: 'Crisp blue, the smallest radius.' },
  { id: 'peach', name: 'Peach', description: 'Soft orange, the roundest corners.' },
] satisfies readonly PackSwitcherPack[]

/**
 * The wiring, which is the whole of what applying a pack costs.
 *
 * The provider holds the active pack and writes the two document attributes, so
 * `setPack` is the entire handler. A consumer whose pack is a per-tenant fact, or
 * one who wants the choice in a URL, passes their own function here instead, and
 * this Component is the same shape in all three cases. That is the reason the
 * Component does not own applying the pack.
 */
function Appearance() {
  const { pack, setPack } = usePrismTheme()

  return (
    <PackSwitcher
      packs={PACKS}
      activePack={pack}
      onChange={setPack}
      label="Appearance"
      className="grid max-w-measure-narrow grid-cols-1 gap-2 sm:grid-cols-2"
    />
  )
}

/**
 * A chooser over the caller's own list, inside the provider that applies the answer.
 *
 * The first row is wired to the provider, so pressing an option there re-inks the
 * whole page. That is what applying a pack costs, and a Demo that hid it would be
 * a screenshot rather than a live example. The mark inside each option is
 * generated from the same id as the selection, so the two cannot disagree about
 * which pack is active.
 *
 * The second row offers three of the six packs rather than all of them, which is
 * a caller's list and never a default, and it passes no descriptions and
 * `showModes={false}`, which is what a compact chooser in a site header looks like.
 * The cost of both omissions is visible: a reader choosing a pack from three names
 * has to leave the row to see what a pack looks like in the other mode.
 */
export default function PackSwitcherDemo() {
  const [pack, setPack] = useState<PackSwitcherPack['id']>('lavender')

  return (
    <PrismProvider>
      <div className="flex max-w-measure-narrow flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs">
            A settings row, with a sentence beside each pack
          </span>
          <Appearance />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs">
            A compact row over a caller&apos;s own subset of them
          </span>
          <PackSwitcher
            packs={PACKS.slice(1, 4)}
            activePack={pack}
            onChange={setPack}
            label="Accent"
            showModes={false}
          />
        </div>

        <p className="text-muted-foreground border-border text-sm border-t pt-4">
          The second row holds its own state rather than the provider&apos;s, and
          that is the shape a consumer gets when the pack is their own fact rather
          than the page&apos;s. It is still the same Component, and the handler is
          still three lines.
        </p>
      </div>
    </PrismProvider>
  )
}
