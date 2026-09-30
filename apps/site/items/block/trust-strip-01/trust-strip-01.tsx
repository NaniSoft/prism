import { TrustStrip01 } from '@nanisoft/prism-ui/blocks/trust-strip-01'
import { FileCheck, Gauge, LifeBuoy, Lock } from 'lucide-react'

/**
 * Four statements about the library, in the library's own favour.
 *
 * The words are the demo's, not the Block's, and they are chosen so that each one is
 * checkable by a reader rather than flattering: a trust strip whose claims cannot be
 * looked up is the exact thing the Block's own JSDoc refuses to ship.
 */
const ITEMS = [
  { icon: Lock, label: 'Read-only by default', detail: 'A token never leaves the package' },
  { icon: FileCheck, label: 'Every claim traceable', detail: 'To the run that made it' },
  { icon: Gauge, label: 'One stylesheet', detail: 'No runtime dependency' },
  { icon: LifeBuoy, label: 'Maintained in the open', detail: 'Issues and decisions are public' },
]

/** The centred band on the page ground, which is the usual state. */
function OnTheGround() {
  return (
    <TrustStrip01
      heading="What this library can commit to"
      items={ITEMS}
    />
  )
}

/** The same band on the muted surface, flush left, which is the other state. */
function OnTheMutedSurface() {
  return (
    <TrustStrip01
      align="left"
      tone="muted"
      items={ITEMS.map(({ icon, label }) => ({ icon, label }))}
    />
  )
}

export default function TrustStrip01Demo() {
  return (
    <div className="flex flex-col">
      <OnTheGround />
      <OnTheMutedSurface />
    </div>
  )
}