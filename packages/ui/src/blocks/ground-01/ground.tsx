import type { AuroraWashProps } from '../../components/ui/aurora-wash'
import { AuroraWash } from '../../components/ui/aurora-wash'
import { HeaderTransparency } from '../../components/ui/header-transparency'
import { TsparticlesField } from '../../components/ui/tsparticles-field'

import { cn } from '../../lib/utils'

/** The props a Ground01 takes. */
export type Ground01Props = {
  /**
   * Whether the ground is lit. The wash is the light: translucent planes in
   * the pack's own colours, each on its own long orbit of the aurora cycle.
   * Turn it off and the medium keeps the ground from going flat on its own.
   */
  wash?: boolean
  /**
   * Whether a medium moves through the ground. The field is a connected
   * network whose server-rendered floor is complete before any script runs,
   * so the figure is the same figure at rest and under reduced motion.
   */
  particles?: boolean
  /**
   * How present the light is, passed to the wash whole: `present` is the
   * figure a landing wears and `subtle` is the same figure one rung down the
   * veil ladder, for a surface a reader works at rather than reads across.
   */
  intensity?: AuroraWashProps['intensity']
  /**
   * Whether the page's bar is transparent over the first screen and turns to
   * glass once the reader scrolls. This arms the package's own scroll state;
   * the bar it reaches is the page's own `SiteNavbar`, and a page whose bar
   * should keep its opaque surface passes `false`.
   */
  transparentBar?: boolean
  /**
   * Layout only, exactly as on every Block. It lands on the fixed ground
   * layer itself, so it can size or place the ground; it cannot carry
   * content, because the ground is `aria-hidden` and takes no pointer.
   */
  className?: string
}

/**
 * The page's one continuous ground: light moving through it and a medium
 * crossing it, fixed behind every section so the whole page reads as one
 * surface rather than as a hero and a set of separate bands.
 *
 * **It is the assembly, published.** The ground was always made of published
 * parts: the `site-atmosphere` class and the bar's transparency are the
 * stylesheet's, the wash, the field and the scroll state are the package's own
 * Components. Before this Block each application assembled the three by hand
 * in its layout, and the assembly drifted: one app wore the ground on every
 * route and another on one page, one dimmed the wash with a wrapper opacity
 * and another ran it at full presence, and no two of them disagreed on purpose.
 * The Block is the composition itself, so the decision is made once and a
 * consumer makes it by choosing props.
 *
 * **Every translucent surface on the page names the same ladder.** The wash's
 * planes carry `veil` steps and the bar that turns to glass over the ground
 * carries the `veil-glass` step, so the figure below the headline and the
 * surface above it are priced by one scale. A scrim that dims a dialog and a
 * veil that stills a figure read the same eight rungs, which is what keeps
 * four translucent surfaces that mean the same thing from wearing four numbers.
 *
 * **Where it belongs.** At layout scope the whole site wears one ground, which
 * is the marketing answer; on a single page the ground arrives and leaves with
 * it. A console's working surface does not take this Block: a fixed field
 * behind an instrument panel is a distraction rather than a setting, so the
 * console composes an `AuroraWash` on its own `subtle` intensity inside the
 * column its reader works in and keeps the rail on a still ground.
 *
 * **The stacking contract is half the Block's and half the page's.** The
 * ground is fixed at `z-index: -1` over the body's background, and the page's
 * content column is what sits above it: the stylesheet holds that contract for
 * a `main` carrying the `site-main` slot, and a page that wears this ground
 * gives its main that slot. The ground renders `aria-hidden` because a medium
 * is not information, and it takes no pointer, because a reader never reaches
 * into a setting.
 */
export function Ground01({
  wash = true,
  particles = true,
  intensity = 'present',
  transparentBar = true,
  className,
}: Ground01Props) {
  return (
    <>
      <div aria-hidden className={cn('site-atmosphere', className)}>
        {wash ? <AuroraWash intensity={intensity} /> : null}
        {particles ? <TsparticlesField /> : null}
      </div>
      {transparentBar ? <HeaderTransparency /> : null}
    </>
  )
}

export default Ground01
